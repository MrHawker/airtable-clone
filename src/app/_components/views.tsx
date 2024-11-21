'use client'
import { ColumnFiltersState, SortingState } from "@tanstack/react-table";
import { useParams,useRouter } from "next/navigation";

import { FaTable } from "react-icons/fa6";
import { IoCheckmark } from "react-icons/io5";
import { api } from "~/trpc/react";

export function Views(
    {
        viewList,
        
    }:
    {
        viewList:string[],
        
    }
){
    const router = useRouter()
    const util = api.useUtils()

    const params = useParams<{ baseId: string; tableId: string; viewId: string }>();

    const handleViewChange = async(viewId: string) => {
        window.location.href = `/base/${params.baseId}/${params.tableId}/${viewId}`;
    };
    return(
        <div className="flex flex-col flex-grow  pt-[8px] py-[12px] space-y-2">
            {viewList?.map((view,index) =>{
                if(view == params.viewId){
                    return (
                        <div onClick={() => handleViewChange(view)} 
                        key={view} className="bg-soft-blue rounded flex justify-between p-[8px] hover:cursor-pointer hover:bg-hover-view-blue">
                            <div className="flex">
                                <FaTable className="mr-2 text-blue-400"/>
                                <span className="text-xs font-medium">Grid {index+1}</span>
                            </div>
                            <IoCheckmark/>
                        </div>
                    )
                }else{
                    return <div onClick={() => handleViewChange(view)} 
                        key={view} className=" rounded flex justify-between p-[8px] hover:cursor-pointer hover:bg-hover-view-blue">
                        <div className="flex">
                            <FaTable className="mr-2 text-blue-400"/>
                            <span className="text-xs font-medium">Grid {index+1}</span>
                        </div>
                        
                    </div>
                }
            }
            )}
        </div>
    );
}