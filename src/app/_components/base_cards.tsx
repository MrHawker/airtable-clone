"use client";

import { api } from "~/trpc/react";
import { useRouter } from 'next/navigation'

export function BaseCards() {
  const router = useRouter()
  const { data: bases, isLoading } = api.common.getBaseInfo.useQuery();
  
  if (isLoading) {
    return <div className="text-center text-xl">Loading...</div>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {bases?.map((base) =>{
        return (
          <div onClick={() => router.push(`/base/${base.id}/${base.tables.at(0)?.id}/${base.tables.at(0)?.views.at(0)?.id}`)} key={base.id} className="p-4 flex border-2 rounded-md bg-white flex-grow md:basis-1/2 lg:basis-1/4 md:flex-none shadow-sm hover:shadow-md hover:cursor-pointer">
            <div className="h-full p-4 text-xl text-center bg-card-brown text-white rounded-xl">
                Un
            </div>
            <div className="flex flex-col justify-center ml-4">
                <p className="font-medium text-sm mr-3 mb-2">Base {base.id}</p>
                <p className="text-xs mr-3 text-slate-500">Base</p>
            </div>
          </div> 
        )
      })}

      </div>
    // <div className="w-full max-w-xs">
    //   {latestBase ? (
    //     <p className="truncate">Your most recent post: {latestBase.name}</p>
    //   ) : (
    //     <p>You have no posts yet.</p>
    //   )}
    //   <form
    //     onSubmit={(e) => {
    //       e.preventDefault();
    //       createBase.mutate({ name });
    //     }}
    //     className="flex flex-col gap-2"
    //   >
    //     <input
    //       type="text"
    //       placeholder="Title"
    //       value={name}
    //       onChange={(e) => setName(e.target.value)}
    //       className="w-full rounded-full px-4 py-2 text-black"
    //     />
    //     <button
    //       type="submit"
    //       className="rounded-full bg-white/10 px-10 py-3 font-semibold transition hover:bg-white/20"
    //       disabled={createBase.isPending}
    //     >
    //       {createBase.isPending ? "Submitting..." : "Submit"}
    //     </button>
    //   </form>
    // </div>
  );
}
