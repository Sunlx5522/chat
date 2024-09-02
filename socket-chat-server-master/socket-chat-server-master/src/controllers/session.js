const dao_session = require('../dao/session')
const utils = require('./utils')

// 获取session列表
const getSessionList = async (req, res, next) => {
  res.set('content-type', 'application/json;charset=utf-8')
  // const user = await utils.isLogin(req)

  // if (!user) {
  //   res.end(JSON.stringify({
  //     code: 401,
  //     msg: '未登录',
  //   }))
  //   return
  // }

  const query = req.query;

  // 以时间戳为分页标识，因为以页数的话可能会导致新增会话后出现重复的情况
  const list = await dao_session.getSessionList(req.session["userId"], query.lastTime)

  const total = await dao_session.getTotalUnread(req.session["userId"])

  res.end(JSON.stringify({
    code: list ? 200 : 400,
    list: list,
    total,
  }))
}

// 更新通知或群组的session
const updateSession = async (userId, receiverId, lastChat, timestamps) => {
  // 先判断是否存在会话
  let sessionId = await dao_session.getSessionExist(userId, receiverId);

  let res1 = await dao_session.updateSession({ sessionId, lastChat, timestamps, userId, isNoti: receiverId == -1 })
  // 第三个参数是type  如果receiverId为 -1  则说明type为系统通知
  // let res2 = await dao_session.updateSessionReadNum(sessionId, userId, receiverId == -1 && 2)

  // return res1 && res2 && sessionId
  return res1 && sessionId
}

// 清空session未读数量
const resetUnread = async (req, res, next) => {
  // 判断是否传参
  if (!req.query.sessionId) {
    res.end(JSON.stringify({
      code: 400,
      msg: '缺少必要参数: sessionId',
    }))
    return
  }

  res.set('content-type', 'application/json;charset=utf-8')
  // const user = await utils.isLogin(req)

  // if (!user) {
  //   res.end(JSON.stringify({
  //     code: 401,
  //     msg: '未登录',
  //   }))
  //   return
  // }

  let resetRes = await dao_session.resetUnread(req.query.sessionId, req.session["userId"])

  res.end(JSON.stringify({
    code: resetRes ? 200 : 400,
    msg: resetRes ? 'success' : 'fail'
  }))
}

module.exports = {
  getSessionList,
  updateSession,
  resetUnread,
}