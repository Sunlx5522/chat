package org.example.chat.model;  // 指定该类所属的包名，按照项目的包结构组织代码，一般使用公司域名的反写形式。

import jakarta.persistence.*;  // 导入JPA中的所有类和注解，用于将Java类映射到数据库表，实现ORM（对象关系映射）。

@Entity  // 将该类声明为一个JPA实体，表示它与数据库中的一个表对应。
@Table(name = "users")  // 指定与该实体类映射的数据库表名为 "users"。
public class User {  // 定义一个公有的类User，表示用户实体。

    @Id  // 指定该字段为实体的主键，对应数据库表的主键列。
    @Column(name = "account", nullable = false, unique = true, length = 20)  // 将该字段映射到数据库表中的 "account" 列，并指定列的属性。
    private String account;  // 声明一个私有的字符串变量account，存储用户的账号。

    @Column(name = "password", nullable = false, length = 20)  // 将该字段映射到数据库表中的 "password" 列，并指定列的属性。
    private String password;  // 声明一个私有的字符串变量password，存储用户的密码。

    @Column(name = "username", nullable = false, length = 50)  // 将该字段映射到数据库表中的 "username" 列，并指定列的属性。
    private String username;  // 声明一个私有的字符串变量username，存储用户的用户名。

    @Column(name = "email", nullable = false, length = 50)  // 将该字段映射到数据库表中的 "email" 列，并指定列的属性。
    private String email;  // 声明一个私有的字符串变量email，存储用户的邮箱。

    @Column(name = "telephone", nullable = false, length = 20)  // 将该字段映射到数据库表中的 "telephone" 列，并指定列的属性。
    private String telephone;  // 声明一个私有的字符串变量telephone，存储用户的电话号码。

    @Column(name = "isonline", nullable = false)  // 将该字段映射到数据库表中的 "isonline" 列，并指定列的属性。
    private int isonline;  // 声明一个私有的整数变量isonline，表示用户的在线状态。

    public User() {}  // 定义一个公有的无参构造函数，JPA要求实体类必须有一个无参构造函数。

    public User(String account, String password, String username, String email, String telephone) {  // 定义一个带参构造函数，方便在创建新用户对象时初始化属性。
        this.account = account;  // 初始化账号字段。
        this.password = password;  // 初始化密码字段。
        this.username = username;  // 初始化用户名字段。
        this.email = email;  // 初始化邮箱字段。
        this.telephone = telephone;  // 初始化电话号码字段。
        this.isonline = 0;  // 初始化在线状态为0，表示离线。
    }

    // Getter 和 Setter 方法，用于访问和修改私有字段的值。

    public String getAccount() {  // 获取账号。
        return account;  // 返回账号字段的值。
    }

    public void setAccount(String account) {  // 设置账号。
        this.account = account;  // 将传入的账号赋值给account字段。
    }

    public String getPassword() {  // 获取密码。
        return password;  // 返回密码字段的值。
    }

    public void setPassword(String password) {  // 设置密码。
        this.password = password;  // 将传入的密码赋值给password字段。
    }

    public String getUsername() {  // 获取用户名。
        return username;  // 返回用户名字段的值。
    }

    public void setUsername(String username) {  // 设置用户名。
        this.username = username;  // 将传入的用户名赋值给username字段。
    }

    public String getEmail() {  // 获取邮箱。
        return email;  // 返回邮箱字段的值。
    }

    public void setEmail(String email) {  // 设置邮箱。
        this.email = email;  // 将传入的邮箱赋值给email字段。
    }

    public String getTelephone() {  // 获取电话号码。
        return telephone;  // 返回电话号码字段的值。
    }

    public void setTelephone(String telephone) {  // 设置电话号码。
        this.telephone = telephone;  // 将传入的电话号码赋值给telephone字段。
    }

    public int getIsonline() {  // 获取在线状态。
        return isonline;  // 返回isonline字段的值。
    }

    public void setIsonline(int isonline) {  // 设置在线状态。
        this.isonline = isonline;  // 将传入的在线状态赋值给isonline字段。
    }

}
