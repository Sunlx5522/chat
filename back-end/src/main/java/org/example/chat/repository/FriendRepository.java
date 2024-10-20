package org.example.chat.repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import org.example.chat.model.Friend;
import org.example.chat.model.FriendId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FriendRepository extends JpaRepository<Friend, FriendId> {

    @Query("SELECT f FROM Friend f WHERE f.id.user_account = :userAccount")
    List<Friend> findByUserAccount(@Param("userAccount") String userAccount);
}
