 /** 
  * Application configuration helpers.
  * Centralizes environment variable resolution and provides safe fallbacks.
  *
  * Note: BearTable currently overrides the fetch URL with a hardcoded absolute endpoint
  * per user instruction. Consider reverting to env-based config later.
  */

 // PUBLIC_INTERFACE
 export function getEnvVar(name) {
   /** Returns the environment variable value for the given name, or undefined if not set. */
   return process.env[name];
 }

 /**
  * Resolve API base URL:
  * 1) Use REACT_APP_BEAR_API_URL if provided (trim trailing slash).
  * 2) Otherwise, attempt to derive from window.location:
  *    - Replace :3000 with :3001 (dev default) and append '/api'
  *    - If no port 3000 present, still append '/api' to origin for common deployments.
  * Logs a console.warn if env var missing, and console.info with the resolved URL at app boot.
  *
  * NOTE:
  * - Only REACT_APP_BEAR_API_URL is honored. Any duplicated variable like
  *   REACT_APP_REACT_APP_BEAR_API_URL is ignored.
  * - The returned value is a base that may already include /api; BearTable avoids
  *   duplicating /api when constructing the endpoint.
  */

 // PUBLIC_INTERFACE
 export function getApiBaseUrl() {
   /** Returns the resolved API base URL as a string. */
   const raw = (getEnvVar("REACT_APP_BEAR_API_URL") || "").trim();

   let resolved = "";
   if (raw) {
     resolved = raw.replace(/\/*$/, "");
   } else if (typeof window !== "undefined" && window.location && window.location.origin) {
     // Attempt a sensible default for local dev or proxied envs
     const origin = window.location.origin;
     const base =
       origin.includes(":3000")
         ? origin.replace(":3000", ":3001")
         : origin;
     resolved = `${base.replace(/\/*$/, "")}/api`;
     // Warn only when env var is not provided
     // eslint-disable-next-line no-console
     console.warn(
       "[config] REACT_APP_BEAR_API_URL not set. Falling back to derived URL:",
       resolved
     );
   } else {
     // As a last resort, leave empty and let UI handle gracefully.
     resolved = "";
     // eslint-disable-next-line no-console
     console.warn(
       "[config] REACT_APP_BEAR_API_URL not set and window.location unavailable. API base URL is empty."
     );
   }

   // Print an info log at app boot for visibility (guard to avoid duplicate logs in StrictMode double render)
   if (typeof window !== "undefined" && !window.__API_BASE_LOGGED__) {
     // eslint-disable-next-line no-console
     console.info("[config] Resolved API base URL:", resolved || "(empty)");
     window.__API_BASE_LOGGED__ = true;
   }

   return resolved;
 }

 // PUBLIC_INTERFACE
 export function getRefreshIntervalSeconds(defaultSeconds = 10) {
   /** Returns the refresh interval in seconds as a number, defaulting to 10 if not set or invalid. */
   const raw = getEnvVar("REACT_APP_REFRESH_INTERVAL_SECONDS");
   const n = Number(raw);
   if (Number.isFinite(n) && n >= 0) return n;
   return defaultSeconds;
 }
