package org.example.chat.model;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.sql.Timestamp;
@Entity
@Table(name = "friend_requests")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class FriendRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)//todo:verify strategy correct
    private int request_id;

    @Column(nullable = false )
    private String sender_account;

    @Column(nullable = false)
    private String receiver_account;

    @Column(nullable = false)//todo:有没有default约束的对应属性？
    private Timestamp request_time;//来源:https://blog.csdn.net/qq_16605855/article/details/80656211

    @Column(nullable = false)//todo:同上
    private String status;
}
