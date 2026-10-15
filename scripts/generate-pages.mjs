import fs from 'node:fs';
import path from 'node:path';
import { companies, topics } from '../src/site-content.js';
import { pageEnrichment } from '../src/page-enrichment.js';

// Keep the first render fully styled even if CSS requests fail or a live update removes injected styles.
const embeddedStyles = ['site.css', 'responsive.css', 'gold.css', 'navigation.css']
  .map(file => fs.readFileSync(new URL(`../src/${file}`, import.meta.url), 'utf8')).join('\n');

const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const arrow = '<span aria-hidden="true">↗</span>';
const link = (href, text, cls = 'action') => `<a class="${cls}" href="${escape(href)}">${text}${arrow}</a>`;
const contactLink = company => `/contact/?topic=${encodeURIComponent(company.topic)}`;
const logo = company => `<img class="company-logo ${company.category === 'technology' ? 'invert-logo' : ''}" src="/brand/${company.logo}" alt="${company.name} logo" width="210" height="150" />`;
const brand = `<a class="brand" href="/" aria-label="Dark Consolidated home"><img src="/brand/dark-transparent.png" alt="Dark Consolidated" width="216" height="73" /></a>`;
const navigation = [['/', 'Home'], ['/about/', 'The group'], ['/portfolio/', 'Our portfolio'], ['/approach/', 'Our approach'], ['/contact/', 'Contact']];
const navLinks = active => navigation.map(([url, name], i) => `<a href="${url}" ${active === url ? 'aria-current="page"' : ''}><span class="nav-index">0${i + 1}</span>${name}<span class="nav-arrow" aria-hidden="true">↗</span></a>`).join('');
const top = (eyebrow, title, intro) => `<div class="page-intro"><p class="eyebrow">${eyebrow}</p><h1>${title}</h1><p class="intro-text">${intro}</p></div>`;
const cta = (title = 'Let’s build what’s next.') => `<aside class="page-cta"><h2>${title}</h2>${link('/contact/', 'Start a conversation')}</aside>`;
const card = c => `<article class="company-card theme-${c.theme}" data-category="${c.category}"><div class="card-meta"><span>${c.number} / ${c.sector}</span><span class="status">${c.status}</span></div><a class="company-card-link" href="/companies/${c.slug}/">${logo(c)}<h2>${c.name}${arrow}</h2><p>${c.intro}</p><span class="card-link-label">Explore company <span aria-hidden="true">↗</span></span></a></article>`;
const pages = [];
function add(route, title, description, body, type = '') { pages.push({route,title,description,body,type}); }

add('/', 'Built for what comes next', 'Dark Consolidated Ltd. An independent UK holding group building across technology, security, digital media, and new markets.', `
<section class="home-hero"><canvas id="landscape" aria-hidden="true"></canvas><div class="hero-shade"></div><div class="hero-topline"><span>INDEPENDENT VISION. COLLECTIVE STRENGTH.</span><span>UK / GLOBAL AMBITION</span></div><div class="home-message"><p class="eyebrow">DARK CONSOLIDATED LTD</p><h1>BUILD<br />WHAT’S <span>NEXT.</span></h1><div class="hero-summary"><p>Independent businesses.<br />Extraordinary possibilities.</p>${link('/portfolio/', 'Explore our companies', 'action action-filled')}</div></div><div class="hero-bottom"><span>CAPITAL. STRATEGY. SHARED AMBITION.</span><button id="motion-toggle" aria-pressed="false" aria-label="Pause background animation">Pause motion <span aria-hidden="true">Ⅱ</span></button></div></section>
<nav class="home-paths" aria-label="Explore the group"><a href="/about/"><span>01 / THE GROUP</span><h2>Independent by design.</h2>${arrow}</a><a href="/portfolio/"><span>02 / OUR COMPANIES</span><h2>Different strengths. Shared direction.</h2>${arrow}</a><a href="/approach/"><span>03 / OUR APPROACH</span><h2>Long-term thinking. Real action.</h2>${arrow}</a></nav>`, 'home');

add('/about/', 'The group', 'Meet Dark Consolidated Ltd, an independent UK holding group built on capital, operational strategy, and shared governance.', `
${top('01 / THE GROUP', 'INDEPENDENT<br />BY DESIGN.<br /><span>STRONGER TOGETHER.</span>', 'We give ambitious businesses the freedom to move. And the foundation to go further.')}
<section class="editorial-grid"><p class="eyebrow">ONE GROUP. A WIDER HORIZON.</p><div><h2>Opportunity needs<br />a strong foundation.</h2><p>Dark Consolidated Ltd is an independent parent holding group headquartered in the United Kingdom. We establish, acquire, and scale high-growth operations across digital media, content production, and enterprise technology.</p><p>By bringing capital, operational strategy, and governance under a unified umbrella, we enable our companies to execute with autonomy while benefiting from group-level infrastructure.</p><p>Our focus is sustainable corporate growth, digital asset management, and strategic acquisitions. With the proposed acquisition of Blue Water Spices, we are also exploring new markets shaped by authentic heritage and quality.</p></div></section>
<section class="principle-grid" aria-label="Our principles"><article><span>01</span><h3>Built to last.</h3><p>Sustainable growth and a long-term perspective on value.</p></article><article><span>02</span><h3>Free to lead.</h3><p>Independent teams with the support of shared foundations.</p></article><article><span>03</span><h3>Looking ahead.</h3><p>Investing where the next chapter takes shape.</p></article></section>${cta()}`);

add('/portfolio/', 'Our portfolio', 'Explore Protocol Tomorrow, Fugly Media, and the proposed acquisition of Blue Water Spices.', `
${top('02 / OUR PORTFOLIO', 'DIFFERENT STRENGTHS.<br /><span>SHARED DIRECTION.</span>', 'Focused expertise. Independent identities. A collective ambition to build what comes next.')}
<div class="portfolio-toolbar"><div class="filters" role="group" aria-label="Filter companies"><button data-filter="all" aria-pressed="true">All companies</button><button data-filter="technology" aria-pressed="false">Technology</button><button data-filter="media" aria-pressed="false">Media</button><button data-filter="heritage" aria-pressed="false">Heritage</button></div><p id="filter-count" role="status">3 companies</p></div>
<section class="portfolio-grid" aria-label="Company portfolio">${companies.map(card).join('')}</section><p class="portfolio-note">Blue Water Spices: verbal agreement reached; acquisition pending completion.</p>${cta('A place for your next chapter.')}`);

add('/approach/', 'Our approach', 'How Dark Consolidated identifies potential, builds foundations, and scales businesses with purpose.', `
${top('03 / OUR APPROACH', 'CONVICTION.<br /><span>THEN ACTION.</span>', 'We take a long-term view of value creation. From the first conversation to the next chapter.')}
<section class="approach-steps"><article><span>01</span><div><h2>Identify potential.</h2><p>Find ambitious teams and meaningful opportunities across technology, media, and emerging markets. Start with the people, the purpose, and the possibility.</p></div><span class="step-glyph" aria-hidden="true">↗</span></article><article><span>02</span><div><h2>Build the foundation.</h2><p>Align capital, infrastructure, and governance. Give each company the operational support and strategic direction it needs to pursue sustainable growth.</p></div><span class="step-glyph" aria-hidden="true">⊕</span></article><article><span>03</span><div><h2>Scale with purpose.</h2><p>Empower independent execution. Strengthen operations, manage digital assets, and build capabilities that create lasting value for the group.</p></div><span class="step-glyph" aria-hidden="true">↗</span></article></section>${cta('Let’s explore the opportunity.')}`);

for (const c of companies) {
  const others = companies.filter(other => other !== c);
  add(`/companies/${c.slug}/`, c.name, c.intro, `
<nav class="breadcrumbs" aria-label="Breadcrumb"><a href="/portfolio/">Our portfolio</a><span aria-hidden="true">/</span><span>${c.name}</span></nav>
<section class="company-hero theme-${c.theme}"><div><p class="eyebrow">${c.number} / ${c.sector}</p><h1>${c.headline.split('\n').map(escape).join('<br />')}</h1><p class="intro-text">${c.intro}</p>${link(contactLink(c), 'Start a conversation')}</div><div class="company-identity">${logo(c)}<span class="status">${c.status}</span><span class="identity-caption">DARK CONSOLIDATED PORTFOLIO</span></div></section>
${c.category === 'media' ? '<section class="audience-stats" aria-label="Audience reach"><div><strong>20M+</strong><span>Views across platforms</span></div><div><strong>70K+</strong><span>Followers across platforms</span></div><p>Founded by<br /><strong>Fugly Douglas</strong></p></section>' : ''}
<section class="editorial-grid company-story"><p class="eyebrow">${c.category === 'heritage' ? 'THE NEXT CHAPTER' : 'MEET THE COMPANY'}</p><div><h2>${c.name}</h2><p>${c.description}</p><p class="relationship">${c.relationship}</p></div></section>
<section class="company-capabilities"><div><p class="eyebrow">${c.category === 'heritage' ? 'WHAT DEFINES THE OPPORTUNITY' : 'CORE CAPABILITIES'}</p><h2>${c.category === 'heritage' ? 'Rooted in heritage.<br />Looking ahead.' : 'Expertise with<br />a clear purpose.'}</h2></div><div class="accordions">${c.services.map(([name, text], i) => `<details ${i === 0 ? 'open' : ''}><summary><span>0${i + 1}</span>${name}<i aria-hidden="true">+</i></summary><p>${text}</p></details>`).join('')}</div></section>
<aside class="related-companies"><p class="eyebrow">EXPLORE THE PORTFOLIO</p><div>${others.map(other => link(`/companies/${other.slug}/`, other.name)).join('')}</div></aside>`, `company theme-${c.theme}`);
}

add('/contact/', 'Contact', 'Start a conversation with Dark Consolidated Ltd about partnerships, cybersecurity, digital media, or Blue Water Spices.', `
<div class="contact-layout"><div>${top('04 / LET’S CONNECT', 'THE NEXT<br />CHAPTER<br /><span>STARTS HERE.</span>', 'A partnership. An opportunity. A bigger idea. Tell us what you have in mind.')}<div class="contact-address"><span class="eyebrow">GROUP ENQUIRIES</span><a id="contact-email" href="mailto:aka.connct@darkconsolidated.uk">aka.connct@darkconsolidated.uk ↗</a><p>Based in the United Kingdom.<br />Built for a connected world.</p></div></div>
<form id="contact-form"><p class="eyebrow">START A CONVERSATION</p><label>Your name<input name="name" autocomplete="name" placeholder="Alex Morgan" required maxlength="120" /></label><label>Email address<input name="email" type="email" autocomplete="email" placeholder="alex@company.com" required maxlength="254" /></label><label>I’m interested in<select name="topic">${topics.map(topic => `<option>${escape(topic)}</option>`).join('')}</select></label><label>Your message<textarea name="message" rows="5" placeholder="A little about your business and how we can help…" required minlength="10" maxlength="5000"></textarea></label><p class="form-note" id="contact-notice">Your email application will open with a draft to review and send. This website does not store your enquiry.</p><button class="action action-filled" id="submit-enquiry" type="submit">Open email draft ${arrow}</button><p id="form-status" role="status"></p><a class="privacy-link" href="/privacy/">How we handle your information ↗</a></form></div>`);

add('/privacy/', 'Privacy', 'Privacy information for the Dark Consolidated company website.', `${top('YOUR PRIVACY', 'A CLEAR<br /><span>FIRST STEP.</span>', 'A straightforward explanation of how this website works.')}<div class="privacy-copy"><h2>Website data</h2><p>This website does not use analytics, advertising cookies, or a server-side contact database. Fonts and brand assets are hosted with the site.</p><h2>Enquiries</h2><p>The enquiry form prepares your message locally and opens your email application so you can review and send it. Form information is not submitted to a server by this website. If email is not configured, the form offers a clearly labelled text draft download instead.</p><h2>Hosting and contact</h2><p>Your hosting provider may process ordinary access logs. A complete privacy notice, including company contact details and retention policies, should be published before live enquiry collection is enabled.</p>${link('/contact/', 'Contact the group')}</div>`);

function render(page) {
  const active = page.route.startsWith('/companies/') ? '/portfolio/' : page.route;
  const addition = pageEnrichment(page.route);
  const marker = page.body.includes('<aside class="page-cta">') ? '<aside class="page-cta">' : '<aside class="related-companies">';
  page.body = page.body.includes(marker) ? page.body.replace(marker, addition + marker) : page.body + addition;
  return `<!doctype html>
<html lang="en"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><meta name="theme-color" content="#080808" /><title>${escape(page.title)} | Dark Consolidated</title><meta name="description" content="${escape(page.description)}" /><meta property="og:title" content="${escape(page.title)} | Dark Consolidated" /><meta property="og:description" content="${escape(page.description)}" /><meta property="og:type" content="website" /><meta property="og:image" content="/brand/darkconsolidated_cover.jpg" /><link rel="icon" href="/brand/darkconsolidated_logo.jpg" /><style data-site-styles>${embeddedStyles}</style><link rel="preload" href="/fonts/space-grotesk-latin.woff2" as="font" type="font/woff2" crossorigin /><link rel="stylesheet" href="/src/site.css" /><link rel="stylesheet" href="/src/responsive.css" /><link rel="stylesheet" href="/src/gold.css" /><link rel="stylesheet" href="/src/navigation.css" /></head>
<body class="${page.type}"><a class="skip-link" href="#main">Skip to content</a><div class="site-frame"><header class="site-header">${brand}<div class="header-right"><a class="header-contact" href="/contact/">Let’s connect ↗</a><button class="menu-button" aria-label="Open navigation" aria-haspopup="dialog" aria-controls="site-menu" aria-expanded="false"><span>MENU</span><i aria-hidden="true"></i></button></div></header><main id="main">${page.body}</main><footer class="site-footer"><span>© ${new Date().getFullYear()} Dark Consolidated Ltd.</span><a href="/privacy/">Privacy</a><span>INDEPENDENT VISION. COLLECTIVE STRENGTH.</span></footer></div>
<dialog id="site-menu" aria-label="Main navigation"><div class="menu-head"><span class="menu-caption">EXPLORE THE GROUP</span><button class="menu-close" aria-label="Close navigation">CLOSE <span aria-hidden="true">×</span></button></div><div class="menu-layout"><nav aria-label="Main navigation">${navLinks(active)}</nav></div><div class="menu-footer"><span>UNITED KINGDOM / GLOBAL AMBITION</span><a href="/privacy/">Privacy</a></div></dialog><script type="module" src="/src/main.js"></script></body></html>`;
}

for (const page of pages) {
  const target = path.join(process.cwd(), page.route.slice(1), 'index.html');
  fs.mkdirSync(path.dirname(target), {recursive: true});
  fs.writeFileSync(target, render(page));
}
console.log(`Generated ${pages.length} standalone pages.`);
