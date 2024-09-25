package org.example.chat.config; // 定义类所在的包

import org.springframework.context.annotation.Configuration; // 导入@Configuration注解
import org.springframework.web.socket.config.annotation.EnableWebSocket; // 导入@EnableWebSocket注解
import org.springframework.web.socket.config.annotation.WebSocketConfigurer; // 导入WebSocketConfigurer接口
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry; // 导入WebSocketHandlerRegistry类
import org.example.chat.handler.YourWebSocketHandler; // 确保导入YourWebSocketHandler
import org.springframework.beans.factory.annotation.Autowired;

@Configuration // 标记该类为配置类
@EnableWebSocket // 启用WebSocket支持
public class WebSocketConfig implements WebSocketConfigurer { // 实现WebSocketConfigurer接口

    @Autowired
    private YourWebSocketHandler yourWebSocketHandler;

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) { // 注册WebSocket处理器
        // 将YourWebSocketHandler注册到"/ws"路径
        registry.addHandler(yourWebSocketHandler, "/ws").setAllowedOrigins("*"); // 允许所有来源连接
    }
}
