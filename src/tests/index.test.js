import html2canvas from "../index";
import Canvas from "canvas";

const stylesheet = `body {
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
    const canvas = new Canvas(200, 200);
    html2canvas("<html><body><div class=\"row\"><p>Howdy</p><p class=\"test\" style=\"padding-top: 20px\">2nd</p></div</body></html>", canvas, {
      stylesheet,
    });
  });
});
