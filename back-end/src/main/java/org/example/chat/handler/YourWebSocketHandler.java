package org.example.chat.handler;  // 定义类所在的包

import org.example.chat.model.Avatar;
import org.example.chat.model.User;
import org.example.chat.model.Message;
import org.example.chat.repository.AvatarRepository;
import org.example.chat.repository.MessageRepository;
import org.example.chat.repository.UserRepository;
import org.example.chat.tools.AESCryptoServer;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import javax.xml.bind.DatatypeConverter;
import java.io.File;
import java.io.FileInputStream;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.*;


@Component  // 标记该类为Spring组件
public class YourWebSocketHandler extends TextWebSocketHandler {  // 继承TextWebSocketHandler类

    @Autowired  // 自动注入UserRepository实例
    private UserRepository userRepository;  // 声明UserRepository类型的成员变量，用于数据库操作
    @Autowired
    private AvatarRepository avatarRepository; // // 声明AvatarRepository类型的成员变量，用于数据库操作
    @Autowired
    private MessageRepository messageRepository; //  声明MessageRepository类型的成员变量，用于数据库操作

    private AESCryptoServer crypto = new AESCryptoServer(); //密钥解析器

    private static final String DELIMITER = "[b1565ef8ea49b3b3959db8c5487229ea]";  // 定义分隔符常量
    private static final Map<WebSocketSession, String> sessions = new HashMap<>();  // 存储会话和账号的映射
    private static final Map<String, WebSocketSession> userSessions = new HashMap<>();  // 存储账号和会话的映射

    Map<String, StringBuilder> messageChunks = new HashMap<>(); // 存储未完成的消息块，键为消息ID，值为StringBuilder
    Map<String, Timer> timers = new HashMap<>(); // 存储每个消息ID的定时器任务
    Map<String,String> messageHashes = new HashMap<>(); //存储每个消息对应的哈希值
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
            // 对第一个块进行处理 保存 SHA-256 哈希值
            if (json.has("sha256")) {
                messageHashes.put(messageId, json.getString("sha256"));
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
                            messageHashes.remove(messageId);
                            timers.remove(messageId);
                        }
                    }, 30000);  // 设置超时时间，例如30秒
                    timers.put(messageId, timer);  // 保存定时器
                }
                // 最后一个快
                if (isLastChunk) {
                    // 收到最后一个块，组装完整消息
                    StringBuilder messageBuilder_fresh = messageChunks.get(messageId);
                    String fullMessage = messageBuilder_fresh.toString();
                    fullMessage = crypto.decrypt(fullMessage);
                    // 计算消息的 SHA-256 哈希值
                    MessageDigest digest = MessageDigest.getInstance("SHA-256");
                    byte[] hash = digest.digest(fullMessage.getBytes(StandardCharsets.UTF_8));
                    String hashHex = DatatypeConverter.printHexBinary(hash).toLowerCase();
                    // 检查是否存在哈希值
                    String messageHash = messageHashes.get(messageId);
                    // 验证哈希值
                    if (hashHex != null && !hashHex.isEmpty() && messageHash != null && !messageHash.isEmpty()) {
                        if (hashHex.equals(messageHash)) {
                            process(fullMessage, session);  // 校验通过，处理消息
                        } else {
                            System.err.println("消息完整性校验失败");
                        }
                    } else {
                        // 如果 hashHex 或 messageHash 为空，输出警告信息
                        System.err.println("消息的哈希值为空，无法进行完整性校验");
                    }
                    // 清理数据和定时器
                    messageChunks.remove(messageId);
                    messageHashes.remove(messageId);
                    Timer timer = timers.remove(messageId);
                    if (timer != null) {
                        timer.cancel();
                    }
                }
            }
            else { // 对非第一个块进行处理
                // 获取或创建对应消息ID的StringBuilder
                StringBuilder messageBuilder = messageChunks.get(messageId);
                if(!messageBuilder.isEmpty()) {
                    messageBuilder.append(chunkData);  // 追加块数据
                    messageChunks.put(messageId, messageBuilder);  // 更新Map
                    if (isLastChunk) {
                        // 收到最后一个块，组装完整消息
                        StringBuilder messageBuilder_fresh = messageChunks.get(messageId);
                        String fullMessage = messageBuilder_fresh.toString();
                        fullMessage = crypto.decrypt(fullMessage);
                        // 计算消息的 SHA-256 哈希值
                        MessageDigest digest = MessageDigest.getInstance("SHA-256");
                        byte[] hash = digest.digest(fullMessage.getBytes(StandardCharsets.UTF_8));
                        String hashHex = DatatypeConverter.printHexBinary(hash).toLowerCase();
                        // 检查是否存在哈希值
                        String messageHash = messageHashes.get(messageId);
                        // 验证哈希值
                        if (hashHex != null && !hashHex.isEmpty() && messageHash != null && !messageHash.isEmpty()) {
                            if (hashHex.equals(messageHash)) {
                                process(fullMessage, session);  // 校验通过，处理消息
                            } else {
                                System.err.println("消息完整性校验失败");
                            }
                        } else {
                            // 如果 hashHex 或 messageHash 为空，输出警告信息
                            System.err.println("消息的哈希值为空，无法进行完整性校验");
                        }
                        // 清理数据和定时器
                        messageChunks.remove(messageId);
                        messageHashes.remove(messageId);
                        Timer timer = timers.remove(messageId);
                        if (timer != null) {
                            timer.cancel();
                        }
                    }
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
        String encodeMessage = crypto.encrypt(message);
        System.out.println("待发送信息：" + message);  // 待发送信息
        int chunkSize = 1024;  // 定义每个块的大小
        int offset = 0;  // 初始化偏移量
        String messageId = String.valueOf(System.currentTimeMillis());  // 生成唯一的消息ID
        // 计算 SHA-256 哈希值
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        byte[] hash = digest.digest(message.getBytes(StandardCharsets.UTF_8));
        String hashHex = DatatypeConverter.printHexBinary(hash).toLowerCase();
        // 循环拆分并发送消息块
        while (offset < encodeMessage.length()) {
            // 提取消息的一部分作为块
            String chunk = encodeMessage.substring(offset, Math.min(offset + chunkSize, encodeMessage.length()));
            System.out.println("块：" + chunk);  // 待发送信息
            // 创建要发送的消息对象
            JSONObject chunkMessage = new JSONObject();
            chunkMessage.put("type", "chunk");  // 消息类型为块
            chunkMessage.put("messageId", messageId);  // 唯一的消息ID
            chunkMessage.put("chunkData", chunk);  // 块的内容
            chunkMessage.put("isLastChunk", (offset + chunkSize) >= encodeMessage.length());  // 是否为最后一个块
            if (offset == 0) {
                chunkMessage.put("sha256", hashHex);  // 在第一个块中附加哈希值
            }

            // 发送块到客户端
            session.sendMessage(new TextMessage(chunkMessage.toString()));  // 发送消息块

            // 更新偏移量
            offset += chunkSize;
        }
        System.out.println("发送成功");  // 待发送信息
    }

    // 获取文件扩展名
    public static String getFileExtension(File file) {
        String fileName = file.getName();
        int lastIndexOf = fileName.lastIndexOf(".");
        if (lastIndexOf == -1) {
            return "Unknown"; // 如果没有扩展名
        }
        return fileName.substring(lastIndexOf + 1);
    }

    public void process(String fullMessage,WebSocketSession session) throws Exception{
        String[] blocks = fullMessage.split("\\[b1565ef8ea49b3b3959db8c5487229ea\\]");  // 使用特殊标记拆分字符串
        String command = blocks[0];  // 获取命令类型

        if (Objects.equals(command, "login") || Objects.equals(command, "refresh")) {  // 如果命令是"login"
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
                String fileType = "null";
                String base64Data = "null";
                Avatar avatar = avatarRepository.findByAccount(u.getAccount());
                if (avatar == null){
                    String avatar_path = "SOURCEFILES/IMAGES/PNG/default_image.png";
                    File file = new File(avatar_path);
                    if (file.exists()) {
                        FileInputStream fileInputStream = new FileInputStream(file);
                        byte[] fileBytes = new byte[(int) file.length()];
                        fileInputStream.read(fileBytes);
                        fileInputStream.close();
                        base64Data = Base64.getEncoder().encodeToString(fileBytes);
                        System.out.println("Base64 :" + base64Data);  // 打印base64编码
                        // 向客户端发送响应消息
                        fileType = getFileExtension(file);
                    }
                }
                else{
                    String avatar_path = avatar.getAvatar_path();
                    System.out.println("Current working directory: " + System.getProperty("user.dir"));
                    File file = new File(avatar_path);
                    if (file.exists()) {
                        FileInputStream fileInputStream = new FileInputStream(file);
                        byte[] fileBytes = new byte[(int) file.length()];
                        fileInputStream.read(fileBytes);
                        fileInputStream.close();
                        base64Data = Base64.getEncoder().encodeToString(fileBytes);
                        System.out.println("Base64 :" + base64Data);  // 打印base64编码
                        // 向客户端发送响应消息
                        fileType = getFileExtension(file);
                    }
                    else {
                        avatar_path = "SOURCEFILES/IMAGES/PNG/default_image.png";
                        file = new File(avatar_path);
                        if (file.exists()) {
                            FileInputStream fileInputStream = new FileInputStream(file);
                            byte[] fileBytes = new byte[(int) file.length()];
                            fileInputStream.read(fileBytes);
                            fileInputStream.close();
                            base64Data = Base64.getEncoder().encodeToString(fileBytes);
                            System.out.println("Base64 :" + base64Data);  // 打印base64编码
                            // 向客户端发送响应消息
                            fileType = getFileExtension(file);
                        }
                    }
                }
                allUsersMessage.append(u.getAccount()).append(DELIMITER).append(u.getUsername()).append(DELIMITER).append(fileType).append(DELIMITER).append(base64Data);  // 添加账号和用户名
            }

            // 发送所有用户账号和用户名
            if (allUsersMessage.length() > 0) {
                sendMessage(session,allUsersMessage.toString()); // 发送登录成功消息给客户端
            }

            //发送头像
            Avatar avatar = avatarRepository.findByAccount(account);
            if (avatar == null){ //用户未存储头像
                System.out.println("未存储头像");  // 打印base64编码
                System.out.println("Current working directory: " + System.getProperty("user.dir"));
                String avatar_path = "SOURCEFILES/IMAGES/PNG/default_image.png";
                File file = new File(avatar_path);
                if (file.exists()){
                    FileInputStream fileInputStream = new FileInputStream(file);
                    byte[] fileBytes = new byte[(int) file.length()];
                    fileInputStream.read(fileBytes);
                    fileInputStream.close();
                    String base64Data = Base64.getEncoder().encodeToString(fileBytes);
                    System.out.println("Base64 :" + base64Data);  // 打印base64编码
                    // 向客户端发送响应消息
                    String fileType = getFileExtension(file);
                    System.out.println("File type is: " + fileType);
                    String[] messages_tmp = { "myAvatar", fileType ,base64Data};  // 构建响应消息数组
                    String multiLineMessage_tmp = String.join(DELIMITER, messages_tmp);  // 使用特殊标记拼接消息
                    sendMessage(session,multiLineMessage_tmp); // 发送登录成功消息给客户
                }
            }
            else {
                System.out.println("已存储头像");  // 打印base64编码
                String avatar_path = avatar.getAvatar_path();
                System.out.println("Current working directory: " + System.getProperty("user.dir"));
                File file = new File(avatar_path);
                if (file.exists()){
                    FileInputStream fileInputStream = new FileInputStream(file);
                    byte[] fileBytes = new byte[(int) file.length()];
                    fileInputStream.read(fileBytes);
                    fileInputStream.close();
                    String base64Data = Base64.getEncoder().encodeToString(fileBytes);
                    System.out.println("Base64 :" + base64Data);  // 打印base64编码
                    // 向客户端发送响应消息
                    String fileType = getFileExtension(file);
                    System.out.println("File type is: " + fileType);
                    String[] messages_tmp = { "myAvatar", fileType ,base64Data};  // 构建响应消息数组
                    String multiLineMessage_tmp = String.join(DELIMITER, messages_tmp);  // 使用特殊标记拼接消息
                    sendMessage(session,multiLineMessage_tmp); // 发送登录成功消息给客户
                }
                else
                {
                    avatar_path = "SOURCEFILES/IMAGES/PNG/default_image.png";
                    file = new File(avatar_path);
                    if(file.exists()){
                        FileInputStream fileInputStream = new FileInputStream(file);
                        byte[] fileBytes = new byte[(int) file.length()];
                        fileInputStream.read(fileBytes);
                        fileInputStream.close();
                        String base64Data = Base64.getEncoder().encodeToString(fileBytes);
                        System.out.println("Base64 :" + base64Data);  // 打印base64编码
                        // 向客户端发送响应消息
                        String fileType = getFileExtension(file);
                        System.out.println("File type is: " + fileType);
                        String[] messages_tmp = { "myAvatar", fileType ,base64Data};  // 构建响应消息数组
                        String multiLineMessage_tmp = String.join(DELIMITER, messages_tmp);  // 使用特殊标记拼接消息
                        sendMessage(session,multiLineMessage_tmp); // 发送登录成功消息给客户
                    }

                }
            }
            //去根据账号从数据库里面找到待发送的信息 传回给用户 2
            // 处理用户上线时，发送未读消息
            handleUserOnline(account);


        } else if (Objects.equals(command, "sendMessage")) {  // 如果命令是"sendMessage"
            String senderAccount = blocks[1];  // 获取发送者账号
            String receiverAccount = blocks[2];  // 获取接收者账号
            String messageContent = blocks[3];  // 获取消息内容

            // 这里可以添加将消息发送给特定用户的逻辑
            System.out.println("Message from " + senderAccount + ": " + messageContent + " to " + receiverAccount);  // 打印消息信息
            WebSocketSession receiverSession = userSessions.get(receiverAccount);  // 获取接收者的会话
            if (receiverSession == null) {
                System.out.println("not online");  // 如果接收者不在线
                //未发送成功的信息存在数据库的 xxx表里 1
                saveMessageToDatabase(senderAccount, receiverAccount, messageContent);

            } else {
                String messageToSend = "messageFrom" + DELIMITER + senderAccount + DELIMITER + messageContent;  // 构建要发送的消息
                sendMessage(receiverSession,messageToSend);
                System.out.println("Message sent to " + receiverAccount);  // 打印发送成功信息
            }
        }
    }
    // 处理用户上线时，发送未读消息
    public void handleUserOnline(String userAccount) {
        List<Message> unreadMessages = messageRepository.findByReceiver(userAccount); // 从数据库获取未读消息
        WebSocketSession userSession = userSessions.get(userAccount); // 获取接受者会话

        if (userSession != null) { // 检查用户会话是否存在
            for (Message msg : unreadMessages) { // 遍历未读消息
                String messageToSend = new JSONObject()
                        .put("type", "messageFrom") // 构建消息格式
                        .put("sender", msg.getSender())
                        .put("content", msg.getContent())
                        .toString();
                try {
                    //sendMessage(userSession, messageToSend); // 发送消息
                    //System.out.println("Sent unread message from " + msg.getSender() + " to " + userAccount);
                    String messageToSend_s = "messageFrom" + DELIMITER + msg.getSender() + DELIMITER + msg.getContent();  // 构建要发送的消息
                    sendMessage(userSession,messageToSend_s);
                    // 只有在消息成功发送后才删除
                    messageRepository.delete(msg); // 删除已发送的消息
                } catch (Exception e) {
                    System.err.println("Error sending unread message: " + e.getMessage()); // 异常处理
                    // 可以考虑在这里记录失败的消息，或进行重试逻辑
                }
            }
        } else {
            System.out.println("User session not found for account: " + userAccount); // 会话不存在处理
        }
    }
    // 保存未发送的消息到数据库
    private void saveMessageToDatabase(String sender, String receiver, String content) {
        Message message = new Message();
        message.setSender(sender);
        message.setReceiver(receiver);
        message.setContent(content);
        messageRepository.save(message); // 保存消息到数据库
        System.out.println("Message from " + sender + " to " + receiver + " saved in database.");
    }

}