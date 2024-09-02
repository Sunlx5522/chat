<template>
  <!-- 添加好友的对话框 -->
  <a-modal
    class="add-friend-modal"
    title="添加好友"
    :visible="visible"
    :confirm-loading="confirmLoading"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <div class="input-container"><span>用户ID:</span><input type="text" v-model="userId" /></div>
    <div class="input-container"><span>添加好友说明:</span><input type="text" v-model="content" /></div>
  </a-modal>
</template>

<script lang="ts">
import { api_addFriendReq } from '@/api/friendRequest'
import { reactive, toRefs } from '@vue/reactivity'
import { defineComponent } from '@vue/runtime-core'
import { message } from 'ant-design-vue'
import { useStore } from 'vuex'

export default defineComponent({
  name: 'add-friend-modal',
  setup() {
    const store = useStore()
    const state = reactive({
      userId: '',
      content: '',
      visible: false,
      confirmLoading: false,
    })

    // methods
    const showModal = () => {
      state.visible = true
    }

    const handleCancel = () => {
      state.visible = false
    }

    const handleOk = async () => {
      if (!state.userId.trim()) {
        message.warning('用户ID不能为空哦!')
        return
      }

      state.confirmLoading = true

      let res = await api_addFriendReq({
        friendId: state.userId.trim(),
        content: state.content.trim() || `你好, 我是${store.state.userInfo.userName}`,
      })
      if (res) message.success('请求发送成功!')

      // Object.assign(this.$data, this.$options.data())
      state.userId = ''
      state.content = ''
      state.visible = false
      state.confirmLoading = false
    }

    return {
      ...toRefs(state),
      showModal,
      handleCancel,
      handleOk,
    }
  },
})
</script>

<style scoped>
input {
  border: 1px solid #ccc;
  padding: 5px 10px;
  border-radius: 5px;
}

input:focus {
  outline: none;
}

.input-container {
  margin: 10px;
}

.input-container span {
  display: inline-block;
  width: 100px;
}
</style>
