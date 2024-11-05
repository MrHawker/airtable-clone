'use client'
import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa";
import { signIn,useSession } from "next-auth/react";
import { redirect } from "next/navigation";
export default function Page(){
    const { data: session } = useSession();

    if (session) {
        redirect("/");
    }
    
    return (
        <div
        style={{
            backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)), url('/blurred_base.png')",
            backgroundSize: "cover",
            width: "100%",
            height: "100vh"
        }}
        className="lg:pb-8"
        >
            <div className="h-full w-full px-0 lg:px-48 xl:px-[440px] lg:py-[12px]">
                <div className="bg-white rounded-md h-full ">
                    <div className="bg-slate-signin lg:flex justify-center py-8 px-4 lg:mt-6 rounded-t-md hidden">
                        <button className="flex">
                            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="32"  viewBox="0 0 200 170"><path fill="#FCB400" d="M90.039 12.368 24.079 39.66c-3.667 1.519-3.63 6.729.062 8.192l66.235 26.266a24.58 24.58 0 0 0 18.12 0l66.236-26.266c3.69-1.463 3.729-6.673.06-8.191l-65.958-27.293a24.58 24.58 0 0 0-18.795 0"></path><path fill="#18BFFF" d="M105.312 88.46v65.617c0 3.12 3.147 5.258 6.048 4.108l73.806-28.648a4.42 4.42 0 0 0 2.79-4.108V59.813c0-3.121-3.147-5.258-6.048-4.108l-73.806 28.648a4.42 4.42 0 0 0-2.79 4.108"></path><path fill="#F82B60" d="m88.078 91.846-21.904 10.576-2.224 1.075-46.238 22.155c-2.93 1.414-6.672-.722-6.672-3.978V60.088c0-1.178.604-2.195 1.414-2.96a5 5 0 0 1 1.12-.84c1.104-.663 2.68-.84 4.02-.31L87.71 83.76c3.564 1.414 3.844 6.408.368 8.087"></path><path fill="rgba(0, 0, 0, 0.25)" d="m88.078 91.846-21.904 10.576-53.72-45.295a5 5 0 0 1 1.12-.839c1.104-.663 2.68-.84 4.02-.31L87.71 83.76c3.564 1.414 3.844 6.408.368 8.087"></path></svg>
                            <span className="text-2xl font-semibold ml-1">Airtable</span>
                        </button>
                    </div>
                    <div className="mt-[32px]">
                        <h1 className="flex justify-center"><span className="text-2xl lg:text-3xl font-semibold">Sign in</span></h1>
                        <p className="mt-[8px] mb-[32px] text-center text-sm lg:text-base">or <a href="/SignUp"><u className="text-blue-600">create an account</u></a></p>
                    </div>
                    <div className="px-4 lg:px-20" >
                        <p className="text-xl">Email</p>
                        <input placeholder="Email address" className="mb-[32px] focus:outline-none focus:border-[2px] focus:border-blue-500 mt-[8px] py-2 w-full rounded-lg px-4 border-[2px] border-slate-300"></input>
                        <div className="text-center w-full border border-slate-300 py-[7px] px-[14px]
                                 rounded-xl text-white bg-sign-up-button-blue opacity-50">
                                <span className="text-md
                                ">
                                    Continue
                                </span>
                        </div>
                        <div className="flex justify-between items-center mb2">
                            <div  style={{ backgroundColor: "rgba(0, 14, 38, 0.23)", width: "100%", height: "1px" }}></div>
                            <span className="p-2 text-slate-400">or</span>
                            <div style={{ backgroundColor: "rgba(0, 14, 38, 0.23)", width: "100%", height: "1px" }}></div>
                        </div>
                        <div className="p-1 space-y-4">
                            <button onClick={()=>signIn('google')} className="border-2 py-[5px]  hover:border-2 hover:border-black 
                                rounded-xl w-full flex justify-center hover:bg-slate-100">
                                <FcGoogle className="mt-1 mr-2" style={{ fontSize: '20px' }}/>
                                <span className="text-xl px-3 
                                ">
                                    Sign in with Google
                                </span>
                            </button>
                            <button className="border-2 py-[5px]  hover:border-2 hover:border-black 
                                rounded-xl w-full flex justify-center hover:bg-slate-100">
                                
                                <span className="text-xl px-3 
                                ">
                                    Sign in with Single Sign On
                                </span>
                            </button>
                            <button className="border-2  py-[5px]  hover:border-2 hover:border-black 
                                rounded-xl w-full flex justify-center hover:bg-slate-100">
                                <FaApple className="mt-1 mr-2" style={{ fontSize: '20px' }}/>
                                <span className="text-xl px-3 
                                ">
                                    Sign in with Apple
                                </span>
                            </button>
                            
                        </div>
                        
                        
                    </div>
                </div>
                
            </div>
        </div>
    );
}