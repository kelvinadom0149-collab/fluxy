# Tests

The storefront ships as a single self-contained file, `fluxy_ecommerce_site.html`,
with all of its JavaScript inline. To unit test that code without changing what
ships, the suite mirrors the inline `<script>` into an ES module
(`tests/.generated/site-script.js`, git-ignored, regenerated on every run) and
loads it against the page markup in jsdom. The HTML file stays the source of
truth: edit it, and the tests pick the change up automatically.

```bash
npm install
npm test           # run once
npm run test:watch # watch mode
npm run coverage   # text + html report in coverage/
```

Coverage is reported for the mirrored module, i.e. the inline script's real
statements, branches and functions.

| File | Covers |
| --- | --- |
| `products.test.js` | catalogue data, `renderProducts`, `selectSize`, add-button feedback |
| `cart.test.js` | `addToCart`, `updateCart`, `changeQty`, `removeItem`, totals |
| `ui.test.js` | `toggleCart`, `showPage`, `showToast` |
