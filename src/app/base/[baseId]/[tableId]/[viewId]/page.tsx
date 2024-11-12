import React from 'react'

import { Entry } from './entry'
import { auth } from '~/server/auth';
import { redirect } from 'next/navigation';
import { HydrateClient } from '~/trpc/server';

export default async function Page({ params }: { params: Promise<{ baseId: string, tableId: string,viewId: string }> }) {
    
    const session = await auth();
    if(!session){
        redirect('/')
    }

    return (
        <HydrateClient>
            <Entry params={params} session={session}/>
            
        </HydrateClient>
    )
}
