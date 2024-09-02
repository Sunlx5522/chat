const dao_user = require('../dao/user')
const dao_session = require('../dao/session')
const md5 = require('md5');
const utils = require('./utils')

// 注册用户
const signin = async (req, res, next) => {
  res.set('content-type', 'application/json;charset=utf-8')
  // console.log(req.body);
  const { userName, password, email, avatar } = req.body;

  // 先判断用户名和密码是否为空
  if (!userName || !password) {
    res.end(JSON.stringify({
      code: 400,
      msg: 'username和password不能为空'
    }))
    return
  }

  // 查询用户是否存在
  let isExisted = await dao_user.isExisted(userName);
  if (isExisted) {
    res.end(JSON.stringify({
      code: 400,
      msg: '用户已存在'
    }))
    return
  }

  let timestamps = new Date().getTime()
  // 写入数据库
  let user = await dao_user.addUser({ userName, password: md5(password), email, avatar, createdAt: timestamps, updatedAt: timestamps });
  user = user.get({ plain: true })
  if (user.id) {
    // 自动创建系统通知会话
    await dao_session.createSession(user.id, -1, '', timestamps, 2)

    // 返回响应
    res.end(JSON.stringify({
      code: 200,
      msg: '用户注册成功',
      userInfo: {
        id: user.id,
        userName,
        email,
        avatar,
      }
    }))
  }
}



// 用户登录 
const login = async (req, res, next) => {
  res.set('content-type', 'application/json;charset=utf-8')
  const { userName, password } = req.body;

  // 先判断用户名和密码是否为空
  if (!userName || !password) {
    res.end(JSON.stringify({
      code: 400,
      data: '用户名和密码不能为空'
    }))
    return
  }

  // 查询用户是否存在
  let user = await dao_user.isExisted(userName);
  if (!user) {
    res.end(JSON.stringify({
      code: 400,
      msg: '用户不存在',
    }))
    return
  }

  if (user.password !== md5(password)) {
    res.end(JSON.stringify({
      code: 400,
      msg: '密码错误',
    }))
    return
  }

  // 登录成功
  // 写入session
  req.session["userId"] = user.id
  // 返回结果
  res.end(JSON.stringify({
    code: 200,
    msg: "登录成功",
    userInfo: {
      id: user.id,
      userName: user.userName,
      email: user.email,
      avatar: user.avatar,
      createdAt: user.createdAt
    }
  }))
}

// 判断用户是否是登录状态
const getLogin = async (req, res, next) => {
  res.set('content-type', 'application/json;charset=utf-8')

  // const user = await utils.isLogin(req, res)
  const user = await dao_user.getUserById(req.session["userId"])

  // 返回结果
  res.end(JSON.stringify({
    code: 200,
    msg: "登录成功",
    userInfo: {
      id: user.id,
      userName: user.userName,
      email: user.email,
      avatar: user.avatar,
      createdAt: user.createdAt
    }
  }))
}

// 退出登录
const logout = async (req, res, next) => {
  res.set('content-type', 'application/json;charset=utf-8')
  delete req.session.userId
  res.end(JSON.stringify({
    code: 200,
    msg: '退出成功'
  }))
}

// 查询用户
const getUserInfo = async (req, res, next) => {
  res.set('content-type', 'application/json;charset=utf-8')

  if (!req.query.userId) {
    res.end(JSON.stringify({
      code: 400,
      msg: "缺少必要参数: userId",
    }))
    return
  }

  // const user = await utils.isLogin(req, res)
  // if (!user) return

  // 
  const userInfo = await dao_user.getUserById(req.query.userId)
  // return userInfo
  let { id, userName, avatar, email } = userInfo
  res.end(JSON.stringify({
    code: 200,
    userInfo: { id, userName, avatar, email },
  }))
}

module.exports = {
  signin,
  login,
  getLogin,
  logout,
  getUserInfo,
};