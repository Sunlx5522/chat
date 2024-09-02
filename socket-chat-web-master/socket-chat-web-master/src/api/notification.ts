import request from '@/utils/request'
import { Notification } from '@/type'

// 获取通知列表
const api_getNotiList = (params: { lastTime?: (number | string) }) => {
  return request.get('/notis/get_noti_list', { params }) as unknown as getNotiListType
}

type getNotiListType = {
  code: number,
  list: Notification[]
}

export {
  api_getNotiList
}