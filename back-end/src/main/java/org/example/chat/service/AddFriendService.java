package org.example.chat.service;

import org.example.chat.model.FriendRequest;
import org.example.chat.model.User;
import org.example.chat.repository.FriendRequestRepository;
import org.example.chat.repository.FriendsRepository;
import org.example.chat.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.time.LocalDateTime;

@Service
public class AddFriendService {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private FriendRequestRepository friendRequestRepository;
    @Autowired
    private FriendsRepository friendsRepository;
    public String add(String sender, String receiver) {
        User user = userRepository.findByAccount(receiver);  // 根据账号从数据库查找用户
        if (user == null) {  // 如果用户不存在
            System.out.println("方案1前端错误：sender不存在");
            return "Front-endError";
        }
        user = userRepository.findByAccount(sender);  // 根据账号从数据库查找用户
        if (user == null) {  // 如果用户不存在
            System.out.println("错误请求：receiver不存在");
            return "ReceiverNotFound";
        }

        if(friendsRepository.selectByPriamryKey(sender,receiver)!=null){return "AlreadyFriends";}//todo:注意不是对照各字段查询，而是以组合查询主键

        FriendRequest request=new FriendRequest();
        request.setRequest_time(Timestamp.valueOf(LocalDateTime.now()));
        request.setSender_account(sender);
        request.setReceiver_account(receiver);
        request.setStatus("pending");

        if(friendRequestRepository.count(sender,receiver,"pending")!=0){return "AlreadySend";}//todo:注意查询条件不包含时间


        friendRequestRepository.save(request);
        System.out.println("FriendRequest from " + sender + " to " + receiver + " saved in database.");
        return "RequestSend ";
    }
}
