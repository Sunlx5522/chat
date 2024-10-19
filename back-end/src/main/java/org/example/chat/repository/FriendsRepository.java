package org.example.chat.repository;

import org.example.chat.model.Friends;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.HashSet;

public interface FriendsRepository extends JpaRepository<Friends, HashSet<String>> {//todo:复合主键的JPA类型？

}
