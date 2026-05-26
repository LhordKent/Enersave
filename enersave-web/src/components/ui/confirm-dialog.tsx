"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ConfirmDialog({
  open,
  title,
  description,
  confirmText,
  cancelText = "Cancel",
  tone = "warning",
  onConfirm,
  onCancel
}: {
  open: boolean;
  title: string;
  description: string;
  confirmText: string;
  cancelText?: string;
  tone?: "warning" | "destructive";
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onCancel();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <button
        className="absolute inset-0 bg-black/60"
        aria-label="Close dialog"
        onClick={onCancel}
        type="button"
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-lg rounded-lg border border-border bg-card p-5 shadow-2xl shadow-black/40"
      >
        <div className="flex items-start gap-3">
          <span
            className={cn(
              "mt-0.5 flex h-10 w-10 items-center justify-center rounded-md border",
              tone === "destructive"
                ? "border-red-500/25 bg-red-500/15 text-red-200"
                : "border-amber-500/25 bg-amber-500/15 text-amber-200"
            )}
          >
            <AlertTriangle className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="text-base font-semibold">{title}</p>
            <p className="mt-2 text-sm text-muted-foreground">{description}</p>
          </div>
        </div>

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={onCancel}>
            {cancelText}
          </Button>
          <Button
            onClick={() => void onConfirm()}
            className={cn(
              tone === "destructive" && "bg-red-500 text-white hover:bg-red-500/90",
              tone === "warning" && "bg-amber-500 text-black hover:bg-amber-500/90"
            )}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}

