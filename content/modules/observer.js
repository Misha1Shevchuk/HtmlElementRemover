import { applyAll } from './hiding.js';

let observer = null;
let observerDebounceTimer = null;
let activeSiteData = null;

export function setupObserver(siteData) {
  activeSiteData = siteData;

  if (observer) {
    observer.disconnect();
    observer = null;
  }

  // Always watch for DOM changes — dynamic content support is always on
  observer = new MutationObserver(() => {
    clearTimeout(observerDebounceTimer);
    observerDebounceTimer = setTimeout(() => {
      applyAll(activeSiteData);
    }, 120);
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
}
