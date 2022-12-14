---
title: Pinia 如何为 state 提供 state[key] = value 形式的 ts 类型检查
date: 2022-12-04T08:00:00.000+00:00
lang: zh
type: blog
duration: 10min
---

[[TOC]]

如果用过 Pinia 的小伙伴会发现 ，修改 `state` 仓库里的值时的 API 都会提供相应的类型检查，非常的舒适，但是都仅限于使用 `state.key = value` 的形式才会有，但是如果使用 `state[key] = value` 则就没用了，有时候有这种形式的需求，需要进行一些处理，也可以是的 ts 能提供相应的类型检查。
## 1. 初始
为了方便演示，提供以下一个仓库 `useSettingsStore.ts` 的代码：
```ts
import { defineStore } from 'pinia'
import layoutSettings from '@/config/default/layout.config'
import { getTheme } from '@/utils/cookies'

export const useSettingsStore = defineStore('settings', {
  state: () => {
    return {
      theme: getTheme() || '#1890ff',
      fixedHeader: layoutSettings.fixedHeader,
      showSettings: layoutSettings.showSettings,
      showTagsView: layoutSettings.showTagsView,
      showSidebarLogo: layoutSettings.showSidebarLogo,
      sidebarTextTheme: layoutSettings.sidebarTextTheme,
    }
  },
  actions: {
    // 传入键值对，修改对应的 setting 值
    changeSetting(key: string, value: any) {
      this.$patch((state) => {
        state[key] = value
      })
    },
  },
})
```
## 2. 为 state 添加类型
`actions` 中的 `changeSetting` 方法，不出意外就会下面会出现类型错误，因为 `state` 中没有 `string` 类型的 `key` 值，为了解决这个为题，我们需要为 `state` 添加一个类型，借助 `keyof` 这个关键字获取该类型的关键字：
```ts
import { defineStore } from 'pinia'
import layoutSettings from '@/config/default/layout.config'
import { getTheme } from '@/utils/cookies'

interface SettingsStateType {
  theme: string
  fixedHeader: boolean
  showSettings: boolean
  showTagsView: boolean
  showSidebarLogo: boolean
  sidebarTextTheme: boolean
}

export const useSettingsStore = defineStore('settings', {
  state: () => {
    const state: SettingsStateType = {
      theme: getTheme() || '#1890ff',
      fixedHeader: layoutSettings.fixedHeader,
      showSettings: layoutSettings.showSettings,
      showTagsView: layoutSettings.showTagsView,
      showSidebarLogo: layoutSettings.showSidebarLogo,
      sidebarTextTheme: layoutSettings.sidebarTextTheme,
    }

    return state
  },
  actions: {
    // 传入键值对，修改对应的 setting 值
    changeSetting(key: keyof SettingsStateType, value: string | boolean) {
      this.$patch((state) => {
        state[key] = value
      })
    },
  },
})
```
## 3. 定义 setProps 方法
经过以上处理后，还是会有问题，`Type 'string | boolean' is not assignable to type 'never'.Type 'string' is not assignable to type 'never'.ts(2322)` 这时候就需要借助泛型封装一个 setProps 方法了，用于以 `Object[key] = value` 形式修改对象上的属性值时，可以提供类型检查，如下：
```ts
import { defineStore } from 'pinia'
import layoutSettings from '@/config/default/layout.config'
import { getTheme } from '@/utils/cookies'
interface SettingsStateType {
  theme: string
  fixedHeader: boolean
  showSettings: boolean
  showTagsView: boolean
  showSidebarLogo: boolean
  sidebarTextTheme: boolean
}

const setProp = <T, K extends keyof T>(obj: T, key: K, value: T[K]) => obj[key] = value

export const useSettingsStore = defineStore('settings', {
  state: () => {
    const state: SettingsStateType = {
      theme: getTheme() || '#1890ff',
      fixedHeader: layoutSettings.fixedHeader,
      showSettings: layoutSettings.showSettings,
      showTagsView: layoutSettings.showTagsView,
      showSidebarLogo: layoutSettings.showSidebarLogo,
      sidebarTextTheme: layoutSettings.sidebarTextTheme,
    }

    return state
  },
  actions: {
    // 传入键值对，修改对应的 setting 值
    changeSetting(key: keyof SettingsStateType, value: string | boolean) {
      this.$patch((state) => {
        setProp(state, key, value)
      })
    },
  },
})
```
这个时候红色波浪线消失了，并且如果使用该 `changeSetting` 函数时，如 `changeSetting('themes', '#123456')` key 值输入错误会有提示，降低运行时出错的概率。
## 4. 小小的不完善
这个办法提供了为 `state` 提供 `state[key] = value` 形式的 ts 类型检查，但是它并不完美，比如 `value` 值无法准确到为每个 `key` 都提供类型检查，`value` 只能提供 `state` 类型键值的集合类型 `string | boolean`，即 `changeSetting('theme', false)` 并不报错，但实际上 `theme` 是 `string` 类型的，这个目前我还没找到什么好的方法去实现。
## 5. 结语
看到这里，如果你有更好的办法解决上面的一个不完善情况，欢迎通过 [email](mailto:fwr583251832@outlook.com) 和 [github](https://github.com/fwr220807) 和我讨论交流～

## PS：版本控制
```json
{
  "dependencies": {
    "vue": "^3.2.41",
    "pinia": "^2.0.23"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^3.2.0",
    "typescript": "^4.6.4",
    "vite": "^3.2.3",
    "vue-tsc": "^1.0.9"
  }
}
```
