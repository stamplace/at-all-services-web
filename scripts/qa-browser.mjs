import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const qaDir = path.join(root, 'qa', 'screenshots');
fs.mkdirSync(qaDir, { recursive: true });

const mime = { '.html':'text/html; charset=utf-8', '.css':'text/css', '.js':'text/javascript', '.json':'application/json', '.svg':'image/svg+xml', '.webp':'image/webp', '.jpg':'image/jpeg', '.png':'image/png', '.avif':'image/avif' };
const server = http.createServer((req,res) => {
  const raw = new URL(req.url, 'http://127.0.0.1').pathname;
  const requested = raw === '/' ? '/index.html' : raw;
  const file = path.resolve(root, `.${requested}`);
  if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end('Not found'); return; }
  res.setHeader('Content-Type', mime[path.extname(file)] || 'application/octet-stream');
  res.end(fs.readFileSync(file));
});
await new Promise(resolve => server.listen(4173, '127.0.0.1', resolve));

const viewports = [
  { name:'390x844', width:390, height:844 },
  { name:'430x932', width:430, height:932 },
  { name:'768x1024', width:768, height:1024 },
  { name:'1440x1000', width:1440, height:1000 },
  { name:'1920x1080', width:1920, height:1080 }
];

const browser = await chromium.launch({ headless:true });
const report = { ok:true, viewports:[], form:null, failures:[] };
const fail = msg => { report.ok=false; report.failures.push(msg); };

for (const vp of viewports) {
  const context = await browser.newContext({ viewport:{ width:vp.width, height:vp.height }, reducedMotion:'no-preference' });
  const page = await context.newPage();
  const runtimeErrors = [];
  page.on('pageerror', e => runtimeErrors.push(`pageerror: ${e.message}`));
  page.on('console', msg => { if (msg.type() === 'error') runtimeErrors.push(`console: ${msg.text()}`); });
  await page.goto('http://127.0.0.1:4173/', { waitUntil:'domcontentloaded' });
  await page.waitForTimeout(700);

  const metrics = await page.evaluate(() => {
    const hero = document.querySelector('.hero');
    const copy = document.querySelector('.hero-copy');
    const media = document.querySelector('.hero-media');
    const h1 = document.querySelector('h1');
    const primary = document.querySelector('.hero .btn-primary');
    const dock = document.getElementById('mobileDock');
    const r = el => el ? el.getBoundingClientRect() : null;
    return {
      viewportWidth: innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      h1Count: document.querySelectorAll('h1').length,
      hero:r(hero), copy:r(copy), media:r(media), h1:r(h1), primary:r(primary),
      dockOpacity: dock ? Number(getComputedStyle(dock).opacity) : null,
      dockPointer: dock ? getComputedStyle(dock).pointerEvents : null,
      callHrefs:[...document.querySelectorAll('a[href^="tel:"]')].map(a=>a.getAttribute('href')),
      emailHrefs:[...document.querySelectorAll('a[href^="mailto:"]')].map(a=>a.getAttribute('href')),
      whatsappHrefs:[...document.querySelectorAll('a[href^="https://wa.me/"]')].map(a=>a.getAttribute('href')),
      deadHashes:[...document.querySelectorAll('a[href="#"]')].length
    };
  });

  if (metrics.scrollWidth > metrics.viewportWidth + 1) fail(`${vp.name}: horizontal overflow ${metrics.scrollWidth} > ${metrics.viewportWidth}`);
  if (metrics.h1Count !== 1) fail(`${vp.name}: expected one H1, got ${metrics.h1Count}`);
  if (metrics.deadHashes !== 0) fail(`${vp.name}: dead hash links found`);
  if (!metrics.callHrefs.length || metrics.callHrefs.some(h => h !== 'tel:+16514436062')) fail(`${vp.name}: incorrect call href`);
  if (!metrics.emailHrefs.length || metrics.emailHrefs.some(h => h !== 'mailto:attalmoshe@gmail.com')) fail(`${vp.name}: incorrect email href`);
  if (!metrics.whatsappHrefs.length || metrics.whatsappHrefs.some(h => !h.startsWith('https://wa.me/16514436062?text='))) fail(`${vp.name}: incorrect WhatsApp href`);
  if (runtimeErrors.length) fail(`${vp.name}: runtime errors: ${runtimeErrors.join(' | ')}`);

  if (vp.width <= 430) {
    if (!metrics.media || metrics.media.height < 190) fail(`${vp.name}: hero photography is not visibly substantial`);
    if (!metrics.h1 || metrics.h1.height > 190) fail(`${vp.name}: H1 dominates too much vertical space`);
    if (!metrics.primary || metrics.primary.top >= vp.height) fail(`${vp.name}: primary Call CTA starts below first viewport`);
    if (metrics.dockOpacity !== null && metrics.dockOpacity > 0.05) fail(`${vp.name}: sticky dock competes with hero CTA at top`);
  }

  if (vp.width >= 1440) {
    if (!metrics.copy || metrics.copy.width < 500) fail(`${vp.name}: hero copy column is too narrow (${metrics.copy?.width}px)`);
    if (!metrics.h1 || metrics.h1.height > 300) fail(`${vp.name}: desktop H1 wraps too deeply (${metrics.h1?.height}px)`);
    if (!metrics.primary || metrics.primary.width < 175 || metrics.primary.height > 72) fail(`${vp.name}: primary Call CTA lost horizontal integrity`);
    if (!metrics.media || metrics.media.width < vp.width * .9) fail(`${vp.name}: hero photography field is unexpectedly constrained`);
  }

  await page.screenshot({ path:path.join(qaDir, `${vp.name}-top.png`), fullPage:false });
  await page.screenshot({ path:path.join(qaDir, `${vp.name}-full.png`), fullPage:true });

  if (vp.width <= 430) {
    await page.evaluate(() => {
      document.documentElement.style.scrollBehavior = 'auto';
      window.scrollTo(0, Math.max(700, document.querySelector('#services').offsetTop));
    });
    await page.waitForTimeout(350);
    const dockAfter = await page.locator('#mobileDock').evaluate(el => ({ opacity:Number(getComputedStyle(el).opacity), pointer:getComputedStyle(el).pointerEvents }));
    if (dockAfter.opacity < .9 || dockAfter.pointer === 'none') fail(`${vp.name}: sticky dock did not appear after hero CTA left view`);
    await page.screenshot({ path:path.join(qaDir, `${vp.name}-scrolled.png`), fullPage:false });
    await page.evaluate(() => window.scrollTo(0,0));
    await page.waitForFunction(() => scrollY === 0);
  }

  report.viewports.push({ ...vp, metrics:{ scrollWidth:metrics.scrollWidth, h1Count:metrics.h1Count, copyWidth:metrics.copy?.width, mediaWidth:metrics.media?.width, mediaHeight:metrics.media?.height, h1Height:metrics.h1?.height, primaryWidth:metrics.primary?.width, primaryHeight:metrics.primary?.height, primaryTop:metrics.primary?.top, primaryBottom:metrics.primary?.bottom }, runtimeErrors });
  await context.close();
}

{
  const context = await browser.newContext({ viewport:{ width:390, height:844 } });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4173/', { waitUntil:'domcontentloaded' });
  await page.evaluate(() => { window.__openedUrl=''; window.open=(url)=>{ window.__openedUrl=String(url); return null; }; });
  await page.locator('#name').fill('QA Test');
  await page.locator('#phone').fill('6515550100');
  await page.locator('#city').selectOption({ label:'St. Paul' });
  await page.locator('#serviceNeeded').selectOption({ label:'Broken Spring Repair' });
  await page.locator('#problem').fill('Garage door will not open');
  await page.locator('#serviceForm').evaluate(form => form.requestSubmit());
  await page.waitForTimeout(100);
  const opened = await page.evaluate(() => window.__openedUrl);
  const status = await page.locator('#formStatus').textContent();
  report.form = { opened, status };
  if (!opened.startsWith('https://wa.me/16514436062?text=')) fail('Request Service did not generate the verified WhatsApp destination');
  for (const required of ['QA%20Test','6515550100','St.%20Paul','Broken%20Spring%20Repair','Garage%20door%20will%20not%20open']) if (!opened.includes(required)) fail(`Request Service handoff missing ${required}`);
  if (!status?.includes('ready in WhatsApp')) fail('Request Service success status was not shown');
  await context.close();
}

await browser.close();
server.close();
fs.mkdirSync(path.join(root,'qa'), { recursive:true });
fs.writeFileSync(path.join(root,'qa','browser-report.json'), JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));
if (!report.ok) process.exit(1);
