export function getClerkPublishableKey(env: ImportMetaEnv = import.meta.env) {
  const key = env.VITE_CLERK_PUBLISHABLE_KEY;

  if (key) {
    return key;
  }

  if (env.MODE === "test") {
    return "pk_test_mock";
  }

  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY. Add it to apps/web/.env.local before starting the web app.");
}
