import { htmlTagList } from "./constant.ts";

export function existsSync(filePath: string): boolean {
  try {
    Deno.lstatSync(filePath);
    return true;
  } catch (err) {
    if (err instanceof Deno.errors.NotFound) {
      return false;
    }
    throw err;
  }
}

export function firstCharUpperCase(s: string) {
  return s.replace(/^\S/, (s) => s.toUpperCase());
}

export function removeHtmlTag(data: string): string {
  return htmlTagList.reduce(
    (result: string, tag: string) => result.replaceAll(` ${tag}`, ""),
    data,
  );
}

let list: string[] = [];
export function initIgnoreFiles(dirList: string[]) {
  let result: string[] = [];
  for (const dir of dirList) {
    result = result.concat(getIgnore(dir));
  }
  list = result;
  return result;
}

function getIgnore(dir: string) {
  const path = `${dir}/.gitignore`;
  if (existsSync(path)) {
    try {
      const file = Deno.readTextFileSync(path);
      const files = file.split("\n").filter(Boolean).map((item) =>
        item.startsWith("/") ? item : `/${item}`
      );
      files.push(".git");
      files.push("public");
      return files;
    } catch (err) {
      console.log(err);
    }
  }
  return ["node_modules", ".git", ".awcache"];
}

export function isExclude(str: string) {
  const result = list.some((item) => str.includes(item));
  return result;
}
