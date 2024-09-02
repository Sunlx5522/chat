import { useStore } from 'vuex'
import { io } from 'socket.io-client'
import { FailMsg, FriendReqMsg, LoginMsg, MsgType, ReceiveMsg, SuccessMsg, WebRtcMsg } from '@/type'
import Pubsub from 'pubsub-js'
import { message, notification } from 'ant-design-vue'
import { ComponentInternalInstance, getCurrentInstance } from '@vue/runtime-core'
import ToneCmp from '@/components/ToneCmp.vue'
import { useRouter } from 'vue-router'

export default function () {
  const store = useStore()
  const router = useRouter()
  const { proxy } = getCurrentInstance() as ComponentInternalInstance

  // 建立websocket连接
  //此处本来根据跨域应该为const socket = io('/socket.io'),但是socketio的请求地址默认自带socket.io，所以此处只要传入'/'
  // window.$socket = io('/')
  const socket = io('/')
  store.commit('setSocket', socket)

  // 接收聊天信息
  socket.on('chat', (data: ReceiveMsg) => {
    const toneCmp = proxy?.$refs.toneCmp as typeof ToneCmp
    toneCmp.playTone()
    Pubsub.publish('chat', data)

    if (data.type === 5) {
      // 视频邀请
      Pubsub.publish('videoReq', {
        senderId: data.talkerId,
      })
    }
  })

  socket.on('webRTC', (data: WebRtcMsg) => {
    Pubsub.publish('webRTC', data)
  })

  // 接收通知信息
  socket.on('message', MsgHandler)

  // 方法
  // 通知的分类处理方法
  function MsgHandler(msg: MsgType) {
    // console.log(msg)

    switch (msg.msgType) {
      case 'chat':
        // this.sendMsgSuccess(msg)
        chatHandler(msg as SuccessMsg | FailMsg)
        break
      case 'login':
        LoginHandler(msg as LoginMsg)
        break
      case 'friendRequest':
        friendReqHandler(msg as FriendReqMsg)
        break
    }
  }

  // 登录信息处理
  const LoginHandler = (msg: LoginMsg) => {
    switch (msg.status) {
      case 'success':
        // console.log('login success')
        // 将通知发送给sessionList，以更新sessionList
        Pubsub.publish('notice', msg)
        break
      case 'logout':
        // console.log('您的账号已在别的地方登录')
        message.warning('您的账号已在别的地方登录!')
        store.state.socket?.disconnect()
        router.push('/login')
        break
    }
  }

  // 处理好友请求的回调
  const friendReqHandler = (msg: FriendReqMsg) => {
    notification.open({
      message: '添加好友请求',
      description: `${msg.userInfo.userName}:\n${msg.content}`,
      // 通知类型 + 用户id
      key: `${msg.msgType}+${msg.userInfo.id}`,
      onClick: () => {
        // console.log('Notification Clicked!');
        store.commit('setCurrentFriend', { id: -1 })
        router.push('/friend')
        notification.close(`${msg.msgType}+${msg.userInfo.id}`)
      },
    })
  }

  // 聊天的回调
  const chatHandler = (msg: SuccessMsg | FailMsg) => {
    if (msg.status === 'success') {
      // 成功
      // this.$bus.$emit('sendMsgSuccess', msg)
      Pubsub.publish('sendMsgSuccess', msg)
    } else {
      // 失败
      message.error(msg.content)
      // this.$bus.$emit('sendMsgFail', msg)
      Pubsub.publish('sendMsgFail', msg)
    }
  }
}