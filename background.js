chrome.runtime.onInstalled.addListener(() => {
  // Must be explicitly set to false: an earlier version of this extension set
  // it to true, and Chrome persists that setting until we override it —
  // otherwise Chrome auto-opens the panel natively and our onClicked listener
  // below never fires.
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false }).catch(console.error);

  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: 'define-with-ai',
      title: 'Define "%s" with AI',
      contexts: ['selection'],
    });
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId !== 'define-with-ai' || !info.selectionText || !tab) return;

  // sidePanel.open() must run synchronously in this handler (no prior await),
  // or Chrome loses the user-gesture context and silently refuses to open.
  chrome.sidePanel.open({ tabId: tab.id }).catch(console.error);
  chrome.storage.session.set({ selectedWord: info.selectionText });
});

// Toolbar icon click: open the panel and also grab whatever is currently
// selected on the page, so it behaves the same as the right-click menu.
chrome.action.onClicked.addListener((tab) => {
  if (!tab.id) return;

  chrome.sidePanel.open({ tabId: tab.id }).catch(console.error);

  chrome.scripting
    .executeScript({
      target: { tabId: tab.id },
      func: () => window.getSelection().toString().trim(),
    })
    .then((results) => {
      const result = results?.[0]?.result;
      if (result) {
        chrome.storage.session.set({ selectedWord: result });
      }
    })
    .catch(console.error);
});
