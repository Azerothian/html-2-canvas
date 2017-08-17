import fetch from "node-fetch";

import sourceMapSupport from "source-map-support";
sourceMapSupport.install();
import path from "path";
import fs from "fs";

import Html2Canvas from "../index";
import Canvas from "canvas";
import expect from "expect";



describe("renderer tests", () => {
  it("spacing test", async() => {
    const html = "<html><body>Test</body></html>";
    const style = "body { background-color: #fff; color: #000; font-family: Arial; font-size: 12px; width: 50%; margin-left: 25%; margin-top: 50px; padding: 10px; text-align: center;}";
    const canvas = new Canvas(150, 150);
    const renderer = new Html2Canvas({
      stylesheet: style,
      createCanvas({height, width}) {
        return new Canvas(height, width);
      },
      createImage() {
        return new Canvas.Image();
      },
      fetch: fetch,
    });
    const dom = await renderer.process(html, canvas);
    const body = dom.children[0].children[0];
    expect(body.element.name).toEqual("body");
    const expectedWidth = (canvas.width * 0.50);
    expect(body.bounding.width.valueOf()).toEqual(expectedWidth);
    await renderer.render();
    canvas.createJPEGStream().pipe(fs.createWriteStream(path.join(process.cwd(), "output/padding.jpg")));
  });
  it("font em test", async() => {
    const html = `<html>
<body>
  <div class="first">
    <div class="second">
      <p>Test <span>asd</span</p>
    </div>
  </div>
</body>
</html
`;

    const style = `body {
      background-color: #fff; color: #000; 
      font-family: Arial; font-size: 10px;
    }
    .first {
      font-size: 1.5em;
    }
    .second {
      font-size: 1.1em;
    }
    `;
    const canvas = new Canvas(150, 150);
    const renderer = new Html2Canvas({
      stylesheet: style,
      createCanvas({height, width}) {
        return new Canvas(height, width);
      },
      createImage() {
        return new Canvas.Image();
      },
      fetch: fetch,
    });
    const dom = await renderer.process(html, canvas);
    const line = dom.children[0].children[0].children[0].children[0].children[0];
    expect(line.bounding.height.valueOf()).toEqual(16.5);
    await renderer.render();
    canvas.createJPEGStream().pipe(fs.createWriteStream(path.join(process.cwd(), "output/font.jpg")));
  });

  it("example test", async() => {
    try {
      const style = `
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
        stylesheet: style,
        createCanvas({height, width}) {
          return new Canvas(height, width);
        },
        createImage() {
          return new Canvas.Image();
        },
        fetch: fetch,
      });
      await renderer.process(html, canvas);
      await renderer.render();
      canvas.createJPEGStream().pipe(fs.createWriteStream(path.join(process.cwd(), "output/example.jpg")));
    } catch (err) {
      console.log("err", err);
      expect(err).toNotExist();
    }
  });
});
