chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(console.error);

  chrome.contextMenus.create({
    id: 'define-with-ai',
    title: 'Define "%s" with AI',
    contexts: ['selection'],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId !== 'define-with-ai' || !info.selectionText || !tab) return;

  chrome.storage.session.set({ selectedWord: info.selectionText });
  chrome.sidePanel.open({ tabId: tab.id }).catch(console.error);
});
