const dao_friend_request = require('../dao/friend_request')
const dao_friend = require('../dao/friend')
const dao_user = require('../dao/user')
const utils = require('./utils')
const socket_user = require('../websocket/user')

// 保存好友请求
const addRequest = async (req, res, next) => {
  res.set('content-type', 'application/json;charset=utf-8')
  let query = req.query
  if (!query.friendId) {
    res.end(JSON.stringify({
      code: 400,
      msg: '缺少必要参数: friendId',
    }))
    return
  }

  // const user = await utils.isLogin(req, res)
  // if (!user) return
  let user = await dao_user.getUserById(req.session["userId"])

  if (user.id == query.friendId) {
    res.end(JSON.stringify({
      code: 400,
      msg: 'friendId不能是自己哦',
    }))
    return
  }

  // 判断用户是否存在
  const friend = await dao_user.getUserById(query.friendId)
  if (!friend) {
    res.end(JSON.stringify({
      code: 400,
      msg: '用户不存在',
    }))
    return
  }
  // 判断是否已是好友
  const isFriend = await dao_friend.getIsFriend(user.id, query.friendId)

  if (isFriend) {
    res.end(JSON.stringify({
      code: 400,
      msg: '该用户已是你的好友',
    }))
    return
  }

  // 判断好友请求是否存在
  // 这里user和friend需要反过来
  let friendReq = await dao_friend_request.getRequest(query.friendId, user.id)

  let result = null;
  if (friendReq) {
    // res.end(JSON.stringify({
    //   code: 400,
    //   msg: '已经发送过好友请求了, 请耐心等待好友接受'
    // }))
    // return
    result = await dao_friend_request.updateRequest(friendReq.id, 0, 0, query.content, new Date().getTime())
  } else {
    // 这里user和friend需要反过来
    result = await dao_friend_request.addRequest(query.friendId, user.id, query.content)
  }

  res.end(JSON.stringify({
    code: result ? 200 : 400,
    msg: result ? '好友请求发送成功' : '请求失败'
  }))

  if (result) {
    // 判断对方是否在线，在线的话发送websocket通知
    let socketUser = socket_user.getUserById(query.friendId)
    // console.log(socketUser);
    if (!socketUser) return
    process.io.to(socketUser.socketId).emit('message', {
      msgType: 'friendRequest',
      userInfo: {
        id: user.id,
        userName: user.userName,
        avatar: user.avatar,
        email: user.email,
      },
      content: query.content
    })
  }
}

// 获取好友列表
const getRequestList = async (req, res, next) => {
  res.set('content-type', 'application/json;charset=utf-8')
  // const user = await utils.isLogin(req, res)
  // if (!user) return

  const list = await dao_friend_request.getRequestList(req.session["userId"], req.query.lastTime)

  res.end(JSON.stringify({
    code: list ? 200 : 400,
    list: list
  }))
}

module.exports = {
  addRequest,
  getRequestList,
}