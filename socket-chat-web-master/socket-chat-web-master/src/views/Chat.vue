<template>
  <div class="chat">
    <!-- 好友列表 -->
    <session-list></session-list>
    <chat-window class="chat-window"></chat-window>
  </div>
</template>

<script lang="ts">
import ChatWindow from '@/components/chatWindow/ChatWindow.vue'
import SessionList from '@/components/SessionList.vue'
import { defineComponent } from '@vue/runtime-core'

export default defineComponent({
  components: { ChatWindow, SessionList },
  name: 'chat-page',
})
</script>

<style scoped>
.chat {
  display: flex;
  width: 100%;
}

.chat-window {
  flex: 1;
}
</style>
