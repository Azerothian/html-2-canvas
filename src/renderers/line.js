import {hashCode} from "../utils/hash";

import merge from "../utils/merge";
// import parsePx from "../utils/parse-px";
import Size from "../utils/size";

const cache = {
  images: {},
};

let buff, cvs;
function getBuffer(renderer) {
  if (!buff) {
    cvs = renderer.createCanvas({
      height: 50,
      width: 50,
    });
    buff = cvs.getContext("2d");
  }
  return buff;
}

function loadImage(src, renderer) {
  return new Promise(async(resolve, reject) => {
    try {
      const key = `_${hashCode(src)}`;
      if (cache.images[key]) {
        return resolve(cache.images[key]);
      }
      cache.images[key] = renderer.createImage();
      cache.images[key].onload = () => resolve(cache.images[key]);
      cache.images[key].onerror = (e) => reject(e);
      if (typeof window === "undefined" && (src.startsWith("http") || src.startsWith("\\"))) {
        cache.images[key].src = await renderer.fetch(src).then((r) => r.buffer());
      } else {
        cache.images[key].src = src;
      }
      return undefined;
    } catch (e) {
      return reject(e);
    }
  });

}

function getCharacterData(char, style, element, renderer) {
  let font = style.font;
  let fontHeight = 0;
  if (!font) {
    console.error("font is not defined unable to set");
  } else if (typeof font === "object") {
    const a = [];
    if (font.style) {
      a.push(font.style);
    }
    if (font.variant) {
      a.push(font.variant);
    }
    if (font.weight) {
      a.push(font.weight);
    }
    if (font.size && (style.line || {}).height) {
      fontHeight = font.size.valueOf(element);
      a.push(`${fontHeight}px/${style.line.height}px`);
    } else if (font.size) {
      fontHeight = font.size.valueOf(element);
      a.push(`${fontHeight}px`);
    }
    if (font.family) {
      a.push(font.family);
    }
    font = a.join(" ");
  } else {
    const e = font.split(" ");
    const val = e[e.length - 2];
    if (val.indexOf("/") > -1) {
      fontHeight = new Size(val.split("/")[0]).valueOf(element);
    } else {
      fontHeight = new Size(val).valueOf(element);
    }
  }

  const ctx = getBuffer(renderer);
  ctx.save();
  ctx.font = font;
  // console.log("fontHeight", fontHeight);
  let info = {
    key: char,
    height: fontHeight,
    width: ctx.measureText(char).width,
    font,
    style,
  };
  ctx.restore();
  return info;
}
function mergeFormat(target, source, renderer) {
  return Object.keys(source).reduce((s, key) => {
    for (let x in renderer.inheritableCSS) {
      if (key.indexOf(renderer.inheritableCSS[x]) > -1) {
        if (!s[key]) {
          s[key] = source[key];
        } else if (typeof s[key] === "object" && typeof source[key] === "object") {
          s[key] = merge({}, s[key], source[key]);
        } else {
          s[key] = source[key];
        }
      }
    }
    return s;
  }, target);
}



// function processElements(elements, renderer, parentContainer, parentElement) {
//   return elements.reduce(async(p, e) => {
//     return p.then((a) => {

//     });
//   }, Promise.resolve([]));
// }

function processElements(elements, renderer, parentContainer, parentElement = {}) {
  return elements.reduce(async(p, e) => {
    return p.then(async(a) => {
      e.format = merge({},
        mergeFormat({}, parentContainer.format, renderer),
        parentElement.format || {},
        e.format
      );
      if (e.type === "text" || e.name === "img" || e.name === "br") {
        try {
          if (e.name === "img") {
            e.data = await loadImage(e.attribs.src, renderer);
          }
          a.push(e);
        } catch (err) {
          console.error(`error loading image, skipping element - ${e}`, err);
        }
      } else {

        a = a.concat(await processElements(e.children, renderer, parentContainer, e));
      }
      return a;
    });
  }, Promise.resolve([]));
}


export default class LineRenderer {
  constructor({elements, parent, renderer}) {
    this.elements = elements;
    this.renderer = renderer;
    this.parent = parent;
  }
  async process(yPos) {
    this.bounding = {
      top: new Size(yPos),
      left: this.parent.bounding.leftInner,
      height: Size.zero(),
      width: this.parent.bounding.widthInner,
    };
    this.lines = [];
    const flat = await processElements(this.elements, this.renderer, this.parent);
    let line = {
      width: 0,
      height: 0,
      chars: [],
      style: {},
    };
    for (let x in flat) {
      const element = flat[x];
      if (element.name === "br") {
        if (line.height === 0) {
          line.height = element.format.font.size.valueOf(element);
        }
        this.bounding.height = this.bounding.height.add(line.height);
        this.lines.push(line);
        line = {
          width: 0,
          height: 0,
          chars: [],
        };
      } else if (element.name === "img") {
        const img = element.data;
        const imgWidth = (element.format || {}).width.valueOf(element) || img.width;
        const imgHeight = (element.format || {}).height.valueOf(element) || img.height;
        if ((imgWidth + line.width) > this.bounding.width && line.chars.length > 0) {
          this.lines.push(line);
          line = {
            width: 0,
            height: 0,
            chars: [],
          };
        }
        line.chars.push({
          img,
          element,
          width: imgWidth,
          height: imgHeight,
        });
        if (line.height < imgHeight) {
          line.height = imgHeight;
        }
        line.width += imgWidth;
      } else if (element.type === "text") {
        const text = (element.data || "").trim();
        if (text.length > 0) {
          for (let i = 0; i < text.length; i++) {
            const data = getCharacterData(text[i], element.format, element, this.renderer);
            if ((data.width + line.width) > this.bounding.width) {
              this.bounding.height = this.bounding.height.add(line.height);
              this.lines.push(line);
              line = {
                width: 0,
                height: 0,
                chars: [],
              };
            }
            if (data.height > line.height) {
              line.height = data.height; // need to set this from line-height?
            }
            line.width += data.width;
            line.chars.push(data);
          }

        }
      }
    }
    if (line.height > 0) {
      this.bounding.height = this.bounding.height.add(line.height);
      this.lines.push(line);
    }
    return this.bounding.height.valueOf();
  }
  render(cx2d) {
    let x = this.bounding.left.valueOf();
    let y = this.bounding.top.valueOf();
    cx2d.save();
    for (let s = 0; s < this.lines.length; s++) {
      const currentLine = this.lines[s];
      y += (currentLine.height);

      let skip = 0;
      const freeSpace = (this.bounding.width.valueOf() - currentLine.width);
      switch ((this.parent.format.text || {}).align || "left") {
        case "center":
          x += (freeSpace / 2);
          break;
        case "right":
          x += freeSpace;
          break;
        case "justify":
          skip = (freeSpace / currentLine.chars.length) / 2; //TODO: This is not perfect, does not goto end of line
          break;
      }
      for (let i = 0; i < currentLine.chars.length; i++) {
        const data = currentLine.chars[i];
        x += (skip || 0);
        if (data.key) {
          if (data.style.background) {
            if (data.style.background.color) {
              cx2d.fillStyle = data.style.background.color;
              cx2d.fillRect(x, y - data.height, data.width, data.height);
            }
          }
          if (data.style.color) {
            cx2d.fillStyle = data.style.color;
          }
          cx2d.font = data.font;
          cx2d.fillText(data.key, x, y);
        }
        if (data.img) {
          cx2d.drawImage(data.img, x, y - data.height, data.width, data.height);
        }
        x += data.width + (skip || 0);
      }
      x = this.bounding.left.valueOf();
    }
    cx2d.restore();
  }
}
