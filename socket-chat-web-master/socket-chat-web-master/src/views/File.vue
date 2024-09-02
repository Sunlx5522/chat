<template>
  <scroll-box
    class="file"
    listenHeight
    topDisabled
    :bottomDisabled="disabled"
    @touchBottom="getFileList(fileList[fileList.length - 1][fileList[fileList.length - 1].length - 1].createdAt)"
  >
    <div class="file-group" v-for="item in fileList" :key="item[0].createdAt">
      <div class="group-date">{{ timeHandler(item[0].createdAt) }}</div>
      <div class="group-container">
        <div
          class="group-item"
          v-for="i in item"
          :key="i.createdAt"
          :title="`大小: ${i.size} B\n创建时间戳: ${i.createdAt}\n地址: ${i.src}`"
        >
          <div class="item-cover">
            <!-- <img v-if="i.type === 1" :src="i.src" alt="" @click.stop="(e)=>{$bus.$emit('viewPicture', e.target)}"> -->
            <img v-if="i.type === 1" :src="i.src" alt="" @click.stop="checkImg" />
            <img v-else-if="i.type === 2" :src="require('@/assets/img/fileImg.png')" alt="" />
          </div>
          <div class="file-name">{{ i.fileName }}</div>
        </div>
      </div>
    </div>
    <loading class="loading" v-show="!disabled"></loading>
  </scroll-box>
</template>

<script lang="ts">
import { api_getFileList } from '@/api/files'
import ScrollBox from '@/components/ScrollBox.vue'
import Loading from '@/components/Loading.vue'

import Pubsub from 'pubsub-js'
import moment from 'moment'
import { computed, defineComponent, onMounted, reactive, toRefs } from 'vue'
import { FileItem } from '@/type'

export default defineComponent({
  components: { ScrollBox, Loading },
  name: 'file-page',
  setup() {
    const state: State = reactive({
      fileList: [],
      // 禁止加载新数据
      disabled: false,
    })
    const compute = {
      timeHandler: computed(() => {
        return function (time: string) {
          return moment(parseInt(time)).format('yyyy-MM-DD')
        }
      }),
    }

    // 生命周期
    onMounted(() => {
      getFileList()
    })

    // methods
    // 请求文件列表
    const getFileList = async (lastTime?: number) => {
      state.disabled = true

      let res = await api_getFileList({ lastTime })

      if (res) {
        groupByTime(res.list)
        state.disabled = res.list.length < 30
      }
    }

    // 将新增列表按照时间进行分组
    const groupByTime = (newList: FileItem[]) => {
      newList.forEach((item) => {
        if (!state.fileList.length) {
          state.fileList.push([item])
        } else {
          let time = state.fileList[state.fileList.length - 1][0].createdAt
          if (moment(parseInt(time)).isSame(moment(parseInt(item.createdAt)), 'date')) {
            state.fileList[state.fileList.length - 1].push(item)
          } else {
            state.fileList.push([item])
          }
        }
      })
      console.log(state.fileList)
    }

    const checkImg = (e: MouseEvent) => {
      Pubsub.publish('viewPicture', e.target)
    }

    return {
      ...toRefs(state),
      ...compute,
      checkImg,
      groupByTime,
      getFileList,
    }
  },
})

interface State {
  disabled: boolean
  fileList: FileItem[][]
}
</script>

<style scoped>
.file {
  padding: 10px 30px;
  height: 100vh;
  width: 100%;
  overflow: auto;
}

.group-date {
  text-align: left;
  font-weight: 600;
  font-size: 19px;
  margin: 20px 10px 2px;
}

.group-container {
  display: flex;
  flex-wrap: wrap;
}

.group-item {
  width: 90px;
  text-align: center;
  overflow: hidden;
  margin: 10px 5px;
  cursor: pointer;
}

.file-name {
  -webkit-line-clamp: 2;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-word;
}

.item-cover img {
  border-radius: 5px;
  height: 70px;
  width: 70px;
  object-fit: cover;
}

.loading {
  margin: 10px 0;
}
</style>
