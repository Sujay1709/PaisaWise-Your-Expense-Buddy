/**
 * Client-side expense parser.
 * Parses natural-language Indian student expense strings into structured entries.
 * Runs instantly — no AI round-trip needed for basic entries.
 */

import type { PwCategory, LedgerEntry } from "@/lib/paisawise-store";

type ParsedExpense = Omit<LedgerEntry, "ts">;

const CATEGORY_KEYWORDS: Record<string, PwCategory> = {
  // Food
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
  // Travel
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
  // Education
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
  // Entertainment
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
  // Shopping
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
  // Bills
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
  subscription: "Bills",
};

const MERCHANT_NAMES = new Set([
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
  "airtel",
]);

const UPI_APPS = new Set(["gpay", "phonepe", "paytm", "upi", "google pay"]);

/**
 * Extracts amount from a string. Handles:
 * - "250", "1500", "₹250", "Rs 250", "Rs. 250"
 * - "1.2k" → 1200, "2.5k" → 2500
 * - Amount anywhere in the string
 */
function extractAmount(text: string): { amount: number; rest: string } | null {
  // Match patterns like ₹250, Rs.250, Rs 250, 1.2k, 1500
  const patterns = [
    /(?:₹|rs\.?\s*)(\d+(?:\.\d+)?)\s*k\b/i,
    /(\d+(?:\.\d+)?)\s*k\b/i,
    /(?:₹|rs\.?\s*)(\d+(?:,\d{3})*(?:\.\d+)?)/i,
    /(\d+(?:,\d{3})*(?:\.\d+)?)/,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const numStr = match[1].replace(/,/g, "");
      let amount = parseFloat(numStr);
      if (pattern.source.includes("k\\b")) {
        amount *= 1000;
      }
      if (amount > 0 && amount < 10_000_000) {
        const rest = text.replace(match[0], "").trim();
        return { amount, rest };
      }
    }
  }
  return null;
}

function detectCategory(words: string[]): PwCategory {
  for (const word of words) {
    const lower = word.toLowerCase().replace(/[^a-z]/g, "");
    if (CATEGORY_KEYWORDS[lower]) return CATEGORY_KEYWORDS[lower];
  }
  return "Other";
}

function detectMerchant(words: string[]): string | null {
  for (const word of words) {
    const lower = word.toLowerCase().replace(/[^a-z]/g, "");
    if (MERCHANT_NAMES.has(lower)) return word;
  }
  return null;
}

function isIncomeEntry(text: string): boolean {
  return /\b(earned|income|salary|freelance|stipend|received|got paid|payment received)\b/i.test(
    text,
  );
}

/** Filler words that add nothing to the note. */
const FILLER_WORDS = new Set([
  "rs", "rs.", "rupees", "inr", "for", "and", "to", "the", "a", "an",
  "at", "on", "of", "my", "i", "spent", "paid", "was", "is", "it",
  "today", "yesterday", "some", "got",
]);

function cleanWord(word: string): string {
  return word.replace(/[^a-zA-Z]/g, "").toLowerCase();
}

function titleCase(word: string): string {
  const clean = word.replace(/[^a-zA-Z]/g, "");
  return clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase();
}

/**
 * Splits raw input into individual expense segments.
 *
 * Splits on: newlines, semicolons, "and", "&", and commas —
 * but NOT commas used as thousands separators (e.g. "1,500 amazon").
 */
export function segmentInput(text: string): string[] {
  const segments: string[] = [];

  for (const line of text.split(/[\n;]+/)) {
    const parts = line
      // Comma NOT followed by exactly 3 digits (protects "1,500")
      .split(/\s*,\s*(?!\d{3}(?:\D|$))|\s+and\s+|\s*&\s*/i)
      .map((p) => p.trim().replace(/^and\s+/i, "").trim())
      .filter(Boolean);
    segments.push(...parts);
  }

  return segments;
}

/**
 * Parses a single expense segment.
 * Returns null if no amount is found.
 */
export function parseExpenseLine(line: string): ParsedExpense | null {
  const trimmed = line.trim();
  if (!trimmed) return null;

  const extracted = extractAmount(trimmed);
  if (!extracted) return null;

  const { amount, rest } = extracted;
  const words = rest
    .split(/\s+/)
    .filter((w) => w.length > 0)
    .filter((w) => !UPI_APPS.has(cleanWord(w)));

  const isIncome = isIncomeEntry(trimmed);
  const category = isIncome ? "Other" : detectCategory(words);
  const merchantRaw = detectMerchant(words);
  const merchant = merchantRaw ? titleCase(merchantRaw) : null;

  const noteWords = words.filter((w) => {
    const clean = cleanWord(w);
    if (!clean) return false;
    if (FILLER_WORDS.has(clean)) return false;
    if (merchantRaw && clean === cleanWord(merchantRaw)) return false;
    return true;
  });

  const note = noteWords.join(" ") || (isIncome ? "income" : "expense");

  return {
    amount,
    category,
    merchant,
    note,
    type: isIncome ? "income" : "expense",
  };
}

/**
 * Parses expense input — handles both bulk paste (one per line)
 * and natural single-line lists ("340 swiggy, 30 auto, 50 coffee").
 */
export function parseExpenseInput(text: string): ParsedExpense[] {
  const results: ParsedExpense[] = [];
  for (const segment of segmentInput(text)) {
    const parsed = parseExpenseLine(segment);
    if (parsed) results.push(parsed);
  }
  return results;
}
