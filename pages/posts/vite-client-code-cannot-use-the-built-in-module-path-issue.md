---
title: Vite 客户端代码无法使用内置模块 path 问题
date: 2022-12-03T08:00:00.000+00:00
lang: zh
type: blog
duration: 5min
---

[[TOC]]

当我们在 Vite 的客户端中使用 `import path from 'path'` 时发现浏览器控制台会报错 **`Uncaught (in promise) Error: Module “path” has been externalized for browser compatibility and cannot be accessed in client code.`**，这是因为在 Vite 处于安全的考虑，已经禁止 `path` 等 `node` 的内置模块的使用了，这个时候如果想 path 就需要另辟蹊径了。

## 解决办法

如果不能使用，那就自己安装一个：

```bash
pnpm i path
```
安装好后，会发现 path 不报错了，但是会出现另外一个错误 `process is undefined`，`process` 又是另一个内置模块，在 vite.config.ts 配置文件添加下面的代码就可以解决问题：

```ts
export default defineConfig({
  define: {
    // fix "path" module issue
    'process.platform': null,
    'process.version': null,
  },
})
```

## PS：版本控制

```json
{
  "dependencies": {
    "vue": "^3.2.41",
    "path": "^0.12.7"
  },
  "devDependencies": {
    "vite": "^3.2.3"
  }
}
```
