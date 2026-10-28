// Injects the Telegram Mini Apps JS SDK <script> tag into the HTML that
// `expo export --platform web` produces. Run this right after the export,
// pointing it at the resulting index.html:
//   node scripts/inject-telegram-sdk.js ../server/public/index.html
const fs = require('fs');

const target = process.argv[2];
if (!target) {
  console.error('Usage: node inject-telegram-sdk.js <path-to-index.html>');
  process.exit(1);
}

const html = fs.readFileSync(target, 'utf8');
const tag = '<script src="https://telegram.org/js/telegram-web-app.js"></script>';

if (html.includes(tag)) {
  console.log('Telegram SDK tag already present, skipping.');
  process.exit(0);
}

if (!html.includes('<head>')) {
  console.error('Could not find <head> in', target);
  process.exit(1);
}

const updated = html.replace('<head>', `<head>\n    ${tag}`);
fs.writeFileSync(target, updated);
console.log('Injected Telegram SDK tag into', target);
