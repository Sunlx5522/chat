package org.example.chat;
// 指定该类所属的包名，需要根据项目包结构进行修改

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
// 导入Spring Boot框架的核心类，用于引导和自动配置Spring应用程序

@SpringBootApplication
// @SpringBootApplication是一个组合注解，包含了@SpringBootConfiguration、@EnableAutoConfiguration和@ComponentScan
// 标识这是一个Spring Boot应用的主配置类，并启用自动配置和组件扫描

public class ChatApplication {
// 定义主应用程序类ChatApplication

    public static void main(String[] args) {
        // 主方法，是Java应用程序的入口点

        SpringApplication.run(ChatApplication.class, args);
        // 使用SpringApplication.run方法启动Spring Boot应用程序
        // 参数是主应用程序类ChatApplication.class和命令行参数args

    }

}
