package org.example.chat.model;

import java.io.Serializable;
import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.util.Objects;

@Embeddable
public class FriendId implements Serializable {

    @Column(name = "user_account", nullable = false, length = 20)
    private String user_account;

    @Column(name = "friend_account", nullable = false, length = 20)
    private String friend_account;

    public FriendId() {}

    public FriendId(String user_account, String friend_account) {
        this.user_account = user_account;
        this.friend_account = friend_account;
    }

    // Getters 和 Setters

    public String getUser_account() {
        return user_account;
    }

    public void setUser_account(String user_account) {
        this.user_account = user_account;
    }

    public String getFriend_account() {
        return friend_account;
    }

    public void setFriend_account(String friend_account) {
        this.friend_account = friend_account;
    }

    // 重写 equals 和 hashCode

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        FriendId friendId = (FriendId) o;

        return Objects.equals(user_account, friendId.user_account) &&
                Objects.equals(friend_account, friendId.friend_account);
    }

    @Override
    public int hashCode() {
        return Objects.hash(user_account, friend_account);
    }
}
