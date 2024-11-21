'use client'
import { PiMagnifyingGlass } from "react-icons/pi";
import { GoGear } from "react-icons/go";
import { Views } from "~/app/_components/views";
import { RiArrowDownSLine, RiArrowUpSLine } from "react-icons/ri";
import { FaTable } from "react-icons/fa6";
import { GoPlus } from "react-icons/go";
import { IoCalendarNumberOutline } from "react-icons/io5";
import { RiGalleryView2 } from "react-icons/ri";
import { PiKanban } from "react-icons/pi";
import { RiTimelineView } from "react-icons/ri";
import { MdOutlineChecklist } from "react-icons/md";
import { FaChartGantt } from "react-icons/fa6";
import { LiaWpforms } from "react-icons/lia";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { ColumnFiltersState, SortingState } from "@tanstack/react-table";

export function SideNav(
    {
        viewList,
        setViewList,
        filters,
        setFilters,
        sorts,
        setSorts,
    }:
    {
        viewList:string[],
        setViewList: React.Dispatch<React.SetStateAction<string[]>>,
        filters: ColumnFiltersState,
        setFilters: React.Dispatch<React.SetStateAction<ColumnFiltersState>>,
        sorts: SortingState,
        setSorts: React.Dispatch<React.SetStateAction<SortingState>>,
    }
) {
    const router = useRouter()
    const params = useParams<{ baseId: string; tableId: string; viewId: string }>();

    const addView = api.view.create.useMutation({
        onSuccess: (newView) => {
            setViewList((prev)=>[...prev, newView.newView.id])
            window.location.href = `/base/${params.baseId}/${params.tableId}/${newView.newView.id}`
        },
    });

    const [open,setIsOpen] = useState(true)
    return (
        <div className="px-[12px] pt-[8px] w-full h-full flex flex-col justify-between">
            <div>
                <div className="flex justify-between border-b focus-within:border-blue-500 text-slate-500">
                    <div className="flex flex-grow overflow-hidden">
                        <div className="p-[8px] pl-[10px]">
                            <PiMagnifyingGlass/>
                        </div>
                        <input placeholder="Find a view" className="flex-grow outline-none text-xs"></input>
                    </div>
                    <div className="p-[8px] pl-[10px]">
                        <GoGear/>
                    </div>
                </div>
                <Views viewList={viewList} />
            </div>
            <div>
                <hr></hr>
                <div className="">
                    <div onClick={()=>setIsOpen(!open)} className="flex justify-between my-[8px] py-[6px] px-[12px] hover:cursor-pointer">
                        <span className="font-medium">Create...</span>
                        {open ? <div  className="flex flex-col justify-center"><RiArrowDownSLine/></div>
                        : <div  className="flex flex-col justify-center"><RiArrowUpSLine/></div>
                        }
                    </div>
                    {open &&
                    <div>
                        <div
                        onClick={()=>addView.mutate({tableId:params.tableId})}
                        className="rounded flex justify-between hover:cursor-pointer py-2 hover:bg-slate-signin px-[12px]">
                            <div className="flex">
                                <FaTable className="mr-2 text-blue-400"/>
                                <span className="text-xs font-medium">Grid</span>
                            </div>
                            <GoPlus className="text-slate-500" style={{fontSize:'18px'}}/>
                        </div>
                        <div className="rounded flex justify-between hover:cursor-pointer py-2 hover:bg-slate-signin px-[12px]">
                            <div className="flex">
                                <IoCalendarNumberOutline className="mr-2 text-orange-500"/>
                                <span className="text-xs font-medium">Calendar</span>
                            </div>
                            <GoPlus className="text-slate-500" style={{fontSize:'18px'}}/>
                        </div>
                        <div className="rounded flex justify-between hover:cursor-pointer py-2 hover:bg-slate-signin px-[12px]">
                            <div className="flex">
                                <RiGalleryView2 className="mr-2 text-purple-500"/>
                                <span className="text-xs font-medium">Gallery</span>
                            </div>
                            <GoPlus className="text-slate-500" style={{fontSize:'18px'}}/>
                        </div>
                        <div className="rounded flex justify-between hover:cursor-pointer py-2 hover:bg-slate-signin px-[12px]">
                            <div className="flex">
                                <PiKanban className="mr-2 text-green-500"/>
                                <span className="text-xs font-medium">Kanban</span>
                            </div>
                            <GoPlus className="text-slate-500" style={{fontSize:'18px'}}/>
                        </div>
                        <div className="rounded flex justify-between hover:cursor-pointer py-2 hover:bg-slate-signin px-[12px]">
                            <div className="flex">
                                <RiTimelineView className="mr-2 text-red-400"/>
                                <span className="text-xs font-medium mr-2">Timeline</span>
                                <button className="bg-soft-blue text-blue-800 text-xs rounded-lg px-[8px] py-[1px]">Team</button>
                            </div>
                            <GoPlus className="text-slate-500" style={{fontSize:'18px'}}/>
                        </div>
                        <div className="rounded flex justify-between hover:cursor-pointer py-2 hover:bg-slate-signin px-[12px]">
                            <div className="flex">
                                <MdOutlineChecklist className="mr-2 text-blue-800"/>
                                <span className="text-xs font-medium">List</span>
                            </div>
                            <GoPlus className="text-slate-500" style={{fontSize:'18px'}}/>
                        </div>
                        <div className="rounded flex justify-between hover:cursor-pointer py-2 hover:bg-slate-signin px-[12px]">
                            <div className="flex">
                                <FaChartGantt className="mr-2 text-green-600"/>
                                <span className="text-xs font-medium mr-2">Gantt</span>
                                <button className="bg-soft-blue text-blue-800 text-xs rounded-lg px-[8px] py-[1px]">Team</button>
                            </div>
                            <GoPlus className="text-slate-500" style={{fontSize:'18px'}}/>
                        </div>
                        <div className="rounded flex justify-between hover:cursor-pointer py-2 hover:bg-slate-signin px-[12px]">
                            <div className="flex">
                                <span className="text-xs font-medium mr-2">New section</span>
                                <button className="bg-soft-blue text-blue-800 text-xs rounded-lg px-[8px] py-[1px]">Team</button>
                            </div>
                            <GoPlus className="text-slate-500" style={{fontSize:'18px'}}/>
                        </div>
                        <hr className="my-[8px]"></hr>
                        <div className="rounded flex justify-between hover:cursor-pointer py-2 hover:bg-slate-signin px-[12px] ">
                            <div className="flex">
                                <LiaWpforms className="mr-2 text-pink-500"/>
                                <span className="text-xs font-medium">Form</span>
                            </div>
                            <GoPlus className="text-slate-500" style={{fontSize:'18px'}}/>
                        </div>
                    </div>
                    }
                    
                </div>
                
                <div className="h-36"></div>
            </div>
            
        </div>
    );
}
