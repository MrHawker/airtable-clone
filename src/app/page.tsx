import Link from "next/link";

import { LatestPost } from "~/app/_components/post";
import { auth } from "~/server/auth";
import { api, HydrateClient } from "~/trpc/server";

export default async function Home() {

  return (
    <HydrateClient>
      <main>
        <div
        style={{
            backgroundImage: "url('/Landing_Page/Gradient_BackGround.jpeg')",
            backgroundSize: "cover",
            height: "100vh",
            width: "100%",
        }}
        className="flex"
        >
        <div className="flex flex-col justify-center font-semibold pl-16 mr-20 text-header-color mt-52">
            <span className="text-5xl">
                Digital operations for the AI era
            </span>
            <span className="text-lg mt-4">
                Create modern business apps to manage and automate critical processes.
            </span>
            <div className="pt-6 space-x-4">
                <button className="border border-slate-300  py-2 shadow-md hover:bg-sign-up-button-blue-focus 
                    transition ease-in-out duration-300 rounded-xl text-white bg-sign-up-button-blue">
                    <span className="text-md mx-[36px] 
                    font-semibold">
                        Sign up for free
                    </span>
                </button>
                <button className="border-[2px] border-slate-200  py-2 shadow-md hover:bg-blue-100
                        transition ease-in-out duration-300 rounded-xl 
                        hover:text-hover-blue hover:border-blue-500 mr-5
                        bg-stronger-contact-sale-bg">
                        <span className="text-md mx-[36px] 
                        font-semibold">
                            Contact Sales
                        </span>
                </button>
                    
            </div>
        </div>
        
        <div
        style={{
            backgroundImage: "url('/Landing_Page/Web_Preview.png')",
            backgroundSize: "contain",
            backgroundRepeat: 'no-repeat',
            backgroundPosition: "center",
            width:"75%",
            zIndex:3
        }}
        className="flex w-full mt-48"
        ></div>
        
        </div>

      </main>
    </HydrateClient>
  );
}
