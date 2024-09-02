<template>
  <div class="input-container">
    <div
      class="chat-input"
      contenteditable
      @mousedown="getLastLocation"
      @keydown="keydownFunc"
      @keyup="keyupFunc"
      @paste.prevent="pasteFunc"
      @input="inputFunc"
    ></div>
  </div>
</template>

<script lang="ts">
import { transToTag } from '@/utils/utils';
import { reactive, toRefs } from '@vue/reactivity';
import { ComponentInternalInstance, defineComponent, getCurrentInstance, onMounted } from '@vue/runtime-core';
import { message } from 'ant-design-vue';

export default defineComponent({
  name: 'chat-input',
  setup(props, { emit }) {
    const { proxy } = getCurrentInstance() as ComponentInternalInstance;
    const state = reactive({
      content: '',
    });
    // 光标最后的位置
    let lastLocation: Range | null = null,
      chatInput: HTMLElement,
      selection: Selection | null;

    // 生命周期
    onMounted(() => {
      chatInput = proxy && proxy.$el.querySelector('.chat-input');
      selection = getSelection();
    });

    // methods
    // api
    // 插入表情
    const addEmoji = (index: number) => {
      lastLocation || getLastLocation();

      let emoji = document.createElement('img');
      emoji.src =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABAQMAAAAl21bKAAAAA1BMVEUAAACnej3aAAAAAXRSTlMAQObYZgAAAApJREFUCNdjYAAAAAIAAeIhvDMAAAAASUVORK5CYII=';
      emoji.alt = `[emoji-${index}]`;
      emoji.draggable = false;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      emoji.style = `
        height: 22px;
        width: 24px;
        background: url(${require('@/assets/emoji/emoji.png')});
        background-repeat: no-repeat;
        background-size: 24px;
        margin:0 1px;
        background-position:0 ${-24 * index}px;
        vertical-align: text-bottom;
      `;
      insertNode(emoji);
    };

    // 发送消息
    const sendMsg = () => {
      let content = chatInput.innerHTML.trim();
      if (content === '') {
        message.warn('发送内容不能为空哦');
        return;
      } else if (content.length > 5000) {
        message.warn('发送内容长度不能超过5000哦');
        return;
      }

      content = getAltValue(content);
      content = content.replace(/</gi, '&lt;').replace(/>/gi, '&gt;');

      emit('sendMsg', content);
      chatInput.innerHTML = '';
    };

    // 事件回调
    // 粘贴事件
    const pasteFunc = (e: ClipboardEvent) => {
      // console.log(e.clipboardData.files[0]);
      let file = e.clipboardData?.files[0];
      if (file) {
        emit('uploadFile', file);
        return;
      }

      // 去除样式
      let content = e.clipboardData?.getData('text');
      // 转译标签，防止用户手动插入标签
      content = content?.replace(/</gi, '&lt;').replace(/>/gi, '&gt;');

      content = content && transToTag(content);
      // 将文本插回光标处
      document.execCommand('insertHTML', false, content);
      inputFunc();
    };

    // 输入的回调
    const inputFunc = () => {
      getLastLocation();

      // contenteditable末尾换行必须至少存在一个\n
      if (!/\n$/.test(chatInput.innerHTML)) {
        let node = document.createTextNode('\n');
        chatInput.appendChild(node);
      }
    };

    // 键盘按下的回调
    const keydownFunc = (e: KeyboardEvent) => {
      let kc = e.keyCode;
      if (e.ctrlKey && kc === 13) {
        e.preventDefault();
        let node = document.createTextNode('\n');
        insertNode(node);
        chatInput.scrollTo({
          top: chatInput.scrollTop + 20,
          behavior: 'smooth',
        });
      } else if (kc === 13) {
        e.preventDefault();
        sendMsg();
      }
    };

    // 键盘弹起的回调
    const keyupFunc = (e: KeyboardEvent) => {
      let kc = e.keyCode;
      if (kc >= 37 && kc <= 40) {
        getLastLocation();
      } else if (kc === 8) {
        // 退格在删完最后一行内容时会产生br
        if (/<br>/g.test(chatInput.innerHTML)) {
          chatInput.innerHTML = chatInput.innerHTML.replace(/<br>/g, '');
          let range = window.getSelection(); // 创建range
          range?.selectAllChildren(chatInput); // range 选择obj下所有子内容
          range?.collapseToEnd(); // 光标移至最后
        }
      }
    };

    // 方法
    // 记录光标的位置
    const getLastLocation = () => {
      chatInput.focus();
      lastLocation = selection?.getRangeAt(0) as Range;
      // true是折叠到节点开始，false是折叠到节点结束
      lastLocation.collapse(false);
    };

    // 插入节点
    const insertNode = (node: Node) => {
      selection?.removeAllRanges();
      lastLocation && selection?.addRange(lastLocation);

      lastLocation?.deleteContents();
      lastLocation?.insertNode(node);
      inputFunc();
    };

    // 获取img标签中alt的值
    const getAltValue = (content: string) => {
      let reg = /<img.*?alt="(.*?)".*?>/g;
      return content.replace(reg, '$1');
    };

    return {
      ...toRefs(state),
      addEmoji,
      pasteFunc,
      inputFunc,
      keydownFunc,
      keyupFunc,
      getLastLocation,
      sendMsg,
    };
  },
});
</script>

<style scoped>
.chat-input {
  height: 102px;
  text-align: left;
  white-space: pre-wrap;
  word-break: break-all;
  overflow-y: scroll;
  line-height: 20px;
  padding: 0 22px;
}

.chat-input::selection {
  background-color: #279fdb;
}

.chat-input:focus {
  outline: none;
}
</style>
