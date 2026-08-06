import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  loadStorefront,
  productCards,
  sizeButton,
  sizeButtons,
} from './helpers/loadStorefront.js';

let site;

beforeEach(async () => {
  site = await loadStorefront();
});

describe('product catalogue', () => {
  it('exposes three same-priced colorways', () => {
    expect(site.products.map((p) => p.id)).toEqual(['black', 'white', 'navy']);
    expect(site.products.map((p) => p.price)).toEqual([34, 34, 34]);
    expect(site.sizes).toEqual(['XS', 'S', 'M', 'L', 'XL', '2XL']);
  });
});

describe('renderProducts', () => {
  it('renders a card per product on load', () => {
    expect(productCards()).toHaveLength(site.products.length);
  });

  it('renders name, color, price and swatch for each product', () => {
    productCards().forEach((card, i) => {
      const product = site.products[i];
      expect(card.querySelector('h3').textContent).toBe(product.name);
      expect(card.querySelector('.product-color').textContent).toBe(product.color);
      expect(card.querySelector('.product-price').textContent).toBe(`$${product.price}.00`);
      expect(card.querySelector('.product-img').style.background).toBeTruthy();
    });
  });

  it('renders every size and an add button per product', () => {
    site.products.forEach((product) => {
      expect(sizeButtons(product.id).map((b) => b.textContent)).toEqual(site.sizes);
      expect(document.getElementById(`add-${product.id}`).textContent).toBe('Add to cart');
    });
  });

  it('replaces existing markup when called again', () => {
    site.renderProducts();
    expect(productCards()).toHaveLength(site.products.length);
  });
});

describe('selectSize', () => {
  it('marks the clicked size as selected', () => {
    const btn = sizeButton('black', 'M');
    site.selectSize('black', 'M', btn);
    expect(btn.classList.contains('sel')).toBe(true);
  });

  it('keeps only one size selected per product', () => {
    const medium = sizeButton('black', 'M');
    const large = sizeButton('black', 'L');
    site.selectSize('black', 'M', medium);
    site.selectSize('black', 'L', large);
    expect(medium.classList.contains('sel')).toBe(false);
    expect(large.classList.contains('sel')).toBe(true);
  });

  it('tracks selections per product independently', () => {
    const blackM = sizeButton('black', 'M');
    const navyXL = sizeButton('navy', 'XL');
    site.selectSize('black', 'M', blackM);
    site.selectSize('navy', 'XL', navyXL);
    expect(blackM.classList.contains('sel')).toBe(true);
    expect(navyXL.classList.contains('sel')).toBe(true);
  });
});

describe('add button feedback', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('flashes "Added" and reverts after the timeout', () => {
    site.selectSize('black', 'M', sizeButton('black', 'M'));
    site.addToCart('black');

    const btn = document.getElementById('add-black');
    expect(btn.textContent).toBe('Added ✓');
    expect(btn.classList.contains('added-flash')).toBe(true);

    vi.advanceTimersByTime(1200);
    expect(btn.textContent).toBe('Add to cart');
    expect(btn.classList.contains('added-flash')).toBe(false);
  });
});
