<template>
  <div class="video-req-dialog" :class="{ 'show-dialog': dialogShow }">
    <div class="dialog-top">
      <img class="avatar" :src="userInfo?.avatar" alt="" />
      <span class="user-name">{{ userInfo?.userName }}</span>
      <span>邀请你进行视频通话</span>
    </div>
    <div class="dialog-btns">
      <div class="btn-item refuse" @click="refuseHandler"><i class="iconfont icon-guaduan"></i>拒绝</div>
      <div class="btn-item accept" @click="acceptHandler"><i class="iconfont icon-jieting"></i>接受</div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onBeforeMount, reactive, toRefs } from '@vue/runtime-core'
import useSubscribe from '@/hooks/subscribe'
import { User, WebRtcMsg } from '@/type'
import { api_getUserInfo } from '@/api/user'
import store from '@/store'
import { useRoute, useRouter } from 'vue-router'
import { message } from 'ant-design-vue'

export default defineComponent({
  setup() {
    const route = useRoute()
    const router = useRouter()
    const state: State = reactive({
      // 是否展示视频邀请框
      dialogShow: false,
      userInfo: null,
    })

    // 生命周期
    onBeforeMount(() => {
      useSubscribe([{ msgName: 'videoReq', callback: videoReqHandler }])
    })

    const videoReqHandler = async (name: string, msg: WebRtcMsg) => {
      if (msg.data === 'cancel') {
        message.info('对方已取消视频通话请求')
        state.dialogShow = false
        return
      }
      // 请求用户信息
      let res = await api_getUserInfo({ userId: msg.senderId })
      // console.log(res)
      state.userInfo = res.userInfo
      state.dialogShow = true
      setTimeout(() => (state.dialogShow = false), 15000)
    }

    const acceptHandler = () => {
      // 跳转至chat选择对应的session
      store.commit('selectSessionById', state.userInfo?.id)
      // 判断当前是否在chat页面
      if (!/^\/chat/.test(route.path)) {
        router.push('/chat')
      }

      store.state.socket?.emit('webRTC', {
        type: 'videoReq',
        data: 'accept',
        senderId: store.state.userInfo?.id,
        receiverId: state.userInfo?.id,
      })

      state.dialogShow = false
    }

    const refuseHandler = () => {
      store.state.socket?.emit('webRTC', {
        type: 'videoReq',
        data: 'refuse',
        senderId: store.state.userInfo?.id,
        receiverId: state.userInfo?.id,
      })

      state.dialogShow = false
    }

    return {
      ...toRefs(state),
      acceptHandler,
      refuseHandler,
    }
  },
})

interface State {
  dialogShow: boolean
  userInfo: User | null
}
</script>

<style scoped lang="less">
.show-dialog {
  transform: none !important;
}

.video-req-dialog {
  border-radius: 10px;
  box-shadow: 0 5px 50px -12px rgba(0, 0, 0, 0.3);
  position: fixed;
  bottom: 40px;
  right: 10px;
  transform: translateX(calc(100% + 10px));
  transition: 0.3s transform ease;
  padding: 10px;
  background-color: #fff;
  z-index: 10;

  .dialog-top {
    display: flex;
    align-items: center;

    .avatar {
      height: 35px;
      width: 35px;
      object-fit: cover;
      border-radius: 50%;
    }

    .user-name {
      font-weight: 600;
      margin: 0 5px;
    }
  }

  .dialog-btns {
    display: flex;
    justify-content: center;
    margin-top: 10px;

    .btn-item {
      padding: 3px 10px;
      cursor: pointer;
      margin: 0 10px;
      border-radius: 10px;
      color: #f9fffe;
      font-size: 13px;
      user-select: none;

      .iconfont {
        color: #f9fffe;
        margin-right: 5px;
      }
    }
  }
}

.refuse {
  background-color: #ff3b30;
}

.accept {
  background-color: #4cd862;
}
</style>
