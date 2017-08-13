import html2canvas from "../index";
import Canvas from "canvas";

const stylesheet = `body {
  font-family: Arial;
  font-size: 12px;
  padding: 20px;
}
div > a:first-child {
  margin-top: 5px;
}
div.row > p {
  padding-top: 5px;
}
div.row > p:first-child {
  padding-top: 10px;
}`;


describe("base tests", () => {
  it("initial test", () => {
    const html = `<html>
<body>
  <div class="row">
    <p>Howdy</p>
    <p class="test" style="padding-top: 20px">2nd</p>
  </div
</body>
</html>`;
    const canvas = new Canvas(200, 200);
    html2canvas(html, canvas, {
      stylesheet,
    });
  });
});
