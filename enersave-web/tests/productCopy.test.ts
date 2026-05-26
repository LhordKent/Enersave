import assert from "node:assert/strict";
import test from "node:test";

import { dashboardDescription, howItWorksSections, pageTitle } from "../src/lib/productCopy.ts";

test("product copy avoids MVP and prototype language", () => {
  const combined = [pageTitle, dashboardDescription, ...howItWorksSections.map((section) => section.body)].join(" ");

  assert.equal(combined.includes("MVP"), false);
  assert.equal(combined.includes("prototype"), false);
});

test("product copy explains the simulated building state honestly", () => {
  const combined = howItWorksSections.map((section) => section.body).join(" ");

  assert.equal(combined.includes("preloaded room model"), true);
  assert.equal(combined.includes("pre-existing smart meter dataset"), true);
  assert.equal(combined.includes("not connected to live IoT hardware yet"), true);
});
