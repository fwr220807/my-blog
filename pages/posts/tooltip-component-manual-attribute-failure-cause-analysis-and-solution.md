---
title: Element Plus Tooltip 组件的 manual 属性失效的原因分析及解决方法
date: 2022-11-28T08:00:00.000+00:00
lang: zh
type: blog
duration: 18min
---

[[TOC]]

我在开发博客后台管理系统时，有个需求需要做一个文字提示，当用户输入密码是大写的字母时，会显示提示，反之则不显示。对于这个需求使用的是 Element Plus 的 Tooltip 文字提示组件，默认是 `hover` 时会显示提示，就需要对其显示的默认行为进行调整。[参考官方文档](https://element-plus.org/zh-CN/component/tooltip.html#%E5%B1%9E%E6%80%A7)，组件提供了 `v-model:visible` 属性可以直接操作提示显示与隐藏，默认值为 false，提供的 manual 属性则是设置是否手动控制 Tooltip。 如果设置为 `true`，则 `mouseenter` 和 `mouseleave` 将不会生效，默认值为 false。那么问题来了，我在使用 `manual` 属性时，发现其并不能阻止提示的默认显示行为。
## 1. 失效原因
鉴于上次给 Element Plus 贡献过一次 bug 修复，下载下来的项目文件还没删（幸好没删），我开始看 Tooltip 的代码。这里先说结论，我发现**根本就没有 `manual` 这个属性**。这就有意思了，以下是检查的经过：
首先找到 Tooltip 的[入口文件](https://github.com/element-plus/element-plus/blob/dev/packages/components/tooltip/index.ts)，找到对应的 vue 组件文件，是 `./src/tooltip.vue`；
```ts
// tooltip/index.ts
import Tooltip from './src/tooltip.vue'
// ...
export const ElTooltip = withInstall(Tooltip)
// ...
```
查看 tooltip.vue [该文件](https://github.com/element-plus/element-plus/blob/dev/packages/components/tooltip/src/tooltip.vue)下定义的 `props` 属性，如下：
```vue
<!-- tooltip/src/tooltip.vue -->
<script lang="ts" setup>
import { useTooltipProps } from './tooltip'
// 这里是传入的 props
const props = defineProps(useTooltipProps)
</script>

<template>
  <el-popper ref="popperRef" :role="role">
    <el-tooltip-trigger
      :disabled="disabled" :trigger="trigger"
      :trigger-keys="triggerKeys" :virtual-ref="virtualRef" :virtual-triggering="virtualTriggering"
    >
      <slot v-if="$slots.default" />
    </el-tooltip-trigger>
    <!-- ... -->
  </el-popper>
</template>
```
接着就去 tooltip.ts [文件](https://github.com/element-plus/element-plus/blob/dev/packages/components/tooltip/src/tooltip.ts)继续找，并且我把最后都找到的属性都注释进去了，信息如下：
```ts
// tooltip/src/tooltip.ts
export const useTooltipProps = buildProps({
  // role
  ...popperProps,
  // [name]: _prop, [updateEventKeyRaw]: _event
  ...useTooltipModelToggleProps,
  // showAfter, hideAfter, style, boundariesPadding, fallbackPlacements, gpuAcceleration, offset, placement, popperOptions, strategy, className, effect, enterable, pure, focusOnShow, trapping, popperClass, popperStyle, referenceEl, triggerTargetEl, stopPopperMouseEvent, ariaLabel, virtualTriggering, zIndex, appendTo, content, rawContent, persistent, ariaLabel, visible, transition, teleported, disabled
  ...useTooltipContentProps,
  // virtualRef, onMouseenter, onMouseleave, onClick, onKeydown, onFocus, onBlur, onContextmenu, open, disabled, trigger, triggerKeys,
  ...useTooltipTriggerProps,
  // arrowOffset
  ...popperArrowProps,
  openDelay: {
    type: Number,
  },
  visibleArrow: {
    type: Boolean,
    default: undefined,
  },
  showArrow: {
    type: Boolean,
    default: true,
  },
})
```
如上代码可知，Tooltip 组件是基于 popper 组件构建的，并且根本就没有 `manual` 属性，（还有 `tabindex` 属性也是缺失的，测试过，也是无效属性），然后我又逛了下 Element UI，这两个属性有且是有效的（emmm，为啥看起来选项式 API 写的代码感觉还好理解一点，这一定是我的错觉）。
## 2. 解决方法
知道了原因，接下来要解决问题。回到需求上，为了实现它，就需要了解 Tooltip 组件内部的事件的默认行为原理，经过一番查找，我找到对应的 trigger 组件[文件](https://github.com/element-plus/element-plus/blob/dev/packages/components/tooltip/src/trigger.vue)，可以看出默认行为的具体原理，如以下代码：
```vue
<!-- tooltip/src/trigger.vue -->
<script lang="ts" setup>
import { whenTrigger } from './utils'

const stopWhenControlledOrDisabled = () => {
  if (unref(controlled) || props.disabled)
    return true

}

const trigger = toRef(props, 'trigger')
const onMouseenter = composeEventHandlers(
  stopWhenControlledOrDisabled,
  whenTrigger(trigger, 'hover', onOpen)
)
const onMouseleave = composeEventHandlers(
  stopWhenControlledOrDisabled,
  whenTrigger(trigger, 'hover', onClose)
)
const onClick = composeEventHandlers(
  stopWhenControlledOrDisabled,
  whenTrigger(trigger, 'click', (e) => {
    // distinguish left click
    if ((e as MouseEvent).button === 0)
      onToggle(e)

  })
)
const onFocus = composeEventHandlers(
  stopWhenControlledOrDisabled,
  whenTrigger(trigger, 'focus', onOpen)
)
const onBlur = composeEventHandlers(
  stopWhenControlledOrDisabled,
  whenTrigger(trigger, 'focus', onClose)
)
const onContextMenu = composeEventHandlers(
  stopWhenControlledOrDisabled,
  whenTrigger(trigger, 'contextmenu', (e: Event) => {
    e.preventDefault()
    onToggle(e)
  })
)

const onKeydown = composeEventHandlers(
  stopWhenControlledOrDisabled,
  (e: KeyboardEvent) => {
    const { code } = e
    if (props.triggerKeys.includes(code)) {
      e.preventDefault()
      onToggle(e)
    }
  }
)
</script>

<template>
  <el-popper-trigger
    :id="id"
    :virtual-ref="virtualRef"
    :open="open"
    :virtual-triggering="virtualTriggering"
    :class="ns.e('trigger')"
    @blur="onBlur"
    @click="onClick"
    @contextmenu="onContextMenu"
    @focus="onFocus"
    @mouseenter="onMouseenter"
    @mouseleave="onMouseleave"
    @keydown="onKeydown"
  >
    <slot />
  </el-popper-trigger>
</template>
```
注意 `onMouseenter` 和 `onMouseleave` ，它们是触发默认行为的函数，其中 `composeEventHandlers` 是一个工厂函数，会返回一个事件回调函数，`composeEventHandlers` 函数里面的 `whenTrigger` 函数会根据第一个参数 `trigger` 和 第二个参数进行匹配，如果相等，就可以出触发对应的事件回调函数。注意，第一个参数 `trigger`，对应官方文档的 `trigger` 属性，**描述是如何触发（展示） Tooltip，默认是 `hover`，还有 `click` / `focus` / `contextmenu` 可选值**。这里就不难想到 `trigger` 属性实际上控制着 Tooltip 的默认显示行为，所以只需要添加` trigger=""` 属性可以去掉默认行为。

**但**，还没完。添加 `trigger=""` 属性确实有效，但又发现一个新的问题，就是空格键和回车键同样会触发提示的显示。如果对上面代码通读了的朋友应该就不难发现问题了，就是 Tooltip 组件还自带了空格键和回车键触发显示的默认行为，并且这个行为并不受 `whenTrigger` 函数的控制，也就是 `trigger` 属性禁止不了按下这两个键的所触发默认行为，而是受 `triggerKeys` 这个属性控制，并且官方文档也有描述，**`trigger-keys`，是一个字符串数组，当鼠标点击或者聚焦在触发元素上时， 可以定义一组键盘按键并且通过它们来控制 Tooltip 的显示，默认值为 `['Enter','Space']`**。所以再添加 `:trigger-keys=[]` 属性即可解决问题。
## 3. 拓展实现
我觉得这个 `manual` 功能并不难实现。大概思路是把 `trigger` 和 `triggerKeys` 的默认值根据 `manual` 的值而进行调整，实现的具体思路是：
1. 首先在 `useTooltipTriggerProps` 添加 `manual` 属性，类型为 Boolean，默认值为 `false`；
2. 然后在 tooltip.vue 文件中在子组件的 `el-tooltip-trigger` ( trigger.vue ) 中传入的 `:trigger="trigger"` 和 `:trigger-keys="triggerKeys"` 进行处理，比如 `:trigger="manual ? (trigger === 'hover' ? '' : trigger) : trigger"` ，这里的逻辑是，如果 `manual` 值为真，且如果 `trigger` 为默认值，则传入空值，否则传入原值，这样就可以根据 `manual` 的值控制传入给 `trigger` 组件的 `trigger` 值，从而达到禁止默认行为的效果；
3. 如果觉得在模板表达式太长了，还可以定义一个计算值，然后传入这个计算值即可。
## 4. 结语
至此，终于弄清前因后果，最后也达到需求的效果了，还算是个不错的问题吧。

本人水平有限，说的不对还请多多见谅，如果有任何的想法或者发现错误，欢迎 send [email](mailto:fwr583251832@outlook.com) 或者在 [github](https://github.com/fwr220807) 一起深入交流～

## PS：版本控制
```json
{
  "dependencies": {
    "element-plus": "^2.2.25",
    "vue": "^3.2.41"
  }
}
```
