import * as parse5 from "parse5";
import parseCss from "css-parse";
import CSSselect from "css-select";


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


export default async function html2canvas(html, canvas, options = {}) {
  let {stylesheet} = (options.stylesheet) ? parseCss(options.stylesheet) : {};
  const dom = parse5.parse(html, {
    treeAdapter: parse5.treeAdapters.htmlparser2,
  });
  if (stylesheet) {
    applyStylesheet(stylesheet, dom);
  }
  applyStyleTag(dom);


  // console.log("dom", dom);
  const results = CSSselect.selectAll("p.test", dom);
  console.log("p", results);

}
