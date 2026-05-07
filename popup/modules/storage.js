export async function loadSiteData(host) {
  const stored = await chrome.storage.sync.get(host);
  return stored[host] || { selectors: [] };
}

export async function saveSiteData(host, siteData) {
  await chrome.storage.sync.set({ [host]: siteData });
}

export async function getAllSiteData() {
  return await chrome.storage.sync.get(null);
}
