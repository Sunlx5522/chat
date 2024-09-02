// 生成uuid
const guid = function () {
  function S4 () {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1)
  }
  return (S4() + S4() + '-' + S4() + '-' + S4() + '-' + S4() + '-' + S4() + S4() + S4())
}

// 生成sessionId
const createSessionId = function () {
  return Math.round(Math.random() * Math.pow(10, 6)).toString()
}

module.exports = {
  guid,
  createSessionId,
}