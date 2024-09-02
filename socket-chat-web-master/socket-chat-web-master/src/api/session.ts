import { Session } from '@/type'
import request from '@/utils/request'
// import axios from 'axios'

// 获取会话列表数据
// export function api_getSessionList(params, that) {
const api_getSessionList = (params: { lastTime?: string }) => {
  return request.get('/sessions/get_session_list', { params }) as unknown as getSessionListType
}

type getSessionListType = {
  code: number,
  list: Session[],
  total: number,
}

// 重置session的未读数量（弃用，走socket的方案，因为重置未读数量的方法调用十分频繁, 且无需返回结果）
// export function api_resetUnread(params) {
//   return request.get('/sessions/reset_unread', { params })
// }


export {
  api_getSessionList,
}