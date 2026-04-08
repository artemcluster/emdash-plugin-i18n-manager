/**
 * i18n Manager Plugin for EmDash CMS
 *
 * Provides language management via the admin panel, including:
 * - Admin page for language CRUD operations
 * - API routes for locale management
 * - Auto-injected language switcher via page:fragments hook
 * - hreflang meta tags via page:metadata hook
 */

import type {
	PluginDescriptor,
	RouteContext,
	StorageCollection,
	PageMetadataEvent,
	PageFragmentEvent,
	PluginContext,
} from "emdash";
import { definePlugin } from "emdash";
import { z } from "astro/zod";

export interface Locale {
	code: string;
	label: string;
	icon: string;
	isDefault: number; // 1 or 0 — SQLite cannot bind booleans
	enabled: number; // 1 or 0
	fallbackCode: string | null;
	sortOrder: number;
}

/** Typed access to locales storage collection */
function locales(ctx: PluginContext | RouteContext): StorageCollection<Locale> {
	return ctx.storage.locales as StorageCollection<Locale>;
}

// =============================================================================
// Plugin Descriptor (for live.config.ts / astro.config.mjs)
// =============================================================================

export function i18nManagerPlugin(
	options: Record<string, unknown> = {},
): PluginDescriptor {
	return {
		id: "i18n-manager",
		version: "0.1.0",
		entrypoint: "@emdash-cms/plugin-i18n-manager",
		adminEntry: "@emdash-cms/plugin-i18n-manager/admin",
		options,
		capabilities: ["page:inject"],
		adminPages: [{ path: "/", label: "Languages", icon: "translate" }],
		storage: {
			locales: {
				indexes: ["sortOrder", "enabled", "isDefault"],
			},
		},
	};
}

// =============================================================================
// Route Handlers
// =============================================================================

async function handleLocalesList(ctx: RouteContext) {
	const store = locales(ctx);
	let result = await store.query({
		orderBy: { sortOrder: "asc" },
		limit: 100,
	});
	// Seed default locale if storage is empty
	if (result.items.length === 0) {
		await store.put("en", {
			code: "en",
			label: "English",
			icon: "🇬🇧",
			isDefault: 1,
			enabled: 1,
			fallbackCode: null,
			sortOrder: 0,
		});
		result = await store.query({
			orderBy: { sortOrder: "asc" },
			limit: 100,
		});
	}
	return { locales: result.items.map((i) => i.data) };
}

const createLocaleInput = z.object({
	code: z.string().regex(/^[a-z]{2,3}$/),
	label: z.string().min(1),
	icon: z.string().optional().default(""),
	fallbackCode: z.string().nullable().optional().default(null),
});

async function handleLocalesCreate(
	ctx: RouteContext<z.infer<typeof createLocaleInput>>,
) {
	const { code, label, icon, fallbackCode } = ctx.input;
	const store = locales(ctx);
	const exists = await store.exists(code);
	if (exists) throw new Error("Locale already exists");
	const count = await store.count({});
	await store.put(code, {
		code,
		label,
		icon: icon || "",
		isDefault: 0,
		enabled: 1,
		fallbackCode: fallbackCode ?? null,
		sortOrder: count,
	});
	const item = await store.get(code);
	return { locale: item! };
}

const updateLocaleInput = z.object({
	code: z.string(),
	label: z.string().optional(),
	icon: z.string().nullable().optional(),
	enabled: z.boolean().optional(),
	isDefault: z.boolean().optional(),
	fallbackCode: z.string().nullable().optional(),
});

async function handleLocalesUpdate(
	ctx: RouteContext<z.infer<typeof updateLocaleInput>>,
) {
	const { code, ...updates } = ctx.input;
	const store = locales(ctx);
	const existing = await store.get(code);
	if (!existing) throw new Error("Locale not found");

	const data: Locale = { ...existing };
	if (updates.label !== undefined) data.label = updates.label;
	if (updates.icon !== undefined) data.icon = updates.icon ?? "";
	if (updates.fallbackCode !== undefined)
		data.fallbackCode = updates.fallbackCode ?? null;
	if (updates.enabled !== undefined) {
		if (!updates.enabled && data.isDefault === 1 === 1)
			throw new Error("Cannot disable default locale");
		data.enabled = updates.enabled;
	}
	if (updates.isDefault === true) {
		const all = await store.query({ limit: 100 });
		for (const item of all.items) {
			if (item.id !== code && item.data.isDefault === 1) {
				await store.put(item.id, {
					...item.data,
					isDefault: 0,
				});
			}
		}
		data.isDefault = 1;
		data.enabled = 1;
	}

	await store.put(code, data);
	return { locale: data };
}

const deleteLocaleInput = z.object({ code: z.string() });

async function handleLocalesDelete(
	ctx: RouteContext<z.infer<typeof deleteLocaleInput>>,
) {
	const store = locales(ctx);
	const existing = await store.get(ctx.input.code);
	if (!existing) throw new Error("Locale not found");
	if (existing.isDefault)
		throw new Error("Cannot delete default locale");
	const all = await store.query({ limit: 100 });
	for (const item of all.items) {
		if (item.data.fallbackCode === ctx.input.code) {
			await store.put(item.id, {
				...item.data,
				fallbackCode: null,
			});
		}
	}
	await store.delete(ctx.input.code);
	return { deleted: true };
}

const reorderLocaleInput = z.object({ codes: z.array(z.string()) });

async function handleLocalesReorder(
	ctx: RouteContext<z.infer<typeof reorderLocaleInput>>,
) {
	const store = locales(ctx);
	for (let i = 0; i < ctx.input.codes.length; i++) {
		const code = ctx.input.codes[i]!;
		const item = await store.get(code);
		if (item) {
			await store.put(code, {
				...item,
				sortOrder: i,
			});
		}
	}
	const result = await store.query({
		orderBy: { sortOrder: "asc" },
		limit: 100,
	});
	return { locales: result.items.map((i) => i.data) };
}

// =============================================================================
// Plugin Implementation
// =============================================================================

export function createPlugin() {
	return definePlugin({
		id: "i18n-manager",
		version: "0.1.0",
		capabilities: ["page:inject"],

		storage: {
			locales: {
				indexes: ["sortOrder", "enabled", "isDefault"],
			},
		},

		hooks: {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			"plugin:install": async (_event: any, ctx: PluginContext) => {
				await locales(ctx).put("en", {
					code: "en",
					label: "English",
					icon: "\u{1F1EC}\u{1F1E7}",
					isDefault: 1,
					enabled: 1,
					fallbackCode: null,
					sortOrder: 0,
				});
			},

			"page:metadata": async (event: PageMetadataEvent, ctx: PluginContext) => {
				const result = await locales(ctx).query({
					where: { enabled: true },
					orderBy: { sortOrder: "asc" },
				});
				const items = result.items;
				if (items.length <= 1) return null;

				const defaultLocale =
					items.find((l) => l.data.isDefault === 1)?.data.code ?? "en";

				const links = items.map((l) => ({
					kind: "link" as const,
					rel: "alternate" as const,
					hreflang: l.data.code,
					href:
						l.data.code === defaultLocale
							? event.page.url
							: event.page.url.replace(
									/^(https?:\/\/[^/]+)/,
									`$1/${l.data.code}`,
								),
				}));

				links.push({
					kind: "link" as const,
					rel: "alternate" as const,
					hreflang: "x-default",
					href: event.page.url,
				});

				return links;
			},

			"page:fragments": async (event: PageFragmentEvent, ctx: PluginContext) => {
				const result = await locales(ctx).query({
					where: { enabled: true },
					orderBy: { sortOrder: "asc" },
				});
				const items = result.items.map((l) => l.data);
				if (items.length <= 1) return null;

				const localesJson = JSON.stringify(items);
				const currentLocale =
					event.page.locale ??
					items.find((l) => l.isDefault)?.code ??
					"en";
				const codesPattern = items.map((l) => l.code).join("|");

				const html = `<script>
(function(){
  if(customElements.get("emdash-lang-switcher")) return;
  class LangSwitcher extends HTMLElement {
    connectedCallback() {
      const locales = ${localesJson};
      const current = "${currentLocale}";
      const path = window.location.pathname.replace(/^\\/(${codesPattern})(\\/|$)/, "/");
      this.innerHTML = '<nav class="emdash-lang-switcher" aria-label="Language">' +
        locales.map(function(l) {
          var href = l.isDefault ? path : "/" + l.code + path;
          var active = l.code === current ? " active" : "";
          return '<a href="' + href + '" class="emdash-lang-link' + active + '">' +
            (l.icon ? '<span class="emdash-lang-icon">' + l.icon + '</span>' : '') +
            l.code.toUpperCase() + '</a>';
        }).join("") + '</nav>';
    }
  }
  customElements.define("emdash-lang-switcher", LangSwitcher);
})();
<\/script>
<style>
.emdash-lang-switcher{display:flex;gap:4px;padding:4px;background:var(--color-surface,#f5f5f5);border-radius:4px}
.emdash-lang-link{display:flex;align-items:center;gap:2px;padding:2px 8px;font-size:12px;font-weight:500;color:var(--color-muted,#888);text-decoration:none;border-radius:4px;transition:all .12s ease}
.emdash-lang-link:hover{color:var(--color-text-secondary,#555)}
.emdash-lang-link.active{background:var(--color-bg,#fff);color:var(--color-text,#1a1a1a);box-shadow:0 1px 2px rgba(0,0,0,.05)}
.emdash-lang-icon{font-size:14px;line-height:1}
</style>`;

				return {
					kind: "html" as const,
					placement: "body:end" as const,
					html,
				};
			},
		},

		routes: {
			"locales/list": {
				handler: handleLocalesList as never,
			},

			"locales/create": {
				input: createLocaleInput,
				handler: handleLocalesCreate as never,
			},

			"locales/update": {
				input: updateLocaleInput,
				handler: handleLocalesUpdate as never,
			},

			"locales/delete": {
				input: deleteLocaleInput,
				handler: handleLocalesDelete as never,
			},

			"locales/reorder": {
				input: reorderLocaleInput,
				handler: handleLocalesReorder as never,
			},
		},

		admin: {
			entry: "@emdash-cms/plugin-i18n-manager/admin",
			pages: [{ path: "/", label: "Languages", icon: "translate" }],
		},
	});
}

export default createPlugin;
