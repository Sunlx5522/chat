export interface Subscribe {
  msgName: string,
  callback: any,
  token?: string,
}

export interface TimeTag {
  content: string;
  component: string;
  updatedAt: string,
}

// 双方的聊天记录，以及发送方当前发送的消息都是chatItem类型
export interface ChatItem {
  content: string,
  others: { [propname: string]: any },
  receiverId: number,
  senderId: number,
  sort: number,
  type: number,
  updatedAt: string,
  uuid?: string,
  component?: string,
  status?: string,
  fileInfo?: FileInfo,
  sessionId?: string,
  file?: File,
}

// export type MsgType = {
//   msgType: string,
//   status: string,
//   // SuccessMsg的time叫updatedAt 是为了和数据库字段保持一致
//   time?: string,
//   [propsname: string]: any
// }

// socket.on('message', xxx)
export type MsgType = SuccessMsg | FailMsg | FriendReqMsg | NotiMsg | LoginMsg

export interface SuccessMsg {
  msgType: string,
  status: string,
  updatedAt: string,
  content: string,
  uuid: string,
  sessionId: string,
  talkerId: string,
  type: string,
}

export interface FailMsg {
  msgType: string,
  status: string,
  uuid: string,
  time: string,
  content: string,
  sessionId: string,
}

export interface ReceiveMsg {
  content: string,
  updatedAt: string,
  sessionId: string,
  talkerId: string,
  type: number,
  others: { [propname: string]: any },
  component?: string
}

export interface FriendReqMsg {
  msgType: string,
  userInfo: User,
  content: string,
}

export interface NotiMsg {
  msgType: string
  status: string
  content: string
  time: number
}

export interface LoginMsg {
  msgType: string,
  status: string,
  time: string,
  content?: string,
}

export interface FileInfo {
  fileName: string,
  size: number,
}

export interface InputChatItem {
  content: (string | File),
  receiverId: number,
  uuid: string,
  type: number,
  sessionId: string,
  fileInfo?: FileInfo,
  senderId?: number,
  status?: string,
  updatedAt?: number,
  file?: File,
}

export interface User {
  id: number,
  userName: string,
  avatar: string,
  email: string | null,
  createdAt?: string,
}

// export type Friend = User 
export type Friend = User;

export interface FriendRequest {
  content: string,
  createdAt: string,
  friendId: number,
  handle: number,
  id: number,
  read: number,
  user: User,
  userId: number,
}

export interface Session {
  cover: string,
  lastChat: string,
  read: number,
  receiverId: number,
  sessionId: string,
  sessionName: string,
  type: number,
  updatedAt: string,
  user: User | null,
}

export interface Emoticon {
  id: number,
  createdAt: string,
  src: string,
  userId: number
}

export interface FileItem {
  createdAt: string,
  fileName: string,
  id: number,
  size: number,
  src: string,
  type: number,
  userId: number,
}

export interface Notification {
  createdAt: string,
  id?: number,
  type: number | null,
  userId?: number,
}

export interface RightClickMenu {
  menuList: { content: string, callback: any }[],
  position: { x: number, y: number }
}

export interface PC extends RTCPeerConnection {
  hangup?: () => void,
  createOfferFunc?: () => void,
  createDataChannelFunc?: () => void,
  closedown?: () => void
}

export interface WebRtcMsg {
  type: string,
  data: RTCSessionDescriptionInit | RTCIceCandidate | string,
  senderId: number,
  receiverId: number,
}

export interface UploadFileRes {
  code: number,
  src: string,
  fileName: string,
  msg?: string,
  emoticonId: number,
  size?: {
    width: number;
    height: number;
  },
}