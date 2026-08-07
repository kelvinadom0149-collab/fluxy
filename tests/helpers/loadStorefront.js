import { vi } from 'vitest';
import { extractMarkup, generateScriptModule } from './site.js';

/**
 * Renders the storefront markup into the jsdom document and evaluates the
 * inline script against it, returning the script's top-level API.
 *
 * Module state (`cart`, `selectedSizes`) is reset on every call.
 */
export async function loadStorefront() {
  generateScriptModule();
  document.body.innerHTML = extractMarkup();
  window.scrollTo = vi.fn();
  vi.resetModules();
  return import('../.generated/site-script.js');
}

/** Every `.product-card` rendered in the grid, in DOM order. */
export function productCards() {
  return [...document.querySelectorAll('#product-grid .product-card')];
}

/** Size buttons rendered for a product id. */
export function sizeButtons(pid) {
  return [...document.querySelectorAll(`#sizes-${pid} .size-btn`)];
}

export function sizeButton(pid, size) {
  const btn = sizeButtons(pid).find((b) => b.textContent === size);
  if (!btn) throw new Error(`No size button "${size}" for product "${pid}"`);
  return btn;
}

/** Cart rows currently rendered in the sidebar. */
export function cartRows() {
  return [...document.querySelectorAll('#cart-items .cart-item')].map((row) => ({
    name: row.querySelector('h4').textContent,
    meta: row.querySelector('.cart-item-meta').textContent,
    price: row.querySelector('.cart-item-price').textContent,
    qty: row.querySelector('.qty-num').textContent,
    background: row.querySelector('.cart-item-img').style.background,
  }));
}

export function cartCount() {
  return document.getElementById('cart-count').textContent;
}

export function cartFooter() {
  return document.getElementById('cart-footer');
}

export function subtotals() {
  return {
    subtotal: document.getElementById('cart-subtotal').textContent,
    total: document.getElementById('cart-total-val').textContent,
  };
}

export function toast() {
  return document.getElementById('toast');
}

export function activePageIds() {
  return [...document.querySelectorAll('.page.active')].map((p) => p.id);
}
