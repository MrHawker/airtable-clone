"use client";


import { api } from "~/trpc/react";

import { useState,useEffect } from "react";
import { Session } from "next-auth";

import { RiArrowDownSLine } from "react-icons/ri";
import { VscBell } from "react-icons/vsc";
import { GoPeople } from "react-icons/go";
import { AiOutlineQuestionCircle } from "react-icons/ai";
import { LuHistory } from "react-icons/lu";
import { TableList } from "./tables_list";
import { GoPlus } from "react-icons/go";
import { AiOutlineMenu } from "react-icons/ai";
import { FaTable } from "react-icons/fa6";
import { BsEyeSlash } from "react-icons/bs";
import { IoFilterOutline } from "react-icons/io5";
import { FaRegObjectUngroup } from "react-icons/fa6";
import { BiSortAlt2 } from "react-icons/bi";
import { IoColorFillOutline } from "react-icons/io5";
import { CiLineHeight } from "react-icons/ci";
import { CiShare1 } from "react-icons/ci";
import { PiMagnifyingGlass } from "react-icons/pi";
import { useParams, useRouter } from "next/navigation";
import { ColumnDef, ColumnFiltersState, SortingState } from "@tanstack/react-table";
import { JsonValue } from "@prisma/client/runtime/library";
import { FaRegTrashAlt } from "react-icons/fa";

interface RowData {
    values: JsonValue;
    rowId: number;
}

export function HeadNav({
    open,
    setOpen,
    filters,
    setFilters,
    sorts,
    setSorts,
    columns,
    setColumns,
    session
    }:
    {
    open:boolean,
    setOpen:React.Dispatch<React.SetStateAction<boolean>>,
    filters:ColumnFiltersState,
    setFilters: React.Dispatch<React.SetStateAction<ColumnFiltersState>>,
    sorts:SortingState,
    setSorts: React.Dispatch<React.SetStateAction<SortingState>>,
    columns: ColumnDef<JsonValue>[],
    setColumns: React.Dispatch<React.SetStateAction<ColumnDef<JsonValue>[]>>
    session:Session|null}) 
  {

  const [isDesktop,setIsDesktop] = useState(false);
  const [filterbutton,setFilterButton] = useState(false);
  const [sortbutton,setSortButton] = useState(false)
  
  useEffect(() => {
    
    const isDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    isDesktop();
    
    window.addEventListener("resize", isDesktop);

    return () => window.removeEventListener("resize", isDesktop);
  }, []);

  const params = useParams<{ baseId: string; tableId: string, viewId:string }>()
  const router = useRouter()
  const utils = api.useUtils();
  const createTable = api.table.create.useMutation({
        onSuccess: async (data) => {
        await utils.table.invalidate();
        
        router.push(`/base/${params.baseId}/${data.newTable.id}/${data.newView.id}`)
        },
  });
  
  const handleCreateTable = () =>{
    createTable.mutate({
        baseId:params.baseId,
        name:'default'  
    });
  }

  const handleDeleteFilter = (index: number) => {
    setFilters((prevFilters) => {
      const updatedFilters = prevFilters.filter((fil, i) => i !== index);
      return updatedFilters;
    });
  };

  const handleSetFilter = (index:number,field:string,value:string) => {
        
    setFilters(prevFilters => {
        const newFilters = [...prevFilters];
        newFilters[index] = {
            ...(newFilters[index] ?? {}),
            id: newFilters[index]?.id ?? "", 
            value: newFilters[index]?.value ?? "", 
            [field]: value ?? "",
        };
        return newFilters;
    });
    
  };
  const handleSetSort = (index:number,field:string,value:string) =>{
    setSorts(prevSorts => {
        const newSorts = [...prevSorts];
        if(field === "id"){
            newSorts[index] = {
                ...(newSorts[index] ?? {}),
                id: value, 
                desc: newSorts[index]?.desc ?? false, 
            };
        }else if(field === "order"){
            newSorts[index] = {
                ...(newSorts[index] ?? {}),
                id: newSorts[index]?.id ?? "", 
                desc: value === "Descending" ? true : false, 
            };
        }
        
        return newSorts;
    });
  }
  const handleDeleteSort = (index:number) =>{
    setSorts((prevSorts) => {
        const newSorts = prevSorts.filter((fil, i) => i !== index);
        return newSorts;
      });
  }

  return (
    <header onClick={()=>{setFilterButton(false);setSortButton(false)}} className="sticky top-0  border-b-2 bg-card-brown z-30  text-white min-w-full">
        <nav className="flex justify-between items-center py-[12px] overflow-hidden px-2">
            <div className="flex items-center px-2 ">
                <button className="flex ml-2 lg:ml-0 mr-2 ">
                    <svg className="mr-[16px] mt-[1px]" xmlns="http://www.w3.org/2000/svg" width="24" height="24"  viewBox="0 0 200 170"><path fill="#ffffff" d="M90.039 12.368 24.079 39.66c-3.667 1.519-3.63 6.729.062 8.192l66.235 26.266a24.58 24.58 0 0 0 18.12 0l66.236-26.266c3.69-1.463 3.729-6.673.06-8.191l-65.958-27.293a24.58 24.58 0 0 0-18.795 0"></path><path fill="#ffffff" d="M105.312 88.46v65.617c0 3.12 3.147 5.258 6.048 4.108l73.806-28.648a4.42 4.42 0 0 0 2.79-4.108V59.813c0-3.121-3.147-5.258-6.048-4.108l-73.806 28.648a4.42 4.42 0 0 0-2.79 4.108"></path><path fill="#ffffff" d="m88.078 91.846-21.904 10.576-2.224 1.075-46.238 22.155c-2.93 1.414-6.672-.722-6.672-3.978V60.088c0-1.178.604-2.195 1.414-2.96a5 5 0 0 1 1.12-.84c1.104-.663 2.68-.84 4.02-.31L87.71 83.76c3.564 1.414 3.844 6.408.368 8.087"></path></svg>
                    {isDesktop && 
                    <span className="text-lg font-bold mr-1 min-w-0 truncate flex-shrink overflow-hidden whitespace-nowrap">
                        Untitled Base
                    </span>
                    }
                    
                    <RiArrowDownSLine className="mr-[4px] mt-[5px] " />
                </button>
                <ul className="flex items-center font-light text-xs">
                    <li className="mr-[8px]">
                        <div className="text-center bg-data-brown rounded-2xl px-[14px] py-[7px] shadow-inner-strong">
                            <p>Data</p>
                        </div>
                    </li>
                    <li className="mr-[8px] hover:cursor-pointer hover:bg-data-brown rounded-2xl transition ease-in-out duration-200">
                        <div className="text-center rounded-2xl px-[14px] py-[7px] ">
                            <p>Automations</p>
                        </div>
                    </li>
                    <li className="mr-[8px] hover:cursor-pointer hover:bg-data-brown rounded-2xl transition ease-in-out duration-200">
                        <div className="text-center rounded-2xl px-[14px] py-[7px] ">
                            <p>Interfaces</p>
                        </div>
                    </li>
                    <div className="border-[1px]" style={{height: '20px' }}></div>
                    <li className="mr-[8px] pl-[12px] ">
                        <div className="text-center  px-[14px] py-[7px] hover:cursor-pointer hover:bg-data-brown rounded-2xl transition ease-in-out duration-200">
                            <p>Forms</p>
                        </div>
                    </li>
                </ul>
                
            </div>
                <ul className="flex items-center font-light text-xs">
                        <li className=" hover:cursor-pointer hover:bg-data-brown rounded-2xl transition ease-in-out duration-200">
                            <div className="text-center rounded-2xl px-[14px] py-[7px]">
                                <LuHistory style={{fontSize:'16px'}}/>
                            </div>
                        </li>
                        <li className="mr-[8px] hover:cursor-pointer hover:bg-data-brown rounded-2xl transition ease-in-out duration-200">
                            <div className="text-center rounded-2xl px-[14px] py-[7px] flex">
                                <AiOutlineQuestionCircle style={{fontSize:'16px'}}/>
                                <p className="ml-[4px]">Help</p>
                            </div>
                        </li>
                        
                        <li className="mr-[8px] bg-slate-50 hover:cursor-pointer hover:bg-white rounded-2xl transition ease-in-out duration-200 py-[6px] px-[12px] mx-[8px]">
                            <div className="flex text-center">
                                <GoPeople style={{fontSize:'16px'}} className="text-card-brown mr-1"/>
                                <span className="text-card-brown mt-[1px]">Share</span>
                            </div>
                            
                        </li>
                        <li className="mx-[8px] bg-slate-50 hover:cursor-pointer hover:bg-white rounded-full transition ease-in-out duration-200 pl-[7px] p-[6px]">
                            <VscBell style={{fontSize:'16px'}} className="text-card-brown "/>
                        </li>
                        
                        <li className="mr-[8px] pl-[12px] ">
                            {session?.user.image && (
                            <img
                            onClick={(e)=>{e.stopPropagation();setOpen(true)}}
                            src={session.user.image}
                            alt="User profile"
                            className="w-[25px] h-[25px] rounded-full shadow-md hover:cursor-pointer border border-white"
                            />
                            )}
                        </li>
                    </ul>
                
        </nav>
        <div className="flex justify-between overflow-hidden">
            <div className="flex bg-lower-brown flex-grow pl-[12px] rounded-tr mr-2">
                <TableList/>
                <div onClick={()=>{handleCreateTable()}} className="px-[12px] flex flex-col justify-center hover:cursor-pointer">
                    <RiArrowDownSLine className="text-slate-200 hover:text-white" />
                </div>
                <div className="my-[10px] border-slate-300 opacity-50  border-[1px]"></div>
                <div className="flex px-[12px] opacity-80 hover:cursor-pointer hover:opacity-100">
                    <div className="flex flex-col justify-center">
                        <GoPlus className="text-slate-200" style={{fontSize:'22px'}}/>
                    </div>
                    {isDesktop &&
                    <div className="flex flex-col justify-center ml-[8px]">
                        <span className="text-xs text-slate-50">Add or import</span>
                    </div>
                    }
                    
                </div>
            </div>
            <div className="flex bg-lower-brown rounded-tr-sm  text-slate-200 text-xs rounded-tl">
                <div className="flex px-[12px] flex-col justify-center hover:cursor-pointer hover:text-white">
                    Extensions
                </div>
                <div className="px-[12px] flex hover:cursor-pointer hover:text-white">
                    <div className="flex flex-col justify-center pr-[4px]">
                        <span>Tools</span>
                    </div>
                    
                    <div className="flex flex-col justify-center">
                        <RiArrowDownSLine style={{fontSize:'18px'}}/>
                    </div>
                    
                </div>
            </div>
        </div>
        <div className="flex justify-between overflow-x-clip bg-white py-[6px] " >
            <div className="pl-[12px] flex">
                <button className="flex bg-slate-signin mr-[8px] px-[8px] py-[7px] rounded border border-white hover:border-slate-200">
                    <div className="flex flex-col justify-center text-black h-full"><AiOutlineMenu style={{fontSize:'14px'}}/></div>
                    <div className="flex flex-col text-black ml-[4px] text-xs font-medium">Views </div>
                </button>
                <div className="my-[6px] border-black opacity-50  border-[1px] ml-[4px] mr-[12px]"></div>
                <button className="px-[8px] flex hover:bg-slate-signin hover:cursor-pointer rounded transition duration-200">
                    <div className="flex flex-col justify-center h-full"><FaTable className="text-blue-500"  /></div>
                    <div className="flex flex-col justify-center ml-[8px] text-xs font-medium h-full text-black">Grid view</div>
                    <div className="flex flex-col justify-center h-full mx-[8px] text-black"><GoPeople/></div>
                    <div className="flex flex-col justify-center h-full text-black"><RiArrowDownSLine /></div>
                </button>
                <div className="px-[8px] f-full flex text-base space-x-[7px]">
                    <div className="flex px-[8px] py-[4px] text-black  h-full hover:bg-slate-signin hover:cursor-pointer rounded transition duration-200">
                        <div className="flex flex-col justify-center h-full"><BsEyeSlash /></div>
                        {isDesktop && <div className="flex flex-col justify-center h-full text-xs ml-[4px]">Hide fields</div>}
                    </div>
                    <div onClick={(e)=>{e.stopPropagation();setSortButton(false);setFilterButton(true)}} className="relative">
                        <div  className="flex px-[8px] py-[4px] text-black relative h-full  rounded transition duration-200 hover:bg-slate-signin hover:cursor-pointer">
                            <div className="flex flex-col justify-center h-full"><IoFilterOutline/></div> 
                            {isDesktop && <div className="flex flex-col justify-center h-full text-xs ml-[4px] ">Filter</div>}
                        </div>
                        {
                            filterbutton && 
                            <div className="absolute top-[30px] bg-white border  rounded shadow-xl">
                            {
                                filters.length == 0 ?
                                <div className="px-[16px] pt-[16px] w-[296px] text-xs text-slate-400 ">
                                No filter conditions are applied
                                </div>
                                :
                                <div>
                                    <div className="px-[16px] pt-[16px] text-xs text-slate-400 ">
                                        In this view, show records
                                        
                                    </div>
                                    <div className="pt-[12px] px-[16px] space-y-3">
                                        {
                                            filters?.map((filter,index)=>{
                                                
                                                return <div key={index} className="flex text-black text-xs">
                                                    <div className="px-[8px] ">
                                                        {
                                                            index == 0 ?
                                                            <span className="px-[8px] text-center">Where</span>
                                                            :
                                                            <span className="px-[8px] text-center mr-[14px]">And</span>
                                                        }
                                                        
                                                    </div>
                                                    <div id={`FilterDiv_${index}`}  className="flex">
                                                        <select onChange={(e)=>handleSetFilter(index,"id",e.target.value)} value={String(filter.id) || "default"} className="border mr-2">
                                                            <option value="default" disabled>
                                                            Choose a column
                                                            </option>
                                                            {
                                                                columns?.map((col,index)=>{
                                                                    if (col.header?.toString() === 'rowId') {
                                                                        return null; 
                                                                    }
                                                                    return <option key={index} >
                                                                        {col.header?.toString()}
                                                                    </option>
                                                                })
                                                            }
                                                            
                                                        </select>
                                                        <select onChange={(e)=>handleSetFilter(index,"value",e.target.value)} value = {String(filter.value) || "default"} className="border">
                                                            <option value="default" disabled>
                                                            Choose a kind
                                                            </option>
                                                            <option value="Empty">Empty</option>
                                                            <option value="Not Empty">Not Empty</option>
                                                        </select>
                                                    </div>
                                                    <div onClick={()=>handleDeleteFilter(index)} className="px-2 py-1 hover:bg-red-500 hover:cursor-pointer ml-3 transition ease-in-out duration-200">
                                                    <FaRegTrashAlt className=" text-md "/>
                                                    </div>
                                                    
                                                </div>
                                            })
                                        }
                                    </div>
                                </div>
                                
                            }
                            
                            <div className="p-[16px] flex text-slate-500 ">
                                <div onClick={()=>{setFilters((prev) => [...prev, {id:'',value:''}]);}} className="flex mr-[16px] hover:cursor-pointer hover:text-black">
                                    <GoPlus/>
                                    <span className="font-semibold text-xs">
                                        Add condition
                                    </span>
                                </div>
                            </div>
                        </div>
                        }
                        
                    </div>
                    <div className="flex px-[8px] py-[4px] text-black  h-full hover:bg-slate-signin hover:cursor-pointer rounded transition duration-200">
                        <div className="flex flex-col justify-center h-full"><FaRegObjectUngroup/></div>
                        {isDesktop && <div className="flex flex-col justify-center h-full text-xs ml-[4px]">Group</div>}
                    </div>
                    <div onClick={(e)=>{e.stopPropagation();setFilterButton(false);setSortButton(true)}} className="relative">
                        <div className="flex px-[8px] py-[4px] text-black  h-full hover:bg-slate-signin hover:cursor-pointer rounded transition duration-200">
                            <div className="flex flex-col justify-center h-full"><BiSortAlt2/></div>
                            {isDesktop && <div className="flex flex-col justify-center h-full text-xs ml-[4px]">Sort</div>}
                        </div>
                        {
                            sortbutton && 
                            <div className="absolute top-[30px] bg-white border  rounded shadow-xl">
                            {
                                <div>
                                    <div className="px-[16px] pt-[16px] w-[296px] text-xs text-slate-400 ">
                                        Sort by
                                    </div>
                                    <div className="pt-[12px] px-[16px] space-y-3">
                                        {
                                            sorts?.map((sort,index)=>{
                                                
                                                return <div key={index} className="flex text-black text-xs">

                                                    <div id={`SortDiv_${index}`}  className="flex">
                                                        <select onChange={(e)=>handleSetSort(index,"id",e.target.value)} value={String(sort.id) || ""} className="border mr-2">
                                                            <option value="" disabled>
                                                            Choose a column
                                                            </option>
                                                            {
                                                                columns?.map((col,index)=>{
                                                                    if (col.header?.toString() === 'rowId') {
                                                                        return null; 
                                                                    }
                                                                    return <option key={index} >
                                                                        {col.header?.toString()}
                                                                    </option>
                                                                })
                                                            }
                                                            
                                                        </select>
                                                        <select onChange={(e)=>handleSetSort(index,"order",e.target.value)} value = {sort.desc ? "Descending":"Ascending"} className="border">
                                                            <option value="Ascending">Ascending</option>
                                                            <option value="Descending">Descending</option>
                                                        </select>
                                                    </div>
                                                    <div onClick={()=>handleDeleteSort(index)} className="px-2 py-1 hover:bg-red-500 hover:cursor-pointer ml-3 transition ease-in-out duration-200">
                                                    <FaRegTrashAlt className=" text-md "/>
                                                    </div>
                                                    
                                                </div>
                                            })
                                        }
                                    </div>
                                </div>
                                
                            }
                            <div className="p-[16px] flex text-slate-500 ">
                                <div onClick={()=>{setSorts((prev) => [...prev, {id:'',desc:false}]);}} className="flex mr-[16px] hover:cursor-pointer hover:text-black">
                                    <GoPlus/>
                                    <span className="font-semibold text-xs">
                                        Add sort
                                    </span>
                                </div>
                            </div>
                        </div>
                        }
                    </div>
                    
                    <div className="flex px-[8px] py-[4px] text-black  h-full hover:bg-slate-signin hover:cursor-pointer rounded transition duration-200">
                        <div className="flex flex-col justify-center h-full"><IoColorFillOutline/></div>
                        {isDesktop && <div className="flex flex-col justify-center h-full text-xs ml-[4px]">Color</div>}
                    </div>
                    <div className="flex px-[8px] py-[4px] text-black  h-full hover:bg-slate-signin hover:cursor-pointer rounded transition duration-200">
                        <div className="flex flex-col justify-center h-full"><CiLineHeight/></div>
                        
                    </div>
                    <div className="flex px-[8px] py-[4px] text-black  h-full hover:bg-slate-signin hover:cursor-pointer rounded transition duration-200">
                        <div className="flex flex-col justify-center h-full"><CiShare1/></div>
                        {isDesktop && <div className="flex flex-col justify-center h-full text-xs ml-[4px]">Share and sync</div>}
                    </div>
                </div>
            </div>
            <div className="flex flex-col justify-center text-black pr-[16px] opacity-70 hover:opacity-100 hover:cursor-pointer">
                <PiMagnifyingGlass/>
            </div>
            
        </div>
    </header>
    
  );
}
