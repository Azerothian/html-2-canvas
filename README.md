# html-2-canvas

This a pure javascript html renderer for canvas, using the libraries parse5, css-parse and css-select.

It is intended for use with both node with (node-canvas), and the latest browsers.

![Demo](/output/example.jpg?raw=true "Demo")

## Caveats

- simple flow engine, no div floating, all elements are either a new line or a line element.
- Treats all elements as div's except for tags the following tags
  - span, strong, em, code, samp, kbd, var, b
  - This can be expanded on via options.lineTags: [String]
- font*, text*, color are the only style tags that get applied to children elements.
- fetch is required for downloading images. a polyfill (whatwg-fetch) for unsupported browsers and for node support it needs to be passed as an option.fetch: fetch.
- font-size and font-family must be defined on any parent element for text to render.
- for webpack you need to add the following to config for it to compile

```json
{
  "node": {
    "fs": "empty"
  }
}
```

## Supported Html Tags

- div (treats all unknown elements as divs);
- img
- br
- span, strong, em, code, samp, kbd, var, b
  - it will render these tags as a line item, though you will need to provide a style for them


## Supported CSS Tags

- margin (shorthand and expanded) px only
- padding (shorthand and expanded);
- font (shorthand and expanded) 'shorthand' thanks to canvas font support
- color
- background-color
- width
- em and % text sizing.

```css
body {
  font-family: Arial;
  font-size: 14px;
  padding: 5px;
  background-color: rgba(0,0,0);
  color: #fff;
}
p {
  padding-top: 0px;
  padding-left: 5px;
  padding-bottom: 5px;
}
strong, b { 
  font-weight: bold;
}
em, i, var { 
  font-style: italic;
}
code, samp, kbd {
  font-family: monospace;
}
center {
  text-align: center;
}

```

### Planned Support

- text-decoration
- background (shorthand and expanded)
- border (shorthand and expanded)
- transform
- box-shadow
- position
- margin: auto
- float: left, right, clear: both

## TODO

- reduce render time - optimise the multiple loops into a single process loop?

## Example - Node >= 7.10

```javascript
import fetch from "node-fetch";

import sourceMapSupport from "source-map-support";
sourceMapSupport.install();
import path from "path";
import fs from "fs";

import Html2Canvas from "html-2-canvas";
import Canvas from "canvas";

const stylesheet = `
body {
  font-family: Arial;
  font-size: 14px;
  padding: 5px;
  background-color: rgba(0,0,0);
  color: #fff;
}
p {
  padding-top: 0px;
  padding-left: 5px;
  padding-bottom: 5px;
}
`;
(async() => {
  try {
    const html = `<html>
  <head>
    <style>
      strong, b { 
        font-weight: bold;
      }
      em, i, var { 
        font-style: italic;
      }
      code, samp, kbd {
        font-family: monospace;
      }
      center {
        text-align: center;
      }
    </style>
  </head>
  <body>
    <div class="row">
      <p><span>asdd<span style="font-size:36px; font-style: italic;">HELLO</span></span></p>
      <p>Howdy&#x0022;&nbsp;&#x0022;<br /><strong>Stranger</strong><br/><br/><br/>lets play?</p>
      <p>2nd</p>
      <p style="text-align: right;">
        <span style="font-size: 12px;">3rd</span>4th
      </p>
      <p style="width: 50px;">
        <span style="background-color: rgba(255,255,255,0.3);">1111111111<em><strong>111111</strong></em>11111111111</span>
      </p>
      <p style="background-color: rgba(255,255,255,0.5)">
        <span style="font-size: 12px">3rd</span>4th<br/>
        5th<span>lol</span>
        <span>asdd<span style="font-size:36px">HELLO</span></span>
      </p>
      <p style="background-color: rgba(255,255,255,0.1); text-align: center;">
        <img src="https://lh3.googleusercontent.com/6bYd0ESbr0b8MLVMv_CAT74WpyHOQSuE6NzDwey4Cw8DHkChPyZi263mIfJdJtwjSBs=w170" style="width: 100px; height: 100px;" />
      </p>
      <p>
        <center>Centered By Tag</center>
      </p>
      <div style="float: right; width: 100px; height: 100px;">

      </div>
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

## Change Log

### 0.0.2

- added support for inline styles
- line elements can now use background color
- added lineTags as an options to extend the classification of line typed element
- fixed css inheritancy issue between the parent element and the line elements
- fixed render issue for non renderable elements, added option.doNotRender: [String]
- fixed render issue with children line elements chaining styles from parent line elements

### 0.0.3

- added support for all css sizing units for all elements
- separated out process and render from core render func
- added test cases for new size unit class

### 0.0.4

- patch for recursive em font sizing

### 0.0.5

- removed inheritancy of number with unit size class as it breaks object compare.
- stopped em calculation from multipling on it self.

### 0.0.6

- uglifyjs has a problem with Size class name or is it the babel compile?

### 0.0.7

- yes it does.

### 0.0.8
- Added trim to preprocess each line of the html file instead of trimming the elements
- another em inheritancy fix
- cleaned up files to be a little bit more coherent
- Adjusted line renderer to allow for setting line-height