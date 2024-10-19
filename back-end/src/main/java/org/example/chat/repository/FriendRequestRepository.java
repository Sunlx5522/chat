package org.example.chat.repository;
import org.example.chat.model.FriendRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

public interface FriendRequestRepository extends JpaRepository<FriendRequest, Integer> {

}
