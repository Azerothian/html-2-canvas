import {hashCode} from "../utils/hash";

import merge from "../utils/merge";
import parsePx from "../utils/parse-px";

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



function getCharacterData(char, style, renderer) {
  let font = style.font;
  let fontSize = 0;
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
      fontSize = font.size;
      a.push(`${font.size}px/${style.line.height}px`);
    } else if (font.size) {
      fontSize = font.size;
      a.push(`${font.size}px`);
    }
    if (font.family) {
      a.push(font.family);
    }
    font = a.join(" ");
  } else {
    const e = font.split(" ");
    const val = e[e.length - 2];
    if (val.indexOf("/") > -1) {
      fontSize = parsePx(val.split("/")[0]);
    } else {
      fontSize = parsePx(val);
    }
  }

  const ctx = getBuffer(renderer);
  ctx.save();
  ctx.font = font;
  let info = {
    key: char,
    height: fontSize,
    width: ctx.measureText(char).width,
    font,
    style,
  };
  ctx.restore();
  return info;
}


function processElements(elements, renderer, parentFormat, parent) {
  return elements.reduce(async(p, e) => {
    return p.then(async(a) => {
      if (e.type === "text" || e.name === "img" || e.name === "br") {
        try {
          // console.log("PARENT FORMAT", parentFormat);
          e.format = merge({}, parentFormat, (parent || {}).format || {}, e.format);
          if (e.name === "img") {
            e.data = await loadImage(e.attribs.src, renderer);
          }
          a.push(e);
        } catch (err) {
          console.error(`error loading image, skipping element - ${e.attribs.src}`);
        }
      } else {
        a = a.concat(await processElements(e.children, renderer, parentFormat, e));
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
      top: yPos,
      left: this.parent.bounding.leftInner,
      height: 0,
      width: this.parent.bounding.widthInner,
    };
    this.lines = [];
    const flat = await processElements(this.elements, this.renderer, this.parent.format);
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
          line.height = element.format.font.size;
        }
        this.bounding.height += line.height;
        this.lines.push(line);
        line = {
          width: 0,
          height: 0,
          chars: [],
        };
      } else if (element.name === "img") {
        const img = element.data;
        const imgWidth = (element.format || {}).width || img.width;
        const imgHeight = (element.format || {}).height || img.height;
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
            const data = getCharacterData(text[i], element.format, this.renderer);
            if ((data.width + line.width) > this.bounding.width) {
              this.bounding.height += line.height;
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
      this.bounding.height += line.height;
      this.lines.push(line);
    }
    return this.bounding.height;
  }
  render(cx2d) {
    let x = this.bounding.left;
    let y = this.bounding.top;
    cx2d.save();
    for (let s = 0; s < this.lines.length; s++) {
      const currentLine = this.lines[s];
      y += (currentLine.height);

      let skip = 0;
      const freeSpace = (this.bounding.width - currentLine.width);
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
      x = this.bounding.left;
    }
    cx2d.restore();
  }
}