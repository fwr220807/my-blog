// 对内链和外链分别处理
<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  to: string
}>()

const isExternalLink = computed(() => typeof props.to === 'string' && props.to.startsWith('http'))
</script>

<template>
  <!-- 这这里的 $attrs 为传入的样式 -->
  <a v-if="isExternalLink" v-bind="$attrs" :href="to" target="_blank">
    <slot />
  </a>
  <router-link v-else v-bind="$props">
    <slot />
  </router-link>
</template>
