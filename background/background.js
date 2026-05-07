// Background service worker for HTML Element Remover.
// The popup communicates with content scripts directly via chrome.tabs.sendMessage.

chrome.runtime.onInstalled.addListener(({ reason }) => {
  if (reason === 'install') {
    console.log('[HER] Extension installed.');
  }
});
