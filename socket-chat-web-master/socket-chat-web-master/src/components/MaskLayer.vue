<template>
  <div class="mask-layer" @click="clickMask" :style="`background-color:rgba(0,0,0,${alpha})`">
    <slot></slot>
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/runtime-core'

export default defineComponent({
  name: 'mask-layer',
  props: {
    // 透明度
    alpha: {
      type: Number,
      default: 0.9,
    },
  },
  setup(props, { emit }) {
    // methods
    const clickMask = () => {
      emit('clickMask')
    }

    return {
      clickMask,
    }
  },
})
</script>

<style scoped>
.mask-layer {
  position: fixed;
  width: 100vw;
  height: 100vh;
}
</style>
