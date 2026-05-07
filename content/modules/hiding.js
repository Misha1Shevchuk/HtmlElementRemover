import { HIDDEN_ATTR } from './constants.js';

export function hideMatching(entry) {
  if (!entry.enabled) return;
  try {
    document.querySelectorAll(entry.selector).forEach(el => {
      el.setAttribute('hidden', '');
      el.style.display = 'none';
      el.setAttribute(HIDDEN_ATTR, '');
    });
  } catch {
    // Invalid selector — skip silently
  }
}

export function applyAll(siteData) {
  document.querySelectorAll(`[${HIDDEN_ATTR}]`).forEach(el => {
    el.removeAttribute('hidden');
    el.style.display = '';
    el.removeAttribute(HIDDEN_ATTR);
  });

  if (!siteData || !Array.isArray(siteData.selectors)) return;
  siteData.selectors.forEach(hideMatching);
}
