# AI Word Definition Tool

Chrome extension: highlight a word or phrase on any page, and a side panel shows an
AI-generated definition, how the term is used across different fields (with examples),
and a link to look it up on Wikipedia.

## Setup

1. Get a Claude API key from [console.anthropic.com](https://console.anthropic.com/settings/keys).
2. Load the extension:
   - Open `chrome://extensions`
   - Enable **Developer mode** (top right)
   - Click **Load unpacked** and select this folder
3. Click the extension icon once in the toolbar to open the side panel and grant it permission to open automatically.
4. Click the ⚙ icon in the side panel, paste your API key, and save.

## Use

Highlight any word or short phrase on a webpage — the side panel opens (or updates, if
already open) with the definition. You can also type a word directly into the side
panel's search box.

## Notes

- The API key is stored only in `chrome.storage.local` on your machine and is sent
  directly to `api.anthropic.com` — no backend server involved.
- Model used is set in [sidepanel.js](sidepanel.js) (`MODEL` constant), currently
  `claude-haiku-4-5-20251001`. Swap it for a different Claude model if you want.
- Requires Chrome 116+ for the side panel to auto-open on text selection. On older
  versions, click the toolbar icon manually after selecting text.
