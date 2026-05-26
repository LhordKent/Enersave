"use client";

import { useEffect } from "react";
import { Info } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";

export function InfoDialog({
  open,
  title,
  description,
  onClose,
  children
}: {
  open: boolean;
  title: string;
  description: string;
  onClose: () => void;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <button className="absolute inset-0 bg-black/60" aria-label="Close dialog" onClick={onClose} type="button" />
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-2xl rounded-lg border border-border bg-card p-5 shadow-2xl shadow-black/40"
      >
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-md bg-muted">
            <Info className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="text-base font-semibold">{title}</p>
            <p className="mt-2 text-sm text-muted-foreground">{description}</p>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {children}
        </div>

        <div className="mt-5 flex justify-end">
          <Button onClick={onClose}>Got it</Button>
        </div>
      </div>
    </div>
  );
}
