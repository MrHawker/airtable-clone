"use client";


import { useState,useEffect } from "react";
import { Session } from "next-auth";
import { CiMenuBurger } from "react-icons/ci";
import { RxMagnifyingGlass } from "react-icons/rx";

export function DashboardHeadNav({
    open,
    setOpen,
    session
    }:
    {open:boolean,
    setOpen:React.Dispatch<React.SetStateAction<boolean>>,
    session:Session|null}) 
  {

  const [isDesktop,setIsDesktop] = useState(false);
  
  
  useEffect(() => {
    
    const isDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    isDesktop();
    
    window.addEventListener("resize", isDesktop);

    return () => window.removeEventListener("resize", isDesktop);
  }, []);
  return (
    <header className="sticky top-0 shadow-sm border-b-2 bg-white z-30 px-2">
        <nav className="flex justify-between items-center py-1">
            <div className="flex items-center space-x-4">
                {isDesktop && <CiMenuBurger style={{fontSize:'30px'}} className="pl-[8px] pr-[4px]"/>}
                <button className="flex py-[12px] ml-2 lg:ml-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="24"  viewBox="0 0 200 170"><path fill="#FCB400" d="M90.039 12.368 24.079 39.66c-3.667 1.519-3.63 6.729.062 8.192l66.235 26.266a24.58 24.58 0 0 0 18.12 0l66.236-26.266c3.69-1.463 3.729-6.673.06-8.191l-65.958-27.293a24.58 24.58 0 0 0-18.795 0"></path><path fill="#18BFFF" d="M105.312 88.46v65.617c0 3.12 3.147 5.258 6.048 4.108l73.806-28.648a4.42 4.42 0 0 0 2.79-4.108V59.813c0-3.121-3.147-5.258-6.048-4.108l-73.806 28.648a4.42 4.42 0 0 0-2.79 4.108"></path><path fill="#F82B60" d="m88.078 91.846-21.904 10.576-2.224 1.075-46.238 22.155c-2.93 1.414-6.672-.722-6.672-3.978V60.088c0-1.178.604-2.195 1.414-2.96a5 5 0 0 1 1.12-.84c1.104-.663 2.68-.84 4.02-.31L87.71 83.76c3.564 1.414 3.844 6.408.368 8.087"></path><path fill="rgba(0, 0, 0, 0.25)" d="m88.078 91.846-21.904 10.576-53.72-45.295a5 5 0 0 1 1.12-.839c1.104-.663 2.68-.84 4.02-.31L87.71 83.76c3.564 1.414 3.844 6.408.368 8.087"></path></svg>
                    <span className="text-xl font-semibold ml-1">Airtable</span>
                </button>
            </div>
            <div className="justify-center flex w-[120px] lg:w-[350px] ">
                <div className=" hover:shadow-md hover:cursor-pointer w-full shadow-sm flex border rounded-3xl border-slate-200 text-xs px-[16px] py-[7px] justify-between" >
                    <div className="flex">
                        <RxMagnifyingGlass style={{fontSize:'18px'}}/>
                        <p className="ml-[8px] pt-[1px] text-slate-400">Search...</p>
                    </div>
                    
                </div>
            </div>
                <div className="flex text-xs">
                    <p className="px-[12px] mt-1">Help</p>
                    {isDesktop && <p className="px-[12px] mt-1">Noti</p>}
                    {session?.user.image && (
                    <img
                    onClick={(e)=>{e.stopPropagation();setOpen(true)}}
                    src={session.user.image}
                    alt="User profile"
                    className="w-6 h-6 rounded-full shadow-md hover:cursor-pointer"
                    />
                    )}
                </div>
        </nav>
    </header>
    
  );
}
