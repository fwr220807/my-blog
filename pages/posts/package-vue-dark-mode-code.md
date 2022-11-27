---
title: VUE 关于颜色主题切换逻辑的封装
date: 2022-11-21T08:00:00.000+00:00
lang: zh
type: blog
duration: 10min
---

[[toc]]

回顾 <router-link to="/posts/dark-mode-in-vue">VUE-深色主题的实现思路</router-link> 。本篇将对主题切换的逻辑进行封装和**连结**的封装思想的实践。
## 1. 优化
在封装之前，我又重新审视了上篇文章中的逻辑，做出以下优化：

*旧：对于 markdown 里的黑暗主题样式，上篇使用 `.markdown-body.dark {...}` 进行包裹，然后通过文章页组件中从 store 仓库获取对应的状态，控制挂载时对 markdown 的容器盒子添加一个 dark 类名，达到控制样式的控制；*

> 优化思路：
> 使用 `.html.dark .markdown {...}` 代替 `.markdown-body.dark {...}` 对黑暗主题样式进行包裹，这样就不必在文章页组件中对 Dom 进行 `dark` 的类名控制，只需要有一个地方对 `html` 添加 `dark` 类名即可，也就不必使用状态管理插件了。

## 2. 封装实现
启发自 antfu 大佬（[`vueuse`](https://vueuse.org/) 的作者）在 VUE CONF 2021 的一个[演讲](https://www.bilibili.com/video/BV1x54y1V7H6/?spm_id_from=333.337.search-card.all.click&vd_source=08f003a28f7e417df953d5265c1635dc) ，讲述到如何利用 Composistion API 与原生的 API 连结，将原生 API 封装成响应式的数据，这样用户使用时可以不用直接接触原生 API 并且也可以获取良好的响应式数据体验。
受此启发，我封装了 `useDark()` ， `usePreferredDark()` 函数，`useStorage()` 函数，其中 `useDark()` 是主题切换的函数。
### `usePreferedDark()` 函数
该函数将 `mediaQueryList = window.matchMedia('(prefers-color-scheme: dark)')` 这个 API 进行响应式化，即该函数会返回一个 `Ref<boolean>` 值，该值会根据 `mediaQueryList.matches` 的变化而变化，这样用户只需要执行函数即可获取系统是否是黑暗主题的布尔值，并且可以通过 watch 进行监听。
```ts
/**
 * 检测系统是否是黑暗主题的响应式
 * 返回一个值，如果当前系统是黑暗主题，则返回 true，否则返回 false
*/
export const usePreferredDark = function (): Ref<boolean> {
  const matches = ref(false)
  const mediaQueryList = window.matchMedia('(prefers-color-scheme: dark)')

  matches.value = mediaQueryList.matches

  mediaQueryList.addEventListener('change', (value) => {
    matches.value = value.matches
  })

  return matches
}
```
### `useStorage(key, value)` 函数
该函数是对持久化存储 `localStorage` 进行响应式处理，函数接受 `key`， `value` 两个值，并对 `value` 进行响应式处理成 `refValue` 并返回。用户只需要执行函数，后续只需要对返回值进行修改就可以达到修改 `localStorage` 的效果。
```ts
/**
 * 持久化存储并进行响应式处理
 * 返回一个值，可以通过它获取或修改 localStorage 中对应的值
*/
type MaybeRef<T> = Ref<T> | T // MaybeRef 可以使 Ref 或 普通值 作为参数
export const useStorage = function (key: MaybeRef<string>, value: MaybeRef<string>): Ref<string> {
  const refValue = ref(value)

  localStorage.setItem(unref(key), refValue.value)

  watch(refValue, (value) => {
    localStorage.setItem(unref(key), value)
  })

  // 暴露 refValue，使得可以获取，也可以修改
  return refValue
}
```
### `useDark()` 函数
该函数主要是实现了逻辑切换的逻辑，会返回一个`Ref<string>` 值，可通过该值修改对应的样式名，达到在 `html` 标签添加相应的类名目的。
```ts
/**
 * 设置系统主题响应式化
 * 通过 mode 来控制主题的切换
 * 通过 isDark 控制在 auto 主题下的自动切换
 * 有 auto 模式下有 light，dark 主题
*/
export const useDark = function (): Ref<string> {
  const value = localStorage.getItem('color-scheme')
  // 检测持久化存储是否已经存储模式，如果有，则使用
  const mode = useStorage('color-scheme', value || 'auto')
  const isDark = usePreferredDark()
  // 用于存储上一次的结果，初始化为空字符串
  let oldMode = ''

  watchEffect(() => {
    // 清除上一次添加的主题样式
    if (oldMode)
      document.documentElement.classList.remove(oldMode)

    if (mode.value === 'auto') {
      // auto 模式下，会根据系统自动添加 dark 样式
      if (isDark.value) {
        document.documentElement.classList.add('dark')
        oldMode = 'dark'
      }
      else {
        document.documentElement.classList.remove('dark')
        oldMode = 'light'
      }
    }
    else {
      document.documentElement.classList.add(mode.value)
      oldMode = mode.value
    }
  })

  return mode
}
```
## 3. 结语
受益于 Vue3 Composistion API ，与原生 API 进行连结的思想，可有效的减少对原生 API 的直接使用，并且连结也扩大了封装的可用性，比如 `useStorage()` ，不仅可在 `useDark()` 中使用，还可以用在其他需要的代码中使用。

最后，上述代码我也整理好了，欢迎去我的 [github](https://github.com/fwr220807/demo/tree/main/Package-vue-dark-mode-code) star 、下载、调试。
