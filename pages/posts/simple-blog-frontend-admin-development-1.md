---
title: 博客后台开发日记之一（项目初始化）
date: 2022-11-17T08:00:00.000+00:00
lang: zh
type: blog
duration: 20min
---

[[TOC]]

最近开始着手准备 simple blog 的后台网站，[这是项目地址](https://github.com/fwr220807/simple-blog-frontend-admin)。技术栈选择上，决定使用 Vite + Vue3 + TypeScript + Element-plus + unocss 。去 github 搜刮了一圈起手模板，比较心水 PanjiaChen 的 [vue-element-admin](https://github.com/PanJiaChen/vue-element-admin) 项目。不过技术上并不是最新的，那就从零开始搭建吧！用自己的技术栈去实现，挺酷的。

废话不多说，那就开始吧！

## 初始化项目
首先要着手初始化项目，安装各种包并配置好相关配置。
### Vite
使用 [vite](https://vitejs.cn/vite3-cn/guide/#scaffolding-your-first-vite-project) 创建项目，vue-ts 模板会自动配置好 vite
```bash
pnpm create vite simple-blog-frontend-admin --template vue-ts
```
### alias
配置别名 alias，即把 src/ 的别名设置为 @/ ，方便写组件路径，在 vite.config.ts 配置
```ts
// vite.config.ts
import { resolve } form 'path'

export default defineConfig({
  // 添加别名 @
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
})
```
在 tsconfig.ts 配置
```json
// tsconfig.ts 让 vscode 识别 @
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```
### Pinia
安装 [pinia](https://pinia.web3doc.top/) 状态管理工具
```bash
pnpm install pinia
```
在 main.ts 配置
```ts
import { createPinia } from 'pinia'

const app = createApp(App)
app.use(createPinia())
// ...
```
### Vue-router
安装 [vue-router](https://router.vuejs.org/zh/) 插件
```bash
pnpm install vue-router
```
创建 @/router/index.ts
```ts
import { createRouter, createWebHashHistory } from 'vue-router';
// 利用 createRouter 工厂函数创建路由实例并暴露出去
export const router = createRouter({
    history: createWebHashHistory(),
    routes: [...] // 后面再补
})
```
在 main.ts 配置
```ts
import { router } from '@/router/index'

const app = createApp(App)
app.use(router)
// ...
```
### Element-plus
安装 [Element-plus](https://element-plus.org/zh-CN/) 组件库、自动引入等插件
```bash
pnpm install element-plus
pnpm install -D unplugin-vue-components unplugin-auto-import
```
在 vite.config.ts 配置
```ts
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

export default defineConfig({
  plugins: [
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
  ]
})
```
在 tsconfig.ts 配置，配合 vscode 插件 Volar 获取全局组件类型
```ts
// tsconfig.json
{
  "compilerOptions": {
    // ...
    "types": ["element-plus/global"]
  }
}
```
如此，便可实现直接在任意组件中直接使用 Element-plus 的组件而无需再引入，需注意如果只使用组件 API，需要手动导入样式。示例如下：
```ts
import 'element-plus/es/components/message/style/css'
import { ElMessage } from 'element-plus'
```
### Unocss
安装 [unocss](https://github.com/unocss/unocss) 原子 css 引擎和初始化样式（强烈推荐，可以很方便快捷地设置元素 css 样式）
```bash
pnpm install unocss -D
pnpm install @unocss/reset
```
在 vite.config.ts 配置：
```ts
// vite.config.ts
import Unocss from 'unocss/vite'

export default defineConfig({
  plugins: [
    Unocss(),
  ]
})
```
新建 unocss.config.ts 并配置：
```ts
// unocss.config.ts
import { defineConfig, presetAttributify, presetIcons, presetUno, presetWebFonts } from 'unocss'

export default defineConfig({
  shortcuts: [],
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons(),
    presetWebFonts(),
  ],
})
```
在 main.ts 引入初始化样式
```ts
// main.ts
import '@unocss/reset/tailwind.css'
```
### Eslint 和 .editconfig
安装 eslint 和配置 .editconfig，格式化项目。由于 eslint 和 prettier 存在规则冲突问题，且 eslint 可以比 preitter 配置更多的语法检测，结合使用需要非常了解两者的规则并保证严格一致，否则容易出现语法冲突，综上就不考虑 preitter 了，而由 eslint 和 .editconfig 共同完成。
```bash
pnpm install eslint @antfu/eslint-config -D
```
安装后在创建 .eslintrc 和 .editconfig 配置文件
```json
// .eslintrc 直接使用 antfu 的预设
{
  "extends": "@antfu"
}

// .edifconfig
root = true

[*]
charset = utf-8
indent_style = space
indent_size = 2
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true
```
