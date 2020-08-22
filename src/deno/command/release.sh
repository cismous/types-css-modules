#!/bin/sh

# 生成版本号
export _date=$(date +"%Y-%m-%d %H:%M:%S")
echo "export const VERSION = \"${_date}\";" > src/.version.ts

# 打包到临时文件.temp
deno bundle src/mod.ts > .temp
# 将文件上传到cdn
curl http://100.69.238.36:8000/resource/fe_article/typed-css-modules/index.js -X POST -F filecontent=@.temp

# 将版本信息写入到临时文件.temp
echo $_date > .temp
# 将版本文件上传到cdn
curl http://100.69.238.36:8000/resource/fe_article/typed-css-modules/.version -X POST -F filecontent=@.temp

# 删除临时文件
rm .temp
