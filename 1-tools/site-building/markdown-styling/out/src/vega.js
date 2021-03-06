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
exports.toSVG = void 0;
const vega_loader_1 = require("vega-loader");
const YAML = require("yamljs");
const utility = require("./utility");
let vega = null;
function renderVega(spec, baseURL) {
    return __awaiter(this, void 0, void 0, function* () {
        const svgHeader = '<?xml version="1.0" encoding="utf-8"?>\n' +
            '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" ' +
            '"http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">\n';
        if (baseURL && baseURL[baseURL.length - 1] !== "/") {
            baseURL += "/";
        }
        function helper() {
            return __awaiter(this, void 0, void 0, function* () {
                const view = new vega.View(vega.parse(spec), {
                    loader: vega_loader_1.loader({ baseURL }),
                    // logLevel: vega.Warn, // <= this will cause Atom unsafe eval error.
                    renderer: "none",
                }).initialize();
                return svgHeader + (yield view.toSVG());
            });
        }
        return yield utility.allowUnsafeEvalAndUnsafeNewFunctionAsync(helper);
    });
}
/**
 * Modifed from the `vg2svg` file.
 * @param spec The vega code.
 */
function toSVG(spec = "", baseURL = "") {
    return __awaiter(this, void 0, void 0, function* () {
        if (!vega) {
            vega = utility.loadDependency("vega/vega.min.js");
        }
        spec = spec.trim();
        let d;
        if (spec[0] !== "{") {
            // yaml
            d = YAML.parse(spec);
        }
        else {
            // json
            d = JSON.parse(spec);
        }
        return renderVega(d, baseURL);
    });
}
exports.toSVG = toSVG;
//# sourceMappingURL=vega.js.map