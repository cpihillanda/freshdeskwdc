# Dark Consolidated

A nine-page company website for Dark Consolidated Ltd. The current design uses black surfaces, metallic gold accents, subtle ember tones, bold typography, and compact navigation. It builds on the user-supplied 2future reference with an original animated canvas landscape and distinct Dark Consolidated branding.

## Local development

Requires Node.js 22.12+ (Node 24 recommended).

```sh
npm ci
npm run dev -- --port 5173
```

Open http://127.0.0.1:5173/ and keep the terminal running.

## Pages and content

- `/`: compact home page with a pausable animated landscape
- `/about/`: group overview and principles
- `/portfolio/`: filterable company directory
- `/approach/`: investment and growth approach
- `/companies/protocol-tomorrow/`: cybersecurity and AI capabilities
- `/companies/fugly-media/`: digital media company and audience reach
- `/companies/blue-water-spices/`: proposed acquisition
- `/contact/`: enquiry preparation
- `/privacy/`: website data practices

Each page is a real, independently generated HTML document. A complete embedded style block ensures that first paint remains styled even when external CSS or JavaScript fails. Linked stylesheets retain live development updates, and internal navigation repairs a missing embedded style block in an open tab. Regenerate HTML after editing styles to update the embedded fallback. Local dev and preview servers disable caching. Direct visits and reloads need no SPA rewrite rules. With JavaScript enabled, internal links progressively fetch the next page, retain the current styled content while loading, and swap the main content in a smooth transition. URLs, titles, Back/Forward, scroll restoration, and company enquiry topics are preserved. Normal document navigation remains the fallback if a fetch fails.

Edit company information in `src/site-content.js` and page templates in `scripts/generate-pages.mjs`. Run `npm run generate` after editing those sources while the dev server is running. `npm run dev` and `npm run build` generate pages automatically. Do not hand-edit generated HTML files.

Global styles are in `src/site.css`, responsive rules in `src/responsive.css`, and the current visual refinements, menu and motion rules in `src/gold.css`. Interactions live in `src/main.js`, the procedural animation in `src/landscape.js`, and expanded editorial content in `src/page-enrichment.js`. Older `style.css`, `spices.css`, and `logos.css` are retained as historical source and are no longer loaded.

Navigation uses the [View Transition API](https://developer.mozilla.org/en-US/docs/Web/API/Document/startViewTransition) where supported, and a short fade elsewhere. Reduced-motion preferences disable these animations. `src/navigation.js` manages progressive navigation, while `src/page.js` initializes and cleans up page-specific controls. `src/navigation.css` supplies the transition rules. The menu remains a keyboard-accessible compact dialog, with Escape and outside-click dismissal.

## Production and checks

```sh
npm run build
npm run preview
npm test
```

For a fresh test environment, run `npx playwright install chromium` once. Browser tests cover all nine routes at desktop and mobile widths, assets, overflow, menu interaction, page navigation, filters, company enquiries, accordions, and reduced-motion controls.

Deploy the generated `dist/` directory to an HTTPS static host at a domain root. Every route has its own `index.html`. Assets and fonts are local; there are no analytics or external runtime dependencies.

## Brand and company details

Supplied original logos live in `public/brand/`. Four background-extracted PNGs (`dark-transparent.png`, `protocol-transparent.png`, `fugly-transparent.png`, `spices-transparent.png`) are used on the website. The built-in image_gen tool produced these cutouts; exact prompts are recorded in `scripts/logo-prompts.json`. Original assets are preserved. Company logos share a 210 × 150 px presentation area using `object-fit: contain`; the black Protocol Tomorrow cutout is inverted with CSS for dark backgrounds. Space Grotesk is self-hosted with its SIL license in `public/fonts/`.

Fugly Media's founder and static audience figures (20M+ views, 70K+ followers across platforms) were supplied by the owner. Blue Water Spices is a prospective group company: a verbal acquisition agreement has been reached, but completion has not been confirmed.

## Enquiries and launch details

The default destination is `aka.connct@darkconsolidated.uk`. All company enquiries use this group address with a specific topic. The form validates input and opens the visitor's email application for review and sending; it does not send automatically or claim delivery. A configured email application is required.

Set `VITE_CONTACT_EMAIL` in `.env` or the build environment to override the public destination, then rebuild. An explicitly empty value enables a labelled local draft download. Never put secrets in Vite-prefixed variables.

Before public launch, confirm the email, production domain and verified company registration details, and finalise the privacy notice for the chosen host. Set absolute Open Graph URLs once a domain is confirmed. No unverified certifications, clients or registration information are included.
