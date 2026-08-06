import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { activePageIds, loadStorefront, toast } from './helpers/loadStorefront.js';

let site;

beforeEach(async () => {
  vi.useFakeTimers();
  site = await loadStorefront();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('toggleCart', () => {
  it('opens the sidebar and overlay together', () => {
    site.toggleCart();

    expect(document.getElementById('cart-sidebar').classList.contains('open')).toBe(true);
    expect(document.getElementById('cart-overlay').classList.contains('open')).toBe(true);
  });

  it('closes them again on a second call', () => {
    site.toggleCart();
    site.toggleCart();

    expect(document.getElementById('cart-sidebar').classList.contains('open')).toBe(false);
    expect(document.getElementById('cart-overlay').classList.contains('open')).toBe(false);
  });
});

describe('showPage', () => {
  it('starts on the home page', () => {
    expect(activePageIds()).toEqual(['page-home']);
  });

  it('activates exactly one page at a time', () => {
    site.showPage('about');
    expect(activePageIds()).toEqual(['page-about']);

    site.showPage('contact');
    expect(activePageIds()).toEqual(['page-contact']);

    site.showPage('home');
    expect(activePageIds()).toEqual(['page-home']);
  });

  it('scrolls back to the top', () => {
    site.showPage('contact');
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  });

  it('throws for an unknown page id', () => {
    expect(() => site.showPage('missing')).toThrow();
  });
});

describe('showToast', () => {
  it('shows the message', () => {
    site.showToast('Hello');

    expect(toast().textContent).toBe('Hello');
    expect(toast().classList.contains('show')).toBe(true);
  });

  it('hides itself after 2.8s', () => {
    site.showToast('Hello');
    vi.advanceTimersByTime(2799);
    expect(toast().classList.contains('show')).toBe(true);

    vi.advanceTimersByTime(1);
    expect(toast().classList.contains('show')).toBe(false);
  });

  it('restarts the timer for a message that interrupts another', () => {
    site.showToast('First');
    vi.advanceTimersByTime(2000);
    site.showToast('Second');

    vi.advanceTimersByTime(1000);
    expect(toast().textContent).toBe('Second');
    expect(toast().classList.contains('show')).toBe(true);

    vi.advanceTimersByTime(1800);
    expect(toast().classList.contains('show')).toBe(false);
  });
});
