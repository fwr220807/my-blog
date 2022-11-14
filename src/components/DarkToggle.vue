<script setup lang="ts">
const mode = useColorMode()
const isDark = usePreferredDark()

function toggleDark() {
  const currentIsDark = mode.value === 'dark'

  // 如果切换到的主题与系统主题一样，则把当前主题设置为 system
  if (isDark.value !== (!!currentIsDark)) {
    mode.value = 'auto'
  }
  else {
    // 点击按钮切换主题
    mode.value = currentIsDark ? 'light' : 'dark'
  }
}
</script>

<template>
  <a select-none href="#" @click="toggleDark">
    <div class="dark:i-carbon-moon i-carbon-sun" />
  </a>
</template>
