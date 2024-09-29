package org.example.chat.handler; // 定义类所在的包

import org.springframework.web.socket.TextMessage; // 导入TextMessage类
import org.springframework.web.socket.WebSocketSession; // 导入WebSocketSession类
import org.springframework.web.socket.handler.TextWebSocketHandler; // 导入TextWebSocketHandler类
import org.springframework.web.socket.CloseStatus; // 关闭链接

import java.awt.desktop.UserSessionEvent;
import java.util.HashMap; // 用于socket和account的对应
import java.util.List;
import java.util.Map;
import java.util.Objects;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import org.example.chat.model.User;
// 导入自定义的User实体类，映射数据库中的用户表。

import org.example.chat.repository.UserRepository;
// 导入自定义的UserRepository接口，用于与数据库进行交互操作。

@Component
public class YourWebSocketHandler extends TextWebSocketHandler { // 继承TextWebSocketHandler类

    @Autowired
    private UserRepository userRepository; // 注入 UserRepository
    private static final Map<WebSocketSession, String> sessions = new HashMap<>(); // 存储会话和账号的映射
     //链接所对应的账号
    private static final Map<String,WebSocketSession> userSessions = new HashMap<>();
    @Override
    public void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        // 获取客户端发送的消息内容
        String payload = message.getPayload(); // 获取消息的负载
        String[] blocks = payload.split("\\[b1565ef8ea49b3b3959db8c5487229ea\\]"); // 拆分成字符串数组
        String command = blocks[0]; // 第一个消息
        if (Objects.equals(command, "login")) {
            String account = blocks.length > 1 ? blocks[1] : ""; // 第二行
            sessions.put(session, account); // 存储账号与会话的映射
            userSessions.put(account,session);//
            User user = userRepository.findByAccount(account);
            user.setIsonline(1);
            userRepository.save(user);
            System.out.println("Account: " + account); // 打印收到的消息

            // 向客户端发送响应消息
            String[] messages = { "loginSuccessfully", account, user.getUsername() };
            String multiLineMessage = String.join("[b1565ef8ea49b3b3959db8c5487229ea]", messages);
            session.sendMessage(new TextMessage(multiLineMessage)); // 发送登录成功消息给客户端

            // 获取数据库中的所有用户信息
            List<User> allUsers = userRepository.findAll();
            StringBuilder allUsersMessage = new StringBuilder();

            // 构建包含所有用户账号和用户名的一条消息
            allUsersMessage.append("usersList"); // 添加command名称
            for (User u : allUsers) {
                if (allUsersMessage.length() > 0) {
                    allUsersMessage.append("[b1565ef8ea49b3b3959db8c5487229ea]");
                }
                allUsersMessage.append(u.getAccount()).append("[b1565ef8ea49b3b3959db8c5487229ea]")
                        .append(u.getUsername());
            }

            // 发送所有用户账号和用户名
            if (allUsersMessage.length() > 0) {
                session.sendMessage(new TextMessage(allUsersMessage.toString()));
            }
        }
        else if(Objects.equals(command, "sendMessage")){
            String senderAccount = blocks[1];
            String receiverAccount = blocks[2];
            String messageContent = blocks[3];
            // 这里可以添加将消息发送给特定用户的逻辑
            System.out.println("Message from " + senderAccount + ": " + messageContent + " to " + receiverAccount);
            WebSocketSession receiverSession = userSessions.get(receiverAccount);
            if (receiverSession == null) {
                System.out.println("not online");
            }
            else {
                String messageToSend = "messageFrom[b1565ef8ea49b3b3959db8c5487229ea]" + senderAccount + "[b1565ef8ea49b3b3959db8c5487229ea]" + messageContent;
                receiverSession.sendMessage(new TextMessage(messageToSend));
                System.out.println("Message sent to " + receiverAccount);
            }
        }
    }
    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        // 处理断开连接的逻辑
        System.out.println("Connection closed: " + status);
        // 可以在这里添加清理操作，例如注销账号或更新状态
        String account = sessions.remove(session); // 移除会话与账号的映射
        WebSocketSession userSession = userSessions.remove(account);
        if (account != null) {
            System.out.println("Account logged out: " + account);
            User user = userRepository.findByAccount(account);
            user.setIsonline(0);
            userRepository.save(user);
        }
    }

}