export const pageTitle = "Enersave Energy Operations";

export const dashboardDescription = "Live building energy data, room controls, reports, and AI insights.";

export const howItWorksSections = [
  {
    title: "What this dashboard is",
    body: "Enersave is a working energy operations interface for viewing demand, changing room equipment states, and reviewing reports in one place."
  },
  {
    title: "What is live right now",
    body: "The web app, controls, alerts, reports, and persistence are live. Room activity currently comes from a preloaded room model with predefined devices, occupancy labels, and kW values rather than a live building feed."
  },
  {
    title: "Why some parts look local",
    body: "This system is not connected to live IoT hardware yet. Telemetry is generated from the saved software state, and the AI view is based on a pre-existing smart meter dataset and a trained clustering model rather than direct sensor streaming."
  }
] as const;
