import store from "@/store";
import { onBeforeMount } from "vue";
import useWebrtc from './webrtc'

import useSubscribe from './subscribe'
import { WebRtcMsg } from "@/type";

export default function () {
  // 生命周期
  onBeforeMount(() => {
    useSubscribe([{ msgName: 'webRTC', callback: (name: string, msg: WebRtcMsg) => rtcCallback(msg) }])
  })
}

const rtcCallback = (msg: WebRtcMsg) => {
  // console.log(msg);
  switch (msg.type) {
    case 'videoReq':
      reqHandler(msg);
      break;
    case 'offer':
      offerHandler(msg)
      break;
    case 'answer':
      answerHandler(msg)
      break;
    case 'candidate':
      candidateHandler(msg)
      break;
  }
}

const reqHandler = (msg: WebRtcMsg) => {
  if (msg.data === 'refuse') {
    // 拒绝
    store.state.pc?.hangup && store.state.pc.hangup()
  } else if (msg.data === 'accept') {
    // 接受
    store.state.pc?.createOfferFunc && store.state.pc.createOfferFunc()
  } else if (msg.data === 'cancel') {
    PubSub.publish('videoReq', msg)
  }
}

const offerHandler = async (msg: WebRtcMsg) => {
  useWebrtc({ mode: 'receiver', type: ['videoCall'] })
  const pc = store.state.pc;
  pc?.setRemoteDescription(new RTCSessionDescription(msg.data as RTCSessionDescriptionInit))
}

const answerHandler = (msg: WebRtcMsg) => {
  const pc = store.state.pc;

  pc?.setRemoteDescription(new RTCSessionDescription(msg.data as RTCSessionDescriptionInit))
}

const candidateHandler = (msg: WebRtcMsg) => {
  const pc = store.state.pc

  pc?.addIceCandidate(msg.data as RTCIceCandidate)
}
