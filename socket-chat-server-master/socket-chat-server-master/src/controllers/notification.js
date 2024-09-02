const dao_notification = require('../dao/notification')
const utils = require('./utils')
// const socket_user = require('../websocket/user')

// 获取聊天记录
const getNotificationList = async (req, res, next) => {
  res.set('content-type', 'application/json;charset=utf-8')
  // const user = await utils.isLogin(req, res)
  // if (!user) return

  const query = req.query;
  query.lastTime = query.lastTime || new Date().getTime()

  const list = await dao_notification.getNotificationList(req.session["userId"], query.lastTime)

  res.end(JSON.stringify({
    code: list ? 200 : 400,
    list: list
  }))
}

module.exports = {
  getNotificationList,
}