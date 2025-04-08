package org.example.chat.repository;  // 指定该接口所属的包名，组织代码结构，便于管理和查找。

import org.example.chat.model.User;  // 导入自定义的User实体类，代表数据库中的用户表。
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;  // 导入Spring Data JPA提供的JpaRepository接口，包含了基本的CRUD操作方法。
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface UserRepository extends JpaRepository<User, String> {  // 定义一个名为UserRepository的接口，继承自JpaRepository，泛型参数<User, String>指定了实体类型为User，主键类型为String。

    User findByAccount(String account);  // 根据账号查找用户的方法，方法名遵循Spring Data JPA的命名规范，框架会自动生成实现代码

    Page<User> findByIsAdminFalse(Pageable pageable);
    
    // 按账号查询非管理员用户
    Page<User> findByAccountContainingAndIsAdminFalse(String account, Pageable pageable);
    
    // 按用户名查询非管理员用户
    Page<User> findByUsernameContainingAndIsAdminFalse(String username, Pageable pageable);
    
    // 同时按账号和用户名查询非管理员用户
    Page<User> findByAccountContainingAndUsernameContainingAndIsAdminFalse(String account, String username, Pageable pageable);

    // 查询用户的好友列表
    @Query("SELECT u FROM User u WHERE u.account IN (SELECT f.id.friend_account FROM Friend f WHERE f.id.user_account = :account)")
    List<User> findFriendsByAccount(@Param("account") String account);
}
