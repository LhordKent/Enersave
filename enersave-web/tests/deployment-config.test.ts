import assert from "node:assert/strict";
import test from "node:test";

import { buildAnalyticsUrl, normalizeBaseUrl } from "../src/lib/deployment-config.ts";
import { createInitialBmsState, recordSystemAlert, setRoomDeviceStateInState } from "../src/lib/state-model.ts";

test("normalizeBaseUrl trims trailing slashes", () => {
  assert.equal(normalizeBaseUrl("https://ai.example.com///"), "https://ai.example.com");
});

test("buildAnalyticsUrl joins the analytics path", () => {
  assert.equal(
    buildAnalyticsUrl("https://ai.example.com/"),
    "https://ai.example.com/api/analytics/clusters"
  );
});

test("setRoomDeviceStateInState updates a copied state tree", () => {
  const state = createInitialBmsState();
  const result = setRoomDeviceStateInState(state, "lobby", "lights", false);

  assert.equal(result?.device.enabled, false);
  assert.equal(state.rooms.find((room) => room.id === "lobby")?.devices.find((device) => device.id === "lights")?.enabled, true);
});

test("recordSystemAlert prepends the newest entry", () => {
  const state = createInitialBmsState();
  const updated = recordSystemAlert(state, {
    id: "new-alert",
    time: "09:00 AM",
    type: "info",
    message: "Test alert"
  });

  assert.equal(updated.systemAlerts[0]?.id, "new-alert");
  assert.equal(updated.systemAlerts[1]?.id, "init");
});
