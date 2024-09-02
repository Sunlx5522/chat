<template>
  <div class="chat-top-bar">
    <div class="bar-left">{{store.state.currentSession.sessionName}}</div>
  </div>
</template>

<script lang="ts">
  import { useStore } from 'vuex'
  export default {
    name: "chat-top-bar",
    setup() {
      const store = useStore()
      return {
        store,
      }
    }
  }
</script>

<style scoped>
  .chat-top-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 55px;
    border-bottom: 1px solid #ddd;
    padding: 0 27px;
  }

  .bar-left {
    font-size: 18px;
  }
</style>