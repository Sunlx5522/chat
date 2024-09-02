const FriendRequest = require('../models/friend_requests.js')
const User = require('../models/user.js')
const { Op } = require("sequelize");

// 判断好友请求是否存在
const getRequest = async (userId, friendId) => {
  const res = await FriendRequest.findOne({
    where: {
      // id: id
      userId: userId,
      friendId: friendId
    },
    raw: true,
  })

  return res
}

// 根据id获取请求
const getRequestById = async (requestId) => {
  const res = await FriendRequest.findOne({
    where: {
      id: requestId
    },
    raw: true,
  })

  return res
}

// 保存好友请求
const addRequest = async (userId, friendId, content) => {
  let timestamps = new Date().getTime()
  const res = await FriendRequest.create({
    userId,
    friendId,
    content,
    createdAt: timestamps,
  })

  return Boolean(res)
}

// 更新好友请求
const updateRequest = async (requestId, read = 0, handle = 0, content, createdAt) => {
  const res = await FriendRequest.update({ handle, read, content, createdAt }, {
    where: {
      id: requestId
    },
    raw: true,
  })

  return Boolean(res)
}

// 获取好友请求列表
const getRequestList = async (userId, lastTime) => {
  FriendRequest.belongsTo(User, { foreignKey: 'friendId', targetKey: 'id' });

  lastTime = lastTime || new Date().getTime()
  return await FriendRequest.findAll({
    where: {
      userId,
      createdAt: {
        [Op.lt]: lastTime
      }
    },
    include: [{
      model: User,
      attributes: ['id', 'userName', 'avatar', 'email'],
    }],
    order: [
      ['createdAt', 'DESC']
    ],
    // raw: true,
    limit: 20,
  })
}

module.exports = {
  getRequest,
  addRequest,
  getRequestList,
  getRequestById,
  updateRequest,
}