<template>
  <div class="talker-item">
    <div class="avatar"><img :src="userInfo?.avatar" alt="" /></div>
    <div class="item-right">
      <div class="item-right-top" v-if="chat?.sort === 1">
        <span class="user-name">{{ userInfo?.userName }}</span>
        <span class="time">{{ chat?.updatedAt }}</span>
      </div>
      <div class="message-container" v-if="chat?.type == 0">
        <pre class="message" v-html="content"></pre>
      </div>
      <div
        class="image"
        v-else-if="chat.type == 1 || chat.type == 3"
        @click.right.prevent="rightClickPic($event, chat.content)"
        :style="imgStyle"
      >
        <img :src="chat.content" alt="" @dragstart.prevent @click.stop="checkImg" />
      </div>
      <download-card v-else-if="chat.type == 2" :file="chat.content" :fileInfo="fileInfo"></download-card>
      <div class="message-container message" v-if="chat.type == 5">
        <i class="iconfont icon-shipin"></i>对方发起了一个视频邀请
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { transToTag } from '@/utils/utils'
import DownloadCard from '@/components/DownloadCard.vue'

import Pubsub from 'pubsub-js'
import { reactive, computed, toRefs, onMounted, defineComponent } from 'vue'
import { useStore } from 'vuex'
import { ChatItem, User } from '@/type'

export default defineComponent({
  name: 'talker-item',
  components: { DownloadCard },
  props: {
    chat: {
      type: Object,
      default: (): ChatItem | null => {
        return null
      },
    },
  },
  setup(props) {
    const store = useStore()
    const state: State = reactive({
      // 用户信息
      userInfo: null,
    })
    const compute = {
      content: computed(() => transToTag(props.chat.content)),
      imgStyle: computed(() => {
        // 如果是blob开头, 说明是刚发送的图片
        if (/^blob:/.test(props.chat.content)) return ''
        let reg = /\??size=([0-9]{1,3}x[0-9]{1,3})&?/
        let arr = props.chat.content.match(reg)[1].split('x')
        return `width:${arr[0]}px;height:${arr[1]}px;`
      }),
      fileInfo: computed(() => {
        if (/^blob:/.test(props.chat.content)) return props.chat.fileInfo
        return JSON.parse(props.chat.others)
      }),
    }

    // 生命周期
    onMounted(() => {
      // 如果是私聊  用户信息可以直接从session里面取
      if (store.state.currentSession.type === 0) {
        state.userInfo = store.state.currentSession.user
      }
    })

    // methods
    // 右键点击图片的回调
    const rightClickPic = (e: MouseEvent, src: string) => {
      Pubsub.publish('rightMenu', {
        position: { x: e.x, y: e.y },
        menuList: [
          {
            content: '收藏至自定义表情',
            callback: () => {
              Pubsub.publish('addEmoticon', src)
            },
          },
        ],
      })
    }

    const checkImg = (e: MouseEvent) => {
      Pubsub.publish('viewPicture', e.target)
    }

    return {
      ...toRefs(state),
      ...compute,
      rightClickPic,
      checkImg,
    }
  },
})

interface State {
  userInfo: User | null
}
</script>

<style scoped>
.talker-item {
  display: flex;
  justify-content: flex-start;
  margin: 15px 0;
}

.avatar {
  margin-right: 10px;
  width: 36px;
  height: 36px;
  min-width: 36px;
  border-radius: 50%;
  overflow: hidden;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.message-container {
  position: relative;
  background-color: #ffffff;
  border-radius: 4px;
  border: 1px solid #eee;
}

.message {
  padding: 8px 13px;
  font-size: 14px;
  width: fit-content;
  font-family: 'Harmony Font';
  word-break: break-word;
  white-space: pre-wrap;
  text-align: left;
  margin: 0;
}

.message::selection {
  background-color: #279fdb;
}

.message-container::before {
  content: '';
  position: absolute;
  left: -3px;
  top: 7px;
  height: 4px;
  width: 4px;
  transform: rotateZ(-45deg);
  background-color: inherit;
  border-top: 1px solid #eee;
  border-left: 1px solid #eee;
}

.message-container:hover {
  background-color: #f6f6f6;
}

.image img {
  max-height: 200px;
  max-width: 200px;
  min-height: 50px;
  min-width: 50px;
  border-radius: 5px;
  border: 1px solid #eee;
  object-fit: cover;
  width: 100%;
  cursor: pointer;
  background-color: #fff;
}

.item-right > div,
.avatar {
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.05);
}
.icon-shipin {
  color: #18191c;
  margin-right: 5px;
}
</style>
