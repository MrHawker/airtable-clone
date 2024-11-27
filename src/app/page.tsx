import { auth } from "~/server/auth";
import { api, HydrateClient } from "~/trpc/server";
import { Landing } from "./_components/Landing";

export default async function Home() {
  const session = await auth();

  return (
    <HydrateClient>
        <Landing session={session}/>
    </HydrateClient>
  );
}
