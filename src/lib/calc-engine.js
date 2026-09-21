/* Alpha Plast — calculation engine.
 * The same file runs in Node (build / reference for the PHP port) and in the browser (demo).
 * PRODUCTION NOTE (TZ §Калькулятор): on ahost the price part must run on the server;
 * only weight / min-order physics may stay client-side. Coefficients live in pricing.json.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.APCalc = factory();
})(typeof self !== "undefined" ? self : this, function () {
  var DENSITY = { PND: 0.95, PVD: 0.92, OPP: 0.91, SPP: 0.91 }; // g/cm3, generic polymer densities

  function n(v, d) { v = parseFloat(v); return isNaN(v) ? (d || 0) : v; }

  // Weight of one item in grams. Bag = 2 film layers of W x (H + bottom). Film/roll = 1 layer W x L(m).
  function bagWeightG(spec) {
    var w = n(spec.width), t = n(spec.thickness);
    var rho = DENSITY[spec.material] || 0.93;
    var area;
    if (spec.form === "film") {
      area = w * n(spec.length) * 100; // cm x m -> cm2
    } else {
      area = 2 * w * (n(spec.height) + n(spec.bottom));
    }
    var g = area * t * rho / 10000;
    return Math.round(g * 100) / 100;
  }

  function minPcs(spec, minKg) {
    var g = bagWeightG(spec);
    if (!g) return 0;
    return Math.ceil((minKg || 200) * 1000 / g);
  }

  function totalKg(spec, qty) { return Math.round(bagWeightG(spec) * n(qty) / 10) / 100; }

  function round10(x) { return Math.round(x / 10) * 10; }

  var MATCH_KEYS = ["type", "width", "height", "bottom", "thickness", "material", "base", "colors", "sides"];
  function matchBestseller(spec, qty, bestsellers) {
    if (!bestsellers) return null;
    for (var i = 0; i < bestsellers.length; i++) {
      var b = bestsellers[i], ok = true;
      for (var k = 0; k < MATCH_KEYS.length; k++) {
        var key = MATCH_KEYS[k];
        var a = spec[key], c = b.spec[key];
        if (typeof c === "number" || typeof a === "number") { if (n(a) !== n(c)) { ok = false; break; } }
        else if (String(a || "") !== String(c || "")) { ok = false; break; }
      }
      if (!ok) continue;
      var tiers = b.tiers || [];
      var tier = null;
      for (var j = 0; j < tiers.length; j++) if (n(qty) >= tiers[j].from) tier = tiers[j];
      if (tier) return { bestseller: b, tier: tier };
    }
    return null;
  }

  // Full quote. All money in UZS.
  function quote(spec, qty, pricing, bestsellers, clientType) {
    qty = Math.max(0, Math.round(n(qty)));
    var g = bagWeightG(spec);
    var kg = g * qty / 1000;
    var min = minPcs(spec, pricing.min_order_kg);
    var res = { g: g, kg: Math.round(kg * 10) / 10, minPcs: min, qty: qty, belowMin: qty < min, missing: Math.max(0, min - qty) };
    var matKg = pricing.material_per_kg[spec.material] || pricing.material_per_kg.PVD;
    var base = g / 1000 * matKg;
    if (spec.base === "white") base *= 1 + pricing.white_base_pct;
    if (spec.base === "colored") base *= 1 + pricing.colored_base_pct;
    var colors = Math.min(8, Math.max(0, Math.round(n(spec.colors))));
    var sides = n(spec.sides, 1) === 2 ? 2 : 1;
    var print = colors * pricing.print_per_color_per_pc * (sides === 2 ? pricing.two_sides_mult : 1);
    var setup = colors * sides * pricing.setup_per_color;
    var perPc = (base + print) * (1 + pricing.margin_pct) + (qty > 0 ? setup / qty : 0);
    if (spec.urgent) perPc *= pricing.urgent_mult;
    var m = matchBestseller(spec, qty, bestsellers);
    if (m) { res.exact = m.tier.price; res.bestseller = m.bestseller.slug; }
    else { res.low = round10(perPc * pricing.range_low_mult); res.high = round10(perPc * pricing.range_high_mult); }
    var unit = res.exact !== undefined ? res.exact : (res.low + res.high) / 2;
    var rate = (pricing.vat_rate && pricing.vat_rate[clientType] !== undefined) ? pricing.vat_rate[clientType] : pricing.vat_default;
    res.vatRate = rate;
    res.subtotal = round10(unit * qty);
    res.vat = round10(res.subtotal * rate);
    res.total = res.subtotal + res.vat;
    if (res.low !== undefined) { res.subtotalLow = round10(res.low * qty); res.subtotalHigh = round10(res.high * qty); }
    return res;
  }

  // "from" price for catalog cards: cheapest bestseller tier of this product, else low bound at min order.
  function priceFrom(product, pricing, bestsellers) {
    var spec = product.defaultSpec;
    var qty = minPcs(spec, pricing.min_order_kg);
    var own = (bestsellers || []).filter(function (b) { return b.product === product.slug; });
    if (own.length) {
      var best = null;
      own.forEach(function (b) { (b.tiers || []).forEach(function (t) { if (best === null || t.price < best) best = t.price; }); });
      if (best !== null) return { price: best, exact: true };
    }
    var q = quote(spec, qty, pricing, [], "mchj");
    return { price: q.low, exact: false };
  }

  return { DENSITY: DENSITY, bagWeightG: bagWeightG, minPcs: minPcs, totalKg: totalKg, quote: quote, matchBestseller: matchBestseller, priceFrom: priceFrom, round10: round10 };
});
