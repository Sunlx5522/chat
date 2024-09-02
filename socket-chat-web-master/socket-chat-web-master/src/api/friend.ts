import { Friend, User } from '@/type'
import request from '@/utils/request'

// 添加好友
const api_addFriend = (params: { requestId: number }) => {
  return request.get('/friends/add_friend', { params }) as unknown as addFriendType
}

type addFriendType = {
  code: number,
  userInfo: User,
}

// 获取好友列表
const api_getFriendList = () => {
  return request.get('/friends/get_friend_list') as unknown as getFriendListType
}

type getFriendListType = {
  code: number,
  list: Friend[]
}

// 删除好友
const api_deleteFriend = (params: { friendId: number }) => {
  return request.get('/friends/delete_friend', { params }) as unknown as deleteFriendType
}

type deleteFriendType = {
  code: number,
  msg: string,
}

export {
  api_addFriend,
  api_getFriendList,
  api_deleteFriend,
}