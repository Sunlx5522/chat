package org.example.chat.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.*;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")  // 适用于所有 /api/ 路径下的接口
                .allowedOrigins("https://frp-fee.top:17459")  // 替换为您的前端域名
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("Content-Type", "Authorization")
                .allowCredentials(false)  // 如果不需要发送凭证，设置为 false
                .maxAge(3600);  // 预检请求的缓存时间（秒）
    }
}