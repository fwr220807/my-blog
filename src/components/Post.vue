<script setup lang="ts">
import { formatDate } from '~/logics'

const { frontmatter } = defineProps({
  frontmatter: {
    type: Object,
    required: true,
  },
})

const route = useRoute()
</script>

<!-- // 此为所有 md 的模板 vue， 会把 md 的内容放到 slot 上 -->
<template>
  <!-- 这个盒子控制标题的显示，由于所有页面都是由 md 组成，所以对于 /post 下的 index.md 需要设置添加前沿信息 display = '' 来隐藏标题 -->
  <div v-if="frontmatter.display ?? frontmatter.title" class="prose m-auto mb-8">
    <h1 class="mb-0">
      {{ frontmatter.display ?? frontmatter.title }}
    </h1>
    <p v-if="frontmatter.date" class="opacity-50 !-mt-2">
      {{ formatDate(frontmatter.date) }} <span v-if="frontmatter.duration">· {{ frontmatter.duration }}</span>
    </p>
    <p v-if="frontmatter.subtitle" class="opacity-50 !-mt-6 italic">
      {{ frontmatter.subtitle }}
    </p>
  </div>
  <!-- md 文章的内容 -->
  <article ref="content">
    <slot />
  </article>
  <div v-if="route.path !== '/'" class="prose m-auto mt-8 mb-8">
    <br>
    <router-link :to="route.path.split('/').slice(0, -1).join('/') || '/'" class="font-mono no-underline opacity-50 hover:opacity-75">
      cd ..
    </router-link>
  </div>
</template>
