<template>
  <div class="side-bar">
    <div class="side-bar-top">
      <div class="avatar">
        <img :src="store.state.userInfo && store.state.userInfo.avatar" alt="" />
      </div>
      <div class="page">
        <div class="page-item" v-for="item in pageList" :key="item.path">
          <i
            class="iconfont"
            :class="`${item.icon} ${route.path.indexOf(item.path) !== -1 ? 'current-page' : ''}`"
            @click="router.push(item.path)"
          ></i>
          <div
            class="unread-num"
            v-if="item.path === '/chat'"
            v-show="store.state.totalUnread != 0"
            v-text="store.state.totalUnread <= 99 ? store.state.totalUnread : '···'"
          ></div>
        </div>
      </div>
    </div>
    <div class="side-bar-bottom">
      <div
        class="bottom-item"
        @click="
          () => {
            if (proxy !== null) proxy.$refs.addFriendModal.visible = true
          }
        "
      >
        <i class="iconfont icon-jiajianzujianjiahao"></i>
      </div>
      <div class="bottom-item">
        <more-menu><i class="iconfont icon-gengduo"></i></more-menu>
      </div>
    </div>
    <add-friend-modal ref="addFriendModal"></add-friend-modal>
  </div>
</template>

<script lang="ts">
import addFriendModal from './addFriendModal.vue'
import MoreMenu from './MoreMenu.vue'
import { reactive, toRefs } from '@vue/reactivity'
import { useStore } from 'vuex'
import { useRoute, useRouter } from 'vue-router'
import { ComponentInternalInstance, defineComponent, getCurrentInstance } from '@vue/runtime-core'

export default defineComponent({
  components: { addFriendModal, MoreMenu },
  name: 'side-bar',
  // mixins: [sessionList],
  setup() {
    const store = useStore()
    const route = useRoute()
    const router = useRouter()
    const { proxy } = getCurrentInstance() as ComponentInternalInstance
    const state = reactive({
      pageList: [
        { icon: 'icon-liaotian-fill', path: '/chat', name: 'Chat' },
        { icon: 'icon-haoyoutuijie', path: '/friend', name: 'Friend' },
        { icon: 'icon-wenjianjia', path: '/file', name: 'File' },
      ],
    })

    return {
      ...toRefs(state),
      proxy,
      store,
      route,
      router,
    }
  },
})
</script>

<style scoped>
.side-bar {
  /* background-color: #2e2e2e; */
  background: #f0f0f0;
  border-right: 1px solid #ddd;
  width: 50px;
  min-width: 50px;
  padding: 30px 0 15px 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.avatar {
  margin-bottom: 25px;
}

.avatar img {
  border-radius: 5px;
  width: 37px;
  height: 37px;
  object-fit: cover;
}

.iconfont {
  /* color: rgba(255, 255, 255, 0.8); */
  /* color: #3fa7e4; */
  color: #1d89f5;
  font-size: 22px;
  border-radius: 5px;
  padding: 7px;
}

.current-page {
  background-color: #d3d3d3;
}

.page-item {
  margin: 20px 0;
  transition: 0.1s transform ease-out;
  position: relative;
}

.bottom-item {
  margin: 15px 0;
  transition: 0.1s transform ease-out;
}

.bottom-item .iconfont:active {
  background-color: #d9dbdb;
}

/* .page-item:hover,
.bottom-item:hover {
  transform: scale(1.1);
} */

.unread-num {
  position: absolute;
  font-size: 12px;
  height: 16px;
  width: 16px;
  right: 5px;
  top: 0px;
  border-radius: 50%;
  color: white;
  background-color: #f3453c;
  line-height: 16px;
  text-align: center;
}
</style>
