const sizeCheck = /([0-9|\.]*)([a-zA-Z|%]*)/;

export default class Size extends Number {
  static test(e) {
    if (!isNaN(parseFloat(e))) {
      return true;
    }
    const m = sizeCheck.exec(e).filter((f) => f !== "");
    return m.length === 3;
  }
  static zero() {
    return new Size(0);
  }
  static add(i, ...a) {
    return new Size(a.reduce((v, s) => {
      // console.log("Addd", {v, s, test: typeof s, test2: s instanceof Size });
      return (v + s);
    }, i));
  }
  static subtract(i, ...a) {
    return new Size(a.reduce((v, s) => {
      return (v - s);
    }, i));
  }
  static multiply(i, ...a) {
    return new Size(a.reduce((v, s) => {
      return (v * s);
    }, i));
  }
  static divide(i, ...a) {
    return new Size(a.reduce((v, s) => {
      return (v / s);
    }, i));
  }
  static equals(a, b) {
    return a.equals(b);
  }
  constructor(s) {
    super();
    // console.log("construct", s);
    if (typeof s === "number") {
      this.val = s;
      this.measure = "px";
      return;
    }
    if (`${s}`.indexOf("%") > -1) {
      this.val = parseFloat(s);
      this.measure = "%";
      return;
    }
    if (!Size.test(s)) {
      this.val = parseFloat(s);
      if (isNaN(this.val)) {
        throw new Error(`This is not a size value '${s}'`, s);
      }
      this.measure = "px";
      return;
    }

    let results = s.match(sizeCheck);
    let [input, val, measure] = results;
    // console.log("val", val, results);
    this.val = parseFloat(val);
    this.measure = measure;
    // this.size = 
  }
  add(...a) {
    return Size.add.apply(undefined, [this].concat(a));
  }
  subtract(...a) {
    return Size.subtract.apply(undefined, [this].concat(a));
  }
  multiply(...a) {
    return Size.multiply.apply(undefined, [this].concat(a));
  }
  divide(...a) {
    return Size.divide.apply(undefined, [this].concat(a));
  }
  equals(sizeElement) {
    return this.valueOf() === sizeElement.valueOf();
  }
  valueOf(element, modifier) {
    switch ((this.measure || "").toLowerCase()) {
      case "em":
        // console.log("element.parent", element.parent)
        let baseSize = element.parent.format.font.size.valueOf(element.parent);
        // console.log("baseSize", baseSize, this.val);
        return this.val * baseSize;
      case "vw":
        return (this.val / 100) * element.renderer.width;
      case "vh":
        return (this.val / 100) * element.renderer.height;
      case "vmin":
        if (element.renderer.width < element.renderer.height) {
          return (this.val / 100) * element.renderer.width;
        }
        return (this.val / 100) * element.renderer.height;
      case "vmax":
        if (element.renderer.width > element.renderer.height) {
          return (this.val / 100) * element.renderer.width;
        }
        return (this.val / 100) * element.renderer.height;
      case "%":
        if (!modifier) {
          throw new Error("can not calculate percentages without a target modifier");
        }
        let r = (modifier) * (this.val / 100);
        return r;
      case "cm":
        return (this.val * 37.80);
      case "mm":
        return (this.val * 3.78);
      case "in":
        return (this.val * 96);
      case "pt":
        return (this.val * 1.33); //96/72
      case "pc":
        return (this.val * 15.96); //12pt
    }
    // console.log("this.val", this.val);
    return this.val;
  }
}

// export default function parsePx(px) {
//   if (!Number.isInteger(px)) {
//     if ((px.indexOf("px") > -1 && px.indexOf(" ") === -1)) {
//       return Number(px.replace(/px$/, ""));
//     }
//   }
//   return px;
// }


