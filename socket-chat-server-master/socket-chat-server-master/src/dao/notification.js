const Notification = require('../models/notifications.js')
const { Op } = require("sequelize");

// 添加通知记录
const addNotification = async (userId, type, createdAt) => {
  const res = await Notification.create({
    userId,
    type,
    createdAt,
  })

  return Boolean(res)
}

// 获取通知列表
const getNotificationList = async (userId, lastTime) => {
  return await Notification.findAll({
    where: {
      userId,
      createdAt: {
        [Op.lt]: lastTime
      }
    },
    limit: 30,
    order: [
      ['createdAt', 'DESC'],
    ],
    raw: true,
  })
}

module.exports = {
  addNotification,
  getNotificationList,
}