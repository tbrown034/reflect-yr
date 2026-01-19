import { betterAuth } from "better-auth";
import { Pool } from "pg";

const LOG_PREFIX = "[Auth]";
const isDev = process.env.NODE_ENV === "development";

// Validate required env vars
const baseURL = process.env.BETTER_AUTH_URL;
const secret = process.env.BETTER_AUTH_SECRET;

if (!baseURL) {
  console.warn(`${LOG_PREFIX} WARNING: BETTER_AUTH_URL not set - OAuth callbacks will fail in production!`);
}
if (!secret) {
  console.warn(`${LOG_PREFIX} WARNING: BETTER_AUTH_SECRET not set - sessions won't persist!`);
}

if (isDev) {
  console.log(`${LOG_PREFIX} Initializing Better Auth...`);
  console.log(`${LOG_PREFIX} Environment: ${process.env.NODE_ENV}`);
  console.log(`${LOG_PREFIX} BETTER_AUTH_URL: ${baseURL || "NOT SET"}`);
  console.log(`${LOG_PREFIX} BETTER_AUTH_SECRET: ${secret ? "set (" + secret.length + " chars)" : "NOT SET"}`);
  console.log(`${LOG_PREFIX} Database URL: ${process.env.DATABASE_URL ? "configured" : "NOT SET"}`);
  console.log(`${LOG_PREFIX} Google OAuth: ${process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET ? "configured" : "NOT SET"}`);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

if (isDev) {
  pool.on("connect", () => {
    console.log(`${LOG_PREFIX} [DB] Connected`);
  });
}

pool.on("error", (err) => {
  console.error(`${LOG_PREFIX} [DB] Pool error:`, err.message);
});

export const auth = betterAuth({
  database: pool,
  basePath: "/api/auth",
  baseURL: baseURL, // Critical for OAuth callbacks
  secret: secret, // Explicit secret for session encryption
  trustedOrigins: [
    "http://localhost:3000",
    "https://refelectyrproject.vercel.app",
  ],
  socialProviders: {
    google: {
      clientId: process.env.AUTH_GOOGLE_ID as string,
      clientSecret: process.env.AUTH_GOOGLE_SECRET as string,
    },
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes
    },
  },
  onAPIError: {
    onError: (error) => {
      console.error(`${LOG_PREFIX} API Error:`, error);
    },
  },
  advanced: {
    crossSubDomainCookies: {
      enabled: false,
    },
  },
});

if (isDev) {
  console.log(`${LOG_PREFIX} Better Auth initialized`);
  console.log(`${LOG_PREFIX} Callback URL will be: ${baseURL}/api/auth/callback/google`);
}
