SET NAMES utf8mb4;
use chat;
START TRANSACTION;

-- 1. 先确保删除可能存在的测试数据
DELETE FROM friends WHERE user_account IN ('user1','user2','user3','user4','user5','123456');
DELETE FROM users WHERE account IN ('user1','user2','user3','user4','user5','123456');

-- 2. 插入用户数据
INSERT INTO users (account, password, email, telephone, username, is_admin, isonline) 
VALUES 
('user1', '123456', 'user1@test.com', '13800001111', '测试用户1', 0, 0),
('user2', '123456', 'user2@test.com', '13800002222', '测试用户2', 0, 0),
('user3', '123456', 'user3@test.com', '13800003333', '测试用户3', 0, 0),
('user4', '123456', 'user4@test.com', '13800004444', '测试用户4', 0, 0),
('user5', '123456', 'user5@test.com', '13800005555', '测试用户5', 0, 0),
('0020250408', '0020250408', 'admin@test.com', '13800001111', '管理员', 1, 0);

-- 3. 确认用户插入成功后再建立好友关系
INSERT INTO friends (user_account, friend_account, friendship_time)
VALUES
-- user1 的好友关系（第一级）
('user1', 'user2', NOW()),
('user1', 'user3', NOW()),
('user2', 'user1', NOW()),
('user3', 'user1', NOW()),

-- user2 的好友关系（第二级）
('user2', 'user4', NOW()),
('user4', 'user2', NOW()),

-- user4 的好友关系（第三级）
('user4', 'user5', NOW()),
('user5', 'user4', NOW());

COMMIT;
