const calc = require("./src/lib/calc-engine.js");

module.exports = function (eleventyConfig) {
  const pathPrefix = process.env.PATH_PREFIX || "/";

  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "src/lib/calc-engine.js": "assets/calc-engine.js" });
  eleventyConfig.addGlobalData("buildTime", () => new Date().toISOString());

  // i18n helper: {ru:..., uz:...} -> string for lang
  eleventyConfig.addFilter("tr", (v, lang) => {
    if (v && typeof v === "object" && !Array.isArray(v)) return v[lang] !== undefined ? v[lang] : (v.ru || "");
    return v === undefined || v === null ? "" : v;
  });
  eleventyConfig.addFilter("num", (n) => {
    if (n === null || n === undefined || isNaN(n)) return "";
    return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  });
  eleventyConfig.addFilter("json", (v) => JSON.stringify(v));
  eleventyConfig.addFilter("where", (arr, key, val) => (arr || []).filter((x) => x[key] === val));
  eleventyConfig.addFilter("whereIn", (arr, key, val) => (arr || []).filter((x) => Array.isArray(x[key]) && x[key].includes(val)));
  eleventyConfig.addFilter("find", (arr, key, val) => (arr || []).find((x) => x[key] === val));
  eleventyConfig.addFilter("bylang", (arr, lang) => (arr || []).filter((x) => x.data.lang === lang));
  eleventyConfig.addFilter("limit", (arr, n) => (arr || []).slice(0, n));
  eleventyConfig.addFilter("altUrl", (url, lang, alt) => url.replace("/" + lang + "/", "/" + alt + "/"));
  eleventyConfig.addFilter("dateHuman", (d, lang) => {
    const dt = new Date(d);
    const ru = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];
    const uz = ["yanvar", "fevral", "mart", "aprel", "may", "iyun", "iyul", "avgust", "sentyabr", "oktyabr", "noyabr", "dekabr"];
    const m = (lang === "uz" ? uz : ru)[dt.getUTCMonth()];
    return lang === "uz" ? `${dt.getUTCFullYear()}-yil ${dt.getUTCDate()}-${m}` : `${dt.getUTCDate()} ${m} ${dt.getUTCFullYear()}`;
  });
  eleventyConfig.addFilter("dateIso", (d) => new Date(d).toISOString().slice(0, 10));
  eleventyConfig.addFilter("bagWeight", (spec) => calc.bagWeightG(spec));
  eleventyConfig.addFilter("minPcs", (spec, minKg) => calc.minPcs(spec, minKg));
  eleventyConfig.addFilter("priceFrom", (product, pricing, bestsellers) => calc.priceFrom(product, pricing, bestsellers));
  eleventyConfig.addFilter("quote", (spec, qty, pricing, bestsellers) => calc.quote(spec, qty, pricing, bestsellers || [], "mchj"));
  eleventyConfig.addFilter("sortBy", (arr, key) => (arr || []).slice().sort((a, b) => (a[key] > b[key] ? 1 : a[key] < b[key] ? -1 : 0)));
  eleventyConfig.addFilter("specQuery", (spec, qty, bs) => {
    const q = new URLSearchParams({ type: spec.type, w: spec.width || 0, h: spec.height || 0, b: spec.bottom || 0, t: spec.thickness, m: spec.material, base: spec.base || "white", c: spec.colors || 0, s: spec.sides || 1 });
    if (spec.form === "film") { q.set("form", "film"); q.set("len", spec.length || 1); }
    if (qty) q.set("q", qty);
    if (bs) q.set("bs", bs);
    return q.toString();
  });
  eleventyConfig.addFilter("words", (s) => String(s || "").replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length);

  eleventyConfig.addCollection("posts", (api) =>
    api.getFilteredByGlob("src/posts/*.md").sort((a, b) => b.date - a.date)
  );

  eleventyConfig.setServerOptions({ showAllHosts: false, port: 8087 });

  return {
    dir: { input: "src", includes: "_includes", data: "_data", output: "_site" },
    pathPrefix,
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    templateFormats: ["njk", "md", "html"],
  };
};
