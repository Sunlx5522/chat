const dao_user = require('../dao/user')

// 不需要权限校验的请求
const non_auth_req = {
  '/api/users/login': true,
  '/api/users/signin': true,
  '/api/files/upload_file': true,
}

const authGuard = async (req, res, next) => {
  if (non_auth_req[req.url]) { next(); return; }

  const userId = req.session["userId"]
  const user = userId && await dao_user.getUserById(userId)

  if (!user) {
    res.end(JSON.stringify({
      code: 401,
      msg: '未登录',
    }))
    return
  }

  next()
}

module.exports = {
  authGuard,
}