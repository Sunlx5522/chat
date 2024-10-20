package org.example.chat.model;  // 指定该类所属的包名，按照项目的包结构组织代码，一般使用公司域名的反写形式。

import jakarta.persistence.*;  // 导入JPA中的所有类和注解，用于将Java类映射到数据库表，实现ORM（对象关系映射）。

@Entity  // 将该类声明为一个JPA实体，表示它与数据库中的一个表对应。
@Table(name = "friend_requests")  // 指定与该实体类映射的数据库表名为 "users"。
public class Request {  // 定义一个公有的类User，表示用户实体。

    @Id  // 指定该字段为实体的主键，对应数据库表的主键列。
    @Column(name = "request_id", nullable = false, unique = true)  // 将该字段映射到数据库表中的 "account" 列，并指定列的属性。
    private int request_id;  // 声明一个私有的字符串变量account，存储用户的账号。

    @Column(name = "sender_account", nullable = false, length = 20)  // 将该字段映射到数据库表中的 "password" 列，并指定列的属性。
    private String sender_account;  // 声明一个私有的字符串变量password，存储用户的密码。

    @Column(name = "receiver_account", nullable = false, length = 20)  // 将该字段映射到数据库表中的 "username" 列，并指定列的属性。
    private String receiver_account;  // 声明一个私有的字符串变量username，存储用户的用户名。

    @Column(name = "status", nullable = false, length = 10)  // 将该字段映射到数据库表中的 "email" 列，并指定列的属性。
    private String status;  // 声明一个私有的字符串变量email，存储用户的邮箱。

    public Request() {
    }  // 定义一个公有的无参构造函数，JPA要求实体类必须有一个无参构造函数。

    public Request(String sender_account, String receiver_account) {  // 定义一个带参构造函数，方便在创建新用户对象时初始化属性。
        this.sender_account = sender_account;  // 初始化账号字段。
        this.receiver_account = receiver_account;  // 初始化密码字段。
        this.status = "pending";  // 初始化用户名字段。
    }

    // Getter 和 Setter 方法，用于访问和修改私有字段的值。

    public String getSender_account() {  // 获取账号。
        return sender_account;  // 返回账号字段的值。
    }

    public void setSender_account(String sender_account) {  // 设置账号。
        this.sender_account = sender_account;  // 将传入的账号赋值给account字段。
    }

    public String getReceiver_account() {  // 获取密码。
        return receiver_account;  // 返回密码字段的值。
    }

    public void setReceiver_account(String receiver_account) {  // 设置密码。
        this.receiver_account = receiver_account;  // 将传入的密码赋值给password字段。
    }

    public String getStatus() {  // 获取用户名。
        return status;  // 返回用户名字段的值。
    }

    public void setStatus(String status) {  // 设置用户名。
        this.status = status;  // 将传入的用户名赋值给username字段。
    }

}
