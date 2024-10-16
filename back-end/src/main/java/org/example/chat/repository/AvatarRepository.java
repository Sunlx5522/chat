package org.example.chat.repository;  // 指定该接口所属的包名，组织代码结构，便于管理和查找。

import org.example.chat.model.Avatar;  // 导入自定义的User实体类，代表数据库中的用户表。
import org.springframework.data.jpa.repository.JpaRepository;  // 导入Spring Data JPA提供的JpaRepository接口，包含了基本的CRUD操作方法。

public interface AvatarRepository extends JpaRepository<Avatar, String> {  // 定义一个名为UserRepository的接口，继承自JpaRepository，泛型参数<User, String>指定了实体类型为User，主键类型为String。

    Avatar findByAccount(String account);  // 根据账号查找用户的方法，方法名遵循Spring Data JPA的命名规范，框架会自动生成实现代码

}