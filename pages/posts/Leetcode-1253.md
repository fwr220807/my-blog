---
title: 1253. 重构 2 行二进制矩阵
date: 2023-06-09T22:00:00.000+00:00
lang: zh
type: algorithm
duration: 45min
---

### 题目链接

「[1253. 重构 2 行二进制矩阵](https://leetcode.cn/problems/reconstruct-a-2-row-binary-matrix/description/)」

### 解题思路

1. 由题意知，矩阵中有以下几个特点，矩阵中 upper + lower === colsum 数组之和，colsum 数组中，0 代表对应矩阵中该列的值都为 0 ，2 代表值都为 1，1 代表上下值为 01 或者 10。经过观察，符合条件的矩阵，必须满足upper + lower === colsum 数组之和与 upper 和 lower 的值都必须小于等于 colsum 数组中 2 的数量。
2. 时间复杂度：O(n) = 2 * n 。

### 代码

```js
/**
 * @param {number} upper
 * @param {number} lower
 * @param {number[]} colsum
 * @return {number[][]}
 */
const reconstructMatrix = function (upper, lower, colsum) {
  let sumOfTwo = 0
  // 如果 upper + lower 不等于 colsum 数组之和，则不存在结果
  if (upper + lower !== colsum.reduce((sum, current) => {
    // 统计 2 的数量
    if (current === 2)
      sumOfTwo++
    return sum + current
  }, 0))
    return []
    // colsum 数组中的 2 ，代表 upper 和 lower 都必须是1，如果 2 的数量超过 upper 数量，说明不存在结果
  if (upper < sumOfTwo || lower < sumOfTwo)
    return []

  const ans0 = []
  const ans1 = []
  let tempUpper = upper - sumOfTwo
  for (let i = 0; i < colsum.length; i++) {
    switch (colsum[i]) {
      case 0:
        ans0.push(0)
        ans1.push(0)
        break

      case 2:
        ans0.push(1)
        ans1.push(1)
        break

      case 1:
        if (tempUpper > 0) {
          ans0.push(1)
          ans1.push(0)
          tempUpper--
        }
        else {
          ans0.push(0)
          ans1.push(1)
        }
        break

      default:
        break
    }

    console.log(upper)
  }

  return [ans0, ans1]
}

const upper = 5
const lower = 5
const colsum = [2, 1, 2, 0, 1, 0, 1, 2, 0, 1]

console.log(reconstructMatrix(upper, lower, colsum))
```

