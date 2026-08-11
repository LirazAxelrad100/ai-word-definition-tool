# AI Word Definition Tool

Chrome extension: select a word or phrase on any page, right-click, and choose
"Define with AI" — a side panel shows an AI-generated definition, how the term is
used across different fields (with examples), and a link to look it up on Wikipedia.

## Setup

1. Get a Claude API key from [console.anthropic.com](https://console.anthropic.com/settings/keys).
2. Load the extension:
   - Open `chrome://extensions`
   - Enable **Developer mode** (top right)
   - Click **Load unpacked** and select this folder
3. Click the ⚙ icon in the side panel (open it once via the toolbar icon), paste your API key, and save.

## Use

Select any word or short phrase on a webpage, then either:
- Right-click and choose **Define "…" with AI** from the context menu, or
- Click the extension's toolbar icon

Either way, the side panel opens with the definition. You can also type a word directly
into the side panel's search box.

## Notes

- The API key is stored only in `chrome.storage.local` on your machine and is sent
  directly to `api.anthropic.com` — no backend server involved.
- Model used is set in [sidepanel.js](sidepanel.js) (`MODEL` constant), currently
  `claude-haiku-4-5-20251001`. Swap it for a different Claude model if you want.

## How it works (for future changes)

- **[background.js](background.js)** is the service worker. It listens for the
  right-click menu and the toolbar icon click, reads the selected word, saves it to
  `chrome.storage.session` under the key `selectedWord`, and opens the side panel.
- **[sidepanel.js](sidepanel.js)** watches `chrome.storage.session` for changes to
  `selectedWord` and re-runs the lookup whenever it changes. It also handles the manual
  search box and calls the Claude API directly.
- There's no content script — the extension only reads the page's selected text at the
  moment you trigger it (right-click or icon click), it doesn't run continuously on
  every page.

## Chrome extension gotchas we hit (useful if this breaks again)

These are easy to reintroduce by accident when editing `background.js`:

1. **`chrome.sidePanel.open()` must be the first thing called, synchronously**, inside
   the click/menu handler — no `await` (not even for something unrelated like saving to
   storage) before it. If anything is awaited first, Chrome silently refuses to open the
   panel, with no error.
2. **`chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: ... })` is "sticky."**
   Chrome remembers whatever value was last set, even after that line is deleted from
   the code. If you want to change this behavior, you must explicitly set the new value
   in `onInstalled` — removing the call does nothing on its own.
3. **Debugging the background script and the side panel need two separate consoles:**
   - Background script: `chrome://extensions` → find this extension → click
     **"service worker"**.
   - Side panel: right-click on empty space *inside* the panel (not on a button) →
     **Inspect**.
   - After any code change, click **Reload** on `chrome://extensions`, and fully close
     and reopen the side panel — an already-open panel does not pick up new code
     automatically.
