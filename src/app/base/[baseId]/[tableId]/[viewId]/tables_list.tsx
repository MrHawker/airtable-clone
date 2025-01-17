'use client'

import { RiArrowDownSLine } from "react-icons/ri"
import { useParams, useRouter } from 'next/navigation'

import { api } from "~/trpc/react";


export function TableList(){
    
    const params = useParams<{ baseId: string; tableId: string, viewId:string }>()
    
    const { data: tables, isLoading } = api.common.getFirstViewForTables.useQuery({baseId:params.baseId})
    const utils = api.useUtils()
    const router = useRouter()
    let exist = 0
    const l = tables?.length ?? 0
    return <div className="flex">
        {tables?.map((table,index) =>{
          if(table.id == params.tableId){
            exist = 1
            return (
              <div key={index} className="px-[12px] py-[7px] bg-white rounded-t text-black flex justify-center shadow-sm hover:cursor-pointer">
                <p className="font-medium text-[12px] mr-1">Table {index+1}</p>
                <div className="flex flex-col justify-center"><RiArrowDownSLine /></div>
              </div>
            )
          }else{
            return (
              <div onClick={async ()=>{
                await utils.invalidate()
                router.push(`/base/${params.baseId}/${table.id}/${table.views.at(0)?.id}`);
              } 
              } key={index} className="flex">
                <div  className="px-[12px] py-[7px] text-slate-200 font-thin flex justify-center shadow-sm hover:cursor-pointer">
                  <p className="font-medium text-[12px] mr-1">Table {index+1}</p>
                  <div className="flex flex-col justify-center"><RiArrowDownSLine /></div>
                </div>
                <div className="w-[0.5px] bg-gray-400 opacity-30 mt-[6px]" style={{height: '20px' }}></div>
              </div>
            )
          }
            
        })}
        { !exist &&
          <div  className="px-[12px] py-[7px] bg-white rounded-t text-black flex justify-center shadow-sm hover:cursor-pointer">
            <p className="font-medium text-md mr-1">Table {l+1}</p>
            <div className="flex flex-col justify-center"><RiArrowDownSLine /></div>
          </div>
        }
    </div>
}