import { resolve, join } from "https://deno.land/std/path/mod.ts";
import { getIgnore, existsSync } from "./util.ts";
import { compileFiles } from "./compile-file.ts";

class CompileFile {
  dir: string;
  ignoreList: string[];

  constructor(dir: string) {
    this.dir = dir;
    this.ignoreList = getIgnore(dir);
    this.compileDir(dir);
    this.watchCss(dir);
  }

  isExclude(str: string) {
    str = str.replace(this.dir, "");
    if (!str) return false;
    const result = this.ignoreList.some((item) => str.startsWith(item));
    return result;
  }

  scanCssFiles(scanFolder: string) {
    let files: string[] = [];
    for (const { isFile, isDirectory, name } of Deno.readDirSync(scanFolder)) {
      const item = scanFolder + "/" + name;
      if (isFile) {
        if (this.isExclude(item) || !item.endsWith(".css")) continue;
        files.push(item);
      } else if (isDirectory) {
        if (this.isExclude(item)) continue;
        files = files.concat(this.scanCssFiles(item));
      }
    }
    return files;
  }

  compileDir(dir: string) {
    compileFiles(this.scanCssFiles(dir));
  }

  async watchCss(dir: string) {
    const watcher = Deno.watchFs(dir);
    for await (const event of watcher) {
      const paths = event.paths
        .filter((path) => path.endsWith(".css"))
        .filter((item) => {
          const exist = existsSync(item);
          if (this.isExclude(item)) return false;
          if (!exist) {
            try {
              Deno.removeSync(item + ".d.ts"); // 删除无用的类型文件([name].d.ts)
            } catch (err) {
              console.log(err);
            }
          }
          return exist;
        });
      compileFiles(paths);
    }
  }
}

function getWatchDir() {
  return Deno.args
    .map((item) => {
      return item.startsWith("/") ? item : resolve(join(Deno.cwd(), item));
    })
    .filter((item) => {
      try {
        return Deno.lstatSync(item).isDirectory;
      } catch (err) {
        console.log(err);
        return false;
      }
    });
}

function main() {
  for (const dir of getWatchDir()) {
    new CompileFile(dir);
  }
}

main();
