package org.example.chat.handler;  // 定义类所在的包

//导入一些基础的java类

import java.util.*;
import java.util.List;  // 导入List接口
import java.util.Base64;  //Base64 编码
import java.util.Objects;  // 导入Objects类
import java.util.Map;  // 导入Map接口
import java.util.HashMap;  // 导入HashMap类
import java.io.File;  //文件读取
import java.nio.file.*;
import java.util.Base64;
import java.io.IOException;
import java.nio.file.Paths; //文件路径
import java.nio.file.StandardOpenOption; //标准
import java.io.FileInputStream;  //文件流

//导入json文件处理类
import org.json.JSONObject; // 将字符串解析为JSON对象

//导入用于密钥解析的类
import org.example.chat.tools.AESCryptoServer; // 导入密钥解析器

//导入用于网络处理的类
import org.springframework.web.socket.TextMessage;  // 导入TextMessage类
import org.springframework.web.socket.CloseStatus;  // 导入CloseStatus类，用于处理连接关闭状态
import org.springframework.web.socket.WebSocketSession;  // 导入WebSocketSession类
import org.springframework.web.socket.handler.TextWebSocketHandler;  // 导入TextWebSocketHandler类

//导入实例化用户信息的类
import org.example.chat.model.User;  // 导入自定义的User实体类，映射数据库中的用户表
import org.example.chat.model.Avatar; // 导入自定义的Avatar实体类，映射数据库中的头像路径
import org.example.chat.model.Message; //导入信息
import org.example.chat.repository.UserRepository;  // 导入自定义的UserRepository接口，用于与数据库进行交互操作
import org.example.chat.repository.AvatarRepository; // 导入自定义的AvatarRepository接口，用于与数据库进行交互操作
import org.example.chat.repository.MessageRepository; //导入信息接口
import org.springframework.beans.factory.annotation.Autowired;  // 导入@Autowired注解，用于依赖注入

//导入用于哈希校验的类
import java.security.MessageDigest;
import javax.xml.bind.DatatypeConverter;
import java.nio.charset.StandardCharsets;

import org.springframework.stereotype.Component;  // 导入@Component注解，标记为Spring组件

@Component  // 标记该类为Spring组件
public class YourWebSocketHandler extends TextWebSocketHandler {  // 继承TextWebSocketHandler类

    @Autowired  // 自动注入UserRepository实例
    private UserRepository userRepository;  // 声明UserRepository类型的成员变量，用于数据库操作
    @Autowired  //自动注入AvatarRepository实例
    private AvatarRepository avatarRepository; // ／/声明AvatarRepository类型的成员变量，用于数据库操作
    @Autowired
    private MessageRepository messageRepository; //  声明MessageRepository类型的成员变量，用于数据库操作

    private static final String DELIMITER = "[b1565ef8ea49b3b3959db8c5487229ea]";  // 定义分隔符常量
    private static final AESCryptoServer crypto = new AESCryptoServer(); // 密钥解析器
    private static final Map<WebSocketSession, String> sessions = new HashMap<>();  // 存储会话和账号的映射
    private static final Map<String, WebSocketSession> userSessions = new HashMap<>();  // 存储账号和会话的映射

    //消息的临时信息存储
    Map<String, Timer> timers = new HashMap<>(); // 存储每个消息ID的定时器任务
    Map<String, String> messageHashes = new HashMap<>(); //存储每个消息对应的哈希值
    Map<String, StringBuilder> messageChunks = new HashMap<>(); // 存储未完成的消息块，键为消息ID，值为StringBuilder

    //功能性函数

    //设置在线
    public void setOnline(User user) {
        user.setIsonline(1);  // 设置用户在线状态为1
        userRepository.save(user);  // 保存用户状态到数据库
    }

    //存储账号映射
    public void save_account_map(String account, WebSocketSession session) {
        sessions.put(session, account);  // 存储会话和账号的映射
        userSessions.put(account, session);  // 存储账号和会话的映射
    }

    //向客户端发送基础消息
    public void sendBasicMessageToClient(User user, WebSocketSession session) throws Exception {
        String[] messages = {"loginSuccessfully", user.getAccount(), user.getUsername(), user.getEmail(), user.getTelephone()};  // 构建响应消息数组
        String multiLineMessage = String.join(DELIMITER, messages);  // 使用特殊标记拼接消息
        sendMessage(session, multiLineMessage); // 发送登录成功消息给客户
    }

    //计算信息哈希
    public String hashCalculator(String fullMessage) throws Exception {
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        byte[] hash = digest.digest(fullMessage.getBytes(StandardCharsets.UTF_8));
        return DatatypeConverter.printHexBinary(hash).toLowerCase();
    }

    //获取文件大base64编码
    public String getFileBase64(File file) throws Exception {
        FileInputStream fileInputStream = new FileInputStream(file);
        byte[] fileBytes = new byte[(int) file.length()];
        fileInputStream.read(fileBytes);
        fileInputStream.close();
        return Base64.getEncoder().encodeToString(fileBytes);
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

    // 根据文件扩展名返回 MIME 类型
    public String getMimeType(String fileType) {
        switch (fileType) {
            case "jpg":
            case "jpeg":
                return "image/jpeg";
            case "png":
                return "image/png";
            case "gif":
                return "image/gif";
            case "pdf":
                return "application/pdf";
            case "txt":
                return "text/plain";
            // 添加其他文件类型支持
            default:
                return "application/octet-stream"; // 默认 MIME 类型
        }
    }

    // 清理数据和定时器
    public void tempCleaner(String messageId) {
        messageChunks.remove(messageId);
        messageHashes.remove(messageId);
        Timer timer = timers.remove(messageId);
        if (timer != null) {
            timer.cancel();
        }
    }

    public void sendAvatar(Avatar avatar, WebSocketSession session) throws Exception {
        if (avatar == null) { //用户未存储头像
            System.out.println("未存储头像");  // 打印base64编码
            String avatar_path = "SOURCEFILES/IMAGES/PNG/default_image.png";
            File file = new File(avatar_path);
            if (file.exists()) {
                sendUserAvatar(file, session);
            }
        } else {
            System.out.println("已存储头像");  // 打印base64编码
            String avatar_path = avatar.getAvatar_path();
            File file = new File(avatar_path);
            if (file.exists()) {
                sendUserAvatar(file, session);
            } else {
                avatar_path = "SOURCEFILES/IMAGES/PNG/default_image.png";
                file = new File(avatar_path);
                if (file.exists()) {
                    sendUserAvatar(file, session);
                }
            }
        }

    }

    public void setAvatar(Avatar avatar, WebSocketSession session) throws Exception {
        if (avatar == null) { //用户未存储头像
            System.out.println("未存储头像");  // 打印base64编码
            String avatar_path = "SOURCEFILES/IMAGES/PNG/default_image.png";
            File file = new File(avatar_path);
            if (file.exists()) {
                sendUserAvatar_s(file, session);
            }
        } else {
            System.out.println("已存储头像");  // 打印base64编码
            String avatar_path = avatar.getAvatar_path();
            File file = new File(avatar_path);
            if (file.exists()) {
                sendUserAvatar_s(file, session);
            } else {
                avatar_path = "SOURCEFILES/IMAGES/PNG/default_image.png";
                file = new File(avatar_path);
                if (file.exists()) {
                    sendUserAvatar_s(file, session);
                }
            }
        }

    }



    // 发送头像
    public void sendUserAvatar(File file, WebSocketSession session) throws Exception {
        String base64Data = getFileBase64(file);
        String fileType = getFileExtension(file);
        String[] messages_tmp = {"myAvatar", fileType, base64Data};  // 构建响应消息数组
        String multiLineMessage_tmp = String.join(DELIMITER, messages_tmp);  // 使用特殊标记拼接消息
        sendMessage(session, multiLineMessage_tmp); // 发送登录成功消息给客户
    }

    // 发送头像
    public void sendUserAvatar_s(File file, WebSocketSession session) throws Exception {
        String base64Data = getFileBase64(file);
        String fileType = getFileExtension(file);
        String[] messages_tmp = {"setAvatar", fileType, base64Data};  // 构建响应消息数组
        String multiLineMessage_tmp = String.join(DELIMITER, messages_tmp);  // 使用特殊标记拼接消息
        sendMessage(session, multiLineMessage_tmp); // 发送登录成功消息给客户
    }

    //开始时间计时
    public void startTimer(String messageId) {
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
    }

    //信息追加
    public void addUserMessages(User u, StringBuilder allUsersMessage) throws Exception {
        if (allUsersMessage.length() > 0) {
            allUsersMessage.append(DELIMITER);  // 添加分隔符
        }
        //存储头像数据
        String fileType = "null";
        String base64Data = "null";
        Avatar avatar = avatarRepository.findByAccount(u.getAccount());
        if (avatar == null) {
            String avatar_path = "SOURCEFILES/IMAGES/PNG/default_image.png";
            File file = new File(avatar_path);
            if (file.exists()) {
                base64Data = getFileBase64(file);
                fileType = getFileExtension(file);
            }
        } else {
            String avatar_path = avatar.getAvatar_path();
            File file = new File(avatar_path);
            if (file.exists()) {
                base64Data = getFileBase64(file);
                fileType = getFileExtension(file);
            } else {
                avatar_path = "SOURCEFILES/IMAGES/PNG/default_image.png";
                file = new File(avatar_path);
                if (file.exists()) {
                    base64Data = getFileBase64(file);
                    fileType = getFileExtension(file);
                }
            }
        }
        //追加信息
        allUsersMessage.append(u.getAccount()).append(DELIMITER).append(u.getUsername()).append(DELIMITER).append(fileType).append(DELIMITER).append(base64Data);  // 添加账号和用户名
    }

    //最后一个信息块处理器
    public void lastChunkHandler(WebSocketSession session, String messageId) throws Exception {
        System.out.println("进行消息处理");  // 待发送信息
        // 收到最后一个块，组装完整消息
        StringBuilder messageBuilder_fresh = messageChunks.get(messageId);
        // 将其转化为字符串
        String fullMessage = messageBuilder_fresh.toString();
        //消息解密
        fullMessage = crypto.decrypt(fullMessage);
        // 计算消息的 SHA-256 哈希值 进行校验
        String hashHex = hashCalculator(fullMessage);
        // 检查是否存在哈希值
        String messageHash = messageHashes.get(messageId);
        // 验证哈希值
        if (hashHex != null && !hashHex.isEmpty() && messageHash != null && !messageHash.isEmpty()) {
            if (hashHex.equals(messageHash)) {
                System.err.println("消息完整性校验成功");
                process(fullMessage, session);  // 校验通过，处理消息
            } else {
                System.err.println("消息完整性校验失败");
            }
        } else {
            // 如果 hashHex 或 messageHash 为空，输出警告信息
            System.err.println("消息的哈希值为空，无法进行完整性校验");
        }
        // 清理数据和定时器
        tempCleaner(messageId);
    }

    //块处理
    public void chunkHandler(WebSocketSession session, JSONObject json) throws Exception {
        String messageId = json.getString("messageId");  // 获取消息ID
        String chunkData = json.getString("chunkData");  // 获取块数据
        boolean isLastChunk = json.getBoolean("isLastChunk");  // 是否为最后一个块
        // 对第一个块进行处理（只有第一个块存有sha256） 保存 SHA-256 哈希值
        if (json.has("sha256")) {
            messageHashes.put(messageId, json.getString("sha256"));  //存放消息对应的sha256
            // 创建对应消息ID的StringBuilder
            StringBuilder messageBuilder = messageChunks.getOrDefault(messageId, new StringBuilder());
            messageBuilder.append(chunkData);  // 追加块数据
            messageChunks.put(messageId, messageBuilder);  // 更新Map
            // 如果这是第一个块，启动定时器
            startTimer(messageId);
            // 最后一个快
            if (isLastChunk) {
                lastChunkHandler(session, messageId);
            }
        } else { // 对非第一个块进行处理
            // 获取或创建对应消息ID的StringBuilder
            StringBuilder messageBuilder = messageChunks.get(messageId);
            if (!messageBuilder.isEmpty()) {  // 如果该消息的第一个快已被发送
                messageBuilder.append(chunkData);  // 追加块数据
                messageChunks.put(messageId, messageBuilder);  // 更新Map
                if (isLastChunk) {
                    lastChunkHandler(session, messageId);
                }
            }
        }
    }

    //消息发送
    public void sendMessage(WebSocketSession session, String message) throws Exception {  // 向客户端发送消息
        String encodeMessage = crypto.encrypt(message);  // 将消息加密
        int chunkSize = 1024;  // 定义每个块的大小
        int offset = 0;  // 初始化偏移量
        String messageId = String.valueOf(System.currentTimeMillis());  // 生成唯一的消息ID
        // 计算 SHA-256 哈希值
        String hashHex = hashCalculator(message);
        // 循环拆分并发送消息块
        while (offset < encodeMessage.length()) {
            // 提取消息的一部分作为块
            String chunk = encodeMessage.substring(offset, Math.min(offset + chunkSize, encodeMessage.length()));
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
    }

    public void command_sendMessage(String[] blocks) throws Exception {
        String senderAccount = blocks[1];  // 获取发送者账号
        String receiverAccount = blocks[2];  // 获取接收者账号
        String messageContent = blocks[3];  // 获取消息内容
        // 这里可以添加将消息发送给特定用户的逻辑
        System.out.println("Message from " + senderAccount + " " + " to " + receiverAccount);  // 打印消息信息
        WebSocketSession receiverSession = userSessions.get(receiverAccount);  // 获取接收者的会话
        if (receiverSession == null) {
            System.out.println("not online");  // 如果接收者不在线
            saveMessageToDatabase(senderAccount, receiverAccount, messageContent);
        } else {
            String messageToSend = "messageFrom" + DELIMITER + senderAccount + DELIMITER + messageContent;  // 构建要发送的消息
            sendMessage(receiverSession, messageToSend);
            System.out.println("Message sent to " + receiverAccount);  // 打印发送成功信息
        }
    }

    public void command_login(String[] blocks, WebSocketSession session) throws Exception {
        String account = blocks[1];  // 获取账号信息
        System.out.println("建立连接账号: " + account);  // 打印收到的账号信息
        save_account_map(account, session); //存储会话与账号
        User user = userRepository.findByAccount(account);  // 从数据库中查找用户
        if (user == null) {
            System.out.println("数据异常");
            return;
        }
        setOnline(user); // 设置用户在线
        sendBasicMessageToClient(user, session); // 向客户端发送响应消息
        // 获取数据库中的所有用户信息
        List<User> allUsers = userRepository.findAll();  // 获取所有用户列表
        StringBuilder allUsersMessage = new StringBuilder();  // 创建StringBuilder用于拼接消息

        // 构建包含所有用户账号和用户名以及头像的一条消息
        allUsersMessage.append("usersList");  // 添加命令名称
        for (User u : allUsers) {  // 遍历所有用户
            addUserMessages(u, allUsersMessage);
        }
        // 发送所有用户账号和用户名
        if (allUsersMessage.length() > 0) {
            sendMessage(session, allUsersMessage.toString()); // 发送好友信息
        }

        //发送头像
        Avatar avatar = avatarRepository.findByAccount(account);
        sendAvatar(avatar, session);

        //发送信息
        handleUserOnline(account);
    }

    public void command_sendSuperEmoji(String[] blocks) throws Exception {
        String senderAccount = blocks[1];  // 获取账号信息
        String receiverAccount = blocks[2];  // 获取账号信息
        String img_path = blocks[3];  // 获取账号信息
        String GIF_path = "SOURCEFILES/IMAGES/GIF/"+img_path +".gif";
        File file = new File(GIF_path);
        String base64Data = getFileBase64(file);
        String fileType = getFileExtension(file);
        String mimeType = getMimeType(fileType);
        String fullBase64 = "data:" + mimeType + ";base64," + base64Data;
        WebSocketSession senderSession = userSessions.get(senderAccount);  // 获取接收者的会话
        WebSocketSession receiverSession = userSessions.get(receiverAccount);  // 获取接收者的会话
        String messageToSend = "messageFrom" + DELIMITER + senderAccount + DELIMITER + fullBase64;  // 构建要发送的消息
        String messageToSend_s = "messageConfirm" + DELIMITER + receiverAccount + DELIMITER + fullBase64;  // 构建要发送的消息
        if (receiverSession == null) {
            System.out.println("not online");  // 如果接收者不在线
            saveMessageToDatabase(senderAccount, receiverAccount, fullBase64);
            sendMessage(senderSession,messageToSend_s);
        }else{
            sendMessage(receiverSession,messageToSend);
            sendMessage(senderSession,messageToSend_s);
        }
    }

    public void command_setAvatar(String[] blocks,WebSocketSession session) throws Exception {
        String senderAccount = blocks[1];  // 获取账号信息
        String base64String = blocks[2];  // 获取 Base64 编码的图片数据

        // 检查图片格式，确定文件扩展名
        String fileExtension;
        String folderPath;
        if (base64String.startsWith("data:image/png")) {
            fileExtension = ".png";
            folderPath = "SOURCEFILES/IMAGES/PNG/";
        } else if (base64String.startsWith("data:image/jpeg") || base64String.startsWith("data:image/jpg")) {
            fileExtension = ".jpg";  // 将 JPEG 和 JPG 都存为 .jpg
            folderPath = "SOURCEFILES/IMAGES/JPG/";
        } else {
            throw new IllegalArgumentException("Unsupported image format");  // 不支持的图片格式
        }

        // 去除 Base64 前缀
        base64String = base64String.substring(base64String.indexOf(",") + 1);

        // 设置文件路径，文件名使用 senderAccount
        String filePath = folderPath + senderAccount + fileExtension;

        // 确保目标文件夹存在，如果不存在则创建
        Path directoryPath = Paths.get(folderPath);
        if (Files.notExists(directoryPath)) {
            Files.createDirectories(directoryPath);
        }

        // 解码并保存图片，覆盖已存在的文件
        try {
            Files.write(
                    Paths.get(filePath),
                    Base64.getDecoder().decode(base64String),
                    StandardOpenOption.CREATE,  // 如果文件不存在则创建
                    StandardOpenOption.TRUNCATE_EXISTING  // 如果文件存在则覆盖
            );
        } catch (IOException e) {
            e.printStackTrace();
        }

        Avatar avatar = avatarRepository.findByAccount(senderAccount);
        if(avatar == null){
            Avatar newAvatar = new Avatar(senderAccount, filePath);
            avatarRepository.save(newAvatar);
            setAvatar(newAvatar, session);
        }else{
            avatar.setAvatar_path(filePath);
            avatarRepository.save(avatar);
            setAvatar(avatar, session);
        }
    }

    public void process(String fullMessage, WebSocketSession session) throws Exception {  // 处理完整的消息
        String[] blocks = fullMessage.split("\\[b1565ef8ea49b3b3959db8c5487229ea\\]");  // 使用特殊标记拆分字符串
        String command = blocks[0];  // 获取命令类型

        if (Objects.equals(command, "login") || Objects.equals(command, "refresh")) {  // 如果命令是"login"
            command_login(blocks, session);
        } else if (Objects.equals(command, "sendMessage")) {  // 如果命令是"sendMessage"
            command_sendMessage(blocks);
        } else if(Objects.equals(command, "sendSuperEmoji"))
        {
            command_sendSuperEmoji(blocks);
        }else if(Objects.equals(command, "setAvatar")){
            command_setAvatar(blocks,session);
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

    @Override
    public void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {  // 处理收到的文本消息
        String payload = message.getPayload();  // 获取消息的内容
        JSONObject json = new JSONObject(payload);  // 将字符串解析为JSON对象
        String type = json.getString("type");  // 获取消息类型
        if (type.equals("chunk")) {
            chunkHandler(session, json);
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {  // 处理连接关闭的逻辑
        System.out.println("Connection closed: " + status);  // 打印连接关闭状态

        // 清理操作
        String account = sessions.remove(session);  // 移除会话与账号的映射
        WebSocketSession userSession = userSessions.remove(account);  // 移除账号与会话的映射
        if (account != null) {
            System.out.println("Account logged out: " + account);  // 打印账号登出信息
            User user = userRepository.findByAccount(account);  // 查找用户
            user.setIsonline(0);  // 设置用户在线状态为0
            userRepository.save(user);  // 保存用户状态到数据库
        }
    }

}