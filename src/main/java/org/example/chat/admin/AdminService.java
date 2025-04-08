package org.example.chat.admin;

import org.example.chat.admin.PageResult;
import org.example.chat.handler.YourWebSocketHandler;
import org.example.chat.model.Avatar;
import org.example.chat.model.User;
import org.example.chat.repository.AvatarRepository;
import org.example.chat.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.io.File;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import static org.example.chat.handler.YourWebSocketHandler.getFileExtension;

@Service
public class AdminService {

    private UserRepository userRepository;
    private AvatarRepository avatarRepository;
    private YourWebSocketHandler tool;
    private JdbcTemplate jdbcTemplate;

    @Autowired
    public AdminService(UserRepository userRepository, AvatarRepository avatarRepository, 
                       YourWebSocketHandler webSocketHandler, JdbcTemplate jdbcTemplate) {
        this.userRepository = userRepository;
        this.avatarRepository = avatarRepository;
        this.tool = webSocketHandler;
        this.jdbcTemplate = jdbcTemplate;
    }

    // 获取所有用户信息,并排除管理员自己
    public PageResult getCommonUsers(int pageNo, int pageSize, String account, String username) {//排除is_admin
        Page<User> page;
        if ((account == null || account.isEmpty()) && (username == null || username.isEmpty())) {
            // 没有查询条件，查询所有非管理员用户
            page = userRepository.findByIsAdminFalse(PageRequest.of(pageNo-1, pageSize));
        } else if (account != null && !account.isEmpty() && (username == null || username.isEmpty())) {
            // 只按账号查询
            page = userRepository.findByAccountContainingAndIsAdminFalse(account, PageRequest.of(pageNo-1, pageSize));
        } else if ((account == null || account.isEmpty()) && username != null && !username.isEmpty()) {
            // 只按用户名查询
            page = userRepository.findByUsernameContainingAndIsAdminFalse(username, PageRequest.of(pageNo-1, pageSize));
        } else {
            // 同时按账号和用户名查询
            page = userRepository.findByAccountContainingAndUsernameContainingAndIsAdminFalse(account, username, PageRequest.of(pageNo-1, pageSize));
        }
        // 获取用户列表
        List<User> userList = page.getContent();

        return new PageResult((int) page.getTotalElements(), userList, produceAvatar(userList));
    }

    // 为每个用户获取头像数据
    private Map<String, String> produceAvatar(List<User> userList) {
        // 创建头像数据Map
        Map<String, String> avatarDataMap = new HashMap<>();
        for (User user : userList) {
            String accountInPage = user.getAccount();
            Avatar avatar = avatarRepository.findByAccount(accountInPage);

            try {
                if (avatar == null) {
                    // 用户未存储头像，使用默认头像
                    String avatarPath = "SOURCEFILES/IMAGES/PNG/default_image.png";
                    File file = new File(avatarPath);
                    if (file.exists()) {
                        String base64Data = tool.getFileBase64(file);
                        String fileType = getFileExtension(file);
                        avatarDataMap.put(accountInPage, "data:image/" + fileType + ";base64," + base64Data);
                    }
                } else {
                    // 使用用户存储的头像
                    String avatarPath = avatar.getAvatar_path();
                    File file = new File(avatarPath);
                    if (file.exists()) {
                        String base64Data = tool.getFileBase64(file);
                        String fileType = getFileExtension(file);
                        avatarDataMap.put(accountInPage, "data:image/" + fileType + ";base64," + base64Data);
                    } else {
                        // 头像文件不存在，使用默认头像
                        String defaultPath = "SOURCEFILES/IMAGES/PNG/default_image.png";
                        File defaultFile = new File(defaultPath);
                        if (defaultFile.exists()) {
                            String base64Data = tool.getFileBase64(defaultFile);
                            String fileType = getFileExtension(defaultFile);
                            avatarDataMap.put(accountInPage, "data:image/" + fileType + ";base64," + base64Data);
                        }
                    }
                }
            } catch (Exception e) {
                // 处理异常情况
                e.printStackTrace();
            }
        }
        return avatarDataMap;
    }

    // 获取管理员信息
    public User getAdminInfo(String account) {
        User admin = userRepository.findByAccount(account);
        return admin;
    }

    public boolean logout(String account) {
        User user = userRepository.findByAccount(account);
        user.setIsonline(0);
        userRepository.save(user);  // 保存用户状态
        return true;
    }
    
    // 抹除用户头像
    public boolean eraseAvatar(String account) {
        try {
            // 从头像表中获取该用户的头像记录
            Avatar avatar = avatarRepository.findByAccount(account);
            if (avatar != null) {
                // 获取头像文件路径并删除文件
                String avatarPath = avatar.getAvatar_path();
                File avatarFile = new File(avatarPath);
                if (avatarFile.exists() && avatarFile.isFile()) {
                    if (!avatarFile.delete()) {
                        throw new Exception("Failed to delete avatar file: " + avatarPath);
                    }
                }
                // 删除数据库记录
                avatarRepository.delete(avatar);
            }
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
    
    // 抹除用户名
    public boolean eraseUsername(String account) {
        try {
            // 查找用户
            User user = userRepository.findByAccount(account);
            if (user != null) {
                // 生成10位以内的随机字符串作为新用户名
                String randomUsername = generateRandomString(10);
                user.setUsername(randomUsername);
                userRepository.save(user);
            }
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
    
    // 生成随机字符串
    private String generateRandomString(int length) {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        StringBuilder sb = new StringBuilder();
        java.util.Random random = new java.util.Random();
        
        // 生成1到length之间的随机长度
        int randomLength = random.nextInt(length) + 1;
        
        for (int i = 0; i < randomLength; i++) {
            int index = random.nextInt(chars.length());
            sb.append(chars.charAt(index));
        }
        
        return sb.toString();
    }

    // 获取用户好友关系
    public Map<String, Object> getUserFriends(String account) {
        Map<String, Object> result = new HashMap<>();
        
        // 获取用户信息
        User user = userRepository.findByAccount(account);
        if (user == null) {
            return result;
        }
        
        // 获取用户头像
        Avatar userAvatar = avatarRepository.findByAccount(account);
        String userAvatarPath = userAvatar != null ? userAvatar.getAvatar_path() : "SOURCEFILES/IMAGES/PNG/default_image.png";
        
        // 获取用户的好友列表
        List<User> friends = userRepository.findFriendsByAccount(account);
        
        // 构建好友信息列表
        List<Map<String, Object>> friendsList = new ArrayList<>();
        for (User friend : friends) {
            Map<String, Object> friendInfo = new HashMap<>();
            friendInfo.put("account", friend.getAccount());
            friendInfo.put("username", friend.getUsername());
            
            // 获取好友头像
            Avatar friendAvatar = avatarRepository.findByAccount(friend.getAccount());
            String friendAvatarPath = friendAvatar != null ? friendAvatar.getAvatar_path() : "SOURCEFILES/IMAGES/PNG/default_image.png";
            
            try {
                File avatarFile = new File(friendAvatarPath);
                if (avatarFile.exists()) {
                    String base64Data = tool.getFileBase64(avatarFile);
                    String fileType = getFileExtension(avatarFile);
                    friendInfo.put("avatar", "data:image/" + fileType + ";base64," + base64Data);
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
            
            friendsList.add(friendInfo);
        }
        
        // 设置返回结果
        result.put("account", user.getAccount());
        result.put("username", user.getUsername());
        result.put("avatar", userAvatarPath);
        result.put("friends", friendsList);
        
        return result;
    }

    // 获取日访问量
    public Map<String, Object> getDailyVisits() {
        Map<String, Object> result = new HashMap<>();
        
        // 查询今日访问量
        Integer todayVisits = jdbcTemplate.queryForObject(
            "SELECT visit_count FROM daily_visits WHERE visit_date = CURDATE()",
            Integer.class
        );
        
        // 查询总访问量
        Integer totalVisits = jdbcTemplate.queryForObject(
            "SELECT SUM(visit_count) FROM daily_visits",
            Integer.class
        );
        
        result.put("todayVisits", todayVisits != null ? todayVisits : 0);
        result.put("totalVisits", totalVisits != null ? totalVisits : 0);
        
        return result;
    }

    // 获取用户完整好友网络（包括间接好友）
    public Map<String, Object> getUserFriendNetwork(String account) {
        Map<String, Object> result = new HashMap<>();
        Set<String> visited = new HashSet<>();
        
        // 递归构建好友网络
        buildFriendNetwork(account, result, visited);
        
        return result;
    }
    
    // 递归构建好友网络的辅助方法
    private void buildFriendNetwork(String account, Map<String, Object> networkData, Set<String> visited) {
        if (visited.contains(account)) {
            return;
        }
        visited.add(account);
        
        // 获取用户信息
        User user = userRepository.findByAccount(account);
        if (user == null) {
            return;
        }
        
        // 获取用户头像
        Avatar userAvatar = avatarRepository.findByAccount(account);
        String userAvatarPath = userAvatar != null ? userAvatar.getAvatar_path() : "SOURCEFILES/IMAGES/PNG/default_image.png";
        String userAvatarBase64 = "";
        
        try {
            File avatarFile = new File(userAvatarPath);
            if (avatarFile.exists()) {
                String base64Data = tool.getFileBase64(avatarFile);
                String fileType = getFileExtension(avatarFile);
                userAvatarBase64 = "data:image/" + fileType + ";base64," + base64Data;
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        
        // 获取用户的直接好友列表
        List<User> directFriends = userRepository.findFriendsByAccount(account);
        List<Map<String, Object>> friendsList = new ArrayList<>();
        
        // 递归处理每个好友
        for (User friend : directFriends) {
            Map<String, Object> friendNetwork = new HashMap<>();
            buildFriendNetwork(friend.getAccount(), friendNetwork, visited);
            if (!friendNetwork.isEmpty()) {
                friendsList.add(friendNetwork);
            }
        }
        
        // 构建当前用户的网络数据
        networkData.put("account", user.getAccount());
        networkData.put("username", user.getUsername());
        networkData.put("avatar", userAvatarBase64);
        networkData.put("isonline", user.getIsonline());
        networkData.put("friends", friendsList);
    }
}
