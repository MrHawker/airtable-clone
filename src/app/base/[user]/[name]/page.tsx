import React from 'react'

import { Entry } from './entry'
import { auth } from '~/server/auth';
import { redirect } from 'next/navigation';
import { HydrateClient } from '~/trpc/server';

export default async function Page({ params }: { params: Promise<{ user: string, name: string }> }) {
    
    const session = await auth();
    if(!session){
        redirect('/')
    }

    return (
        <HydrateClient>
            <Entry session={session}/>
            
        </HydrateClient>
    )
}
