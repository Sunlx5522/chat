package org.example.chat.model;

import jakarta.persistence.*;

@Entity
@Table(name = "friends")
public class Friend {

    @EmbeddedId
    private FriendId id;

    public Friend() {}

    public Friend(FriendId id) {
        this.id = id;
    }

    // Getters 和 Setters

    public FriendId getId() {
        return id;
    }

    public void setId(FriendId id) {
        this.id = id;
    }

    // 方便访问 user_account 和 friend_account

    public String getUser_account() {
        return id.getUser_account();
    }

    public void setUser_account(String user_account) {
        id.setUser_account(user_account);
    }

    public String getFriend_account() {
        return id.getFriend_account();
    }

    public void setFriend_account(String friend_account) {
        id.setFriend_account(friend_account);
    }
}
