package org.example.chat.handler;  // 定义类所在的包

import org.springframework.web.socket.TextMessage;  // 导入TextMessage类
import org.springframework.web.socket.CloseStatus;  // 导入CloseStatus类，用于处理连接关闭状态
import org.springframework.web.socket.WebSocketSession;  // 导入WebSocketSession类
import org.springframework.web.socket.handler.TextWebSocketHandler;  // 导入TextWebSocketHandler类

import org.example.chat.model.User;  // 导入自定义的User实体类，映射数据库中的用户表
import org.example.chat.repository.UserRepository;  // 导入自定义的UserRepository接口，用于与数据库进行交互操作
import org.springframework.beans.factory.annotation.Autowired;  // 导入@Autowired注解，用于依赖注入

import java.util.*;
import java.util.Map;  // 导入Map接口
import java.util.List;  // 导入List接口
import java.util.Objects;  // 导入Objects类
import java.util.HashMap;  // 导入HashMap类，用于存储会话和账号的映射
import org.json.JSONObject; // 将字符串解析为JSON对象

import org.springframework.stereotype.Component;  // 导入@Component注解，标记为Spring组件

@Component  // 标记该类为Spring组件
public class YourWebSocketHandler extends TextWebSocketHandler {  // 继承TextWebSocketHandler类

    @Autowired  // 自动注入UserRepository实例
    private UserRepository userRepository;  // 声明UserRepository类型的成员变量，用于数据库操作

    private static final String DELIMITER = "[b1565ef8ea49b3b3959db8c5487229ea]";  // 定义分隔符常量
    private static final Map<WebSocketSession, String> sessions = new HashMap<>();  // 存储会话和账号的映射
    private static final Map<String, WebSocketSession> userSessions = new HashMap<>();  // 存储账号和会话的映射

    Map<String, StringBuilder> messageChunks = new HashMap<>(); // 存储未完成的消息块，键为消息ID，值为StringBuilder
    Map<String, Timer> timers = new HashMap<>(); // 存储每个消息ID的定时器任务

    @Override
    public void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {  // 处理收到的文本消息
        String payload = message.getPayload();  // 获取消息的内容
        //System.out.println("收到的消息负载：" + payload);  // 输出消息内容
        JSONObject json = new JSONObject(payload);  // 将字符串解析为JSON对象
        String type = json.getString("type");  // 获取消息类型
        if (type.equals("chunk")) {
            String messageId = json.getString("messageId");  // 获取消息ID
            String chunkData = json.getString("chunkData");  // 获取块数据
            boolean isLastChunk = json.getBoolean("isLastChunk");  // 是否为最后一个块
            // 获取或创建对应消息ID的StringBuilder
            StringBuilder messageBuilder = messageChunks.getOrDefault(messageId, new StringBuilder());
            messageBuilder.append(chunkData);  // 追加块数据
            messageChunks.put(messageId, messageBuilder);  // 更新Map
            // 如果这是第一个块，启动定时器
            if (!timers.containsKey(messageId)) {
                Timer timer = new Timer();
                timer.schedule(new TimerTask() {
                    @Override
                    public void run() {
                        // 超时处理：移除未完成的消息
                        messageChunks.remove(messageId);
                        timers.remove(messageId);
                    }
                }, 30000);  // 设置超时时间，例如30秒
                timers.put(messageId, timer);  // 保存定时器
            }
            if (isLastChunk) {
                // 收到最后一个块，组装完整消息
                String fullMessage = messageBuilder.toString();
                // 处理完整消息
                process(fullMessage,session);
                // 清理数据和定时器
                messageChunks.remove(messageId);
                Timer timer = timers.remove(messageId);
                if (timer != null) {
                    timer.cancel();
                }
            }
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {  // 处理连接关闭的逻辑
        System.out.println("Connection closed: " + status);  // 打印连接关闭状态

        // 可以在这里添加清理操作，例如注销账号或更新状态
        String account = sessions.remove(session);  // 移除会话与账号的映射
        WebSocketSession userSession = userSessions.remove(account);  // 移除账号与会话的映射
        if (account != null) {
            System.out.println("Account logged out: " + account);  // 打印账号登出信息
            User user = userRepository.findByAccount(account);  // 查找用户
            user.setIsonline(0);  // 设置用户在线状态为0
            userRepository.save(user);  // 保存用户状态到数据库
        }
    }

    public void sendMessage(WebSocketSession session, String message) throws Exception{
        System.out.println("待发送信息：" + message);  // 待发送信息
        int chunkSize = 1024;  // 定义每个块的大小
        int offset = 0;  // 初始化偏移量
        String messageId = String.valueOf(System.currentTimeMillis());  // 生成唯一的消息ID
        // 循环拆分并发送消息块
        while (offset < message.length()) {
            // 提取消息的一部分作为块
            String chunk = message.substring(offset, Math.min(offset + chunkSize, message.length()));
            System.out.println("块：" + chunk);  // 待发送信息
            // 创建要发送的消息对象
            JSONObject chunkMessage = new JSONObject();
            chunkMessage.put("type", "chunk");  // 消息类型为块
            chunkMessage.put("messageId", messageId);  // 唯一的消息ID
            chunkMessage.put("chunkData", chunk);  // 块的内容
            chunkMessage.put("isLastChunk", (offset + chunkSize) >= message.length());  // 是否为最后一个块

            // 发送块到客户端
            session.sendMessage(new TextMessage(chunkMessage.toString()));  // 发送消息块

            // 更新偏移量
            offset += chunkSize;
        }
        System.out.println("发送成功");  // 待发送信息
    }

    public void process(String fullMessage,WebSocketSession session) throws Exception{
        String[] blocks = fullMessage.split("\\[b1565ef8ea49b3b3959db8c5487229ea\\]");  // 使用特殊标记拆分字符串
        String command = blocks[0];  // 获取命令类型

        if (Objects.equals(command, "login")) {  // 如果命令是"login"
            String account = blocks[1];  // 获取账号信息
            sessions.put(session, account);  // 存储会话和账号的映射
            userSessions.put(account, session);  // 存储账号和会话的映射
            User user = userRepository.findByAccount(account);  // 从数据库中查找用户
            user.setIsonline(1);  // 设置用户在线状态为1
            userRepository.save(user);  // 保存用户状态到数据库
            System.out.println("Account: " + account);  // 打印收到的账号信息
            // 向客户端发送响应消息
            String[] messages = { "loginSuccessfully", account, user.getUsername(), user.getEmail(), user.getTelephone() };  // 构建响应消息数组
            String multiLineMessage = String.join(DELIMITER, messages);  // 使用特殊标记拼接消息
            sendMessage(session,multiLineMessage); // 发送登录成功消息给客户
            // 获取数据库中的所有用户信息
            List<User> allUsers = userRepository.findAll();  // 获取所有用户列表
            StringBuilder allUsersMessage = new StringBuilder();  // 创建StringBuilder用于拼接消息

            // 构建包含所有用户账号和用户名的一条消息
            allUsersMessage.append("usersList");  // 添加命令名称
            for (User u : allUsers) {  // 遍历所有用户
                if (allUsersMessage.length() > 0) {
                    allUsersMessage.append(DELIMITER);  // 添加分隔符
                }
                allUsersMessage.append(u.getAccount()).append(DELIMITER).append(u.getUsername());  // 添加账号和用户名
            }

            // 发送所有用户账号和用户名
            if (allUsersMessage.length() > 0) {
                sendMessage(session,allUsersMessage.toString()); // 发送登录成功消息给客户端
            }
        } else if (Objects.equals(command, "sendMessage")) {  // 如果命令是"sendMessage"
            String senderAccount = blocks[1];  // 获取发送者账号
            String receiverAccount = blocks[2];  // 获取接收者账号
            String messageContent = blocks[3];  // 获取消息内容

            // 这里可以添加将消息发送给特定用户的逻辑
            System.out.println("Message from " + senderAccount + ": " + messageContent + " to " + receiverAccount);  // 打印消息信息
            WebSocketSession receiverSession = userSessions.get(receiverAccount);  // 获取接收者的会话
            if (receiverSession == null) {
                System.out.println("not online");  // 如果接收者不在线
            } else {
                String messageToSend = "messageFrom" + DELIMITER + senderAccount + DELIMITER + messageContent;  // 构建要发送的消息
                sendMessage(receiverSession,messageToSend);
                System.out.println("Message sent to " + receiverAccount);  // 打印发送成功信息
            }
        }
    }


}