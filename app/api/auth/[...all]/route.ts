import { auth } from "@/library/auth";
import { toNextJsHandler } from "better-auth/next-js";
import { NextRequest } from "next/server";

const LOG_PREFIX = "[AuthRoute]";
const isDev = process.env.NODE_ENV === "development";

const handler = toNextJsHandler(auth);

export const GET = async (request: NextRequest) => {
  const url = new URL(request.url);

  if (isDev) {
    const authAction = url.pathname.split("/").filter(Boolean).pop();
    console.log(`${LOG_PREFIX} GET ${url.pathname} (action: ${authAction})`);

    // OAuth callback detection
    if (authAction === "google" && url.searchParams.has("code")) {
      console.log(`${LOG_PREFIX} >>> OAuth callback with code <<<`);
    }
  }

  try {
    const response = await handler.GET(request);

    if (isDev) {
      console.log(`${LOG_PREFIX} GET response: ${response.status}`);
      const location = response.headers.get("location");
      if (location) console.log(`${LOG_PREFIX} Redirect: ${location}`);
    }

    return response;
  } catch (error) {
    console.error(`${LOG_PREFIX} GET error:`, (error as Error).message);
    throw error;
  }
};

export const POST = async (request: NextRequest) => {
  const url = new URL(request.url);

  if (isDev) {
    const authAction = url.pathname.split("/").filter(Boolean).pop();
    console.log(`${LOG_PREFIX} POST ${url.pathname} (action: ${authAction})`);
  }

  try {
    const response = await handler.POST(request);

    if (isDev) {
      console.log(`${LOG_PREFIX} POST response: ${response.status}`);
    }

    return response;
  } catch (error) {
    console.error(`${LOG_PREFIX} POST error:`, (error as Error).message);
    throw error;
  }
};
