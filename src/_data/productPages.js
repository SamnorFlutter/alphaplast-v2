// Cross product: every product x every language -> one page each.
const products = require("./products.json");
const langs = require("./langs.json");
module.exports = products.items.flatMap((p) => langs.map((lang) => ({ ...p, lang })));
