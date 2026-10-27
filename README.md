# Bástya

Website for **Bástya Terápiás Közösségi Alapítvány** ([bastyaalapitvany.hu](https://www.bastyaalapitvany.hu)): a Hungarian community foundation supporting people through difficult life situations, addiction, and related challenges. The site covers the foundation’s mission, events, gallery, donation info, contact, and legal pages. Hungarian is the site language throughout.

Content for events is managed in EmDash CMS; the rest of the marketing pages live as Astro routes in this repo.

## Tech stack

### Core

| Tool | Role |
| --- | --- |
| [Astro](https://astro.build) `^7` | Site framework (server-rendered) |
| [TypeScript](https://www.typescriptlang.org) | Typed frontmatter, scripts, and plugins |
| [Node.js](https://nodejs.org) `>=22.16.0` | Runtime (required by `package.json` engines) |
| [@astrojs/node](https://docs.astro.build/en/guides/integrations-guide/node/) | Standalone Node adapter (`output: "server"`) |
| [Vite](https://vite.dev) | Bundler (via Astro) |
| [npm](https://www.npmjs.com) | Package manager (`package-lock.json`) |

### CMS & data

| Tool | Role |
| --- | --- |
| [EmDash](https://emdashcms.com) `^1.2` | Headless CMS (admin at `/_emdash/admin`, live content collections) |
| SQLite (`data.db`) | EmDash database (local file; ignored by git) |
| Local uploads (`uploads/`) | Media storage for EmDash (ignored by git) |

### UI & styling

| Tool | Role |
| --- | --- |
| [Tailwind CSS](https://tailwindcss.com) `v4` | Utility styling |
| [@tailwindcss/vite](https://tailwindcss.com/docs/installation/using-vite) | Tailwind Vite plugin |
| [Quicksand](https://fonts.google.com/specimen/Quicksand) | Self-hosted variable font (`public/fonts/`) |
| Astro View Transitions (`ClientRouter`) | In-app page transitions |

### React island support

| Tool | Role |
| --- | --- |
| [React](https://react.dev) `^19` | Available for interactive islands |
| [react-dom](https://react.dev) `^19` | React DOM renderer |
| [@astrojs/react](https://docs.astro.build/en/guides/integrations-guide/react/) | Astro ↔ React integration |
| `@types/react` / `@types/react-dom` | TypeScript types for React |

### Media & tooling

| Tool | Role |
| --- | --- |
| [Sharp](https://sharp.pixelplumbing.com) | Image processing / WebP conversion |
| Custom EmDash plugins | `body-button` (inline CTA buttons in event bodies), `webp-convert` (upload → WebP) |
| Custom storage adapter | `src/storage/webp-local.ts` (local media with WebP-aware serving) |
| `scripts/convert-uploads-webp.mjs` | One-off script to convert existing uploads to WebP and sync DB rows |

### Hosting & third-party services

| Tool | Role |
| --- | --- |
| [Cloudflare Pages](https://pages.cloudflare.com) | Documented production hosting |
| [Rackhost](https://www.rackhost.hu) | Domain / related hosting (listed in impresszum) |
| [FormSubmit](https://formsubmit.co) | Contact form delivery |
| [YouTube](https://www.youtube.com) (privacy-enhanced embeds) | Hero video and event video galleries |
| [CookieYes](https://www.cookieyes.com) | Cookie consent (`cky-banner-element` in the footer) |
| Stripe Payment Links | Used from CMS event content for workshop payments (where configured) |

## Project structure

```text
/
├── astro.config.mjs          # Astro + EmDash + React + Tailwind config
├── package.json
├── tsconfig.json
├── emdash-env.d.ts           # Generated EmDash content types
├── data.db                   # Local EmDash SQLite DB (gitignored)
├── uploads/                  # Local EmDash media (gitignored)
├── scripts/
│   └── convert-uploads-webp.mjs
├── public/                   # Static assets (images, fonts, PDFs)
│   ├── fonts/
│   ├── home/, global/, rolunk/, galeria/, …
│   ├── beszamolok/, szmsz/, adomanyozas/
├── src/
│   ├── components/           # Shared UI (Button, Navigation, Footer, …)
│   │   └── blocks/           # EmDash block renderers (galleries, lightbox)
│   ├── layouts/
│   │   └── Layout.astro
│   ├── pages/                # File-based routes
│   │   ├── index.astro
│   │   ├── kapcsolat.astro
│   │   ├── adomanyozas.astro
│   │   ├── galeria.astro
│   │   ├── afsz.astro, adatkezelesi-tajekoztato.astro, impresszum.astro
│   │   ├── esemenyek/        # Upcoming / past / [slug] event pages
│   │   ├── rolunk/           # About + reports
│   │   └── dev/components.astro  # Component catalog (not in main nav)
│   ├── plugins/              # EmDash plugins (body-button, webp-convert)
│   ├── scripts/              # Client/server helpers (forms, events, YouTube, …)
│   ├── storage/              # Custom EmDash media storage
│   ├── styles/
│   │   └── global.css        # Tailwind v4 @theme tokens + base styles
│   └── live.config.ts        # EmDash live collection loader
└── .env                      # Local secrets (gitignored)
```

### Main routes

| Path | Page |
| --- | --- |
| `/` | Home |
| `/rolunk/bemutatkozas` | About |
| `/rolunk/beszamolok-palyazatok` | Reports & grants |
| `/esemenyek/jovobeli` | Upcoming events |
| `/esemenyek/lezajlott` | Past events |
| `/esemenyek/[slug]` | Event detail (CMS) |
| `/galeria` | Photo gallery |
| `/kapcsolat` | Contact |
| `/adomanyozas` | Donations |
| `/afsz`, `/adatkezelesi-tajekoztato`, `/impresszum` | Legal |
| `/_emdash/admin` | EmDash admin UI |
| `/dev/components` | Component catalog (dev only) |

## Run locally

### Prerequisites

- Node.js **22.16+**
- npm

### Setup

1. Clone the repo and install dependencies:

```sh
npm install
```

2. Create a `.env` in the project root (required by EmDash):

```sh
EMDASH_ENCRYPTION_KEY=your-local-encryption-key
```

Use a stable local value. Changing it later can break existing encrypted data in `data.db`.

3. Start the dev server:

```sh
npm run dev
```

Then open:

- Site: [http://localhost:4321](http://localhost:4321)
- Admin: [http://localhost:4321/_emdash/admin](http://localhost:4321/_emdash/admin)

Prefer `localhost` over `127.0.0.1` for EmDash passkey / magic-link login.

### Commands

| Command | Action |
| --- | --- |
| `npm install` | Install dependencies |
| `npm run dev` | Start the Astro + EmDash dev server |
| `npm run build` | Build the production site into `./dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run astro …` | Run Astro CLI helpers (`astro check`, etc.) |

### Notes

- `data.db` and `uploads/` are created/used locally and are gitignored. They are needed for CMS content and media.
- Theme colors and fonts are defined in `src/styles/global.css` (Tailwind v4 `@theme`). Do not invent off-theme colors or alternate font families.
- The component catalog at `/dev/components` should stay out of the main navigation; update it when adding or changing UI components.
