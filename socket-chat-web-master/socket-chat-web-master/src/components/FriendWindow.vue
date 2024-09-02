<template>
  <div class="friend-window">
    <div class="card-container">
      <!-- 顶部 -->
      <div class="window-top">
        <div class="top-left">
          <div class="user-name">{{ store.state.currentFriend.userName }}</div>
          <div class="signature">个性签名(待开发)</div>
        </div>
        <div class="avatar"><img :src="store.state.currentFriend.avatar" alt="" /></div>
      </div>
      <!-- 中间 -->
      <div class="window-middle">
        <div class="middle-item">
          <div class="title">备注</div>
          <!-- <div class="value">{{friendInfo.remark}}</div> -->
          <div class="value">(待开发)</div>
        </div>
        <div class="middle-item">
          <div class="title">地区</div>
          <!-- <div class="value">{{friendInfo.location}}</div> -->
          <div class="value">(待开发)</div>
        </div>
        <div class="middle-item">
          <div class="title">ID</div>
          <div class="value">{{ store.state.currentFriend.id }}</div>
        </div>
      </div>
      <!-- 底部 -->
      <div class="window-bottom">
        <div class="sendMsg" @click="sendMsg(store.state.currentFriend.id)">发信息</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/runtime-core'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
export default defineComponent({
  name: 'friend-window',
  setup() {
    const store = useStore()
    const router = useRouter()

    // methods
    // 点击发信息的回调
    const sendMsg = (id: number) => {
      // 没有写resful地址 刷新参数就失效了
      router.push({ name: 'chat', params: { friendId: id } })
    }

    return {
      sendMsg,
      store,
    }
  },
})
</script>

<style scoped>
.friend-window {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: left;
  height: 100vh;
  background: url('@/assets/img/chat_background.png') 0 0 no-repeat;
  background-size: 100%;
}

.card-container {
  background-color: rgba(255, 255, 255, 0.8);
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.window-top,
.window-middle,
.window-bottom {
  width: 360px;
}

.window-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 38px;
}

.avatar {
  width: 60px;
  height: 60px;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-name {
  font-size: 20px;
  font-weight: 500;
}

.signature {
  color: rgb(112, 112, 112);
  font-size: 14px;
  margin-top: 5px;
}

.window-middle {
  border-top: 1px solid #ddd;
  border-bottom: 1px solid #ddd;
  padding: 28px 0;
  font-size: 14px;
}

.middle-item {
  margin: 15px 0;
  display: flex;
}

.title {
  color: rgb(112, 112, 112);
  width: 75px;
}

.value {
  font-weight: 500;
}

.window-bottom {
  padding-top: 38px;
  text-align: center;
}

.sendMsg {
  display: inline-block;
  padding: 8px 45px;
  /* background-color: #1aad19; */
  background-color: #3fa7e4;
  color: white;
  font-size: 14px;
  cursor: pointer;
  border-radius: 3px;
}

.sendMsg:hover {
  background-color: #2495ce;
}
</style>
