import {
  camelCase,
  removeHtmlTag,
} from "./util.ts";

function analyzeCss(file: string) {
  let data = Deno.readTextFileSync(file);
  data = data.replaceAll(/:global\((.*?)\)/g, "");
  data = data.replaceAll(/(\r\n|\n|\r| ( )+)/g, "");
  data = removeHtmlTag(data);
  const list0 = data.match(/[\.#][a-zA-Z][a-zA-Z0-9-_]*[ ]?[\.]/g) ?? [];
  const list1 = data.match(/[\.#][a-zA-Z][a-zA-Z0-9-_]*[ ]?[,{]/g) ?? [];
  const list2 = [...list0, ...list1].map((item) => {
    item = item.slice(1); // 去掉首字符
    if (item.endsWith(",") || item.endsWith("{") || item.endsWith(".")) {
      item = item.slice(0, item.length - 1).trim();
    }
    return camelCase(item);
  });
  if (!list2.length) return [];

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

function humanNum(num: number) {
  if (num < 10) return `0${num}`;
  return String(num);
}

function compileFile(file: string) {
  const content = analyzeCss(file);
  if (!content.length) return;

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

export function compileFiles(files: string[]) {
  for (const file of files) {
    compileFile(file);
  }
}
