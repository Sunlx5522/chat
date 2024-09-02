<template>
  <div
    class="more-menu"
    v-clickoutside="
      () => {
        showMenu = false
      }
    "
  >
    <div class="menu" v-show="showMenu">
      <div class="menu-item">修改用户资料</div>
      <div class="menu-item">修改密码</div>
      <div class="menu-item" @click="logout">退出登录</div>
    </div>
    <div @click="showMenu = !showMenu">
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts">
import { api_logout } from '@/api/user'
import { reactive, toRefs } from '@vue/reactivity'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { defineComponent } from '@vue/runtime-core'
import store from '@/store'
import { Socket } from 'socket.io-client'

export default defineComponent({
  name: 'more-menu',
  setup() {
    const router = useRouter()
    const state = reactive({
      showMenu: false,
    })

    // methods
    // 点击退出登录的回调
    const logout = async () => {
      let res = await api_logout()
      if (res) {
        router.push('/login')
        message.info('退出登录成功!')
        // 断开websocket
        const socket = store.state.socket as Socket
        socket.disconnect()
        // socket = null
        store.commit('setSocket', null)
      }
    }

    return {
      ...toRefs(state),
      logout,
    }
  },
})
</script>

<style scoped>
.more-menu {
  position: relative;
}

.menu {
  border: 1px solid #eee;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
  position: absolute;
  background-color: #fff;
  width: 120px;
  font-size: 12px;
  padding: 3px 0;
  left: 40px;
  bottom: 8px;
  border-radius: 5px;
  z-index: 1;
}

.menu-item {
  border-bottom: 1px solid #eee;
  padding: 4px 8px;
  cursor: pointer;
}

.menu-item:hover {
  /* background-color: #129611; */
  background-color: #2495ce;
  color: white;
}

.menu-item:last-child {
  border: none;
}
</style>
