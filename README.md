# chat
html5工程
用户表：
create table users (
    account varchar(20) not null primary key,
    password varchar(20) not null,
    email varchar(50) not null,
    telephone varchar(20) not null,
    username varchar(50) not null,
    isonline int not null
);
好友表：
create table friends (
    user_account varchar(20) not null,
    friend_account varchar(20) not null,
    friendship_time datetime not null default CURRENT_TIMESTAMP,
    primary key (user_account, friend_account),
    foreign key (user_account) references users(account),
    foreign key (friend_account) references users(account)
);
请求表：
create table friend_requests (
    request_id int auto_increment primary key,
    sender_account varchar(20) not null,
    receiver_account varchar(20) not null,
    request_time datetime not null default CURRENT_TIMESTAMP,
    status varchar(10) not null default 'pending',
    foreign key (sender_account) references users(account),
    foreign key (receiver_account) references users(account)
);
-- 状态：'pending'、'accepted'、'rejected'
头像表：
create table avatar(
    account varchar(20) not null primary key,
    avatar_path varchar(255),
    foreign key (account) references users(account)
);
信息表：
CREATE TABLE messages (
    id BIGINT NOT NULL AUTO_INCREMENT,
    sender VARCHAR(255) NOT NULL,
    receiver VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
