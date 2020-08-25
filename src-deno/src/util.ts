import { htmlTagList } from "./constant.ts";
import { unicodeWords } from "./unicode-words.ts";

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

export function removeHtmlTag(data: string): string {
  return htmlTagList.reduce(
    (result: string, tag: string) => result.replaceAll(tag, ""),
    data,
  );
}

export function getIgnore(dir: string) {
  const ignoreList = new Set(
    ["/node_modules", "/.git", "/.awcache", "/.vscode", "/public"],
  );
  const path = `${dir}/.gitignore`;
  if (existsSync(path)) {
    try {
      const file = Deno.readTextFileSync(path);
      const files = file
        .split("\n")
        .filter(Boolean)
        .map((item) => (item.startsWith("/") ? item : `/${item}`));
      for (const item of files) {
        ignoreList.add(item);
      }
    } catch (err) {
      console.log(err);
    }
  }
  return [...ignoreList];
}

const hasUnicodeWord = RegExp.prototype.test.bind(
  /[a-z][A-Z]|[A-Z]{2}[a-z]|[0-9][a-zA-Z]|[a-zA-Z][0-9]|[^a-zA-Z0-9 ]/,
);

/** Used to match words composed of alphanumeric characters. */
const reAsciiWord = /[^\x00-\x2f\x3a-\x40\x5b-\x60\x7b-\x7f]+/g;

function asciiWords(string: string) {
  return string.match(reAsciiWord);
}

function words(string: string, pattern?: RegExp | string) {
  if (pattern === undefined) {
    const result = hasUnicodeWord(string)
      ? unicodeWords(string)
      : asciiWords(string);
    return result || [];
  }
  return string.match(pattern) || [];
}

/**
 * Creates a function like `lowerFirst`.
 *
 * @private
 * @param {string} methodName The name of the `String` case method to use.
 * @returns {Function} Returns the new case function.
 */
function upperFirst(string: string) {
  if (!string) {
    return "";
  }

  const chr = string[0];

  const trailing = string.slice(1);

  return chr.toUpperCase() + trailing;
}

/**
 * Converts `string` to [camel case](https://en.wikipedia.org/wiki/CamelCase).
 *
 * @since 3.0.0
 * @category String
 * @param {string} [string=''] The string to convert.
 * @returns {string} Returns the camel cased string.
 * @see lowerCase, kebabCase, snakeCase, startCase, upperCase, upperFirst
 * @example
 *
 * camelCase('Foo Bar')
 * // => 'fooBar'
 *
 * camelCase('--foo-bar--')
 * // => 'fooBar'
 *
 * camelCase('__FOO_BAR__')
 * // => 'fooBar'
 */
export const camelCase = (string: string) => (
  words(String(string).replace(/['\u2019]/g, "")).reduce(
    (result, word, index) => {
      word = word.toLowerCase();
      return result + (index ? upperFirst(word) : word);
    },
    "",
  )
);
