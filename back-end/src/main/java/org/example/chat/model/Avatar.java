package org.example.chat.model;  // 指定该类所属的包名，按照项目的包结构组织代码，一般使用公司域名的反写形式。

import jakarta.persistence.*;  // 导入JPA中的所有类和注解，用于将Java类映射到数据库表，实现ORM（对象关系映射）。

@Entity  // 将该类声明为一个JPA实体，表示它与数据库中的一个表对应。
@Table(name = "avatar")  // 指定与该实体类映射的数据库表名为 "users"。
public class Avatar {  // 定义一个公有的类User，表示用户实体。

    @Id  // 指定该字段为实体的主键，对应数据库表的主键列。
    @Column(name = "account", nullable = false, unique = true, length = 20)  // 将该字段映射到数据库表中的 "account" 列，并指定列的属性。
    private String account;  // 声明一个私有的字符串变量account，存储用户的账号。

    @Column(name = "avatar_path", nullable = true, length = 255)  // 将该字段映射到数据库表中的 "avatar_path" 列，并指定列的属性。
    private String avatar_path;  // 声明一个私有的字符串变量password，存储用户的密码。

    public Avatar() {}  // 定义一个公有的无参构造函数，JPA要求实体类必须有一个无参构造函数。

    public Avatar(String account, String avatar_path) {  // 定义一个带参构造函数，方便在创建新用户对象时初始化属性。
        this.account = account;  // 初始化账号字段。
        this.avatar_path = avatar_path;  // 初始化密码字段。
    }

    // Getter 和 Setter 方法，用于访问和修改私有字段的值。

    public String getAccount() {  // 获取账号。
        return account;  // 返回账号字段的值。
    }

    public void setAccount(String account) {  // 设置账号。
        this.account = account;  // 将传入的账号赋值给account字段。
    }

    public String getAvatar_path() {  // 获取密码。
        return avatar_path;  // 返回头像路径字段的值。
    }

    public void setAvatar_path(String avatar_path) {  // 设置密码。
        this.avatar_path = avatar_path;  // 将传入的密码赋值给avatar_path字段。
    }

}
