# emdash-plugin-i18n-manager-Multilingual

Language management plugin for [EmDash CMS](https://emdashcms.com). Manage site languages directly from the admin panel — no config files, no restarts.

## Features

- **Admin UI** — full language management page at Settings > Languages
- **Add languages** — searchable list of 49 languages with emoji flags
- **Enable/Disable** — soft-disable languages without losing content
- **Delete** — permanent removal with cascade warning
- **Set default** — change the default language with one click
- **Language switcher** — auto-injected on all pages via web component
- **SEO** — automatic `<link rel="alternate" hreflang>` tags

## Installation

```bash
npm install emdash-plugin-i18n-manager
```

## Setup

### 1. Register the plugin

```js
// astro.config.mjs
import { i18nManagerPlugin } from "emdash-plugin-i18n-manager";
import emdash from "emdash/astro";

export default defineConfig({
  // ... your config
  i18n: {
    defaultLocale: "en",
    locales: [
      "en", "uk", "fr", "de", "es", "it", "pt", "nl", "pl", "cs",
      "sk", "ro", "hu", "bg", "hr", "sr", "sl", "lt", "lv", "et",
      "fi", "sv", "da", "no", "is", "el", "tr", "ar", "he", "fa",
      "hi", "bn", "th", "vi", "zh", "ja", "ko", "id", "ms", "tl",
      "sw", "am", "ka", "hy", "az", "kk", "uz", "mn", "ru", "be",
    ],
    fallback: Object.fromEntries(
      ["uk", "fr", "de", "es", "it", "pt", "nl", "pl", "cs",
       "sk", "ro", "hu", "bg", "hr", "sr", "sl", "lt", "lv", "et",
       "fi", "sv", "da", "no", "is", "el", "tr", "ar", "he", "fa",
       "hi", "bn", "th", "vi", "zh", "ja", "ko", "id", "ms", "tl",
       "sw", "am", "ka", "hy", "az", "kk", "uz", "mn", "ru", "be",
      ].map((l) => [l, "en"]),
    ),
    routing: {
      fallbackType: "rewrite",
    },
  },
  integrations: [
    emdash({
      // ... your emdash config
      plugins: [i18nManagerPlugin()],
    }),
  ],
});
```

### 2. Add the language switcher to your template (optional)

The plugin auto-injects a `<emdash-lang-switcher>` web component on every page. Just add it where you want the switcher to appear:

```html
<emdash-lang-switcher></emdash-lang-switcher>
```

The web component is styled with CSS custom properties that match common EmDash theme variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `--color-surface` | `#f5f5f5` | Switcher background |
| `--color-muted` | `#888` | Inactive link color |
| `--color-text` | `#1a1a1a` | Active link color |
| `--color-bg` | `#fff` | Active link background |

### 3. Use locale-aware content queries

In your Astro pages, pass `locale: Astro.currentLocale` to content queries:

```astro
---
const { entries: posts } = await getEmDashCollection("posts", {
  locale: Astro.currentLocale,
});
---
```

### 4. Manage languages

Go to **Admin Panel > Plugins > i18n Manager** to:

- Add new languages from a searchable list of 49 languages
- Edit language labels and emoji icons
- Enable or disable languages
- Set the default language
- Delete languages (with content cascade warning)

## How it works

The plugin stores language configuration in EmDash's plugin storage system. No custom database tables or migrations are needed.

On each page render, the plugin:
1. Reads enabled locales from storage
2. Injects `<link rel="alternate" hreflang="...">` tags for SEO
3. Injects a `<emdash-lang-switcher>` web component with the current locale data

The Astro `i18n` config handles URL routing (e.g., `/uk/posts/my-post`). The plugin manages which languages are active and provides the admin interface.

## API

The plugin exposes API routes at `/_emdash/api/plugins/i18n-manager/`:

| Method | Route | Description |
|--------|-------|-------------|
| GET | `locales/list` | List all locales |
| POST | `locales/create` | Add a new locale |
| POST | `locales/update` | Update a locale |
| POST | `locales/delete` | Delete a locale |
| POST | `locales/reorder` | Reorder locales |

All routes require admin authentication and the `X-EmDash-Request: 1` header.

## For AI / LLM Agents

This section provides step-by-step instructions for AI coding agents (Claude, ChatGPT, Copilot, Cursor, etc.) to install and configure the plugin correctly.

### Quick install (copy-paste ready)

```bash
npm install emdash-plugin-i18n-manager
```

### Step-by-step configuration

**Step 1.** Open `astro.config.mjs` and add the import at the top of the file:

```js
import { i18nManagerPlugin } from "emdash-plugin-i18n-manager";
```

**Step 2.** Add the `i18n` block inside `defineConfig({})`, at the same level as `output` and `integrations`. This block pre-registers locale URL prefixes so Astro's router handles paths like `/fr/posts/...`:

```js
i18n: {
  defaultLocale: "en",
  locales: [
    "en", "uk", "fr", "de", "es", "it", "pt", "nl", "pl", "cs",
    "sk", "ro", "hu", "bg", "hr", "sr", "sl", "lt", "lv", "et",
    "fi", "sv", "da", "no", "is", "el", "tr", "ar", "he", "fa",
    "hi", "bn", "th", "vi", "zh", "ja", "ko", "id", "ms", "tl",
    "sw", "am", "ka", "hy", "az", "kk", "uz", "mn", "ru", "be",
  ],
  fallback: Object.fromEntries(
    ["uk", "fr", "de", "es", "it", "pt", "nl", "pl", "cs",
     "sk", "ro", "hu", "bg", "hr", "sr", "sl", "lt", "lv", "et",
     "fi", "sv", "da", "no", "is", "el", "tr", "ar", "he", "fa",
     "hi", "bn", "th", "vi", "zh", "ja", "ko", "id", "ms", "tl",
     "sw", "am", "ka", "hy", "az", "kk", "uz", "mn", "ru", "be",
    ].map((l) => [l, "en"]),
  ),
  routing: {
    fallbackType: "rewrite",
  },
},
```

**Why `fallbackType: "rewrite"`**: Without it, Astro redirects `/uk/...` to `/...` instead of serving the page with `Astro.currentLocale = "uk"`.

**Why the broad `locales` list**: Astro only routes URL prefixes it knows about at config time. The plugin manages which languages are *enabled* at runtime, but Astro must know which prefixes are *possible*.

**Step 3.** Add `i18nManagerPlugin()` to the `plugins` array inside the `emdash({})` integration:

```js
integrations: [
  emdash({
    // ... existing config (database, storage, etc.)
    plugins: [
      // ... any existing plugins
      i18nManagerPlugin(),
    ],
  }),
],
```

**Step 4.** In every Astro page that queries content, pass `locale: Astro.currentLocale` to make queries locale-aware:

```astro
---
// Before (single-language):
const { entries: posts } = await getEmDashCollection("posts");

// After (multi-language):
const { entries: posts } = await getEmDashCollection("posts", {
  locale: Astro.currentLocale,
});
---
```

Do the same for `getEmDashEntry`:

```astro
---
const { entry: post } = await getEmDashEntry("posts", slug, {
  locale: Astro.currentLocale,
});
---
```

**Step 5.** (Optional) Place `<emdash-lang-switcher></emdash-lang-switcher>` in your layout where you want the language switcher to appear. The web component is auto-registered by the plugin — no imports needed. If you don't place it, the component is still available but won't render unless added to the DOM.

**Step 6.** Set `<html lang={Astro.currentLocale ?? "en"}>` in your base layout for correct HTML language attribute.

### Common mistakes to avoid

- **Do NOT** put `i18n` inside the `emdash({})` call — it goes at the top level of `defineConfig({})`
- **Do NOT** use `fallback: {}` (empty) — Astro will 404 on locale-prefixed URLs
- **Do NOT** forget `routing: { fallbackType: "rewrite" }` — without it, `/uk/` redirects to `/` instead of rendering with Ukrainian locale
- **Do NOT** hardcode locale lists in templates — the plugin manages enabled languages at runtime via admin UI
- **Do NOT** skip adding `locale: Astro.currentLocale` to content queries — without it, all pages show default-language content regardless of URL prefix

### Verification checklist

After installation, verify:

1. `http://localhost:4321/` loads normally (default locale)
2. `http://localhost:4321/uk/` loads with `<html lang="uk">` (non-default locale)
3. `http://localhost:4321/_emdash/admin/plugins/i18n-manager/` shows the Languages admin page
4. Adding a language via admin UI works
5. The `<emdash-lang-switcher>` web component renders on the page
6. View page source contains `<link rel="alternate" hreflang="...">` tags

### Architecture notes for agents

- The plugin uses EmDash's **plugin storage** (`ctx.storage.locales`) — not raw SQL tables
- Languages are injected via **`page:fragments`** hook (web component) and **`page:metadata`** hook (hreflang tags)
- API routes are at `/_emdash/api/plugins/i18n-manager/locales/*`
- The plugin cannot modify `Astro.locals` — this is an EmDash plugin system limitation
- Astro's `i18n` config handles URL routing; the plugin handles language *management*

## Requirements

- EmDash CMS >= 0.1.0
- Astro >= 6.0.0
- Node.js >= 22

## License

MIT
