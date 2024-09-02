import { UploadFileRes } from '@/type'
import { message, UploadChangeParam } from 'ant-design-vue'
import { ref } from 'vue'

export default function (doneCallback: (response: UploadFileRes) => void) {
  const imgLoading = ref(false)

  const handleChange = (info: UploadChangeParam) => {
    if (info.file.status === 'uploading') {
      imgLoading.value = true
      return
    }
    if (info.file.status === 'done') {
      // state.registerInfo.avatar = info.file.response.src
      doneCallback(info.file.response)
      imgLoading.value = false
    }
  }

  const beforeUpload = (file: File) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png'
    if (!isJpgOrPng) {
      message.error('只能上传 JPG/PNG 格式的文件哦')
    }
    const isLt2M = file.size / 1024 / 1024 < 2
    if (!isLt2M) {
      message.error('图片大小不能超过2M')
    }
    return isJpgOrPng && isLt2M
  }

  return {
    imgLoading,
    handleChange,
    beforeUpload,
  }
}