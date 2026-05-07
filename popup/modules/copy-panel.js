import { getAllSiteData } from './storage.js';

let callbacks = { onClose: null, onConfirm: null };
let currentHost = null;
let allSiteData = {};

export function initCopyPanel({ onClose, onConfirm }) {
  callbacks = { onClose, onConfirm };
  document.getElementById('btn-copy-cancel').addEventListener('click', closeCopyPanel);
  document.getElementById('btn-copy-confirm').addEventListener('click', confirmCopy);
  document.getElementById('copy-domain-select').addEventListener('change', onDomainChange);
  document.getElementById('copy-selector-list').addEventListener('change', updateConfirmBtn);
}

export async function openCopyPanel(host) {
  currentHost = host;
  allSiteData = await getAllSiteData();

  const select = document.getElementById('copy-domain-select');
  select.innerHTML = '';

  const otherDomains = Object.keys(allSiteData).filter(
    d => d !== host && Array.isArray(allSiteData[d]?.selectors) && allSiteData[d].selectors.length > 0
  );

  if (otherDomains.length === 0) {
    const opt = document.createElement('option');
    opt.value = '';
    opt.textContent = 'No other sites with selectors';
    opt.disabled = true;
    select.appendChild(opt);
    document.getElementById('btn-copy-confirm').disabled = true;
  } else {
    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = '— select a domain —';
    select.appendChild(placeholder);

    otherDomains.forEach(domain => {
      const opt = document.createElement('option');
      opt.value = domain;
      const count = allSiteData[domain].selectors.length;
      opt.textContent = `${domain} (${count} selector${count !== 1 ? 's' : ''})`;
      select.appendChild(opt);
    });
  }

  select.value = '';
  document.getElementById('copy-selector-list').innerHTML = '';
  document.getElementById('copy-error').textContent = '';
  document.getElementById('btn-copy-confirm').disabled = true;
  document.getElementById('copy-panel').style.display = 'block';
}

export function closeCopyPanel() {
  document.getElementById('copy-panel').style.display = 'none';
  document.getElementById('copy-domain-select').innerHTML = '';
  document.getElementById('copy-selector-list').innerHTML = '';
  document.getElementById('copy-error').textContent = '';
  callbacks.onClose?.();
}

function onDomainChange(e) {
  const domain = e.target.value;
  const list = document.getElementById('copy-selector-list');
  list.innerHTML = '';
  document.getElementById('btn-copy-confirm').disabled = true;
  document.getElementById('copy-error').textContent = '';

  if (!domain) return;

  const selectors = allSiteData[domain]?.selectors || [];
  selectors.forEach(entry => {
    const item = document.createElement('label');
    item.className = 'copy-selector-item';

    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.dataset.entryId = entry.id;

    const info = document.createElement('div');
    info.className = 'selector-info';

    const desc = document.createElement('div');
    desc.className = 'selector-description';
    desc.textContent = entry.description;
    desc.title = entry.description;

    const sel = document.createElement('div');
    sel.className = 'selector-text';
    sel.textContent = entry.selector;
    sel.title = entry.selector;

    info.appendChild(desc);
    info.appendChild(sel);
    item.appendChild(cb);
    item.appendChild(info);
    list.appendChild(item);
  });
}

function updateConfirmBtn() {
  const checked = document.querySelectorAll('#copy-selector-list input[type="checkbox"]:checked');
  document.getElementById('btn-copy-confirm').disabled = checked.length === 0;
}

function confirmCopy() {
  const domain = document.getElementById('copy-domain-select').value;
  if (!domain) return;

  const checked = [...document.querySelectorAll('#copy-selector-list input[type="checkbox"]:checked')];
  const selectedIds = new Set(checked.map(cb => cb.dataset.entryId));
  const toAdd = (allSiteData[domain]?.selectors || []).filter(e => selectedIds.has(e.id));

  closeCopyPanel();
  callbacks.onConfirm?.(toAdd);
}
