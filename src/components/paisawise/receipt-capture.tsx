import { useCallback, useRef, useState } from "react";
import { Camera, Check, Loader2, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { addExpenses, compressImage, scanReceipt, type ScannedItem } from "@/lib/api";
import {
  CATEGORY_EMOJI,
  formatRupees,
  PW_CATEGORIES,
  type PwCategory,
} from "@/lib/paisawise-store";

const MAX_FILE_BYTES = 15 * 1024 * 1024;

export function ReceiptCapture({ onSaved }: { onSaved: () => void }) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [items, setItems] = useState<ScannedItem[] | null>(null);
  const [confidence, setConfidence] = useState<string>("");

  const reset = useCallback(() => {
    setPreview(null);
    setItems(null);
    setConfidence("");
    setScanning(false);
    setSaving(false);
    if (fileRef.current) fileRef.current.value = "";
  }, []);

  const handleFile = useCallback(async (file: File) => {
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

  const updateItem = useCallback((index: number, patch: Partial<ScannedItem>) => {
    setItems((current) =>
      current ? current.map((item, i) => (i === index ? { ...item, ...patch } : item)) : current,
    );
  }, []);

  const removeItem = useCallback((index: number) => {
    setItems((current) => (current ? current.filter((_, i) => i !== index) : current));
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
  }, [items, onSaved, reset]);

  const total = items?.reduce((sum, item) => sum + item.amount, 0) ?? 0;

  return (
    <>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
        }}
      />

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => fileRef.current?.click()}
        disabled={scanning}
        className="gap-1.5"
        title="Photograph a receipt and let PaisaWise read it"
      >
        {scanning ? <Loader2 className="size-3.5 animate-spin" /> : <Camera className="size-3.5" />}
        {scanning ? "Reading..." : "Scan receipt"}
      </Button>

      {/* Confirmation sheet — nothing is saved until the user approves. */}
      {items && items.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border bg-card p-5 shadow-warm">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-lg font-extrabold">Check before saving</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Scanned from your photo. Edit anything that looks wrong.
                </p>
              </div>
              <button
                type="button"
                onClick={reset}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent"
              >
                <X className="size-4" />
              </button>
            </div>

            {confidence === "low" && (
              <p className="mb-3 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
                The photo was hard to read — double-check these amounts carefully.
              </p>
            )}

            {preview && (
              <img
                src={preview}
                alt="Receipt preview"
                className="mb-4 max-h-36 w-full rounded-lg border object-contain bg-secondary"
              />
            )}

            <div className="space-y-2">
              {items.map((item, index) => (
                <div key={index} className="rounded-xl border bg-background p-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">
                      {CATEGORY_EMOJI[item.category as PwCategory] ?? "📦"}
                    </span>

                    <input
                      type="number"
                      value={item.amount}
                      min={1}
                      step="0.01"
                      onChange={(e) => updateItem(index, { amount: Number(e.target.value) })}
                      className="w-24 rounded-md border bg-card px-2 py-1 text-sm tabular-nums outline-none focus:border-brand"
                    />

                    <select
                      value={item.category}
                      onChange={(e) => updateItem(index, { category: e.target.value })}
                      className="rounded-md border bg-card px-2 py-1 text-xs outline-none focus:border-brand"
                    >
                      {PW_CATEGORIES.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="ml-auto rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      title="Remove this item"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>

                  <input
                    type="text"
                    value={item.note}
                    onChange={(e) => updateItem(index, { note: e.target.value })}
                    placeholder="Description"
                    maxLength={280}
                    className="mt-1.5 w-full rounded-md border bg-card px-2 py-1 text-xs outline-none focus:border-brand"
                  />
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between border-t pt-3">
              <p className="text-sm">
                <span className="text-muted-foreground">Total </span>
                <span className="font-display font-extrabold">{formatRupees(total)}</span>
              </p>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={reset} disabled={saving}>
                  Cancel
                </Button>
                <Button size="sm" onClick={confirm} disabled={saving} className="gap-1.5">
                  {saving ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Check className="size-3.5" />
                  )}
                  {saving ? "Saving..." : `Add ${items.length}`}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
