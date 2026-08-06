chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(console.error);
});

chrome.runtime.onMessage.addListener((message, sender) => {
  if (message.type !== 'WORD_SELECTED' || !sender.tab) return;

  chrome.storage.session.set({ selectedWord: message.word });

  // Requires Chrome 116+: opening the side panel from a background script
  // in response to a user-gesture message (the mouseup that made the selection).
  chrome.sidePanel.open({ tabId: sender.tab.id }).catch(() => {
    // If this fails (older Chrome, or no prior user gesture), the user can
    // still open the panel manually by clicking the extension icon once —
    // the stored word above will render as soon as the panel opens.
  });
});
