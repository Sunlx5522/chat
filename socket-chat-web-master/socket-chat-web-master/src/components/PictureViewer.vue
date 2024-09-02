<template>
  <div class="picture-viewer" v-show="picSrc" :style="`background-color:rgba(0,0,0,${showPic ? '0.7' : '0'});`">
    <i class="iconfont icon-yuyinguanbi"></i>
    <div class="picture" :style="showPic ? style : originStyle">
      <img :src="picSrc" @dragstart.prevent alt="" v-clickoutside="closeViewer" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onBeforeMount, reactive, toRefs } from 'vue'
import useSubscribe from '@/hooks/subscribe'

export default defineComponent({
  name: 'picture-viewer',
  setup() {
    const state = reactive({
      picSrc: '',
      style: '',
      showPic: false,
      originStyle: '',
    })
    // 图片在移动动画中不能点击
    let disableClick = false

    // 生命周期
    onBeforeMount(() => {
      useSubscribe([{ msgName: 'viewPicture', callback: viewPicture }])
    })

    // methods
    const viewPicture = (name: string, target: HTMLImageElement) => {
      let rect = target.getBoundingClientRect()
      state.picSrc = target.src
      disableClick = true
      setTimeout(() => {
        disableClick = false
      }, 500)

      state.originStyle = `
          width:${target.clientWidth}px;
          height:${target.clientHeight}px;
          left:${rect.x}px;
          top:${rect.y}px;
        `

      state.style = `
          width: ${target.naturalWidth > document.body.clientWidth ? document.body.clientWidth : target.naturalWidth}px;
          height: ${target.naturalHeight > document.body.clientHeight ? document.body.clientHeight : target.naturalHeight}px;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
        `
      setTimeout(() => {
        state.showPic = true
      })
    }

    // 关闭viewer的回调
    const closeViewer = () => {
      if (!state.showPic || disableClick) return
      state.showPic = false
      window.removeEventListener('click', closeViewer)

      let timer = setTimeout(() => {
        state.picSrc = ''
        clearTimeout(timer)
      }, 500)
    }

    return {
      ...toRefs(state),
      closeViewer,
    }
  },
})
</script>

<style scoped>
.picture-viewer {
  position: fixed;
  height: 100vh;
  width: 100vw;
  background-color: rgba(0, 0, 0, 0);
  transition: 0.5s all ease-in-out;
  /* pointer-events: none; */
}

.picture {
  position: fixed;
  transition: 0.5s all ease-in-out;
}

.picture img {
  max-width: 100%;
  max-height: 100%;
  object-fit: cover;
  user-select: none;
}

.icon-yuyinguanbi {
  position: fixed;
  right: 30px;
  top: 30px;
  height: 40px;
  width: 40px;
  line-height: 40px;
  text-align: center;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 700;
  font-size: 20px;
  z-index: 10;
  cursor: pointer;
}
</style>
