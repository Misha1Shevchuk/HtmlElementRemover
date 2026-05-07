import { loadSiteData, saveSiteData } from './modules/storage.js';
import { renderList } from './modules/render.js';
import {
  getFormValues,
  setError,
  clearError,
  resetForm,
  validateSelector,
  setFormDisabled,
} from './modules/form.js';
import { initCopyPanel, openCopyPanel } from './modules/copy-panel.js';

let currentTabId = null;
let currentHost = null;
let siteData = { selectors: [] };
let isPreviewing = false;
let editingIndex = null; // null = add mode, number = edit mode

// ── Messaging ────────────────────────────────────────────────────────────────

async function sendToContent(message) {
  if (!currentTabId) return;
  try {
    await chrome.tabs.sendMessage(currentTabId, message);
  } catch {
    // Content script not available (e.g. chrome:// pages, new tab page)
  }
}

// ── Storage ──────────────────────────────────────────────────────────────────

async function persist() {
  await saveSiteData(currentHost, siteData);
}

// ── Form visibility ───────────────────────────────────────────────────────────

function showForm(mode = 'add') {
  document.getElementById('add-form').style.display = 'block';
  document.getElementById('list-footer').style.display = 'none';
  document.getElementById('form-title').textContent =
    mode === 'edit' ? 'Edit Element' : 'Hide Element';
}

function hideForm() {
  document.getElementById('add-form').style.display = 'none';
  document.getElementById('list-footer').style.display = 'flex';
  editingIndex = null;
  resetForm();
}

// ── CRUD ─────────────────────────────────────────────────────────────────────

function rerender() {
  renderList(siteData, { onToggle: toggleEntry, onEdit: editEntry, onDelete: deleteEntry });
}

async function toggleEntry(index) {
  siteData.selectors[index].enabled = !siteData.selectors[index].enabled;
  await persist();
  rerender();
  await sendToContent({ type: 're-apply' });
}

async function deleteEntry(index) {
  // If we're editing this entry, cancel edit mode first
  if (editingIndex === index) hideForm();
  siteData.selectors.splice(index, 1);
  await persist();
  rerender();
  await sendToContent({ type: 're-apply' });
}

function editEntry(index) {
  const entry = siteData.selectors[index];
  editingIndex = index;
  document.getElementById('input-description').value = entry.description;
  document.getElementById('input-selector').value = entry.selector;
  clearError();
  showForm('edit');
  sendToContent({ type: 'preview-edit', selector: entry.selector });
}

async function addEntry(description, selector) {
  siteData.selectors.push({ id: crypto.randomUUID(), selector, description, enabled: true });
  await persist();
  rerender();
  await sendToContent({ type: 're-apply' });
}

async function updateEntry(index, description, selector) {
  siteData.selectors[index] = { ...siteData.selectors[index], description, selector };
  await persist();
  rerender();
  await sendToContent({ type: 're-apply' });
}

async function handleCopiedSelectors(entries) {
  const existingSelectors = new Set(siteData.selectors.map(s => s.selector));
  const toAdd = entries
    .filter(e => !existingSelectors.has(e.selector))
    .map(e => ({ ...e, id: crypto.randomUUID() }));
  if (toAdd.length === 0) return;
  siteData.selectors.push(...toAdd);
  await persist();
  rerender();
  await sendToContent({ type: 're-apply' });
}

// ── Event listeners ───────────────────────────────────────────────────────────

document.getElementById('btn-add-new').addEventListener('click', () => {
  editingIndex = null;
  showForm('add');
});

document.getElementById('btn-copy-from').addEventListener('click', async () => {
  document.getElementById('list-footer').style.display = 'none';
  await openCopyPanel(currentHost);
});

initCopyPanel({
  onClose: () => { document.getElementById('list-footer').style.display = 'flex'; },
  onConfirm: handleCopiedSelectors,
});

document.getElementById('btn-cancel').addEventListener('click', async () => {
  isPreviewing = false;
  await sendToContent({ type: 'clear-highlight' });
  hideForm();
});

document.getElementById('btn-preview').addEventListener('click', async () => {
  clearError();
  const { selector } = getFormValues();

  if (!selector) {
    document.getElementById('input-selector').classList.add('error');
    setError('Enter a CSS selector to preview.');
    return;
  }
  if (!validateSelector(selector)) {
    document.getElementById('input-selector').classList.add('error');
    setError('Invalid CSS selector.');
    return;
  }

  isPreviewing = true;
  await sendToContent({ type: 'highlight', selector });
});

document.getElementById('btn-save').addEventListener('click', async () => {
  clearError();
  const { description, selector } = getFormValues();

  let hasError = false;
  if (!description) { document.getElementById('input-description').classList.add('error'); hasError = true; }
  if (!selector)     { document.getElementById('input-selector').classList.add('error');     hasError = true; }
  if (hasError) { setError('Both fields are required.'); return; }

  if (!validateSelector(selector)) {
    document.getElementById('input-selector').classList.add('error');
    setError('Invalid CSS selector.');
    return;
  }

  isPreviewing = false;
  await sendToContent({ type: 'clear-highlight' });

  if (editingIndex !== null) {
    await updateEntry(editingIndex, description, selector);
  } else {
    await addEntry(description, selector);
  }

  hideForm();
});

document.getElementById('input-selector').addEventListener('input', () => {
  document.getElementById('input-selector').classList.remove('error');
  clearError();
});
document.getElementById('input-description').addEventListener('input', () => {
  document.getElementById('input-description').classList.remove('error');
  clearError();
});

window.addEventListener('unload', () => {
  if (isPreviewing && currentTabId) {
    chrome.tabs.sendMessage(currentTabId, { type: 'clear-highlight' }, () => {
      void chrome.runtime.lastError;
    });
  }
});

// ── Initialization ────────────────────────────────────────────────────────────

async function init() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab) return;

  currentTabId = tab.id;

  try {
    currentHost = new URL(tab.url).hostname;
  } catch {
    currentHost = null;
  }

  if (!currentHost) {
    document.getElementById('domain').textContent = 'Not available on this page';
    setFormDisabled(true);
    return;
  }

  document.getElementById('domain').textContent = currentHost;
  siteData = await loadSiteData(currentHost);

  await sendToContent({ type: 'clear-highlight' });
  rerender();
}

init();
