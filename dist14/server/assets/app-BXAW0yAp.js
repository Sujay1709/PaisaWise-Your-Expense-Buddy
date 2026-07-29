import { n as PaisaWiseWordmark, r as Button } from "./brand-e9Pfhvdj.js";
import { g as signOut, l as getCurrentUser, n as changePassword, y as updateProfile } from "./api-CttPcN1G.js";
import { t as ThemeToggle } from "./theme-toggle-DhJ8Pz73.js";
import { Suspense, lazy, useCallback, useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { Toaster } from "sonner";
import { LogOut, Settings } from "lucide-react";
//#region src/components/paisawise/user-menu.tsx
function UserMenu({ user, onUserChange, onSignOut }) {
	const [open, setOpen] = useState(false);
	const [showSettings, setShowSettings] = useState(false);
	const initials = user.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
	return /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsxs("div", {
		className: "relative",
		children: [/* @__PURE__ */ jsxs("button", {
			type: "button",
			onClick: () => setOpen((o) => !o),
			className: "flex items-center gap-2 rounded-full pr-1 transition-colors hover:bg-accent",
			children: [/* @__PURE__ */ jsx("div", {
				className: "flex size-8 items-center justify-center rounded-full text-xs font-bold text-white",
				style: { backgroundColor: user.avatarColor },
				children: initials
			}), /* @__PURE__ */ jsx("span", {
				className: "hidden pr-2 text-sm font-medium text-foreground sm:block",
				children: user.name
			})]
		}), open && /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("div", {
			className: "fixed inset-0 z-40",
			onClick: () => setOpen(false)
		}), /* @__PURE__ */ jsxs("div", {
			className: "absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border bg-card p-1.5 shadow-warm",
			children: [
				/* @__PURE__ */ jsxs("div", {
					className: "mb-1 border-b px-3 py-2",
					children: [
						/* @__PURE__ */ jsx("p", {
							className: "text-sm font-semibold text-foreground",
							children: user.name
						}),
						/* @__PURE__ */ jsx("p", {
							className: "truncate text-xs text-muted-foreground",
							children: user.email
						}),
						user.bio && /* @__PURE__ */ jsx("p", {
							className: "mt-1 text-xs italic text-muted-foreground",
							children: user.bio
						})
					]
				}),
				/* @__PURE__ */ jsxs("button", {
					type: "button",
					onClick: () => {
						setOpen(false);
						setShowSettings(true);
					},
					className: "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent",
					children: [/* @__PURE__ */ jsx(Settings, { className: "size-4" }), "Profile & Settings"]
				}),
				/* @__PURE__ */ jsxs("button", {
					type: "button",
					onClick: () => {
						setOpen(false);
						onSignOut();
					},
					className: "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10",
					children: [/* @__PURE__ */ jsx(LogOut, { className: "size-4" }), "Sign out"]
				})
			]
		})] })]
	}), showSettings && /* @__PURE__ */ jsx(ProfileSettings, {
		user,
		onClose: () => setShowSettings(false),
		onUpdated: onUserChange
	})] });
}
function ProfileSettings({ user, onClose, onUpdated }) {
	const [name, setName] = useState(user.name);
	const [bio, setBio] = useState(user.bio);
	const [gender, setGender] = useState(user.gender);
	const [saving, setSaving] = useState(false);
	const [msg, setMsg] = useState("");
	const [oldPw, setOldPw] = useState("");
	const [newPw, setNewPw] = useState("");
	const [pwMsg, setPwMsg] = useState("");
	const [pwSaving, setPwSaving] = useState(false);
	const handleSaveProfile = useCallback(async () => {
		setSaving(true);
		setMsg("");
		const result = await updateProfile({
			name: name.trim(),
			bio,
			gender
		});
		setSaving(false);
		if (!result.ok) {
			setMsg(result.error);
			return;
		}
		onUpdated(result.data.user);
		setMsg("Saved!");
		setTimeout(() => setMsg(""), 2e3);
	}, [
		name,
		bio,
		gender,
		onUpdated
	]);
	const handleChangePassword = useCallback(async () => {
		setPwSaving(true);
		setPwMsg("");
		const result = await changePassword(oldPw, newPw);
		setPwSaving(false);
		if (!result.ok) {
			setPwMsg(result.error);
			return;
		}
		setPwMsg("Password changed! Other devices signed out.");
		setOldPw("");
		setNewPw("");
		setTimeout(() => setPwMsg(""), 3e3);
	}, [oldPw, newPw]);
	const initials = (name || user.name).split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
	return /* @__PURE__ */ jsx("div", {
		className: "fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4",
		children: /* @__PURE__ */ jsxs("div", {
			className: "max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border bg-card p-6 shadow-warm",
			children: [
				/* @__PURE__ */ jsxs("div", {
					className: "mb-6 flex items-center justify-between",
					children: [/* @__PURE__ */ jsx("h2", {
						className: "font-display text-xl font-extrabold",
						children: "Profile & Settings"
					}), /* @__PURE__ */ jsx("button", {
						type: "button",
						onClick: onClose,
						className: "rounded-lg p-1.5 text-muted-foreground hover:bg-accent",
						children: "✕"
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "mb-6 flex items-center gap-4",
					children: [/* @__PURE__ */ jsx("div", {
						className: "flex size-16 items-center justify-center rounded-full text-xl font-bold text-white",
						style: { backgroundColor: user.avatarColor },
						children: initials
					}), /* @__PURE__ */ jsxs("div", { children: [
						/* @__PURE__ */ jsx("p", {
							className: "font-semibold text-foreground",
							children: name || user.name
						}),
						/* @__PURE__ */ jsx("p", {
							className: "text-sm text-muted-foreground",
							children: user.email
						}),
						/* @__PURE__ */ jsxs("p", {
							className: "text-xs text-muted-foreground",
							children: [
								"Member since",
								" ",
								new Date(user.createdAt).toLocaleDateString("en-IN", {
									month: "short",
									year: "numeric"
								})
							]
						})
					] })]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "space-y-4",
					children: [
						/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
							className: "mb-1 block text-sm font-medium text-foreground",
							children: "Name"
						}), /* @__PURE__ */ jsx("input", {
							type: "text",
							value: name,
							onChange: (e) => setName(e.target.value),
							maxLength: 80,
							className: "w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
						})] }),
						/* @__PURE__ */ jsxs("div", { children: [
							/* @__PURE__ */ jsx("label", {
								className: "mb-1 block text-sm font-medium text-foreground",
								children: "Bio"
							}),
							/* @__PURE__ */ jsx("textarea", {
								value: bio,
								onChange: (e) => setBio(e.target.value),
								placeholder: "CS student at ASU, budgeting my way through college...",
								maxLength: 200,
								rows: 2,
								className: "w-full resize-none rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
							}),
							/* @__PURE__ */ jsxs("p", {
								className: "mt-0.5 text-xs text-muted-foreground",
								children: [bio.length, "/200"]
							})
						] }),
						/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
							className: "mb-1 block text-sm font-medium text-foreground",
							children: "Gender"
						}), /* @__PURE__ */ jsxs("select", {
							value: gender,
							onChange: (e) => setGender(e.target.value),
							className: "w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20",
							children: [
								/* @__PURE__ */ jsx("option", {
									value: "",
									children: "Prefer not to say"
								}),
								/* @__PURE__ */ jsx("option", {
									value: "male",
									children: "Male"
								}),
								/* @__PURE__ */ jsx("option", {
									value: "female",
									children: "Female"
								}),
								/* @__PURE__ */ jsx("option", {
									value: "non-binary",
									children: "Non-binary"
								})
							]
						})] }),
						/* @__PURE__ */ jsxs("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ jsx(Button, {
								onClick: handleSaveProfile,
								disabled: saving,
								size: "sm",
								children: saving ? "Saving..." : "Save profile"
							}), msg && /* @__PURE__ */ jsx("span", {
								className: `text-sm ${msg === "Saved!" ? "text-mint" : "text-destructive"}`,
								children: msg
							})]
						})
					]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "mt-6 space-y-4 border-t pt-6",
					children: [
						/* @__PURE__ */ jsx("h3", {
							className: "font-display text-sm font-bold uppercase tracking-widest text-muted-foreground",
							children: "Change Password"
						}),
						/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
							className: "mb-1 block text-sm font-medium text-foreground",
							children: "Current password"
						}), /* @__PURE__ */ jsx("input", {
							type: "password",
							value: oldPw,
							onChange: (e) => setOldPw(e.target.value),
							autoComplete: "current-password",
							className: "w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
						})] }),
						/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
							className: "mb-1 block text-sm font-medium text-foreground",
							children: "New password"
						}), /* @__PURE__ */ jsx("input", {
							type: "password",
							value: newPw,
							onChange: (e) => setNewPw(e.target.value),
							placeholder: "At least 8 characters",
							autoComplete: "new-password",
							minLength: 8,
							className: "w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
						})] }),
						/* @__PURE__ */ jsxs("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ jsx(Button, {
								onClick: handleChangePassword,
								disabled: pwSaving || !oldPw || newPw.length < 8,
								size: "sm",
								variant: "outline",
								children: pwSaving ? "Changing..." : "Change password"
							}), pwMsg && /* @__PURE__ */ jsx("span", {
								className: `text-sm ${pwMsg.startsWith("Password changed") ? "text-mint" : "text-destructive"}`,
								children: pwMsg
							})]
						})
					]
				})
			]
		})
	});
}
//#endregion
//#region src/components/ui/sonner.tsx
var Toaster$1 = ({ ...props }) => {
	return /* @__PURE__ */ jsx(Toaster, {
		className: "toaster group",
		toastOptions: { classNames: {
			toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
			description: "group-[.toast]:text-muted-foreground",
			actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
			cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground"
		} },
		...props
	});
};
//#endregion
//#region src/routes/app.tsx?tsr-split=component
var ChatWindow = lazy(() => import("./chat-window-7qkD3HL7.js").then((m) => ({ default: m.ChatWindow })));
function ChatFallback() {
	return /* @__PURE__ */ jsx("div", {
		className: "mx-auto w-full max-w-7xl flex-1 px-4 pb-4",
		children: /* @__PURE__ */ jsx("div", { className: "h-full min-h-[60vh] animate-pulse rounded-2xl border bg-card" })
	});
}
function AppPage() {
	const navigate = useNavigate();
	const [user, setUser] = useState(null);
	const [checked, setChecked] = useState(false);
	useEffect(() => {
		getCurrentUser().then((u) => {
			if (!u) navigate({ to: "/auth" });
			else setUser(u);
			setChecked(true);
		});
	}, [navigate]);
	const handleSignOut = useCallback(async () => {
		await signOut();
		navigate({ to: "/auth" });
	}, [navigate]);
	if (!checked || !user) return null;
	return /* @__PURE__ */ jsxs("div", {
		className: "flex h-svh flex-col pw-grain",
		children: [
			/* @__PURE__ */ jsxs("header", {
				className: "flex items-center justify-between gap-3 px-4 py-3",
				children: [/* @__PURE__ */ jsx(PaisaWiseWordmark, {
					markSize: 28,
					eager: true
				}), /* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-3",
					children: [/* @__PURE__ */ jsx(ThemeToggle, {}), /* @__PURE__ */ jsx(UserMenu, {
						user,
						onUserChange: setUser,
						onSignOut: handleSignOut
					})]
				})]
			}),
			/* @__PURE__ */ jsx(Suspense, {
				fallback: /* @__PURE__ */ jsx(ChatFallback, {}),
				children: /* @__PURE__ */ jsx(ChatWindow, {})
			}),
			/* @__PURE__ */ jsx(Toaster$1, {})
		]
	});
}
//#endregion
export { AppPage as component };
