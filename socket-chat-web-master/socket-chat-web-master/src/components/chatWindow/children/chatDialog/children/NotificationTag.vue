<template>
  <div class="time-tag">
    <span>{{ content }}</span>
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/runtime-core'

export default defineComponent({
  props: {
    content: String,
  },
})
</script>

<style scoped>
.time-tag {
  text-align: center;
  margin: 10px 0;
}

.time-tag span {
  padding: 3px 5px;
  border-radius: 3px;
  font-size: 12px;
  color: white;
  background-color: #dadada;
}
</style>
