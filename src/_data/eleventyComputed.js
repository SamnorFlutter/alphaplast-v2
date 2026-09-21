// Global computed data: every page gets T (UI strings for its language), altLang and L (language URL prefix).
module.exports = {
  lang: (data) => data.lang || (data.pp && data.pp.lang) || (data.cp && data.cp.lang) || "ru",
  T: (data) => {
    const lang = data.lang || (data.pp && data.pp.lang) || (data.cp && data.cp.lang) || "ru";
    return (data.t && data.t[lang]) || (data.t && data.t.ru) || {};
  },
  altLang: (data) => ((data.lang || (data.pp && data.pp.lang) || (data.cp && data.cp.lang) || "ru") === "uz" ? "ru" : "uz"),
  L: (data) => "/" + (data.lang || (data.pp && data.pp.lang) || (data.cp && data.cp.lang) || "ru"),
};
