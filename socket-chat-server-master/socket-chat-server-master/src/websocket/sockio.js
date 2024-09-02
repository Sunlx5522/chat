const socket = {}
const socketio = require('socket.io')
const { userJoin, getCurrentUser, getUserById, removeUser } = require('./user')
const fs = require('fs')
const path = require('path')
const dao_file = require('../dao/file')
const utils = require('./utils')
const getPixels = require("get-pixels")

const dao_chat = require('../dao/chat')
const dao_user = require('../dao/user')
const dao_session = require('../dao/session')
const dao_notification = require('../dao/notification')
const dao_friend = require('../dao/friend')

const control_session = require('../controllers/session')
const callback = require('./callback')

function getSocket (server) {
  const io = socketio(server, {
    cors: true,
    maxHttpBufferSize: 3 * 1024 * 1024,
  })

  // 连接
  io.on('connection', async socket => {
    let timestamps = new Date().getTime()

    // 根据session获取用户id，查询用户信息
    let userInfo = socket.handshake.session.userId && await dao_user.getUserById(socket.handshake.session.userId)
    if (!userInfo) {
      console.log('用户未登录');
      socket.emit('message', {
        msgType: 'login',
        status: 'logout',
        time: timestamps
      })
      // 为true时彻底断开连接，否则只是断开命名空间
      socket.disconnect(true)
      return
    }


    // socket.on('login', async () => {
    // 判断用户是否存在
    let oldUser = getUserById(userInfo.id)
    if (oldUser) {
      io.to(oldUser.socketId).emit('message', {
        msgType: 'login',
        status: 'logout',
        time: timestamps
      })
      removeUser(oldUser.socketId)
    }

    const user = userJoin(socket.id, userInfo);
    // 发送给当前客户端
    // socket.emit('userInfo', user)
    socket.emit('message', {
      msgType: 'login',
      status: 'success',
      content: '登录通知',
      time: timestamps
    })

    // 保存通知记录
    await dao_notification.addNotification(userInfo.id, 0, timestamps)
    // 更新session
    await control_session.updateSession(userInfo.id, -1, '登录通知', timestamps)

    // 聊天
    socket.on('chat', async (data) => {
      // const user = await getCurrentUser(socket.id)
      const timestamps = new Date().getTime()

      // if (!user) {
      //   socket.emit('message', {
      //     msgType: 'chat',
      //     status: 'fail',
      //     uuid: data.uuid,
      //     time: timestamps,
      //     content: '用户不存在',
      //   })
      //   return;
      // }

      // 判断是否是好友关系
      let isFriend = await dao_friend.getIsFriend(user.id, data.receiverId)
      if (!isFriend) {
        socket.emit('message', {
          sessionId,
          msgType: 'chat',
          status: 'fail',
          uuid: data.uuid,
          time: timestamps,
          content: '对方与您不是好友关系!',
        })
        return;
      }

      let content = null;
      // data.type  0:文字    1:图片     2:文件      3: 自定义表情    4: 通知   5: 视频邀请
      // 文字聊天 或 自定义表情
      if (data.type == 0 || data.type == 3 || data.type == 5) {
        content = data.content
      } else if (data.type == 1 || data.type == 2) {
        // 存储文件
        // 判断是否存在文件夹,没有就创建
        fs.existsSync("../uploadFile") || fs.mkdirSync("../uploadFile")

        let ext = path.extname(data.fileInfo.fileName)
        let dir = path.join('../uploadFile/', timestamps + ext)

        // 写入文件
        fs.writeFileSync(dir, data.content)

        let src = 'http://localhost:3000/' + timestamps + ext
        await new Promise((resolve, reject) => {
          // 判断是否是图片
          if (data.type == 1) {
            getPixels(dir, (err, pixels) => {
              // console.log(pixels);
              if (err) { console.log("Bad image path"); return }
              // 计算占位图的宽高
              // let width = pixels.shape.length === 3 ? pixels.shape[0]:pixels.shape[1]
              // let height = pixels.shape.length === 3 ? pixels.shape[1]:pixels.shape[2]
              let length = pixels.shape.length
              let size = utils.getPHSize(pixels.shape[length - 3], pixels.shape[length - 2])
              content = src + '?size=' + size.width + 'x' + size.height
              resolve(1)
            })
          } else {
            content = src
            resolve(2)
          }
        }).then((type) => {
          // 将上传记录存入数据库
          dao_file.addFile({
            userId: user.id,
            size: data.fileInfo.size,
            fileName: data.fileInfo.fileName,
            src,
            createdAt: timestamps,
            type,
          })
        })

      }

      // 更新会话列表
      let sessionId = await dao_session.updateSession({
        sessionId: data.sessionId,
        lastChat: content.substr(0, 100),
        timestamps,
        userId: user.id
      })

      // 将聊天记录存入数据库
      let chat = {
        sessionId: sessionId,
        senderId: user.id,
        receiverId: data.receiverId,
        content: content,
        type: data.type,
        updatedAt: timestamps,
        others: data.type == 0 ? undefined : JSON.stringify(data.fileInfo)
      }

      let chatRes = await dao_chat.addChat(chat)
      if (!chatRes) console.log('聊天记录添加失败');

      // 返回给发送方
      socket.emit('message', {
        msgType: 'chat',
        status: 'success',
        // userInfo: user,
        // 这里不用time 和数据库字段保持一致
        updatedAt: timestamps,
        content: content,
        uuid: data.uuid,
        sessionId,
        talkerId: data.receiverId,
        type: data.type,
      })

      // 判断用户是否在线
      const receiver = await getUserById(data.receiverId)
      if (receiver) {
        // 发送至接收方
        io.to(receiver.socketId).emit('chat', {
          // userInfo: user,
          content: content,
          // 这里不用time 和数据库字段保持一致
          updatedAt: timestamps,
          sessionId,
          talkerId: user.id,
          type: data.type,
          others: data.fileInfo && JSON.stringify(data.fileInfo),
        })
      }

    })

    // 调用callback中的方法
    socket.on('request', async (data) => {
      callback[data.function] && callback[data.function](data.params)
    })

    socket.on('webRTC', async (data) => {
      const receiver = await getUserById(data.receiverId)
      if (!receiver) return
      io.to(receiver.socketId).emit('webRTC', data)
    })

    // 断开连接
    socket.on('disconnect', (reason) => {
      console.log("id为" + socket.id + "的用户端口断开……断开原因：" + reason);
      removeUser(socket.id)
    })
  })

  return io
}

socket.getSocket = getSocket;
//导出socket
module.exports = socket