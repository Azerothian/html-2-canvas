import * as parse5 from "parse5";
import parseCss from "css-parse";
import CSSselect from "css-select";

// import merge from "./utils/merge";
import parsePx from "./utils/parse-px";
// import lineRenderer from "./renderers/line";

import ElementRenderer from "./renderers/element";

function applyStylesheet(stylesheet, dom) {
  // console.log("defaultStylesheet", stylesheet.rules);
  stylesheet.rules.forEach((rule) => {
    // console.log("rule", rule);
    rule.selectors.forEach((selector) => {
      // console.log("selector", selector);
      const elements = CSSselect.selectAll(selector, dom);
      elements.forEach((element) => applyStyleFormat(element, rule.declarations));
    });
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
          element.format[k[0]][k[1]] = parsePx(v);
        }
      }
    } else if (property === "margin" || property === "padding") {
      element.format[property] = extractShorthandSpacing(v);
    } else {
      element.format[property] = parsePx(v);
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
// function extractFontShorthand(s, style) {
//   const e = s.split(" ");
//   if (!style.font) {
//     style.font = {};
//   }
//   if (e.length === 2) {
//     style.font.size = (e[0].indexOf("px") > -1) ? parsePx(e[0]) : e[0];
//     style.font.family = e[1];
//   }
//   // const style = {};
//   // if(e[0]) {
//   //   style.font.style = e[0];
//   // }
//   // if(e[1]) {
//   //   style.font.variant = e[1];
//   // }
//   // if(e[2]) {
//   //   style.font.weight = e[2];
//   // }
//   // if (e[3]) {
//   //   if (e[3].indexOf("/") > -1) {
//   //     const c = e[3].split("/");
//   //     style.font.size = c[0];
//   //     style.line.height = c[1];
//   //   }
//   // }

// }


function extractShorthandSpacing(s) {
  const e = s.split(" ").map((r) => parsePx(r));
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

/* 
-> margin-top -> border -> padding-top -> contents 
-> padding-bottom -> border -> margin-bottom
*/

/* text, span treated the same */
/* context
.pos = {
  x,
  y
}
.style
*/

// async function contentRenderer() {


// }




// const inheritable = [
//   "font",
//   "text",
//   "color",
// ];

// async function processElement(element, parentCtx, cx2d, renderer) {

//   // console.log("processElement", {renderer});
//   console.log("parentpos", parentCtx.pos, element.name || element.type);
//   let ctx = {
//     pos: {
//       x: parentCtx.pos.x || 0,
//       y: parentCtx.pos.y || 0,
//     },
//     style: {
//       padding: {top: 0, bottom: 0, left: 0, right: 0},
//       margin: {top: 0, bottom: 0, left: 0, right: 0},
//     },
//   };







//   if (parentCtx.style) {
//     // ctx.style = merge({}, parentCtx.style);

//     ctx.style = Object.keys(parentCtx.style).reduce((s, key) => {
//       for (let x in inheritable) {
//         // console.log("inherits", inheritable[x], key);
//         if (key.indexOf(inheritable[x]) > -1) {
//           if (!s[key]) {
//             s[key] = parentCtx.style[key];
//           } else if (typeof s[key] === "object" && typeof parentCtx.style[key] === "object") {
//             s[key] = merge({}, s[key], parentCtx.style[key]);
//           } else {
//             s[key] = parentCtx.style[key];
//           }
//         }
//       }
//       return s;
//     }, ctx.style);
//   }
//   if (element.format) {
//     ctx.style = merge({}, ctx.style, element.format);
//   }


//   let box = {
//     top: parentCtx.pos.y + ctx.style.margin.top + ctx.style.padding.top,
//     left: parentCtx.pos.x + ctx.style.margin.left + ctx.style.padding.left,
//     height: 0,
//     width: 0
//   };



//   let renders = [];



//   console.log("ctx.pos", ctx.pos);
//   ctx.pos.x += ctx.style.margin.top;
//   ctx.pos.y += ctx.style.margin.left;
//   //todo: border spacing
//   ctx.pos.x += ctx.style.padding.top;
//   ctx.pos.y += ctx.style.padding.left;
//   if (ctx.style.width) {
//     ctx.outerWidth = ctx.style.width + ctx.style.margin.left + ctx.style.margin.right;
//     ctx.width = ctx.style.width;
//   } else {
//     ctx.outerWidth = parentCtx.innerWidth;
//     ctx.width = ctx.outerWidth - ctx.style.margin.left - ctx.style.margin.right;
//   }
//   ctx.innerWidth = ctx.width - ctx.style.padding.left - ctx.style.padding.right;
  
//   // console.log(ctx);
//   //TODO: element height & background rendering
//   if (element.children) {

//     let textElements = [];
//     for (let x in element.children) {
//       const child = element.children[x];
//       if (child.name === "br" || child.name === "span" || child.type === "text" || child.name === "img") {
//         // console.log("pushing line elements");
//         textElements.push(child);
//       } else {
//         if (textElements.length > 0) {
//           // console.log("calling line renderer", child.name || child.type, renderer);
//           ctx = await lineRenderer(textElements, ctx, cx2d, renderer);
//           textElements = [];
//         }
//         ctx = await processElement(child, ctx, cx2d, renderer);
//       }
//     }

//     if (textElements.length > 0) {
//       ctx = await lineRenderer(textElements, ctx, cx2d, renderer);
//       // textElements = [];
//     }
//   }


//   parentCtx.pos.x = 0;
//   parentCtx.pos.y = ctx.pos.y + ctx.style.padding.bottom + ctx.style.margin.bottom;
//   //TODO modify pos
  
//   console.log("return", parentCtx.pos, element.name || element.type);
//   return parentCtx;
// }


export default class Html2Canvas {
  constructor(options = {}) {
    this.options = options;
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
  async render(html, canvas) {
    let {stylesheet} = (this.options.stylesheet) ? parseCss(this.options.stylesheet) : {};
    const dom = parse5.parse(html, {
      treeAdapter: parse5.treeAdapters.htmlparser2,
    });
    if (stylesheet) {
      applyStylesheet(stylesheet, dom);
    }
    applyStyleTag(dom);
    const cx2d = canvas.getContext("2d");

    const rootElement = new ElementRenderer({
      element: dom,
      parent: {
        bounding: {
          topInner: 0,
          leftInner: 0,
          widthInner: canvas.width,
          height: 0//canvas.height,
        },
      },
      renderer: this,
    });
    await rootElement.process();
    await rootElement.render(cx2d);

    // const ctx = {
    //   pos: {
    //     x: 0,
    //     y: 0,
    //   },
    //   innerWidth: canvas.width,
    // };
    


    // console.log("starting", ctx);
    // await processElement(dom, ctx, cx2d, this);
  }
}
