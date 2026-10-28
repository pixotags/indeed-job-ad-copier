// Indeed job ad → clipboard.
// Runs when you click the extension icon (or press Alt+Shift+I).
// Can also be pasted straight into the DevTools console on an Indeed job page.
(() => {
  const clean = (s) => (s || '')
    .replace(/ /g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  // Header: title + company block (first line = company, rest = location, rating, …)
  const header = document.querySelector('[data-testid="desktop-job-header"]') || document;
  const pick = (sel) => header.querySelector(sel) || document.querySelector(sel);

  const title = clean(pick('[data-testid="vj-job-title"]')?.innerText);
  const companyLines = clean(pick('[data-testid="company-info-metadata"]')?.innerText)
    .split('\n').map((l) => l.trim()).filter(Boolean);
  const company = companyLines[0] || '';
  const companyDetails = companyLines.slice(1);

  // Description: start at the "Full job description" heading and walk up until an
  // ancestor contains the description HTML block (container classes are generated).
  const heading = document.querySelector('[data-testid="vj-job-description-heading"]');
  const findDescription = () => {
    for (let c = heading?.parentElement; c && c !== document.body; c = c.parentElement) {
      const content = c.querySelector('.simple-job-description-html, .react-native-html-content');
      if (content) return content;
    }
    return document.querySelector('.simple-job-description-html, .react-native-html-content');
  };
  const descEl = findDescription();

  // DOM → readable text: keeps paragraphs and turns <li> into "- item" lines.
  const BLOCK = new Set(['P', 'DIV', 'SECTION', 'UL', 'OL', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'TABLE', 'TR', 'BLOCKQUOTE']);
  const toText = (node) => {
    let out = '';
    for (const child of node.childNodes) {
      if (child.nodeType === Node.TEXT_NODE) { out += child.textContent; continue; }
      if (child.nodeType !== Node.ELEMENT_NODE) continue;
      const tag = child.tagName;
      if (tag === 'SCRIPT' || tag === 'STYLE') continue;
      if (tag === 'BR') { out += '\n'; continue; }
      if (tag === 'LI') { out += '\n- ' + clean(toText(child)).replace(/\n+/g, ' '); continue; }
      const inner = toText(child);
      out += BLOCK.has(tag) ? '\n' + inner + '\n' : inner;
    }
    return out;
  };
  const description = descEl ? clean(toText(descEl)) : '';

  const lines = [`Job Title: ${title || '(not found)'}`, `Company: ${company || '(not found)'}`];
  if (companyDetails.length) lines.push(`Details: ${companyDetails.join(' | ')}`);
  lines.push(`URL: ${location.href}`, '', 'Job Description:', description || '(not found)');
  const output = lines.join('\n');

  const toast = (msg, ok = true) => {
    const t = document.createElement('div');
    t.textContent = msg;
    Object.assign(t.style, {
      position: 'fixed', bottom: '20px', right: '20px', zIndex: 2147483647, maxWidth: '360px',
      padding: '10px 14px', borderRadius: '8px', font: '14px system-ui, sans-serif',
      color: '#fff', background: ok ? '#1e7d32' : '#b3261e', boxShadow: '0 4px 12px rgba(0,0,0,.25)',
    });
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2500);
  };

  // Fallback for when the async clipboard API is blocked.
  const execCopy = (text) => {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0;';
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch (_) {}
    ta.remove();
    return ok;
  };

  const missing = [!title && 'title', !company && 'company', !description && 'description'].filter(Boolean);
  const ok = !missing.length;
  const summary = ok ? `Copied: ${title}` : `Copied, but missing: ${missing.join(', ')}`;

  // In the DevTools console, the built-in copy() helper works even though the page isn't focused.
  if (typeof copy === 'function') {
    try { copy(output); toast(summary, ok); console.log(output); return output; } catch (_) {}
  }

  (async () => {
    try {
      await navigator.clipboard.writeText(output);
      toast(summary, ok);
    } catch (_) {
      if (execCopy(output)) toast(summary, ok);
      else { toast('Copy failed — text logged to console', false); console.log(output); }
    }
  })();

  return output;
})();
