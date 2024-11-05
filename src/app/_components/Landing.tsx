'use client';

import { Top_Nav_Bar } from "~/app/_components/top_nav_bar";
import { useState } from "react";
import { MdArrowForwardIos } from "react-icons/md";
import { AirtableFooter } from "./companies_banner";
import { Session } from "next-auth";
import { signIn } from "next-auth/react";
export function Landing({session}:{session:Session|null}) {
  
  const [menuExtended,setMenuExtended] = useState(false);  
  if (!menuExtended) return (
    <main>
        <Top_Nav_Bar session={session} menuExtended={menuExtended} setMenuExtended={setMenuExtended}/>
        <div
        style={{
            backgroundImage: "url('/Landing_Page/Gradient_BackGround.jpeg')",
            backgroundSize: "cover",
            width: "100%",
        }}
        className="flex flex-col xl:flex-row"
        >
        <div className="flex flex-col pt-10 xl:pt-56 px-6 xl:pl-12 xl:pr-0 xl:mr-10 text-header-color  mb-4">
            <h1 className="text-4xl xl:text-5xl font-bold ">
                Digital operations for the AI era
            </h1>
            <span className=" text-md xl:text-lg mt-4 font-semibold">
                Create modern business apps to manage and automate critical processes.
            </span>
            <div className="pt-6  xl:space-x-4 flex flex-col xl:flex-row">
                <button className="border border-slate-300  py-2 shadow-md hover:bg-sign-up-button-blue-focus 
                    transition ease-in-out duration-300 rounded-xl text-white bg-sign-up-button-blue mb-3 xl:mb-0">
                    <span className="text-md mx-[36px]  
                    font-semibold">
                        Sign up for free
                    </span>
                </button>
                <button className="border-[2px] border-slate-200  py-2 shadow-md hover:bg-blue-100
                        transition ease-in-out duration-300 rounded-xl 
                        hover:text-hover-blue hover:border-blue-500 
                        bg-stronger-contact-sale-bg">
                        <span className="text-md mx-[36px] 
                        font-semibold">
                            Contact Sales
                        </span>
                </button> 
            </div>
        </div>
        <div className="pt-20 px-12 xl:pl-10 xl:pr-0 mb-4 flex-grow">
            <img className="shadow-2xl" width={1200} height={600} src="/Landing_Page/Web_Preview.png">
            </img>
        </div>
        </div>
        <AirtableFooter/>
      </main>
  );
  else{
    return (
        <main>
            <Top_Nav_Bar session={session} menuExtended={menuExtended} setMenuExtended={setMenuExtended}/>
            <nav className="flex flex-col py-[8px]">
                <button className=" hover:text-hover-blue transition ease-in-out duration-300  px-[24px] py-[16px] ">
                    <span className="text-lg font-semibold  flex justify-between">
                        Platform
                    <MdArrowForwardIos className="mt-2 text-slate-500 text-xs"/>
                    </span>
                </button>
                <button className=" px-[24px] py-[16px] hover:text-hover-blue transition ease-in-out duration-300"><span className="text-lg font-semibold  flex justify-between">Solutions<MdArrowForwardIos className="mt-2 text-slate-500 text-xs"/></span></button>
                <button className=" px-[24px] py-[16px] hover:text-hover-blue transition ease-in-out duration-300"><span className="text-lg font-semibold  flex justify-between">Resources<MdArrowForwardIos className="mt-2 text-slate-500 text-xs"/></span></button>
                <button className=" px-[24px] py-[16px] hover:text-hover-blue transition ease-in-out duration-300"><span className="text-lg font-semibold  flex">Enterprise</span></button>
                <button className=" px-[24px] py-[16px] hover:text-hover-blue transition ease-in-out duration-300"><span className="text-lg font-semibold  flex">Pricing</span></button>
                <button className=" mt-[10px] px-[24px] py-[16px] hover:text-hover-blue transition ease-in-out duration-300"><span className="text-lg font-semibold  flex">Contact Sales</span></button>
                <button onClick={()=>signIn('google')} className=" px-[24px] py-[16px] hover:text-hover-blue transition ease-in-out duration-300"><span className="text-lg font-semibold  flex">Sign In</span></button>
            </nav>
            
        </main>
    );
  }
}
