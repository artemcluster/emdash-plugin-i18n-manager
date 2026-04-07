# emdash-plugin-i18n-manager

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

## Requirements

- EmDash CMS >= 0.1.0
- Astro >= 6.0.0
- Node.js >= 22

## License

MIT
