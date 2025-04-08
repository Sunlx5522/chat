package org.example.chat.admin;

import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Controller;
import java.util.Map;
import java.util.HashMap;
import java.util.List;
import java.util.ArrayList;

@RestController
@RequestMapping("/api/admin/monitor")
public class MonitorController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @GetMapping("/database")
    public Map<String, Object> getDatabaseMetrics() {
        Map<String, Object> metrics = new HashMap<>();
        
        try {
            // 获取活跃连接数（正在执行查询的连接）
            Integer activeConnections = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM information_schema.processlist WHERE Command != 'Sleep'",
                Integer.class
            );
            metrics.put("activeConnections", activeConnections);

            // 获取总连接数
            Integer totalConnections = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM information_schema.processlist",
                Integer.class
            );
            metrics.put("totalConnections", totalConnections);

            // 获取最大连接数
            Integer maxConnections = jdbcTemplate.queryForObject(
                "SELECT @@max_connections",
                Integer.class
            );
            metrics.put("maxConnections", maxConnections);
            
            // 获取表大小
            List<Map<String, Object>> tableSizes = jdbcTemplate.queryForList(
                "SELECT table_name, " +
                "ROUND(((data_length + index_length) / 1024 / 1024), 2) AS size_mb " +
                "FROM information_schema.tables " +
                "WHERE table_schema = 'chat'"
            );
            metrics.put("tableSizes", tableSizes);
        } catch (Exception e) {
            // 如果查询失败，设置默认值
            metrics.put("activeConnections", 0);
            metrics.put("totalConnections", 0);
            metrics.put("maxConnections", 0);
            metrics.put("tableSizes", new ArrayList<>());
        }
        
        return metrics;
    }

    @GetMapping("/application")
    public Map<String, Object> getApplicationMetrics() {
        Map<String, Object> metrics = new HashMap<>();
        
        try {
            // 获取在线用户数
            Integer onlineUsers = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM users WHERE isonline = 1",
                Integer.class
            );
            metrics.put("onlineUsers", onlineUsers);
            
            // 获取消息总数
            Integer totalMessages = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM messages",
                Integer.class
            );
            metrics.put("todayMessages", totalMessages);
            
            // 获取好友请求总数
            Integer totalFriendRequests = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM friend_requests",
                Integer.class
            );
            metrics.put("todayFriendRequests", totalFriendRequests);
        } catch (Exception e) {
            // 如果查询失败，设置默认值
            metrics.put("onlineUsers", 0);
            metrics.put("todayMessages", 0);
            metrics.put("todayFriendRequests", 0);
            e.printStackTrace();
        }
        
        return metrics;
    }
} 