import * as React from "react";
import { Link } from "@tanstack/react-router";
import { jsx, jsxs } from "react/jsx-runtime";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
//#region src/lib/utils.ts
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
//#endregion
//#region src/components/ui/button.tsx
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0", {
	variants: {
		variant: {
			default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
			destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
			outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
			secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
			ghost: "hover:bg-accent hover:text-accent-foreground",
			link: "text-primary underline-offset-4 hover:underline"
		},
		size: {
			default: "h-9 px-4 py-2",
			sm: "h-8 rounded-md px-3 text-xs",
			lg: "h-10 rounded-md px-8",
			icon: "h-9 w-9",
			"icon-sm": "size-8 p-0",
			"icon-xs": "size-6 rounded-md p-0"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
var Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
	return /* @__PURE__ */ jsx(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size,
			className
		})),
		ref,
		...props
	});
});
Button.displayName = "Button";
//#endregion
//#region src/assets/paisawise-logo.png
var paisawise_logo_default = "/assets/paisawise-logo-DzBm0QqC.png";
//#endregion
//#region src/components/paisawise/brand.tsx
function PaisaWiseMark({ className, size = 36, eager = false }) {
	return /* @__PURE__ */ jsx("img", {
		src: paisawise_logo_default,
		alt: "PaisaWise logo",
		width: size,
		height: size,
		loading: eager ? "eager" : "lazy",
		className: cn("shrink-0", className),
		style: {
			width: size,
			height: size
		}
	});
}
function PaisaWiseWordmark({ className, markSize = 32, eager = false }) {
	return /* @__PURE__ */ jsxs(Link, {
		to: "/",
		className: cn("flex items-center gap-2.5", className),
		children: [/* @__PURE__ */ jsx(PaisaWiseMark, {
			size: markSize,
			eager
		}), /* @__PURE__ */ jsxs("span", {
			className: "font-display text-xl font-extrabold tracking-tight",
			children: ["Paisa", /* @__PURE__ */ jsx("span", {
				className: "text-brand",
				children: "Wise"
			})]
		})]
	});
}
//#endregion
export { cn as i, PaisaWiseWordmark as n, Button as r, PaisaWiseMark as t };
