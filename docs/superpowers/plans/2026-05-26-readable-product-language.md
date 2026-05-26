# Readable Product Language Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace self-effacing MVP/prototype language with plain, human-readable product copy and add a clear “How this works” dialog that explains the system setup.

**Architecture:** Keep all public-facing wording in a small shared content module so the dashboard header, metadata, and info dialog stay consistent. Use a lightweight dialog component for the explanation so the main dashboard stays uncluttered while still answering “what is this and why does it look this way?”

**Tech Stack:** Next.js, React, TypeScript, Tailwind CSS, lucide-react, Node test runner.

---

### Task 1: Centralize product copy

**Files:**
- Create: `C:/AntigravityProjects/Enersave/enersave-web/src/lib/productCopy.ts`
- Test: `C:/AntigravityProjects/Enersave/enersave-web/tests/productCopy.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { dashboardDescription, howItWorksSections, pageTitle } from "../src/lib/productCopy";

test("product copy avoids MVP and prototype language", () => {
  const combined = [pageTitle, dashboardDescription, ...howItWorksSections.map((section) => section.body)].join(" ");

  assert.equal(combined.includes("MVP"), false);
  assert.equal(combined.includes("prototype"), false);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test --experimental-strip-types tests/productCopy.test.ts`
Expected: FAIL because `../src/lib/productCopy` does not exist yet.

- [ ] **Step 3: Write minimal implementation**

```ts
export const pageTitle = "Enersave Energy Operations";
export const dashboardDescription = "Live building energy data, room controls, reports, and AI insights.";

export const howItWorksSections = [
  {
    title: "What this dashboard is",
    body: "Enersave helps building staff see electricity use, adjust room equipment, and review patterns from one place."
  },
  {
    title: "What is live right now",
    body: "The dashboard shows a working web interface with live-updating readings, room controls, reports, and analytics."
  },
  {
    title: "Why some parts look local",
    body: "The site hardware connection is not in place yet, so the app uses local data and built-in controls until that connection is added."
  }
] as const;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test --experimental-strip-types tests/productCopy.test.ts`
Expected: PASS.

### Task 2: Add the explain-this button and dialog

**Files:**
- Create: `C:/AntigravityProjects/Enersave/enersave-web/src/components/ui/info-dialog.tsx`
- Modify: `C:/AntigravityProjects/Enersave/enersave-web/src/app/page.tsx`
- Modify: `C:/AntigravityProjects/Enersave/enersave-web/src/app/layout.tsx`
- Modify: `C:/AntigravityProjects/Enersave/enersave-web/src/components/AppPages.tsx`

- [ ] **Step 1: Write the dialog component**

```tsx
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";

export function InfoDialog({ open, title, description, onClose, children }: { open: boolean; title: string; description: string; onClose: () => void; children: React.ReactNode; }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <button className="absolute inset-0 bg-black/60" aria-label="Close dialog" onClick={onClose} type="button" />
      <div role="dialog" aria-modal="true" className="relative w-full max-w-2xl rounded-lg border border-border bg-card p-5 shadow-2xl shadow-black/40">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-md bg-muted">
            <Info className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="text-base font-semibold">{title}</p>
            <p className="mt-2 text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        <div className="mt-5 space-y-3">{children}</div>
        <div className="mt-5 flex justify-end">
          <Button onClick={onClose}>Got it</Button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Wire the button into the header and replace the visible wording**

```tsx
// Use the shared copy module for the title/subtitle.
// Add a header button that opens the info dialog.
// Render the three plain-language explanation sections inside the dialog.
```

- [ ] **Step 3: Update public-facing labels in Settings and page metadata**

```tsx
// Replace MVP/prototype/simulation language with plain product language.
// Update metadata to reflect the dashboard name and description.
```

- [ ] **Step 4: Verify with lint/build and browser check**

Run: `npm run lint && npm run build`
Expected: PASS.

Run: open `http://localhost:3000` in the in-app browser.
Expected: header button opens a readable explanation dialog and no visible MVP/prototype copy remains.
