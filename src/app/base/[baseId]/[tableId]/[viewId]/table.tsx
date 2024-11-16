'use client';

import { flexRender, getCoreRowModel, useReactTable,ColumnDef, ColumnFiltersState, SortingState, getFilteredRowModel, Cell } from "@tanstack/react-table";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { api } from "~/trpc/react";
import { FiPlus } from "react-icons/fi";
import { JsonValue } from "@prisma/client/runtime/library";
import { useDebouncedCallback } from 'use-debounce';
import { undefined } from "zod";

interface RowData {
    values: JsonValue;
    rowId: number;
}
export function Table({
    filters,
    setFilters,
    sorts,
    setSorts,
    columns,
    setColumns
}:
{
    filters:ColumnFiltersState,
    setFilters: React.Dispatch<React.SetStateAction<ColumnFiltersState>>,
    sorts:SortingState,
    setSorts: React.Dispatch<React.SetStateAction<SortingState>>,
    columns: ColumnDef<JsonValue>[],
    setColumns: React.Dispatch<React.SetStateAction<ColumnDef<JsonValue>[]>>
}
) {
    
    const ref = useRef(false)
    
    const params = useParams<{ baseId: string; tableId: string; viewId: string }>();
    
    const { data: tables, isLoading:isTableLoading } = api.table.getTableById.useQuery({ tableId: params.tableId });

    const { data: rows_data, isLoading: isRowLoading } = api.table.getRows.useQuery({ tableId: params.tableId });

    const { data: view, isLoading: isViewLoading } = api.view.getViewById.useQuery({ viewId: params.viewId });

    useEffect(()=>{
        if(isViewLoading){
            return;
        }
        ref.current = true
        const content = view?.filterBy.map((filter,index)=>{
            return {
                id:filter,
                value:view?.filterVal.at(index) 
            }
        })
        setFilters(content ?? [])
    },[view])

    useEffect(()=>{
        if(!ref.current){
            return;
        }
        const filterId: string[] = []
        const filterVal: string[] = []
        filters.forEach((filter)=>{
            if(filter.value == '' || String(filter.value) == '') return;
            filterId.push(filter.id)
            filterVal.push(String(filter.value))
        })
        updateView.mutate({viewId:params.viewId,filterBy:filterId,filterVal:filterVal,sortBy:[],sortOrder:[]})
        applyFilter(data)
    },[filters])

    useEffect(() => {
        if (tables?.columns) {
            const fields = tables.columns.map((column) => ({
                accessorKey: column,
                header: column,
            }));
            const rowId = {
                accessorKey: 'rowId',
                header: 'rowId',
            
            };
            setColumns([rowId, ...fields]); 
        }
    }, [tables]);
    

    const content = rows_data?.map((row) => { return { rowId: row.id, values: row.values }});

    const [data, setData] = useState<RowData[]>(content ?? []);

    const [displayData,setDisplayData] = useState<JsonValue[]>([]);

    const addRow = api.table.addRow.useMutation({
        onSuccess: (newRow) => {
            setData((prevData) => {
                const updatedData = [...prevData, { rowId: newRow.newRow.id, values:newRow.newRow.values }];
                return updatedData;
            });
            setDisplayData((prevData) => {
                const updatedData = [...prevData, { rowId: newRow.newRow.id, ...Object(newRow.newRow.values) }];
                return updatedData as JsonValue[];
            });
            setTimeout(() => {
                const firstInputId = `${columns.at(1)?.header?.toString()}_${newRow.newRow.id}`;
                const firstInput = document.getElementById(firstInputId) as HTMLInputElement;
                if (firstInput) {
                    firstInput.focus();
                }
            },300)
            
        },
    });

    const addColumn = api.table.addColumn.useMutation({
        onSuccess: (newTable) => {
            const newColumn = {
                accessorKey: newTable.newTable.columns.at(-1) ?? 'Column',
                header: newTable.newTable.columns.at(-1) ?? 'Column',
            };
            setColumns((prevColumns) => [...prevColumns, newColumn]);
            setData((prevData) => {
                const updatedData = prevData.map((row) => ({
                    ...Object(row) as RowData,
                    [newColumn.accessorKey]: "", 
                }));
                
                return updatedData;
            });
        },
    });


    const updateRow = api.table.editRow.useMutation({});
    const updateView = api.view.editView.useMutation({})

    const handleOnChangeUpdate = (id: number, newRow: JsonValue) => {
        updateRow.mutate({ rowId: id, row: newRow });
    };

    useEffect(() => {
        const content = rows_data?.map((row) => { return { rowId: row.id, values: row.values }});
        setData(content ?? []);
        applyFilter(content as RowData[])
    }, [rows_data]);

    const applyFilter = (data:RowData[]) =>{
        const content = data
            ?.filter((row) => {
                for (const filter of filters){
                    if (row.values == null) return false;
                    console.log(String(filter.value))
                    if(String(filter.value) === "Empty"){
                        if(!(String(row.values[filter.id as keyof object]) === "undefined" || String(row.values[filter.id as keyof object]) === "")){
                            return false
                        }
                    }
                    else if(String(filter.value) === "Not Empty"){
                        if(String(row.values[filter.id as keyof object]) === "undefined" || String(row.values[filter.id as keyof object]) === ""){
                            return false
                        }
                    }
                }
                return true
            })
            .map((row)=>{
                return {rowId:row.rowId, ...Object(row.values)} as JsonValue
            })
        console.log(content)
        setDisplayData(content ?? [] as JsonValue);
    }
    const table = useReactTable({
        data:displayData,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    const debouncedHandleChange = useDebouncedCallback((e: React.ChangeEvent<HTMLInputElement>, rowId, cell:Cell<JsonValue,unknown>) => {
        const newValue: string = e.target.value;
        
        for (const row of data){
            if(row?.rowId === rowId){
                handleOnChangeUpdate(
                    rowId as number,
                    { ...Object(row.values), [cell.column.id]: newValue } as object
                );
                break;
            }
        }
        
    }, 300);

    if(isTableLoading || isRowLoading || isViewLoading){
        return <div>Loading...</div>
    }

    return (
        <table className="w-fit overflow-auto relative">
            <thead >
                {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                        <th className="h-[30px] w-[90px] text-sm font-light text-left border"></th>
                        {headerGroup.headers.map((header) => {
                            // if (header.column.columnDef.header === 'rowId') return null;
                            return (
                                <th
                                    className="h-[30px] w-[180px] text-sm font-light text-left border"
                                    key={header.id}
                                >
                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                </th>
                            );
                        })}
                        <th onClick={() => { addColumn.mutate({ tableId: params.tableId, columnName: `Label ${columns.length + 1}`, columnType: 'String' }) }} className="h-[30px] w-[93px] text-sm font-light flex justify-center border hover:bg-slate-400 hover:cursor-pointer">
                            <div className="flex flex-col justify-center">
                                <FiPlus />
                            </div>
                        </th>
                    </tr>
                ))}
            </thead>
            <tbody>
                {table.getRowModel().rows.map((row, rowIndex) => (
                    <tr
                    onBlur={(e)=>{
                        if (e.relatedTarget && e.relatedTarget.closest('tr') === e.currentTarget) {
                            return;
                        }
                        applyFilter(data)
                    }}
                    key={row.id}>
                        <td className="bg-white border h-[30px] w-[90px]">
                            <p>{rowIndex + 1}</p>
                        </td>
                        {row.getVisibleCells().map((cell, cellIndex) => {
                            console.log(row)
                            // if (cell.column.columnDef.header === 'rowId') return null;
                            const inputId = `${cell.column.id}_${String(row.getValue('rowId'))}`;
                            return (
                                <td
                                
                                className="bg-white border h-[30px] w-[180px]" key={cell.id}>
                                    <input
                                        id={inputId}
                                        type="text"
                                        defaultValue={String(displayData[rowIndex]?.[cell.column.id as keyof object] ?? '')}
                                        onChange={(e) => 
                                        {
                                            setData((prevData) =>
                                                prevData.map((r) =>
                                                    r.rowId === row.getValue('rowId')
                                                        ? { rowId:row.getValue('rowId'), values:{...Object(r.values) as object, [cell.column.id]: e.target.value} } as RowData
                                                        : r
                                                )
                                            );
                                            debouncedHandleChange(e, row.getValue('rowId'), cell)}
                                        }
                                            
                                        onKeyDown={(e) => {
                                            if (cellIndex === row.getVisibleCells().length - 1 && e.key === 'Tab') {
                                                e.preventDefault();
                                            }
                                        }}
                                    />
                                </td>
                            );
                        })}
                    </tr>
                ))}
                <tr className="bg-white">
                    <td
                        onClick={() => {
                            addRow.mutate({ row: {}, tableId: params.tableId });
                        }}
                        className="bg-white border h-[30px] w-[90px] hover:bg-slate-400 hover:cursor-pointer"
                    >
                        <div className="flex flex-col justify-center">
                            <FiPlus />
                        </div>
                    </td>
                    {columns.map((col,index) => {
                        // if (col.header === 'rowId') return null;
                        return (
                            <td className="bg-white border h-[30px] w-[180px]" key={index}></td>
                        );
                    })}
                </tr>
            </tbody>
        </table>
    );
}
