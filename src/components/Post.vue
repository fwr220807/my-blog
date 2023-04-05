<script setup lang="ts">
import { formatDate } from '~/logics'

const { frontmatter } = defineProps({
  frontmatter: {
    type: Object,
    required: true,
  },
})

const router = useRouter()
const route = useRoute()
// 根据 verification 值判断是否需要验证，防君子不防小人的验证方式
// if (route.meta.frontmatter.verification) {
//   // 查询是否存储过关键字的 md5 码
//   const keyword = useStorage('keyword', '')

//   if (keyword.value) {
//     // 存储过，直接进行判断
//     if (md5(keyword.value) !== '5c87cfebe06d9d9695994bc840ab2fb2') {
//       router.back()
//       keyword.value = null
//       alert('本地存储错误，请重新点击页面输入关键字！')
//     }
//   }
//   else {
//     // 没有存储过，则提示使用者输入关键字并获取
//     const input = prompt('请输入我的姓名以获取本篇文章内容：')
//     if (!input) { router.back() }
//     else {
//       // 使用关键字的 md5 码，进行判断
//       if (md5(input) !== '5c87cfebe06d9d9695994bc840ab2fb2') {
//         router.back()
//         alert('输入错误')
//       }
//       else {
//         // 验证通过，将关键字存储到 window.localStorage 中，就不用每次打开都需要输入了
//         keyword.value = input
//       }
//     }
//   }
// }

const content = ref<HTMLDivElement>()

onMounted(() => {
  const navigate = () => {
    if (location.hash) {
      document.querySelector(decodeURIComponent(location.hash))
        ?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const handleAnchors = (
    event: MouseEvent & { target: HTMLElement },
  ) => {
    const link = event.target.closest('a')

    if (
      !event.defaultPrevented
      && link
      && event.button === 0
      && link.target !== '_blank'
      && link.rel !== 'external'
      && !link.download
      && !event.metaKey
      && !event.ctrlKey
      && !event.shiftKey
      && !event.altKey
    ) {
      const url = new URL(link.href)
      if (url.origin !== window.location.origin)
        return

      event.preventDefault()
      const { pathname, hash } = url
      if (hash && (!pathname || pathname === location.pathname)) {
        window.history.replaceState({}, '', hash)
        navigate()
      }
      else {
        router.push({ path: pathname, hash })
      }
    }
  }

  useEventListener(window, 'hashchange', navigate)
  useEventListener(content.value!, 'click', handleAnchors, { passive: false })

  navigate()
  setTimeout(navigate, 500)
})
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
