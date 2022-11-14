// import { readdirSync, readFileSync } from 'fs';
import { ContentType, PickFrontmatter } from "../types/frontmatters";
const readingTime = require('reading-time');
// import {join} from 'path-browserify';
const fs = require('fs')
const path = require('path')
import matter from 'gray-matter';

// 获取某种类型所在目录的文件并返回对应的信息，用于生成路由信息
export async function getAllFilesFrontmatter<T extends ContentType>(type: T) {
    // process.cwd() 读区当前文件夹目录路径，返回字符串
    // path.join() 拼接字符串成一个路径字符串
    // fs.readdirSync() 读取当前文件夹的文件
    const files = fs.readdirSync(path.join(process.cwd(), 'src', 'contents', type));

    return files.reduce((allPosts: Array<PickFrontmatter<T>>, postSlug) => {
        // fs.readFileSync() 读取所在路径的文件内容
        // matter() 格式化文件内容的信息，其中 data 中包含文件的头部信息
        const source = fs.readFileSync(
            path.join(process.cwd(), 'src', 'contents', type, postSlug),
            'utf8'
        );
        const { data } = matter(source);

        const res = [
            {
                ...(data as PickFrontmatter<T>),
                slug: postSlug.replace('.mdx', ''),
                readingTime: readingTime(source),
            },
            ...allPosts,
        ];
        return res;
    }, []);
}
