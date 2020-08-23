# Intro

提取 css 中的类型文件，如果 css 文件为 style.css，将会相同目录生成 style.css.d.ts 类型文件

# Dependencies

依赖 Deno

# 功能

## 文件监听和编译

- 默认会忽略.gitignore 所配置的和 ["/node_modules", "/.git", "/.awcache", "/.vscode", "public"] 下的文件
- 程序会自动监听除忽略之外的所有文件夹下的 css 文件
