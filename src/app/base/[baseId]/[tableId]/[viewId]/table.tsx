'use client';

import { flexRender, getCoreRowModel, useReactTable,ColumnDef } from "@tanstack/react-table";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "~/trpc/react";
import { FiPlus } from "react-icons/fi";
import { JsonValue } from "@prisma/client/runtime/library";
import { useDebouncedCallback } from 'use-debounce';

export function Table() {
    const params = useParams<{ baseId: string; tableId: string; viewId: string }>();
    
    const { data: tables, isLoading } = api.table.getTableById.useQuery({ tableId: params.tableId });

    const [columns, setColumns] = useState<ColumnDef<JsonValue>[]>([]);
    
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

    
    const { data: rows_data } = api.table.getRows.useQuery({ tableId: params.tableId });
    
    const content = rows_data?.map((row) => { return { rowId: row.id, ...Object(row.values) } as object});
    
    const [data, setData] = useState<JsonValue[]>(content ?? []);

    const addRow = api.table.addRow.useMutation({
        onSuccess: (newRow) => {
            setData((prevData) => [...prevData, { rowId: newRow.newRow.id, ...Object(newRow.newRow.values) } as object]);
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
                    ...Object(row) as object,
                    [newColumn.accessorKey]: "", 
                }));
                
                return updatedData;
            });
        },
    });

    const updateRow = api.table.editRow.useMutation({});

    const handleOnChangeUpdate = useDebouncedCallback((id: number, newRow: JsonValue) => {
        updateRow.mutate({ rowId: id, row: newRow });
    }, 300);

    useEffect(() => {
        const content = rows_data?.map((row) => { return { rowId: row.id, ...Object(row.values) } as object});
        setData(content ?? []);
    }, [rows_data]);

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <table className="w-fit overflow-auto relative">
            <thead >
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
            <tbody >
                {table.getRowModel().rows.map((row, rowIndex) => (
                    <tr key={row.id}>
                        <td className="bg-white border h-[30px] w-[90px]">
                            <p>{rowIndex + 1}</p>
                        </td>
                        {row.getVisibleCells().map((cell, cellIndex) => {
                            if (cell.column.columnDef.header === 'rowId') return null;
                            return (
                                <td className="bg-white border h-[30px] w-[180px]" key={cell.id}>
                                    <input
                                        type="text"
                                        value={String(data[rowIndex]?.[cell.column.id as keyof object] ?? '')}
                                        onChange={(e) => {
                                            const newValue = e.target.value;
                                            setData((prevData) =>
                                                prevData.map((row, i) =>
                                                    i === rowIndex
                                                        ? { ...Object(row), [cell.column.id]: newValue } as object
                                                        : row
                                                )
                                            );
                                            handleOnChangeUpdate(
                                                row.getValue('rowId'),
                                                { ...Object(data[rowIndex]), [cell.column.id]: newValue }  as object
                                            );
                                        }}
                                        onKeyDown={
                                            cellIndex === row.getVisibleCells().length - 1
                                                ? (e) => {
                                                      if (e.key === 'Tab') e.preventDefault();
                                                  }
                                                : undefined
                                        }
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
                        if (col.header === 'rowId') return null;
                        return (
                            <td className="bg-white border h-[30px] w-[180px]" key={index}></td>
                        );
                    })}
                </tr>
            </tbody>
        </table>
    );
}
