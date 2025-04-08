drop database chat;
create database chat;
use chat;
CREATE TABLE users (
    account VARCHAR(20) NOT NULL PRIMARY KEY,
    password VARCHAR(20) NOT NULL,
    email VARCHAR(50) NOT NULL,
    telephone VARCHAR(20) NOT NULL,
    username VARCHAR(50) NOT NULL,
    is_admin  tinyint(1) default 0 null,
    isonline INT NOT NULL
);

CREATE TABLE friends (
    user_account VARCHAR(20) NOT NULL,
    friend_account VARCHAR(20) NOT NULL,
    friendship_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_account, friend_account),
    FOREIGN KEY (user_account) REFERENCES users(account),
    FOREIGN KEY (friend_account) REFERENCES users(account)
);

CREATE TABLE friend_requests (
    request_id INT AUTO_INCREMENT PRIMARY KEY,
    sender_account VARCHAR(20) NOT NULL,
    receiver_account VARCHAR(20) NOT NULL,
    request_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(10) NOT NULL DEFAULT 'pending',
    FOREIGN KEY (sender_account) REFERENCES users(account),
    FOREIGN KEY (receiver_account) REFERENCES users(account)
);

CREATE TABLE avatar (
    account VARCHAR(20) NOT NULL PRIMARY KEY,
    avatar_path VARCHAR(255),
    FOREIGN KEY (account) REFERENCES users(account)
);

CREATE TABLE messages (
    id BIGINT NOT NULL AUTO_INCREMENT,
    sender VARCHAR(255) NOT NULL,
    receiver VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    PRIMARY KEY (id)
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE daily_visits (
    visit_date DATE PRIMARY KEY,
    visit_count INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
