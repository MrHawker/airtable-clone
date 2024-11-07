'use client'
import { useState } from 'react';
import { HeadNav } from './head_nav'
import { Session } from 'next-auth';
import { signOut } from 'next-auth/react';

export  function Entry({session}:{session:Session}) {
    
    
    const [open,setOpen] = useState(false);

    return (
        <main className="relative " onClick={()=>{setOpen(false)}}>
            <HeadNav open={open} setOpen={setOpen} session={session}/>
            
            <div className='h-screen bg-slate-50'></div>
            {open &&
            
            <div className="fixed top-12 right-0 z-40 p-[12px] bg-white rounded-md shadow-md border-2 w-72">
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
    )
}
