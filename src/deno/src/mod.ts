import {
  initIgnoreFiles,
  existsSync,
  isExclude,
  firstCharUpperCase,
  removeHtmlTag,
} from "./util.ts";

function scanCssFiles(scanFolder: string, basePath: string) {
  let files: string[] = [];
  for (const { isFile, isDirectory, name } of Deno.readDirSync(scanFolder)) {
    if (isExclude(scanFolder)) continue;

    if (isFile) {
      const path = scanFolder + "/" + name;
      if (path.endsWith(".css")) {
        files.push(path);
      }
    }
    if (isDirectory) {
      files = files.concat(scanCssFiles(scanFolder + "/" + name, basePath));
    }
  }
  return files;
}

function analyzeCss(file: string) {
  let data = Deno.readTextFileSync(file);
  data = data.replaceAll(/(\r\n|\n|\r| ( )+)/g, "");
  data = removeHtmlTag(data);
  const list1 = data.match(/[\.#][a-zA-Z][a-zA-Z0-9-_]*[ ]?[,{]/g) ?? [];
  const list2 = list1.map((item) => {
    item = item.slice(1); // 去掉首字符
    if (item.endsWith(",") || item.endsWith("{")) {
      item = item.slice(0, item.length - 1).trim();
    }
    const t1 = item.split(/[-_]/); // 通过-或_分割
    return [t1[0]].concat(t1.slice(1).map(firstCharUpperCase)).join("");
  });
  const res = [...new Set(list2)].map((item) =>
    `  readonly "${item}": string;`
  );
  res.unshift("declare const styles: {");
  res.push("};");
  res.push("export = styles;");
  res.push("");
  res.push("");
  return res;
}

function getWatchDir() {
  const watchDir = Deno.args.map((item) => {
    return item.startsWith("/") ? item : Deno.cwd() + "/" + item;
  }).filter((item) => {
    try {
      const info = Deno.lstatSync(item);
      return info.isDirectory;
    } catch (err) {
      return false;
    }
  });
  return watchDir;
}

function humanNum(num: number) {
  if (num < 10) return `0${num}`;
  return String(num);
}

function compileFile(file: string) {
  const content = analyzeCss(file);
  if (!Deno.args.includes("-s") && !Deno.args.includes("--silent")) {
    const date = new Date();
    const infoDate = `["INFO" ${date.getFullYear()}-${
      humanNum(date.getMonth())
    }-${humanNum(date.getDay())} ${humanNum(date.getHours())}:${
      humanNum(date.getMinutes())
    }:${humanNum(date.getSeconds())}]`;
    console.log(infoDate, "Wrote", file + ".d.ts");
  }
  Deno.writeTextFileSync(file + ".d.ts", content.join("\n"));
}

function compileFiles(files: string[]) {
  for (const file of files) {
    compileFile(file);
  }
}

function compileDir(dir: string) {
  const files = scanCssFiles(dir, dir);
  compileFiles(files);
}

async function watchCss(dir: string) {
  const watcher = Deno.watchFs(dir);
  for await (const event of watcher) {
    const paths = event.paths.filter((path) => path.endsWith(".css")).filter(
      (item) => {
        const exist = existsSync(item);
        if (isExclude(item)) return false;
        if (!exist) {
          try {
            Deno.removeSync(item + ".d.ts"); // 删除无用的类型文件([name].d.ts)
          } catch {}
        }
        return exist;
      },
    );
    compileFiles(paths);
  }
}

function main() {
  const dirList = getWatchDir();
  initIgnoreFiles(dirList);
  for (const dir of dirList) {
    compileDir(dir);
    watchCss(dir);
  }
}

main();
