<template>
  <div class="chat-window" v-if="store.state.currentSession && store.state.currentSession.sessionId">
    <div class="chat-area">
      <chat-top-bar></chat-top-bar>
      <div v-if="store.state.currentSession.type !== 2">
        <chat-dialog></chat-dialog>
        <input-box></input-box>
      </div>
      <div v-else>
        <noti-dialog></noti-dialog>
      </div>
    </div>
    <video-window class="video-area"></video-window>
  </div>
  <div class="logo-page" v-else>
    <img :src="require('@/assets/img/logo.svg')" alt="" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/runtime-core'
import { useStore } from 'vuex'
import ChatDialog from './children/chatDialog/ChatDialog.vue'
import ChatTopBar from './children/ChatTopBar.vue'
import InputBox from './children/InputBox.vue'
import NotiDialog from './children/NotiDialog.vue'
import VideoWindow from './children/VideoWindow.vue'
export default defineComponent({
  components: { InputBox, ChatDialog, ChatTopBar, NotiDialog, VideoWindow },
  name: 'chat-window',
  setup() {
    const store = useStore()

    return {
      store,
    }
  },
})
</script>

<style lang="less" scoped>
.chat-window {
  /* background-color: #f5f5f5; */
  background-color: #f9f9f9;
  display: flex;
}

.chat-area,
.video-area {
  flex: 1;
}

.logo-page img {
  margin-left: calc(50% - 65px);
  margin-top: calc(45vh - 65px);
  height: 130px;
  width: 130px;
}
</style>
