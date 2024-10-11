
package org.example.chat;

import org.example.chat.model.User;
import org.example.chat.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")

public class updateInfoController {
    @Autowired
    private UserRepository userRepository;

    @PostMapping("/updateInfo")
    public String updateInfo(@RequestBody Map<String, String> updateData) {
        String userId = updateData.get("userId");

        System.out.println("收到修改信息请求");
        // 使用 userId 查找用户
        Optional<User> optionalUser = userRepository.findById(userId);

        if (optionalUser.isPresent()) {
            User user = optionalUser.get();

            // 更新用户信息
            String newName = updateData.get("newName");
            String newEmail = updateData.get("newEmail");
            String newPhone = updateData.get("newPhoneNumber");

            user.setName(newName);
            user.setEmail(newEmail);
            user.setPhoneNumber(newPhone);

            // 保存更新后的用户
            userRepository.save(user);
            return "修改成功！ ";
        } else {
            return "用户不存在！ ";
        }
    }
}