'use client';

import { Session } from "next-auth";
import { DashboardHeadNav } from "./dashboard_head_nav";
import { DashBoardSideNav } from "./dashboard_side_nav";
import { useState } from "react";
import { RxGrid } from "react-icons/rx";
import { FiTable } from "react-icons/fi";
import { IoIosArrowRoundUp } from "react-icons/io";
import { MdKeyboardArrowDown } from "react-icons/md";
import { CiMenuBurger, CiStar } from "react-icons/ci";

import { BaseCards } from "../_components/base_cards";
import { signOut } from "next-auth/react";

export function Dashboard({session}:{session:Session}){
    const [menuExtended,setMenuExtended] = useState(false);
    const [open,setOpen] = useState(false)
    return (
        <main className="relative" onClick={()=>setOpen(false)}>
            <DashboardHeadNav open={open} setOpen={setOpen} session={session}/>
            <div className="flex w-full">
                <DashBoardSideNav menuExtended={menuExtended} setMenuExtended={setMenuExtended} session={session}/>
                <div className="w-full min-h-screen py-[32px] px-[48px] bg-slate-50">
                    <h1 className="text-3xl mb-[24px] font-bold">Home</h1>
                    <div className="w-full flex gap-2 flex-wrap mb-6">
                        <div className="p-[16px] border-2 bg-white rounded-md flex-grow lg:flex-1 lg:basis-[calc(25%-1rem)] hover:shadow-md hover:cursor-pointer">
                            <h1 className="text-md font-medium flex mb-2">
                                <CiStar strokeWidth={1} className="mt-1 mr-2 text-pink-500 "/>
                                Start with AI
                            </h1>
                            <p className="text-xs text-slate-600">Turn your process into an app with data and interfaces using AI.</p>
                        </div>
                        <div className="p-[16px] border-2 bg-white rounded-md flex-grow lg:flex-1 lg:basis-[calc(25%-1rem)] hover:shadow-md hover:cursor-pointer">
                            <h1 className="text-md font-medium flex mb-2">
                                <RxGrid strokeWidth={1} className="mt-1 mr-2 text-purple-500 "/>
                                Start with templates
                            </h1>
                            <p className="text-xs text-slate-600">Turn your process into an app with data and interfaces using AI.</p>
                        </div>
                        <div className="p-[16px] border-2 bg-white rounded-md flex-grow lg:flex-1 lg:basis-[calc(25%-1rem)] hover:shadow-md hover:cursor-pointer">
                            <h1 className="text-md font-medium flex mb-2">
                                <IoIosArrowRoundUp style={{fontSize:'24px'}} strokeWidth={1} className="mr-2 text-green-500 "/>
                                Quickly upload
                            </h1>
                            <p className="text-xs text-slate-600">Turn your process into an app with data and interfaces using AI.</p>
                        </div>
                        <div className="p-[16px] border-2 bg-white rounded-md flex-grow lg:flex-1 lg:basis-[calc(25%-1rem)] hover:shadow-md hover:cursor-pointer">
                            <h1 className="text-md font-medium flex mb-2">
                                <FiTable strokeWidth={1} className="mt-1 mr-2 text-blue-600 "/>
                                Start from scratch
                            </h1>
                            <p className="text-xs text-slate-600">Turn your process into an app with data and interfaces using AI.</p>
                        </div>
                    </div>
                    <div className="flex justify-between pb-[20px]">
                        <div className="text-slate-500 font-light flex">
                            <button className="hover:text-black mr-3 flex">
                                Opened by you
                                <MdKeyboardArrowDown style={{fontSize:'20px'}} className="ml-2 mt-[2px]"/>
                            </button>
                            <button className="mr-3 flex hover:text-black">
                                Show all types
                                <MdKeyboardArrowDown style={{fontSize:'20px'}} className="ml-2 mt-[2px]"/>
                            </button>
                        </div>
                        <div className="flex">
                            <CiMenuBurger style={{fontSize:'20px'}} className="ml-2 mt-[2px]"/>
                            <RxGrid style={{fontSize:'20px'}} className="ml-2 mt-[2px]"/>
                        </div>
                    </div>
                    
                    <BaseCards/>
                    
                </div>
                
            </div>
            
            {open &&
            
            <div className="absolute top-12 right-0 z-40 p-[12px] bg-white rounded-md shadow-md border-2 w-72">
                <div className="pt-[8px] pb-[16px] mb-[8px] mx-[8px]">
                    <p className="text-sm font-semibold">
                        {session.user.name}
                    </p>
                    <p className="text-xs">
                        {session.user.email}
                    </p>
                </div>
                <hr></hr>
                <p className="text-xs p-[8px] hover:bg-slate-100 hover:cursor-pointer">Account</p>
                <p className="text-xs p-[8px] hover:bg-slate-100 hover:cursor-pointer">Manage groups</p>
                <p className="text-xs p-[8px] hover:bg-slate-100 hover:cursor-pointer">Notification perferences</p>
                <p className="text-xs p-[8px] hover:bg-slate-100 hover:cursor-pointer">Language preferences</p>
                <hr className="m-[8px]"></hr>
                <p className="text-xs p-[8px] hover:bg-slate-100 hover:cursor-pointer">Contact sales</p>
                <p className="text-xs p-[8px] hover:bg-slate-100 hover:cursor-pointer">Upgrade</p>
                <p className="text-xs p-[8px] hover:bg-slate-100 hover:cursor-pointer">Tell a friend</p>
                <hr className="m-[8px]"></hr>
                <p className="text-xs p-[8px] hover:bg-slate-100 hover:cursor-pointer">Integrations</p>
                <p className="text-xs p-[8px] hover:bg-slate-100 hover:cursor-pointer">Builder hub</p>
                <hr className="m-[8px]"></hr>
                <p className="text-xs p-[8px] hover:bg-slate-100 hover:cursor-pointer">Trash</p>
                <p onClick={()=>signOut({ callbackUrl: "/" })} className="text-xs p-[8px] hover:bg-slate-100 hover:cursor-pointer">Log out</p>
            </div>
            
            }
            
        </main>
    );
}