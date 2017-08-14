

import merge from "../utils/merge";
import LineRenderer from "./line";

const inheritable = [
  "font",
  "text",
  "color",
];

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
          for (let x in inheritable) {
            if (key.indexOf(inheritable[x]) > -1) {
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
      }
    }
    this.format = merge(this.format, element.format);
  }
  async process(yIndex = 0) {
    const width = (this.format.width) ? this.format.width :
      this.parent.bounding.widthInner - this.format.margin.left - this.format.margin.right;
    const top = yIndex + this.format.margin.top;
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
        if (child.name === "br" || child.name === "span" || child.type === "text" || child.name === "img") {
          textElements.push(child);
        } else {
          if (textElements.length > 0) {
            const lr1 = new LineRenderer({
              elements: textElements,
              parent: this,
              renderer: this.renderer});
            // console.log("lr1 before", yIndex);
            yIndex += await lr1.process();
            // console.log("lr1 after", yIndex);
            // console.log("first line renderer", yIndex);
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

          // console.log("el before", yIndex);
          yIndex = await el.process(yIndex);
          // console.log("el after", yIndex);
          // console.log("element renderer", {yIndex, el});
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
        // console.log("lr2 before", yIndex);
        yIndex += await lr2.process();
        // console.log("lr2 after", yIndex);
        if (lr2.bounding.height > 0) {
          this.children.push(lr2);
        }
      }
    }
    // console.log("this.format.padding.bottom", this.format.padding.bottom);
    // console.log("this.format.margin.bottom", this.format.margin.bottom);
    this.bounding.height += (yIndex + this.format.padding.bottom);
    const result = this.bounding.height + this.format.margin.bottom;
    return result;
  }
  async render(cx2d) {
    // console.log("start renderer", this.bounding);
    cx2d.save();

    if (this.format.background) {
      if (this.format.background.color) {
        console.log("background", this.bounding);
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
