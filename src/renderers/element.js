

import merge from "../utils/merge";
import LineRenderer from "./line";


export default class ElementRenderer {
  constructor({element, parent, renderer}) {
    this.children = [];
    this.element = element;
    this.parent = parent;
    this.renderer = renderer;
    this.format = {
      padding: {top: 0, bottom: 0, left: 0, right: 0},
      margin: {top: 0, bottom: 0, left: 0, right: 0},
    };
    if (this.parent) {
      if (this.parent.format) {
        this.format = Object.keys(this.parent.format).reduce((s, key) => {
          for (let x in this.renderer.inheritableCSS) {
            if (key.indexOf(this.renderer.inheritableCSS[x]) > -1) {
              if (!s[key]) {
                s[key] = this.parent.format[key];
              } else if (typeof s[key] === "object" && typeof this.parent.format[key] === "object") {
                s[key] = merge({}, s[key], this.parent.format[key]);
              } else {
                s[key] = this.parent.format[key];
              }
            }
          }
          return s;
        }, this.format);
        // console.log("format", this.format);
      }
    }
    this.format = merge(this.format, element.format);
  }
  async process(yPos = 0) {
    // console.log("this.element.name", this.element.name);
    if (this.renderer.doNotRender.indexOf(this.element.name) > -1) {
      // console.log("this.element.name", this.element.name);
      this.bounding = {
        top: 0,
        left: 0,
        width: 0,
        topInner: 0,
        leftInner: 0,
        widthInner: 0,
        height: 0,
      };
      return 0;
    }
    const width = (this.format.width) ? this.format.width :
      this.parent.bounding.widthInner - this.format.margin.left - this.format.margin.right;
    const top = yPos + this.format.margin.top;
    const left = this.parent.bounding.leftInner + this.format.margin.left;
    this.bounding = {
      top,
      left,
      width,
      topInner: top + this.format.padding.top,
      leftInner: left + this.format.padding.left,
      widthInner: width - this.format.padding.left - this.format.padding.right,
      height: 0,
    };
    if (this.element.children) {
      let textElements = [];
      for (let x in this.element.children) {
        const child = this.element.children[x];
        if (this.renderer.lineTags.indexOf(child.name) > -1 || child.type === "text") {
          textElements.push(child);
        } else {
          if (textElements.length > 0) {
            const lr1 = new LineRenderer({
              elements: textElements,
              parent: this,
              renderer: this.renderer});
            yPos += await lr1.process(yPos);
            if (lr1.bounding.height > 0) {
              this.children.push(lr1);
            }
            textElements = [];
          }
          const el = new ElementRenderer({
            element: child,
            parent: this,
            renderer: this.renderer,
          });
          yPos = await el.process(yPos);
          if (el.bounding.height > 0) {
            this.children.push(el);
          }
        }
      }
      if (textElements.length > 0) {
        const lr2 = new LineRenderer({
          elements: textElements,
          parent: this,
          renderer: this.renderer});
        yPos += await lr2.process(yPos);
        if (lr2.bounding.height > 0) {
          this.children.push(lr2);
        }
      }
    }
    this.bounding.height += (yPos + this.format.padding.bottom);
    const result = this.bounding.height + this.format.margin.bottom;
    return result;
  }
  async render(cx2d) {
    cx2d.save();
    if (this.format.background) {
      if (this.format.background.color) {
        cx2d.beginPath();
        cx2d.rect(this.bounding.left, this.bounding.top, this.bounding.width, this.bounding.height - this.bounding.top);
        cx2d.fillStyle = this.format.background.color;
        cx2d.fill();
      }
    }
    cx2d.restore();
    for (let x in this.children) {
      const element = this.children[x];
      await element.render(cx2d);
    }
  }
}
