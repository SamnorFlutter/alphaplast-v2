/* Alpha Plast v2 — client logic (vanilla, no deps). */
(function () {
  "use strict";
  var AP = window.AP || {};
  var T = AP.t || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  document.documentElement.classList.add("js");

  /* ---------- analytics events (GTM dataLayer) ---------- */
  function dl(event, params) {
    var p = Object.assign({ event: event, lang: AP.lang, utm_source: utm().last.utm_source || "" }, params || {});
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(p);
    if (AP.demo && window.console) console.debug("[event]", p);
  }
  $$("[data-event]").forEach(function (el) {
    el.addEventListener("click", function () { dl(el.getAttribute("data-event"), { href: el.getAttribute("href") || "", bs: el.getAttribute("data-bs") || "" }); });
  });

  /* ---------- cookies / UTM ---------- */
  function setCookie(k, v, days) { try { document.cookie = k + "=" + encodeURIComponent(v) + ";path=/;max-age=" + days * 86400 + ";SameSite=Lax"; } catch (e) {} }
  function getCookie(k) { var m = document.cookie.match(new RegExp("(?:^|; )" + k + "=([^;]*)")); return m ? decodeURIComponent(m[1]) : ""; }
  function parseUtm() {
    var q = new URLSearchParams(location.search), o = {}, has = false;
    ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"].forEach(function (k) { if (q.get(k)) { o[k] = q.get(k); has = true; } });
    return has ? o : null;
  }
  var utmCache = null;
  function utm() {
    if (utmCache) return utmCache;
    var days = AP.utmDays || 90;
    var cur = parseUtm();
    var first = {}, last = {};
    try { first = JSON.parse(getCookie("ap_utm_first") || "{}"); last = JSON.parse(getCookie("ap_utm_last") || "{}"); } catch (e) {}
    if (cur) {
      if (!first.utm_source) { first = cur; setCookie("ap_utm_first", JSON.stringify(first), days); }
      last = cur; setCookie("ap_utm_last", JSON.stringify(last), days);
    }
    if (!getCookie("ap_landing")) { setCookie("ap_landing", location.pathname + location.search, days); setCookie("ap_ref", document.referrer || "", days); }
    utmCache = { first: first, last: last, landing: getCookie("ap_landing"), ref: getCookie("ap_ref") };
    return utmCache;
  }
  utm();

  /* ---------- theme / lang / demo bar / menu ---------- */
  $$("[data-theme-toggle]").forEach(function (b) {
    b.addEventListener("click", function () {
      var cur = document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
      var next = cur === "light" ? "dark" : "light";
      document.documentElement.setAttribute("data-theme", next);
      try { localStorage.setItem("ap-theme", next); } catch (e) {}
    });
  });
  $$("[data-lang-switch]").forEach(function (a) { a.addEventListener("click", function () { try { localStorage.setItem("ap-lang", a.getAttribute("data-lang-switch")); } catch (e) {} }); });
  try { localStorage.setItem("ap-lang", AP.lang); } catch (e) {}
  var demoBar = $("#demoBar");
  if (demoBar) {
    try { if (sessionStorage.getItem("ap-demo-hide")) demoBar.hidden = true; } catch (e) {}
    var dc = $("[data-demo-close]", demoBar);
    if (dc) dc.addEventListener("click", function () { demoBar.hidden = true; try { sessionStorage.setItem("ap-demo-hide", "1"); } catch (e) {} });
  }
  var drawer = $("#drawer");
  function openMenu() { if (!drawer) return; drawer.hidden = false; document.body.style.overflow = "hidden"; }
  function closeMenu() { if (!drawer) return; drawer.hidden = true; document.body.style.overflow = ""; }
  $$("[data-menu-open]").forEach(function (b) { b.addEventListener("click", openMenu); });
  $$("[data-menu-close]").forEach(function (b) { b.addEventListener("click", closeMenu); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") { closeMenu(); closeFilter(); } });

  /* ---------- reveal on scroll ---------- */
  var reveals = $$(".reveal");
  if ("IntersectionObserver" in window && reveals.length) {
    var io = new IntersectionObserver(function (entries) { entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } }); }, { rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else { reveals.forEach(function (el) { el.classList.add("in"); }); }

  /* ---------- niche selector ---------- */
  var nicheRoot = $("[data-niche]");
  if (nicheRoot) {
    var btns = $$("[data-niche-btn]", nicheRoot), panels = $$("[data-niche-panel]", nicheRoot);
    function showNiche(key, silent) {
      btns.forEach(function (b) { b.classList.toggle("is-active", b.getAttribute("data-niche-btn") === key); });
      panels.forEach(function (p) { p.hidden = p.getAttribute("data-niche-panel") !== key; });
      try { if (key === "none") localStorage.removeItem("ap-niche"); else localStorage.setItem("ap-niche", key); } catch (e) {}
      $$("input[name=niche]").forEach(function (i) { i.value = key === "none" ? "" : key; });
      if (!silent) dl("niche_select", { niche: key });
    }
    btns.forEach(function (b) {
      b.addEventListener("click", function () {
        var key = b.getAttribute("data-niche-btn");
        if (key === "none") { showNiche("none"); var bs = $("#bestsellers"); if (bs) bs.scrollIntoView({ behavior: "smooth", block: "start" }); return; }
        if (b.classList.contains("is-active")) { showNiche("none", true); return; }
        showNiche(key);
      });
    });
    try { var saved = localStorage.getItem("ap-niche"); if (saved && btns.some(function (b) { return b.getAttribute("data-niche-btn") === saved; })) showNiche(saved, true); } catch (e) {}
  } else {
    try { var sn = localStorage.getItem("ap-niche"); if (sn) $$("input[name=niche]").forEach(function (i) { i.value = sn; }); } catch (e) {}
  }

  /* ---------- number formatting ---------- */
  function num(n) { if (n === null || n === undefined || isNaN(n)) return "—"; return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, " "); }

  /* ---------- calculator ---------- */
  var DEFAULTS = {
    maika: { form: "bag", width: 30, height: 55, bottom: 0, thickness: 18, material: "PND", base: "white", colors: 1 },
    pvd: { form: "bag", width: 40, height: 50, bottom: 0, thickness: 60, material: "PVD", base: "white", colors: 2 },
    loop: { form: "bag", width: 40, height: 50, bottom: 0, thickness: 80, material: "PVD", base: "white", colors: 1 },
    courier: { form: "bag", width: 30, height: 40, bottom: 0, thickness: 60, material: "PVD", base: "white", colors: 2 },
    roll: { form: "bag", width: 25, height: 35, bottom: 0, thickness: 10, material: "PND", base: "transparent", colors: 1 },
    fasovka: { form: "bag", width: 25, height: 40, bottom: 0, thickness: 10, material: "PND", base: "transparent", colors: 0 },
    sleeve: { form: "film", width: 50, length: 1, thickness: 60, material: "PVD", base: "transparent", colors: 0 },
    hood: { form: "film", width: 120, length: 1, thickness: 100, material: "PVD", base: "transparent", colors: 0 },
    film: { form: "film", width: 50, length: 1, thickness: 20, material: "PVD", base: "transparent", colors: 0 },
    garbage: { form: "bag", width: 50, height: 60, bottom: 0, thickness: 15, material: "PND", base: "colored", colors: 0 }
  };
  function specLabel(spec) {
    var tc = T.calc || {};
    var typeName = (tc.bag_types && tc.bag_types[spec.type]) || spec.type;
    var dims = spec.form === "film" ? (spec.width + " " + (tc.cm || "cm") + " × " + spec.length + " m") : (spec.width + "×" + spec.height + (spec.bottom ? "+" + spec.bottom : "") + " " + (tc.cm || "cm"));
    var mat = (tc.materials && tc.materials[spec.material]) || spec.material;
    var base = (tc.base_opts && tc.base_opts[spec.base]) || spec.base;
    var print = spec.colors > 0 ? (spec.colors + " " + (tc.colors || "colors").toLowerCase() + (spec.sides === 2 ? " / 2" : "")) : (tc.no_print || "no print");
    return typeName + ", " + dims + ", " + spec.thickness + " " + (tc.um || "µm") + ", " + mat + ", " + base + ", " + print;
  }
  $$("[data-calc]").forEach(function (root) {
    var form = $("[data-calc-form]", root), compact = root.hasAttribute("data-compact");
    if (!form || !window.APCalc) return;
    var f = function (n) { return form.elements[n]; };
    var range = $("[data-c-range]", root);
    var lastQ = null, dlTimer = null;
    function readSpec() {
      var type = f("type").value, d = DEFAULTS[type] || DEFAULTS.pvd;
      return { type: type, form: d.form, width: +f("width").value, height: +f("height").value, bottom: +f("bottom").value, length: +f("length").value, thickness: +f("thickness").value, material: f("material").value, base: f("base").value, colors: +f("colors").value, sides: +f("sides").value, urgent: f("urgent") ? f("urgent").value === "1" : false };
    }
    function applyDefaults(type) {
      var d = DEFAULTS[type] || DEFAULTS.pvd;
      f("width").value = d.width; if (d.height !== undefined) f("height").value = d.height; f("bottom").value = d.bottom || 0; if (d.length) f("length").value = d.length;
      f("thickness").value = d.thickness; f("material").value = d.material; f("base").value = d.base; f("colors").value = d.colors;
      toggleDims(d.form);
    }
    function toggleDims(formKind) {
      $$("[data-dim]", root).forEach(function (el) { el.hidden = el.getAttribute("data-dim") !== formKind; });
    }
    function render() {
      var spec = readSpec(), qty = +f("qty").value || 0, client = f("client") ? f("client").value : "mchj";
      var q = APCalc.quote(spec, qty, AP.pricing, AP.bestsellers, client);
      lastQ = q; lastQ.spec = spec;
      var hint = $("[data-min-hint]", root); if (hint) hint.textContent = (T.calc.min_order || "") + ": " + num(q.minPcs) + " " + T.calc.pcs;
      if (range) { range.min = 0; range.max = Math.max(q.minPcs * 10, 1000); range.step = Math.max(100, Math.round(q.minPcs / 100) * 10); if (+range.value !== qty) range.value = qty; }
      $("[data-r-g]", root).textContent = q.g;
      $("[data-r-kg]", root).textContent = q.kg;
      $("[data-r-min]", root).textContent = num(q.minPcs);
      var label = $("[data-r-label]", root), price = $("[data-r-price]", root), ph = $("[data-r-hint]", root);
      if (q.exact !== undefined) { label.textContent = T.calc.exact; price.innerHTML = num(q.exact) + " <small>" + T.calc.unit + "/" + T.calc.pcs + "</small>"; ph.textContent = T.calc.exact_hint; }
      else { label.textContent = T.calc.range; price.innerHTML = num(q.low) + " – " + num(q.high) + " <small>" + T.calc.unit + "/" + T.calc.pcs + "</small>"; ph.textContent = T.calc.range_hint; }
      var sub = $("[data-r-sub]", root); if (sub) { sub.textContent = q.exact !== undefined ? num(q.subtotal) : (num(q.subtotalLow) + " – " + num(q.subtotalHigh)); $("[data-r-vat]", root).textContent = num(q.vat); $("[data-r-vatrate]", root).textContent = Math.round(q.vatRate * 100) + "%"; $("[data-r-total]", root).textContent = num(q.total); }
      var warn = $("[data-r-warn]", root);
      if (warn) { warn.hidden = !q.belowMin || qty === 0; $("[data-r-warn-text]", root).textContent = (T.calc.below_min || "").replace("{n}", num(q.missing)); }
      var orderLink = $("[data-order-link]", root);
      if (orderLink) {
        var p = new URLSearchParams({ spec: specLabel(spec), qty: qty, price: q.exact !== undefined ? num(q.exact) : (num(q.low) + " – " + num(q.high)), exact: q.exact !== undefined ? "1" : "0", bs: q.bestseller || "" });
        orderLink.href = orderLink.getAttribute("href").split("?")[0] + "?" + p.toString();
        orderLink.textContent = ""; orderLink.appendChild(document.createTextNode(q.exact !== undefined ? T.cta.order + " " : T.cta.exact + " "));
        var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg"); svg.setAttribute("class", "ic"); var use = document.createElementNS("http://www.w3.org/2000/svg", "use"); use.setAttribute("href", "#i-arrow"); svg.appendChild(use); orderLink.appendChild(svg);
        orderLink.classList.toggle("btn-glass", q.belowMin); orderLink.classList.toggle("btn-primary", !q.belowMin);
      }
      var full = $("[data-open-full]", root);
      if (full) { var qs = new URLSearchParams({ type: spec.type, w: spec.width, h: spec.height, b: spec.bottom, t: spec.thickness, m: spec.material, base: spec.base, c: spec.colors, s: spec.sides, q: qty }); if (spec.form === "film") { qs.set("form", "film"); qs.set("len", spec.length); } full.href = full.getAttribute("href").split("?")[0] + "?" + qs.toString(); }
      clearTimeout(dlTimer); dlTimer = setTimeout(function () { dl("calculate", { type: spec.type, qty: qty, exact: q.exact !== undefined ? 1 : 0, kg: q.kg }); }, 900);
    }
    f("type").addEventListener("change", function () { applyDefaults(f("type").value); render(); });
    form.addEventListener("input", function (e) { if (e.target === range) { f("qty").value = range.value; } render(); });
    form.addEventListener("submit", function (e) { e.preventDefault(); });
    var fill = $("[data-fill-min]", root); if (fill) fill.addEventListener("click", function () { if (lastQ) { f("qty").value = lastQ.minPcs; render(); } });
    // prefill from URL (bestseller "want this", product tables, portfolio "want same")
    var qp = new URLSearchParams(location.search);
    if (qp.get("type") && DEFAULTS[qp.get("type")]) { f("type").value = qp.get("type"); applyDefaults(qp.get("type")); }
    else applyDefaults(f("type").value);
    var map = { w: "width", h: "height", b: "bottom", t: "thickness", m: "material", base: "base", c: "colors", s: "sides", q: "qty", len: "length" };
    Object.keys(map).forEach(function (k) { if (qp.get(k) !== null && f(map[k])) f(map[k]).value = qp.get(k); });
    if (qp.get("form") === "film") toggleDims("film");
    if (!qp.get("q")) { var s0 = readSpec(); f("qty").value = APCalc.minPcs(s0, AP.minKg); }
    render();
    if (qp.get("bs")) dl("want_this_open", { bs: qp.get("bs") });
  });

  /* ---------- catalog filter ---------- */
  var catalog = $("[data-catalog]");
  var filterWrap = $("[data-filter-wrap]");
  function closeFilter() { if (filterWrap) { filterWrap.classList.remove("is-open"); document.body.style.overflow = ""; } }
  if (catalog) {
    var ff = $("[data-filter-form]", catalog), cards = $$("[data-product]", catalog), empty = $("[data-empty]", catalog);
    var foundEls = $$("[data-found], [data-found-badge]", catalog);
    var printRank = { "none": 0, "1-2": 2, "3-5": 5, "6-8": 8 };
    function state() {
      var s = { use: [], type: [], load: "", qty: 0, print: "", food: false };
      $$("input[name=use]:checked", ff).forEach(function (i) { s.use.push(i.value); });
      $$("input[name=type]:checked", ff).forEach(function (i) { s.type.push(i.value); });
      var l = $("input[name=load]:checked", ff); s.load = l ? l.value : "";
      var p = $("input[name=print]:checked", ff); s.print = p ? p.value : "";
      s.qty = +($("input[name=qty]", ff).value) || 0;
      s.food = $("input[name=food]", ff).checked;
      return s;
    }
    function score(card, s) {
      var apps = (card.getAttribute("data-apps") || "").split(","), total = 0, ok = 0;
      if (s.use.length) { total++; if (s.use.some(function (u) { return apps.indexOf(u) >= 0; })) ok++; }
      if (s.type.length) { total++; if (s.type.indexOf(card.getAttribute("data-type")) >= 0) ok++; }
      if (s.load) { total++; if (card.getAttribute("data-load") === s.load) ok++; }
      if (s.print) { total++; var pm = +card.getAttribute("data-print-max"); if (s.print === "none" ? true : pm >= printRank[s.print]) ok++; }
      if (s.food) { total++; if (card.getAttribute("data-food") === "1") ok++; }
      return { total: total, ok: ok };
    }
    function apply(push) {
      var s = state(), shown = 0, scored = [];
      cards.forEach(function (c) {
        var sc = score(c, s); c.classList.remove("is-near");
        var match = sc.ok === sc.total; c.classList.toggle("is-hidden", !match); if (match) shown++;
        scored.push({ c: c, sc: sc });
        var min = +c.getAttribute("data-min"), g = +c.getAttribute("data-weight"), note = $("[data-qty-note]", c);
        if (note) {
          if (s.qty > 0) { var kg = Math.round(g * s.qty / 100) / 10; note.hidden = false; note.textContent = T.catalog.weight_at + " " + num(s.qty) + " " + T.calc.pcs + ": " + kg + " " + T.calc.kg + (s.qty < min ? " · " + T.catalog.need_more + " " + num(min - s.qty) : ""); c.classList.toggle("is-dim", s.qty < min); }
          else { note.hidden = true; c.classList.remove("is-dim"); }
        }
      });
      if (shown === 0 && cards.length) {
        empty.hidden = false;
        scored.sort(function (a, b) { return (b.sc.ok / (b.sc.total || 1)) - (a.sc.ok / (a.sc.total || 1)); }).slice(0, 3).forEach(function (x) { x.c.classList.remove("is-hidden"); x.c.classList.add("is-near"); });
      } else empty.hidden = true;
      foundEls.forEach(function (e) { e.textContent = shown; });
      var kgHint = $("[data-qty-kg]", ff); if (kgHint) kgHint.textContent = s.qty ? "" : "";
      var foodHint = $("[data-food-hint]", ff); if (foodHint) foodHint.hidden = !s.food;
      if (push !== false) {
        var q = new URLSearchParams();
        if (s.use.length) q.set("use", s.use.join(","));
        if (s.type.length) q.set("type", s.type.join(","));
        if (s.load) q.set("load", s.load); if (s.print) q.set("print", s.print); if (s.qty) q.set("qty", s.qty); if (s.food) q.set("food", "1");
        var url = location.pathname + (q.toString() ? "?" + q.toString() : "");
        history.replaceState(null, "", url);
      }
    }
    // init from URL or remembered niche
    var qp = new URLSearchParams(location.search);
    var hadParams = false;
    ["use", "type"].forEach(function (k) { if (qp.get(k)) { hadParams = true; qp.get(k).split(",").forEach(function (v) { var i = $("input[name=" + k + "][value='" + v + "']", ff); if (i) i.checked = true; }); } });
    if (qp.get("load")) { hadParams = true; var li = $("input[name=load][value='" + qp.get("load") + "']", ff); if (li) li.checked = true; }
    if (qp.get("print")) { hadParams = true; var pi = $("input[name=print][value='" + qp.get("print") + "']", ff); if (pi) pi.checked = true; }
    if (qp.get("qty")) { hadParams = true; $("input[name=qty]", ff).value = qp.get("qty"); $("input[name=qtyRange]", ff).value = qp.get("qty"); }
    if (qp.get("food")) { hadParams = true; $("input[name=food]", ff).checked = true; }
    if (!hadParams) { try { var nk = localStorage.getItem("ap-niche"); var nb = nk ? document.querySelector("[data-niche-btn='" + nk + "']") : null; var NICHE_APP = { grocery: "food", pharmacy: "pharmacy", horeca: "food", clothing: "clothing", electronics: "delivery", delivery: "delivery", manufacturing: "construction" }; if (nk && NICHE_APP[nk]) { var ni = $("input[name=use][value='" + NICHE_APP[nk] + "']", ff); if (ni) ni.checked = true; } } catch (e) {} }
    var useFood = $("input[name=use][value='food']", ff);
    ff.addEventListener("change", function (e) {
      if (e.target === useFood && useFood.checked) { $("input[name=food]", ff).checked = true; }
      if (e.target.name === "qtyRange") $("input[name=qty]", ff).value = e.target.value;
      if (e.target.name === "qty") $("input[name=qtyRange]", ff).value = e.target.value;
      apply();
    });
    ff.addEventListener("input", function (e) { if (e.target.name === "qtyRange") { $("input[name=qty]", ff).value = e.target.value; apply(); } if (e.target.name === "qty") { $("input[name=qtyRange]", ff).value = e.target.value; apply(); } });
    ff.addEventListener("submit", function (e) { e.preventDefault(); });
    var reset = $("[data-filter-reset]", catalog); if (reset) reset.addEventListener("click", function () { ff.reset(); $("input[name=qtyRange]", ff).value = 0; apply(); });
    $$("[data-filter-open]", catalog).forEach(function (b) { b.addEventListener("click", function () { filterWrap.classList.add("is-open"); document.body.style.overflow = "hidden"; }); });
    $$("[data-filter-close]", catalog).forEach(function (b) { b.addEventListener("click", closeFilter); });
    if (useFood && useFood.checked) $("input[name=food]", ff).checked = true;
    apply(false);
  }

  /* ---------- product gallery / video / map ---------- */
  $$("[data-gallery]").forEach(function (g) {
    var main = $("[data-gallery-main]", g);
    $$("[data-thumb]", g).forEach(function (t) { t.addEventListener("click", function () { if (!main) return; main.src = t.getAttribute("data-thumb"); main.alt = t.getAttribute("data-alt"); $$("[data-thumb]", g).forEach(function (x) { x.classList.toggle("is-active", x === t); }); }); });
  });
  $$("[data-video]").forEach(function (v) {
    var btn = $("[data-video-play]", v);
    if (btn) btn.addEventListener("click", function () { var id = v.getAttribute("data-video"); var ifr = document.createElement("iframe"); ifr.src = "https://www.youtube-nocookie.com/embed/" + id + "?autoplay=1&rel=0"; ifr.allow = "autoplay; encrypted-media; picture-in-picture"; ifr.allowFullscreen = true; ifr.title = "YouTube"; v.innerHTML = ""; v.appendChild(ifr); dl("video_play", { id: id }); });
  });
  $$("[data-map]").forEach(function (m) {
    var b = $("[data-map-load]", m);
    function load() { var ifr = document.createElement("iframe"); ifr.src = m.getAttribute("data-map"); ifr.loading = "lazy"; ifr.title = "Map"; m.innerHTML = ""; m.appendChild(ifr); }
    if (b) b.addEventListener("click", load);
    if ("IntersectionObserver" in window) { var mo = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { load(); mo.disconnect(); } }, { rootMargin: "200px" }); mo.observe(m); }
  });

  /* ---------- order page summary ---------- */
  var os = $("[data-order-summary]");
  if (os) {
    var oq = new URLSearchParams(location.search);
    if (oq.get("spec")) {
      os.hidden = false; $("[data-order-spec]", os).textContent = oq.get("spec");
      $("[data-order-price]", os).textContent = (oq.get("qty") ? num(+oq.get("qty")) + " " + T.calc.pcs + " · " : "") + (oq.get("price") ? oq.get("price") + " " + T.calc.unit + "/" + T.calc.pcs + (oq.get("exact") === "1" ? " (" + T.calc.exact + ")" : " (" + T.calc.range + ")") : "");
      $$("[data-spec-field]").forEach(function (i) { i.value = oq.get("spec"); });
      $$("[data-qty-field]").forEach(function (i) { if (oq.get("qty")) i.value = oq.get("qty"); });
      dl("checkout_start", { qty: oq.get("qty") || "", bs: oq.get("bs") || "" });
    }
  }

  /* ---------- lead forms ---------- */
  function tgMessage(data) {
    var lines = ["📦 Alpha Plast — " + (AP.lang === "uz" ? "yangi so'rov" : "новая заявка"), "", "👤 " + data.name, "📞 " + data.phone];
    if (data.company) lines.push("🏢 " + data.company);
    if (data.spec) lines.push("📋 " + data.spec);
    if (data.qty) lines.push("🔢 " + data.qty);
    if (data.comment) lines.push("💬 " + data.comment);
    if (data.niche) lines.push("🏷 " + data.niche);
    lines.push("", "🌐 " + location.href, "utm: " + (data.utm_last || "-") + " | first: " + (data.utm_first || "-"), "ref: " + (data.referrer || "-"));
    return lines.join("\n");
  }
  $$("[data-lead-form]").forEach(function (form) {
    var msg = $("[data-form-msg]", form), btn = $("[data-submit]", form);
    var u = utm();
    form.elements.utm_first.value = JSON.stringify(u.first); form.elements.utm_last.value = JSON.stringify(u.last); form.elements.referrer.value = u.ref; form.elements.landing.value = u.landing;
    function show(kind, text) { msg.hidden = false; msg.className = "form-msg " + kind; msg.textContent = text; }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (form.elements.botcheck.value) return;
      var data = {}; Array.prototype.forEach.call(form.elements, function (el) { if (el.name && el.type !== "file") data[el.name] = el.value.trim(); });
      if (!data.name || !data.phone) { show("err", T.form.required); return; }
      if (data.phone.replace(/\D/g, "").length < 9) { show("err", T.form.phone_invalid); return; }
      btn.disabled = true; var old = btn.textContent; btn.textContent = T.form.sending;
      var tasks = [];
      if (AP.web3forms) {
        var fd = new FormData(form); fd.set("access_key", AP.web3forms); fd.set("subject", "Alpha Plast: " + (data.spec || "lead") + " — " + data.name); fd.set("from_name", "alphaplast-v2");
        tasks.push(fetch("https://api.web3forms.com/submit", { method: "POST", body: fd, headers: { Accept: "application/json" } }).then(function (r) { return r.json(); }).then(function (j) { if (!j.success) throw new Error("web3forms"); }));
      }
      if (AP.tg && AP.tg.token && AP.tg.chat) {
        var body = new URLSearchParams({ chat_id: AP.tg.chat, text: tgMessage(data), disable_web_page_preview: "true" });
        tasks.push(fetch("https://api.telegram.org/bot" + AP.tg.token + "/sendMessage", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: body.toString() }).then(function (r) { return r.json(); }).then(function (j) { if (!j.ok) throw new Error("tg"); }));
      }
      var done = function () { dl("lead_submit", { spec: data.spec || "", qty: data.qty || "", product: data.product || "" }); show("ok", T.form.success_title + ". " + T.form.success_text + (tasks.length ? "" : " (demo: endpoint not configured)")); form.reset(); btn.disabled = false; btn.textContent = old; };
      var fail = function () { show("err", T.form.error); btn.disabled = false; btn.textContent = old; };
      if (!tasks.length) { if (window.console) console.info("[lead demo]", data); done(); return; }
      Promise.allSettled(tasks).then(function (rs) { if (rs.some(function (r) { return r.status === "fulfilled"; })) done(); else fail(); });
    });
  });
})();
