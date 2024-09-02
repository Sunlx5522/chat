const DB = require('sequelize')
const { sequelize } = require('../utils/db');

// user数据表
const Session = sequelize.define('sessions', {
  id: {
    type: DB.INTEGER,
    primaryKey: true, //主键
    autoIncrement: true, //自增
    comment: "自增id" //注释:只在代码中有效
  },
  sessionId: {
    type: DB.STRING,
    allowNull: false, //不允许为null
  },
  // 用户id
  userId: {
    type: DB.INTEGER,
    allowNull: false, //不允许为null
  },
  // 接收者id
  receiverId: {
    type: DB.INTEGER,
    allowNull: false, //不允许为null
  },
  // 最后一次聊天记录
  lastChat: {
    type: DB.STRING,
  },
  type: {
    type: DB.INTEGER,
    defaultValue: 0,
    comment: '0:一对一聊天  1:群聊  2:系统通知'
  },
  // 未读条数
  read: {
    type: DB.INTEGER,
    defaultValue: 0,
    comment: '未读条数'
  },
  // 更新时间
  updatedAt: {
    type: DB.STRING,
    commit: '更新时间'
  }
}, {
  //使用自定义表名
  freezeTableName: true,
  //默认的添加时间和更新时间
  timestamps: false,
});

//同步:没有就新建,有就不变
Session.sync();

module.exports = Session