# html-2-canvas

This a pure javascript html renderer for canvas, using the libraries parse5, css-parse and css-select.

It is intended for use with both node with (node-canvas), and the latest browsers.

## Caveats

- currently treats all elements as div's except text, img and span tags.
- only uses pixels for size references
- font*, text*, color are the only style tags that get applied to children elements.
- fetch is required for downloading images. a polyfill (whatwg-fetch) for unsupported browsers and for node support it needs to be passed as an option.

## Supported Html Tags

- div (treats all unknown elements as divs);
- span
- img
- br

## Supported CSS Tags

- margin (shorthand and expanded) px only
- padding (shorthand and expanded);
- font (shorthand and expanded) 'shorthand' thanks to canvas font support
- color
- background-color
- width

## Planned Support

- background (shorthand and expanded)
- border (shorthand and expanded)
- margin: auto
- em and % sizing.
- html character codes &nbps; etc
- transform
- box-shadow
- position

## TODO

- reduce render time - optimise the multiple loops into a single process loop?
- add file:// support for node

## Example - Node >= 7.10

```javascript
import fetch from "node-fetch";
import path from "path";
import fs from "fs";

import Html2Canvas from "html-2-canvas";
import Canvas from "canvas";

(async() => {
  try {
    const html = `<html>
  <body>
    <div class="row">
      <p><span>asdd<span style="font-size:36px; font-style: italic;">HELLO</span></span></p>
      <p>Howdy</p>
      <p>2nd</p>
      <p style="text-align: right;">
        <span style="font-size: 12px;">3rd</span>4th
      </p>
      <p style="width: 100px; background-color: rgba(255,255,255,0.3)">
        111111
      </p>
      <p style="background-color: rgba(255,255,255,0.5)">
        <span style="font-size: 12px">3rd</span>4th<br/>
        5th<span>lol</span>
        <span>asdd<span style="font-size:36px">HELLO</span></span>
      </p>
      <p style="background-color: rgba(255,255,255,0.1); text-align: center;">
        <img src="https://lh3.googleusercontent.com/6bYd0ESbr0b8MLVMv_CAT74WpyHOQSuE6NzDwey4Cw8DHkChPyZi263mIfJdJtwjSBs=w170" style="width: 100px; height: 100px;" />
      </p>
    </div>
  </body>
  </html>`;
    const canvas = new Canvas(500, 500);
    const renderer = new Html2Canvas({
      stylesheet,
      createCanvas({height, width}) {
        return new Canvas(height, width);
      },
      createImage() {
        return new Canvas.Image();
      },
      fetch: fetch,
    });
    await renderer.render(html, canvas);
    canvas.createJPEGStream().pipe(fs.createWriteStream(path.join(process.cwd(), "image.jpg")));
  } catch (err) {
    console.log("err", err);
  }
})();

```