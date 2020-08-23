# Intro

分析 css 文件内容，为 id 和 class 增加类型文件，用于 typescript 文件引用和自动补全。
如果文件名为 style.css，将会相应目录生成 style.css.d.ts 类型文件

# Dependencies

依赖 Deno

# 功能

## 文件监听和编译

- 默认会忽略.gitignore 所配置的和 ["/node_modules", "/.git", "/.awcache", "/.vscode", "/public"] 下的文件
- 程序会自动监听除忽略之外的所有文件夹下的 css 文件
