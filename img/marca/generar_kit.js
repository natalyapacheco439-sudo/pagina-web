const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
// Requiere playwright y los paquetes npm @fontsource/jost y @fontsource/nunito descomprimidos en ./fonts
const S = '.';
const M = '/home/user/pagina-web/img/marca/';
const OUT = process.argv[2];
const J = S + '/fonts/package/files/', N = S + '/fonts/nunito/package/files/';
const svg = (n) => fs.readFileSync(M + n + '.svg', 'utf8').replace(/<title>.*?<\/title>/, '');
const LOGO = svg('amara-home-horizontal'), LOGO_W = svg('amara-home-horizontal-blanco');
const ICONO_R = svg('amara-home-icono-rojo');
const LOGO_WR = LOGO_W.replace(/#5a5a58/g, '#b83a3a').replace(/#bdbdbb/g, '#ffffff');

// Datos editables
const WA = '+57 300 000 0000';
const ZONA = 'Bogotá y municipios aledaños';

const LINES = (color, op = 1, sw = 15, block = 'none') => `<svg viewBox="140 330 525 320" xmlns="http://www.w3.org/2000/svg" style="opacity:${op}">
  <rect x="250" y="428" width="152" height="212" rx="5" fill="${block}"/>
  <path d="M150 636 H222 V543 L440 440 V341 H343 V607 H548 V522 L443 463 V637 H654" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

const font = (f) => 'data:font/woff2;base64,' + fs.readFileSync(f).toString('base64');
const base = `
@font-face{font-family:Jost;font-weight:500;src:url(${font(J+'jost-latin-500-normal.woff2')})}
@font-face{font-family:Jost;font-weight:600;src:url(${font(J+'jost-latin-600-normal.woff2')})}
@font-face{font-family:Jost;font-weight:700;src:url(${font(J+'jost-latin-700-normal.woff2')})}
@font-face{font-family:Nunito;font-weight:400;src:url(${font(N+'nunito-latin-400-normal.woff2')})}
@font-face{font-family:Nunito;font-weight:600;src:url(${font(N+'nunito-latin-600-normal.woff2')})}
@font-face{font-family:Nunito;font-weight:700;src:url(${font(N+'nunito-latin-700-normal.woff2')})}
*{box-sizing:border-box;margin:0;padding:0}
html,body{background:transparent}
:root{--red:#950606;--red-d:#6e0404;--ink:#2b2b2b;--gray:#6e6e6c;--lg:#d9d9d6;--bg:#f3f2f0}
.page{position:relative;overflow:hidden;font-family:Nunito,sans-serif;color:var(--ink)}
h1,h2,.j{font-family:Jost,sans-serif}
.photo{position:absolute;overflow:hidden}
.photo.ej{background:linear-gradient(160deg,#cfcfcb,#9d9d99)}
.photo.ej .ph{position:absolute;inset:0;display:grid;place-content:center;justify-items:center;gap:18px;color:#fff;font:600 34px Jost;letter-spacing:.04em}
.photo.ej .ph svg{width:240px}
.pill{display:inline-block;background:var(--red);color:#fff;font:600 30px/1 Jost;letter-spacing:.16em;padding:16px 28px;border-radius:999px}
.logo svg{width:100%;height:auto;display:block}
.wa{display:flex;align-items:center;gap:16px}
.wa i{width:46px;height:46px;border-radius:50%;background:#25d366;display:grid;place-items:center;flex-shrink:0}
.wa i svg{width:28px;height:28px;fill:#fff}
`;
const WAICON = '<svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.1-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.9s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .5l-.3.5-.4.4c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.3 2.4 1.5.3.1.5.1.6-.1l.9-1.1c.2-.3.4-.2.6-.1l1.9.9c.3.1.5.2.5.3.1.2.1.7-.1 1.3z"/></svg>';
const photo = (ej, style, label = 'Tu foto aquí') =>
  `<div class="photo ${ej ? 'ej' : ''}" style="${style}">${ej ? `<div class="ph">${LINES('#fff', .9, 14)}${label}</div>` : ''}</div>`;

const EJ = { titulo: 'Apartamento en Cedritos', datos: '72 m²  ·  3 hab.  ·  2 baños  ·  1 parq.', precio: '$420.000.000', ciudad: 'Bogotá' };

const T = {
  // ---------- Post 1080x1080: inmueble en venta ----------
  'post-inmueble': (ej) => [1080, 1080, `
    ${photo(ej, 'left:0;top:0;width:1080px;height:700px')}
    <div style="position:absolute;left:56px;top:52px"><span class="pill">EN VENTA</span></div>
    <div style="position:absolute;left:0;top:700px;width:1080px;height:300px;background:#fff;padding:44px 56px;display:flex;justify-content:space-between;align-items:flex-end;gap:30px">
      <div style="display:grid;gap:10px">${ej ? `
        <h2 style="font:600 50px/1.1 Jost">${EJ.titulo}</h2>
        <p style="font:600 28px Nunito;color:var(--gray)">${EJ.datos}</p>
        <p style="font:700 66px/1 Jost;color:var(--red);margin-top:10px">${EJ.precio}</p>` : ''}
      </div>
      <div class="logo" style="width:250px;flex-shrink:0">${LOGO}</div>
    </div>
    <div style="position:absolute;left:0;bottom:0;width:1080px;height:80px;background:var(--red);color:#fff;display:flex;align-items:center;justify-content:space-between;padding:0 56px;font:600 28px Jost">
      <span class="wa"><i>${WAICON}</i>${WA}</span><span style="font-weight:500;letter-spacing:.04em">${ZONA}</span></div>`],

  // ---------- Post 1080x1080: captación ----------
  'post-vende-tu-inmueble': () => [1080, 1080, `
    <div style="position:absolute;inset:0;background:var(--red)"></div>
    <div style="position:absolute;right:-160px;bottom:-70px;width:880px">${LINES('#fff', .11, 12)}</div>
    <div style="position:absolute;inset:0;padding:80px 80px 70px;display:flex;flex-direction:column;color:#fff">
      <div class="logo" style="width:300px">${LOGO_WR}</div>
      <h1 style="font:700 96px/1.02 Jost;margin-top:90px;letter-spacing:-.01em">¿Quieres vender tu inmueble?</h1>
      <p style="font:600 34px/1.4 Nunito;margin-top:34px;max-width:820px;opacity:.95">Lo evaluamos sin costo, lo publicamos y lo promocionamos hasta encontrar al comprador.</p>
      <div style="margin-top:auto;display:flex;align-items:center;gap:22px;background:#fff;color:var(--red);border-radius:999px;padding:22px 36px;align-self:flex-start;font:700 36px Jost">
        <span class="wa"><i>${WAICON}</i>Escríbenos ${WA}</span></div>
      <p style="font:500 26px Jost;letter-spacing:.12em;text-transform:uppercase;margin-top:28px;opacity:.85">${ZONA}</p>
    </div>`],

  // ---------- Post 1080x1080: remodelaciones antes / después ----------
  'post-remodelacion': (ej) => [1080, 1080, `
    <div style="position:absolute;inset:0;background:#1f1f1f"></div>
    <div style="position:absolute;left:70px;top:64px;right:70px;display:flex;justify-content:space-between;align-items:center">
      <div class="logo" style="width:240px">${LOGO_W}</div>
      <span style="font:500 24px Jost;letter-spacing:.16em;color:#bdbdbb">REMODELACIONES</span></div>
    <h1 style="position:absolute;left:70px;top:175px;font:700 78px/1.05 Jost;color:#fff">Transformamos tu espacio</h1>
    ${photo(ej, 'left:70px;top:330px;width:460px;height:560px;border-radius:18px', 'Antes')}
    ${photo(ej, 'left:550px;top:330px;width:460px;height:560px;border-radius:18px', 'Después')}
    <span class="pill" style="position:absolute;left:94px;top:354px;background:#2b2b2b;font-size:24px">ANTES</span>
    <span class="pill" style="position:absolute;left:574px;top:354px;font-size:24px">DESPUÉS</span>
    <div style="position:absolute;left:70px;right:70px;bottom:70px;display:flex;justify-content:space-between;align-items:center;gap:30px;color:#fff;font:600 30px Jost">
      <span style="font-size:26px;color:#d6d6d4">Cocinas · Baños · Pisos · Espacios completos</span><span class="wa"><i>${WAICON}</i>${WA}</span></div>`],

  // ---------- Historia 1080x1920: inmueble ----------
  'historia-inmueble': (ej) => [1080, 1920, `
    <div style="position:absolute;left:0;right:0;top:1180px;bottom:0;background:#fff"></div>
    ${photo(ej, 'left:0;top:0;width:1080px;height:1180px')}
    <div style="position:absolute;left:0;right:0;top:0;height:300px;background:linear-gradient(rgba(0,0,0,.35),transparent)"></div>
    <div class="logo" style="position:absolute;left:70px;top:150px;width:300px">${LOGO_W}</div>
    <div style="position:absolute;left:70px;top:1090px"><span class="pill">EN VENTA</span></div>
    <div style="position:absolute;left:70px;right:70px;top:1230px;display:grid;gap:16px">${ej ? `
      <h2 style="font:600 64px/1.1 Jost">${EJ.titulo}</h2>
      <p style="font:600 34px Nunito;color:var(--gray)">${EJ.datos}</p>
      <p style="font:700 88px/1 Jost;color:var(--red);margin-top:14px">${EJ.precio}</p>` : ''}</div>
    <div style="position:absolute;left:70px;right:70px;bottom:260px;background:var(--red);color:#fff;border-radius:999px;padding:28px 40px;display:flex;justify-content:center;font:700 38px Jost">
      <span class="wa"><i>${WAICON}</i>Escríbenos ${WA}</span></div>`],

  // ---------- Historia 1080x1920: captación ----------
  'historia-vende-tu-inmueble': () => [1080, 1920, `
    <div style="position:absolute;inset:0;background:var(--red)"></div>
    <div style="position:absolute;left:180px;bottom:-60px;width:1100px">${LINES('#fff', .09, 11)}</div>
    <div style="position:absolute;inset:0;padding:260px 80px 260px;display:flex;flex-direction:column;color:#fff">
      <div class="logo" style="width:360px">${LOGO_WR}</div>
      <h1 style="font:700 118px/1.02 Jost;margin-top:120px">¿Quieres vender tu inmueble?</h1>
      <p style="font:600 40px/1.45 Nunito;margin-top:44px;opacity:.95">Lo evaluamos sin costo, lo publicamos y lo promocionamos hasta encontrar al comprador.</p>
      <ul style="list-style:none;margin-top:50px;display:grid;gap:22px;font:600 38px Jost">
        <li>✓ Avalúo comercial sin costo</li><li>✓ Fotos y publicación profesional</li><li>✓ Acompañamiento hasta la firma</li></ul>
      <div style="margin-top:auto;background:#fff;color:var(--red);border-radius:999px;padding:28px 40px;display:flex;justify-content:center;font:700 40px Jost">
        <span class="wa"><i>${WAICON}</i>${WA}</span></div>
      <p style="font:500 28px Jost;letter-spacing:.12em;text-transform:uppercase;margin-top:30px;text-align:center;opacity:.85">${ZONA}</p>
    </div>`],

  // ---------- Anuncio horizontal 1200x628 (Facebook / Google) ----------
  'anuncio-horizontal': (ej) => [1200, 628, `
    <div style="position:absolute;left:0;top:0;width:640px;height:628px;background:#fff"></div>
    ${photo(ej, 'right:0;top:0;width:560px;height:628px')}
    <div style="position:absolute;left:0;top:0;width:640px;height:628px;padding:56px 56px 50px;display:flex;flex-direction:column;border-left:14px solid var(--red)">
      <div class="logo" style="width:250px">${LOGO}</div>
      <h1 style="font:700 62px/1.05 Jost;margin-top:48px">Encuentra tu próximo inmueble</h1>
      <p style="font:600 26px/1.4 Nunito;color:var(--gray);margin-top:20px">Apartamentos, casas y lotes en ${ZONA.toLowerCase().replace('bogotá','Bogotá')}.</p>
      <div style="margin-top:auto;align-self:flex-start;background:var(--red);color:#fff;border-radius:999px;padding:18px 30px;font:700 28px Jost"><span class="wa"><i style="width:38px;height:38px">${WAICON}</i>${WA}</span></div>
    </div>`],

  // ---------- Portada de Facebook 1640x624 ----------
  'portada-facebook': () => [1640, 624, `
    <div style="position:absolute;inset:0;background:#fff"></div>
    <div style="position:absolute;right:40px;bottom:10px;width:520px">${LINES('#950606', .07, 10)}</div>
    <div style="position:absolute;left:0;right:0;bottom:0;height:22px;background:var(--red)"></div>
    <div style="position:absolute;left:330px;right:520px;top:0;bottom:22px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:34px;text-align:center">
      <div class="logo" style="width:520px">${LOGO}</div>
      <p style="font:500 30px Jost;letter-spacing:.14em;text-transform:uppercase;color:var(--gray)">Captación · Venta · Remodelación</p>
    </div>`],

  // ---------- Foto de perfil 1080x1080 (redes y WhatsApp) ----------
  'foto-perfil': () => [1080, 1080, `
    <div style="position:absolute;inset:0;background:var(--red)"></div>
    <div style="position:absolute;left:190px;top:330px;width:700px">${LINES('#fff', 1, 26, '#b83a3a')}</div>`],
  'foto-perfil-blanca': () => [1080, 1080, `
    <div style="position:absolute;inset:0;background:#fff"></div>
    <div style="position:absolute;left:140px;top:250px;width:800px">${svg('amara-home-vertical').replace('<svg ', '<svg style="width:100%;height:auto" ')}</div>`],
};

const LOGOS = [
  ['amara-home-horizontal', 3000], ['amara-home-horizontal-blanco', 3000], ['amara-home-horizontal-negro', 3000],
  ['amara-home-vertical', 2000], ['amara-home-vertical-blanco', 2000],
  ['amara-home-icono', 2048], ['amara-home-icono-rojo', 2048],
];

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  const dirs = ['1-logos/png', '1-logos/svg', '1-logos/pdf', '2-perfil-y-portada', '3-pautas/listas-para-usar', '3-pautas/plantillas-con-espacio-para-foto'];
  dirs.forEach((d) => fs.mkdirSync(path.join(OUT, d), { recursive: true }));

  // Logos: PNG alta resolución (transparente), SVG y PDF vectorial
  for (const [n, w] of LOGOS) {
    const s = svg(n); const vb = s.match(/viewBox="([^"]+)"/)[1].split(' ').map(Number); const h = Math.round(w * vb[3] / vb[2]);
    const html = `<html><head><style>html,body{margin:0;background:transparent}</style></head><body>${s.replace('<svg ', `<svg width="${w}" height="${h}" `)}</body></html>`;
    await p.setViewportSize({ width: w, height: h }); await p.setContent(html);
    await p.screenshot({ path: `${OUT}/1-logos/png/${n}.png`, omitBackground: true, clip: { x: 0, y: 0, width: w, height: h } });
    fs.copyFileSync(M + n + '.svg', `${OUT}/1-logos/svg/${n}.svg`);
    const pw = 800, ph = Math.round(pw * vb[3] / vb[2]);
    await p.setContent(`<html><head><style>@page{size:${pw}px ${ph}px;margin:0}html,body{margin:0}</style></head><body>${s.replace('<svg ', `<svg width="${pw}" height="${ph}" `)}</body></html>`);
    await p.pdf({ path: `${OUT}/1-logos/pdf/${n}.pdf`, width: pw + 'px', height: ph + 'px', printBackground: true, pageRanges: '1' });
  }

  const render = async (file, [w, h, body], transparent) => {
    await p.setViewportSize({ width: w, height: h });
    await p.setContent(`<html><head><style>${base}</style></head><body><div class="page" style="width:${w}px;height:${h}px">${body}</div></body></html>`);
    await p.evaluate(() => document.fonts.ready);
    await p.waitForTimeout(150);
    await p.screenshot({ path: file, omitBackground: !!transparent, clip: { x: 0, y: 0, width: w, height: h } });
  };
  for (const n of ['foto-perfil', 'foto-perfil-blanca', 'portada-facebook']) await render(`${OUT}/2-perfil-y-portada/${n}.png`, T[n]());
  for (const n of ['post-inmueble', 'post-vende-tu-inmueble', 'post-remodelacion', 'historia-inmueble', 'historia-vende-tu-inmueble', 'anuncio-horizontal'])
    await render(`${OUT}/3-pautas/listas-para-usar/${n}.png`, T[n](true));
  for (const n of ['post-inmueble', 'post-remodelacion', 'historia-inmueble', 'anuncio-horizontal'])
    await render(`${OUT}/3-pautas/plantillas-con-espacio-para-foto/${n}-plantilla.png`, T[n](false), true);
  // fuentes usadas
  console.log('fonts', await p.evaluate(() => [...document.fonts].filter(f => f.status === 'loaded').map(f => f.family + f.weight).join(',')));
  await b.close();
})();
