import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  cartCount,
  cartFooter,
  cartRows,
  loadStorefront,
  sizeButton,
  subtotals,
  toast,
} from './helpers/loadStorefront.js';

let site;

function add(pid, size) {
  site.selectSize(pid, size, sizeButton(pid, size));
  site.addToCart(pid);
}

beforeEach(async () => {
  vi.useFakeTimers();
  site = await loadStorefront();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('empty cart', () => {
  it('shows the empty state and hides the footer on load', () => {
    expect(cartCount()).toBe('0');
    expect(cartRows()).toHaveLength(0);
    expect(document.querySelector('.cart-empty').textContent).toContain('Your cart is empty');
    expect(cartFooter().style.display).toBe('none');
  });
});

describe('addToCart', () => {
  it('refuses to add without a size and warns the shopper', () => {
    site.addToCart('black');
    expect(cartRows()).toHaveLength(0);
    expect(cartCount()).toBe('0');
    expect(toast().textContent).toBe('Please select a size first');
  });

  it('adds the selected variant and reveals the footer', () => {
    add('black', 'M');

    expect(cartRows()).toEqual([
      {
        name: 'Essential T-Shirt',
        meta: 'Black · Size M',
        price: '$34.00',
        qty: '1',
        background: 'rgb(26, 26, 26)',
      },
    ]);
    expect(cartCount()).toBe('1');
    expect(cartFooter().style.display).toBe('block');
    expect(toast().textContent).toBe('Black Essential T-Shirt (M) added');
  });

  it('increments quantity instead of duplicating the same variant', () => {
    add('black', 'M');
    add('black', 'M');

    expect(cartRows()).toHaveLength(1);
    expect(cartRows()[0].qty).toBe('2');
    expect(cartCount()).toBe('2');
    expect(subtotals()).toEqual({ subtotal: '$68.00', total: '$68.00' });
  });

  it('treats different sizes of one product as separate lines', () => {
    add('black', 'M');
    add('black', 'L');

    expect(cartRows().map((r) => r.meta)).toEqual(['Black · Size M', 'Black · Size L']);
    expect(cartCount()).toBe('2');
  });

  it('keeps the previously selected size when re-adding a product', () => {
    add('navy', 'XL');
    site.addToCart('navy');

    expect(cartRows()).toHaveLength(1);
    expect(cartRows()[0].qty).toBe('2');
  });
});

describe('updateCart totals', () => {
  it('sums price times quantity across lines', () => {
    add('black', 'M');
    add('white', 'S');
    add('white', 'S');

    expect(cartCount()).toBe('3');
    expect(subtotals()).toEqual({ subtotal: '$102.00', total: '$102.00' });
  });
});

describe('updateCart swatch fallback', () => {
  it('falls back to a neutral swatch when the product is gone from the catalogue', () => {
    add('black', 'M');
    site.products.splice(0, site.products.length);
    site.updateCart();

    expect(cartRows()[0].background).toBe('rgb(238, 238, 238)');
  });
});

describe('changeQty', () => {
  it('increases quantity and totals', () => {
    add('black', 'M');
    site.changeQty('black-M', 1);

    expect(cartRows()[0].qty).toBe('2');
    expect(subtotals().total).toBe('$68.00');
  });

  it('decreases quantity without removing the line', () => {
    add('black', 'M');
    add('black', 'M');
    site.changeQty('black-M', -1);

    expect(cartRows()[0].qty).toBe('1');
    expect(cartCount()).toBe('1');
  });

  it('drops the line and restores the empty state at zero', () => {
    add('black', 'M');
    site.changeQty('black-M', -1);

    expect(cartRows()).toHaveLength(0);
    expect(cartCount()).toBe('0');
    expect(cartFooter().style.display).toBe('none');
  });

  it('ignores unknown keys', () => {
    add('black', 'M');
    site.changeQty('nope-M', 1);

    expect(cartRows()[0].qty).toBe('1');
    expect(cartCount()).toBe('1');
  });
});

describe('removeItem', () => {
  it('removes a line regardless of its quantity', () => {
    add('black', 'M');
    add('black', 'M');
    site.removeItem('black-M');

    expect(cartRows()).toHaveLength(0);
    expect(cartCount()).toBe('0');
    expect(cartFooter().style.display).toBe('none');
  });

  it('leaves other lines untouched', () => {
    add('black', 'M');
    add('navy', 'L');
    site.removeItem('black-M');

    expect(cartRows().map((r) => r.meta)).toEqual(['Navy · Size L']);
    expect(subtotals().total).toBe('$34.00');
  });

  it('is a no-op for a key that is not in the cart', () => {
    add('black', 'M');
    site.removeItem('white-S');

    expect(cartRows()).toHaveLength(1);
    expect(cartCount()).toBe('1');
  });
});
