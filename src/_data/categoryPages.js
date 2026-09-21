// Cross product: every catalog category x every language -> one SEO landing each.
const categories = require("./categories.json");
const langs = require("./langs.json");
module.exports = categories.items.flatMap((c) => langs.map((lang) => ({ ...c, lang })));
