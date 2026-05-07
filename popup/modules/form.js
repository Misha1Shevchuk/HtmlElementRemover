export function getFormValues() {
  return {
    description: document.getElementById('input-description').value.trim(),
    selector: document.getElementById('input-selector').value.trim(),
  };
}

export function setError(msg) {
  document.getElementById('form-error').textContent = msg;
}

export function clearError() {
  document.getElementById('form-error').textContent = '';
  document.getElementById('input-description').classList.remove('error');
  document.getElementById('input-selector').classList.remove('error');
}

export function resetForm() {
  document.getElementById('input-description').value = '';
  document.getElementById('input-selector').value = '';
  clearError();
}

export function validateSelector(selector) {
  try {
    document.querySelectorAll(selector);
    return true;
  } catch {
    return false;
  }
}

export function setFormDisabled(disabled) {
  ['btn-save', 'btn-preview', 'input-selector', 'input-description']
    .forEach(id => { document.getElementById(id).disabled = disabled; });
}
