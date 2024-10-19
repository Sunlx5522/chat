package org.example.chat.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.sql.Timestamp;

@Entity
@Table(name = "friends")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Friends {

    @Column(name = "user_account", length = 20)
    @Id
    private String friendA;

    @Id
    @Column(name = "friend_account", length = 20)
    private String friendB;

    @Column(name = "friendship_time")
    private Timestamp created;
}
