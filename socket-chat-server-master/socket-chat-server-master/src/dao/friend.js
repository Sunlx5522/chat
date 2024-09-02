const Friend = require('../models/friend.js')
const User = require('../models/user.js')

// 判断好友是否存在
const getIsFriend = async (userId, friendId) => {
  const res = await Friend.findOne({
    where: {
      // id: id
      userId: userId,
      friendId: friendId
    },
    raw: true,
  })

  return Boolean(res)
}

// 添加好友
const addFriend = async (uid1, uid2) => {
  let timestamps = new Date().getTime()
  const res1 = await Friend.create({
    userId: uid1,
    friendId: uid2,
    createdAt: timestamps,
    updatedAt: timestamps,
  })
  const res2 = await Friend.create({
    userId: uid2,
    friendId: uid1,
    createdAt: timestamps,
    updatedAt: timestamps,
  })

  return Boolean(res1 && res2)
}

// 获取好友列表
const getFriendList = async (userId) => {
  Friend.belongsTo(User, { foreignKey: 'friendId', targetKey: 'id' });

  return await Friend.findAll({
    where: { userId: userId },
    attributes: ['user.id', 'user.userName', 'user.avatar', 'user.email'],
    include: [{
      model: User,
      attributes: [],
    }],
    raw: true,
  })
}

// 删除好友
const deleteFriend = async (uid1, uid2) => {
  const res1 = await Friend.destroy({
    where: {
      userId: uid1,
      friendId: uid2,
    }
  })
  const res2 = await Friend.destroy({
    where: {
      userId: uid2,
      friendId: uid1,
    }
  })

  return Boolean(res1 && res2)
}

module.exports = {
  getIsFriend,
  addFriend,
  getFriendList,
  deleteFriend,
}