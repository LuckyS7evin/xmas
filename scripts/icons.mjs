// Génère les icônes PWA depuis un SVG (Chromium via Playwright). Usage : npm run icons
// Playwright doit être installé (localement ou globalement).
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
const req = createRequire(import.meta.url);
let pw; try { pw = req('playwright'); } catch { pw = req(execSync('npm root -g').toString().trim() + '/playwright'); }
const { chromium } = pw;
const svg = (pad) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
<rect width="512" height="512" fill="#FBE6D2"/>
<g transform="translate(256 256) scale(${pad}) translate(-256 -256)">
<circle cx="256" cy="256" r="200" fill="#F6CFB4"/>
<circle cx="256" cy="256" r="178" fill="#2F3F7A" stroke="#3A2630" stroke-width="10"/>
<g fill="#FFF4E6"><path d="M150 180c40-28 95-15 110 15s-15 55 15 78 30 60-15 68-60-30-85-52-60-78-25-109z" opacity=".9"/></g>
<circle cx="190" cy="300" r="6" fill="#EBA93A"/><circle cx="330" cy="210" r="5" fill="#EBA93A"/>
<path d="M360 92a40 40 0 1 0 40 50a31 31 0 1 1-40-50z" fill="#EBA93A" stroke="#3A2630" stroke-width="8"/>
<svg x="56" y="232" width="400" height="160" viewBox="0 0 110 44" overflow="visible">
 <path d="M-40 30C-24 26-10 30 2 28" stroke="#EBA93A" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-dasharray="1 6"/>
 <g fill="#A66B42" stroke="#3A2630" stroke-width="1.4"><ellipse cx="88" cy="20" rx="11" ry="5.5"/><circle cx="100" cy="14" r="4"/></g>
 <path d="M82 25l-3 8M86 25l1 8M92 25l-2 8M96 25l2 8M100 10l-2-6M100 10l3-6" stroke="#3A2630" stroke-width="1.6" fill="none" stroke-linecap="round"/>
 <circle cx="104.5" cy="14" r="2" fill="#E2412B"/><path d="M42 22L77 19" stroke="#3A2630" stroke-width="1.2"/>
 <path d="M8 18h34c4 0 6 3 6 7v4H12c-4 0-6-4-4-11z" fill="#C4492A" stroke="#3A2630" stroke-width="1.6"/>
 <path d="M4 36h44c4 0 6-3 6-5" stroke="#3A2630" stroke-width="2.4" fill="none" stroke-linecap="round"/>
 <path d="M20 18c0-6 3-9 7-9s7 3 7 9z" fill="#E2412B" stroke="#3A2630" stroke-width="1.4"/>
 <circle cx="28" cy="8" r="4" fill="#F7D6BE" stroke="#3A2630" stroke-width="1.2"/>
 <path d="M24 9c0 4 2 6 4 6s4-2 4-6z" fill="#FFFFFF" stroke="#3A2630" stroke-width="1"/>
 <path d="M23 6c1-5 5-6 9-3l3 4h-3z" fill="#E2412B" stroke="#3A2630" stroke-width="1.2"/><circle cx="35" cy="7" r="1.8" fill="#FFFFFF"/>
 <rect x="10" y="10" width="9" height="8" rx="1.5" fill="#EBA93A" stroke="#3A2630" stroke-width="1.2"/>
</svg></g></svg>`;
const b = await chromium.launch();
const p = await b.newPage();
for (const [name, size, pad] of [['icon-192', 192, 1], ['icon-512', 512, 1], ['maskable-512', 512, 0.78]]) {
  await p.setViewportSize({ width: size, height: size });
  await p.setContent(`<style>body{margin:0}svg{display:block;width:${size}px;height:${size}px}</style>${svg(pad)}`);
  await p.screenshot({ path: `public/icons/${name}.png` });
}
await b.close();
