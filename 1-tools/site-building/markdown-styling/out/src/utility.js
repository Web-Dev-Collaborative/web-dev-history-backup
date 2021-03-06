"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Function = exports.loadDependency = exports.allowUnsafeEvalAndUnsafeNewFunctionAsync = exports.allowUnsafeNewFunctionAsync = exports.allowUnsafeNewFunction = exports.allowUnsafeEvalAync = exports.allowUnsafeEval = exports.configs = exports.removeFileProtocol = exports.addFileProtocol = exports.useExternalAddFileProtocolFunction = exports.isArrayEqual = exports.getParserConfig = exports.getExtensionConfig = exports.getKaTeXConfig = exports.getMathJaxConfig = exports.defaultKaTeXConfig = exports.defaultMathjaxConfig = exports.getMermaidConfig = exports.getGlobalStyles = exports.extensionDirectoryPath = exports.openFile = exports.execFile = exports.tempOpen = exports.write = exports.writeFile = exports.readFile = exports.parseYAML = exports.sleep = exports.unescapeString = exports.escapeString = void 0;
const child_process = require("child_process");
const fs = require("fs");
const jsYAML = require("js-yaml");
const less = require("less");
const os = require("os");
const path = require("path");
const vm = require("vm");
const temp = require("temp");
temp.track();
const TAGS_TO_REPLACE = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
    "/": "&#x2F;",
    "\\": "&#x5C;",
};
const TAGS_TO_REPLACE_REVERSE = {
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": '"',
    "&apos;": "'",
    "&#x27;": "'",
    "&#x2F;": "/",
    "&#x5C;": "\\",
};
function escapeString(str = "") {
    return str.replace(/[&<>"'\/\\]/g, (tag) => TAGS_TO_REPLACE[tag] || tag);
}
exports.escapeString = escapeString;
function unescapeString(str = "") {
    return str.replace(/\&(amp|lt|gt|quot|apos|\#x27|\#x2F|\#x5C)\;/g, (whole) => TAGS_TO_REPLACE_REVERSE[whole] || whole);
}
exports.unescapeString = unescapeString;
/**
 * Do nothing and sleep for `ms` milliseconds
 * @param ms
 */
function sleep(ms) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            return resolve();
        }, ms);
    });
}
exports.sleep = sleep;
function parseYAML(yaml = "") {
    // YAML doesn't work well with front-matter
    /*
    try {
      return YAML.parse(yaml)
    } catch(error) {
      return {}
    }
    */
    if (yaml.startsWith("---")) {
        yaml = yaml
            .trim()
            .replace(/^---\r?\n/, "")
            .replace(/\r?\n---$/, "");
    }
    try {
        return jsYAML.safeLoad(yaml);
    }
    catch (error) {
        return {};
    }
}
exports.parseYAML = parseYAML;
function readFile(file, options) {
    return new Promise((resolve, reject) => {
        fs.readFile(file, options, (error, text) => {
            if (error) {
                return reject(error.toString());
            }
            else {
                return resolve(text.toString());
            }
        });
    });
}
exports.readFile = readFile;
function writeFile(file, text, options) {
    return new Promise((resolve, reject) => {
        fs.writeFile(file, text, options, (error) => {
            if (error) {
                return reject(error.toString());
            }
            else {
                return resolve();
            }
        });
    });
}
exports.writeFile = writeFile;
function write(fd, text) {
    return new Promise((resolve, reject) => {
        fs.write(fd, text, (error) => {
            if (error) {
                return reject(error.toString());
            }
            else {
                return resolve();
            }
        });
    });
}
exports.write = write;
function tempOpen(options) {
    return new Promise((resolve, reject) => {
        temp.open(options, (error, info) => {
            if (error) {
                return reject(error.toString());
            }
            else {
                return resolve(info);
            }
        });
    });
}
exports.tempOpen = tempOpen;
function execFile(file, args, options) {
    return new Promise((resolve, reject) => {
        child_process.execFile(file, args, options, (error, stdout, stderr) => {
            if (error) {
                return reject(error.toString());
            }
            else if (stderr) {
                return reject(stderr);
            }
            else {
                return resolve(stdout);
            }
        });
    });
}
exports.execFile = execFile;
/**
 * open html file in browser or open pdf file in reader ... etc
 * @param filePath
 */
function openFile(filePath) {
    if (process.platform === "win32") {
        if (filePath.match(/^[a-zA-Z]:\\/)) {
            // C:\ like url.
            filePath = "file:///" + filePath;
        }
        if (filePath.startsWith("file:///")) {
            return child_process.execFile("explorer.exe", [filePath]);
        }
        else {
            return child_process.exec(`start ${filePath}`);
        }
    }
    else if (process.platform === "darwin") {
        child_process.execFile("open", [filePath]);
    }
    else {
        child_process.execFile("xdg-open", [filePath]);
    }
}
exports.openFile = openFile;
/**
 * get the directory path of this extension.
 */
exports.extensionDirectoryPath = path.resolve(__dirname, "../../");
/**
 * compile ~/.mumi/style.less and return 'css' content.
 */
function getGlobalStyles(configPath) {
    return __awaiter(this, void 0, void 0, function* () {
        const globalLessFilePath = configPath
            ? path.resolve(configPath, "./style.less")
            : path.resolve(os.homedir(), "./.mume/style.less");
        let fileContent;
        try {
            fileContent = yield readFile(globalLessFilePath, { encoding: "utf-8" });
        }
        catch (e) {
            // create style.less file
            fileContent = `
/* Please visit the URL below for more information: */
/*   https://shd101wyy.github.io/markdown-preview-enhanced/#/customize-css */

.markdown-preview.markdown-preview {
  // modify your style here
  // eg: background-color: blue;
}
`;
            yield writeFile(globalLessFilePath, fileContent, { encoding: "utf-8" });
        }
        return yield new Promise((resolve, reject) => {
            less.render(fileContent, { paths: [path.dirname(globalLessFilePath)] }, (error, output) => {
                if (error) {
                    return resolve(`html body:before {
  content: "Failed to compile \`style.less\`. ${error}" !important;
  padding: 2em !important;
}
.mume.mume { display: none !important; }`);
                }
                else {
                    return resolve(output.css || "");
                }
            });
        });
    });
}
exports.getGlobalStyles = getGlobalStyles;
/**
 * load ~/.mume/mermaid_config.js file.
 */
function getMermaidConfig(configPath) {
    return __awaiter(this, void 0, void 0, function* () {
        const mermaidConfigPath = configPath
            ? path.resolve(configPath, "./mermaid_config.js")
            : path.resolve(os.homedir(), "./.mume/mermaid_config.js");
        let mermaidConfig;
        if (fs.existsSync(mermaidConfigPath)) {
            try {
                mermaidConfig = yield readFile(mermaidConfigPath, { encoding: "utf-8" });
            }
            catch (e) {
                mermaidConfig = `MERMAID_CONFIG = {startOnLoad: false}`;
            }
        }
        else {
            const fileContent = `// config mermaid init call
// http://knsv.github.io/mermaid/#configuration
//
// You can edit the 'MERMAID_CONFIG' variable below.
MERMAID_CONFIG = {
  startOnLoad: false
}
`;
            yield writeFile(mermaidConfigPath, fileContent, { encoding: "utf-8" });
            mermaidConfig = `MERMAID_CONFIG = {startOnLoad: false}`;
        }
        return mermaidConfig;
    });
}
exports.getMermaidConfig = getMermaidConfig;
exports.defaultMathjaxConfig = {
    "extensions": ["tex2jax.js"],
    "jax": ["input/TeX", "output/HTML-CSS"],
    "messageStyle": "none",
    "tex2jax": {
        processEnvironments: false,
        processEscapes: true,
    },
    "TeX": {
        extensions: [
            "AMSmath.js",
            "AMSsymbols.js",
            "noErrors.js",
            "noUndefined.js",
        ],
    },
    "HTML-CSS": { availableFonts: ["TeX"] },
};
exports.defaultKaTeXConfig = {
    macros: {},
};
/**
 * load ~/.mume/mathjax_config.js file.
 */
function getMathJaxConfig(configPath) {
    return __awaiter(this, void 0, void 0, function* () {
        const mathjaxConfigPath = configPath
            ? path.resolve(configPath, "./mathjax_config.js")
            : path.resolve(os.homedir(), "./.mume/mathjax_config.js");
        let mathjaxConfig;
        if (fs.existsSync(mathjaxConfigPath)) {
            try {
                delete require.cache[mathjaxConfigPath]; // return uncached
                mathjaxConfig = require(mathjaxConfigPath);
            }
            catch (e) {
                mathjaxConfig = exports.defaultMathjaxConfig;
            }
        }
        else {
            const fileContent = `
module.exports = {
  extensions: ['tex2jax.js'],
  jax: ['input/TeX','output/HTML-CSS'],
  messageStyle: 'none',
  tex2jax: {
    processEnvironments: false,
    processEscapes: true
  },
  TeX: {
    extensions: ['AMSmath.js', 'AMSsymbols.js', 'noErrors.js', 'noUndefined.js']
  },
  'HTML-CSS': { availableFonts: ['TeX'] }
}
`;
            yield writeFile(mathjaxConfigPath, fileContent, { encoding: "utf-8" });
            mathjaxConfig = exports.defaultMathjaxConfig;
        }
        return mathjaxConfig;
    });
}
exports.getMathJaxConfig = getMathJaxConfig;
/**
 * load ~/.mume/katex_config.js file
 */
function getKaTeXConfig(configPath) {
    return __awaiter(this, void 0, void 0, function* () {
        const katexConfigPath = configPath
            ? path.resolve(configPath, "./katex_config.js")
            : path.resolve(os.homedir(), "./.mume/katex_config.js");
        let katexConfig;
        if (fs.existsSync(katexConfigPath)) {
            try {
                delete require.cache[katexConfigPath]; // return uncached
                katexConfig = require(katexConfigPath);
            }
            catch (e) {
                katexConfig = exports.defaultKaTeXConfig;
            }
        }
        else {
            const fileContent = `
module.exports = {
  macros: {}
}`;
            yield writeFile(katexConfigPath, fileContent, { encoding: "utf-8" });
            katexConfig = exports.defaultKaTeXConfig;
        }
        return katexConfig;
    });
}
exports.getKaTeXConfig = getKaTeXConfig;
function getExtensionConfig(configPath) {
    return __awaiter(this, void 0, void 0, function* () {
        const extensionConfigFilePath = configPath
            ? path.resolve(configPath, "./config.json")
            : path.resolve(os.homedir(), "./.mume/config.json");
        let config;
        if (fs.existsSync(extensionConfigFilePath)) {
            try {
                delete require.cache[extensionConfigFilePath]; // return uncached
                config = require(extensionConfigFilePath);
            }
            catch (error) {
                config = { error };
            }
        }
        else {
            config = {};
            yield writeFile(extensionConfigFilePath, "{}", { encoding: "utf-8" });
        }
        return config;
    });
}
exports.getExtensionConfig = getExtensionConfig;
function getParserConfig(configPath) {
    return __awaiter(this, void 0, void 0, function* () {
        const parserConfigPath = configPath
            ? path.resolve(configPath, "./parser.js")
            : path.resolve(os.homedir(), "./.mume/parser.js");
        let parserConfig;
        if (fs.existsSync(parserConfigPath)) {
            try {
                delete require.cache[parserConfigPath]; // return uncached
                parserConfig = require(parserConfigPath);
            }
            catch (error) {
                parserConfig = {};
            }
        }
        else {
            const template = `module.exports = {
  onWillParseMarkdown: function(markdown) {
    return new Promise((resolve, reject)=> {
      return resolve(markdown)
    })
  },
  onDidParseMarkdown: function(html, {cheerio}) {
    return new Promise((resolve, reject)=> {
      return resolve(html)
    })
  },
  onWillTransformMarkdown: function (markdown) {
        return new Promise((resolve, reject) => {
            return resolve(markdown);
        });
    },
  onDidTransformMarkdown: function (markdown) {
      return new Promise((resolve, reject) => {
          return resolve(markdown);
      });
  }
}`;
            yield writeFile(parserConfigPath, template, { encoding: "utf-8" });
            parserConfig = {};
        }
        return parserConfig;
    });
}
exports.getParserConfig = getParserConfig;
/**
 * Check whether two arrays are equal
 * @param x
 * @param y
 */
function isArrayEqual(x, y) {
    if (x.length !== y.length) {
        return false;
    }
    for (let i = 0; i < x.length; i++) {
        if (x[i] !== y[i]) {
            return false;
        }
    }
    return true;
}
exports.isArrayEqual = isArrayEqual;
let _externalAddFileProtocolFunction = null;
function useExternalAddFileProtocolFunction(func) {
    _externalAddFileProtocolFunction = func;
}
exports.useExternalAddFileProtocolFunction = useExternalAddFileProtocolFunction;
/**
 * Add file:/// to file path
 * If it's for VSCode preview, add vscode-resource:/// to file path
 * @param filePath
 */
function addFileProtocol(filePath, vscodePreviewPanel) {
    if (_externalAddFileProtocolFunction) {
        return _externalAddFileProtocolFunction(filePath, vscodePreviewPanel);
    }
    else {
        if (!filePath.startsWith("file://")) {
            filePath = "file:///" + filePath;
        }
        filePath = filePath.replace(/^file\:\/+/, "file:///");
    }
    return filePath;
}
exports.addFileProtocol = addFileProtocol;
/**
 * Remove file:// from file path
 * @param filePath
 */
function removeFileProtocol(filePath) {
    // See https://regex101.com/r/YlpEur/8/
    // - "file://///a///b//c/d"                   ---> "a///b//c/d"
    // - "vscode-resource://///file///a///b//c/d" ---> "file///a///b//c/d"
    const regex = /^(?:(?:file|(vscode)-(?:webview-)?resource|vscode--resource):\/+)(.*)/m;
    return filePath.replace(regex, (m, isVSCode, rest) => {
        if (isVSCode) {
            // For vscode urls -> Remove host: `file///C:/a/b/c` -> `C:/a/b/c`
            rest = rest.replace(/^file\/+/, "");
        }
        if (process.platform !== "win32" && !rest.startsWith("/")) {
            // On Linux platform, add a slash at the front
            return "/" + rest;
        }
        else {
            return rest;
        }
    });
}
exports.removeFileProtocol = removeFileProtocol;
/**
 * style.less,
 * mathjax_config.js,
 * mermaid_config.js
 * config.json
 *
 * files
 */
// @ts-ignore
exports.configs = {
    globalStyle: "",
    mathjaxConfig: exports.defaultMathjaxConfig,
    katexConfig: exports.defaultKaTeXConfig,
    mermaidConfig: "MERMAID_CONFIG = {startOnLoad: false}",
    parserConfig: {},
    config: {},
};
var image_uploader_1 = require("./image-uploader");
Object.defineProperty(exports, "uploadImage", { enumerable: true, get: function () { return image_uploader_1.uploadImage; } });
/**
 * Allow unsafed `eval` function
 * Referred from:
 *     https://github.com/atom/loophole/blob/master/src/loophole.coffee
 * @param fn
 */
function allowUnsafeEval(fn) {
    const previousEval = global.eval;
    try {
        global.eval = (source) => {
            vm.runInThisContext(source);
        };
        return fn();
    }
    finally {
        global.eval = previousEval;
    }
}
exports.allowUnsafeEval = allowUnsafeEval;
function allowUnsafeEvalAync(fn) {
    return __awaiter(this, void 0, void 0, function* () {
        const previousEval = global.eval;
        try {
            global.eval = (source) => {
                vm.runInThisContext(source);
            };
            return yield fn();
        }
        finally {
            global.eval = previousEval;
        }
    });
}
exports.allowUnsafeEvalAync = allowUnsafeEvalAync;
function allowUnsafeNewFunction(fn) {
    const previousFunction = global.Function;
    try {
        global.Function = Function;
        return fn();
    }
    finally {
        global.Function = previousFunction;
    }
}
exports.allowUnsafeNewFunction = allowUnsafeNewFunction;
function allowUnsafeNewFunctionAsync(fn) {
    return __awaiter(this, void 0, void 0, function* () {
        const previousFunction = global.Function;
        try {
            global.Function = Function;
            return yield fn();
        }
        finally {
            global.Function = previousFunction;
        }
    });
}
exports.allowUnsafeNewFunctionAsync = allowUnsafeNewFunctionAsync;
function allowUnsafeEvalAndUnsafeNewFunctionAsync(fn) {
    return __awaiter(this, void 0, void 0, function* () {
        const previousFunction = global.Function;
        const previousEval = global.eval;
        try {
            global.Function = Function;
            global.eval = (source) => {
                vm.runInThisContext(source);
            };
            return yield fn();
        }
        finally {
            global.eval = previousEval;
            global.Function = previousFunction;
        }
    });
}
exports.allowUnsafeEvalAndUnsafeNewFunctionAsync = allowUnsafeEvalAndUnsafeNewFunctionAsync;
exports.loadDependency = (dependencyPath) => allowUnsafeEval(() => allowUnsafeNewFunction(() => require(path.resolve(exports.extensionDirectoryPath, "dependencies", dependencyPath))));
function Function(...args) {
    let body = "";
    const paramLists = [];
    if (args.length) {
        body = arguments[args.length - 1];
        for (let i = 0; i < args.length - 1; i++) {
            paramLists.push(args[i]);
        }
    }
    const params = [];
    for (let j = 0, len = paramLists.length; j < len; j++) {
        let paramList = paramLists[j];
        if (typeof paramList === "string") {
            paramList = paramList.split(/\s*,\s*/);
        }
        params.push.apply(params, paramList);
    }
    return vm.runInThisContext(`
    (function(${params.join(", ")}) {
      ${body}
    })
  `);
}
exports.Function = Function;
Function.prototype = global.Function.prototype;
//# sourceMappingURL=utility.js.map