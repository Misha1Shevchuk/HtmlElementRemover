import { OUTLINE_ATTR, OVERLAY_CLASS } from './constants.js';

export function clearHighlights() {
  document.querySelectorAll(`.${OVERLAY_CLASS}`).forEach(el => el.remove());

  document.querySelectorAll(`[${OUTLINE_ATTR}]`).forEach(el => {
    el.style.outline = el.getAttribute(OUTLINE_ATTR);
    el.removeAttribute(OUTLINE_ATTR);
  });
}

export function highlight(selector) {
  clearHighlights();

  let elements;
  try {
    elements = document.querySelectorAll(selector);
  } catch {
    return; // Invalid selector
  }

  const container = document.body || document.documentElement;

  elements.forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) return;

    el.setAttribute(OUTLINE_ATTR, el.style.outline || '');
    el.style.outline = '2px solid #ef4444';

    const overlay = document.createElement('div');
    overlay.className = OVERLAY_CLASS;
    Object.assign(overlay.style, {
      position: 'fixed',
      top: `${rect.top}px`,
      left: `${rect.left}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
      background: 'rgba(239, 68, 68, 0.25)',
      pointerEvents: 'none',
      zIndex: '2147483647',
      boxSizing: 'border-box',
    });
    container.appendChild(overlay);
  });
}
