'use client';

import { flexRender, getCoreRowModel, useReactTable, ColumnDef, ColumnFiltersState, SortingState, getFilteredRowModel, Cell } from "@tanstack/react-table";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { api } from "~/trpc/react";
import { FiPlus } from "react-icons/fi";
import { JsonValue } from "@prisma/client/runtime/library";
import { useDebouncedCallback } from 'use-debounce';

interface RowData {
    values: JsonValue;
    rowId: number;
}

interface TableData {
    raw: RowData[];
    filtered: JsonValue[];
}

export function Table({
    filters,
    setFilters,
    sorts,
    setSorts,
    columns,
    setColumns
}: {
    filters: ColumnFiltersState,
    setFilters: React.Dispatch<React.SetStateAction<ColumnFiltersState>>,
    sorts: SortingState,
    setSorts: React.Dispatch<React.SetStateAction<SortingState>>,
    columns: ColumnDef<JsonValue>[],
    setColumns: React.Dispatch<React.SetStateAction<ColumnDef<JsonValue>[]>>
}) {
    const ref = useRef(false);
    
    const params = useParams<{ baseId: string; tableId: string; viewId: string }>();
    const { data: tables, isLoading: isTableLoading } = api.table.getTableById.useQuery({ tableId: params.tableId });
    const { data: rows_data, isLoading: isRowLoading } = api.table.getRows.useQuery({ tableId: params.tableId });
    const { data: view, isLoading: isViewLoading } = api.view.getViewById.useQuery({ viewId: params.viewId },{suspense:true});

    
    const [tableData, setTableData] = useState<TableData>({ raw: [], filtered: [] });

    const applyFilter = (data: RowData[]): JsonValue[] => {
        return data
            .filter((row) => {
                for (const filter of filters) {
                    if (row.values == null) return false;
                    
                    if (String(filter.value) === "Empty") {
                        if (!(String(row.values[filter.id as keyof object]) === "undefined" || 
                            String(row.values[filter.id as keyof object]) === "")) {
                            return false;
                        }
                    }
                    else if (String(filter.value) === "Not Empty") {
                        if (String(row.values[filter.id as keyof object]) === "undefined" || 
                            String(row.values[filter.id as keyof object]) === "") {
                            return false;
                        }
                    }
                }
                return true;
            })
            .sort((x,y)=>{
                if(x.values == null || y.values == null) return 0;
                for (const sort of sorts){
                    if(sort.id === "") return 0;
                    if(String(x.values[sort.id as keyof object]) === "undefined" || String(x.values[sort.id as keyof object]) === "") return 1
                    if(String(y.values[sort.id as keyof object]) === "undefined" || String(y.values[sort.id as keyof object]) === "") return -1
                    if(x.values[sort.id as keyof object] > y.values[sort.id as keyof object]){
                        return sort.desc ? -1 : 1
                    }
                    if(x.values[sort.id as keyof object] < y.values[sort.id as keyof object]){
                        return sort.desc ? 1 : -1
                    }
                }
                return 0;
            })
            .map((row) => ({ rowId: row.rowId, ...Object(row.values) }) as JsonValue)
            
            ;
    };

    const updateTableData = (newRawData: RowData[]) => {
        setTableData({
            raw: newRawData,
            filtered: applyFilter(newRawData)
        });
    };
    
    useEffect(() => {
        if (isViewLoading){
            ref.current = false
            return;
        } 
        ref.current = true;
        const content = view?.filterBy.map((filter, index) => ({
            id: filter,
            value: view?.filterVal.at(index)
        }));
        const content2 = view?.sortBy.map((sort,index)=>({
            id: sort,
            desc: view?.sortOrder.at(index) === "Descending" ? true : false
        }));
        console.log("SHIT")
        setFilters(content ?? []);
        setSorts(content2 ?? [])
    }, [view,params.viewId]);

    // useEffect(() => {
    //     if(!ref.current) return;
    //     const filterId: string[] = [];
    //     const filterVal: string[] = [];
    //     const sortId: string[] = [];
    //     const sortOrder: string[] = [];
        
    //     filters.forEach((filter) => {
    //         if (filter.value == '' || String(filter.value) == '') return;
    //         filterId.push(filter.id);
    //         filterVal.push(String(filter.value));
    //     });
    //     sorts.forEach((sort) => {
    //         if (sort.id === '') return;
    //         sortId.push(sort.id);
    //         sortOrder.push(sort.desc ? "Descending" : "Ascending");
    //     });
    //     updateView.mutate({
    //         viewId: params.viewId,
    //         filterBy: filterId,
    //         filterVal: filterVal,
    //         sortBy: sortId,
    //         sortOrder: sortOrder
    //     });
    //     updateTableData(tableData.raw);
    // }, [filters,sorts,params.viewId]);

    useEffect(() => {
        updateTableData(tableData.raw);
    }, [filters,sorts]);

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

    
    useEffect(() => {
        if (rows_data) {
            const content = rows_data.map((row) => ({ 
                rowId: row.id, 
                values: row.values 
            }));
            updateTableData(content);
        }
    }, [rows_data]);

    const addRow = api.table.addRow.useMutation({
        onSuccess: (newRow) => {
            const updatedRawData = [...tableData.raw, { 
                rowId: newRow.newRow.id, 
                values: newRow.newRow.values 
            }];
            updateTableData(updatedRawData);
            
            setTimeout(() => {
                const firstInputId = `${columns.at(1)?.header?.toString()}_${newRow.newRow.id}`;
                const firstInput = document.getElementById(firstInputId) as HTMLInputElement;
                if (firstInput) {
                    firstInput.focus();
                }
            }, 300);
        },
    });

    const addColumn = api.table.addColumn.useMutation({
        onSuccess: (newTable) => {
            const newColumn = {
                accessorKey: newTable.newTable.columns.at(-1) ?? 'Column',
                header: newTable.newTable.columns.at(-1) ?? 'Column',
            };
            setColumns((prevColumns) => [...prevColumns, newColumn]);
            
            const updatedRawData = tableData.raw.map((row) => ({
                ...row,
                values: { ...Object(row.values) as object, [newColumn.accessorKey]: "" }
            }));
            updateTableData(updatedRawData);
        },
    });

    const updateRow = api.table.editRow.useMutation({});
    const updateView = api.view.editView.useMutation({});

    const debouncedServerUpdate = useDebouncedCallback((rowId: number, newRow: JsonValue) => {
        updateRow.mutate({ rowId, row: newRow });
    }, 300);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, rowId: number, columnId: string) => {
        const newValue = e.target.value;
        
        const updatedRawData = tableData.raw.map((row) => 
            row.rowId === rowId
                ? { 
                    ...row, 
                    values: { ...Object(row.values) as object, [columnId]: newValue } 
                }
                : row
        );
        updateTableData(updatedRawData);

        
        const updatedRow = updatedRawData.find(row => row.rowId === rowId);
        if (updatedRow) {
            debouncedServerUpdate(rowId, updatedRow.values);
        }
    };

    const table = useReactTable({
        data: tableData.filtered,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    if (isTableLoading || isRowLoading || isViewLoading) {
        return <div>Loading...</div>;
    }

    return (
        <table className="w-fit overflow-auto relative">
            <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                        <th className="h-[30px] w-[90px] text-sm font-light text-left border"></th>
                        {headerGroup.headers.map((header) => {
                            if (header.column.columnDef.header === 'rowId') return null;
                            return (
                                <th
                                    className="h-[30px] w-[180px] text-sm font-light text-left border"
                                    key={header.id}
                                >
                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                </th>
                            )
                        })}
                        <th 
                            onClick={() => {
                                addColumn.mutate({ 
                                    tableId: params.tableId, 
                                    columnName: `Label ${columns.length + 1}`, 
                                    columnType: 'String' 
                                });
                            }} 
                            className="h-[30px] w-[93px] text-sm font-light flex justify-center border hover:bg-slate-400 hover:cursor-pointer"
                        >
                            <div className="flex flex-col justify-center">
                                <FiPlus />
                            </div>
                        </th>
                    </tr>
                ))}
            </thead>
            <tbody>
                {table.getRowModel().rows.map((row, rowIndex) => (
                    <tr key={row.id}>
                        <td className="bg-white border h-[30px] w-[90px]">
                            <p>{rowIndex + 1}</p>
                        </td>
                        {row.getVisibleCells().map((cell, cellIndex) => {
                            if (cell.column.columnDef.header === 'rowId') return null;
                            const inputId = `${cell.column.id}_${String(row.getValue('rowId'))}`;
                            return (
                                <td className="bg-white border h-[30px] w-[180px]" key={cell.id}>
                                    <input
                                        id={inputId}
                                        type="text"
                                        value={String(tableData.filtered[rowIndex]?.[cell.column.id as keyof object] ?? '')}
                                        onChange={(e) => handleInputChange(e, row.getValue('rowId'), cell.column.id)}
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
                    {columns.map((col, index) => {
                        if (col.header === 'rowId') return null;
                        return (
                            <td className="bg-white border h-[30px] w-[180px]" key={index}></td>
                        )
                    })}
                </tr>
            </tbody>
        </table>
    );
}