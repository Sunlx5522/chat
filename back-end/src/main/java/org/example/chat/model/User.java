package org.example.chat.model;
// 指定该类所属的包名，按照项目的包结构组织代码。
// 这里表示该类属于 org.example.chat.model 包。

import jakarta.persistence.*;
// 导入 JPA（Jakarta Persistence API）中的所有类和注解。
// 这些注解用于将 Java 类映射到数据库表，实现 ORM（对象关系映射）。

@Entity
// 将该类声明为一个 JPA 实体（Entity），表示它与数据库中的一个表对应。

@Table(name = "users")
// 指定与该实体类映射的数据库表名为 "users"。
// 如果不指定，默认表名与类名相同。

public class User {
    // 定义一个公有的类 User，表示用户实体。

    @Id
    // 指定该字段为实体的主键，对应数据库表的主键列。

    @Column(name = "account", nullable = false, unique = true, length = 20)
    // 将该字段映射到数据库表中的 "account" 列，并指定列的属性：
    // - nullable = false：该列不能为空。
    // - unique = true：该列的值必须唯一，不能有重复。
    // - length = 20：指定字符串的最大长度为 20 个字符。

    private String account;
    // 声明一个私有的字符串变量 account，存储用户的账号。

    @Column(name = "password", nullable = false, length = 20)
    // 将该字段映射到数据库表中的 "password" 列，并指定列的属性：
    // - nullable = false：该列不能为空。
    // - length = 20：指定字符串的最大长度为 20 个字符，通常用于存储加密后的密码。

    private String password;
    // 声明一个私有的字符串变量 password，存储用户的密码。

    @Column(name = "username", nullable = false, length = 50)
    // 将该字段映射到数据库表中的 "username" 列，并指定列的属性：
    // - nullable = false：该列不能为空。
    // - length = 50：指定字符串的最大长度为 50 个字符，通常用于存储加密后的用户名。

    private String username;
    // 声明一个私有的字符串变量 username，存储用户的密码。

    @Column(name = "email", nullable = false, length = 50)
    // 将该字段映射到数据库表中的 "email" 列，并指定列的属性：
    // - nullable = false：该列不能为空。
    // - length = 50：指定字符串的最大长度为 50 个字符，通常用于存储加密后的邮箱。

    private String email;
    // 声明一个私有的字符串变量 username，存储用户的密码。

    @Column(name = "telephone", nullable = false, length = 20)
    // 将该字段映射到数据库表中的 "telephone" 列，并指定列的属性：
    // - nullable = false：该列不能为空。
    // - length = 20：指定字符串的最大长度为 20 个字符，通常用于存储加密后的电话。

    private String telephone;
    // 声明一个私有的字符串变量 username，存储用户的电话。

    @Column(name = "isonline", nullable = false)
    // 在线状态

    private int isonline;
    // 在线状态

    // 无参构造函数
    public User() {}
    // 定义一个公有的无参构造函数。
    // JPA 要求实体类必须有一个无参构造函数，用于在从数据库中加载数据时实例化对象。

    // 带参构造函数
    public User(String account, String password,String username,String email,String telephone) {
        // 定义一个带有账号和密码参数的构造函数，方便在创建新用户对象时初始化属性。

        this.account = account;
        this.password = password;
        this.username = username;
        this.email = email;
        this.telephone = telephone;
        this.isonline = 0;
    }

    // Getter 和 Setter 方法
    public String getAccount() {
        return account;
    }

    public void setAccount(String account) {
        this.account = account;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getTelephone() {
        return telephone;
    }

    public void setTelephone(String telephone) {
        this.telephone = telephone;
    }

    public int getIsonline() {
        return isonline;
    }

    public void setIsonline(int isonline) {
        this.isonline = isonline;
    }


}
