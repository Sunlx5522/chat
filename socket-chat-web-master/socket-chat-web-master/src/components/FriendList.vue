<template>
  <div class="session-list">
    <div class="session-top">
      <div class="session-search">
        <i class="iconfont icon-sousuoxiao"></i>
        <input type="text" placeholder="搜索" />
      </div>
    </div>

    <div class="friend-list-container">
      <!-- 新的朋友 -->
      <div
        class="session-item"
        @click="selectFriend({ id: -1, userName: '新的好友', avatar: '', email: '' })"
        :class="{ 'current-session': store.state.currentFriend && store.state.currentFriend.id === -1 }"
      >
        <div class="cover"><img src="../assets/img/newFriend.png" alt="" /></div>
        <div class="session-info">
          <div class="session-name">新的好友</div>
        </div>
      </div>
      <!-- 好友列表 -->
      <div
        class="session-item"
        :class="{ 'current-session': store.state.currentFriend && store.state.currentFriend.id === item.id }"
        @click="selectFriend(item)"
        @click.right.prevent="rightClick($event, item)"
        v-for="item in store.state.friendListData.list"
        :key="item.id"
      >
        <div class="cover"><img :src="item.avatar" alt="" /></div>
        <div class="session-info">
          <div class="session-name">{{ item.userName }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { api_getFriendList, api_deleteFriend } from '@/api/friend'
import Pubsub from 'pubsub-js'
import { computed, defineComponent, onMounted } from '@vue/runtime-core'
import { useStore } from 'vuex'
import { message } from 'ant-design-vue'
import moment from 'moment'
import { Friend } from '@/type'

export default defineComponent({
  name: 'friend-list',
  setup() {
    const store = useStore()
    const compute = {
      timeHandler: computed(
        () =>
          function (time: number) {
            return moment(time).format('HH:mm')
          }
      ),
    }

    // 生命周期
    onMounted(async () => {
      if (!store.state.friendListData.isReq) {
        // 请求好友列表
        let res = await api_getFriendList()
        if (res) {
          store.commit('setFriendListData', {
            isReq: true,
            list: res.list,
          })
        }
      }
    })

    // methods
    const selectFriend = (item: Friend) => {
      console.log(item)
      if (store.state.currentFriend && store.state.currentFriend.id === item.id) return
      store.commit('setCurrentFriend', item)
    }

    // 点击右键的回调
    const rightClick = (e: MouseEvent, friend: Friend) => {
      console.log(friend)

      Pubsub.publish('rightMenu', {
        position: { x: e.x, y: e.y },
        menuList: [
          {
            content: '解除好友关系',
            callback: async () => {
              let res = await api_deleteFriend({ friendId: friend.id })
              if (res) {
                message.success('已成功解除好友关系')
                store.commit('deleteFriend', friend.id)
              }
            },
          },
        ],
      })
    }

    return {
      ...compute,
      selectFriend,
      rightClick,
      store,
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

.icon-sousuoxiao,
.session-search > input {
  font-size: 12px;
  border: none;
  /* background-color: #e2e2e2; */
  background-color: #fff;
  color: rgb(95, 95, 95);
}

.session-search input {
  width: 193px;
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
}

.cover img {
  width: 100%;
  height: 100%;
  border-radius: 5px;
  object-fit: cover;
}

.session-info {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  width: 180px;
  margin-left: 10px;
}

.session-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
}

.friend-list-container {
  height: calc(100vh - 55px);
  overflow-y: auto;
}
</style>
