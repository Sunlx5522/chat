import { Modal, Upload, Button, Tooltip } from 'ant-design-vue'

import 'ant-design-vue/dist/antd.css';
import { App } from 'vue';

// Vue.use(Modal)
// Vue.use(Upload)
// Vue.use(Icon)

// Vue.prototype.$notification = notification
// Vue.prototype.$message = message

// export default {
//   install(app: App) {
//     app.component(Modal.name, Modal)
//     app.component(Upload.name, Upload)
//     app.component(Button.name, Button)
//   }
// }

// import { createFromIconfontCN } from '@ant-design/icons-vue';
// const Fonts = createFromIconfontCN({
//   scriptUrl: '//at.alicdn.com/t/font_8d5l8fzk5b87iudi.js'
// })

export default function (app: App) {
  // app.config.globalProperties.$message = message
  // app.config.globalProperties.$notification = notification

  app.use(Modal)
    .use(Upload)
    .use(Button)
    .use(Tooltip)
  // .component("AIcon", Fonts)
}