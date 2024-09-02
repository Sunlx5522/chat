const DB = require('sequelize')
const { sequelize } = require('../utils/db');

// user数据表
const User = sequelize.define('users', {
  id: {
    type: DB.INTEGER,
    primaryKey: true, //主键
    autoIncrement: true, //自增
    comment: "自增id" //注释:只在代码中有效
  },
  //用户名
  userName: {
    type: DB.STRING,
    allowNull: false, //不允许为null
  },
  //密码
  password: {
    type: DB.STRING,
    allowNull: false, //不允许为null
  },
  // 头像
  avatar: {
    type: DB.STRING,
    allowNull: true,
  },
  email: {
    type: DB.STRING,
    allowNull: true,
    // 这里邮箱规则校验比较严格, 前端校验就好了
    // validate: {
    //   isEmail: true
    // }
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
User.sync();

module.exports = User