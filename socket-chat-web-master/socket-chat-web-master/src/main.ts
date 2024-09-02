import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";

import "@/assets/css/base.css"

// import clickoutside from '@/directive/clickBlankCloseBox'
import { vOnClickOutside } from '@vueuse/components'
import imgLazyLoad from "./directive/imgLazyLoad";

import antDesign from "./utils/antDesign";

const app = createApp(App);

// app.directive('clickoutside', clickoutside)
app.directive('clickoutside', vOnClickOutside)
app.directive('lazyload', imgLazyLoad)

// antDesign(app)
app.use(antDesign)
app.use(store).use(router).mount("#app");
