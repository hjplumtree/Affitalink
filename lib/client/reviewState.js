export const HEALTH_STATUS = {
  success: {
    label: "Healthy",
    tone: "green",
    message: "Sources are connected and recent enough to trust.",
  },
  partial_failure: {
    label: "Incomplete",
    tone: "orange",
    message: "Some source data failed, so this queue may be incomplete.",
  },
  failed: {
    label: "Failed",
    tone: "red",
    message: "Sync failed. This is not the same as having no changes.",
  },
  idle: {
    label: "Idle",
    tone: "gray",
    message: "No sync has been run yet.",
  },
  stale: {
    label: "Stale",
    tone: "yellow",
    message: "Data is older than expected and should be refreshed.",
  },
};

export const REVIEW_ITEM_STATE = {
  new: {
    eyebrow: "New",
    tone: "green",
    reasonLabel: "Why it surfaced",
  },
  changed: {
    eyebrow: "Changed",
    tone: "orange",
    reasonLabel: "What changed",
  },
  missing: {
    eyebrow: "Missing",
    tone: "red",
    reasonLabel: "Missing from latest sync",
  },
  reappeared: {
    eyebrow: "Reappeared",
    tone: "purple",
    reasonLabel: "Why it returned",
  },
};
