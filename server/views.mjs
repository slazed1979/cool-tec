// HTML-Vorlagen der Webseite. Alle Texte kommen aus dem CMS (server/data.mjs).
import { icon } from './icons.mjs';

export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const tel = (s) => 'tel:' + String(s || '').replace(/[^\d+]/g, '');
const nl2br = (s) => esc(s).replace(/\n/g, '<br>');
/** Text aus dem Text-Editor des CMS (HTML von Redakteuren) – Skripte und Event-Handler werden entfernt */
export const rich = (h) =>
  String(h || '')
    .replace(/<\s*(script|style|iframe|object|embed)[\s\S]*?<\s*\/\s*\1\s*>/gi, '')
    .replace(/<\s*(script|iframe|object|embed)[^>]*>/gi, '')
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/(href|src)\s*=\s*(["'])\s*javascript:[^"']*\2/gi, '$1="#"');
const img = (src, alt, attrs = '') => (src ? `<img src="${esc(src)}" alt="${esc(alt)}" ${attrs}>` : '');
const btn = (b, cls = '') => (b?.label && b?.href ? `<a class="btn ${cls}" href="${esc(b.href)}">${esc(b.label)}${icon('arrow', '', 18)}</a>` : '');
const head = (eyebrow, title, text, cls = '') => `
  <div class="sec-head ${cls}">
    ${eyebrow ? `<p class="eyebrow">${esc(eyebrow)}</p>` : ''}
    ${title ? `<h2>${esc(title)}</h2>` : ''}
    ${text ? `<p class="lead">${nl2br(text)}</p>` : ''}
  </div>`;

// ------------------------------------------------------------------ Grundgerüst
export function layout(ctx, { title, description, active, body, image }) {
  const s = ctx.site;
  const nav = (s.nav || []).filter((n) => n?.label);
  const isActive = (href) => href === active;
  const pageTitle = title ? `${title} · ${s.name || ''}` : s.seoTitle || s.name || '';
  const year = new Date().getFullYear();
  return `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(pageTitle)}</title>
<meta name="description" content="${esc(description || s.seoDescription || '')}">
${s.noindex !== false ? '<meta name="robots" content="noindex, nofollow">' : ''}
<meta property="og:title" content="${esc(pageTitle)}">
<meta property="og:description" content="${esc(description || s.seoDescription || '')}">
${image || ctx.data.home.hero?.image ? `<meta property="og:image" content="${esc(image || ctx.data.home.hero?.image)}">` : ''}
<meta name="theme-color" content="#0d2a42">
<link rel="icon" href="/brand/favicon.png">
<link rel="preload" href="/fonts/manrope-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/css/site.css?v=${ctx.version}">
<script src="/js/site.js?v=${ctx.version}" defer></script>
</head>
<body>
<a class="skip" href="#inhalt">Zum Inhalt springen</a>
<div class="topbar">
  <div class="wrap topbar-in">
    ${s.hoursTop ? `<span class="tb-item tb-hours">${icon('clock', '', 16)}<span>${esc(s.hoursTop)}</span></span>` : ''}
    ${s.phone ? `<a class="tb-item" href="${tel(s.phone)}">${icon('phone', '', 16)}<span>${esc(s.phone)}</span></a>` : ''}
    ${s.email ? `<a class="tb-item" href="mailto:${esc(s.email)}">${icon('mail', '', 16)}<span>${esc(s.email)}</span></a>` : ''}
  </div>
</div>
<header class="header">
  <div class="wrap header-in">
    <a class="brand" href="/" aria-label="${esc(s.name)} – Startseite">${img(s.logo, s.logoAlt || s.name, 'width="320" height="87"')}</a>
    <button class="burger" type="button" aria-expanded="false" aria-controls="hauptmenu" aria-label="Menü öffnen">${icon('menu')}${icon('close')}</button>
    <nav id="hauptmenu" class="nav" aria-label="Hauptmenü">
      <ul>
        ${nav.map((n) => `<li><a href="${esc(n.href)}"${isActive(n.href) ? ' class="on" aria-current="page"' : ''}>${esc(n.label)}</a></li>`).join('')}
      </ul>
      ${s.ctaLabel ? `<a class="btn btn-green nav-cta" href="${esc(s.ctaHref || '/#kontakt')}">${esc(s.ctaLabel)}</a>` : ''}
    </nav>
  </div>
</header>
<main id="inhalt">
${body}
</main>
<footer class="footer">
  <div class="wrap footer-grid">
    <div class="f-col f-brand">
      <div class="f-logo">${img(s.logo, s.logoAlt || s.name, 'width="320" height="87" loading="lazy"')}</div>
      ${s.footerText ? `<p>${nl2br(s.footerText)}</p>` : ''}
    </div>
    <div class="f-col">
      <h3>Kontakt</h3>
      <ul class="f-list">
        ${s.street || s.city ? `<li>${icon('pin', '', 18)}<span>${esc(s.legalName || s.name)}<br>${esc(s.street)}<br>${esc(s.city)}${s.country ? '<br>' + esc(s.country) : ''}</span></li>` : ''}
        ${s.phone ? `<li>${icon('phone', '', 18)}<a href="${tel(s.phone)}">${esc(s.phone)}</a></li>` : ''}
        ${s.email ? `<li>${icon('mail', '', 18)}<a href="mailto:${esc(s.email)}">${esc(s.email)}</a></li>` : ''}
      </ul>
    </div>
    <div class="f-col">
      <h3>Öffnungszeiten</h3>
      <dl class="f-hours">
        ${(s.hours || []).map((h) => `<div><dt>${esc(h.days)}</dt><dd>${esc(h.time)}</dd></div>`).join('')}
      </dl>
      ${s.emergencyPhone ? `<p class="f-emergency">${icon('clock', '', 18)}<span>Notdienst:<br><a href="${tel(s.emergencyPhone)}">${esc(s.emergencyPhone)}</a></span></p>` : ''}
    </div>
    <div class="f-col">
      <h3>Seiten</h3>
      <ul class="f-links">
        ${nav.map((n) => `<li><a href="${esc(n.href)}">${esc(n.label)}</a></li>`).join('')}
        ${(s.footerLinks || []).filter((n) => n?.label).map((n) => `<li><a href="${esc(n.href)}">${esc(n.label)}</a></li>`).join('')}
      </ul>
    </div>
  </div>
  <div class="footer-bottom"><div class="wrap">© ${year} ${esc(s.legalName || s.name)}</div></div>
</footer>
</body>
</html>`;
}

// ------------------------------------------------------------------ Bausteine
function projectCard(p, headingLevel = 3) {
  const h = `h${headingLevel}`;
  return `<article class="card project-card" data-cat="${esc(p.category)}">
    <a class="card-link" href="/projekte/${esc(p.id)}">
      <div class="card-img">${img(p.image, p.imageAlt || p.title, 'loading="lazy" width="600" height="338"')}${p.category ? `<span class="tag">${esc(p.category)}</span>` : ''}</div>
      <div class="card-body">
        <p class="meta">${icon('pin', '', 16)}<span>${esc(p.location)}${p.year ? ' · ' + esc(p.year) : ''}</span></p>
        <${h}>${esc(p.title)}</${h}>
        ${p.summary ? `<p>${esc(p.summary)}</p>` : ''}
        <span class="more">Projekt ansehen ${icon('arrow', '', 18)}</span>
      </div>
    </a>
  </article>`;
}

function contactSection(ctx, c = {}) {
  const s = ctx.site;
  const sent = ctx.sent;
  return `<section class="section contact" id="kontakt">
    <div class="wrap contact-grid">
      <div class="contact-info">
        ${head(c.eyebrow, c.title, c.text)}
        <ul class="contact-list">
          ${s.phone ? `<li><span class="ci">${icon('phone')}</span><div><strong>Telefon</strong><a href="${tel(s.phone)}">${esc(s.phone)}</a></div></li>` : ''}
          ${s.email ? `<li><span class="ci">${icon('mail')}</span><div><strong>E-Mail</strong><a href="mailto:${esc(s.email)}">${esc(s.email)}</a></div></li>` : ''}
          ${s.street ? `<li><span class="ci">${icon('pin')}</span><div><strong>Adresse</strong><span>${esc(s.street)}, ${esc(s.city)}</span></div></li>` : ''}
          ${s.emergencyPhone ? `<li><span class="ci">${icon('clock')}</span><div><strong>24/7-Notdienst</strong><a href="${tel(s.emergencyPhone)}">${esc(s.emergencyPhone)}</a></div></li>` : ''}
        </ul>
      </div>
      ${c.showForm === false ? '' : `<form class="form card" method="post" action="/kontakt">
        <input type="hidden" name="back" value="${esc(ctx.path || '/')}">
        ${sent === 'ok' ? `<p class="notice ok" role="status">${icon('check', '', 20)}<span><strong>Vielen Dank!</strong> Ihre Nachricht ist angekommen. Wir melden uns so schnell wie möglich.</span></p>` : ''}
        ${sent === 'err' ? `<p class="notice err" role="alert"><strong>Das hat leider nicht geklappt.</strong> Bitte prüfen Sie Ihre Angaben oder schreiben Sie direkt an ${esc(s.email)}.</p>` : ''}
        <div class="form-row">
          <label>Name *<input name="name" required maxlength="200" autocomplete="name"></label>
          <label>E-Mail *<input name="email" type="email" required maxlength="200" autocomplete="email"></label>
        </div>
        <div class="form-row">
          <label>Telefon<input name="phone" type="tel" maxlength="60" autocomplete="tel"></label>
          <label>Betreff<input name="subject" maxlength="200" placeholder="z. B. Klimaanlage für Wohnung"></label>
        </div>
        <label>Nachricht *<textarea name="message" required rows="5" maxlength="5000"></textarea></label>
        <label class="hp" aria-hidden="true">Bitte leer lassen<input name="website" tabindex="-1" autocomplete="off"></label>
        <p class="small">Mit dem Absenden stimmen Sie zu, dass wir Ihre Angaben zur Bearbeitung der Anfrage speichern. <a href="/datenschutz">Datenschutz</a></p>
        <button class="btn" type="submit">Nachricht senden ${icon('arrow', '', 18)}</button>
      </form>`}
    </div>
  </section>`;
}

const pageHero = (p, fallbackTitle) => `<section class="page-hero"${p.image ? ` style="--bg:url('${esc(p.image)}')"` : ''}>
  <div class="wrap">
    ${p.eyebrow ? `<p class="eyebrow">${esc(p.eyebrow)}</p>` : ''}
    <h1>${esc(p.title || fallbackTitle)}</h1>
    ${p.text ? `<p class="lead">${nl2br(p.text)}</p>` : ''}
  </div>
</section>`;

// ------------------------------------------------------------------ Seiten
export function home(ctx) {
  const { home: h, projects, partners } = ctx.data;
  const hero = h.hero || {};
  const about = h.about || {};
  const featured = [...projects.filter((p) => p.featured), ...projects.filter((p) => !p.featured)].slice(0, Number(h.projects?.count) || 3);
  const body = `
<section class="hero"${hero.image ? ` style="--bg:url('${esc(hero.image)}')"` : ''}>
  <div class="wrap hero-in">
    ${hero.eyebrow ? `<p class="eyebrow">${esc(hero.eyebrow)}</p>` : ''}
    <h1>${esc(hero.title)}</h1>
    ${hero.text ? `<p class="lead">${nl2br(hero.text)}</p>` : ''}
    <div class="btns">${btn(hero.button1)}${btn(hero.button2, 'btn-light')}</div>
  </div>
</section>

${(h.stats || []).length ? `<section class="stats-band" aria-label="Zahlen"><div class="wrap stats">
  ${h.stats.map((x) => `<div class="stat"><strong>${esc(x.value)}</strong><span>${esc(x.label)}</span></div>`).join('')}
</div></section>` : ''}

<section class="section about">
  <div class="wrap about-grid">
    <div class="about-text">
      ${head(about.eyebrow, about.title)}
      <div class="rich">${rich(about.html)}</div>
      ${(about.points || []).length ? `<ul class="checks">${about.points.map((x) => `<li>${icon('check', '', 20)}<span>${esc(x)}</span></li>`).join('')}</ul>` : ''}
    </div>
    ${about.image ? `<div class="about-img">${img(about.image, about.imageAlt, 'loading="lazy" width="800" height="450"')}</div>` : ''}
  </div>
</section>

${(h.services?.items || []).length ? `<section class="section tint services">
  <div class="wrap">
    ${head(h.services.eyebrow, h.services.title, h.services.text, 'center')}
    <div class="grid-3">
      ${h.services.items.map((x) => `<article class="card service"><span class="svc-ic">${icon(x.icon)}</span><h3>${esc(x.title)}</h3><p>${esc(x.text)}</p></article>`).join('')}
    </div>
  </div>
</section>` : ''}

${featured.length && h.projects?.hidden !== true ? `<section class="section">
  <div class="wrap">
    <div class="head-row">${head(h.projects?.eyebrow, h.projects?.title, h.projects?.text)}<a class="btn btn-outline" href="/projekte">${esc(h.projects?.button || 'Alle Projekte')}${icon('arrow', '', 18)}</a></div>
    <div class="grid-3">${featured.map((p) => projectCard(p)).join('')}</div>
  </div>
</section>` : ''}

${partners.length && h.partners?.hidden !== true ? `<section class="section tint partners-strip">
  <div class="wrap">
    <div class="head-row">${head(h.partners?.eyebrow, h.partners?.title)}<a class="btn btn-outline" href="/partner">${esc(h.partners?.button || 'Alle Partner')}${icon('arrow', '', 18)}</a></div>
    <ul class="logo-row">${partners.map((p) => `<li><a href="/partner#${esc(p.id)}" title="${esc(p.name)}">${img(p.logo, p.name, 'loading="lazy" width="300" height="80"')}</a></li>`).join('')}</ul>
  </div>
</section>` : ''}

${contactSection(ctx, h.contact)}`;
  return layout(ctx, { active: '/', body });
}

export function projectList(ctx) {
  const { projectsPage: pp, projects } = ctx.data;
  const cats = (pp.categories || []).filter((c) => projects.some((p) => p.category === c));
  const sel = cats.includes(ctx.cat) ? ctx.cat : '';
  const body = `
${pageHero(pp, 'Projekte')}
<section class="section">
  <div class="wrap">
    ${cats.length > 1 ? `<nav class="filters" aria-label="Nach Bereich filtern">
      <a href="/projekte" class="chip${sel ? '' : ' on'}" data-filter=""${sel ? '' : ' aria-current="true"'}>Alle <span>${projects.length}</span></a>
      ${cats.map((c) => `<a href="/projekte?bereich=${encodeURIComponent(c)}" class="chip${sel === c ? ' on' : ''}" data-filter="${esc(c)}"${sel === c ? ' aria-current="true"' : ''}>${esc(c)} <span>${projects.filter((p) => p.category === c).length}</span></a>`).join('')}
    </nav>` : ''}
    <div class="grid-3 project-grid">
      ${projects.map((p) => projectCard(p, 2).replace('<article class="card', `<article${sel && p.category !== sel ? ' hidden' : ''} class="card`)).join('')}
    </div>
    ${projects.length ? '' : '<p class="empty">Hier erscheinen bald unsere Projekte.</p>'}
  </div>
</section>
${contactSection(ctx, { eyebrow: 'Ihr Projekt', title: 'Sie planen etwas Ähnliches?', text: 'Erzählen Sie uns von Ihrem Vorhaben – wir beraten Sie gerne unverbindlich.' })}`;
  return layout(ctx, { title: pp.title || 'Projekte', description: pp.text, active: '/projekte', body, image: pp.image });
}

export function projectDetail(ctx, p) {
  const { projects } = ctx.data;
  const i = projects.indexOf(p);
  const others = projects.filter((x) => x !== p).slice(0, 3);
  const facts = [
    ['Bereich', p.category],
    ['Ort', p.location],
    ['Jahr', p.year],
    ['Objekt', p.customer],
    ['Leistung', p.service],
  ].filter((f) => f[1]);
  const gallery = (p.images || []).filter((x) => x?.src);
  const body = `
<section class="detail-head">
  <div class="wrap">
    <a class="back" href="/projekte">${icon('back', '', 18)} Alle Projekte</a>
    ${p.category ? `<p class="eyebrow">${esc(p.category)}</p>` : ''}
    <h1>${esc(p.title)}</h1>
    ${p.summary ? `<p class="lead">${esc(p.summary)}</p>` : ''}
  </div>
</section>
<section class="section detail">
  <div class="wrap detail-grid">
    <div class="detail-main">
      ${p.image ? `<figure class="detail-img">${img(p.image, p.imageAlt || p.title, 'width="1200" height="675"')}</figure>` : ''}
      <div class="rich">${rich(p.html)}</div>
      ${gallery.length ? `<div class="gallery">${gallery.map((g) => `<a href="${esc(g.src)}" target="_blank" rel="noopener">${img(g.src, g.alt || p.title, 'loading="lazy"')}</a>`).join('')}</div>` : ''}
    </div>
    <aside class="facts card">
      <h2>Auf einen Blick</h2>
      <dl>${facts.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
      <a class="btn btn-green" href="#kontakt">Ähnliches Projekt anfragen</a>
    </aside>
  </div>
  <div class="wrap pager">
    ${i > 0 ? `<a href="/projekte/${esc(projects[i - 1].id)}">${icon('back', '', 18)} ${esc(projects[i - 1].title)}</a>` : '<span></span>'}
    ${i < projects.length - 1 ? `<a href="/projekte/${esc(projects[i + 1].id)}">${esc(projects[i + 1].title)} ${icon('arrow', '', 18)}</a>` : ''}
  </div>
</section>
${others.length ? `<section class="section tint"><div class="wrap">${head('', 'Weitere Projekte')}<div class="grid-3">${others.map((x) => projectCard(x)).join('')}</div></div></section>` : ''}
${contactSection(ctx, { eyebrow: 'Ihr Projekt', title: 'Sie planen etwas Ähnliches?', text: 'Wir beraten Sie gerne unverbindlich.' })}`;
  return layout(ctx, { title: p.title, description: p.summary, active: '/projekte', body, image: p.image });
}

export function partnerList(ctx) {
  const { partnersPage: pp, partners } = ctx.data;
  const groups = [...new Set(partners.map((p) => p.category || 'Partner'))];
  const body = `
${pageHero(pp, 'Partner')}
<section class="section">
  <div class="wrap">
    ${groups.map((g) => `<div class="partner-group">
      ${groups.length > 1 ? `<h2 class="group-title">${esc(g)}</h2>` : ''}
      <div class="grid-3">
        ${partners.filter((p) => (p.category || 'Partner') === g).map((p) => `<article class="card partner" id="${esc(p.id)}">
          <div class="partner-logo">${img(p.logo, p.name, 'loading="lazy" width="300" height="80"')}</div>
          <h3>${esc(p.name)}</h3>
          ${p.text ? `<p>${esc(p.text)}</p>` : ''}
          <div class="partner-foot">
            ${p.since ? `<span class="since">${icon('calendar', '', 16)} Partner seit ${esc(p.since)}</span>` : '<span></span>'}
            ${p.url ? `<a href="${esc(p.url)}" target="_blank" rel="noopener">Webseite ${icon('link', '', 16)}</a>` : ''}
          </div>
        </article>`).join('')}
      </div>
    </div>`).join('')}
    ${partners.length ? '' : '<p class="empty">Hier erscheinen bald unsere Partner.</p>'}
    ${pp.outro ? `<div class="rich outro card">${rich(pp.outro)}</div>` : ''}
  </div>
</section>
${contactSection(ctx, { eyebrow: 'Kontakt', title: 'Partner werden', text: 'Schreiben Sie uns – wir freuen uns auf das Gespräch.' })}`;
  return layout(ctx, { title: pp.title || 'Partner', description: pp.text, active: '/partner', body, image: pp.image });
}

export function page(ctx, p) {
  const body = `
<section class="detail-head"><div class="wrap"><h1>${esc(p.title)}</h1></div></section>
<section class="section"><div class="wrap narrow rich">${rich(p.html)}</div></section>`;
  return layout(ctx, { title: p.title, active: p.path, body });
}

export function notFound(ctx) {
  const body = `
<section class="detail-head"><div class="wrap"><p class="eyebrow">Fehler 404</p><h1>Diese Seite gibt es nicht.</h1><p class="lead">Vielleicht wurde sie verschoben. Hier geht es weiter:</p>
<div class="btns"><a class="btn" href="/">Zur Startseite ${icon('arrow', '', 18)}</a><a class="btn btn-outline" href="/projekte">Projekte</a></div></div></section>`;
  return layout(ctx, { title: 'Seite nicht gefunden', body });
}
