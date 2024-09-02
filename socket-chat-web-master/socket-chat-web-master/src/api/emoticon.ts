import { Emoticon } from '@/type'
import request from '@/utils/request'

// 获取表情列表
const api_getEmoticonList = () => {
  return request.get('/emoticons/get_emoticon_list') as unknown as getEmoticonListType
}

type getEmoticonListType = {
  code: number,
  list: Emoticon[]
}

// 添加自定义表情  不包含上传
const api_addEmoticon = (params: { src: string }) => {
  return request.get('/emoticons/add_emoticon', { params }) as unknown as addEmoticonType
}

type addEmoticonType = {
  code: number,
  id: number,
  src: string
}

export {
  api_getEmoticonList,
  api_addEmoticon,
}