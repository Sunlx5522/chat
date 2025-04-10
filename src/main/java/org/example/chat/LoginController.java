package org.example.chat;  // 定义包名，根据项目包结构进行修改

import org.springframework.web.bind.annotation.*;  // 导入Spring Web注解和类
import org.springframework.jdbc.core.JdbcTemplate; // 导入JdbcTemplate用于SQL操作

import org.example.chat.model.User;  // 导入User实体类，映射数据库中的用户表管理员


import org.example.chat.repository.UserRepository;  // 导入UserRepository接口，用于数据库交互


import org.springframework.beans.factory.annotation.Autowired;  // 导入@Autowired注解，用于自动注入依赖

import java.util.Map;  // 导入Map接口，用于存储键值对数据

@RestController  // 标记该类为RESTful控制器
@RequestMapping("/api")  // 定义请求路径的前缀为"/api"


public class LoginController {  // 定义LoginController类，处理登录请求 哈哈哈

    @Autowired  // 自动注入userRepository实例
    private UserRepository userRepository;  // 声明UserRepository变量，用于数据库操作
    
    @Autowired  // 自动注入jdbcTemplate实例
    private JdbcTemplate jdbcTemplate;  // 声明JdbcTemplate变量，用于SQL操作

    @PostMapping("/login")  // 将POST请求映射到"/login"路径
    public String login(@RequestBody Map<String, String> loginData) {  // 定义login方法，接收请求体中的JSON数据

        String account = loginData.get("account");  // 获取提交的账号
        String password = loginData.get("password");  // 获取提交的密码

        System.out.println("收到登录请求：账号=" + account + "，密码=" + password);  // 打印登录请求信息

        User user = userRepository.findByAccount(account);  // 根据账号从数据库查找用户

        if (user == null) {  // 如果用户不存在
            System.out.println("登录失败：账号不存在");  // 待
            return "noAccount";  // 返回登录失败消息
        }

        if (user.getIsonline() == 1) {  // 如果用户已在线
            System.out.println("登录失败：重复登陆 重置用户在线状态");
            user.setIsonline(0);  // 设置用户在线状态为0
            userRepository.save(user);  // 保存用户状态到数据库
            return "repeat";  // 返回"repeat"，表示重复登录
        }

        if (user.getPassword().equals(password)) {  // 如果密码匹配
            user.setIsonline(1);  // 设置用户为在线状态
            userRepository.save(user);  // 保存用户状态
            System.out.println("登录成功");
            // 记录访问量
            jdbcTemplate.update(
                "INSERT INTO daily_visits (visit_date, visit_count) " +
                "VALUES (CURDATE(), 1) " +
                "ON DUPLICATE KEY UPDATE visit_count = visit_count + 1");
            
            if (user.isAdmin()) {
                return "admin";  // 如果是管理员，返回 "admin"
            } else {
                return "user";   // 如果是普通用户，返回 "user"
            }
        } else {  // 如果密码不匹配
            System.out.println("登录失败：密码错误");
            return "noPassword";  // 返回登录失败消息
        }
    }

}