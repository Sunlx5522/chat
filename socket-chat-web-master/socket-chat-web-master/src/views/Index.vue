<template>
  <div class="index">
    <!-- 侧边栏 -->
    <side-bar></side-bar>

    <router-view></router-view>
    <picture-viewer></picture-viewer>
    <right-click-menu></right-click-menu>
    <video-req-dialog></video-req-dialog>
    <tone-cmp ref="toneCmp"></tone-cmp>
  </div>
</template>

<script lang="ts">
import { api_getLogin } from '@/api/user'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import SideBar from '@/components/SideBar.vue'
import PictureViewer from '@/components/PictureViewer.vue'
import RightClickMenu from '@/components/RightClickMenu.vue'

import { defineComponent, onMounted } from '@vue/runtime-core'
import VideoReqDialog from '@/components/VideoReqDialog.vue'
import ToneCmp from '@/components/ToneCmp.vue'

import useSocketMsgHandler from '@/hooks/socketMsgHandler'
import useSessionList from '@/hooks/sessionList'

export default defineComponent({
  name: 'HomeView',
  components: {
    SideBar,
    PictureViewer,
    RightClickMenu,
    VideoReqDialog,
    ToneCmp,
  },
  setup() {
    const store = useStore()
    const router = useRouter()

    // 生命周期
    onMounted(async () => {
      // 如果vuex中没有用户信息，则判断是否处于登录状态
      if (!store.state.userInfo) {
        // 判断是否登录
        let res = await api_getLogin()
        if (res) store.commit('setUserInfo', res.userInfo)
        else router.push('/login')
      }
    })
    useSocketMsgHandler()
    useSessionList()

    return {}
  },
})
</script>

<style scoped>
.index {
  display: flex;
  height: 100vh;
  background-size: cover;
  position: relative;
}
</style>
