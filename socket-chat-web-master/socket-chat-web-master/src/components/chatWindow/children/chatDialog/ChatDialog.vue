<template>
  <div class="chat-dialog" @drop.prevent="message.info('拖动到输入框可以直接发送文件哦')" @dragover.prevent>
    <scroll-box
      class="scroll-box"
      listenHeight
      ref="scrollBox"
      :topDisabled="topDisabled"
      @touchTop="getChatList(Number(chatList[0].updatedAt))"
    >
      <loading v-if="!topDisabled && chatList.length >= 30"></loading>
      <component
        :is="item.component"
        v-for="item in chatList"
        :key="item.updatedAt"
        :chat="item"
        :content="item.content"
      ></component>
    </scroll-box>
  </div>
</template>

<script lang="ts">
import { api_getChatList } from '@/api/chat';
import userItem from './children/userItem.vue';
import TalkerItem from './children/talkerItem.vue';
import NotificationTag from './children/NotificationTag.vue';
import ScrollBox from '@/components/ScrollBox.vue';
import Loading from '@/components/Loading.vue';

import moment from 'moment';
import { reactive, toRefs } from '@vue/reactivity';
import useSubscribe from '@/hooks/subscribe';

import {
  onBeforeUnmount,
  onMounted,
  nextTick,
  getCurrentInstance,
  watch,
  onBeforeMount,
  ComponentInternalInstance,
  defineComponent,
  // ref,
} from 'vue';
import { useStore } from 'vuex';

import { Canceler } from 'axios';
import { TimeTag, SuccessMsg, FailMsg, ReceiveMsg, ChatItem } from '@/type';
import { message } from 'ant-design-vue';

export default defineComponent({
  components: { userItem, TalkerItem, ScrollBox, Loading, NotificationTag },
  name: 'chat-dialog',
  props: {
    // 当前的sessionId
    sessionId: String,
  },
  setup() {
    const store = useStore();
    const { proxy } = getCurrentInstance() as ComponentInternalInstance;
    const state: State = reactive({
      chatList: [],
      // 禁止触顶
      topDisabled: false,
      // 取消请求聊天列表的方法
      cancelChatListFunc: null,
    });
    // let scrollBox = ref(null)
    let scrollBox: typeof ScrollBox | null = null;

    let timeTagFunc: ((item1: ChatItem | ReceiveMsg, item2: ChatItem | ReceiveMsg) => TimeTag | undefined) | null =
      null;

    // 生命周期
    onBeforeMount(() => {
      timeTagFunc = createTimeTag();

      useSubscribe([
        // 监听输入框发送的消息
        { msgName: 'sendMsg', callback: sendMsg },
        // 接收其它用户发送的消息
        { msgName: 'chat', callback: receiveChat },
        // 发送消息成功
        { msgName: 'sendMsgSuccess', callback: sendMsgSuccess },
        // 发送消息失败
        { msgName: 'sendMsgFail', callback: sendMsgFail },
      ]);
    });
    onMounted(() => {
      // scrollBox=scrollBox.value && (scrollBox.value as typeof ScrollBox)
      scrollBox = proxy && (proxy.$refs.scrollBox as typeof ScrollBox);
      // 第一次创建时直接请求聊天数据
      getChatList();
    });

    onBeforeUnmount(() => {
      state.cancelChatListFunc && state.cancelChatListFunc();
    });

    // methods
    // 请求
    // 请求聊天记录
    const getChatList = async (lastTime?: number) => {
      state.topDisabled = true;
      let res = await api_getChatList({ sessionId: store.state.currentSession.sessionId, lastTime }, state);
      if (res) {
        let arr = insertTimeTag(res.list);
        insertChatList(!lastTime, arr);

        // 聊天记录一次请求30条，小于30条说明没有更多聊天数据了
        state.topDisabled = arr.length < 30;
        state.cancelChatListFunc = null;
      }
    };

    // 插入聊天的方法
    const insertChatList = (init: boolean, arr: (ChatItem | TimeTag)[]) => {
      if (init) {
        state.chatList.unshift(...arr);
        scrollToFunc('instant');
      } else {
        scrollBox &&
          scrollBox.keepHeight(() => {
            state.chatList.unshift(...arr);
          });
      }
    };

    // 输入框发送消息的回调
    const sendMsg = (name: string, chatItem: ChatItem) => {
      let list = state.chatList;
      let timeTag = timeTagFunc && timeTagFunc(chatItem, list.at(-1) as ChatItem);
      timeTag && list.push(timeTag);
      chatItem.component = 'user-item';
      list.push(chatItem);
      // 自己发消息，直接滚到底部
      // 读取本地图片并加载需要一定时间, 监听img的onload事件是更好的做法, 但是这里不想弄了, 定时器凑合一下
      let timer = setTimeout(() => {
        scrollToFunc();
        clearTimeout(timer);
        timer = -1;
      }, 50);
    };

    // 接收别的用户发送的消息
    const receiveChat = (name: string, msg: ReceiveMsg) => {
      let list = state.chatList;
      // 先判断是否是当前会话
      if (msg.sessionId !== store.state.currentSession.sessionId) return;
      let timeTag = timeTagFunc && timeTagFunc(msg, list.at(-1) as ChatItem | ReceiveMsg);
      timeTag && list.push(timeTag);
      if (msg.type == 4) {
        msg.component = 'notification-tag';
      } else {
        msg.component = msg.talkerId == store.state.currentSession.receiverId ? 'talker-item' : 'user-item';
      }
      list.push(msg);
      // 判断当前是否离底，再进行滚动, 100表示100px内都是触底范围
      scrollBox && scrollBox.getIsBottom(100) && scrollToFunc();
    };

    // 消息发送成功后的回调
    const sendMsgSuccess = (name: string, msg: SuccessMsg) => {
      let list = state.chatList;
      // 倒序遍历数组，因为刚发送的消息一般接近底部
      for (let i = list.length - 1; i >= 0; i--) {
        let item = list[i] as ChatItem;
        if (item.uuid === msg.uuid) {
          // this.chatList[i] = msg
          item.updatedAt = msg.updatedAt;
          item.status = 'success';
          if (item.type === 1) {
            item.content = msg.content;
          }
          break;
        }
      }
    };

    // 发送消息失败的回调
    const sendMsgFail = (name: string, msg: FailMsg) => {
      // 判断是否处在对应的session
      if (store.state.currentSession.sessionId !== msg.sessionId) return;

      let list = state.chatList;
      // 倒序遍历数组，因为刚发送的消息一般接近底部
      for (let i = list.length - 1; i >= 0; i--) {
        let item = list[i] as ChatItem;
        if (item.uuid === msg.uuid) {
          item.status = 'fail';
          break;
        }
      }
    };

    // 聊天框滚动到底部
    const scrollToFunc = (behavior?: string) => {
      nextTick(() => {
        if (proxy && !proxy.$refs.scrollBox) return;
        scrollBox && scrollBox.scrollToFunc(behavior);
      });
    };

    // 请求获取的聊天记录中插入 Tag
    const insertTimeTag = (chatList: ChatItem[]) => {
      let arr: (ChatItem | TimeTag)[] = [];
      let userId = store.state.userInfo.id;

      chatList.forEach((item, index, list) => {
        // 通知
        if (item.type == 4) {
          item['component'] = 'notification-tag';

          switch (item.content) {
            case 'deleteFriend':
              // 删除好友通知
              item.content = (item.senderId == userId ? '您已与对方' : '对方已与您') + '解除好友关系';
              break;
            default:
              break;
          }
        } else {
          // 其它类型信息
          item['component'] = item.senderId == userId ? 'user-item' : 'talker-item';
        }
        arr.unshift(item);

        let timeTag = index < list.length - 1 && timeTagFunc && timeTagFunc(item, list[index + 1]);
        if (timeTag) arr.unshift(timeTag);
      });
      return arr;
    };

    // 将本日和本周时间戳闭包
    const createTimeTag = () => {
      // 当天0点时间戳
      let today = moment().startOf('day').valueOf();
      let thisWeek =
        moment()
          .week(moment().week() - 1)
          .startOf('week')
          .valueOf() + 86400000;

      return function (item1: ChatItem | ReceiveMsg, item2: ChatItem | ReceiveMsg) {
        // 间隔超过5分钟显示时间节点标签
        let updatedAt_item1 = parseInt(item1.updatedAt);
        let updatedAt_item2 = parseInt(item2.updatedAt);
        if (updatedAt_item1 - updatedAt_item2 > 5 * 60000) {
          let time = null;
          if (updatedAt_item1 > today) time = moment(updatedAt_item1).format('HH:mm');
          else if (updatedAt_item1 > thisWeek) time = moment(updatedAt_item1).locale('zh-cn').format('dddd HH:mm');
          else time = moment(updatedAt_item1).format('YYYY年MM月DD日 HH:mm');

          return { content: time, component: 'notification-tag', updatedAt: updatedAt_item1.toString() };
        }
      };
    };

    // watch
    watch(
      () => store.state.currentSession,
      (current) => {
        state.chatList = [];
        state.cancelChatListFunc && state.cancelChatListFunc('cancelChatListFunc');
        if (current.receiverId !== -1) {
          // receiverId为 -1 时是系统通知
          getChatList();
        }
      },
    );

    return {
      ...toRefs(state),
      getChatList,
      message,
    };
  },
});

type State = {
  chatList: (ChatItem | TimeTag | ReceiveMsg)[];
  topDisabled: boolean;
  cancelChatListFunc: null | Canceler;
};
</script>

<style scoped>
.chat-dialog {
  background: url('@/assets/img/chat_background.png') 0 0 no-repeat;
  background-size: 100%;
}

.scroll-box {
  height: calc(100vh - 228.5px);
  overflow-y: scroll;
  padding: 0 25px;
}
</style>
