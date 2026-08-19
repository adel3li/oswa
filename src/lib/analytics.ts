import posthog from 'posthog-js';

let isInitialized = false;

export function initAnalytics(consentGiven: boolean) {
  if (!consentGiven) {
    if (isInitialized) {
      posthog.opt_out_capturing();
    }
    return;
  }

  const key = import.meta.env.VITE_POSTHOG_KEY;
  const host = import.meta.env.VITE_POSTHOG_HOST;

  if (key && host && !isInitialized) {
    posthog.init(key, {
      api_host: host,
      autocapture: false,
      capture_pageview: false,
      disable_session_recording: true,
      persistence: 'localStorage'
    });
    posthog.opt_in_capturing();
    isInitialized = true;
  } else if (isInitialized) {
    posthog.opt_in_capturing();
  }
}

export function trackEvent(eventName: string, properties?: Record<string, any>) {
  if (isInitialized) {
    posthog.capture(eventName, properties);
  }
}
