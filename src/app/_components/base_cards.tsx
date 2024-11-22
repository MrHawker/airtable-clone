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
    <div className="flex flex-wrap gap-3">
      {bases?.map((base) =>{
        return (
          <div onClick={() => router.push(`/base/${base.id}/${base.tables.at(0)?.id}/${base.tables.at(0)?.views.at(0)?.id}`)} key={base.id} 
          className="p-4 flex border rounded-lg bg-white w-[330px] shadow-sm hover:shadow-md hover:cursor-pointer">
            <div className="h-full p-4 text-xl text-center bg-card-brown text-white rounded-xl">
                Un
            </div>
            <div className="flex flex-col justify-center ml-4">
                <p className="font-medium text-[12.5px] mr-3 mb-2">Base {base.id}</p>
                <p className="text-[11px] mr-3 text-slate-500">Base</p>
            </div>
          </div> 
        )
      })}

      </div>
  );
}
