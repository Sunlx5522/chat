package org.example.chat;  // 指定该类所属的包名，需要根据项目包结构进行修改，一般使用公司域名的反写形式，确保包名的唯一性。

import org.springframework.web.bind.annotation.*;              // 导入Spring框架中用于处理Web请求和响应的注解和类

import org.example.chat.model.User;            // 导入自定义的User实体类，映射数据库中的用户表。
import org.example.chat.repository.UserRepository;  // 导入自定义的UserRepository接口，用于与数据库进行交互操作。
import org.springframework.beans.factory.annotation.Autowired;  // 需要将userRepository注入到SignUpController中，可以使用字段注入

import java.util.Random;  // 导入Java中的Random类，用于随机生成账号
import java.util.Map;     // 导入Java集合框架中的Map接口，用于存储键值对数据。

import java.security.SecureRandom; // 伪随机数生成

@RestController  // @RestController是一个复合注解，标记该类为RESTful控制器，相当于同时使用了@Controller和@ResponseBody，表示该类中的方法返回值会直接作为HTTP响应体
@RequestMapping("/api")  // 可选，添加一个统一的请求前缀。@RequestMapping用于定义请求路径的前缀，这里的所有请求路径都会以"/api"开头，这样可以统一管理和组织接口路径，方便前端调用和维护。
// 允许跨域请求，origins可以指定前端地址。@CrossOrigin用于解决跨域请求的问题，origins属性指定允许的源，这里设置为"*"表示允许所有来源
public class SignUpController {  // 定义一个名为SignUpController的控制器类，处理与注册相关的请求

    @Autowired  // 添加此注解，实现自动注入
    private UserRepository userRepository;  // 声明一个UserRepository类型的成员变量，用于与数据库进行交互操作，例如查询和保存用户信息。

    @PostMapping("/signUp")
    // @PostMapping注解用于将HTTP POST请求映射到特定的处理方法上，这里映射到"/signUp"路径，表示当收到POST方式的"/api/signUp"请求时，由signUp方法进行处理。
    public String signUp(@RequestBody Map<String, String> signUpData) {  // 定义一个public类型的signUp方法，返回值为String类型。使用@RequestBody注解将请求体中的JSON数据自动转换为Map<String, String>类型的signUpData参数。

        String username = signUpData.get("username");  // 从signUpData中获取键为"username"的值，即用户提交的用户名。
        String signUpPassword = signUpData.get("signUpPassword");  // 从signUpData中获取键为"signUpPassword"的值，即用户提交的注册密码。
        String email = signUpData.get("email");  // 从signUpData中获取键为"email"的值，即用户提交的邮箱。
        String phoneNumber = signUpData.get("phoneNumber");  // 从signUpData中获取键为"phoneNumber"的值，即用户提交的电话号码。

        System.out.println("收到注册请求：用户名=" + username + "，密码=" + signUpPassword + "，邮箱=" + email + "，电话号码=" + phoneNumber);  // 在服务器控制台打印收到的注册请求信息，方便调试和日志记录。

        // 生成一个唯一的10位纯数字账号
        String account = generateUniqueAccount();  // 调用generateUniqueAccount方法生成一个唯一的账号

        // 创建一个新的用户对象
        User newUser = new User(account, signUpPassword, username, email, phoneNumber);  // 使用获取到的信息创建一个新的User对象

        userRepository.save(newUser);  // 将新用户保存到数据库中

        return "new" + account;  // 返回生成的账号给前端
    }

    // 生成唯一10位纯数字账号的方法
    private String generateUniqueAccount() {  // 定义一个私有方法generateUniqueAccount，用于生成唯一的10位账号
        SecureRandom secureRandom = new SecureRandom();
        String account;
        boolean exists;

        do {
            // 生成一个10位的数字，确保第一位不为0
            int firstDigit = secureRandom.nextInt(9) + 1; // 确保第一位在 1-9 之间
            int remainingDigits = secureRandom.nextInt(100_000_000); // 生成剩余的9位数字
            account = String.format("%d%08d", firstDigit, remainingDigits); // 拼接第一位和剩余的数字，保证总共10位
            exists = userRepository.findByAccount(account) != null;
        } while (exists);

        System.out.println("新账号：" + account);  // 待
        return account;
    }

}
