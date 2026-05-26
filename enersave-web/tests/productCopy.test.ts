import assert from "node:assert/strict";
import test from "node:test";

import { dashboardDescription, howItWorksSections, pageTitle } from "../src/lib/productCopy.ts";

test("product copy avoids MVP and prototype language", () => {
  const combined = [pageTitle, dashboardDescription, ...howItWorksSections.map((section) => section.body)].join(" ");

  assert.equal(combined.includes("MVP"), false);
  assert.equal(combined.includes("prototype"), false);
});
