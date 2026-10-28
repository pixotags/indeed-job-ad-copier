// Runs copy-job-ad.js in the current tab when the toolbar icon (or Alt+Shift+I) is pressed.
chrome.action.onClicked.addListener(async (tab) => {
  if (!tab?.id) return;
  try {
    await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['copy-job-ad.js'] });
  } catch (err) {
    console.error('Indeed Job Ad Copier:', err);
  }
});
