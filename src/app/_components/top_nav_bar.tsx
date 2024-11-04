"use client";

import { useState } from "react";

import { api } from "~/trpc/react";

import { RightHat } from "../svg/rightHat";

export function Top_Nav_Bar() {
  return (
    <div className="absolute">
        <div className="fixed w-full">
            <div style={{ backgroundColor: '#f0f6ff' }} className="flex justify-center text-xl space-x-3 py-3 px-6">
                <span>Introducing Airtable ProductCentral.</span>
                <span className="text-sign-up-button-blue font-semibold">See it in action</span>
                <svg className="mt-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 13" width="24" height="19.5" fill="none"><path stroke="#254fad" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m10 1.5 5 5-5 5"></path><path stroke="#254fad" strokeLinecap="round" strokeWidth="2" d="M15 6.5H1"></path></svg>
                
            </div>
            <div style={{ backgroundColor: 'white' }} className="flex justify-between pr-10 pl-10">
                <div className="flex justify-between w-1/2">
                    <div className="mt-8 mb-8" >
                        <button className="flex">
                            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="40.5"  viewBox="0 0 200 170"><path fill="#FCB400" d="M90.039 12.368 24.079 39.66c-3.667 1.519-3.63 6.729.062 8.192l66.235 26.266a24.58 24.58 0 0 0 18.12 0l66.236-26.266c3.69-1.463 3.729-6.673.06-8.191l-65.958-27.293a24.58 24.58 0 0 0-18.795 0"></path><path fill="#18BFFF" d="M105.312 88.46v65.617c0 3.12 3.147 5.258 6.048 4.108l73.806-28.648a4.42 4.42 0 0 0 2.79-4.108V59.813c0-3.121-3.147-5.258-6.048-4.108l-73.806 28.648a4.42 4.42 0 0 0-2.79 4.108"></path><path fill="#F82B60" d="m88.078 91.846-21.904 10.576-2.224 1.075-46.238 22.155c-2.93 1.414-6.672-.722-6.672-3.978V60.088c0-1.178.604-2.195 1.414-2.96a5 5 0 0 1 1.12-.84c1.104-.663 2.68-.84 4.02-.31L87.71 83.76c3.564 1.414 3.844 6.408.368 8.087"></path><path fill="rgba(0, 0, 0, 0.25)" d="m88.078 91.846-21.904 10.576-53.72-45.295a5 5 0 0 1 1.12-.839c1.104-.663 2.68-.84 4.02-.31L87.71 83.76c3.564 1.414 3.844 6.408.368 8.087"></path></svg>
                            <p className="text-4xl font-semibold ml-2">Airtable</p>
                        </button>
                    </div>
                    <div className="mt-9 mb-8">
                        <button className=" hover:text-hover-blue transition ease-in-out duration-300">
                            <span className="text-2xl font-medium flex">
                                Platform
                            <RightHat/>
                            </span>
                            
                        </button>
                    </div>
                    <div className="mt-9 mb-8" >   
                        <button className=" hover:text-hover-blue transition ease-in-out duration-300"><span className="text-2xl font-medium flex">Solutions<RightHat/></span></button>
                    </div>
                    <div className="mt-9 mb-8" >
                        <button className=" hover:text-hover-blue transition ease-in-out duration-300"><span className="text-2xl font-medium flex">Resources<RightHat/></span></button>
                    </div>
                    <div className="mt-9 mb-8" >
                        <button className=" hover:text-hover-blue transition ease-in-out duration-300"><span className="text-2xl font-medium">Enterprise</span></button>
                    </div>
                    <div className="mt-9 mb-8">
                        <button className=" hover:text-hover-blue transition ease-in-out duration-300"><span className="text-2xl font-medium">Pricing</span></button>
                    </div>
                </div>
                <div id="ActionButtonGroup" className="mt-9 mb-8 flex">
                    <button className="border-[2px] border-slate-200  py-1 shadow-md hover:bg-blue-100
                        transition ease-in-out duration-300 rounded-xl 
                        hover:text-hover-blue hover:border-blue-500 mr-5">
                        <span className="text-2xl px-4 
                        font-medium">
                            Contact Sales
                        </span>
                    </button>
                    <button className="border border-slate-300  py-1 shadow-md hover:bg-sign-up-button-blue-focus 
                        transition ease-in-out duration-300 rounded-xl text-white bg-sign-up-button-blue">
                        <span className="text-2xl px-4 
                        font-medium">
                            Sign up for free
                        </span>
                    </button>
                    
                    <button className="py-1 hover:text-sign-up-button-blue 
                        transition ease-in-out duration-300 ">
                        <span className="text-2xl px-4 
                        font-medium">
                            Sign in
                        </span>
                    </button>
                    
                </div>
            </div>
        </div>
        
    </div>
    
  );
}
