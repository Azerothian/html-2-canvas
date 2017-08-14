
export default function parsePx(px) {
  if (!Number.isInteger(px)) {
    if ((px.indexOf("px") > -1 && px.indexOf(" ") === -1)) {
      return Number(px.replace(/px$/, ""));
    }
  }
  return px;
}
