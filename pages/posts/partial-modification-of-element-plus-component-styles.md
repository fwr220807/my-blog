---
title: Vue 如何在 <style scoped> 下修改组件内部样式(element-plus)
date: 2022-11-27T08:00:00.000+00:00
lang: zh
type: blog
duration: 12min
---

[[TOC]]

在使用 element-plus 过程中，其自带默认样式已经足够好看，但在开发特定页面如登陆等页面时，就会遇到需要对该页面的 element-plus 组件样式调整的需求，但是随后会发现使用 `<style scoped>` 的时候会导致子组件内部的样式无法修改。本篇就以上需求，从原理上讲述 `<style scoped>` 和在使用 `<style scoped>` 的情况下，如何局部修改 element-plus 组件样式。注意，本篇着重讲的是局部修改 style 样式，如果想全局修改样式，可参考 element-plus 的[官方文档](https://element-plus.org/zh-CN/guide/theming.html)。
##  1. style scoped 标签
在 Vue 组件的 `<style>` 标签带有 `scoped` arrtibute 时，它的 CSS 只会影响当前组件的元素，这样做的好处是可以使得样式不污染到子组件。其中**原理是通过给每个元素标签添加一个动态属性，然后在选择器的最后一位元素附加属性**，使得父组件的样式不会渗透到子组件中，不过，**子组件的根节点**还是会被父组件的作用域样式所影响。[引用 Vue 的官方文档的描述](https://cn.vuejs.org/api/sfc-css-features.html#scoped-css)，这样设计是为了让父组件可以从布局的角度出发，调整其子组件根元素的样式。
```vue
<template>
  <div class="box1">
    <span>el-input:(原生样式)</span>
    <el-input />
  </div>
</template>

<style scoped>
.box1 {
  width: 200px;
  height: 40px;
  margin: 200px auto 0;
}

.box1 span {
  background-color: yellow;
}

.box .el-input {
  background-color: black;
}
</style>
```
转化为:
```vue
<template>
  <div class="box1" data-v-7a7a37b1>
    <span data-v-7a7a37b1>el-input:(原生样式)</span>
    <el-input data-v-7a7a37b1 />
  </div>
</template>

<style>
.box1['data-v-7a7a37b1'] {
  width: 200px;
  height: 40px;
  margin: 200px auto 0;
}

.box1 span['data-v-7a7a37b1'] {
  background-color: yellow;
}

.box .el-input['data-v-7a7a37b1'] {
  background-color: black;
}
</style>
```
注意：如果，子组件没有根标签，则会失效（以后是否会修正这个情况就不得而知了）
```vue
<!-- App.vue -->
<template>
  <!-- 会显示 pink 背景 -->
  <OneRootChild />
  <br>
  <!-- 无背景颜色 -->
  <TwoRootChild />
</template>

<style scoped>
/* scoped 可以选择到子组件的根标签元素 */
.one-root-child {
  background-color: cyan;
}

/* 如果子组件没有根标签，则会失效 */
.two-root-child {
  background-color: burlywood;
}
</style>
```

## 2. 使用 :deep() 伪选择器
在使用 `<style scoped>` 时，使用 `:deep()` 伪类选择器，可以选择对所选择的元素进行处理，以下用法均有效，
```vue
<style scoped>
.a :deep(.b) {
  /* ... */
}
.a :deep(.b .c) {
}
.a :deep() .b .c{
}
</style>
```
上面的代码会被编译成：
```css
.a[data-v-7a7a37b1] .b {
  /* ... */
}
.a[data-v-7a7a37b1] .b .c {
}
.a[data-v-7a7a37b1] .b .c {
}
```
结合 `style scoped` 的原理，使得我们可以在父组件对 element-plus 子组件 `el-input` 中的内部样式进行修改（注意： `el-input` 子组件内部的结构通过页面结构观察是 .el-input -> .el-input__wrapper -> .el-input__inner ）：
```vue
<!-- App.vue -->
<template>
  <div class="box2">
    <span>el-input:(修改样式1)</span>
    <el-input />
  </div>
  <div class="box3">
    <span>el-input:(修改样式2)</span>
    <el-input />
  </div>
</template>

<style scoped>
.box2 {
  width: 200px;
  height: 40px;
  margin: 100px auto 0;
}

/* 无效，因为会转化成 .box2 .el-input .el-input__wrapper[data-v-7a7a37b1] {} */
.box2 :deep() .el-input .el-input__wrapper {
  background-color: red;
}

/* 有效，转化成 .box2[data-v-7a7a37b1] .el-input .el-input__wrapper {} */
.box2 :deep(.el-input) .el-input__wrapper {
  background-color: pink;
}

.box3 {
  width: 200px;
  height: 40px;
  margin: 100px auto 0;
}

/* 无效，因转化成 .box3 .el-input .el-input__wrapper[data-v-7a7a37b1] .el-input__inner {} */
.box3 .el-input .el-input__wrapper :deep(.el-input__inner) {
  background-color: blue;
}

/* 有效，转化成 .box3 .el-input .el-input__wrapper[data-v-7a7a37b1] .el-input__inner {} */
.box3 .el-input :deep(.el-input__wrapper) .el-input__inner {
  background-color: purple;
}
</style>
```
## 3. 结语
相信大家理解了 `<style scoped>` 和 `:deep()` 的原理，就不难掌握，在使用 `<style scoped>` 的情况下对子组件内部样式修改的操作；毕竟使用时 element-plus 本质上就是 Vue 组件，只要是 Vue 组件，就可以用 `:deep()` 方法去修改子组件的内部样式。

上述相关代码，老规矩，我也整理成一个可以让它跑起来小 demo 项目，欢迎去我的 [github](https://github.com/fwr220807/demo/tree/main/Partial-modification-of-element-plus-component-styles) 下载，调试，提交问题。

## PS：版本控制
```json
{
  "dependencies": {
    "element-plus": "^2.2.25",
    "vue": "^3.2.41"
  }
}
```
