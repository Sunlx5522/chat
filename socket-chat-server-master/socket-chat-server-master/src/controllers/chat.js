const dao_chat = require('../dao/chat')
// const dao_user = require('../dao/user')
// const socket_user = require('../websocket/user')

// 获取聊天记录
const getChatList = async (req, res, next) => {
  res.set('content-type', 'application/json;charset=utf-8')
  // const user = await dao_user.getUserById(userId)

  const query = req.query;
  if (!query.sessionId) {
    res.end(JSON.stringify({
      code: 400,
      msg: '缺少必要参数: sessionId',
    }))
    return
  }
  query.lastTime = query.lastTime || new Date().getTime()

  const list = await dao_chat.getChatList(query.sessionId, query.lastTime)

  res.end(JSON.stringify({
    code: list ? 200 : 400,
    list: list
  }))
}

module.exports = {
  getChatList,
}