let lastSelection = '';

document.addEventListener('mouseup', () => {
  const selection = window.getSelection().toString().trim();

  if (!selection || selection === lastSelection || selection.length > 100) {
    return;
  }

  lastSelection = selection;
  chrome.runtime.sendMessage({ type: 'WORD_SELECTED', word: selection });
});
