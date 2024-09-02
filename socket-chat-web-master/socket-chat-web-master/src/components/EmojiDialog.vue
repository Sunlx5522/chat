<template>
  <div
    class="emoji-dialog"
    v-clickoutside="
      () => {
        showDialog = false
      }
    "
  >
    <div class="emoji-container" v-show="showDialog">
      <div class="emoticon-tab" v-show="currentTab === 0" @click="selectEmoji($event, 0)">
        <!-- @click="selectEmoji(0, item)" -->
        <div
          class="emoji-item"
          v-for="item in emojiNum"
          :key="item"
          :style="{ 'background-position': `0 ${-24 * item}px` }"
        ></div>
      </div>
      <!-- <div class="emoticon-tab" v-show="currentTab === 1" v-lazy-container="{selector:'img'}"> -->
      <div class="emoticon-tab" v-show="currentTab === 1" v-lazyload @click="selectEmoji($event, 1)">
        <a-upload
          name="file"
          list-type="picture-card"
          class="avatar-uploader emoticon-item"
          :data="{ emoticon: true }"
          :show-upload-list="false"
          action="/api/files/upload_file"
          :before-upload="beforeUpload"
          @change="handleChange"
        >
          <div>
            <!-- <a-icon :type="uploadEmoLoading ? 'loading' : 'plus'" /> -->
            <loading-outlined v-if="imgLoading"></loading-outlined>
            <plus-outlined v-else></plus-outlined>
          </div>
        </a-upload>
        <img class="emoticon-item" v-for="i in emoticonList" :key="i.id" :data-src="i.src" @dragstart.prevent />
      </div>
      <!-- tab-selector -->
      <div class="tab-selector">
        <div class="tab-item" :class="{ 'current-tab-item': currentTab == 0 }" @click="currentTab = 0">
          <i class="iconfont icon-biaoqing-xue"></i>
        </div>
        <div class="tab-item" :class="{ 'current-tab-item': currentTab == 1 }" @click="currentTab = 1">
          <i class="iconfont icon-jushoucang"></i>
        </div>
      </div>
    </div>
    <div class="btnContainer" @click="showDialog = !showDialog">
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts">
import { api_getEmoticonList, api_addEmoticon } from '@/api/emoticon'
import { reactive, toRefs } from '@vue/reactivity'
import { defineComponent, onBeforeMount, onMounted } from '@vue/runtime-core'
import { message } from 'ant-design-vue'
import useSubscribe from '@/hooks/subscribe'
import { PlusOutlined, LoadingOutlined } from '@ant-design/icons-vue'
import useAUploadHook from '@/hooks/aUploadHook'

export default defineComponent({
  name: 'emoji-dialog',
  components: { PlusOutlined, LoadingOutlined },
  setup(props, { emit }) {
    const state: State = reactive({
      // 是否展示表情框
      showDialog: false,
      emojiNum: 124,
      // 当前表情框索引
      currentTab: 0,
      // 表情包列表
      emoticonList: [],
    })

    onBeforeMount(() => {
      useSubscribe([{ msgName: 'addEmoticon', callback: addEmoticon }])
    })

    // 生命周期
    onMounted(async () => {
      // 获取自定义表情列表
      let res = await api_getEmoticonList()
      if (res) state.emoticonList = res.list
    })

    // methods
    // 点击选择表情的回调
    // type: 0:emoji   1:自定义表情
    const selectEmoji = (e: any, type: number) => {
      let item: number | string | undefined
      // 事件委托
      if (type === 0) {
        item = e.target.__vnode.key
      } else if (type === 1) {
        item = e.target.currentSrc
      }

      if (!item) return

      emit('selectEmoji', { type, item })
      state.showDialog = false
    }

    const { imgLoading, handleChange, beforeUpload } = useAUploadHook((response) => {
      const src = response.src + '?size=' + response.size?.width + 'x' + response.size?.height
      state.emoticonList.unshift({ id: response.emoticonId, src })
    })

    const addEmoticon = async (name: string, src: string) => {
      let res = await api_addEmoticon({ src })
      if (res) {
        message.success('表情收藏成功')
        state.emoticonList.unshift({ src: res.src, id: res.id })
      }
    }

    return {
      ...toRefs(state),
      selectEmoji,
      handleChange,
      beforeUpload,
      imgLoading,
    }
  },
})

interface State {
  showDialog: boolean
  emojiNum: number
  currentTab: number
  emoticonList: { id: number; src: string }[]
}
</script>

<style scoped>
.emoji-dialog {
  position: relative;
}

.emoji-container {
  position: absolute;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  width: 322px;
  /* height: 221px; */
  bottom: 35px;
  left: -22px;
  background-color: #fff;
  border-radius: 5px;
}

.emoticon-tab {
  width: 100%;
  height: 190px;
  padding: 10px;
  display: flex;
  flex-wrap: wrap;
  overflow-y: scroll;
}

.emoji-item {
  height: 22px;
  width: 24px;
  background: url('@/assets/emoji/emoji.png');
  background-repeat: no-repeat;
  background-size: 24px;
  user-select: none;
  cursor: pointer;
  margin: 7px 9px;
}

.tab-selector {
  display: flex;
  border-top: 1px solid #eee;
  padding: 5px 10px;
}

.tab-item {
  /* background-color: pink; */
  margin: 0 5px;
  display: flex;
  height: 30px;
  width: 30px;
  justify-content: center;
  align-items: center;
  border-radius: 5px;
}

.tab-item i {
  font-size: 22px;
  color: rgb(87, 87, 87);
}

.current-tab-item {
  background-color: #e5e5e5;
}

.emoticon-item {
  height: 65px;
  width: 65px;
  object-fit: cover;
  border-radius: 5px;
  margin: 4px;
  cursor: pointer;
}

.avatar-uploader /deep/ .ant-upload {
  display: flex;
  width: 100%;
  height: 100%;
  justify-content: center;
  align-items: center;
}

.avatar-uploader /deep/ .ant-upload:hover {
  /* border-color: #1aad19; */
  border-color: #2495ce;
}
</style>
