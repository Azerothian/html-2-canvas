import fetch from "node-fetch";

import sourceMapSupport from "source-map-support";
sourceMapSupport.install();
import path from "path";
import fs from "fs";

import Html2Canvas from "../index";
import Canvas from "canvas";

const stylesheet = `body {
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
}`;


describe("base tests", () => {
  it("initial test", async() => {
    try {
      const html = `<html>
  <body>
    <div class="row">
      <p><span>asdd<span style="font-size:36px; font-style: italic;">HELLO</span></span></p>
      <p>Howdy<br />Stranger<br/><br/><br/>ASL?</p>
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
      <!-- p style="background-color: rgba(255,255,255,0.1); text-align: center;">
        <img src="https://lh3.googleusercontent.com/6bYd0ESbr0b8MLVMv_CAT74WpyHOQSuE6NzDwey4Cw8DHkChPyZi263mIfJdJtwjSBs=w170" style="width: 100px; height: 100px;" />
      </p>
      <img src="https://cdn.keycdn.com/img/cdn-secure.svg" style="width: 50px; height: 50px;" / -->
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
