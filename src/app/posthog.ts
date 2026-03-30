import posthog from "posthog-js";

export function initPostHog() {
  if (typeof window === "undefined") return;

  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) {
    console.warn("[PostHog] NEXT_PUBLIC_POSTHOG_KEY is missing");
    return;
  }

  posthog.init(key, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
    person_profiles: "identified_only",
    capture_pageview: false,
    loaded: () => console.log("[PostHog] Loaded successfully"),
  });
}

export default posthog;
