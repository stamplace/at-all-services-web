import fs from 'node:fs';

const html = fs.readFileSync('index.html', 'utf8');
const failures = [];
const pass = (condition, message) => { if (!condition) failures.push(message); };

const required = [
  'At All Services LLC',
  'Moshe Attal',
  '651-443-6062',
  'attalmoshe@gmail.com',
  'St. Paul',
  'Minneapolis',
  '24/7',
  'Serving Minnesota Since 2023'
];
for (const value of required) pass(html.includes(value), `Missing verified business data: ${value}`);

const forbidden = [
  /licensed\s*&?\s*insured/i,
  /licensed\s+and\s+insured/i,
  /top[- ]rated/i,
  /five[- ]star/i,
  /\b5\.0\b/i,
  /hundreds of customers/i,
  /\b#1\b/i,
  /best garage door company/i,
  /years? of experience/i,
  /arrival in \d+/i,
  /response in \d+/i
];
for (const pattern of forbidden) pass(!pattern.test(html), `Forbidden/unverified claim matched: ${pattern}`);

pass(!/href=["']#["']/i.test(html), 'Dead actionable href="#" found');
pass(!/<link[^>]+rel=["']canonical["']/i.test(html), 'Canonical must stay unset until final domain exists');
pass((html.match(/<h1\b/gi) || []).length === 1, 'Expected exactly one H1');

const phoneLinks = [...html.matchAll(/href=["'](tel:[^"']+)/gi)].map(m => m[1]);
pass(phoneLinks.length > 0, 'No phone links found');
for (const href of phoneLinks) pass(href === 'tel:+16514436062', `Incorrect phone action: ${href}`);

const emailLinks = [...html.matchAll(/href=["'](mailto:[^"']+)/gi)].map(m => m[1]);
pass(emailLinks.length > 0, 'No email links found');
for (const href of emailLinks) pass(href === 'mailto:attalmoshe@gmail.com', `Incorrect email action: ${href}`);

const waLinks = [...html.matchAll(/href=["'](https:\/\/wa\.me\/[^"']+)/gi)].map(m => m[1]);
pass(waLinks.length > 0, 'No WhatsApp links found');
for (const href of waLinks) pass(href.startsWith('https://wa.me/16514436062'), `Incorrect WhatsApp action: ${href}`);

const report = { ok: failures.length === 0, failures, checks: { requiredBusinessFacts: required.length, phoneLinks: phoneLinks.length, emailLinks: emailLinks.length, whatsappLinks: waLinks.length, h1Count: (html.match(/<h1\b/gi) || []).length } };
fs.mkdirSync('qa', { recursive: true });
fs.writeFileSync('qa/static-report.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
if (failures.length) process.exit(1);
