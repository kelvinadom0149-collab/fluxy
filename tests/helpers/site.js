import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));

export const ROOT = path.resolve(here, '..', '..');
export const HTML_PATH = path.join(ROOT, 'fluxy_ecommerce_site.html');
export const GENERATED_DIR = path.join(ROOT, 'tests', '.generated');
export const GENERATED_SCRIPT = path.join(GENERATED_DIR, 'site-script.js');

/**
 * Names the inline storefront script defines at top level. They are re-exported
 * from the generated module so tests can call them directly.
 */
export const EXPORTS = [
  'products',
  'sizes',
  'renderProducts',
  'selectSize',
  'addToCart',
  'updateCart',
  'changeQty',
  'removeItem',
  'toggleCart',
  'showPage',
  'showToast',
];

const SCRIPT_RE = /<script>([\s\S]*?)<\/script>/;
const BODY_RE = /<body>([\s\S]*)<\/body>/;

export function readHtml() {
  return fs.readFileSync(HTML_PATH, 'utf8');
}

export function extractInlineScript(html = readHtml()) {
  const match = html.match(SCRIPT_RE);
  if (!match) throw new Error(`No inline <script> found in ${HTML_PATH}`);
  return match[1];
}

/** Markup of the storefront with the inline script removed. */
export function extractMarkup(html = readHtml()) {
  const match = html.match(BODY_RE);
  if (!match) throw new Error(`No <body> found in ${HTML_PATH}`);
  return match[1].replace(SCRIPT_RE, '');
}

/**
 * Mirrors the inline script into an ES module so it can be imported (and
 * instrumented for coverage) without editing the shipped HTML file.
 */
export function generateScriptModule() {
  const source = `${extractInlineScript()}\nexport { ${EXPORTS.join(', ')} };\n`;
  fs.mkdirSync(GENERATED_DIR, { recursive: true });
  const current = fs.existsSync(GENERATED_SCRIPT)
    ? fs.readFileSync(GENERATED_SCRIPT, 'utf8')
    : null;
  if (current !== source) fs.writeFileSync(GENERATED_SCRIPT, source);
  return GENERATED_SCRIPT;
}
