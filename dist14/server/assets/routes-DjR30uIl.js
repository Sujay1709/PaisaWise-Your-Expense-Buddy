import { i as cn, n as PaisaWiseWordmark, r as Button, t as PaisaWiseMark } from "./brand-e9Pfhvdj.js";
import { t as FAQ } from "./routes-BV3IDFKZ.js";
import { t as ThemeToggle } from "./theme-toggle-DhJ8Pz73.js";
import * as React from "react";
import { Link } from "@tanstack/react-router";
import { jsx, jsxs } from "react/jsx-runtime";
import { ArrowRight, BarChart3, ChevronDown, ClipboardList, Lightbulb, Lock, MessagesSquare, Rocket, Sparkle, Wallet } from "lucide-react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
//#region src/components/ui/accordion.tsx
var Accordion = AccordionPrimitive.Root;
var AccordionItem = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(AccordionPrimitive.Item, {
	ref,
	className: cn("border-b", className),
	...props
}));
AccordionItem.displayName = "AccordionItem";
var AccordionTrigger = React.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsx(AccordionPrimitive.Header, {
	className: "flex",
	children: /* @__PURE__ */ jsxs(AccordionPrimitive.Trigger, {
		ref,
		className: cn("flex flex-1 items-center justify-between py-4 text-sm font-medium cursor-pointer transition-all hover:underline text-left [&[data-state=open]>svg]:rotate-180", className),
		...props,
		children: [children, /* @__PURE__ */ jsx(ChevronDown, { className: "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" })]
	})
}));
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;
var AccordionContent = React.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsx(AccordionPrimitive.Content, {
	ref,
	className: "overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
	...props,
	children: /* @__PURE__ */ jsx("div", {
		className: cn("pb-4 pt-0", className),
		children
	})
}));
AccordionContent.displayName = AccordionPrimitive.Content.displayName;
//#endregion
//#region src/routes/index.tsx?tsr-split=component
var FEATURES = [
	{
		icon: MessagesSquare,
		title: "Type like you talk",
		body: "“1.2k myntra shoes”, “auto to college 30”, “Rs. 500 rent share” — amounts anywhere, k-notation, rupee symbols. It all parses."
	},
	{
		icon: Sparkle,
		title: "Built for India",
		body: "Auto, mess, xerox, recharge, chai, rapido, blinkit — categorised the way students actually spend, not a US budgeting app's guess."
	},
	{
		icon: ClipboardList,
		title: "Bulk paste your day",
		body: "One expense per line. PaisaWise splits it, categorises each entry and gives you a flashcard for every one."
	},
	{
		icon: BarChart3,
		title: "Visual snapshot",
		body: "Category bars, percentages and a running total — you see where the money leaked in one glance."
	},
	{
		icon: Lightbulb,
		title: "Savings tips in rupees",
		body: "Not generic advice. Real numbers tied to what you actually spent, framed as things you care about."
	},
	{
		icon: Rocket,
		title: "Student hustle nudges",
		body: "Freelancing, campus jobs, selling notes, ₹100 SIPs, student discounts — realistic ways to grow the other side of the equation."
	},
	{
		icon: Wallet,
		title: "Running dashboard",
		body: "All-time and weekly totals per category, built up automatically from every expense you log."
	},
	{
		icon: Lock,
		title: "Your data, your call",
		body: "Your ledger is yours. Clear it or delete your account and everything goes with it, no questions asked."
	}
];
var CATEGORIES = [
	"🍕 Food",
	"🚗 Travel",
	"📚 Education",
	"🎬 Entertainment",
	"🛍️ Shopping",
	"📱 Bills",
	"📦 Other"
];
var DEMO_OUTPUT = `┌─────────────────────────────┐
│ 🍕 FOOD                     │
│ ₹250 · Zomato               │
│ dinner with friends         │
└─────────────────────────────┘
┌─────────────────────────────┐
│ 🚗 TRAVEL                   │
│ ₹30 · —                     │
│ auto to college             │
└─────────────────────────────┘
┌─────────────────────────────┐
│ 🛍️ SHOPPING                 │
│ ₹1,500 · Amazon             │
│ earphones                   │
└─────────────────────────────┘

📊 SPENDING SNAPSHOT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🛍️ Shopping  ₹1,500  ███████████████  84%
🍕 Food      ₹  250  ███░░░░░░░░░░░░  14%
🚗 Travel    ₹   30  █░░░░░░░░░░░░░░   2%
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💰 Total: ₹1,780`;
function Landing() {
	return /* @__PURE__ */ jsxs("div", {
		className: "min-h-svh",
		children: [
			/* @__PURE__ */ jsxs("header", {
				className: "mx-auto flex max-w-6xl items-center justify-between px-5 py-5",
				children: [/* @__PURE__ */ jsx(PaisaWiseWordmark, {
					markSize: 32,
					eager: true
				}), /* @__PURE__ */ jsxs("nav", {
					className: "flex items-center gap-1 sm:gap-3",
					children: [
						/* @__PURE__ */ jsx("a", {
							href: "#features",
							className: "hidden rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:block",
							children: "Features"
						}),
						/* @__PURE__ */ jsx("a", {
							href: "#faq",
							className: "hidden rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:block",
							children: "FAQ"
						}),
						/* @__PURE__ */ jsx(ThemeToggle, {}),
						/* @__PURE__ */ jsx(Button, {
							asChild: true,
							size: "sm",
							children: /* @__PURE__ */ jsx(Link, {
								to: "/auth",
								children: "Sign in"
							})
						})
					]
				})]
			}),
			/* @__PURE__ */ jsx("section", {
				className: "pw-grain relative overflow-hidden",
				children: /* @__PURE__ */ jsxs("div", {
					className: "mx-auto grid max-w-6xl items-center gap-10 px-5 pb-16 pt-8 lg:grid-cols-[1.05fr_1fr] lg:pb-24 lg:pt-14",
					children: [/* @__PURE__ */ jsxs("div", { children: [
						/* @__PURE__ */ jsxs("p", {
							className: "inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground",
							children: [/* @__PURE__ */ jsx(PaisaWiseMark, {
								size: 16,
								eager: true
							}), " For Indian college students"]
						}),
						/* @__PURE__ */ jsxs("h1", {
							className: "mt-5 font-display text-5xl font-extrabold leading-[0.95] tracking-tight sm:text-7xl",
							children: ["PAISA", /* @__PURE__ */ jsx("span", {
								className: "text-brand",
								children: "WISE"
							})]
						}),
						/* @__PURE__ */ jsx("p", {
							className: "mt-4 font-display text-2xl font-bold text-foreground sm:text-3xl",
							children: "Track chai to college fees — and actually save."
						}),
						/* @__PURE__ */ jsx("p", {
							className: "mt-4 max-w-xl text-base text-muted-foreground sm:text-lg",
							children: "Type your spending the way you'd text a friend. PaisaWise turns it into expense flashcards, a category-wise snapshot and savings tips priced in real rupees."
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "mt-7 flex flex-wrap gap-3",
							children: [/* @__PURE__ */ jsx(Button, {
								asChild: true,
								size: "lg",
								className: "gap-2",
								children: /* @__PURE__ */ jsxs(Link, {
									to: "/auth",
									children: ["Start tracking free ", /* @__PURE__ */ jsx(ArrowRight, { className: "size-4" })]
								})
							}), /* @__PURE__ */ jsx(Button, {
								asChild: true,
								size: "lg",
								variant: "outline",
								children: /* @__PURE__ */ jsx("a", {
									href: "#how",
									children: "See how it works"
								})
							})]
						}),
						/* @__PURE__ */ jsx("p", {
							className: "mt-4 text-sm text-muted-foreground",
							children: "Free forever · No card required"
						})
					] }), /* @__PURE__ */ jsxs("div", {
						className: "rounded-3xl border bg-card p-4 shadow-warm",
						children: [
							/* @__PURE__ */ jsxs("div", {
								className: "rounded-2xl bg-secondary p-3 font-mono text-sm",
								children: [/* @__PURE__ */ jsx("p", {
									className: "text-xs font-semibold uppercase tracking-widest text-muted-foreground",
									children: "You type"
								}), /* @__PURE__ */ jsx("pre", {
									className: "mt-2 whitespace-pre-wrap text-foreground",
									children: `250 zomato dinner
30 auto college
1500 amazon earphones`
								})]
							}),
							/* @__PURE__ */ jsx("p", {
								className: "px-1 pt-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground",
								children: "PaisaWise replies"
							}),
							/* @__PURE__ */ jsx("pre", {
								className: "mt-2 overflow-x-auto rounded-2xl border bg-background p-3 font-mono text-[11px] leading-snug sm:text-xs",
								children: DEMO_OUTPUT
							}),
							/* @__PURE__ */ jsx("p", {
								className: "mt-3 rounded-xl bg-mint-soft px-3 py-2 text-sm text-mint-foreground",
								children: "💡 TIP: ₹1,500 on earphones is fine if you needed them — but Croma student offers could've saved you ₹200–300."
							})
						]
					})]
				})
			}),
			/* @__PURE__ */ jsxs("section", {
				id: "features",
				className: "mx-auto max-w-6xl scroll-mt-16 px-5 py-16",
				children: [
					/* @__PURE__ */ jsx("h2", {
						className: "font-display text-3xl font-extrabold sm:text-4xl",
						children: "Everything a student wallet actually needs"
					}),
					/* @__PURE__ */ jsx("p", {
						className: "mt-3 max-w-2xl text-muted-foreground",
						children: "Not a corporate budgeting tool with a student skin. PaisaWise is built around how hostel, mess and UPI spending really works."
					}),
					/* @__PURE__ */ jsx("div", {
						className: "mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4",
						children: FEATURES.map((feature) => /* @__PURE__ */ jsxs("article", {
							className: "rounded-2xl border bg-card p-5 transition-colors hover:border-brand",
							children: [
								/* @__PURE__ */ jsx(feature.icon, { className: "size-6 text-brand" }),
								/* @__PURE__ */ jsx("h3", {
									className: "mt-4 font-display text-lg font-bold",
									children: feature.title
								}),
								/* @__PURE__ */ jsx("p", {
									className: "mt-2 text-sm text-muted-foreground",
									children: feature.body
								})
							]
						}, feature.title))
					})
				]
			}),
			/* @__PURE__ */ jsx("section", {
				id: "how",
				className: "scroll-mt-16 border-y bg-secondary/50",
				children: /* @__PURE__ */ jsxs("div", {
					className: "mx-auto max-w-6xl px-5 py-16",
					children: [
						/* @__PURE__ */ jsx("h2", {
							className: "font-display text-3xl font-extrabold sm:text-4xl",
							children: "Three steps. That's it."
						}),
						/* @__PURE__ */ jsx("ol", {
							className: "mt-10 grid gap-6 md:grid-cols-3",
							children: [
								{
									title: "Type it",
									body: "“120 chai and snacks” or paste your whole day at once. No forms, no dropdowns."
								},
								{
									title: "Get flashcards",
									body: "Every entry comes back categorised, with the merchant, the note and a clean snapshot chart."
								},
								{
									title: "Save more",
									body: "A tip tied to your real numbers, plus a hustle nudge when it's time to grow your income."
								}
							].map((step, index) => /* @__PURE__ */ jsxs("li", {
								className: "rounded-2xl border bg-card p-6",
								children: [
									/* @__PURE__ */ jsxs("span", {
										className: "font-display text-4xl font-extrabold text-brand",
										children: ["0", index + 1]
									}),
									/* @__PURE__ */ jsx("h3", {
										className: "mt-3 font-display text-xl font-bold",
										children: step.title
									}),
									/* @__PURE__ */ jsx("p", {
										className: "mt-2 text-sm text-muted-foreground",
										children: step.body
									})
								]
							}, step.title))
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "mt-10",
							children: [/* @__PURE__ */ jsx("h3", {
								className: "font-display text-sm font-bold uppercase tracking-widest text-muted-foreground",
								children: "Seven categories, sorted automatically"
							}), /* @__PURE__ */ jsx("ul", {
								className: "mt-4 flex flex-wrap gap-2",
								children: CATEGORIES.map((category) => /* @__PURE__ */ jsx("li", {
									className: "rounded-full border bg-card px-4 py-2 text-sm font-medium",
									children: category
								}, category))
							})]
						})
					]
				})
			}),
			/* @__PURE__ */ jsxs("section", {
				id: "faq",
				className: "mx-auto max-w-3xl scroll-mt-16 px-5 py-16",
				children: [/* @__PURE__ */ jsx("h2", {
					className: "font-display text-3xl font-extrabold sm:text-4xl",
					children: "Questions, answered"
				}), /* @__PURE__ */ jsx(Accordion, {
					type: "single",
					collapsible: true,
					className: "mt-8",
					children: FAQ.map((item) => /* @__PURE__ */ jsxs(AccordionItem, {
						value: item.q,
						children: [/* @__PURE__ */ jsx(AccordionTrigger, {
							className: "text-left font-display text-base font-bold",
							children: item.q
						}), /* @__PURE__ */ jsx(AccordionContent, {
							className: "text-muted-foreground",
							children: item.a
						})]
					}, item.q))
				})]
			}),
			/* @__PURE__ */ jsx("section", {
				className: "mx-auto max-w-6xl px-5 pb-16",
				children: /* @__PURE__ */ jsxs("div", {
					className: "pw-grain rounded-3xl border bg-card p-10 text-center shadow-warm",
					children: [
						/* @__PURE__ */ jsx("h2", {
							className: "font-display text-3xl font-extrabold sm:text-4xl",
							children: "Your ₹ deserves better decisions."
						}),
						/* @__PURE__ */ jsx("p", {
							className: "mx-auto mt-3 max-w-xl text-muted-foreground",
							children: "Log one expense right now and see where your month is actually heading."
						}),
						/* @__PURE__ */ jsx(Button, {
							asChild: true,
							size: "lg",
							className: "mt-6 gap-2",
							children: /* @__PURE__ */ jsxs(Link, {
								to: "/auth",
								children: ["Start tracking free ", /* @__PURE__ */ jsx(ArrowRight, { className: "size-4" })]
							})
						})
					]
				})
			}),
			/* @__PURE__ */ jsx("footer", {
				className: "border-t",
				children: /* @__PURE__ */ jsxs("div", {
					className: "mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 py-8 text-sm text-muted-foreground sm:flex-row",
					children: [/* @__PURE__ */ jsx(PaisaWiseWordmark, { markSize: 24 }), /* @__PURE__ */ jsx("p", { children: "Built by Sujay Gopal · Track chai to college fees — and actually save." })]
				})
			})
		]
	});
}
//#endregion
export { Landing as component };
