# Intro

提取 css 中的类型文件，如果 css 文件为 style.css，将会相同目录生成 style.css.d.ts 类型文件

# Dependencies

依赖 Deno

# 功能

- 默认会忽略 node_modules .git 文件夹，同时忽略.gitignore 所配置的内容
- 默认监听除忽略内容之外的所有内容
