
import "babel-polyfill";
import * as parse5 from "parse5";
import parseCss from "css-parse";
import CSSselect from "css-select";

// import parsePx from "./utils/parse-px";
import UnitSize from "./utils/unit-size";

import ElementRenderer from "./renderers/element";

function applyStylesheet(stylesheet, dom) {
  // console.log("stylesheet", stylesheet.rules);
  stylesheet.rules.forEach((rule) => {
    // console.log("rule", rule);
    rule.selectors.forEach((selector) => {
      // console.log("selector", selector);
      const elements = CSSselect.selectAll(selector, dom);
      elements.forEach((element) => applyStyleFormat(element, rule.declarations));
    });
  });
}
function applyInlineStylesheets(dom) {
  const styleElements = CSSselect.selectAll("style", dom);
  styleElements.forEach((style) => {
    const {stylesheet} = parseCss(style.children[0].data);
    return applyStylesheet(stylesheet, dom);
  });

}

function applyStyleFormat(element, declarations) {
  if (!element.format) {
    element.format = {};
  }
  declarations.forEach((dec) => {
    const {property, value} = dec;
    const v = value.trim();

    if (property.indexOf("-") > -1) {
      const k = property.split("-");
      if (k.length > 2) {
        console.error("we do not support any browser based css extensions", dec);
      } else {
        if (!element.format[k[0]]) {
          element.format[k[0]] = {};
        }
        if (typeof element.format[k[0]] !== "string") {
          if (UnitSize.test(v)) {
            element.format[k[0]][k[1]] = new UnitSize(v);
          } else {
            element.format[k[0]][k[1]] = v;
          }
        }
      }
    } else if (property === "margin" || property === "padding") {
      element.format[property] = extractShorthandSpacing(v);
    } else if (UnitSize.test(v)) {
      element.format[property] = new UnitSize(v);
    } else {
      element.format[property] = v;
    }
  });
}

function applyStyleTag(node) {
  if (node.children) { //TODO rather then recursive processing need to flatten the dom then apply
    if (node.children.length > 0) {
      node.children.forEach((child) => applyStyleTag(child));
    }
  }
  if (node.attribs) {
    if (node.attribs.style && node.attribs.style !== "") {
      const {stylesheet} = parseCss(`element { ${node.attribs.style} }`);
      stylesheet.rules.forEach((rule) => {
        applyStyleFormat(node, rule.declarations);
      });
    }
  }
}

function extractShorthandSpacing(s) {
  const e = s.split(" ").map((r) => new UnitSize(r));
  if (e.length === 1) {
    return {
      top: e[0],
      bottom: e[0],
      left: e[0],
      right: e[0],
    };
  }
  if (e.length === 2) {
    return {
      top: e[0],
      bottom: e[0],
      left: e[1],
      right: e[1],
    };
  }
  if (e.length === 3) {
    return {
      top: e[0],
      bottom: e[2],
      left: e[1],
      right: e[1],
    };
  }
  if (e.length === 4) {
    return {
      top: e[0],
      bottom: e[2],
      left: e[3],
      right: e[1],
    };
  }
  return {
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  };
}
let fetch;
if (typeof window === "object") {
  fetch = window.fetch;
}

export default class Html2Canvas {
  constructor(options = {}) {
    this.options = options;
    this.lineTags = (options.lineTags || []).concat([ // list of tags that will be treated as side by side line element
      "strong", "em", "code", "samp", "kbd", "var", "br", "img",
      "span", "b", "i",
    ]);
    this.inheritableCSS = (options.inheritableCSS || []).concat([
      "font",
      "text",
      "color",
    ]);
    this.doNotRender = (options.doNotRender || []).concat([
      "head",
      "style",
      "link",
    ]);
  }
  createCanvas(options) {
    if (this.options.createCanvas) {
      return this.options.createCanvas(options);
    }
    let canvas = document.createElement("canvas");
    canvas.height = options.height;
    canvas.width = options.width;
    return canvas;
  }
  createImage() {
    if (this.options.createImage) {
      return this.options.createImage();
    }
    return new Image();
  }
  fetch() {
    if (this.options.fetch) {
      return this.options.fetch.apply(undefined, arguments);
    }
    return fetch.apply(undefined, arguments);
  }
  async process(html, canvas) {
    let {stylesheet} = (this.options.stylesheet) ? parseCss(this.options.stylesheet) : {};
    const dom = parse5.parse(html, {
      treeAdapter: parse5.treeAdapters.htmlparser2,
    });
    if (stylesheet) {
      applyStylesheet(stylesheet, dom);
    }
    applyInlineStylesheets(dom);
    applyStyleTag(dom);
    this.dom = dom;
    this.canvas = canvas;
    this.width = canvas.width;
    this.height = canvas.height;

    this.rootElement = new ElementRenderer({
      element: dom,
      parent: {
        bounding: {
          topInner: UnitSize.zero(),
          leftInner: UnitSize.zero(),
          widthInner: new UnitSize(`${canvas.width}px`),
          height: UnitSize.zero(),
        },
      },
      renderer: this,
    });
    await this.rootElement.process();
    return this.rootElement;
  }
  async render() {
    const cx2d = this.canvas.getContext("2d");
    await this.rootElement.render(cx2d);
  }
}
