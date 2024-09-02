const DB = require('sequelize')
const { sequelize } = require('../utils/db');

// user数据表
const Chat = sequelize.define('chats', {
  id: {
    type: DB.INTEGER,
    primaryKey: true, //主键
    autoIncrement: true, //自增
    comment: "自增id" //注释:只在代码中有效
  },
  sessionId: {
    type: DB.STRING,
    allowNull: false,
  },
  // 发送者id
  senderId: {
    type: DB.INTEGER,
    allowNull: false, //不允许为null
  },
  // 接收者id
  receiverId: {
    type: DB.INTEGER,
    allowNull: false, //不允许为null
  },
  // 内容
  content: {
    type: DB.STRING(5000),
    comment: 'type为0时:聊天信息  为1/2/3:文件地址   为4:通知内容'
  },
  // 类型
  type: {
    type: DB.INTEGER,
    defaultValue: 0,
    comment: '0:文字   1: 图片   2:文件   3:表情包   4:聊天窗口内通知'
  },
  sort: {
    type: DB.INTEGER,
    defaultValue: 0,
    comment: '0:私聊   1: 群聊'
  },
  // 更新时间
  updatedAt: {
    type: DB.STRING,
    comment: '更新时间, 时间戳'
  },
  // 用于存储其它信息，存储类型为JSON，可以存储如文件的信息
  others: {
    type: DB.STRING(1000),
    comment: '用于存储其它信息，存储类型为JSON，可以存储如文件的信息',
  },
}, {
  //使用自定义表名
  freezeTableName: true,
  //默认的添加时间和更新时间
  timestamps: false,
});

//同步:没有就新建,有就不变
Chat.sync();

module.exports = Chat