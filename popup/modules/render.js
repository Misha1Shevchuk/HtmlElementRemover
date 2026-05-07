export function renderList(siteData, { onToggle, onEdit, onDelete }) {
  const container = document.getElementById('selector-list');
  container.innerHTML = '';

  if (siteData.selectors.length === 0) {
    container.innerHTML = '<p class="empty-state">No selectors yet for this site.</p>';
    return;
  }

  siteData.selectors.forEach((entry, index) => {
    const row = document.createElement('div');
    row.className = 'selector-row' + (entry.enabled ? '' : ' disabled');

    const btnToggle = document.createElement('button');
    btnToggle.className = 'btn-toggle' + (entry.enabled ? ' active' : '');
    btnToggle.textContent = entry.enabled ? 'On' : 'Off';
    btnToggle.title = entry.enabled ? 'Click to disable' : 'Click to enable';
    btnToggle.addEventListener('click', () => onToggle(index));

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

    const btnEdit = document.createElement('button');
    btnEdit.className = 'btn-edit';
    btnEdit.textContent = '✎';
    btnEdit.title = 'Edit this selector';
    btnEdit.addEventListener('click', () => onEdit(index));

    const btnDelete = document.createElement('button');
    btnDelete.className = 'btn-delete';
    btnDelete.textContent = '×';
    btnDelete.title = 'Delete this selector';
    btnDelete.addEventListener('click', () => onDelete(index));

    row.appendChild(btnToggle);
    row.appendChild(info);
    row.appendChild(btnEdit);
    row.appendChild(btnDelete);
    container.appendChild(row);
  });
}
