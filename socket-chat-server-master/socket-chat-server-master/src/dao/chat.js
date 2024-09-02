const Chat = require('../models/chat.js')
const { Op } = require("sequelize");

// 添加聊天记录
const addChat = async (chat) => {
  const res = await Chat.create(chat)

  return Boolean(res)
}

// 获取聊天列表
const getChatList = async (sessionId, lastTime) => {
  return await Chat.findAll({
    where: {
      sessionId,
      updatedAt: {
        [Op.lt]: lastTime
      }
    },
    limit: 30,
    order: [
      ['updatedAt', 'DESC'],
    ],
    attributes: ['senderId', 'receiverId', 'content', 'type', 'updatedAt', 'sort', 'others'],
    raw: true,
  })
}

module.exports = {
  addChat,
  getChatList,
}