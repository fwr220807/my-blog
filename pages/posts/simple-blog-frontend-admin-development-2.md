---
title: 博客后台开发日记之二(路由权限管理的实现)
date: 2022-12-12T08:00:00.000+00:00
lang: zh
type: blog
duration: 13min
---

[[TOC]]

在后台管理系统的项目中，路由权限管理是非常常见的需求，具体行为表现在根据后端返回不同的权限，限制当前登录者所能访问到的路由，其本质就是对路由信息的区别筛选。经过学习消化，结合自己的理解，我记录下路由权限管理实现的大致思路。
## 1. 前置知识
除了会使用 `vue-router` 插件的常用用法 API 如 `createRouter` 创建路由实例等，我们还需要用到以下知识：

1、`router.beforeEach` [全局航守卫](https://router.vuejs.org/zh/api/#beforeeach)：由 `createRouter` API 创建的路由实例下的方法，可以在任何导航前执行用户自定义的代码；该 api 可方便控制转跳页面前的行为；
```ts
import router from '@/router'

router.beforeEach((to, from, next) => {
  // ...
})
```
2、`router.addRoute` 添加一条新的路由记录作为现有路由的子路由：该[方法](https://router.vuejs.org/zh/api/#addroute)控制项目运行时动态控制路由的添加与删除；

3、常量路由：不管用户具有什么权限，只要登录了都可以访问到的路由，这些路由组成的集合就是常量路由，可在路由实例初始化直接添加的路由信息；

4、**动态路由**：动态路由是根据权限筛选过出的路由集合，一般指所有带权限信息的路由。与常量路由不同的是，动态路由主要用于与后端返回的 `roles` 信息筛选出当前用户所可以访问的路由集合，再使用 `addRoute` 方法添加到路由实例上；
5、`token` 与 `roles` 权限信息：使用 `token` 作为后端返回给前端的身份认证信息（相当于身份证），并且后端也会返回和路由权限相关的信息如 `roles`（在 simple blog admin 项目中返回的是 `roles`），该 `roles` 会用作动态路由（动态路由）的筛选依据。
## 2. 涉及的目录结构
```text
|-- simple-blog-admin-front-admin
    |-- src
        |-- permission.ts // 配置 beforeEach，动态添加 addRoute
        |-- router
        |   |-- index.ts // 创建 router 实例
        |-- store
        |   |-- permission.ts // 存储根据权限信息筛选动态路由的方法等
        |   |-- user.ts // 获取，存储 token 和 roles 权限信息等数据与方法
```
## 3. src/permission.ts 文件
src 目录下的 permission.ts 是控制权限路由的关键，里面的伪代码逻辑如下，完整显示如[项目文件](https://github.com/fwr220807/simple-blog-frontend-admin/blob/main/src/permission.ts)：
```text
router.beforeEach(async(to, from, next) => {
	if (用户有 token 吗？) {
		用户有 token：
		if (用户是不是转跳到登录页？) {
			用户是转跳到登录页：则转跳至首页，因为如果登陆了，就没有去登录页的需要了
		} else {
			用户不是转跳到登录页：意味着是转跳至除登录页的其他页，继续作判断
			if (用户获取到路由权限信息了吗？) {
				获取了：则正常转跳
			} else {
				没有获取：
				发起请求获取 roles ，并根据当前 roles 计算当前用户可访问的路由
				accessRoutes，并使用 router.addRoute 添加到路由实例中，
				再重新跳转到本页面
			}
		}
	} else {
		用户无 token：
		if (用户转跳的地址是否在白名单（login/404/401等）) {
			在白名单：则正常转跳
		} else {
			不在白名单：则带上重定向的地址信息转跳至登录页
		}
	}
})
```
## 4. 其余文件介绍
1、src/router/index.ts
这个文件创建并暴露路由器实例，在 src/permission.ts 文件可导入使用其 `beforeEach` 和 `addRoute` 方法，同时里面还暴露了常量路由和动态路由，和清理动态路由的方法；

2、src/store/user.ts
该仓库文件，有了用户的 `token` 和 `roles` 数据，并且有相关获取，更新，删除这些信息的方法；

3、src/store/permission.ts
该仓库文件，有用户整体的 `routes` 路由和筛选后的动态路由 `dynamicRoutes` 数据，并且有生成 `dynamicRoutes` 的方法。
## 5. 结尾
借助上面的 API，就可以控制用户登陆前后的转跳页面，使得用户登陆后，只能浏览有权限的页面面，从而达到路由权限管理的目的。最后，我觉得算是比较清晰地阐述权限管理这个概念实现的思路了，希望也对你有帮助！欢迎通过 [email](mailto:fwr583251832@outlook.com) 和 [github](https://github.com/fwr220807) 和我讨论交流～
