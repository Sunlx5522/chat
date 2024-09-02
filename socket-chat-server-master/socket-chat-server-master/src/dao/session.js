const Session = require('../models/session.js')
const User = require('../models/user.js')
const { Op, Sequelize } = require("sequelize");

const utils = require('../utils/utils');
const DB = require('sequelize')

// 判断会话是否存在
const getSessionExist = async (userId, receiverId) => {
  const res = await Session.findOne({
    where: {
      userId: userId,
      receiverId: receiverId,
    },
    // raw: true,
  })

  return res && res.sessionId
}

// 创建会话
const createSession = async (uid1, uid2, lastChat, timestamps, type = 0) => {
  let sessionId = utils.createSessionId()
  const res1 = await Session.create({
    sessionId,
    userId: uid1,
    receiverId: uid2,
    lastChat: lastChat,
    updatedAt: timestamps,
    type,
  })
  // 如果不是私聊，只需要创建一个session
  if (type !== 0) return res1 ? sessionId : undefined

  const res2 = await Session.create({
    sessionId,
    userId: uid2,
    receiverId: uid1,
    lastChat: lastChat,
    updatedAt: timestamps,
    type
  })

  return res1 && res2 ? sessionId : undefined
}

// 更新会话内容和数量，并更新时间
// isNoti: 是否是通知
const updateSession = async ({ sessionId, lastChat, timestamps, userId, isNoti = false }) => {
  if (!isNoti) {
    // 更新其他人的session
    const res1 = await Session.update({
      lastChat,
      updatedAt: timestamps,
      read: DB.fn('1 + abs', DB.col('read'))
    }, {
      where: {
        sessionId,
        userId: {
          [Op.not]: userId
        },
      },
    })

    const res2 = await Session.update({
      lastChat,
      updatedAt: timestamps,
    }, {
      where: {
        sessionId,
        userId
      },
    })
    return res1 && res2 && sessionId
  } else {
    const res = await Session.update({
      lastChat,
      updatedAt: timestamps,
      read: DB.fn('1 + abs', DB.col('read'))
    }, {
      where: {
        sessionId,
        userId
      },
    })
    return res && sessionId
  }

}

// 查询会话列表
const getSessionList = async (userId, lastTime) => {
  Session.belongsTo(User, { foreignKey: 'receiverId', targetKey: 'id' })

  lastTime = lastTime || new Date().getTime()
  let list = await Session.findAll({
    where: {
      userId,
      updatedAt: {
        [Op.lt]: lastTime,
      },
    },
    limit: 20,
    attributes: ['sessionId', 'lastChat', 'updatedAt', 'type', 'receiverId', 'read',
      [Sequelize.col('user.avatar'), 'cover'],
      [Sequelize.col('user.userName'), 'sessionName'],
    ],
    order: [
      ['updatedAt', 'DESC']
    ],
    include: [{
      model: User,
      as: 'user',
      attributes: ['id', 'userName', 'avatar', 'email'],
    }],
    // raw: true,
  })

  // list = list.map(item => item.get({ plain: true }))

  list.find(item => {
    if (item.dataValues.type == 2) {
      item.dataValues.cover = 'http://114.132.235.129:3000/1648365630990.png'
      item.dataValues.sessionName = 'Socket-Chat系统通知'
      return true
    }
  })

  return list
}

// 清空session未读数量
const resetUnread = async (sessionId, userId) => {
  let res = await Session.update({
    read: 0
  }, {
    where: {
      sessionId,
      userId,
    }
  })

  return Boolean(res)
}

// 查看未读条数
const getTotalUnread = async (userId) => {
  let res = await Session.findAll({
    // userId,
    where: { userId, },
    attributes: [
      [DB.fn('SUM', DB.col('read')), 'total']
    ],
    raw: true
  })

  return res[0].total * 1;
}

module.exports = {
  getSessionExist,
  createSession,
  updateSession,
  getSessionList,
  // updateSessionReadNum,
  resetUnread,
  getTotalUnread,
}