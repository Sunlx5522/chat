package org.example.chat;

import org.example.chat.model.User;
import org.example.chat.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api")


public class UpdatePasswordController {
    @Autowired
    private UserRepository userRepository;

    @PostMapping("/updatePassword")
    public String updatePassword(@RequestBody Map<String, String> updateData) {

        String userId = updateData.get("id");
        String oldPassword = updateData.get("oldPassword");
        System.out.println("收到修改密码请求");
        // 使用 userId 查找用户

        Optional<User> optionalUser = userRepository.findById(userId);


        if (optionalUser.isPresent()) {
            User user = optionalUser.get();

            // 更新用户密码

            if (!user.getPassword().equals(oldPassword)) {
                return "wrong";
            }
            String newPassword = updateData.get("newPassword");
            user.setPassword(newPassword);

            // 保存更新后的用户
            userRepository.save(user);
            return "yes";
        } else {
            return "null";
        }
    }
}