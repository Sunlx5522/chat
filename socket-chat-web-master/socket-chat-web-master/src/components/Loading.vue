<template>
  <div class="container" :style="{ transform: `scale(${scale})` }">
    <svg class="circleContainer" width="50" height="50">
      <circle class="circle" cx="25" cy="25" r="15" fill="transparent" stroke="#acacac" stroke-width="4"></circle>
    </svg>
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/runtime-core'

export default defineComponent({
  name: 'loading-cmp',
  props: {
    scale: {
      type: [Number, String],
      default: 1,
    },
  },
})
</script>

<style scoped>
.container {
  display: flex;
  align-items: flex-start;
  justify-content: center;
}

.circleContainer {
  animation: rotote 2s linear infinite;
}

.circle {
  stroke-dasharray: 94.1;
  animation: changeLength 4s linear infinite;
  stroke-dashoffset: 94.1;
}

@keyframes changeLength {
  0% {
    stroke-dashoffset: 94.1;
  }

  50% {
    stroke-dashoffset: 0;
  }

  50.01% {
    stroke-dashoffset: 188.2;
  }

  100% {
    stroke-dashoffset: 94.1;
  }
}

@keyframes rotote {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>
