'use client'
import { useEffect, useRef, useState } from 'react';
import { HeadNav } from './head_nav'
import { Session } from 'next-auth';
import { signOut } from 'next-auth/react';
import { SideNav } from './side_nav';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { Table } from './table';
import { ColumnDef, ColumnFiltersState,SortingState } from '@tanstack/react-table';
import { JsonValue } from '@prisma/client/runtime/library';
import { useParams } from 'next/navigation';
import { api } from '~/trpc/react';
interface RowData {
    values: JsonValue;
    rowId: number;
}
export  function Entry({session}:{session:Session}) {
    
    const params = useParams<{ baseId: string; tableId: string; viewId: string }>();
    const { data: views, isLoading: isViewsLoading } = api.view.getViews.useQuery({tableId:params.tableId});
    
    const [open,setOpen] = useState(false);
    const [filters,setFilters] = useState<ColumnFiltersState>([])
    
    const [sorts,setSorts] = useState<SortingState>([])
    const [columns, setColumns] = useState<ColumnDef<JsonValue>[]>([]);
    const [viewList,setViewList] = useState<string[]>([]);
    const [searchKey,setSearchKey] = useState("")

    useEffect(()=>{
        if (isViewsLoading) return;
        const content = views?.map((view)=>{
            return view.id
        })
        setViewList(content ?? [])
    },[views])

    if(isViewsLoading){
        return <div>Loading...</div>
    }

    return (
        <main className="relative" onClick={()=>{setOpen(false)}}>
            <HeadNav 
            open={open} setOpen={setOpen} 
            filters={filters} setFilters={setFilters} 
            sorts={sorts} setSorts={setSorts}
            columns={columns} setColumns={setColumns}
            searchKey={searchKey} setSearchKey={setSearchKey}
            session={session}/>
            <PanelGroup className='fixed' direction='horizontal'>
                <Panel minSize={15} maxSize={40}  defaultSize={25}>
                    <SideNav sorts={sorts} setSorts={setSorts} filters={filters} setFilters={setFilters} viewList = {viewList} setViewList = {setViewList}/>
                </Panel>
                <PanelResizeHandle className="flex items-center justify-center border-slate-300 border ml-[5px]"/>
                <Panel>
                <div  className='h-[600px] w-full bg-slate-100 overflow-scroll relative'>
                    <Table 
                    filters={filters} setFilters={setFilters} 
                    sorts={sorts} setSorts={setSorts}
                    columns={columns} setColumns={setColumns}
                    searchKey={searchKey} setSearchKey={setSearchKey}
                    />
                </div>
                </Panel>
            </PanelGroup>
            
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
