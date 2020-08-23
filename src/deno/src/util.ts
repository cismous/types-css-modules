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

export function getIgnore(dir: string) {
  const ignoreList = new Set(
    ["/node_modules", "/.git", "/.awcache", "/.vscode"],
  );
  const path = `${dir}/.gitignore`;
  if (existsSync(path)) {
    try {
      const file = Deno.readTextFileSync(path);
      const files = file.split("\n").filter(Boolean).map((item) =>
        item.startsWith("/") ? item : `/${item}`
      );
      for (const item of files) {
        ignoreList.add(item);
      }
    } catch (err) {
      console.log(err);
    }
  }
  return [...ignoreList];
}
