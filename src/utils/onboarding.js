export const ONBOARDING_KEY = "greedy-pig-onboarding-v1";

export function hasSeenOnboarding() {
  try {
    return window.localStorage.getItem(ONBOARDING_KEY) === "completed";
  } catch {
    // If browser storage is unavailable, show the guide for this visit.
    return false;
  }
}

export function saveOnboardingCompletion() {
  try {
    window.localStorage.setItem(ONBOARDING_KEY, "completed");
  } catch {
    // The guide still works if the browser blocks persistent storage.
  }
}
