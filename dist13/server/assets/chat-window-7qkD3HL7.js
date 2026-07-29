import { i as cn, r as Button, t as PaisaWiseMark } from "./brand-e9Pfhvdj.js";
import { a as compressImage, c as getChatHistory, d as listExpenses, f as saveChatHistory, i as clearExpenses, m as setPlan, o as deleteExpense, p as scanReceipt, r as clearChatHistory, s as getBilling, t as addExpenses, u as getStats, v as updateExpense } from "./api-CttPcN1G.js";
import * as React from "react";
import { createContext, memo, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { toast } from "sonner";
import { AlertTriangle, ArrowDownIcon, BarChart3, Brain, CalendarClock, Camera, Check, CornerDownLeftIcon, Loader2, Loader2Icon, Pencil, PieChartIcon, Plus, RotateCcw, Sparkles, SquareIcon, Trash2, TrendingUp, Wallet, X, XIcon, Zap } from "lucide-react";
import { cva } from "class-variance-authority";
import { StickToBottom, useStickToBottomContext } from "use-stick-to-bottom";
import { cjk } from "@streamdown/cjk";
import { code } from "@streamdown/code";
import { math } from "@streamdown/math";
import { mermaid } from "@streamdown/mermaid";
import { Streamdown } from "streamdown";
import { nanoid } from "nanoid";
import { motion } from "motion/react";
import { Area, AreaChart, Bar, BarChart, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
//#region src/components/ai-elements/conversation.tsx
var Conversation = ({ className, ...props }) => /* @__PURE__ */ jsx(StickToBottom, {
	className: cn("relative flex-1 overflow-y-hidden", className),
	initial: "smooth",
	resize: "smooth",
	role: "log",
	...props
});
var ConversationContent = ({ className, ...props }) => /* @__PURE__ */ jsx(StickToBottom.Content, {
	className: cn("flex flex-col gap-8 p-4", className),
	...props
});
var ConversationScrollButton = ({ className, ...props }) => {
	const { isAtBottom, scrollToBottom } = useStickToBottomContext();
	const handleScrollToBottom = useCallback(() => {
		scrollToBottom();
	}, [scrollToBottom]);
	return !isAtBottom && /* @__PURE__ */ jsx(Button, {
		className: cn("absolute bottom-4 left-[50%] translate-x-[-50%] rounded-full dark:bg-background dark:hover:bg-muted", className),
		onClick: handleScrollToBottom,
		size: "icon",
		type: "button",
		variant: "outline",
		...props,
		children: /* @__PURE__ */ jsx(ArrowDownIcon, { className: "size-4" })
	});
};
//#endregion
//#region src/components/ai-elements/message.tsx
var Message = ({ className, from, ...props }) => /* @__PURE__ */ jsx("div", {
	className: cn("group flex w-full max-w-[95%] flex-col gap-2", from === "user" ? "is-user ml-auto justify-end" : "is-assistant", className),
	...props
});
var MessageContent = ({ children, className, ...props }) => /* @__PURE__ */ jsx("div", {
	className: cn("is-user:dark flex w-fit min-w-0 max-w-full flex-col gap-2 overflow-hidden text-sm", "group-[.is-user]:ml-auto group-[.is-user]:rounded-lg group-[.is-user]:bg-secondary group-[.is-user]:px-4 group-[.is-user]:py-3 group-[.is-user]:text-foreground", "group-[.is-assistant]:text-foreground", className),
	...props,
	children
});
createContext(null);
var streamdownPlugins = {
	cjk,
	code,
	math,
	mermaid
};
var MessageResponse = memo(({ className, ...props }) => /* @__PURE__ */ jsx(Streamdown, {
	className: cn("size-full [&>*:first-child]:mt-0 [&>*:last-child]:mb-0", className),
	plugins: streamdownPlugins,
	...props
}), (prevProps, nextProps) => prevProps.children === nextProps.children && nextProps.isAnimating === prevProps.isAnimating);
MessageResponse.displayName = "MessageResponse";
//#endregion
//#region src/components/ui/textarea.tsx
var Textarea = React.forwardRef(({ className, ...props }, ref) => {
	return /* @__PURE__ */ jsx("textarea", {
		className: cn("flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm", className),
		ref,
		...props
	});
});
Textarea.displayName = "Textarea";
//#endregion
//#region src/components/ui/input-group.tsx
function InputGroup({ className, ...props }) {
	return /* @__PURE__ */ jsx("div", {
		"data-slot": "input-group",
		role: "group",
		className: cn("group/input-group border-input dark:bg-input/30 shadow-xs relative flex w-full items-center rounded-md border outline-none transition-[color,box-shadow]", "h-9 has-[>textarea]:h-auto", "has-[>[data-align=inline-start]]:[&>input]:pl-2", "has-[>[data-align=inline-end]]:[&>input]:pr-2", "has-[>[data-align=block-start]]:h-auto has-[>[data-align=block-start]]:flex-col has-[>[data-align=block-start]]:[&>input]:pb-3", "has-[>[data-align=block-end]]:h-auto has-[>[data-align=block-end]]:flex-col has-[>[data-align=block-end]]:[&>input]:pt-3", "has-[[data-slot=input-group-control]:focus-visible]:ring-ring has-[[data-slot=input-group-control]:focus-visible]:ring-1", "has-[[data-slot][aria-invalid=true]]:ring-destructive/20 has-[[data-slot][aria-invalid=true]]:border-destructive dark:has-[[data-slot][aria-invalid=true]]:ring-destructive/40", className),
		...props
	});
}
var inputGroupAddonVariants = cva("text-muted-foreground flex h-auto cursor-text select-none items-center justify-center gap-2 py-1.5 text-sm font-medium group-data-[disabled=true]/input-group:opacity-50 [&>kbd]:rounded-[calc(var(--radius)-5px)] [&>svg:not([class*='size-'])]:size-4", {
	variants: { align: {
		"inline-start": "order-first pl-3 has-[>button]:ml-[-0.45rem] has-[>kbd]:ml-[-0.35rem]",
		"inline-end": "order-last pr-3 has-[>button]:mr-[-0.4rem] has-[>kbd]:mr-[-0.35rem]",
		"block-start": "[.border-b]:pb-3 order-first w-full justify-start px-3 pt-3 group-has-[>input]/input-group:pt-2.5",
		"block-end": "[.border-t]:pt-3 order-last w-full justify-start px-3 pb-3 group-has-[>input]/input-group:pb-2.5"
	} },
	defaultVariants: { align: "inline-start" }
});
function InputGroupAddon({ className, align = "inline-start", ...props }) {
	return /* @__PURE__ */ jsx("div", {
		role: "group",
		"data-slot": "input-group-addon",
		"data-align": align,
		className: cn(inputGroupAddonVariants({ align }), className),
		onClick: (e) => {
			if (e.target.closest("button")) return;
			e.currentTarget.parentElement?.querySelector("input")?.focus();
		},
		...props
	});
}
var inputGroupButtonVariants = cva("flex items-center gap-2 text-sm shadow-none", {
	variants: { size: {
		xs: "h-6 gap-1 rounded-[calc(var(--radius)-5px)] px-2 has-[>svg]:px-2 [&>svg:not([class*='size-'])]:size-3.5",
		sm: "h-8 gap-1.5 rounded-md px-2.5 has-[>svg]:px-2.5",
		"icon-xs": "size-6 rounded-[calc(var(--radius)-5px)] p-0 has-[>svg]:p-0",
		"icon-sm": "size-8 p-0 has-[>svg]:p-0"
	} },
	defaultVariants: { size: "xs" }
});
function InputGroupButton({ className, type = "button", variant = "ghost", size = "xs", ...props }) {
	return /* @__PURE__ */ jsx(Button, {
		type,
		"data-size": size,
		variant,
		className: cn(inputGroupButtonVariants({ size }), className),
		...props
	});
}
function InputGroupTextarea({ className, ...props }) {
	return /* @__PURE__ */ jsx(Textarea, {
		"data-slot": "input-group-control",
		className: cn("flex-1 resize-none rounded-none border-0 bg-transparent py-3 shadow-none focus-visible:ring-0 dark:bg-transparent", className),
		...props
	});
}
//#endregion
//#region src/components/ui/spinner.tsx
function Spinner({ className, ...props }) {
	return /* @__PURE__ */ jsx(Loader2Icon, {
		role: "status",
		"aria-label": "Loading",
		className: cn("size-4 animate-spin", className),
		...props
	});
}
//#endregion
//#region src/components/ai-elements/prompt-input.tsx
var convertBlobUrlToDataUrl = async (url) => {
	try {
		const blob = await (await fetch(url)).blob();
		return new Promise((resolve) => {
			const reader = new FileReader();
			reader.onloadend = () => resolve(reader.result);
			reader.onerror = () => resolve(null);
			reader.readAsDataURL(blob);
		});
	} catch {
		return null;
	}
};
var PromptInputController = createContext(null);
var ProviderAttachmentsContext = createContext(null);
var useOptionalPromptInputController = () => useContext(PromptInputController);
var useOptionalProviderAttachments = () => useContext(ProviderAttachmentsContext);
var LocalAttachmentsContext = createContext(null);
var usePromptInputAttachments = () => {
	const provider = useOptionalProviderAttachments();
	const context = useContext(LocalAttachmentsContext) ?? provider;
	if (!context) throw new Error("usePromptInputAttachments must be used within a PromptInput or PromptInputProvider");
	return context;
};
var LocalReferencedSourcesContext = createContext(null);
var PromptInput = ({ className, accept, multiple, globalDrop, syncHiddenInput, maxFiles, maxFileSize, onError, onSubmit, children, ...props }) => {
	const controller = useOptionalPromptInputController();
	const usingProvider = !!controller;
	const inputRef = useRef(null);
	const formRef = useRef(null);
	const [items, setItems] = useState([]);
	const files = usingProvider ? controller.attachments.files : items;
	const [referencedSources, setReferencedSources] = useState([]);
	const filesRef = useRef(files);
	useEffect(() => {
		filesRef.current = files;
	}, [files]);
	const openFileDialogLocal = useCallback(() => {
		inputRef.current?.click();
	}, []);
	const matchesAccept = useCallback((f) => {
		if (!accept || accept.trim() === "") return true;
		return accept.split(",").map((s) => s.trim()).filter(Boolean).some((pattern) => {
			if (pattern.endsWith("/*")) {
				const prefix = pattern.slice(0, -1);
				return f.type.startsWith(prefix);
			}
			return f.type === pattern;
		});
	}, [accept]);
	const addLocal = useCallback((fileList) => {
		const incoming = [...fileList];
		const accepted = incoming.filter((f) => matchesAccept(f));
		if (incoming.length && accepted.length === 0) {
			onError?.({
				code: "accept",
				message: "No files match the accepted types."
			});
			return;
		}
		const withinSize = (f) => maxFileSize ? f.size <= maxFileSize : true;
		const sized = accepted.filter(withinSize);
		if (accepted.length > 0 && sized.length === 0) {
			onError?.({
				code: "max_file_size",
				message: "All files exceed the maximum size."
			});
			return;
		}
		setItems((prev) => {
			const capacity = typeof maxFiles === "number" ? Math.max(0, maxFiles - prev.length) : void 0;
			const capped = typeof capacity === "number" ? sized.slice(0, capacity) : sized;
			if (typeof capacity === "number" && sized.length > capacity) onError?.({
				code: "max_files",
				message: "Too many files. Some were not added."
			});
			const next = [];
			for (const file of capped) next.push({
				filename: file.name,
				id: nanoid(),
				mediaType: file.type,
				type: "file",
				url: URL.createObjectURL(file)
			});
			return [...prev, ...next];
		});
	}, [
		matchesAccept,
		maxFiles,
		maxFileSize,
		onError
	]);
	const removeLocal = useCallback((id) => setItems((prev) => {
		const found = prev.find((file) => file.id === id);
		if (found?.url) URL.revokeObjectURL(found.url);
		return prev.filter((file) => file.id !== id);
	}), []);
	const addWithProviderValidation = useCallback((fileList) => {
		const incoming = [...fileList];
		const accepted = incoming.filter((f) => matchesAccept(f));
		if (incoming.length && accepted.length === 0) {
			onError?.({
				code: "accept",
				message: "No files match the accepted types."
			});
			return;
		}
		const withinSize = (f) => maxFileSize ? f.size <= maxFileSize : true;
		const sized = accepted.filter(withinSize);
		if (accepted.length > 0 && sized.length === 0) {
			onError?.({
				code: "max_file_size",
				message: "All files exceed the maximum size."
			});
			return;
		}
		const currentCount = files.length;
		const capacity = typeof maxFiles === "number" ? Math.max(0, maxFiles - currentCount) : void 0;
		const capped = typeof capacity === "number" ? sized.slice(0, capacity) : sized;
		if (typeof capacity === "number" && sized.length > capacity) onError?.({
			code: "max_files",
			message: "Too many files. Some were not added."
		});
		if (capped.length > 0) controller?.attachments.add(capped);
	}, [
		matchesAccept,
		maxFileSize,
		maxFiles,
		onError,
		files.length,
		controller
	]);
	const clearAttachments = useCallback(() => usingProvider ? controller?.attachments.clear() : setItems((prev) => {
		for (const file of prev) if (file.url) URL.revokeObjectURL(file.url);
		return [];
	}), [usingProvider, controller]);
	const clearReferencedSources = useCallback(() => setReferencedSources([]), []);
	const add = usingProvider ? addWithProviderValidation : addLocal;
	const remove = usingProvider ? controller.attachments.remove : removeLocal;
	const openFileDialog = usingProvider ? controller.attachments.openFileDialog : openFileDialogLocal;
	const clear = useCallback(() => {
		clearAttachments();
		clearReferencedSources();
	}, [clearAttachments, clearReferencedSources]);
	useEffect(() => {
		if (!usingProvider) return;
		controller.__registerFileInput(inputRef, () => inputRef.current?.click());
	}, [usingProvider, controller]);
	useEffect(() => {
		if (syncHiddenInput && inputRef.current && files.length === 0) inputRef.current.value = "";
	}, [files, syncHiddenInput]);
	useEffect(() => {
		const form = formRef.current;
		if (!form) return;
		if (globalDrop) return;
		const onDragOver = (e) => {
			if (e.dataTransfer?.types?.includes("Files")) e.preventDefault();
		};
		const onDrop = (e) => {
			if (e.dataTransfer?.types?.includes("Files")) e.preventDefault();
			if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) add(e.dataTransfer.files);
		};
		form.addEventListener("dragover", onDragOver);
		form.addEventListener("drop", onDrop);
		return () => {
			form.removeEventListener("dragover", onDragOver);
			form.removeEventListener("drop", onDrop);
		};
	}, [add, globalDrop]);
	useEffect(() => {
		if (!globalDrop) return;
		const onDragOver = (e) => {
			if (e.dataTransfer?.types?.includes("Files")) e.preventDefault();
		};
		const onDrop = (e) => {
			if (e.dataTransfer?.types?.includes("Files")) e.preventDefault();
			if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) add(e.dataTransfer.files);
		};
		document.addEventListener("dragover", onDragOver);
		document.addEventListener("drop", onDrop);
		return () => {
			document.removeEventListener("dragover", onDragOver);
			document.removeEventListener("drop", onDrop);
		};
	}, [add, globalDrop]);
	useEffect(() => () => {
		if (!usingProvider) {
			for (const f of filesRef.current) if (f.url) URL.revokeObjectURL(f.url);
		}
	}, [usingProvider]);
	const handleChange = useCallback((event) => {
		if (event.currentTarget.files) add(event.currentTarget.files);
		event.currentTarget.value = "";
	}, [add]);
	const attachmentsCtx = useMemo(() => ({
		add,
		clear: clearAttachments,
		fileInputRef: inputRef,
		files: files.map((item) => ({
			...item,
			id: item.id
		})),
		openFileDialog,
		remove
	}), [
		files,
		add,
		remove,
		clearAttachments,
		openFileDialog
	]);
	const refsCtx = useMemo(() => ({
		add: (incoming) => {
			const array = Array.isArray(incoming) ? incoming : [incoming];
			setReferencedSources((prev) => [...prev, ...array.map((s) => ({
				...s,
				id: nanoid()
			}))]);
		},
		clear: clearReferencedSources,
		remove: (id) => {
			setReferencedSources((prev) => prev.filter((s) => s.id !== id));
		},
		sources: referencedSources
	}), [referencedSources, clearReferencedSources]);
	const handleSubmit = useCallback(async (event) => {
		event.preventDefault();
		const form = event.currentTarget;
		const text = usingProvider ? controller.textInput.value : (() => {
			return new FormData(form).get("message") || "";
		})();
		if (!usingProvider) form.reset();
		try {
			const result = onSubmit({
				files: await Promise.all(files.map(async ({ id: _id, ...item }) => {
					if (item.url?.startsWith("blob:")) {
						const dataUrl = await convertBlobUrlToDataUrl(item.url);
						return {
							...item,
							url: dataUrl ?? item.url
						};
					}
					return item;
				})),
				text
			}, event);
			if (result instanceof Promise) try {
				await result;
				clear();
				if (usingProvider) controller.textInput.clear();
			} catch {}
			else {
				clear();
				if (usingProvider) controller.textInput.clear();
			}
		} catch {}
	}, [
		usingProvider,
		controller,
		files,
		onSubmit,
		clear
	]);
	const inner = /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("input", {
		accept,
		"aria-label": "Upload files",
		className: "hidden",
		multiple,
		onChange: handleChange,
		ref: inputRef,
		title: "Upload files",
		type: "file"
	}), /* @__PURE__ */ jsx("form", {
		className: cn("w-full", className),
		onSubmit: handleSubmit,
		ref: formRef,
		...props,
		children: /* @__PURE__ */ jsx(InputGroup, {
			className: "overflow-hidden",
			children
		})
	})] });
	const withReferencedSources = /* @__PURE__ */ jsx(LocalReferencedSourcesContext.Provider, {
		value: refsCtx,
		children: inner
	});
	return /* @__PURE__ */ jsx(LocalAttachmentsContext.Provider, {
		value: attachmentsCtx,
		children: withReferencedSources
	});
};
var PromptInputTextarea = ({ onChange, onKeyDown, className, placeholder = "What would you like to know?", ...props }) => {
	const controller = useOptionalPromptInputController();
	const attachments = usePromptInputAttachments();
	const [isComposing, setIsComposing] = useState(false);
	const handleKeyDown = useCallback((e) => {
		onKeyDown?.(e);
		if (e.defaultPrevented) return;
		if (e.key === "Enter") {
			if (isComposing || e.nativeEvent.isComposing) return;
			if (e.shiftKey) return;
			e.preventDefault();
			const { form } = e.currentTarget;
			if ((form?.querySelector("button[type=\"submit\"]"))?.disabled) return;
			form?.requestSubmit();
		}
		if (e.key === "Backspace" && e.currentTarget.value === "" && attachments.files.length > 0) {
			e.preventDefault();
			const lastAttachment = attachments.files.at(-1);
			if (lastAttachment) attachments.remove(lastAttachment.id);
		}
	}, [
		onKeyDown,
		isComposing,
		attachments
	]);
	const handlePaste = useCallback((event) => {
		const items = event.clipboardData?.items;
		if (!items) return;
		const files = [];
		for (const item of items) if (item.kind === "file") {
			const file = item.getAsFile();
			if (file) files.push(file);
		}
		if (files.length > 0) {
			event.preventDefault();
			attachments.add(files);
		}
	}, [attachments]);
	const handleCompositionEnd = useCallback(() => setIsComposing(false), []);
	const handleCompositionStart = useCallback(() => setIsComposing(true), []);
	const controlledProps = controller ? {
		onChange: (e) => {
			controller.textInput.setInput(e.currentTarget.value);
			onChange?.(e);
		},
		value: controller.textInput.value
	} : { onChange };
	return /* @__PURE__ */ jsx(InputGroupTextarea, {
		className: cn("field-sizing-content max-h-48 min-h-16", className),
		name: "message",
		onCompositionEnd: handleCompositionEnd,
		onCompositionStart: handleCompositionStart,
		onKeyDown: handleKeyDown,
		onPaste: handlePaste,
		placeholder,
		...props,
		...controlledProps
	});
};
var PromptInputFooter = ({ className, ...props }) => /* @__PURE__ */ jsx(InputGroupAddon, {
	align: "block-end",
	className: cn("justify-between gap-1", className),
	...props
});
var PromptInputSubmit = ({ className, variant = "default", size = "icon-sm", status, onStop, onClick, children, ...props }) => {
	const isGenerating = status === "submitted" || status === "streaming";
	let Icon = /* @__PURE__ */ jsx(CornerDownLeftIcon, { className: "size-4" });
	if (status === "submitted") Icon = /* @__PURE__ */ jsx(Spinner, {});
	else if (status === "streaming") Icon = /* @__PURE__ */ jsx(SquareIcon, { className: "size-4" });
	else if (status === "error") Icon = /* @__PURE__ */ jsx(XIcon, { className: "size-4" });
	const handleClick = useCallback((e) => {
		if (isGenerating && onStop) {
			e.preventDefault();
			onStop();
			return;
		}
		onClick?.(e);
	}, [
		isGenerating,
		onStop,
		onClick
	]);
	return /* @__PURE__ */ jsx(InputGroupButton, {
		"aria-label": isGenerating ? "Stop" : "Submit",
		className: cn(className),
		onClick: handleClick,
		size,
		type: isGenerating && onStop ? "button" : "submit",
		variant,
		...props,
		children: children ?? Icon
	});
};
//#endregion
//#region src/components/ai-elements/shimmer.tsx
var motionComponentCache = /* @__PURE__ */ new Map();
var getMotionComponent = (element) => {
	let component = motionComponentCache.get(element);
	if (!component) {
		component = motion.create(element);
		motionComponentCache.set(element, component);
	}
	return component;
};
var ShimmerComponent = ({ children, as: Component = "p", className, duration = 2, spread = 2 }) => {
	const MotionComponent = getMotionComponent(Component);
	const dynamicSpread = useMemo(() => (children?.length ?? 0) * spread, [children, spread]);
	return /* @__PURE__ */ jsx(MotionComponent, {
		animate: { backgroundPosition: "0% center" },
		className: cn("relative inline-block bg-[length:250%_100%,auto] bg-clip-text text-transparent", "[--bg:linear-gradient(90deg,#0000_calc(50%-var(--spread)),var(--color-background),#0000_calc(50%+var(--spread)))] [background-repeat:no-repeat,padding-box]", className),
		initial: { backgroundPosition: "100% center" },
		style: {
			"--spread": `${dynamicSpread}px`,
			backgroundImage: "var(--bg), linear-gradient(var(--color-muted-foreground), var(--color-muted-foreground))"
		},
		transition: {
			duration,
			ease: "linear",
			repeat: Number.POSITIVE_INFINITY
		},
		children
	});
};
var Shimmer = memo(ShimmerComponent);
//#endregion
//#region src/lib/paisawise-store.ts
/**
* PaisaWise shared types, constants, and parsing utilities.
*
* Data persistence has moved to db.ts (IndexedDB).
* This file is kept for types, category constants, and the ledger-block parser.
*/
var PW_CATEGORIES = [
	"Food",
	"Travel",
	"Education",
	"Entertainment",
	"Shopping",
	"Bills",
	"Other"
];
var CATEGORY_EMOJI = {
	Food: "🍕",
	Travel: "🚗",
	Education: "📚",
	Entertainment: "🎬",
	Shopping: "🛍️",
	Bills: "📱",
	Other: "📦"
};
var LEDGER_BLOCK_REGEX = /<!--\s*PAISAWISE[\s\S]*?-->/g;
/** Removes the hidden machine-readable ledger block from assistant text. */
function stripLedgerBlock(text) {
	return text.replace(LEDGER_BLOCK_REGEX, "").trimEnd();
}
function isCategory(value) {
	return typeof value === "string" && PW_CATEGORIES.includes(value);
}
/** Parses the hidden ledger block out of an assistant message's text. */
function parseLedgerEntries(text) {
	const matches = text.match(LEDGER_BLOCK_REGEX);
	if (!matches) return [];
	const out = [];
	for (const raw of matches) {
		const json = raw.replace(/^<!--\s*PAISAWISE/, "").replace(/-->$/, "").trim();
		try {
			const parsed = JSON.parse(json);
			if (!Array.isArray(parsed.entries)) continue;
			for (const item of parsed.entries) {
				if (!item || typeof item !== "object") continue;
				const entry = item;
				const amount = typeof entry.amount === "number" && Number.isFinite(entry.amount) ? entry.amount : 0;
				if (amount <= 0) continue;
				out.push({
					amount,
					category: isCategory(entry.category) ? entry.category : "Other",
					merchant: typeof entry.merchant === "string" && entry.merchant.trim() ? entry.merchant : null,
					note: typeof entry.note === "string" ? entry.note : "",
					type: entry.type === "income" ? "income" : "expense"
				});
			}
		} catch {}
	}
	return out;
}
function formatRupees(amount) {
	return `₹${Math.round(amount).toLocaleString("en-IN")}`;
}
//#endregion
//#region src/components/paisawise/expense-history.tsx
function emojiFor$1(category) {
	return CATEGORY_EMOJI[category] ?? "📦";
}
function formatDate(iso) {
	return new Date(iso).toLocaleDateString("en-IN", {
		day: "numeric",
		month: "short"
	});
}
function ExpenseHistory({ onChanged }) {
	const [entries, setEntries] = useState([]);
	const [cursor, setCursor] = useState(null);
	const [loading, setLoading] = useState(true);
	const [loadingMore, setLoadingMore] = useState(false);
	const [editingId, setEditingId] = useState(null);
	const [busyId, setBusyId] = useState(null);
	const load = useCallback(async () => {
		setLoading(true);
		const result = await listExpenses(void 0, 25);
		setLoading(false);
		if (!result.ok) {
			toast.error(result.error);
			return;
		}
		setEntries(result.data.entries);
		setCursor(result.data.nextCursor);
	}, []);
	useEffect(() => {
		load();
	}, [load]);
	const loadMore = useCallback(async () => {
		if (!cursor || loadingMore) return;
		setLoadingMore(true);
		const result = await listExpenses(cursor, 25);
		setLoadingMore(false);
		if (!result.ok) {
			toast.error(result.error);
			return;
		}
		setEntries((current) => [...current, ...result.data.entries]);
		setCursor(result.data.nextCursor);
	}, [cursor, loadingMore]);
	const handleDelete = useCallback(async (id) => {
		setBusyId(id);
		const result = await deleteExpense(id);
		setBusyId(null);
		if (!result.ok) {
			toast.error(result.error);
			return;
		}
		setEntries((current) => current.filter((e) => e.id !== id));
		onChanged();
		toast.success("Deleted.");
	}, [onChanged]);
	const handleSave = useCallback(async (id, patch) => {
		setBusyId(id);
		const result = await updateExpense(id, patch);
		setBusyId(null);
		if (!result.ok) {
			toast.error(result.error);
			return;
		}
		setEntries((current) => current.map((e) => e.id === id ? {
			...e,
			...patch
		} : e));
		setEditingId(null);
		onChanged();
		toast.success("Updated.");
	}, [onChanged]);
	if (loading) return /* @__PURE__ */ jsx("div", {
		className: "space-y-2",
		children: [
			0,
			1,
			2,
			3
		].map((i) => /* @__PURE__ */ jsx("div", { className: "h-14 animate-pulse rounded-xl border bg-muted/40" }, i))
	});
	if (entries.length === 0) return /* @__PURE__ */ jsx("p", {
		className: "rounded-xl border border-dashed p-4 text-sm text-muted-foreground",
		children: "No expenses yet. Type one in the chat or scan a receipt."
	});
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-2",
		children: [entries.map((entry) => editingId === entry.id ? /* @__PURE__ */ jsx(EditRow, {
			entry,
			busy: busyId === entry.id,
			onCancel: () => setEditingId(null),
			onSave: (patch) => handleSave(entry.id, patch)
		}, entry.id) : /* @__PURE__ */ jsxs("div", {
			className: "group flex items-center gap-2 rounded-xl border bg-background px-3 py-2",
			children: [
				/* @__PURE__ */ jsx("span", {
					className: "text-sm",
					"aria-hidden": true,
					children: emojiFor$1(entry.category)
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "min-w-0 flex-1",
					children: [/* @__PURE__ */ jsx("p", {
						className: "truncate text-sm font-medium",
						children: entry.merchant || entry.note || entry.category
					}), /* @__PURE__ */ jsxs("p", {
						className: "truncate text-xs text-muted-foreground",
						children: [
							entry.category,
							" · ",
							formatDate(entry.occurredAt),
							entry.merchant && entry.note ? ` · ${entry.note}` : ""
						]
					})]
				}),
				/* @__PURE__ */ jsxs("span", {
					className: `shrink-0 text-sm font-semibold tabular-nums ${entry.type === "income" ? "text-mint" : ""}`,
					children: [entry.type === "income" ? "+" : "", formatRupees(entry.amount)]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "flex shrink-0 gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100",
					children: [/* @__PURE__ */ jsx("button", {
						type: "button",
						onClick: () => setEditingId(entry.id),
						className: "rounded-md p-1.5 text-muted-foreground hover:bg-accent",
						title: "Edit",
						children: /* @__PURE__ */ jsx(Pencil, { className: "size-3.5" })
					}), /* @__PURE__ */ jsx("button", {
						type: "button",
						onClick: () => handleDelete(entry.id),
						disabled: busyId === entry.id,
						className: "rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive",
						title: "Delete",
						children: busyId === entry.id ? /* @__PURE__ */ jsx(Loader2, { className: "size-3.5 animate-spin" }) : /* @__PURE__ */ jsx(Trash2, { className: "size-3.5" })
					})]
				})
			]
		}, entry.id)), cursor && /* @__PURE__ */ jsxs(Button, {
			variant: "outline",
			size: "sm",
			onClick: loadMore,
			disabled: loadingMore,
			className: "w-full gap-1.5",
			children: [loadingMore && /* @__PURE__ */ jsx(Loader2, { className: "size-3.5 animate-spin" }), loadingMore ? "Loading..." : "Load more"]
		})]
	});
}
function EditRow({ entry, busy, onCancel, onSave }) {
	const [amount, setAmount] = useState(String(entry.amount));
	const [category, setCategory] = useState(entry.category);
	const [note, setNote] = useState(entry.note);
	const [merchant, setMerchant] = useState(entry.merchant ?? "");
	const submit = () => {
		const parsed = Number(amount);
		if (!Number.isFinite(parsed) || parsed <= 0) {
			toast.error("Enter a valid amount.");
			return;
		}
		onSave({
			amount: Math.round(parsed * 100) / 100,
			category,
			note,
			merchant: merchant.trim() || null
		});
	};
	return /* @__PURE__ */ jsxs("div", {
		className: "rounded-xl border border-brand bg-background p-2.5",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "flex items-center gap-2",
			children: [
				/* @__PURE__ */ jsx("input", {
					type: "number",
					value: amount,
					min: 1,
					step: "0.01",
					onChange: (e) => setAmount(e.target.value),
					className: "w-24 rounded-md border bg-card px-2 py-1 text-sm tabular-nums outline-none focus:border-brand"
				}),
				/* @__PURE__ */ jsx("select", {
					value: category,
					onChange: (e) => setCategory(e.target.value),
					className: "rounded-md border bg-card px-2 py-1 text-xs outline-none focus:border-brand",
					children: PW_CATEGORIES.map((c) => /* @__PURE__ */ jsx("option", {
						value: c,
						children: c
					}, c))
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "ml-auto flex gap-0.5",
					children: [/* @__PURE__ */ jsx("button", {
						type: "button",
						onClick: submit,
						disabled: busy,
						className: "rounded-md p-1.5 text-mint hover:bg-mint/10",
						title: "Save",
						children: busy ? /* @__PURE__ */ jsx(Loader2, { className: "size-3.5 animate-spin" }) : /* @__PURE__ */ jsx(Check, { className: "size-3.5" })
					}), /* @__PURE__ */ jsx("button", {
						type: "button",
						onClick: onCancel,
						disabled: busy,
						className: "rounded-md p-1.5 text-muted-foreground hover:bg-accent",
						title: "Cancel",
						children: /* @__PURE__ */ jsx(X, { className: "size-3.5" })
					})]
				})
			]
		}), /* @__PURE__ */ jsxs("div", {
			className: "mt-1.5 flex gap-2",
			children: [/* @__PURE__ */ jsx("input", {
				type: "text",
				value: merchant,
				onChange: (e) => setMerchant(e.target.value),
				placeholder: "Merchant",
				maxLength: 80,
				className: "w-1/3 rounded-md border bg-card px-2 py-1 text-xs outline-none focus:border-brand"
			}), /* @__PURE__ */ jsx("input", {
				type: "text",
				value: note,
				onChange: (e) => setNote(e.target.value),
				placeholder: "Note",
				maxLength: 280,
				className: "flex-1 rounded-md border bg-card px-2 py-1 text-xs outline-none focus:border-brand"
			})]
		})]
	});
}
//#endregion
//#region src/components/paisawise/usage-meter.tsx
function Bar$1({ label, used, limit, period }) {
	if (limit === null) return /* @__PURE__ */ jsxs("div", {
		className: "flex items-baseline justify-between text-xs",
		children: [/* @__PURE__ */ jsx("span", {
			className: "text-muted-foreground",
			children: label
		}), /* @__PURE__ */ jsx("span", {
			className: "font-semibold text-mint",
			children: "Unlimited"
		})]
	});
	const pct = Math.min(100, Math.round(used / limit * 100));
	const exhausted = used >= limit;
	const nearly = pct >= 80;
	return /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("div", {
		className: "flex items-baseline justify-between text-xs",
		children: [/* @__PURE__ */ jsx("span", {
			className: "text-muted-foreground",
			children: label
		}), /* @__PURE__ */ jsxs("span", {
			className: `tabular-nums font-medium ${exhausted ? "text-destructive" : nearly ? "text-brand-foreground" : ""}`,
			children: [
				used,
				"/",
				limit,
				/* @__PURE__ */ jsxs("span", {
					className: "ml-1 text-muted-foreground",
					children: ["/", period]
				})
			]
		})]
	}), /* @__PURE__ */ jsx("div", {
		className: "mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted",
		children: /* @__PURE__ */ jsx("div", {
			className: `h-full rounded-full transition-all ${exhausted ? "bg-destructive" : nearly ? "bg-brand" : "bg-mint"}`,
			style: { width: `${Math.max(3, pct)}%` }
		})
	})] });
}
function UsageMeter({ refreshKey }) {
	const [billing, setBilling] = useState(null);
	const [switching, setSwitching] = useState(false);
	const load = useCallback(() => {
		getBilling().then((result) => {
			if (result.ok) setBilling(result.data);
		});
	}, []);
	useEffect(() => {
		load();
	}, [load, refreshKey]);
	const changePlan = useCallback(async (plan) => {
		setSwitching(true);
		const result = await setPlan(plan);
		setSwitching(false);
		if (!result.ok) {
			toast.error(result.error);
			return;
		}
		toast.success(plan === "pro" ? "Switched to Pro." : "Switched to Free.");
		load();
	}, [load]);
	if (!billing) return null;
	const isPro = billing.plan === "pro";
	return /* @__PURE__ */ jsxs("div", {
		className: `rounded-xl border p-3 ${isPro ? "border-brand/40 bg-brand-soft/40" : "bg-background"}`,
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "mb-2.5 flex items-center justify-between",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-1.5",
					children: [isPro ? /* @__PURE__ */ jsx(Sparkles, { className: "size-3.5 text-brand" }) : /* @__PURE__ */ jsx(Zap, { className: "size-3.5 text-muted-foreground" }), /* @__PURE__ */ jsxs("span", {
						className: "text-xs font-bold uppercase tracking-widest text-muted-foreground",
						children: [billing.plans[billing.plan].name, " plan"]
					})]
				}), !isPro && /* @__PURE__ */ jsx("span", {
					className: "text-[10px] text-muted-foreground",
					children: billing.plans.pro.price
				})]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "space-y-2.5",
				children: [
					/* @__PURE__ */ jsx(Bar$1, {
						label: "Expenses",
						used: billing.usage.expensesThisMonth,
						limit: billing.limits.expensesPerMonth,
						period: "mo"
					}),
					/* @__PURE__ */ jsx(Bar$1, {
						label: "AI messages",
						used: billing.usage.aiChatsToday,
						limit: billing.limits.aiChatsPerDay,
						period: "day"
					}),
					/* @__PURE__ */ jsx(Bar$1, {
						label: "Receipt scans",
						used: billing.usage.receiptScansThisMonth,
						limit: billing.limits.receiptScansPerMonth,
						period: "mo"
					})
				]
			}),
			billing.demoMode ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsxs(Button, {
				size: "sm",
				variant: isPro ? "outline" : "default",
				disabled: switching,
				onClick: () => changePlan(isPro ? "free" : "pro"),
				className: "mt-3 w-full gap-1.5 text-xs",
				children: [/* @__PURE__ */ jsx(Sparkles, { className: "size-3" }), switching ? "Switching..." : isPro ? "Switch back to Free" : "Upgrade to Pro"]
			}), /* @__PURE__ */ jsx("p", {
				className: "mt-1.5 text-center text-[10px] leading-tight text-muted-foreground",
				children: "Demo mode — no payment is taken. Switch freely to see how quotas behave."
			})] }) : /* @__PURE__ */ jsx("p", {
				className: "mt-3 text-[10px] leading-tight text-muted-foreground",
				children: "Billing is not enabled on this deployment."
			})
		]
	});
}
//#endregion
//#region src/components/paisawise/add-expense-form.tsx
/** Today in the local timezone, formatted for <input type="date">. */
function todayLocal() {
	const now = /* @__PURE__ */ new Date();
	const offsetMs = now.getTimezoneOffset() * 6e4;
	return new Date(now.getTime() - offsetMs).toISOString().slice(0, 10);
}
function AddExpenseForm({ onAdded }) {
	const [title, setTitle] = useState("");
	const [amount, setAmount] = useState("");
	const [date, setDate] = useState(todayLocal);
	const [category, setCategory] = useState("Food");
	const [note, setNote] = useState("");
	const [kind, setKind] = useState("expense");
	const [saving, setSaving] = useState(false);
	return /* @__PURE__ */ jsxs("form", {
		onSubmit: useCallback(async (event) => {
			event.preventDefault();
			const parsed = Number(amount);
			if (!Number.isFinite(parsed) || parsed <= 0) {
				toast.error("Enter an amount greater than zero.");
				return;
			}
			if (!title.trim()) {
				toast.error("Give it a title so you recognise it later.");
				return;
			}
			setSaving(true);
			const result = await addExpenses([{
				amount: Math.round(parsed * 100) / 100,
				category,
				merchant: title.trim().slice(0, 80),
				note: note.trim(),
				type: kind,
				occurredAt: date || void 0
			}]);
			setSaving(false);
			if (!result.ok) {
				toast.error(result.error);
				return;
			}
			toast.success(`${kind === "income" ? "Income" : "Expense"} added — ₹${Math.round(parsed).toLocaleString("en-IN")} · ${category}`);
			setTitle("");
			setAmount("");
			setNote("");
			onAdded();
		}, [
			amount,
			title,
			note,
			category,
			date,
			kind,
			onAdded
		]),
		className: "space-y-4",
		children: [
			/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
				htmlFor: "ae-title",
				className: "mb-1.5 block text-xs font-bold uppercase tracking-widest text-muted-foreground",
				children: "Title"
			}), /* @__PURE__ */ jsx("input", {
				id: "ae-title",
				type: "text",
				value: title,
				onChange: (e) => setTitle(e.target.value),
				placeholder: "e.g. Lunch at the mess",
				maxLength: 80,
				className: "w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/20"
			})] }),
			/* @__PURE__ */ jsxs("div", {
				className: "grid grid-cols-2 gap-3",
				children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
					htmlFor: "ae-amount",
					className: "mb-1.5 block text-xs font-bold uppercase tracking-widest text-muted-foreground",
					children: "Amount (₹)"
				}), /* @__PURE__ */ jsx("input", {
					id: "ae-amount",
					type: "number",
					inputMode: "decimal",
					min: "0.01",
					step: "0.01",
					value: amount,
					onChange: (e) => setAmount(e.target.value),
					placeholder: "0.00",
					className: "w-full rounded-lg border bg-background px-3 py-2.5 text-sm tabular-nums outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/20"
				})] }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
					htmlFor: "ae-date",
					className: "mb-1.5 block text-xs font-bold uppercase tracking-widest text-muted-foreground",
					children: "Date"
				}), /* @__PURE__ */ jsx("input", {
					id: "ae-date",
					type: "date",
					value: date,
					max: todayLocal(),
					onChange: (e) => setDate(e.target.value),
					className: "w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/20"
				})] })]
			}),
			/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", {
				className: "mb-1.5 block text-xs font-bold uppercase tracking-widest text-muted-foreground",
				children: "Category"
			}), /* @__PURE__ */ jsx("div", {
				className: "grid grid-cols-2 gap-2 sm:grid-cols-4",
				children: PW_CATEGORIES.map((option) => {
					const active = category === option;
					return /* @__PURE__ */ jsxs("button", {
						type: "button",
						onClick: () => setCategory(option),
						"aria-pressed": active,
						className: `flex items-center justify-center gap-1.5 rounded-lg border px-2 py-2 text-xs font-medium transition-colors ${active ? "border-brand bg-brand-soft text-brand-foreground" : "bg-background text-muted-foreground hover:border-brand/50 hover:text-foreground"}`,
						children: [/* @__PURE__ */ jsx("span", {
							"aria-hidden": true,
							children: CATEGORY_EMOJI[option]
						}), /* @__PURE__ */ jsx("span", {
							className: "truncate",
							children: option
						})]
					}, option);
				})
			})] }),
			/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("label", {
				htmlFor: "ae-note",
				className: "mb-1.5 block text-xs font-bold uppercase tracking-widest text-muted-foreground",
				children: ["Note ", /* @__PURE__ */ jsx("span", {
					className: "font-normal normal-case tracking-normal",
					children: "(optional)"
				})]
			}), /* @__PURE__ */ jsx("input", {
				id: "ae-note",
				type: "text",
				value: note,
				onChange: (e) => setNote(e.target.value),
				placeholder: "Any details...",
				maxLength: 280,
				className: "w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/20"
			})] }),
			/* @__PURE__ */ jsx("div", {
				className: "flex gap-2",
				children: ["expense", "income"].map((option) => /* @__PURE__ */ jsx("button", {
					type: "button",
					onClick: () => setKind(option),
					"aria-pressed": kind === option,
					className: `flex-1 rounded-lg border px-3 py-1.5 text-xs font-semibold capitalize transition-colors ${kind === option ? option === "income" ? "border-mint bg-mint-soft text-mint-foreground" : "border-brand bg-brand-soft text-brand-foreground" : "bg-background text-muted-foreground hover:text-foreground"}`,
					children: option
				}, option))
			}),
			/* @__PURE__ */ jsxs(Button, {
				type: "submit",
				disabled: saving,
				size: "lg",
				className: "w-full gap-2",
				children: [saving ? /* @__PURE__ */ jsx(Loader2, { className: "size-4 animate-spin" }) : /* @__PURE__ */ jsx(Plus, { className: "size-4" }), saving ? "Adding..." : `Add ${kind}`]
			})
		]
	});
}
//#endregion
//#region src/components/paisawise/timeline.tsx
var RANGES = [
	{
		id: "day",
		label: "1D"
	},
	{
		id: "5day",
		label: "5D"
	},
	{
		id: "week",
		label: "1W"
	},
	{
		id: "month",
		label: "1M"
	}
];
function shortDay(iso, range) {
	const date = new Date(iso);
	if (range === "day") return "Today";
	if (range === "month") return date.toLocaleDateString("en-IN", { day: "numeric" });
	return date.toLocaleDateString("en-IN", { weekday: "short" });
}
function fullDay(iso) {
	return new Date(iso).toLocaleDateString("en-IN", {
		day: "numeric",
		month: "short"
	});
}
function Timeline({ refreshKey }) {
	const [range, setRange] = useState("week");
	const [data, setData] = useState(null);
	const [loading, setLoading] = useState(true);
	const load = useCallback(async (r) => {
		setLoading(true);
		try {
			const res = await fetch(`/api/timeline?range=${r}`, { credentials: "same-origin" });
			if (res.ok) setData(await res.json());
		} finally {
			setLoading(false);
		}
	}, []);
	useEffect(() => {
		load(range);
	}, [
		load,
		range,
		refreshKey
	]);
	const chartData = (data?.buckets ?? []).map((b) => ({
		day: shortDay(b.date, range),
		amount: b.amount,
		date: b.date
	}));
	const isEmpty = data && data.total === 0;
	return /* @__PURE__ */ jsxs("div", {
		className: "rounded-2xl border bg-card p-5",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "mb-3 flex items-center justify-between gap-2",
			children: [/* @__PURE__ */ jsxs("h2", {
				className: "flex min-w-0 items-center gap-1.5 font-display text-sm font-bold uppercase tracking-widest text-muted-foreground",
				children: [/* @__PURE__ */ jsx(CalendarClock, { className: "size-3.5 shrink-0" }), /* @__PURE__ */ jsx("span", {
					className: "truncate",
					children: "Timeline"
				})]
			}), /* @__PURE__ */ jsx("div", {
				className: "flex shrink-0 gap-0.5 rounded-lg bg-secondary p-0.5",
				children: RANGES.map((r) => /* @__PURE__ */ jsx("button", {
					type: "button",
					onClick: () => setRange(r.id),
					"aria-pressed": range === r.id,
					className: `w-9 rounded-md px-0 py-1 text-[11px] font-semibold whitespace-nowrap tabular-nums transition-colors ${range === r.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`,
					children: r.label
				}, r.id))
			})]
		}), loading && !data ? /* @__PURE__ */ jsx("div", {
			className: "grid h-48 place-items-center text-muted-foreground",
			children: /* @__PURE__ */ jsx(Loader2, { className: "size-4 animate-spin" })
		}) : isEmpty ? /* @__PURE__ */ jsx("p", {
			className: "rounded-xl border border-dashed p-4 text-center text-sm text-muted-foreground",
			children: "No expenses in this window yet."
		}) : /* @__PURE__ */ jsxs(Fragment, { children: [
			/* @__PURE__ */ jsxs("div", {
				className: "mb-4 grid grid-cols-3 gap-3",
				children: [
					/* @__PURE__ */ jsx(Stat, {
						label: "Spent",
						value: formatRupees(data?.total ?? 0),
						accent: true
					}),
					/* @__PURE__ */ jsx(Stat, {
						label: range === "day" ? "Entries" : "Per day",
						value: range === "day" ? String(data?.count ?? 0) : formatRupees(data?.avgPerDay ?? 0)
					}),
					/* @__PURE__ */ jsx(Stat, {
						label: "Peak day",
						value: data?.peakAmount && data.peakAmount > 0 ? formatRupees(data.peakAmount) : "—",
						hint: data?.peakDay ? fullDay(data.peakDay) : void 0
					})
				]
			}),
			/* @__PURE__ */ jsx("div", {
				className: "h-40",
				children: /* @__PURE__ */ jsx(ResponsiveContainer, {
					width: "100%",
					height: "100%",
					children: /* @__PURE__ */ jsxs(AreaChart, {
						data: chartData,
						margin: {
							top: 6,
							right: 6,
							left: 0,
							bottom: 0
						},
						children: [
							/* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsxs("linearGradient", {
								id: "tl-fill",
								x1: "0",
								y1: "0",
								x2: "0",
								y2: "1",
								children: [/* @__PURE__ */ jsx("stop", {
									offset: "0%",
									stopColor: "#e8a838",
									stopOpacity: .55
								}), /* @__PURE__ */ jsx("stop", {
									offset: "100%",
									stopColor: "#e8a838",
									stopOpacity: .05
								})]
							}) }),
							/* @__PURE__ */ jsx(XAxis, {
								dataKey: "day",
								tick: { fontSize: 10 },
								interval: range === "month" ? 4 : 0,
								axisLine: false,
								tickLine: false
							}),
							/* @__PURE__ */ jsx(YAxis, { hide: true }),
							/* @__PURE__ */ jsx(Tooltip, {
								cursor: {
									stroke: "#e8a838",
									strokeOpacity: .35
								},
								formatter: (v) => [formatRupees(v), "Spent"],
								labelFormatter: (_, payload) => {
									const iso = payload?.[0]?.payload?.date;
									return iso ? fullDay(iso) : "";
								},
								contentStyle: {
									borderRadius: 8,
									fontSize: 12
								}
							}),
							/* @__PURE__ */ jsx(Area, {
								type: "monotone",
								dataKey: "amount",
								stroke: "#e8a838",
								strokeWidth: 2,
								fill: "url(#tl-fill)"
							})
						]
					})
				})
			}),
			(data?.byCategory ?? []).length > 0 && /* @__PURE__ */ jsxs("div", {
				className: "mt-4",
				children: [/* @__PURE__ */ jsxs("p", {
					className: "mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-muted-foreground",
					children: [/* @__PURE__ */ jsx(TrendingUp, { className: "size-3" }), "Where it went"]
				}), /* @__PURE__ */ jsx("div", {
					className: "space-y-1",
					children: data.byCategory.slice(0, 4).map((row) => /* @__PURE__ */ jsxs("div", {
						className: "flex items-center gap-2 text-xs",
						children: [
							/* @__PURE__ */ jsx("span", {
								className: "flex-1 truncate text-muted-foreground",
								children: row.category
							}),
							/* @__PURE__ */ jsx("span", {
								className: "tabular-nums font-semibold",
								children: formatRupees(row.amount)
							}),
							/* @__PURE__ */ jsxs("span", {
								className: "w-8 text-right tabular-nums text-muted-foreground",
								children: [row.pct, "%"]
							})
						]
					}, row.category))
				})]
			})
		] })]
	});
}
function Stat({ label, value, hint, accent }) {
	return /* @__PURE__ */ jsxs("div", {
		className: `rounded-xl border p-2.5 ${accent ? "bg-brand-soft border-brand/40" : "bg-background"}`,
		children: [
			/* @__PURE__ */ jsx("p", {
				className: "text-[10px] font-medium uppercase tracking-widest text-muted-foreground",
				children: label
			}),
			/* @__PURE__ */ jsx("p", {
				className: `mt-0.5 font-display text-base font-extrabold tabular-nums ${accent ? "text-brand-foreground" : ""}`,
				children: value
			}),
			hint && /* @__PURE__ */ jsx("p", {
				className: "mt-0.5 text-[10px] text-muted-foreground",
				children: hint
			})
		]
	});
}
//#endregion
//#region src/components/paisawise/spend-dashboard.tsx
/** Category emoji lookup that tolerates unknown categories from the server. */
function emojiFor(category) {
	return CATEGORY_EMOJI[category] ?? "📦";
}
var CHART_COLORS = [
	"#e8a838",
	"#4ade80",
	"#6366f1",
	"#f87171",
	"#a78bfa",
	"#38bdf8",
	"#fb923c"
];
function SidebarHeader({ tab, onTab, onReset }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "flex items-center justify-between gap-2",
		children: [/* @__PURE__ */ jsx("div", {
			className: "flex gap-1 rounded-lg bg-secondary p-0.5",
			children: [
				"add",
				"dashboard",
				"history"
			].map((id) => /* @__PURE__ */ jsx("button", {
				type: "button",
				onClick: () => onTab(id),
				className: `rounded-md px-2.5 py-1 text-xs font-semibold capitalize transition-colors ${tab === id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`,
				children: id
			}, id))
		}), /* @__PURE__ */ jsxs(Button, {
			variant: "ghost",
			size: "sm",
			onClick: onReset,
			className: "h-7 gap-1.5 px-2 text-xs text-muted-foreground",
			children: [/* @__PURE__ */ jsx(RotateCcw, { className: "size-3.5" }), "Reset"]
		})]
	});
}
function SpendDashboard({ stats, onReset, onDataChanged, usageKey }) {
	const [tab, setTab] = useState("dashboard");
	const [insight, setInsight] = useState(null);
	const [insightLoading, setInsightLoading] = useState(false);
	const chartData = stats.byCategory.map((row) => ({
		name: `${emojiFor(row.category)} ${row.category}`,
		shortName: row.category,
		amount: row.amount,
		pct: row.pct
	}));
	const leaks = stats.byCategory.filter((row) => row.pct >= 35);
	const mediumLeaks = stats.byCategory.filter((row) => row.pct >= 20 && row.pct < 35);
	const fetchMonthlyInsight = useCallback(async () => {
		if (stats.expenseCount === 0) {
			toast.error("Log some expenses first!");
			return;
		}
		setInsightLoading(true);
		try {
			const summaryLines = stats.byCategory.map((row) => `${row.category}: ₹${row.amount} (${row.pct}%)`).join(", ");
			const prompt = `Analyse these expenses of an Indian college student. Total: ₹${stats.totalSpent}. Breakdown: ${summaryLines}. This week: ₹${stats.weekSpent}. Give: top 3 money leaks, 3 realistic saving tips, and a one-line habit to change. Keep it short, friendly, in Indian English. Format as JSON: {"leaks":["..."],"tips":["..."],"habit":"..."}`;
			const res = await fetch("/api/chat", {
				method: "POST",
				credentials: "same-origin",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ messages: [{
					id: "insight-req",
					role: "user",
					content: prompt,
					parts: [{
						type: "text",
						text: prompt
					}]
				}] })
			});
			if (!res.ok) {
				setInsight(generateLocalInsights(stats));
				return;
			}
			const jsonMatch = (await res.text()).match(/\{[\s\S]*?"leaks"[\s\S]*?"tips"[\s\S]*?"habit"[\s\S]*?\}/);
			if (jsonMatch) {
				const parsed = JSON.parse(jsonMatch[0]);
				setInsight(parsed);
			} else setInsight(generateLocalInsights(stats));
		} catch {
			setInsight(generateLocalInsights(stats));
		} finally {
			setInsightLoading(false);
		}
	}, [stats]);
	if (tab === "add") return /* @__PURE__ */ jsxs("aside", {
		className: "flex h-full flex-col gap-4 overflow-y-auto rounded-2xl border bg-card p-5",
		children: [/* @__PURE__ */ jsx(SidebarHeader, {
			tab,
			onTab: setTab,
			onReset
		}), /* @__PURE__ */ jsx(AddExpenseForm, { onAdded: () => {
			onDataChanged();
			setTab("dashboard");
		} })]
	});
	if (tab === "history") return /* @__PURE__ */ jsxs("aside", {
		className: "flex h-full flex-col gap-4 overflow-y-auto rounded-2xl border bg-card p-5",
		children: [/* @__PURE__ */ jsx(SidebarHeader, {
			tab,
			onTab: setTab,
			onReset
		}), /* @__PURE__ */ jsx(ExpenseHistory, { onChanged: onDataChanged })]
	});
	return /* @__PURE__ */ jsxs("aside", {
		className: "flex h-full flex-col gap-4 overflow-y-auto rounded-2xl border bg-card p-5",
		children: [
			/* @__PURE__ */ jsx(SidebarHeader, {
				tab,
				onTab: setTab,
				onReset
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "grid grid-cols-2 gap-3",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "rounded-xl border bg-brand-soft p-3",
					children: [/* @__PURE__ */ jsxs("p", {
						className: "flex items-center gap-1.5 text-xs font-medium text-brand-foreground/70",
						children: [/* @__PURE__ */ jsx(Wallet, { className: "size-3.5" }), " All time"]
					}), /* @__PURE__ */ jsx("p", {
						className: "mt-1 font-display text-2xl font-extrabold text-brand-foreground",
						children: formatRupees(stats.totalSpent)
					})]
				}), /* @__PURE__ */ jsxs("div", {
					className: "rounded-xl border bg-mint-soft p-3",
					children: [/* @__PURE__ */ jsxs("p", {
						className: "flex items-center gap-1.5 text-xs font-medium text-mint-foreground/70",
						children: [/* @__PURE__ */ jsx(TrendingUp, { className: "size-3.5" }), " This week"]
					}), /* @__PURE__ */ jsx("p", {
						className: "mt-1 font-display text-2xl font-extrabold text-mint-foreground",
						children: formatRupees(stats.weekSpent)
					})]
				})]
			}),
			leaks.length > 0 && /* @__PURE__ */ jsxs("div", {
				className: "rounded-xl border border-destructive/30 bg-destructive/5 p-3",
				children: [/* @__PURE__ */ jsxs("p", {
					className: "flex items-center gap-1.5 text-xs font-bold text-destructive",
					children: [/* @__PURE__ */ jsx(AlertTriangle, { className: "size-3.5" }), " Money Leaks Detected"]
				}), leaks.map((leak) => /* @__PURE__ */ jsxs("p", {
					className: "mt-1 text-sm text-destructive/80",
					children: [
						emojiFor(leak.category),
						" ",
						leak.category,
						" is eating",
						" ",
						/* @__PURE__ */ jsxs("span", {
							className: "font-bold",
							children: [leak.pct, "%"]
						}),
						" of your budget (",
						formatRupees(leak.amount),
						")"
					]
				}, leak.category))]
			}),
			mediumLeaks.length > 0 && leaks.length === 0 && /* @__PURE__ */ jsxs("div", {
				className: "rounded-xl border border-brand/30 bg-brand-soft/50 p-3",
				children: [/* @__PURE__ */ jsxs("p", {
					className: "flex items-center gap-1.5 text-xs font-bold text-brand-foreground",
					children: [/* @__PURE__ */ jsx(AlertTriangle, { className: "size-3.5" }), " Watch These"]
				}), mediumLeaks.map((ml) => /* @__PURE__ */ jsxs("p", {
					className: "mt-1 text-sm text-brand-foreground/80",
					children: [
						emojiFor(ml.category),
						" ",
						ml.category,
						": ",
						ml.pct,
						"% (",
						formatRupees(ml.amount),
						")"
					]
				}, ml.category))]
			}),
			/* @__PURE__ */ jsx(Timeline, { refreshKey: usageKey }),
			stats.byCategory.length === 0 ? /* @__PURE__ */ jsx("p", {
				className: "rounded-xl border border-dashed p-4 text-sm text-muted-foreground",
				children: "Log your first expense and your category breakdown builds up here."
			}) : /* @__PURE__ */ jsxs(Fragment, { children: [
				/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h3", {
					className: "mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground",
					children: "By category"
				}), /* @__PURE__ */ jsx("div", {
					className: "space-y-2",
					children: stats.byCategory.map((row, i) => /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("div", {
						className: "flex items-baseline justify-between text-sm",
						children: [/* @__PURE__ */ jsxs("span", {
							className: "font-medium",
							children: [
								/* @__PURE__ */ jsx("span", {
									"aria-hidden": true,
									children: emojiFor(row.category)
								}),
								" ",
								row.category
							]
						}), /* @__PURE__ */ jsxs("span", {
							className: "tabular-nums",
							children: [/* @__PURE__ */ jsx("span", {
								className: "font-semibold",
								children: formatRupees(row.amount)
							}), /* @__PURE__ */ jsxs("span", {
								className: "ml-1.5 text-xs text-muted-foreground",
								children: [row.pct, "%"]
							})]
						})]
					}), /* @__PURE__ */ jsx("div", {
						className: "mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted",
						children: /* @__PURE__ */ jsx("div", {
							className: "h-full rounded-full transition-all",
							style: {
								width: `${Math.max(3, row.pct)}%`,
								backgroundColor: CHART_COLORS[i % CHART_COLORS.length]
							}
						})
					})] }, row.category))
				})] }),
				/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("h3", {
					className: "mb-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-muted-foreground",
					children: [/* @__PURE__ */ jsx(BarChart3, { className: "size-3.5" }), " Spend by category"]
				}), /* @__PURE__ */ jsx("div", {
					className: "h-44",
					children: /* @__PURE__ */ jsx(ResponsiveContainer, {
						width: "100%",
						height: "100%",
						children: /* @__PURE__ */ jsxs(BarChart, {
							data: chartData,
							layout: "vertical",
							margin: {
								left: 0,
								right: 8
							},
							children: [
								/* @__PURE__ */ jsx(XAxis, {
									type: "number",
									hide: true
								}),
								/* @__PURE__ */ jsx(YAxis, {
									type: "category",
									dataKey: "shortName",
									width: 72,
									tick: { fontSize: 11 }
								}),
								/* @__PURE__ */ jsx(Tooltip, {
									formatter: (value) => [formatRupees(value), "Spent"],
									contentStyle: {
										borderRadius: 8,
										fontSize: 12
									}
								}),
								/* @__PURE__ */ jsx(Bar, {
									dataKey: "amount",
									radius: [
										0,
										6,
										6,
										0
									],
									children: chartData.map((_, i) => /* @__PURE__ */ jsx(Cell, { fill: CHART_COLORS[i % CHART_COLORS.length] }, `bar-${i}`))
								})
							]
						})
					})
				})] }),
				/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("h3", {
					className: "mb-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-muted-foreground",
					children: [/* @__PURE__ */ jsx(PieChartIcon, { className: "size-3.5" }), " Share of spend"]
				}), /* @__PURE__ */ jsx("div", {
					className: "h-52",
					children: /* @__PURE__ */ jsx(ResponsiveContainer, {
						width: "100%",
						height: "100%",
						children: /* @__PURE__ */ jsxs(PieChart, { children: [
							/* @__PURE__ */ jsx(Pie, {
								data: chartData,
								dataKey: "amount",
								nameKey: "shortName",
								cx: "50%",
								cy: "50%",
								outerRadius: 68,
								innerRadius: 34,
								paddingAngle: 2,
								label: ({ pct }) => `${pct}%`,
								labelLine: false,
								style: { fontSize: 10 },
								children: chartData.map((_, i) => /* @__PURE__ */ jsx(Cell, { fill: CHART_COLORS[i % CHART_COLORS.length] }, `pie-${i}`))
							}),
							/* @__PURE__ */ jsx(Legend, {
								verticalAlign: "bottom",
								height: 24,
								iconSize: 8,
								wrapperStyle: { fontSize: 10 }
							}),
							/* @__PURE__ */ jsx(Tooltip, {
								formatter: (value) => [formatRupees(value), "Spent"],
								contentStyle: {
									borderRadius: 8,
									fontSize: 12
								}
							})
						] })
					})
				})] })
			] }),
			/* @__PURE__ */ jsx(UsageMeter, { refreshKey: usageKey }),
			/* @__PURE__ */ jsxs("div", {
				className: "border-t pt-4",
				children: [/* @__PURE__ */ jsxs(Button, {
					variant: "outline",
					size: "sm",
					onClick: fetchMonthlyInsight,
					disabled: insightLoading || stats.expenseCount === 0,
					className: "w-full gap-1.5",
					children: [/* @__PURE__ */ jsx(Brain, { className: "size-3.5" }), insightLoading ? "Analysing..." : "Get Monthly Insights"]
				}), insight && /* @__PURE__ */ jsxs("div", {
					className: "mt-3 space-y-3",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "rounded-xl border border-destructive/20 bg-destructive/5 p-3",
							children: [/* @__PURE__ */ jsx("p", {
								className: "text-xs font-bold text-destructive",
								children: "Top Money Leaks"
							}), insight.leaks.map((leak, i) => /* @__PURE__ */ jsxs("p", {
								className: "mt-1 text-xs text-foreground",
								children: [
									i + 1,
									". ",
									leak
								]
							}, i))]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "rounded-xl border border-mint/30 bg-mint-soft p-3",
							children: [/* @__PURE__ */ jsx("p", {
								className: "text-xs font-bold text-mint-foreground",
								children: "Saving Tips"
							}), insight.tips.map((tip, i) => /* @__PURE__ */ jsxs("p", {
								className: "mt-1 text-xs text-foreground",
								children: [
									i + 1,
									". ",
									tip
								]
							}, i))]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "rounded-xl border bg-brand-soft p-3",
							children: [/* @__PURE__ */ jsx("p", {
								className: "text-xs font-bold text-brand-foreground",
								children: "Habit to Change"
							}), /* @__PURE__ */ jsx("p", {
								className: "mt-1 text-xs text-foreground",
								children: insight.habit
							})]
						})
					]
				})]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "mt-auto grid grid-cols-2 gap-3 border-t pt-4 text-sm",
				children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
					className: "text-xs text-muted-foreground",
					children: "Expenses logged"
				}), /* @__PURE__ */ jsx("p", {
					className: "font-display text-lg font-bold tabular-nums",
					children: stats.expenseCount
				})] }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
					className: "text-xs text-muted-foreground",
					children: "Income logged"
				}), /* @__PURE__ */ jsx("p", {
					className: "font-display text-lg font-bold tabular-nums text-mint",
					children: formatRupees(stats.totalIncome)
				})] })]
			})
		]
	});
}
/** Fallback insights when AI is unavailable */
function generateLocalInsights(stats) {
	const sorted = [...stats.byCategory].sort((a, b) => b.amount - a.amount);
	return {
		leaks: sorted.slice(0, 3).map((row) => `${emojiFor(row.category)} ${row.category} at ${row.pct}% (${formatRupees(row.amount)}) — consider cutting by 20%`),
		tips: [
			sorted[0] ? `Cook one more meal at home per week to save ~₹${Math.round(sorted[0].amount * .15)} on ${sorted[0].category}` : "Track every expense for a week to spot patterns",
			"Use student discounts on Amazon, Flipkart and Zomato Pro",
			"Start a ₹100/month SIP on Groww — builds the investing habit"
		],
		habit: sorted[0] ? `Before every ${sorted[0].category.toLowerCase()} purchase, ask: "Do I need this or do I want this?"` : "Track before you spend — awareness alone cuts costs by 10%."
	};
}
//#endregion
//#region src/components/paisawise/receipt-capture.tsx
var MAX_FILE_BYTES = 15 * 1024 * 1024;
function ReceiptCapture({ onSaved }) {
	const fileRef = useRef(null);
	const [preview, setPreview] = useState(null);
	const [scanning, setScanning] = useState(false);
	const [saving, setSaving] = useState(false);
	const [items, setItems] = useState(null);
	const [confidence, setConfidence] = useState("");
	const reset = useCallback(() => {
		setPreview(null);
		setItems(null);
		setConfidence("");
		setScanning(false);
		setSaving(false);
		if (fileRef.current) fileRef.current.value = "";
	}, []);
	const handleFile = useCallback(async (file) => {
		if (!file.type.startsWith("image/")) {
			toast.error("Please choose an image file.");
			return;
		}
		if (file.size > MAX_FILE_BYTES) {
			toast.error("That image is very large. Try a smaller photo.");
			return;
		}
		setScanning(true);
		setItems(null);
		try {
			const dataUrl = await compressImage(file);
			setPreview(dataUrl);
			const result = await scanReceipt(dataUrl);
			if (!result.ok) {
				toast.error(result.error);
				setScanning(false);
				return;
			}
			if (result.data.items.length === 0) {
				toast.error(result.data.message ?? "Nothing readable in that image.");
				setScanning(false);
				return;
			}
			setItems(result.data.items);
			setConfidence(result.data.confidence);
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Could not read that image.");
		} finally {
			setScanning(false);
		}
	}, []);
	const updateItem = useCallback((index, patch) => {
		setItems((current) => current ? current.map((item, i) => i === index ? {
			...item,
			...patch
		} : item) : current);
	}, []);
	const removeItem = useCallback((index) => {
		setItems((current) => current ? current.filter((_, i) => i !== index) : current);
	}, []);
	const confirm = useCallback(async () => {
		if (!items || items.length === 0) return;
		setSaving(true);
		const result = await addExpenses(items);
		setSaving(false);
		if (!result.ok) {
			toast.error(result.error);
			return;
		}
		toast.success(`Added ${result.data.inserted} expense${result.data.inserted === 1 ? "" : "s"}.`);
		onSaved();
		reset();
	}, [
		items,
		onSaved,
		reset
	]);
	const total = items?.reduce((sum, item) => sum + item.amount, 0) ?? 0;
	return /* @__PURE__ */ jsxs(Fragment, { children: [
		/* @__PURE__ */ jsx("input", {
			ref: fileRef,
			type: "file",
			accept: "image/*",
			capture: "environment",
			className: "hidden",
			onChange: (e) => {
				const file = e.target.files?.[0];
				if (file) handleFile(file);
			}
		}),
		/* @__PURE__ */ jsxs(Button, {
			type: "button",
			variant: "outline",
			size: "sm",
			onClick: () => fileRef.current?.click(),
			disabled: scanning,
			className: "gap-1.5",
			title: "Photograph a receipt and let PaisaWise read it",
			children: [scanning ? /* @__PURE__ */ jsx(Loader2, { className: "size-3.5 animate-spin" }) : /* @__PURE__ */ jsx(Camera, { className: "size-3.5" }), scanning ? "Reading..." : "Scan receipt"]
		}),
		items && items.length > 0 && /* @__PURE__ */ jsx("div", {
			className: "fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4",
			children: /* @__PURE__ */ jsxs("div", {
				className: "max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border bg-card p-5 shadow-warm",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "mb-4 flex items-start justify-between gap-3",
						children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h2", {
							className: "font-display text-lg font-extrabold",
							children: "Check before saving"
						}), /* @__PURE__ */ jsx("p", {
							className: "mt-0.5 text-xs text-muted-foreground",
							children: "Scanned from your photo. Edit anything that looks wrong."
						})] }), /* @__PURE__ */ jsx("button", {
							type: "button",
							onClick: reset,
							className: "rounded-lg p-1.5 text-muted-foreground hover:bg-accent",
							children: /* @__PURE__ */ jsx(X, { className: "size-4" })
						})]
					}),
					confidence === "low" && /* @__PURE__ */ jsx("p", {
						className: "mb-3 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive",
						children: "The photo was hard to read — double-check these amounts carefully."
					}),
					preview && /* @__PURE__ */ jsx("img", {
						src: preview,
						alt: "Receipt preview",
						className: "mb-4 max-h-36 w-full rounded-lg border object-contain bg-secondary"
					}),
					/* @__PURE__ */ jsx("div", {
						className: "space-y-2",
						children: items.map((item, index) => /* @__PURE__ */ jsxs("div", {
							className: "rounded-xl border bg-background p-2.5",
							children: [/* @__PURE__ */ jsxs("div", {
								className: "flex items-center gap-2",
								children: [
									/* @__PURE__ */ jsx("span", {
										className: "text-sm",
										children: CATEGORY_EMOJI[item.category] ?? "📦"
									}),
									/* @__PURE__ */ jsx("input", {
										type: "number",
										value: item.amount,
										min: 1,
										step: "0.01",
										onChange: (e) => updateItem(index, { amount: Number(e.target.value) }),
										className: "w-24 rounded-md border bg-card px-2 py-1 text-sm tabular-nums outline-none focus:border-brand"
									}),
									/* @__PURE__ */ jsx("select", {
										value: item.category,
										onChange: (e) => updateItem(index, { category: e.target.value }),
										className: "rounded-md border bg-card px-2 py-1 text-xs outline-none focus:border-brand",
										children: PW_CATEGORIES.map((category) => /* @__PURE__ */ jsx("option", {
											value: category,
											children: category
										}, category))
									}),
									/* @__PURE__ */ jsx("button", {
										type: "button",
										onClick: () => removeItem(index),
										className: "ml-auto rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive",
										title: "Remove this item",
										children: /* @__PURE__ */ jsx(Trash2, { className: "size-3.5" })
									})
								]
							}), /* @__PURE__ */ jsx("input", {
								type: "text",
								value: item.note,
								onChange: (e) => updateItem(index, { note: e.target.value }),
								placeholder: "Description",
								maxLength: 280,
								className: "mt-1.5 w-full rounded-md border bg-card px-2 py-1 text-xs outline-none focus:border-brand"
							})]
						}, index))
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "mt-4 flex items-center justify-between border-t pt-3",
						children: [/* @__PURE__ */ jsxs("p", {
							className: "text-sm",
							children: [/* @__PURE__ */ jsx("span", {
								className: "text-muted-foreground",
								children: "Total "
							}), /* @__PURE__ */ jsx("span", {
								className: "font-display font-extrabold",
								children: formatRupees(total)
							})]
						}), /* @__PURE__ */ jsxs("div", {
							className: "flex gap-2",
							children: [/* @__PURE__ */ jsx(Button, {
								variant: "ghost",
								size: "sm",
								onClick: reset,
								disabled: saving,
								children: "Cancel"
							}), /* @__PURE__ */ jsxs(Button, {
								size: "sm",
								onClick: confirm,
								disabled: saving,
								className: "gap-1.5",
								children: [saving ? /* @__PURE__ */ jsx(Loader2, { className: "size-3.5 animate-spin" }) : /* @__PURE__ */ jsx(Check, { className: "size-3.5" }), saving ? "Saving..." : `Add ${items.length}`]
							})]
						})]
					})
				]
			})
		})
	] });
}
//#endregion
//#region src/lib/expense-parser.ts
var CATEGORY_KEYWORDS = {
	zomato: "Food",
	swiggy: "Food",
	chai: "Food",
	maggi: "Food",
	samosa: "Food",
	biryani: "Food",
	dhaba: "Food",
	mess: "Food",
	canteen: "Food",
	tiffin: "Food",
	lunch: "Food",
	dinner: "Food",
	breakfast: "Food",
	snacks: "Food",
	snack: "Food",
	food: "Food",
	blinkit: "Food",
	zepto: "Food",
	bigbasket: "Food",
	instamart: "Food",
	groceries: "Food",
	grocery: "Food",
	pizza: "Food",
	burger: "Food",
	coffee: "Food",
	tea: "Food",
	juice: "Food",
	restaurant: "Food",
	auto: "Travel",
	rickshaw: "Travel",
	rikshaw: "Travel",
	riksha: "Travel",
	rickshah: "Travel",
	autorickshaw: "Travel",
	rick: "Travel",
	rapido: "Travel",
	ola: "Travel",
	uber: "Travel",
	metro: "Travel",
	bus: "Travel",
	train: "Travel",
	petrol: "Travel",
	diesel: "Travel",
	fuel: "Travel",
	cab: "Travel",
	taxi: "Travel",
	travel: "Travel",
	flight: "Travel",
	xerox: "Education",
	photocopy: "Education",
	printout: "Education",
	stationery: "Education",
	books: "Education",
	book: "Education",
	tuition: "Education",
	coaching: "Education",
	course: "Education",
	udemy: "Education",
	coursera: "Education",
	college: "Education",
	fees: "Education",
	movie: "Entertainment",
	bookmyshow: "Entertainment",
	netflix: "Entertainment",
	spotify: "Entertainment",
	gaming: "Entertainment",
	game: "Entertainment",
	hotstar: "Entertainment",
	prime: "Entertainment",
	youtube: "Entertainment",
	concert: "Entertainment",
	party: "Entertainment",
	amazon: "Shopping",
	flipkart: "Shopping",
	myntra: "Shopping",
	ajio: "Shopping",
	nykaa: "Shopping",
	clothes: "Shopping",
	shoes: "Shopping",
	shirt: "Shopping",
	jeans: "Shopping",
	earphones: "Shopping",
	headphones: "Shopping",
	gadget: "Shopping",
	recharge: "Bills",
	jio: "Bills",
	airtel: "Bills",
	vi: "Bills",
	wifi: "Bills",
	broadband: "Bills",
	hostel: "Bills",
	rent: "Bills",
	electricity: "Bills",
	water: "Bills",
	laundry: "Bills",
	subscription: "Bills"
};
var MERCHANT_NAMES = /* @__PURE__ */ new Set([
	"zomato",
	"swiggy",
	"blinkit",
	"zepto",
	"bigbasket",
	"instamart",
	"rapido",
	"ola",
	"uber",
	"amazon",
	"flipkart",
	"myntra",
	"ajio",
	"nykaa",
	"netflix",
	"spotify",
	"hotstar",
	"bookmyshow",
	"udemy",
	"coursera",
	"jio",
	"airtel"
]);
var UPI_APPS = /* @__PURE__ */ new Set([
	"gpay",
	"phonepe",
	"paytm",
	"upi",
	"google pay"
]);
/**
* Extracts amount from a string. Handles:
* - "250", "1500", "₹250", "Rs 250", "Rs. 250"
* - "1.2k" → 1200, "2.5k" → 2500
* - Amount anywhere in the string
*/
function extractAmount(text) {
	for (const pattern of [
		/(?:₹|rs\.?\s*)(\d+(?:\.\d+)?)\s*k\b/i,
		/(\d+(?:\.\d+)?)\s*k\b/i,
		/(?:₹|rs\.?\s*)(\d+(?:,\d{3})*(?:\.\d+)?)/i,
		/(\d+(?:,\d{3})*(?:\.\d+)?)/
	]) {
		const match = text.match(pattern);
		if (match) {
			const numStr = match[1].replace(/,/g, "");
			let amount = parseFloat(numStr);
			if (pattern.source.includes("k\\b")) amount *= 1e3;
			if (amount > 0 && amount < 1e7) {
				const rest = text.replace(match[0], "").trim();
				return {
					amount,
					rest
				};
			}
		}
	}
	return null;
}
function detectCategory(words) {
	for (const word of words) {
		const lower = word.toLowerCase().replace(/[^a-z]/g, "");
		if (CATEGORY_KEYWORDS[lower]) return CATEGORY_KEYWORDS[lower];
	}
	return "Other";
}
function detectMerchant(words) {
	for (const word of words) {
		const lower = word.toLowerCase().replace(/[^a-z]/g, "");
		if (MERCHANT_NAMES.has(lower)) return word;
	}
	return null;
}
function isIncomeEntry(text) {
	return /\b(earned|income|salary|freelance|stipend|received|got paid|payment received)\b/i.test(text);
}
/** Filler words that add nothing to the note. */
var FILLER_WORDS = /* @__PURE__ */ new Set([
	"rs",
	"rs.",
	"rupees",
	"inr",
	"for",
	"and",
	"to",
	"the",
	"a",
	"an",
	"at",
	"on",
	"of",
	"my",
	"i",
	"spent",
	"paid",
	"was",
	"is",
	"it",
	"today",
	"yesterday",
	"some",
	"got"
]);
function cleanWord(word) {
	return word.replace(/[^a-zA-Z]/g, "").toLowerCase();
}
function titleCase(word) {
	const clean = word.replace(/[^a-zA-Z]/g, "");
	return clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase();
}
/**
* Splits raw input into individual expense segments.
*
* Splits on: newlines, semicolons, "and", "&", and commas —
* but NOT commas used as thousands separators (e.g. "1,500 amazon").
*/
function segmentInput(text) {
	const segments = [];
	for (const line of text.split(/[\n;]+/)) {
		const parts = line.split(/\s*,\s*(?!\d{3}(?:\D|$))|\s+and\s+|\s*&\s*/i).map((p) => p.trim().replace(/^and\s+/i, "").trim()).filter(Boolean);
		segments.push(...parts);
	}
	return segments;
}
/**
* Parses a single expense segment.
* Returns null if no amount is found.
*/
function parseExpenseLine(line) {
	const trimmed = line.trim();
	if (!trimmed) return null;
	const extracted = extractAmount(trimmed);
	if (!extracted) return null;
	const { amount, rest } = extracted;
	const words = rest.split(/\s+/).filter((w) => w.length > 0).filter((w) => !UPI_APPS.has(cleanWord(w)));
	const isIncome = isIncomeEntry(trimmed);
	const category = isIncome ? "Other" : detectCategory(words);
	const merchantRaw = detectMerchant(words);
	return {
		amount,
		category,
		merchant: merchantRaw ? titleCase(merchantRaw) : null,
		note: words.filter((w) => {
			const clean = cleanWord(w);
			if (!clean) return false;
			if (FILLER_WORDS.has(clean)) return false;
			if (merchantRaw && clean === cleanWord(merchantRaw)) return false;
			return true;
		}).join(" ") || (isIncome ? "income" : "expense"),
		type: isIncome ? "income" : "expense"
	};
}
/**
* Parses expense input — handles both bulk paste (one per line)
* and natural single-line lists ("340 swiggy, 30 auto, 50 coffee").
*/
function parseExpenseInput(text) {
	const results = [];
	for (const segment of segmentInput(text)) {
		const parsed = parseExpenseLine(segment);
		if (parsed) results.push(parsed);
	}
	return results;
}
//#endregion
//#region src/components/paisawise/chat-window.tsx
var QUICK_PROMPTS = [
	"250 zomato dinner with friends",
	"250 zomato dinner\n30 auto college\n1500 amazon earphones\n120 chai snacks\n500 rent share gpay",
	"earned 5000 freelance logo design"
];
var EMPTY_STATS = {
	totalSpent: 0,
	weekSpent: 0,
	monthSpent: 0,
	totalIncome: 0,
	expenseCount: 0,
	byCategory: []
};
function messageText(message) {
	return message.parts.map((p) => p.type === "text" ? p.text : "").join("");
}
function ChatWindow() {
	const [initialMessages, setInitialMessages] = useState(null);
	const [stats, setStats] = useState(EMPTY_STATS);
	const [usageKey, setUsageKey] = useState(0);
	const inputRef = useRef(null);
	const seenIds = useRef(/* @__PURE__ */ new Set());
	const pendingSkip = useRef([]);
	const saveTimer = useRef(null);
	useEffect(() => {
		Promise.all([getChatHistory(), getStats()]).then(([history, serverStats]) => {
			setInitialMessages(history);
			setStats(serverStats);
		});
	}, []);
	const transport = useMemo(() => new DefaultChatTransport({ api: "/api/chat" }), []);
	const { messages, sendMessage, status, setMessages, stop } = useChat({
		id: "paisawise-main",
		messages: initialMessages ?? [],
		transport,
		onError: (error) => {
			toast.error(error.message || "Couldn't reach PaisaWise. Try again in a moment.");
		}
	});
	const isBusy = status === "submitted" || status === "streaming";
	const refreshStats = useCallback(() => {
		getStats().then(setStats);
		setUsageKey((k) => k + 1);
	}, []);
	useEffect(() => {
		if (!initialMessages || messages.length === 0) return;
		if (saveTimer.current) clearTimeout(saveTimer.current);
		saveTimer.current = setTimeout(() => {
			saveChatHistory(messages);
		}, 1200);
		return () => {
			if (saveTimer.current) clearTimeout(saveTimer.current);
		};
	}, [messages, initialMessages]);
	useEffect(() => {
		if (status === "streaming" || status === "submitted") return;
		const newEntries = [];
		for (const message of messages) {
			if (message.role !== "assistant" || seenIds.current.has(message.id)) continue;
			seenIds.current.add(message.id);
			if (pendingSkip.current.shift()) continue;
			for (const entry of parseLedgerEntries(messageText(message))) newEntries.push(entry);
		}
		if (newEntries.length > 0) addExpenses(newEntries).then((result) => {
			if (!result.ok) {
				toast.error(result.error);
				return;
			}
			refreshStats();
		});
	}, [
		messages,
		status,
		refreshStats
	]);
	const focusInput = useCallback(() => {
		requestAnimationFrame(() => inputRef.current?.focus());
	}, []);
	useEffect(() => {
		focusInput();
	}, [focusInput]);
	useEffect(() => {
		if (status === "ready") focusInput();
	}, [status, focusInput]);
	const send = useCallback((text) => {
		const trimmed = text.trim();
		if (!trimmed || isBusy) return;
		const parsed = parseExpenseInput(trimmed);
		pendingSkip.current.push(parsed.length > 0);
		if (parsed.length > 0) addExpenses(parsed).then((result) => {
			if (!result.ok) {
				toast.error(result.error);
				return;
			}
			refreshStats();
		});
		sendMessage({ text: trimmed });
		focusInput();
	}, [
		isBusy,
		sendMessage,
		focusInput,
		refreshStats
	]);
	const newConversation = useCallback(() => {
		stop();
		setMessages([]);
		clearChatHistory();
		seenIds.current.clear();
		pendingSkip.current = [];
		focusInput();
	}, [
		setMessages,
		stop,
		focusInput
	]);
	const resetLedger = useCallback(async () => {
		const result = await clearExpenses();
		if (!result.ok) {
			toast.error(result.error);
			return;
		}
		setStats(EMPTY_STATS);
		toast.success("Ledger cleared. Fresh start!");
	}, []);
	if (!initialMessages) return /* @__PURE__ */ jsx("div", {
		className: "mx-auto w-full max-w-7xl flex-1 px-4 pb-4",
		children: /* @__PURE__ */ jsx("div", { className: "h-full min-h-[60vh] animate-pulse rounded-2xl border bg-card" })
	});
	return /* @__PURE__ */ jsxs("div", {
		className: "mx-auto grid w-full max-w-7xl flex-1 gap-4 px-4 pb-4 lg:grid-cols-[minmax(0,1fr)_320px]",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "flex min-h-0 flex-col rounded-2xl border bg-card",
			children: [
				/* @__PURE__ */ jsxs("div", {
					className: "flex items-center justify-between gap-2 border-b px-4 py-3",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "flex items-center gap-2 text-sm text-muted-foreground",
						children: [/* @__PURE__ */ jsx("span", {
							className: "size-2 rounded-full bg-mint",
							"aria-hidden": true
						}), "Synced to your account"]
					}), /* @__PURE__ */ jsxs("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ jsx(ReceiptCapture, { onSaved: refreshStats }), /* @__PURE__ */ jsxs(Button, {
							variant: "outline",
							size: "sm",
							onClick: newConversation,
							className: "gap-1.5",
							children: [/* @__PURE__ */ jsx(Plus, { className: "size-3.5" }), "New chat"]
						})]
					})]
				}),
				/* @__PURE__ */ jsxs(Conversation, {
					className: "min-h-0 flex-1",
					children: [/* @__PURE__ */ jsxs(ConversationContent, {
						className: "pw-mono gap-5",
						children: [messages.length === 0 ? /* @__PURE__ */ jsxs("div", {
							className: "flex flex-col items-center gap-4 py-10 text-center",
							children: [
								/* @__PURE__ */ jsx(PaisaWiseMark, {
									size: 64,
									eager: true
								}),
								/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h2", {
									className: "font-display text-2xl font-extrabold",
									children: "Tell me what you spent today"
								}), /* @__PURE__ */ jsx("p", {
									className: "mt-1 text-sm text-muted-foreground",
									children: "Type like you talk. Paste a whole list if you want."
								})] }),
								/* @__PURE__ */ jsx("div", {
									className: "flex w-full max-w-lg flex-col gap-2",
									children: QUICK_PROMPTS.map((prompt) => /* @__PURE__ */ jsx("button", {
										type: "button",
										onClick: () => send(prompt),
										className: "rounded-xl border bg-background px-4 py-3 text-left text-sm transition-colors hover:border-brand hover:bg-brand-soft",
										children: /* @__PURE__ */ jsx("span", {
											className: "whitespace-pre-line",
											children: prompt
										})
									}, prompt))
								})
							]
						}) : messages.map((message) => {
							const text = messageText(message);
							if (message.role === "user") return /* @__PURE__ */ jsx(Message, {
								from: "user",
								children: /* @__PURE__ */ jsx(MessageContent, {
									className: "whitespace-pre-line bg-primary text-primary-foreground",
									children: text
								})
							}, message.id);
							return /* @__PURE__ */ jsx(Message, {
								from: "assistant",
								children: /* @__PURE__ */ jsx(MessageContent, {
									className: "bg-transparent p-0 text-foreground",
									children: /* @__PURE__ */ jsx(MessageResponse, { children: stripLedgerBlock(text) })
								})
							}, message.id);
						}), status === "submitted" ? /* @__PURE__ */ jsx(Shimmer, {
							className: "text-sm",
							children: "Crunching your paisa..."
						}) : null]
					}), /* @__PURE__ */ jsx(ConversationScrollButton, {})]
				}),
				/* @__PURE__ */ jsx("div", {
					className: "border-t p-3",
					children: /* @__PURE__ */ jsxs(PromptInput, {
						onSubmit: (message) => send(message.text),
						children: [/* @__PURE__ */ jsx(PromptInputTextarea, {
							ref: inputRef,
							autoFocus: true,
							placeholder: "e.g. 250 zomato dinner, auto 30 college, 1.2k myntra shoes"
						}), /* @__PURE__ */ jsx(PromptInputFooter, {
							className: "justify-end",
							children: /* @__PURE__ */ jsx(PromptInputSubmit, {
								status,
								onStop: stop
							})
						})]
					})
				})
			]
		}), /* @__PURE__ */ jsx(SpendDashboard, {
			stats,
			onReset: resetLedger,
			onDataChanged: refreshStats,
			usageKey
		})]
	});
}
//#endregion
export { ChatWindow };
