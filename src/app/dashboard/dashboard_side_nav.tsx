'use client'

import { Session } from "next-auth";
import { PiHouse } from "react-icons/pi";
import { GoPeople } from "react-icons/go";
import { IoBookOutline } from "react-icons/io5";
import { FiShoppingBag } from "react-icons/fi";
import { TbWorld } from "react-icons/tb";
import { GoUpload } from "react-icons/go";
import { FiPlus } from "react-icons/fi";
import { MdArrowForwardIos } from "react-icons/md";
import { api } from "~/trpc/react";
import { useRouter } from 'next/navigation'

export function DashBoardSideNav({menuExtended,setMenuExtended,session}:{menuExtended:boolean,setMenuExtended:React.Dispatch<React.SetStateAction<boolean>>,session:Session|null}){
    const router = useRouter()
    const utils = api.useUtils();
  
    const createBase = api.base.create.useMutation({
        onSuccess: async (data) => {
        await utils.base.invalidate();
        router.push(`/base/${session?.user.id}/${data.id}`)
        },
    });
    

    if (menuExtended){
        return (
        <nav onMouseLeave={()=>setTimeout(() => {setMenuExtended(false)}, 100)} className="w-[300px] relative shadow-lg mr-16">
            <div className="h-full fixed w-[300px] pt-4 px-[14px] flex flex-col justify-between border-r-2 bg-white z-30">
                <div className="flex flex-col">
                    <button className=" hover:bg-slate-300 py-2 px-3 rounded-sm mb-3"><span className="text-md font-semibold flex justify-between ">Home<MdArrowForwardIos className="mt-[6px] text-xs"/></span></button>
                    <button className=" hover:bg-slate-300 py-2 px-3 rounded-sm "><span className="text-md font-semibold flex justify-between">All workspaces
                        <div className="flex">
                            <FiPlus className="mt-[4px] text-md mr-4"/><MdArrowForwardIos className="mt-[6px] text-xs"/>
                        </div>
                        </span>
                    </button>
                </div>
                <div className="flex flex-col">
                    <button className=" hover:bg-slate-300 py-2 px-3 rounded-sm mb-1"><span className="text-xs flex">
                        <IoBookOutline style={{fontSize:'14px'}} className="mt-[1px] mr-2"/>Templates and apps</span></button>
                    <button className=" hover:bg-slate-300 py-2 px-3 rounded-sm mb-1"><span className="text-xs flex">
                        <FiShoppingBag style={{fontSize:'14px'}} className="mt-[1px] mr-2"/>Marketplace</span></button>
                    <button className=" hover:bg-slate-300 py-2 px-3 rounded-sm mb-1"><span className="text-xs flex">
                        <GoUpload style={{fontSize:'14px'}} className="mt-[1px] mr-2"/>Import</span></button>
                        <button onClick={()=>{createBase.mutate()}}
                         className="border border-slate-300  py-[6px] shadow-md hover:bg-sign-up-button-blue-focus 
                                transition ease-in-out duration-300 rounded-md text-white bg-blue-600 flex justify-center">
                                <span className="px-3 
                                font-sm text-sm flex">
                                    <FiPlus style={{fontSize:'14px'}} className="mt-[3px] text-md mr-2"/>
                                    Create
                                </span>
                            </button>
                    <div className="h-24"></div> 
                </div>
                
            </div>
        </nav>
        )
    }else{
        return (
            <nav onMouseEnter={()=>setMenuExtended(true)} className="w-12  sticky top-0 ">
                <div className="h-full fixed w-12 pt-4 px-[14px] flex flex-col justify-between border-r-2">
                    <div>
                        <div className=" mb-[18px]"><PiHouse style={{fontSize:'20px'}}/></div>
                        <div className=" mb-[18px]"><GoPeople style={{fontSize:'20px'}}/></div>
                        <hr></hr>
                    </div>
                    <div>
                        <hr className="mb-[18px]"></hr>
                        <div className="text-slate-500 mb-[18px] flex justify-center"><IoBookOutline style={{fontSize:'16px'}}/></div>
                        <div className="text-slate-500 mb-[18px] flex justify-center"><FiShoppingBag style={{fontSize:'16px'}}/></div>
                        <div className="text-slate-500 mb-[18px] flex justify-center"><TbWorld style={{fontSize:'16px'}}/></div>
                        <div className="text-slate-500 mb-[18px] text-lg text-center border-2 pl-[1.5px] rounded-sm">+</div>
                        <div className="h-11"></div>
                    </div>
                    
                </div>
            </nav>
        
        );
    }
}