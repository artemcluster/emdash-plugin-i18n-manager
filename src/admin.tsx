/**
 * i18n Manager Plugin - Admin UI
 *
 * React component for the Languages management page.
 * Communicates with the plugin's API routes via fetch.
 */

import type { PluginAdminExports } from "emdash";
import { apiFetch, getErrorMessage, parseApiResponse } from "emdash/plugin-utils";
import * as React from "react";

import { ISO_LANGUAGES } from "./iso-languages.js";

// =============================================================================
// Constants
// =============================================================================

const API = "/_emdash/api/plugins/i18n-manager";

// =============================================================================
// Types
// =============================================================================

interface Locale {
	code: string;
	label: string;
	icon: string;
	isDefault: number;
	enabled: number;
	fallbackCode: string | null;
	sortOrder: number;
}

// =============================================================================
// API Helpers
// =============================================================================

async function apiPost(route: string, body?: unknown): Promise<Response> {
	return apiFetch(`${API}/${route}`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body ?? {}),
	});
}

async function apiGet(route: string): Promise<Response> {
	return apiFetch(`${API}/${route}`);
}

// =============================================================================
// Languages Page Component
// =============================================================================

function LanguagesPage() {
	const [locales, setLocales] = React.useState<Locale[]>([]);
	const [loading, setLoading] = React.useState(true);
	const [error, setError] = React.useState<string | null>(null);
	const [success, setSuccess] = React.useState<string | null>(null);
	const [showAddDialog, setShowAddDialog] = React.useState(false);
	const [editingCode, setEditingCode] = React.useState<string | null>(null);
	const [editLabel, setEditLabel] = React.useState("");
	const [editIcon, setEditIcon] = React.useState("");
	const [editFallback, setEditFallback] = React.useState<string | null>(null);
	const [searchQuery, setSearchQuery] = React.useState("");
	const [confirmDelete, setConfirmDelete] = React.useState<string | null>(null);

	const fetchLocales = React.useCallback(async () => {
		try {
			const res = await apiGet("locales/list");
			const data = await parseApiResponse<{ locales: Locale[] }>(
				res,
				"Failed to load locales",
			);
			setLocales(data.locales);
			setError(null);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to load locales");
		} finally {
			setLoading(false);
		}
	}, []);

	React.useEffect(() => {
		if (success) { const t = setTimeout(() => setSuccess(null), 3000); return () => clearTimeout(t); }
	}, [success]);

	React.useEffect(() => {
		fetchLocales();
	}, [fetchLocales]);

	const handleAddLocale = async (code: string, label: string, icon: string) => {
		try {
			const res = await apiPost("locales/create", { code, label, icon });
			if (!res.ok) {
				setError(await getErrorMessage(res, "Failed to add locale"));
				return;
			}
			setShowAddDialog(false);
			setSuccess("Language added");
			await fetchLocales();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to add locale");
		}
	};

	const handleToggleEnabled = async (locale: Locale) => {
		try {
			const res = await apiPost("locales/update", {
				code: locale.code,
				enabled: locale.enabled !== 1,
			});
			if (!res.ok) {
				setError(await getErrorMessage(res, "Failed to update locale"));
				return;
			}
			setSuccess("Language updated");
			await fetchLocales();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to update locale");
		}
	};

	const handleSetDefault = async (code: string) => {
		try {
			const res = await apiPost("locales/update", {
				code,
				isDefault: true,
			});
			if (!res.ok) {
				setError(await getErrorMessage(res, "Failed to set default"));
				return;
			}
			setSuccess("Default language changed");
			await fetchLocales();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to set default");
		}
	};

	const handleDelete = async (code: string) => {
		try {
			const res = await apiPost("locales/delete", { code });
			if (!res.ok) {
				setError(await getErrorMessage(res, "Failed to delete locale"));
				return;
			}
			setConfirmDelete(null);
			setSuccess("Language deleted");
			await fetchLocales();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to delete locale");
		}
	};

	const handleStartEdit = (locale: Locale) => {
		setEditingCode(locale.code);
		setEditLabel(locale.label);
		setEditIcon(locale.icon);
		setEditFallback(locale.fallbackCode);
	};

	const handleSaveEdit = async () => {
		if (!editingCode) return;
		try {
			const res = await apiPost("locales/update", {
				code: editingCode,
				label: editLabel,
				icon: editIcon,
				fallbackCode: editFallback,
			});
			if (!res.ok) {
				setError(await getErrorMessage(res, "Failed to update locale"));
				return;
			}
			setEditingCode(null);
			setSuccess("Language updated");
			await fetchLocales();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to update locale");
		}
	};

	const handleCancelEdit = () => {
		setEditingCode(null);
	};

	if (loading) {
		return (
			<div style={{ padding: "24px", textAlign: "center", color: "#888" }}>
				Loading languages...
			</div>
		);
	}

	return (
		<div style={{ padding: "24px", maxWidth: "800px" }}>
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					marginBottom: "24px",
				}}
			>
				<div>
					<h1 style={{ fontSize: "20px", fontWeight: 600, margin: 0 }}>Languages</h1>
					<p style={{ fontSize: "14px", color: "#888", margin: "4px 0 0" }}>
						Manage site languages and localization settings.
					</p>
				</div>
				<button
					type="button"
					onClick={() => setShowAddDialog(true)}
					style={{
						display: "inline-flex",
						alignItems: "center",
						gap: "6px",
						padding: "8px 16px",
						fontSize: "14px",
						fontWeight: 500,
						color: "#fff",
						backgroundColor: "#18181b",
						border: "none",
						borderRadius: "6px",
						cursor: "pointer",
					}}
				>
					+ Add Language
				</button>
			</div>

			{success && (
				<div style={{ padding: "12px 16px", backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "8px", color: "#15803d", fontSize: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
					<span>✓</span> {success}
				</div>
			)}

			{error && (
				<div
					style={{
						padding: "12px 16px",
						marginBottom: "16px",
						backgroundColor: "#fef2f2",
						color: "#dc2626",
						borderRadius: "6px",
						fontSize: "14px",
					}}
				>
					{error}
					<button
						type="button"
						onClick={() => setError(null)}
						style={{
							marginLeft: "12px",
							background: "none",
							border: "none",
							color: "#dc2626",
							cursor: "pointer",
							fontWeight: 600,
						}}
					>
						Dismiss
					</button>
				</div>
			)}

			{locales.length === 0 ? (
				<div
					style={{
						padding: "48px",
						textAlign: "center",
						color: "#888",
						border: "1px dashed #e5e7eb",
						borderRadius: "8px",
					}}
				>
					<p style={{ fontSize: "16px", marginBottom: "8px" }}>No languages configured</p>
					<p style={{ fontSize: "14px" }}>
						Add your first language to get started.
					</p>
				</div>
			) : (
				<div
					style={{
						border: "1px solid #e5e7eb",
						borderRadius: "8px",
						overflow: "hidden",
					}}
				>
					<table style={{ width: "100%", borderCollapse: "collapse" }}>
						<thead>
							<tr
								style={{
									backgroundColor: "#f9fafb",
									borderBottom: "1px solid #e5e7eb",
								}}
							>
								<th
									style={{
										padding: "10px 16px",
										textAlign: "left",
										fontSize: "12px",
										fontWeight: 600,
										color: "#6b7280",
										textTransform: "uppercase",
										letterSpacing: "0.05em",
									}}
								>
									Language
								</th>
								<th
									style={{
										padding: "10px 16px",
										textAlign: "left",
										fontSize: "12px",
										fontWeight: 600,
										color: "#6b7280",
										textTransform: "uppercase",
										letterSpacing: "0.05em",
									}}
								>
									Code
								</th>
								<th
									style={{
										padding: "10px 16px",
										textAlign: "center",
										fontSize: "12px",
										fontWeight: 600,
										color: "#6b7280",
										textTransform: "uppercase",
										letterSpacing: "0.05em",
									}}
								>
									Fallback
								</th>
								<th
									style={{
										padding: "10px 16px",
										textAlign: "left",
										fontSize: "12px",
										fontWeight: 600,
										color: "#6b7280",
										textTransform: "uppercase",
										letterSpacing: "0.05em",
									}}
								>
									Status
								</th>
								<th
									style={{
										padding: "10px 16px",
										textAlign: "right",
										fontSize: "12px",
										fontWeight: 600,
										color: "#6b7280",
										textTransform: "uppercase",
										letterSpacing: "0.05em",
									}}
								>
									Actions
								</th>
							</tr>
						</thead>
						<tbody>
							{locales.map((locale) => (
								<tr
									key={locale.code}
									style={{ borderBottom: "1px solid #e5e7eb" }}
								>
									<td style={{ padding: "12px 16px" }}>
										{editingCode === locale.code ? (
											<div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
												<input
													type="text"
													value={editIcon}
													onChange={(e) => setEditIcon(e.target.value)}
													style={{
														width: "40px",
														padding: "4px",
														border: "1px solid #d1d5db",
														borderRadius: "4px",
														fontSize: "16px",
														textAlign: "center",
													}}
													placeholder="Flag"
												/>
												<input
													type="text"
													value={editLabel}
													onChange={(e) => setEditLabel(e.target.value)}
													style={{
														flex: 1,
														padding: "4px 8px",
														border: "1px solid #d1d5db",
														borderRadius: "4px",
														fontSize: "14px",
													}}
												/>
											</div>
										) : (
											<div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
												{locale.icon && (
													<span style={{ fontSize: "18px" }}>{locale.icon}</span>
												)}
												<span style={{ fontSize: "14px", fontWeight: 500 }}>
													{locale.label}
												</span>
											</div>
										)}
									</td>
									<td style={{ padding: "12px 16px" }}>
										<code
											style={{
												fontSize: "13px",
												color: "#6b7280",
												backgroundColor: "#f3f4f6",
												padding: "2px 6px",
												borderRadius: "3px",
											}}
										>
											{locale.code}
										</code>
									</td>
									<td style={{ padding: "12px 16px" }}>
										{editingCode === locale.code ? (
											<select
												value={editFallback ?? ""}
												onChange={(e) => setEditFallback(e.target.value || null)}
												style={{ padding: "4px 8px", fontSize: "13px", border: "1px solid #d1d5db", borderRadius: "4px", width: "100%" }}
											>
												<option value="">None</option>
												{locales.filter(l => l.code !== locale.code).map(l => (
													<option key={l.code} value={l.code}>{l.icon} {l.label} ({l.code})</option>
												))}
											</select>
										) : (
											<span style={{ fontSize: "13px", color: locale.fallbackCode ? "#374151" : "#9ca3af" }}>
												{locale.fallbackCode ? locales.find(l => l.code === locale.fallbackCode)?.label ?? locale.fallbackCode : "—"}
											</span>
										)}
									</td>
									<td style={{ padding: "12px 16px", textAlign: "center" }}>
										<div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
											{locale.isDefault === 1 && (
												<span
													style={{
														display: "inline-block",
														padding: "2px 8px",
														fontSize: "11px",
														fontWeight: 600,
														color: "#7c3aed",
														backgroundColor: "#f5f3ff",
														borderRadius: "9999px",
													}}
												>
													Default
												</span>
											)}
											<span
												style={{
													display: "inline-block",
													padding: "2px 8px",
													fontSize: "11px",
													fontWeight: 600,
													color: locale.enabled === 1 ? "#059669" : "#dc2626",
													backgroundColor: locale.enabled === 1 ? "#ecfdf5" : "#fef2f2",
													borderRadius: "9999px",
												}}
											>
												{locale.enabled === 1 ? "Enabled" : "Disabled"}
											</span>
										</div>
									</td>
									<td style={{ padding: "12px 16px", textAlign: "right" }}>
										{editingCode === locale.code ? (
											<div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
												<button
													type="button"
													onClick={handleSaveEdit}
													style={{
														padding: "4px 12px",
														fontSize: "13px",
														color: "#fff",
														backgroundColor: "#18181b",
														border: "none",
														borderRadius: "4px",
														cursor: "pointer",
													}}
												>
													Save
												</button>
												<button
													type="button"
													onClick={handleCancelEdit}
													style={{
														padding: "4px 12px",
														fontSize: "13px",
														color: "#374151",
														backgroundColor: "#f3f4f6",
														border: "1px solid #d1d5db",
														borderRadius: "4px",
														cursor: "pointer",
													}}
												>
													Cancel
												</button>
											</div>
										) : (
											<div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
												<button
													type="button"
													onClick={() => handleStartEdit(locale)}
													title="Edit"
													style={{
														padding: "4px 8px",
														fontSize: "13px",
														color: "#374151",
														backgroundColor: "#f3f4f6",
														border: "1px solid #d1d5db",
														borderRadius: "4px",
														cursor: "pointer",
													}}
												>
													Edit
												</button>
												<button
													type="button"
													onClick={() => handleToggleEnabled(locale)}
													title={locale.enabled === 1 ? "Disable" : "Enable"}
													style={{
														padding: "4px 8px",
														fontSize: "13px",
														color: locale.enabled === 1 ? "#dc2626" : "#059669",
														backgroundColor: locale.enabled === 1 ? "#fef2f2" : "#ecfdf5",
														border: "1px solid",
														borderColor: locale.enabled === 1 ? "#fecaca" : "#a7f3d0",
														borderRadius: "4px",
														cursor: "pointer",
													}}
												>
													{locale.enabled === 1 ? "Disable" : "Enable"}
												</button>
												{locale.isDefault !== 1 && (
													<>
														<button
															type="button"
															onClick={() => handleSetDefault(locale.code)}
															title="Set as default"
															style={{
																padding: "4px 8px",
																fontSize: "13px",
																color: "#7c3aed",
																backgroundColor: "#f5f3ff",
																border: "1px solid #ddd6fe",
																borderRadius: "4px",
																cursor: "pointer",
															}}
														>
															Default
														</button>
														{confirmDelete === locale.code ? (
															<>
																<button
																	type="button"
																	onClick={() => handleDelete(locale.code)}
																	style={{
																		padding: "4px 8px",
																		fontSize: "13px",
																		color: "#fff",
																		backgroundColor: "#dc2626",
																		border: "none",
																		borderRadius: "4px",
																		cursor: "pointer",
																	}}
																>
																	Confirm
																</button>
																<button
																	type="button"
																	onClick={() => setConfirmDelete(null)}
																	style={{
																		padding: "4px 8px",
																		fontSize: "13px",
																		color: "#374151",
																		backgroundColor: "#f3f4f6",
																		border: "1px solid #d1d5db",
																		borderRadius: "4px",
																		cursor: "pointer",
																	}}
																>
																	No
																</button>
															</>
														) : (
															<button
																type="button"
																onClick={() => setConfirmDelete(locale.code)}
																title="Delete"
																style={{
																	padding: "4px 8px",
																	fontSize: "13px",
																	color: "#dc2626",
																	backgroundColor: "#fef2f2",
																	border: "1px solid #fecaca",
																	borderRadius: "4px",
																	cursor: "pointer",
																}}
															>
																Delete
															</button>
														)}
													</>
												)}
											</div>
										)}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}

			{/* Add Language Dialog */}
			{showAddDialog && (
				<AddLanguageDialog
					existingCodes={locales.map((l) => l.code)}
					searchQuery={searchQuery}
					onSearchChange={setSearchQuery}
					onAdd={handleAddLocale}
					onClose={() => {
						setShowAddDialog(false);
						setSearchQuery("");
					}}
				/>
			)}
		</div>
	);
}

// =============================================================================
// Add Language Dialog
// =============================================================================

function AddLanguageDialog({
	existingCodes,
	searchQuery,
	onSearchChange,
	onAdd,
	onClose,
}: {
	existingCodes: string[];
	searchQuery: string;
	onSearchChange: (q: string) => void;
	onAdd: (code: string, label: string, icon: string) => void;
	onClose: () => void;
}) {
	const filteredLanguages = ISO_LANGUAGES.filter(
		(lang) =>
			!existingCodes.includes(lang.code) &&
			(lang.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
				lang.code.toLowerCase().includes(searchQuery.toLowerCase())),
	);

	return (
		<div
			style={{
				position: "fixed",
				inset: 0,
				backgroundColor: "rgba(0,0,0,0.4)",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				zIndex: 1000,
			}}
			onClick={(e) => {
				if (e.target === e.currentTarget) onClose();
			}}
		>
			<div
				style={{
					backgroundColor: "#fff",
					borderRadius: "12px",
					boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
					width: "480px",
					maxHeight: "600px",
					display: "flex",
					flexDirection: "column",
				}}
			>
				<div
					style={{
						padding: "20px 24px 16px",
						borderBottom: "1px solid #e5e7eb",
					}}
				>
					<div
						style={{
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
							marginBottom: "16px",
						}}
					>
						<h2 style={{ fontSize: "18px", fontWeight: 600, margin: 0 }}>
							Add Language
						</h2>
						<button
							type="button"
							onClick={onClose}
							style={{
								background: "none",
								border: "none",
								fontSize: "20px",
								color: "#9ca3af",
								cursor: "pointer",
								padding: "4px",
							}}
						>
							x
						</button>
					</div>
					<input
						type="text"
						placeholder="Search languages..."
						value={searchQuery}
						onChange={(e) => onSearchChange(e.target.value)}
						autoFocus
						style={{
							width: "100%",
							padding: "8px 12px",
							border: "1px solid #d1d5db",
							borderRadius: "6px",
							fontSize: "14px",
							outline: "none",
							boxSizing: "border-box",
						}}
					/>
				</div>
				<div
					style={{
						flex: 1,
						overflowY: "auto",
						padding: "8px",
					}}
				>
					{filteredLanguages.length === 0 ? (
						<div
							style={{
								padding: "24px",
								textAlign: "center",
								color: "#9ca3af",
								fontSize: "14px",
							}}
						>
							No matching languages found.
						</div>
					) : (
						filteredLanguages.map((lang) => (
							<button
								key={lang.code}
								type="button"
								onClick={() => onAdd(lang.code, lang.label, lang.icon)}
								style={{
									display: "flex",
									alignItems: "center",
									gap: "12px",
									width: "100%",
									padding: "10px 16px",
									background: "none",
									border: "none",
									borderRadius: "6px",
									cursor: "pointer",
									fontSize: "14px",
									textAlign: "left",
									color: "#1f2937",
								}}
								onMouseEnter={(e) => {
									(e.target as HTMLElement).style.backgroundColor = "#f3f4f6";
								}}
								onMouseLeave={(e) => {
									(e.target as HTMLElement).style.backgroundColor = "transparent";
								}}
							>
								<span style={{ fontSize: "20px", width: "28px", textAlign: "center" }}>
									{lang.icon}
								</span>
								<span style={{ flex: 1, fontWeight: 500 }}>{lang.label}</span>
								<code
									style={{
										fontSize: "12px",
										color: "#9ca3af",
										backgroundColor: "#f3f4f6",
										padding: "2px 6px",
										borderRadius: "3px",
									}}
								>
									{lang.code}
								</code>
							</button>
						))
					)}
				</div>
			</div>
		</div>
	);
}

// =============================================================================
// Exports
// =============================================================================

export const pages: PluginAdminExports["pages"] = {
	"/": LanguagesPage,
};
