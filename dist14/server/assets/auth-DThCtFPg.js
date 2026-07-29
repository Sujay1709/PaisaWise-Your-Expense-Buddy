import { n as PaisaWiseWordmark, r as Button } from "./brand-e9Pfhvdj.js";
import { _ as signUp, h as signIn, l as getCurrentUser } from "./api-CttPcN1G.js";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
//#region src/routes/auth.tsx?tsr-split=component
function AuthPage() {
	const navigate = useNavigate();
	const [mode, setMode] = useState("signin");
	const [email, setEmail] = useState("");
	const [name, setName] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	useEffect(() => {
		getCurrentUser().then((user) => {
			if (user) navigate({ to: "/app" });
		});
	}, [navigate]);
	const handleSubmit = useCallback(async (e) => {
		e.preventDefault();
		setError("");
		setLoading(true);
		const result = mode === "signup" ? await signUp(email, name, password) : await signIn(email, password);
		setLoading(false);
		if (!result.ok) {
			setError(result.error);
			return;
		}
		navigate({ to: "/app" });
	}, [
		mode,
		email,
		name,
		password,
		navigate
	]);
	return /* @__PURE__ */ jsx("div", {
		className: "flex min-h-svh items-center justify-center pw-grain px-4",
		children: /* @__PURE__ */ jsxs("div", {
			className: "w-full max-w-sm",
			children: [/* @__PURE__ */ jsx("div", {
				className: "mb-8 flex justify-center",
				children: /* @__PURE__ */ jsx(PaisaWiseWordmark, {
					markSize: 36,
					eager: true
				})
			}), /* @__PURE__ */ jsxs("div", {
				className: "rounded-2xl border bg-card p-6 shadow-warm",
				children: [
					/* @__PURE__ */ jsx("h1", {
						className: "font-display text-2xl font-extrabold text-center",
						children: mode === "signin" ? "Welcome back" : "Create account"
					}),
					/* @__PURE__ */ jsx("p", {
						className: "mt-1 text-sm text-muted-foreground text-center",
						children: mode === "signin" ? "Sign in to access your expenses" : "Start tracking your spending today"
					}),
					/* @__PURE__ */ jsxs("form", {
						onSubmit: handleSubmit,
						className: "mt-6 space-y-4",
						children: [
							mode === "signup" && /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
								htmlFor: "auth-name",
								className: "block text-sm font-medium text-foreground mb-1.5",
								children: "Name"
							}), /* @__PURE__ */ jsx("input", {
								id: "auth-name",
								type: "text",
								value: name,
								onChange: (e) => setName(e.target.value),
								placeholder: "Sujay",
								autoComplete: "name",
								required: true,
								maxLength: 80,
								className: "w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/20"
							})] }),
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
								htmlFor: "auth-email",
								className: "block text-sm font-medium text-foreground mb-1.5",
								children: "Email"
							}), /* @__PURE__ */ jsx("input", {
								id: "auth-email",
								type: "email",
								value: email,
								onChange: (e) => setEmail(e.target.value),
								placeholder: "you@example.com",
								autoComplete: "email",
								required: true,
								className: "w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/20"
							})] }),
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
								htmlFor: "auth-password",
								className: "block text-sm font-medium text-foreground mb-1.5",
								children: "Password"
							}), /* @__PURE__ */ jsx("input", {
								id: "auth-password",
								type: "password",
								value: password,
								onChange: (e) => setPassword(e.target.value),
								placeholder: "At least 8 characters",
								autoComplete: mode === "signup" ? "new-password" : "current-password",
								required: true,
								minLength: 8,
								className: "w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/20"
							})] }),
							error && /* @__PURE__ */ jsx("p", {
								className: "rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive",
								children: error
							}),
							/* @__PURE__ */ jsx(Button, {
								type: "submit",
								className: "w-full",
								size: "lg",
								disabled: loading,
								children: loading ? "Please wait..." : mode === "signin" ? "Sign in" : "Create account"
							})
						]
					}),
					/* @__PURE__ */ jsx("p", {
						className: "mt-5 text-center text-sm text-muted-foreground",
						children: mode === "signin" ? /* @__PURE__ */ jsxs(Fragment, { children: [
							"New here?",
							" ",
							/* @__PURE__ */ jsx("button", {
								type: "button",
								onClick: () => {
									setMode("signup");
									setError("");
								},
								className: "font-semibold text-brand hover:underline",
								children: "Create an account"
							})
						] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
							"Already have an account?",
							" ",
							/* @__PURE__ */ jsx("button", {
								type: "button",
								onClick: () => {
									setMode("signin");
									setError("");
								},
								className: "font-semibold text-brand hover:underline",
								children: "Sign in"
							})
						] })
					})
				]
			})]
		})
	});
}
//#endregion
export { AuthPage as component };
