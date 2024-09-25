package org.example.chat.repository;
// 指定该接口所属的包名，组织代码结构，便于管理和查找。
// 这里表示该接口位于 org.example.chat.repository 包中。

import org.example.chat.model.User;
// 导入自定义的 User 实体类，代表数据库中的用户表。

import org.springframework.data.jpa.repository.JpaRepository;
// 导入 Spring Data JPA 提供的 JpaRepository 接口，包含了基本的 CRUD 操作方法。

public interface UserRepository extends JpaRepository<User, String> {
    // 定义一个名为 UserRepository 的接口，继承自 JpaRepository。
    // 这是一个仓库接口（Repository），用于与数据库进行交互操作。
    // 泛型参数 <User, String> 指定了实体类型为 User，主键类型为 String。

    // 根据账号查找用户
    User findByAccount(String account);
    // 声明一个方法 findByAccount，用于根据用户的账号（account）从数据库中查找对应的用户。
    // 方法名遵循 Spring Data JPA 的命名规范，框架会自动生成实现代码。
    // 如果找到匹配的用户，返回 User 对象；如果未找到，返回 null。
}

