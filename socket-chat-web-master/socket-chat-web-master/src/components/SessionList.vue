<template>
  <div class="session-list">
    <div class="session-top">
      <div class="session-search">
        <i class="iconfont icon-sousuoxiao"></i>
        <input type="text" placeholder="搜索" />
      </div>
    </div>
    <!-- <scroll-box listenHeight topDisabled :bottomDisabled="disabledLoad" @touchBottom="$bus.$emit('loadSessionList')" class="session-list-container"> -->
    <scroll-box listenHeight topDisabled :bottomDisabled="disabledLoad" @touchBottom="touchBottom" class="session-list-container">
      <div
        class="session-item"
        :class="{ 'current-session': store.state.currentSession && store.state.currentSession.sessionId == item.sessionId }"
        v-for="item in store.state.sessionListData.list"
        :key="item.sessionId"
        @click="changeSession(item)"
      >
        <div class="cover">
          <img :src="item.cover" alt="" />
          <div
            class="unread-num"
            v-show="item.read"
            :style="`font-weight:${item.read > 99 ? 'bold' : 'normal'}`"
            v-text="item.read <= 99 ? item.read : '···'"
          ></div>
        </div>
        <div class="session-info">
          <div class="session-name">
            <span class="name">{{ item.sessionName }}</span>
            <span class="update-at">{{ timeHandler(item.updatedAt) }}</span>
          </div>
          <div class="last-chat" v-html="transToTag(item.lastChat, 16)"></div>
        </div>
      </div>
      <loading class="loading" v-show="store.state.sessionListData.isMore" :scale="0.7"></loading>
    </scroll-box>
  </div>
</template>

<script lang="ts">
import { transToTag } from '@/utils/utils'
import ScrollBox from './ScrollBox.vue'
import Loading from './Loading.vue'
import Pubsub from 'pubsub-js'

import moment from 'moment'
import { reactive, toRefs, onMounted, computed, defineComponent } from 'vue'
import { useStore } from 'vuex'
import { useRoute } from 'vue-router'
import { Session } from '@/type'

export default defineComponent({
  components: { ScrollBox, Loading },
  name: 'session-list',
  setup() {
    const store = useStore()
    const route = useRoute()
    const state = reactive({
      // 是否禁止加载更多
      disabledLoad: false,
    })
    const compute = {
      timeHandler: computed(
        () =>
          function (time: string) {
            if (parseInt(time) >= today) return moment(parseInt(time)).format('HH:mm')
            else return moment(parseInt(time) * 1).format('YY/M/DD')
          }
      ),
    }

    // 当天0点时间戳
    let today = moment().startOf('day').valueOf()

    if (route.params.friendId) {
      // 将当前session改到friendId的会话窗口
      let session = store.state.sessionListData.list.find((item: Session) => item.receiverId.toString() === route.params.friendId)
      store.commit('setCurrentSession', session)
    }

    // 生命周期
    onMounted(() => {
      // 如果存在currentSession, 则重置当前session的read
      if (store.state.currentSession) {
        store.commit('setTotalUnread', store.state.totalUnread - store.state.currentSession.read)
        store.state.currentSession.read = 0
        store.state.socket.emit('request', {
          function: 'resetUnread',
          params: {
            sessionId: store.state.currentSession.sessionId,
            userId: store.state.userInfo.id,
          },
        })
      }
    })

    // methods
    // 点击session-item的回调
    const changeSession = (session: Session) => {
      // this.totalUnread -= session.read;
      store.commit('setTotalUnread', store.state.totalUnread - session.read)
      // 清空未读数
      session.read = 0
      // api_resetUnread({ sessionId: session.sessionId })
      store.state.socket.emit('request', {
        function: 'resetUnread',
        params: {
          sessionId: session.sessionId,
          userId: store.state.userInfo.id,
        },
      })

      let vuexSession = store.state.currentSession
      if (vuexSession && vuexSession.sessionId === session.sessionId) return

      store.commit('setCurrentSession', session)
    }

    const touchBottom = () => {
      Pubsub.publish('loadSessionList')
    }

    return {
      store,
      ...toRefs(state),
      ...compute,
      touchBottom,
      changeSession,
      transToTag,
    }
  },
})
</script>

<style scoped>
.session-list {
  width: 250px;
  /* background-color: #e6e5e5; */
  background-color: #fff;
  text-align: left;
  border-right: 1px solid #ddd;
}

.session-top {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 55px;
  border-bottom: 1px solid #ddd;
  /* background-color: #f7f7f7; */
  background-color: #fff;
  padding: 10px;
}

.session-search {
  padding: 3px 8px;
  /* background-color: #e2e2e2; */
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 5px;
  width: 100%;
}

.session-search input {
  width: 193px;
}

.icon-sousuoxiao,
.session-search > input {
  font-size: 12px;
  border: none;
  /* background-color: #e2e2e2; */
  background-color: #fff;
  color: rgb(95, 95, 95);
}

.icon-sousuoxiao {
  margin-right: 6px;
}

.session-search > input:focus {
  outline: none;
}

.session-item {
  display: flex;
  padding: 10px;
  cursor: pointer;
}

.session-item:hover {
  /* background-color: #d8d8d8; */
  background-color: #f2f2f2;
}

.current-session {
  /* background-color: #c5c5c6; */
  background-color: #ebebeb;
}

.current-session:hover {
  /* background-color: #c5c5c6; */
  background-color: #ebebeb;
}

.cover {
  height: 40px;
  width: 40px;
  min-width: 40px;
  position: relative;
}

.cover img {
  width: 100%;
  height: 100%;
  border-radius: 5px;
  object-fit: cover;
}

.last-chat {
  color: #aaa;
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.session-info {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  width: 180px;
  margin-left: 10px;
}

.session-name {
  display: flex;
  justify-content: space-between;
}

.session-name .name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
}

.update-at {
  font-size: 12px;
  color: #aaa;
}

.unread-num {
  position: absolute;
  font-size: 12px;
  height: 16px;
  width: 16px;
  right: -6px;
  top: -6px;
  border-radius: 50%;
  color: white;
  background-color: #f3453c;
  line-height: 16px;
  text-align: center;
}

.session-list-container {
  height: calc(100vh - 55px);
  overflow-y: auto;
}
</style>
