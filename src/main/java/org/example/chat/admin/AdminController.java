package org.example.chat.admin;

import org.springframework.web.bind.annotation.*;
import org.example.chat.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    AdminService as;

    @Autowired
    public AdminController(AdminService adminService) {
        as = adminService;
    }

    // 获取所有用户信息
    @GetMapping("/users")
    public PageResult usersPage(@RequestParam(defaultValue = "1") int pageNo,
                                @RequestParam(defaultValue = "10") int pageSize,
                                @RequestParam(required = false) String account,
                                @RequestParam(required = false) String username) {
        return as.getCommonUsers(pageNo, pageSize, account, username);
    }

    // 获取管理员信息
    @GetMapping("/info")
    public User getAdminInfo(String account) {//简单参数无需@RequestParam
        User admin = as.getAdminInfo(account);
        return admin;
    }

    @PostMapping("/logout")
    public String logout(String account) {
        boolean success = as.logout(account);  // 根据账号从数据库查找用户
        return success ? "success" : "fail";
    }
    
    // 抹除用户头像
    @PostMapping("/eraseAvatar")
    public String eraseAvatar(String account) {
        boolean success = as.eraseAvatar(account);
        return success ? "success" : "fail";
    }
    
    // 抹除用户名
    @PostMapping("/eraseUsername")
    public String eraseUsername(String account) {
        boolean success = as.eraseUsername(account);
        return success ? "success" : "fail";
    }

    // 获取用户好友关系
    @GetMapping("/friends")
    public Map<String, Object> getUserFriends(String account) {
        return as.getUserFriends(account);
    }

    // 获取用户完整好友网络（包括间接好友）
    @GetMapping("/friendNetwork")
    public Map<String, Object> getUserFriendNetwork(String account) {
        return as.getUserFriendNetwork(account);
    }

    // 获取访问量统计
    @GetMapping("/visits")
    public Map<String, Object> getVisits() {
        return as.getDailyVisits();
    }
}