
'use client';

import { flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "~/trpc/react";
import { FiPlus } from "react-icons/fi";
import { JsonValue } from "@prisma/client/runtime/library";
import { useDebouncedCallback } from 'use-debounce';

export function Table(){
    

    const params = useParams<{ baseId: string; tableId: string, viewId:string }>()

    const { data: tables, isLoading } = api.table.getTableById.useQuery({tableId:params.tableId})
    
    const columns = tables?.columns.map((column) => ({
        accessorKey: column, 
        header: column,       
        cell: (props:any) => <p>{props.getValue()}</p>, 
    })) || [];

    columns.push({
        accessorKey: 'rowId', 
        header: 'rowId',       
        cell: (props:any) => <p>{props.getValue()}</p>, 
    })
    
    const { data: rows_data, isLoading:isRowLoading } = api.table.getRows.useQuery({tableId:params.tableId})

    const content = rows_data?.map((row)=>{
        return { rowId: row.id, ...Object(row.values) };

    })

    const [data,setData] = useState<JsonValue[]>(content ?? []);

    const addRow = api.table.addRow.useMutation({
        onSuccess: (newRow) => {
            setData((prevData) => [...prevData, newRow.newRow.values]);
        },
    })

    const updateRow = api.table.editRow.useMutation({

    })

    const handleOnChangeUpdate = useDebouncedCallback((id:number,newRow) =>{
        console.log(newRow)
        // updateRow.mutate({rowId:id,row:newRow})
    },300)

    useEffect(() => {
        if (rows_data) {
          const content = rows_data.map((row) => {return { rowId: row.id, ...Object(row.values) }});
          setData(content);
        }
      }, [rows_data]); 

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel:getCoreRowModel(),
        meta:{
            updateData: (rowIdx: number,columnId: any,value: any) => setData(
                prev => prev.map((row,index)=> index == rowIdx ? {...Object(prev[rowIdx]),[columnId]:value} : row)
            )
        }
    });

    return (
        <table>
          <thead >
            {table.getHeaderGroups().map((headerGroup) => (
              <tr  key={headerGroup.id}>
                <th className="h-[30px] w-[90px] text-sm font-light text-left border" >
                    
                </th>
                {headerGroup.headers.map((header) => {
                  if (header.column.columnDef.header == 'rowId') return null;
                  return (
                        <th className="h-[30px] w-[180px] text-sm font-light text-left border" key={header.id}>
                            {flexRender(header.column.columnDef.header, header.getContext())}
                        </th>
                  )
                })}
                <th className="h-[30px] w-[93px] text-sm font-light flex justify-center border hover:bg-slate-400 hover:cursor-pointer">
                    <div className="flex flex-col justify-center">
                        <FiPlus/>
                    </div>
                </th>
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row,index) => (
                
              <tr key={row.id}>
                <td className="bg-white border h-[30px] w-[90px]">
                    <p>{index+1}</p>
                </td>
                {row.getVisibleCells().map((cell,index) => {
                
                if (cell.column.columnDef.header === 'rowId') return null;
                return(
                  <td className="bg-white border h-[30px] w-[180px]" key={cell.id}>
                    <input
                    // onChange={(e)=>{
                    //     table.options.meta?.updateData(index,)
                    //     handleOnChangeUpdate(row.getValue('rowId'),row.getAllCells)}} 
                    onKeyDown={index == row.getVisibleCells().length - 1 ? (e)=>{if(e.key == 'Tab'){e.preventDefault()}}: ()=>{}}
                    defaultValue={cell.getValue() ?? ''}
                    >
                    </input>
                  </td>
                )})}
              </tr>
            ))}
            <tr className="bg-white">
                <td onClick={()=>{
                    addRow.mutate({row:{},tableId:params.tableId})
                    }} className="bg-white border h-[30px] w-[90px] hover:bg-slate-400 hover:cursor-pointer">
                    <div className="flex flex-col justify-center">
                        <FiPlus/>
                    </div>
                </td>
                {columns.map((col) => {
                    if (col.accessorKey == 'rowId') return null
                    return(
                    
                    <td className="bg-white border h-[30px] w-[180px]" key={col.accessorKey}>
                    </td>
                    )}
                )}
            </tr>
          </tbody>
        </table>
      );
}