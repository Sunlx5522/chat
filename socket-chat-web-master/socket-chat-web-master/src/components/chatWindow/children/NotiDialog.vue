<template>
  <div class="noti-dialog">
    <scroll-box
      class="scroll-box"
      listenHeight
      ref="scrollBox"
      :bottomDisabled="true"
      :topDisabled="topDisabled"
      @touchTop="touchTop"
    >
      <loading v-if="!topDisabled && notiList.length >= 30"></loading>
      <div class="noti-item" v-for="item in notiList" :key="item.createdAt">
        <div class="">
          <div class="noti-container" v-if="item.type === 0">
            <div class="noti-title">登录操作通知</div>
            <div class="noti-content">
              {{ `你的账号 "${store.state.userInfo.userName}" 进行了登录操作` }}
            </div>
            <div class="noti-detail">
              <div class="noti-detail-item">登录ID：{{ store.state.userInfo.id }}</div>
              <div class="noti-detail-item">登录时间：{{ item.createdAt && handleTime(item.createdAt) }}</div>
            </div>
          </div>
        </div>
      </div>
    </scroll-box>
  </div>
</template>

<script lang="ts">
import { api_getNotiList } from '@/api/notification'
import ScrollBox from '@/components/ScrollBox.vue'
import Loading from '@/components/Loading.vue'
import moment from 'moment'
import { reactive, toRefs } from '@vue/reactivity'
import { onMounted, nextTick, getCurrentInstance, computed, ComponentInternalInstance, onBeforeMount, defineComponent } from 'vue'
import { useStore } from 'vuex'
import { Notification, NotiMsg } from '@/type'
import useSubscribe from '@/hooks/subscribe'

export default defineComponent({
  components: { ScrollBox, Loading },
  name: 'noti-dialog',
  setup() {
    const { proxy } = getCurrentInstance() as ComponentInternalInstance
    const store = useStore()
    const state: State = reactive({
      notiList: [],
      // 禁止触顶
      topDisabled: false,
    })
    const compute = {
      handleTime: computed(() => (time: string) => moment(parseInt(time)).format('YYYY年MM月DD日 HH:mm')),
    }

    // 生命周期
    onBeforeMount(() => {
      useSubscribe([{ msgName: 'notice', callback: addNotification }])
    })

    onMounted(() => {
      // 第一次创建时直接请求通知数据
      getNotiList()
    })

    // methods
    const getNotiList = async (lastTime?: number | string) => {
      let res = await api_getNotiList({ lastTime })

      if (res) {
        let arr = res.list.reverse()
        if (!lastTime) {
          state.notiList.unshift(...arr)

          // 没传时间，则是第一次获取聊天记录，滚动到底部
          scrollToFunc('instant')
        } else {
          proxy &&
            (proxy.$refs.scrollBox as typeof ScrollBox).keepHeight(() => {
              state.notiList.unshift(...arr)
            })
        }

        // 聊天记录一次请求30条，小于30条说明没有更多聊天数据了
        state.topDisabled = arr.length !== 30
      }
    }

    // 触顶的回调
    const touchTop = () => {
      state.topDisabled = true
      getNotiList((state.notiList[0] as Notification).createdAt)
    }

    // 添加通知
    const addNotification = (name: string, noti: NotiMsg) => {
      let type = null
      switch (noti?.msgType) {
        case 'login':
          type = 0
          break
      }
      state.notiList.push({
        type,
        createdAt: noti.time.toString(),
      })

      // 判断当前是否离底，再进行滚动
      if ((proxy?.$refs.scrollBox as typeof ScrollBox).getIsBottom(100)) {
        scrollToFunc()
      }
    }

    // 聊天框滚动到底部
    const scrollToFunc = (behavior?: string) => {
      nextTick(() => {
        if (!proxy?.$refs.scrollBox) return
        ;(proxy.$refs.scrollBox as typeof ScrollBox).scrollToFunc(behavior)
      })
    }

    return {
      ...toRefs(state),
      ...compute,
      touchTop,
      store,
    }
  },
})

interface State {
  notiList: Notification[]
  topDisabled: boolean
}
</script>

<style scoped>
.noti-dialog {
  background: url('@/assets/img/chat_background.png') 0 0 no-repeat;
  background-size: 100%;
}

.scroll-box {
  height: calc(100vh - 55px);
  overflow-y: scroll;
  padding: 0 25px;
}

.noti-item {
  text-align: left;
  background-color: #fff;
  border-radius: 5px;
  font-size: 14px;
  padding: 14px 16px;
  width: 360px;
  margin: 30px auto;
  box-shadow: 0 0px 50px -12px rgba(0, 0, 0, 0.15);
}

.noti-title {
  font-size: 15px;
}

.noti-content {
  margin: 15px 0 20px;
}

.noti-detail-item {
  margin: 5px 0;
}
</style>
