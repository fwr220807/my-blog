import dayjs from 'dayjs';

// 给 localStorage 设立响应式的值
export const englishOnly = useStorage('wren-english-only', false)

// 格式化日期，如果当前日期在本年，则不显示本年
export function formatDate(d: string | Date) {
    const date = dayjs(d)
    return date.year() === dayjs().year() ? date.format('MMM D') : date.format('MMM D, YYYY')
}