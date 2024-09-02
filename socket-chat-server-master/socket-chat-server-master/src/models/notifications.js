const DB = require('sequelize')
const { sequelize } = require('../utils/db');

// user数据表
const Notification = sequelize.define('notifications', {
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
  // 类型
  type: {
    type: DB.INTEGER,
    comment: '0:登录通知'
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
Notification.sync();

module.exports = Notification