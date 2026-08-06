const MODEL = 'claude-haiku-4-5-20251001';
const contentEl = document.getElementById('content');

document.getElementById('openOptions').addEventListener('click', () => {
  chrome.runtime.openOptionsPage();
});

document.getElementById('manualForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const input = document.getElementById('manualInput');
  const word = input.value.trim();
  if (word) {
    lookupWord(word);
  }
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'session' && changes.selectedWord) {
    lookupWord(changes.selectedWord.newValue);
  }
});

chrome.storage.session.get('selectedWord').then(({ selectedWord }) => {
  if (selectedWord) {
    lookupWord(selectedWord);
  }
});

async function lookupWord(word) {
  document.getElementById('manualInput').value = word;
  contentEl.innerHTML = `<p class="loading">Looking up “${escapeHtml(word)}”…</p>`;

  const { apiKey } = await chrome.storage.local.get('apiKey');
  if (!apiKey) {
    contentEl.innerHTML = `<p class="error">No Claude API key set. <a href="#" id="goToOptions">Open settings</a> to add one.</p>`;
    document.getElementById('goToOptions').addEventListener('click', (e) => {
      e.preventDefault();
      chrome.runtime.openOptionsPage();
    });
    return;
  }

  try {
    const data = await fetchDefinition(word, apiKey);
    renderResult(data, word);
  } catch (err) {
    contentEl.innerHTML = `<p class="error">Something went wrong: ${escapeHtml(err.message)}</p>`;
  }
}

async function fetchDefinition(word, apiKey) {
  const prompt = `You are helping a browser user who highlighted the word or phrase "${word}" while reading a webpage. Respond ONLY with valid JSON (no markdown, no commentary) matching this exact shape:

{
  "term": "${word}",
  "partOfSpeech": "string, e.g. noun/verb/idiom, or empty string if not applicable",
  "definition": "a clear, general-purpose definition, 1-2 sentences",
  "usages": [
    { "field": "short field/domain name, e.g. Finance, Everyday, Medicine, Law", "example": "one example sentence showing this specific usage" }
  ]
}

Include 2 to 4 entries in "usages", covering genuinely distinct ways the term is used across different fields or contexts. If the term only has one common meaning, include just 1 usage entry. Do not invent fields that don't make sense for this term.`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 600,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API error ${response.status}: ${text.slice(0, 200)}`);
  }

  const json = await response.json();
  const raw = json.content?.[0]?.text ?? '';
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Could not parse a response from the model.');
  }
  return JSON.parse(jsonMatch[0]);
}

function renderResult(data, fallbackWord) {
  const term = data.term || fallbackWord;
  const wikiUrl = `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(term)}`;

  const usagesHtml = (data.usages || [])
    .map(
      (u) => `
        <div class="usage">
          <p class="field">${escapeHtml(u.field)}</p>
          <p class="example">${escapeHtml(u.example)}</p>
        </div>`
    )
    .join('');

  contentEl.innerHTML = `
    <p class="term">${escapeHtml(term)}</p>
    ${data.partOfSpeech ? `<p class="part-of-speech">${escapeHtml(data.partOfSpeech)}</p>` : ''}
    <p class="definition">${escapeHtml(data.definition || '')}</p>
    <div class="usages">
      <h2>Usage by field</h2>
      ${usagesHtml || '<p class="empty">No field-specific usages found.</p>'}
    </div>
    <a class="wiki-link" href="${wikiUrl}" target="_blank" rel="noopener">View on Wikipedia ↗</a>
  `;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str ?? '';
  return div.innerHTML;
}
