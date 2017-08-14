if (typeof window !== "undefined") {
  if (!window.fetch) {
    require("whatwg-fetch");
  }
  module.exports = window.fetch;
} else {
  const fetch = require("node-fetch");
  module.exports = fetch;
}
module.exports.default = module.exports;
