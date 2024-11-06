import { auth } from "~/server/auth";
import { api, HydrateClient } from "~/trpc/server";
import { redirect } from "next/navigation";
import { Dashboard } from "./dashboard";
export default async function Page() {
  const session = await auth();
  if(!session){
    redirect('/')
  }
//   if (session?.user) {
//     void api.post.getLatest.prefetch();
//   }

  return (
    <HydrateClient>
        <Dashboard session={session}/>
    </HydrateClient>
  );
}
