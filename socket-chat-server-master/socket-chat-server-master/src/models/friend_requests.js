const DB = require('sequelize')
const { sequelize } = require('../utils/db');

// user数据表
const FriendRequest = sequelize.define('friend_requests', {
  id: {
    type: DB.INTEGER,
    primaryKey: true, //主键
    autoIncrement: true, //自增
    comment: "自增id" //注释:只在代码中有效
  },
  // 用户id
  userId: {
    type: DB.INTEGER,
    allowNull: false, //不允许为null
  },
  // 好友id
  friendId: {
    type: DB.INTEGER,
    allowNull: false, //不允许为null
  },
  // 请求理由
  content: {
    type: DB.STRING,
    comment: '请求理由'
  },
  // 是否已读
  read: {
    type: DB.INTEGER,
    defaultValue: 0,
    comment: '0:未读  1:已读'
  },
  // 是否处理
  handle: {
    type: DB.INTEGER,
    defaultValue: 0,
    comment: '0:未处理  1:已处理'
  },
  createdAt: {
    type: DB.STRING,
  },
}, {
  //使用自定义表名
  freezeTableName: true,
  //默认的添加时间和更新时间
  timestamps: false,
});

//同步:没有就新建,有就不变
FriendRequest.sync();

module.exports = FriendRequest