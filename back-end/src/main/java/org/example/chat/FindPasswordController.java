package org.example.chat;  // 指定该类所属的包名，需要根据项目包结构进行修改，一般使用公司域名的反写形式，确保包名的唯一性。

import org.springframework.web.bind.annotation.*;  // 导入Spring框架中用于处理Web请求和响应的注解和类。

import org.example.chat.model.User;  // 导入自定义的User实体类，映射数据库中的用户表。
import org.example.chat.repository.UserRepository;  // 导入自定义的UserRepository接口，用于与数据库进行交互操作。
import org.springframework.beans.factory.annotation.Autowired;  // 需要将userRepository注入到findPasswordController中，可以使用字段注入。

import java.util.Map;  // 导入Java集合框架中的Map接口，用于存储键值对数据。

@RestController  // @RestController是一个复合注解，标记该类为RESTful控制器，相当于同时使用了@Controller和@ResponseBody，表示该类中的方法返回值会直接作为HTTP响应体。
@RequestMapping("/api")  // 可选，添加一个统一的请求前缀。@RequestMapping用于定义请求路径的前缀，这里的所有请求路径都会以"/api"开头，这样可以统一管理和组织接口路径，方便前端调用和维护。
@CrossOrigin(origins = "*")  // 允许跨域请求，origins可以指定前端地址。@CrossOrigin用于解决跨域请求的问题，origins属性指定允许的源，这里设置为"*"表示允许所有来源。

public class FindPasswordController {  // 定义一个名为findPasswordController的控制器类，处理与找回密码相关的请求。

    @Autowired  // 添加此注解，实现自动注入。
    private UserRepository userRepository;  // 声明一个UserRepository类型的成员变量，用于与数据库进行交互操作，例如查询用户信息。

    @PostMapping("/findPassword")  // @PostMapping注解用于将HTTP POST请求映射到特定的处理方法上，这里映射到"/findPassword"路径。
    public String findPassword(@RequestBody Map<String, String> loginData) {  // 定义一个public类型的findPassword方法，返回值为String类型。使用@RequestBody注解将请求体中的JSON数据自动转换为Map<String, String>类型的loginData参数。

        String account = loginData.get("account");  // 从loginData中获取键为"account"的值，即用户提交的账号。
        String email = loginData.get("email");  // 从loginData中获取键为"email"的值，即用户提交的邮箱。
        String phoneNumber = loginData.get("phoneNumber");  // 从loginData中获取键为"phoneNumber"的值，即用户提交的电话号码。

        System.out.println("收到找回密码请求：账号=" + account + "，邮箱=" + email + "，电话号码=" + phoneNumber);  // 在服务器控制台打印收到的找回密码请求信息，方便调试和日志记录。

        User user = userRepository.findByAccount(account);  // 从数据库中查找用户。

        if (user == null) {  // 如果用户不存在。
            System.out.println("找回失败");
            return "null";  // 返回"null"，表示用户不存在。
        } else if (user.getEmail().equals(email) && user.getTelephone().equals(phoneNumber)) {  // 如果邮箱和电话号码匹配。
            System.out.println("找回成功");
            return user.getPassword();  // 返回用户的密码。
        } else {  // 如果信息不匹配。
            return "error";  // 返回"error"，表示信息不匹配。
        }
    }

}
