import { useCallback, useEffect, useState } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
import { Moon, Sun } from "lucide-react";
//#region src/components/paisawise/theme-toggle.tsx
var STORAGE_KEY = "paisawise.theme";
/**
* Reads the theme the blocking script in __root.tsx already applied, so the
* button starts in the correct state instead of flipping after hydration.
*/
function currentTheme() {
	if (typeof document === "undefined") return "light";
	return document.documentElement.classList.contains("dark") ? "dark" : "light";
}
function applyTheme(theme) {
	const root = document.documentElement;
	root.classList.toggle("dark", theme === "dark");
	root.style.colorScheme = theme;
	try {
		localStorage.setItem(STORAGE_KEY, theme);
	} catch {}
}
function ThemeToggle() {
	const [theme, setTheme] = useState(null);
	useEffect(() => {
		setTheme(currentTheme());
	}, []);
	const toggle = useCallback(() => {
		const next = currentTheme() === "dark" ? "light" : "dark";
		applyTheme(next);
		setTheme(next);
	}, []);
	const isDark = theme === "dark";
	return /* @__PURE__ */ jsxs("button", {
		type: "button",
		onClick: toggle,
		"aria-label": isDark ? "Switch to light mode" : "Switch to dark mode",
		title: isDark ? "Switch to light mode" : "Switch to dark mode",
		className: "inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-brand hover:text-foreground",
		children: [theme === null ? /* @__PURE__ */ jsx("span", {
			className: "size-3.5",
			"aria-hidden": true
		}) : isDark ? /* @__PURE__ */ jsx(Sun, { className: "size-3.5 text-brand" }) : /* @__PURE__ */ jsx(Moon, { className: "size-3.5" }), /* @__PURE__ */ jsx("span", {
			className: "hidden sm:inline",
			children: isDark ? "Light" : "Dark"
		})]
	});
}
//#endregion
export { ThemeToggle as t };
