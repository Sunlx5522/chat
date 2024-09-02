<template>
  <div class="video-area" v-if="store.state.chatStatus.videoCall">
    <video id="local-video" autoplay muted></video>
    <video id="remote-video" autoplay controls @click.prevent></video>
    <div class="hangup-btn" @click="store.state.pc.hangup()">
      <i class="iconfont icon-guaduan"></i>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/runtime-core'
import { useStore } from 'vuex'

export default defineComponent({
  setup() {
    const store = useStore()

    return {
      store,
    }
  },
})
</script>

<style lang="less" scoped>
.video-area {
  background: #000;
  display: flex;
  align-items: center;
  position: relative;
  overflow: hidden;

  #remote-video {
    width: 100%;
  }

  #local-video {
    width: 150px;
    position: absolute;
    right: 20px;
    top: 20px;
  }

  .hangup-btn {
    position: absolute;
    bottom: -40px;
    left: calc(50% - 20px);
    border-radius: 50%;
    background-color: #ff3b32;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 40px;
    width: 40px;
    transition: ease 0.3s;

    .iconfont {
      color: white;
      font-size: 27px;
    }
  }
}

.video-area:hover {
  .hangup-btn {
    // bottom: 20px;
    transform: translateY(-60px);
  }
}
</style>
