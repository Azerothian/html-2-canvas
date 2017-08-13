import * as parse5 from "parse5";
import parseCss from "css-parse";
import CSSselect from "css-select";


function parsePx(px) {
  if(!Number.isInteger(px)) {
    return Number(px.replace(/px$/, ''));
  }
  return px;
}

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
    element.format[dec.property] = dec.value;
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

const inheritable = [
  "font",
  "text"
];

async function processElement(element, parentCtx, cx2d, canvas) {
  const ctx = {
    render: {
      x: parentCtx.render.x || 0,
      y: parentCtx.render.y || 0,
    },
    style: {
      padding: {top: 0, bottom: 0, left: 0, right: 0},
      margin: {top: 0, bottom: 0, left: 0, right: 0},
    },
  };
  if (parentCtx.style) {
    ctx.style = Object.keys(parentCtx.style).reduce((s, key) => {
      for (let x in inheritable) {
        if (key.indexOf(inheritable[x]) > -1) {
          s[key] = parentCtx.style[key];
        }
      }
    }, ctx.style);
  }
  ctx.style = Object.keys(element.format).reduce((s, key) => {
    const value = element.format[key];
    if (key.indexOf("margin-") > -1 || key.indexOf("padding-") > -1) {
      const k = key.split("-");
      s[k[0]][k[1]] = parsePx(value);
    } else if (key === "margin" || key === "padding") {
      s[key] = extractShorthandSpacing(value);
    } else {
      s[key] = value;
    }
    return s;
  }, );


  
  ctx.render.x += ctx.style.margin.top;
  ctx.render.y += ctx.style.margin.left;

  ctx.render.x += ctx.style.padding.top;
  ctx.render.y += ctx.style.padding.left;

  ctx.outerWidth = context.innerWidth - ctx.style.margin.left - ctx.style.margin.right;
  ctx.innerWidth = ctx.outerWidth - ctx.style.padding.left - ctx.style.padding.right;

  

  if (element.children) {
    return element.children.reduce((promise, child) => {
      // console.log("processing children", child);
      return promise.then((context) => {
        return processElement(child, ctx, cx2d, canvas);
      });
    }, Promise.resolve(context));
  }
  return undefined;
}

export default async function html2canvas(html, canvas, options = {}) {
  let {stylesheet} = (options.stylesheet) ? parseCss(options.stylesheet) : {};
  const dom = parse5.parse(html, {
    treeAdapter: parse5.treeAdapters.htmlparser2,
  });
  if (stylesheet) {
    applyStylesheet(stylesheet, dom);
  }
  applyStyleTag(dom);
  const cx2d = canvas.getContext("2d");
  await processElement(dom, {
    innerWidth: canvas.width,
  }, cx2d, canvas);

}

