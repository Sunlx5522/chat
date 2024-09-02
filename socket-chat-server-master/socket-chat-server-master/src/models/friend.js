const DB = require('sequelize')
const { sequelize } = require('../utils/db');

// user数据表
const Friend = sequelize.define('friends', {
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
  remark: {
    type: DB.STRING,
    comment: '好友备注'
  },
  createdAt: {
    type: DB.STRING,
  },
  updatedAt: {
    type: DB.STRING,
  },
}, {
  //使用自定义表名
  freezeTableName: true,
  //默认的添加时间和更新时间
  timestamps: false,
});

//同步:没有就新建,有就不变
Friend.sync();

module.exports = Friend