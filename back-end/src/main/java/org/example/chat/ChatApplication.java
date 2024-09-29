package org.example.chat;
// 指定该类所属的包名，需要根据项目包结构进行修改

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
// 导入Spring Boot框架的核心类，用于引导和自动配置Spring应用程序

import org.springframework.boot.CommandLineRunner;

import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.web.bind.annotation.*;

import org.example.chat.model.User;

import org.example.chat.repository.UserRepository;

import java.util.List;

@SpringBootApplication
// @SpringBootApplication是一个组合注解，包含了@SpringBootConfiguration、@EnableAutoConfiguration和@ComponentScan
// 标识这是一个Spring Boot应用的主配置类，并启用自动配置和组件扫描

public class ChatApplication implements CommandLineRunner {
// 定义主应用程序类ChatApplication

    @Autowired
    private UserRepository userRepository;  // 非静态字段，可以通过Spring的依赖注入正常初始化

    public static void main(String[] args) {
        // 主方法，是Java应用程序的入口点

        SpringApplication.run(ChatApplication.class, args);
        // 使用SpringApplication.run方法启动Spring Boot应用程序
        // 参数是主应用程序类ChatApplication.class和命令行参数args

    }

    // 当应用启动并且Spring完成依赖注入后，会调用这个run方法
    @Override
    public void run(String... args) throws Exception {
        init();  // 此时userRepository已经被Spring注入，可以安全使用
    }

    // 非静态方法，处理所有在线用户的状态
    private void init() {
        List<User> allUsers = userRepository.findAll();
        for (User u : allUsers) {
            if (u.getIsonline() == 1) {
                u.setIsonline(0);
                userRepository.save(u);
            }
        }
    }

}
