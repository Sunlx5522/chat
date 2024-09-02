import { FriendRequest } from '@/type'
import request from '@/utils/request'

// 发送好友请求
const api_addFriendReq = (params: { friendId: number | string, content: string }) => {
  return request.get('/friend_requests/add_friend_request', { params }) as unknown as addFriendReqType
}

type addFriendReqType = {
  code: number,
  msg: string,
}

// 获取好友请求列表
const api_getFriendReqList = (params: { lastTime?: number }) => {
  return request.get('/friend_requests/get_friend_request_list', { params }) as unknown as getFriendReqListType
}

type getFriendReqListType = {
  code: number,
  list: FriendRequest[]
}

export {
  api_addFriendReq,
  api_getFriendReqList,
}