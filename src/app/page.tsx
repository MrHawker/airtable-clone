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
        <div className="flex flex-col justify-center font-bold pl-16 mr-32 text-header-color mt-36">
            <span className="text-6xl pr-30 ">
                Digital operations for the AI era
            </span>
            <span className="text-2xl  pr-30 mt-4">
                Create modern business apps to manage and automate critical processes.
            </span>
            <div className="pt-12 space-x-6">
                <button className="border border-slate-300  py-3 shadow-md hover:bg-sign-up-button-blue-focus 
                    transition ease-in-out duration-300 rounded-xl text-white bg-sign-up-button-blue">
                    <span className="text-2xl px-12
                    font-semibold">
                        Sign up for free
                    </span>
                </button>
                <button className="border-[2px] border-slate-200  py-3 shadow-md hover:bg-blue-100
                        transition ease-in-out duration-300 rounded-xl 
                        hover:text-hover-blue hover:border-blue-500 mr-5
                        bg-stronger-contact-sale-bg">
                        <span className="text-2xl px-12
                        font-semibold">
                            Contact Sales
                        </span>
                </button>
                    
            </div>
        </div>
        <span className="flex-none pt-64">
            <img width={1116} height={563} className="shadow-xl " src="/Landing_Page/Web_Preview.png">
            </img>
        </span>    
        </div>

      </main>
    </HydrateClient>
  );
}
