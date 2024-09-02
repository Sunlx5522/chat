const express = require('express')
const multer = require('multer')

const http = require('http')
const path = require('path')

const userRouter = require('./routes/user')
const friendRouter = require('./routes/friend')
const sessionRouter = require('./routes/session')
const chatRouter = require('./routes/chat')
const friendRequestRouter = require('./routes/friend_request')
const notificationRouter = require('./routes/notification')
const fileRouter = require('./routes/file')
const emoticonRouter = require('./routes/emoticon')
const Session = require('express-session')
const middleware = require('./middleware/middleware')

const app = express()

app.use(multer({
  // dest: '../uploadFile',
  limits: { fileSize: 2 * 1024 * 1024 }
}).array('file'))
app.use(express.static('../uploadFile'));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const session = Session({
  // 可自定义(这个密钥不是我服务器项目部署的密钥哈)
  secret: "1234567890",
  resave: true,
  saveUninitialized: true,
})
const sharedsession = require('express-socket.io-session')

app.use(session);
app.use(middleware.authGuard)

app.use('/api/users', userRouter)
app.use('/api/friends', friendRouter)
app.use('/api/sessions', sessionRouter)
app.use('/api/chats', chatRouter)
app.use('/api/friend_requests', friendRequestRouter)
app.use('/api/notis', notificationRouter)
app.use('/api/files', fileRouter)
app.use('/api/emoticons', emoticonRouter)


//创建HTTP server
const server = http.createServer(app);
const socket = require("./websocket/sockio.js")
process.io = socket.getSocket(server); //使用http协议建立socket
process.io.use(sharedsession(session))
//此处变成http listen
server.listen(3010);

app.listen(3000, () => {
  console.log('localhost:3000');
})