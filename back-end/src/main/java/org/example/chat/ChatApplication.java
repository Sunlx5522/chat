package org.example.chat;  // 定义包名为org.example.chat

// 导入所需的类和包
import org.springframework.boot.SpringApplication;  // Spring应用启动类
import org.springframework.boot.autoconfigure.SpringBootApplication;  // Spring Boot自动配置注解
import org.springframework.boot.CommandLineRunner;  // CommandLineRunner接口 用于执行初始化指令
import org.example.chat.model.User;  // User实体类
import org.example.chat.repository.UserRepository;  // UserRepository接口
import org.springframework.beans.factory.annotation.Autowired;  // 自动注入注解

import java.util.List;  // List集合类

@SpringBootApplication  // 标识这是一个Spring Boot应用程序，并启用自动配置和组件扫描
public class ChatApplication implements CommandLineRunner {  // 定义ChatApplication类，实现CommandLineRunner接口

    @Autowired  // 自动注入userRepository
    private UserRepository userRepository;  // UserRepository实例，用于数据库操作

    public static void main(String[] args) {  // 主方法，程序入口
        SpringApplication.run(ChatApplication.class, args);  // 启动Spring Boot应用程序
    }

    @Override  // 重写run方法
    public void run(String... args) throws Exception {  // 当应用启动完成后调用
        init();  // 调用初始化方法
    }

    private void init() {  // 初始化方法，处理用户状态
        List<User> allUsers = userRepository.findAll();  // 获取所有用户列表
        for (User u : allUsers) {  // 遍历用户列表
            if (u.getIsonline() == 1) {  // 如果用户在线
                u.setIsonline(0);  // 设置用户为离线
                userRepository.save(u);  // 保存用户状态
            }
        }
    }

}
