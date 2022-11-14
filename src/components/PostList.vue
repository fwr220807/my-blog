<script setup lang="ts">
import { useRouter } from 'vue-router'
import { formatDate } from '~/logics'
import type { Post } from '~/types'

// 如果传入的是 type 则是展示不用 type 类型的路由项，如果传入的是 posts 则展示 posts 的信息，就是外网站媒体文章
const props = defineProps<{
  type?: string
  posts?: Post[]
}>()

const router = useRouter()
// 加工可以用于信息展示的数组，ts 类型如果出现红线在 ～/shims.d.ts 定义 frontmatter:any 即可
const routes: Post[] = router.getRoutes()
// 筛选出包含 /posts 且 frontmatter 中具有 date 信息所有的路由，（即所有文章的路由，所以文章需要备注 date 的信息）
  .filter(i => i.path.startsWith('/posts') && i.meta.frontmatter.date)
// 将所有文章按时间顺序从大 -> 小排列
  .sort((a, b) => +new Date(b.meta.frontmatter.date) - +new Date(a.meta.frontmatter.date))
// 筛选出当前文章类型的文章，并且去掉加了 .html 的路由
  .filter(i => !i.path.endsWith('.html') && i.meta.frontmatter.type === props.type)
// 给每个文章信息进行加工并返回，用于信息展示
  .map(i => ({
    path: i.path,
    title: i.meta.frontmatter.title,
    date: i.meta.frontmatter.date,
    lang: i.meta.frontmatter.lang,
    duration: i.meta.frontmatter.duration,
    recording: i.meta.frontmatter.recording,
    upcoming: i.meta.frontmatter.upcoming,
  }))

// 对 props.posts 或者 routes 进行对应的选择
const posts = computed(() => (props.posts || routes))
// getYear 函数，返回输入时间的当前年份
const getYear = (a: Date | string | number) => new Date(a).getFullYear()
// 判断是否与上一个路由是否是同一年
const isSameYear = (a: Date | string | number, b: Date | string | number) => a && b && getYear(a) === getYear(b)
</script>

<template>
  <ul list-none pl-none>
    <template v-if="!posts.length">
      <div py2 op50>
        { nothing here yet }
      </div>
    </template>

    <template v-for="route, index in posts" :key="route.path">
      <div v-if="!isSameYear(route.date, posts[index - 1]?.date)" relative h-18 pointer-events-none>
        <span text-8em opacity-10 absolute left--3rem top--2rem font-bold>{{ getYear(route.date) }}</span>
      </div>
      <app-link class="item" block font-400 mb-6 mt-2 no-underline :to="route.path">
        <li>
          <div class="title" text-lg leading-5 fill-current>
            <span align-middle>{{ route.title }}</span>
          </div>
          <div class="time" opacity-50 text-sm>
            {{ formatDate(route.date) }}
            <span v-if="route.duration" opacity-80>· {{ route.duration }}</span>
            <span v-if="route.platform" op80>· {{ route.platform }}</span>
          </div>
        </li>
      </app-link>
    </template>
  </ul>
</template>
