(function () {
  'use strict';

  if (window.__HER_INJECTED__) return;
  window.__HER_INJECTED__ = true;

  const OUTLINE_ATTR  = 'data-her-prev-outline';
  const ANCHOR_ATTR   = 'data-her-anchor';
  const OVERLAY_CLASS = '__her-overlay__';
  const STYLE_ID      = '__her-style__';

  // ── CSS injection (primary hiding mechanism) ───────────────────────────────
  // Injecting a <style> block is instant — CSS hides matching elements the
  // moment they are parsed, with no flash of visible content.

  function getOrCreateStyle() {
    let style = document.getElementById(STYLE_ID);
    if (!style) {
      style = document.createElement('style');
      style.id = STYLE_ID;
      (document.head || document.documentElement).appendChild(style);
    }
    return style;
  }

  function applyAll(siteData, excludeSelector = null) {
    const style = getOrCreateStyle();

    if (!siteData || !Array.isArray(siteData.selectors)) {
      style.textContent = '';
      return;
    }

    const validEnabled = siteData.selectors
      .filter(e => e.enabled && e.selector !== excludeSelector)
      .map(e => e.selector)
      .filter(s => { try { document.querySelectorAll(s); return true; } catch { return false; } });

    style.textContent = validEnabled.length > 0
      ? `${validEnabled.join(',\n')} { display: none !important; }`
      : '';
  }

  // ── Highlight (preview) ────────────────────────────────────────────────────

  function clearHighlights() {
    document.querySelectorAll(`.${OVERLAY_CLASS}`).forEach(el => el.remove());
    document.querySelectorAll(`[${OUTLINE_ATTR}]`).forEach(el => {
      el.style.outline = el.getAttribute(OUTLINE_ATTR);
      el.removeAttribute(OUTLINE_ATTR);
    });
    document.querySelectorAll(`[${ANCHOR_ATTR}]`).forEach(el => {
      el.style.removeProperty('anchor-name');
      el.removeAttribute(ANCHOR_ATTR);
    });
  }

  function highlight(selector) {
    clearHighlights();

    let elements;
    try {
      elements = document.querySelectorAll(selector);
    } catch {
      return;
    }

    const container = document.body || document.documentElement;
    elements.forEach((el, i) => {
      const anchorName = `--her-anchor-${i}`;
      el.style.setProperty('anchor-name', anchorName);
      el.setAttribute(ANCHOR_ATTR, anchorName);

      el.setAttribute(OUTLINE_ATTR, el.style.outline || '');
      el.style.outline = '2px solid #ef4444';

      const overlay = document.createElement('div');
      overlay.className = OVERLAY_CLASS;
      overlay.style.cssText = `
        position: fixed;
        position-anchor: ${anchorName};
        top: anchor(top);
        left: anchor(left);
        right: anchor(right);
        bottom: anchor(bottom);
        background: rgba(239, 68, 68, 0.25);
        pointer-events: none;
        z-index: 2147483647;
      `;
      container.appendChild(overlay);
    });
  }

  // ── Core ───────────────────────────────────────────────────────────────────

  function loadAndApply(excludeSelector = null) {
    const host = window.location.hostname;
    chrome.storage.sync.get(host, (data) => applyAll(data[host], excludeSelector));
  }

  // ── Message listener ───────────────────────────────────────────────────────

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    switch (message.type) {
      case 're-apply':        loadAndApply(); break;
      case 'preview-edit':    loadAndApply(message.selector); break;
      case 'highlight':       highlight(message.selector); break;
      case 'clear-highlight': clearHighlights(); break;
    }
    sendResponse({ ok: true });
  });

  // ── Boot ───────────────────────────────────────────────────────────────────

  loadAndApply();
})();


