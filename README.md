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
