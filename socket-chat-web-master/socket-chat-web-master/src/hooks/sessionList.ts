import { api_getSessionList } from '@/api/session'
import { api_getUserInfo } from '@/api/user'
import { NotiMsg, ReceiveMsg, Session, SuccessMsg, User } from '@/type'

import { onBeforeMount, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'

import useWebrtcHandler from './webrtcHandler'
import useSubscribe from './subscribe'

export default function () {
  const store = useStore()
  const route = useRoute()

  // 生命周期
  onBeforeMount(() => {
    useSubscribe([
      // 监听收到的信息
      { msgName: 'chat', callback: (name: string, item: ReceiveMsg) => updateSession(item, 0, 'chat') },
      // 监听发送消息成功的通知
      { msgName: 'sendMsgSuccess', callback: (name: string, item: SuccessMsg) => updateSession(item, 0, 'sendMsgSuccess') },
      // 监听通知
      { msgName: 'notice', callback: (name: string, session: NotiMsg) => updateSession(session, 2, 'notice') },
    ])

    // 建立webrtc连接的hook
    useWebrtcHandler()
  })

  onMounted(() => {
    // 如果vuex存在数据,则去除现有的list
    if (store.state.sessionListData.list.length) {
      store.commit('setSessionListData', {
        list: [],
        isMore: false,
      })
    }

    getSessionList()
  })

  // methods
  // 请求session数据
  const getSessionList = async (lastTime?: string) => {
    const res = await api_getSessionList({ lastTime })
    if (res.code === 200) {
      const list = store.state.sessionListData.list.slice()
      list.push(...res.list)
      store.commit('setSessionListData', { list, isMore: list.length >= 20 })
      store.commit('setTotalUnread', res.total)
    }
  }

  // 更新session (信息发送成功，收到消息，收到通知 都会更新session)
  const updateSession = async (chat: (ReceiveMsg | SuccessMsg | NotiMsg), type = 0, from: string) => {
    const chatMsg = chat as ReceiveMsg | SuccessMsg
    const notiMsg = chat as NotiMsg

    // 浅拷贝, 避免直接修改vuex, 但是这里也可能会直接修改的里面的对象, 但是不是直接修改, 关系不大
    const sessionList = store.state.sessionListData.list.slice()
    let index = null;
    switch (type) {
      // 私聊
      case 0:
        index = sessionList.findIndex((item: Session) => item.sessionId === chatMsg.sessionId)
        break;

      // 系统通知
      case 2:
        index = sessionList.findIndex((item: Session) => item.receiverId === -1)
        break;
    }

    if (index !== -1) {
      const session = sessionList.splice(index, 1)[0]
      const currentSession = store.state.currentSession
      // 如果不是当前session，未读数量 +1
      if (from !== 'sendMsgSuccess' && (!currentSession || session.sessionId != currentSession.sessionId || !(/^\/chat/.test(route.path)))) {
        session.read++;
        // this.totalUnread++;
        store.commit('setTotalUnread', ++store.state.totalUnread)
      } else if (from !== 'sendMsgSuccess' && /^\/chat/.test(route.path) && currentSession && session.sessionId == currentSession.sessionId) {
        // 如果是当前会话窗口，每接收一次信息就会执行一次这个位置
        // 为了避免频繁的调用http请求，这里使用socket告诉服务器当前所在的session
        store.state.socket?.emit('request', {
          function: 'resetUnread',
          params: {
            sessionId: session.sessionId,
            userId: store.state.userInfo.id,
          }
        })
      }

      session.lastChat = chat.content;
      session.updatedAt = chatMsg.updatedAt || notiMsg.time
      sessionList.unshift(session)
    } else {
      // 不存在此session，需要创建一个session
      // 请求用户信息
      const res = await api_getUserInfo({ userId: chatMsg.talkerId })
      const sessionItem = createSessionItem(res.userInfo, chatMsg.sessionId, chat.content)
      sessionList.unshift(sessionItem)
    }
    // 将最新sessionList保存到vuex中
    // 虽然每次都更新了整个数组,但是因为vue的虚拟dom机制,是不会导致所有dom重新渲染的
    store.commit('setSessionListData', { list: sessionList, isMore: store.state.sessionListData.isMore })
  }

  // 创建新的sessionItem
  const createSessionItem = (userInfo: User, sessionId: string, lastChat: string) => {
    const sessionItem = {
      cover: userInfo.avatar,
      lastChat: lastChat,
      receiverId: userInfo.id,
      sessionId: sessionId,
      sessionName: userInfo.userName,
      type: 0,
      read: 0,
      updatedAt: new Date().getTime(),
      user: userInfo
    }
    return sessionItem
  }

}