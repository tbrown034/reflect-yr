import { auth } from "@/library/auth";
import { headers } from "next/headers";

const LOG_PREFIX = "[SignInStatus]";

export default async function SignInStatus() {
  console.log(`${LOG_PREFIX} Checking session...`);

  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    console.log(
      `${LOG_PREFIX} Session check result:`,
      session?.user?.email ? `Authenticated: ${session.user.email}` : "Not authenticated"
    );

    return (
      <p className="text-sm italic ">
        {session?.user?.email
          ? `Signed in as ${session.user.email}`
          : "Not signed in"}
      </p>
    );
  } catch (error) {
    console.error(`${LOG_PREFIX} Session check error:`, error);
    return <p className="text-sm italic text-red-500">Auth error</p>;
  }
}
