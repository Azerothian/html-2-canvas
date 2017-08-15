import fetch from "node-fetch";

import sourceMapSupport from "source-map-support";
sourceMapSupport.install();
import path from "path";
import fs from "fs";

import Html2Canvas from "../index";
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


describe("base tests", () => {
  it("initial test", async() => {
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
  });
});
