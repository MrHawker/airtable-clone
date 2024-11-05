"use client";

import Link from "next/link";
import { RightHat } from "../svg/rightHat";
import { useState,useEffect } from "react";
import { HiMenuAlt4 } from "react-icons/hi";
import { RxCross1 } from "react-icons/rx";
import { Session } from "next-auth";


export function Top_Nav_Bar({menuExtended,setMenuExtended,session}:{menuExtended:boolean,setMenuExtended:React.Dispatch<React.SetStateAction<boolean>>,session:Session|null}) {
  const [isDesktop,setIsDesktop] = useState(false);
  
  useEffect(() => {
    
    const isDesktop = () => {
      setIsDesktop(window.innerWidth >= 1100);
    };
    isDesktop();
    
    window.addEventListener("resize", isDesktop);

    return () => window.removeEventListener("resize", isDesktop);
  }, []);
  return (
    <header className="sticky top-0 z-30 drop-shadow">
        <div className="w-full">
            <div style={{ backgroundColor: '#f0f6ff' }} className="flex flex-col text-sm md:flex-row md:justify-center md:text-sm md:space-x-3 py-[12px] px-[32px]">
                <span>Introducing Airtable ProductCentral.</span>
                <span className="text-sign-up-button-blue font-semibold flex mt-2 md:mt-0">
                    <span className="mr-2">See it in action</span>
                    <svg className="mt-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 13" width="16" height="13" fill="none"><path stroke="#254fad" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m10 1.5 5 5-5 5"></path><path stroke="#254fad" strokeLinecap="round" strokeWidth="2" d="M15 6.5H1"></path></svg>
                </span>
            </div>
            
            <nav style={{ backgroundColor: 'white' }} className="flex px-[32px] justify-between">
                <div className="flex justify-between space-x-6">
                    <button className="flex my-[20px]">
                        <svg xmlns="http://www.w3.org/2000/svg" width="38.4" height="32"  viewBox="0 0 200 170"><path fill="#FCB400" d="M90.039 12.368 24.079 39.66c-3.667 1.519-3.63 6.729.062 8.192l66.235 26.266a24.58 24.58 0 0 0 18.12 0l66.236-26.266c3.69-1.463 3.729-6.673.06-8.191l-65.958-27.293a24.58 24.58 0 0 0-18.795 0"></path><path fill="#18BFFF" d="M105.312 88.46v65.617c0 3.12 3.147 5.258 6.048 4.108l73.806-28.648a4.42 4.42 0 0 0 2.79-4.108V59.813c0-3.121-3.147-5.258-6.048-4.108l-73.806 28.648a4.42 4.42 0 0 0-2.79 4.108"></path><path fill="#F82B60" d="m88.078 91.846-21.904 10.576-2.224 1.075-46.238 22.155c-2.93 1.414-6.672-.722-6.672-3.978V60.088c0-1.178.604-2.195 1.414-2.96a5 5 0 0 1 1.12-.84c1.104-.663 2.68-.84 4.02-.31L87.71 83.76c3.564 1.414 3.844 6.408.368 8.087"></path><path fill="rgba(0, 0, 0, 0.25)" d="m88.078 91.846-21.904 10.576-53.72-45.295a5 5 0 0 1 1.12-.839c1.104-.663 2.68-.84 4.02-.31L87.71 83.76c3.564 1.414 3.844 6.408.368 8.087"></path></svg>
                        <span className="text-2xl font-semibold ml-1">Airtable</span>
                    </button>
                    
                    {isDesktop ? <>
                        <button className=" hover:text-hover-blue transition ease-in-out duration-300 ">
                            <span className="text-md font-medium flex">
                                Platform
                            <RightHat/>
                            </span>
                        </button>
                        <button className=" hover:text-hover-blue transition ease-in-out duration-300"><span className="text-md font-medium flex">Solutions<RightHat/></span></button>
                        <button className=" hover:text-hover-blue transition ease-in-out duration-300"><span className="text-md font-medium flex">Resources<RightHat/></span></button>
                        <button className=" hover:text-hover-blue transition ease-in-out duration-300"><span className="text-md font-medium">Enterprise</span></button>
                        <button className=" hover:text-hover-blue transition ease-in-out duration-300"><span className="text-md font-medium">Pricing</span></button>
                    </> :
                    <div></div>}
                    

                </div>
                <div className="flex">
                        {isDesktop ? <div className="my-[20px] mr-3">
                            <button className="border-[2px] border-slate-200  py-1 shadow-md hover:bg-blue-100
                                transition ease-in-out duration-300 rounded-xl 
                                hover:text-hover-blue hover:border-blue-500">
                                <span className="text-md px-3 
                                font-medium">
                                    Contact Sales
                                </span>
                            </button>
                        </div>
                        :<></>}
                        
                        <div className="my-[20px] mr-2">
                            <button className="border border-slate-300  py-1 shadow-md hover:bg-sign-up-button-blue-focus 
                                transition ease-in-out duration-300 rounded-xl text-white bg-sign-up-button-blue">
                                {isDesktop ? <span className="text-md px-3 
                                font-medium">
                                    
                                    Sign up for free
                                </span>:
                                <span className="text-md px-3 
                                font-medium">
                                    
                                    Sign up
                                </span>
                                }
                            </button>
                        </div>
                        {isDesktop ? <button className=" hover:text-sign-up-button-blue 
                            transition ease-in-out duration-300 ">
                            <span className="">
                                <Link
                                    href={session ? "/api/auth/signout" : "/api/auth/signin"}
                                    className="text-md px-3font-medium"
                                >
                                    {session ? "Sign out" : "Sign in"}
                                </Link>
                            </span>
                        </button>:
                        <button onClick={()=>{setMenuExtended(!menuExtended)}} className=" hover:text-sign-up-button-blue 
                            transition ease-in-out duration-300 flex flex-col justify-center">
                            <span className="
                            font-medium">
                                {!menuExtended ? <HiMenuAlt4 style={{fontSize: '30px' }}/>
                                : <RxCross1 style={{fontWeight: '100',fontSize: '30px' }}/>}
                            </span>
                        </button>
                        }
                        
                    </div>
            </nav>
        </div>
    </header>
    
  );
}
