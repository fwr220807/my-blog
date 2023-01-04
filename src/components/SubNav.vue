<script setup lang="ts">
const route = useRoute()
const inactiveStyle = 'opacity-20 hover:opacity-50'
</script>

<template>
  <div mb-0 flex="~ gap5 sm:gap6 wrap" items-center text-xl sm:text-3xl select-none>
    <router-link to="/posts" class="!border-none !font-400" decoration-none :class="route.path === '/posts' ? '' : inactiveStyle">
      Blog
    </router-link>
    <router-link to="/life" class="!border-none !font-400" decoration-none :class="route.path === '/life' ? '' : inactiveStyle">
      Life
    </router-link>
  </div>
</template>
