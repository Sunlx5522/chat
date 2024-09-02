const DB = require('sequelize')
const { sequelize } = require('../utils/db');

// user数据表
const File = sequelize.define('files', {
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
  fileName: {
    type: DB.STRING,
    allowNull: false,
  },
  src: {
    type: DB.STRING,
    allowNull: false,
  },
  size: {
    type: DB.INTEGER,
  },
  createdAt: {
    type: DB.STRING,
  },
  type: {
    type: DB.INTEGER,
    default: 0,
    comment: '文件类型: 1:图片 2:文件 ',
  }
}, {
  //使用自定义表名
  freezeTableName: true,
  //默认的添加时间和更新时间
  timestamps: false,
});

//同步:没有就新建,有就不变
File.sync();

module.exports = File