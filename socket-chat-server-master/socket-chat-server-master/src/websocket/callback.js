const dao_session = require("../dao/session");

// socket请求方法
const resetUnread = function(params) {
  dao_session.resetUnread(params.sessionId, params.userId)
}

module.exports = {
  resetUnread,
}