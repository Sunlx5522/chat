package org.example.chat;

import org.example.chat.model.FriendRequest;
import org.example.chat.repository.FriendRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController  // @RestController是一个复合注解，标记该类为RESTful控制器，相当于同时使用了@Controller和@ResponseBody，表示该类中的方法返回值会直接作为HTTP响应体。
@RequestMapping("/api")  // 可选，添加一个统一的请求前缀。@RequestMapping用于定义请求路径的前缀，这里的所有请求路径都会以"/api"开头，这样可以统一管理和组织接口路径，方便前端调用和维护。
@CrossOrigin(origins = "*")  // 允许跨域请求，origins可以指定前端地址。@CrossOrigin用于解决跨域请求的问题，origins属性指定允许的源，这里设置为"*"表示允许所有来源。
public class AddFriendsController {
    @Autowired
    private FriendRequestRepository friendRequest;

    @PostMapping("/...")//todo：确定url
    public String sendRequest(@RequestBody Map<String,String> friendRequestData) {//todo:请选择方案：1.将自己的账号封装入json数据发送给后端。2.后端自动匹配登录账号
        //暂定为方案1
        String receiver = friendRequestData.get("receiver");  // 从signUpData中获取键为"username"的值，即用户提交的用户名。
        String sender = friendRequestData.get("sender");  // 从signUpData中获取键为"signUpPassword"的值，即用户提交的注册密码。

        System.out.println("加好友请求：发送方=" + sender + "，接收方=" + receiver);  // 在服务器控制台打印收到的注册请求信息，方便调试和日志记录。

        FriendRequest request=new FriendRequest(sender,receiver, LocalDateTime,"pending");

        return "error";
    }

}
