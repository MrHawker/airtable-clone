"use client";


import { useState,useEffect } from "react";
import { Session } from "next-auth";

import { RiArrowDownSLine } from "react-icons/ri";
import { VscBell } from "react-icons/vsc";
import { GoPeople } from "react-icons/go";
import { AiOutlineQuestionCircle } from "react-icons/ai";
import { LuHistory } from "react-icons/lu";

export function HeadNav({
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
    <header className="sticky top-0 shadow-sm border-b-2 bg-card-brown z-30 px-2 text-white">
        <nav className="flex justify-between items-center py-1">
            <div className="flex items-center px-2">
                <button className="flex py-[12px] ml-2 lg:ml-0  mr-2 ">
                <svg className="mr-[16px] mt-[1px]" xmlns="http://www.w3.org/2000/svg" width="24" height="24"  viewBox="0 0 200 170"><path fill="#ffffff" d="M90.039 12.368 24.079 39.66c-3.667 1.519-3.63 6.729.062 8.192l66.235 26.266a24.58 24.58 0 0 0 18.12 0l66.236-26.266c3.69-1.463 3.729-6.673.06-8.191l-65.958-27.293a24.58 24.58 0 0 0-18.795 0"></path><path fill="#ffffff" d="M105.312 88.46v65.617c0 3.12 3.147 5.258 6.048 4.108l73.806-28.648a4.42 4.42 0 0 0 2.79-4.108V59.813c0-3.121-3.147-5.258-6.048-4.108l-73.806 28.648a4.42 4.42 0 0 0-2.79 4.108"></path><path fill="#ffffff" d="m88.078 91.846-21.904 10.576-2.224 1.075-46.238 22.155c-2.93 1.414-6.672-.722-6.672-3.978V60.088c0-1.178.604-2.195 1.414-2.96a5 5 0 0 1 1.12-.84c1.104-.663 2.68-.84 4.02-.31L87.71 83.76c3.564 1.414 3.844 6.408.368 8.087"></path></svg>
                <p className="text-lg font-semibold mr-1 ">Untitled Base</p>
                <RiArrowDownSLine className="mr-[4px] mt-[5px] " />
                </button>
                <ul className="flex items-center font-light text-xs">
                    <li className="mr-[8px]">
                        <div className="text-center bg-data-brown rounded-2xl px-[14px] py-[7px] shadow-inner-strong">
                            <p>Data</p>
                        </div>
                    </li>
                    <li className="mr-[8px] hover:cursor-pointer hover:bg-data-brown rounded-2xl transition ease-in-out duration-200">
                        <div className="text-center rounded-2xl px-[14px] py-[7px] ">
                            <p>Automations</p>
                        </div>
                    </li>
                    <li className="mr-[8px] hover:cursor-pointer hover:bg-data-brown rounded-2xl transition ease-in-out duration-200">
                        <div className="text-center rounded-2xl px-[14px] py-[7px] ">
                            <p>Interfaces</p>
                        </div>
                    </li>
                    <div className="border-[1px]" style={{height: '20px' }}></div>
                    <li className="mr-[8px] pl-[12px] ">
                        <div className="text-center  px-[14px] py-[7px] hover:cursor-pointer hover:bg-data-brown rounded-2xl transition ease-in-out duration-200">
                            <p>Forms</p>
                        </div>
                    </li>
                </ul>
                
            </div>
                <ul className="flex items-center font-light text-xs">
                        <li className=" hover:cursor-pointer hover:bg-data-brown rounded-2xl transition ease-in-out duration-200">
                            <div className="text-center rounded-2xl px-[14px] py-[7px]">
                                <LuHistory style={{fontSize:'16px'}}/>
                            </div>
                        </li>
                        <li className="mr-[8px] hover:cursor-pointer hover:bg-data-brown rounded-2xl transition ease-in-out duration-200">
                            <div className="text-center rounded-2xl px-[14px] py-[7px] flex">
                                <AiOutlineQuestionCircle style={{fontSize:'16px'}}/>
                                <p className="ml-[4px]">Help</p>
                            </div>
                        </li>
                        <li className="mr-[8px] hover:cursor-pointer">
                            <div className="text-center bg-deeper-brown rounded-2xl px-[14px] py-[8px] shadow-inner">
                                <p>Trial: 9 days left</p>
                            </div>
                        </li>
                        <li className="mr-[8px] bg-slate-50 hover:cursor-pointer hover:bg-white rounded-2xl transition ease-in-out duration-200 py-[6px] px-[12px] mx-[8px]">
                            <div className="flex text-center">
                                <GoPeople style={{fontSize:'16px'}} className="text-card-brown mr-1"/>
                                <span className="text-card-brown mt-[1px]">Share</span>
                            </div>
                            
                        </li>
                        <li className="mx-[8px] bg-slate-50 hover:cursor-pointer hover:bg-white rounded-full transition ease-in-out duration-200 pl-[7px] p-[6px]">
                            <VscBell style={{fontSize:'16px'}} className="text-card-brown "/>
                        </li>
                        
                        <li className="mr-[8px] pl-[12px] ">
                            {session?.user.image && (
                            <img
                            onClick={(e)=>{e.stopPropagation();setOpen(true)}}
                            src={session.user.image}
                            alt="User profile"
                            className="w-[25px] h-[25px] rounded-full shadow-md hover:cursor-pointer border border-white"
                            />
                            )}
                        </li>
                    </ul>
                
        </nav>
    </header>
    
  );
}
