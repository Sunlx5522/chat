import { ChatItem } from "@/type";
import request from "@/utils/request";
import axios from "axios";

// 获取聊天记录
const api_getChatList = (params: { sessionId: string; lastTime?: number }, state: { [propname: string]: any }) => {
  return request.get("/chats/get_chat_list", {
    params,
    cancelToken: new axios.CancelToken(function executor(c) {
      state.cancelChatListFunc = c;
    }),
  }) as unknown as getChatListType;
}

type getChatListType = {
  code: number,
  list: ChatItem[]
}

// 请求返回内容类型
// export type getChatListType = {

// }

export {
  api_getChatList
}