# chat

本项目为一个简易的 HTML5 工程，包含用户系统、管理员系统，使用 Maven 进行编译与运行。

## 数据库的构建

在我们的文件夹目录中有sql文件夹。
进入到该文件夹中。 `cd sql`
在该目录下进入mysql。
执行数据库指令：

1. `source chat的数据库构建.sql`
2. `source 创建测试用户.sql`
执行上述命令后，便完成了数据库的构建。

之后进入到项目的配置文件(.\src\main\resources\application.properties)，并进行修改。
将一下代码段中的账号和密码改成自己的数据库的帐号和密码。

```java
spring.datasource.username=root
spring.datasource.password=slx309696
```

## 运行项目

执行以下两条命令:

1. mvn compile
2. mvn spring-boot:run
项目启动成功。

## 进入网站

<https://127.0.0.1:8443/HTML/index.html>
*管理员的账号：0020250408 管理员的密码：0020250408*
