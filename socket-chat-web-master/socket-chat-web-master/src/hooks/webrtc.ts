import store from '@/store';
import { PC } from '@/type';
import { message } from 'ant-design-vue';
import { nextTick } from 'vue';

const pcOption = {
  iceServers: [{ urls: 'stun:stun.xten.com' }, { urls: 'stun:stun.voipbuster.com' }],
};

// 最大呼叫时间
const MAXCALLTIME = 15;

interface WebRtcType {
  // mode: sender / receiver
  mode: string;
  // type: videoCall / privateChat
  type: string[];
}

export default function ({ mode, type }: WebRtcType) {
  let remoteVideo: HTMLMediaElement;
  let localVideo: HTMLMediaElement;
  let mediaStream: MediaStream;
  let remoteStream: MediaStream;
  let dc: RTCDataChannel;
  let pc: PC;

  const onicecandidate = (e: RTCPeerConnectionIceEvent) => {
    if (e.candidate) {
      store.state.socket?.emit('webRTC', {
        type: 'candidate',
        data: e.candidate,
        receiverId: store.state.currentSession?.receiverId,
      });
    } else {
      console.log('候选人收集完成!');
    }
  };

  const ontrack = (e: RTCTrackEvent) => {
    nextTick(() => {
      remoteVideo = document.querySelector('#remote-video') as HTMLMediaElement;
      if (remoteVideo.srcObject !== e.streams[0]) {
        remoteVideo.srcObject = e.streams[0];
        remoteStream = e.streams[0];
      }
    });
  };

  const oniceconnectionstatechange = () => {
    // checking connected disconnected
    if (pc.iceConnectionState === 'disconnected') {
      hangup();
      message.info('对方已挂断通话!');
    }
  };

  const getLocalMediaStream = async () => {
    try {
      mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
    } catch (err) {
      console.log(err);
      message.error('获取媒体流失败, 请检查摄像头和麦克风权限哦!');
      hangup();
    }

    nextTick(() => {
      localVideo = document.querySelector('#local-video') as HTMLMediaElement;
      localVideo.srcObject = mediaStream;
    });

    // 绑定本地媒体数据到pc对象上
    mediaStream.getTracks().forEach((track) => {
      pc.addTrack(track, mediaStream);
    });
  };

  const hangup = () => {
    if (pc.iceConnectionState === 'new') {
      // 发送取消请求通知
      store.state.socket?.emit('webRTC', {
        type: 'videoReq',
        data: 'cancel',
        senderId: store.state.userInfo?.id,
        receiverId: store.state.currentSession?.receiverId,
      });
    }

    mediaStream?.getTracks().forEach((track) => track.stop());
    remoteStream?.getTracks().forEach((track) => track.stop());
    type = type.filter((item) => item !== 'videoCall');
    // 判断是否还存在其它类型
    if (!type.length) pc.close();

    store.commit('setChatStatus', { type: 'videoCall', status: false });
    store.commit('setPC', null);
  };

  const createAnswer = async () => {
    // 绑定远端sdp
    const answer = await pc.createAnswer();
    // 绑定本地sdp
    await pc.setLocalDescription(answer);
    // 发送本地sdp到远端
    store.state.socket?.emit('webRTC', {
      type: 'answer',
      data: answer,
      senderId: store.state.userInfo?.id,
      receiverId: store.state.currentSession?.receiverId,
    });
  };

  const createOffer = async () => {
    // 获取本地sdp(offer)
    const offer = await pc.createOffer();
    // 绑定本地sdp
    await pc.setLocalDescription(offer);
    // 发送本地sdp到远端
    store.state.socket?.emit('webRTC', {
      type: 'offer',
      data: offer,
      senderId: store.state.userInfo?.id,
      receiverId: store.state.currentSession?.receiverId,
    });
  };

  const createDataChannelFunc = () => {
    dc = pc.createDataChannel('privateChat');
    dc.onopen = (e) => {
      console.log('createDataChannel', e);
      dc.send('hi there!');
    };

    dc.onmessage = (e) => {
      console.log(e.data);
    };
  };

  const ondatachannel = (e: RTCDataChannelEvent) => {
    dc = e.channel;
    dc.onopen = (e) => {
      console.log('ondatachannel', e);
      dc.send('hi back');
    };

    dc.onmessage = (e) => {
      console.log(e.data);
    };
  };

  const closedown = () => {
    dc.close();
    type = type.filter((item) => item !== 'privateChat');
    // 判断是否还存在其它类型
    if (!type.length) pc.close();
  };

  // 视频通话需要开启的监听以及挂载的方法
  const videoCallHander = () => {
    // 监听到远端传过来的媒体数据
    pc.ontrack = ontrack;
    // 绑定本地媒体流后创建 answer
    getLocalMediaStream().then(() => {
      // create在对方接受邀请后才调用，因为发起方在邀请过程中就需要打开摄像头，而接收方只有在接受后才打开
      // if (mode === 'sender') { createOffer() } else
      if (mode === 'receiver') createAnswer();
    });

    // 创建offer的方法
    pc.createOfferFunc = createOffer;
    // 挂断视频通话的方法
    pc.hangup = hangup;
  };

  // 私密聊天需要开启的监听以及挂载的方法
  const privateChatHander = () => {
    // 接收端 datachannel
    pc.ondatachannel = ondatachannel;

    // 创建dataChannel的方法
    pc.createDataChannelFunc = createDataChannelFunc;
    // 关闭私密聊天的方法
    pc.closedown = closedown;
  };

  const init = () => {
    pc = new RTCPeerConnection(pcOption);
    store.commit('setPC', pc);
    // 修改当前聊天状态为视频通话状态
    // store.commit('setChatStatus', 1)
    store.commit('setChatStatus', { type: 'videoCall', status: true });

    // 监听
    // 监听 candidate
    pc.onicecandidate = onicecandidate;
    // 监听ice connection的状态改变
    pc.oniceconnectionstatechange = oniceconnectionstatechange;

    if (type.indexOf('videoCall') !== -1) {
      videoCallHander();
    }

    if (type.indexOf('privateChat') !== -1) {
      privateChatHander();
    }

    setTimeout(() => {
      if (pc?.iceConnectionState === 'new') {
        // new说明还没有进入连接状态   自动挂断
        message.info('通话暂时无人接听哦!');
        hangup();
      }
    }, MAXCALLTIME * 1000);
  };

  init();
}
