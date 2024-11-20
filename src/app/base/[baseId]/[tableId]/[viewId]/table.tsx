'use client';

import { flexRender, getCoreRowModel, useReactTable, ColumnDef, ColumnFiltersState, SortingState, getFilteredRowModel, Cell } from "@tanstack/react-table";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { api } from "~/trpc/react";
import { FiPlus } from "react-icons/fi";
import { JsonValue } from "@prisma/client/runtime/library";
import { useDebouncedCallback } from 'use-debounce';
import { useVirtualizer } from '@tanstack/react-virtual'
import { applyFilter } from "~/server/api/routers/lib";
interface TableRow {
    rowId: string |number;  
    [key: string]: JsonValue;
}

export function Table({
    filters,
    setFilters,
    sorts,
    setSorts,
    searchKey,
    setSearchKey,
    columns,
    setColumns
}: {
    filters: ColumnFiltersState,
    setFilters: React.Dispatch<React.SetStateAction<ColumnFiltersState>>,
    sorts: SortingState,
    setSorts: React.Dispatch<React.SetStateAction<SortingState>>,
    searchKey:string,
    setSearchKey: React.Dispatch<React.SetStateAction<string>>,
    columns: ColumnDef<JsonValue>[],
    setColumns: React.Dispatch<React.SetStateAction<ColumnDef<JsonValue>[]>>
}) {
    const tableRef = useRef<HTMLDivElement>(null)
    const previousFlatData = useRef<JsonValue[]>([]);
    const params = useParams<{ baseId: string; tableId: string; viewId: string }>();

    const { data: tables, isLoading: isTableLoading } = api.table.getTableById.useQuery({ tableId: params.tableId },
    );

    const { data: view, isLoading: isViewLoading } = api.view.getViewById.useQuery({ viewId: params.viewId }
    );
    
    const utils = api.useUtils()
    const [tableData, setTableData] = useState<JsonValue[]>([]);
    const [trueFilters,setTrueFilters] = useState<ColumnFiltersState>([])
    const [trueSorts,setTrueSorts] = useState<SortingState>([])
    const { data: rows_data, isLoading: isRowLoading,fetchNextPage,isFetching } = api.table.getRows.useInfiniteQuery(    
        { 
            tableId: params.tableId,sorts:trueSorts,filters:trueFilters,
            limit:200
        },
            {
                getNextPageParam: (lastPage) => lastPage.nextCursor,
            }
        );
    
    useEffect(() => {
        const content = view?.filterBy.map((filter, index) => ({
            id: filter,
            value: view?.filterVal.at(index)
        }));
        const content2 = view?.sortBy.map((sort,index)=>({
            id: sort,
            desc: view?.sortOrder.at(index) === "Descending" ? true : false
        }));
        setFilters(content ?? []);
        setSorts(content2 ?? [])
    }, [view,params.viewId]);


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
        let flag = false;
        sorts.forEach((sort) => {
            if (sort.id.length > 0) {
                flag = true;
            }
        });
        if(!flag && sorts.length > 0) return;
        setTableData([])
        // void utils.table.invalidate().then(()=>{
        if (sorts.length == 0){
            setTrueSorts([])
        }else{
            setTrueSorts(
                sorts
                    .map((sort) => {
                        if (sort.id.length > 0) {
                            return sort;
                        }
                        return undefined; 
                    })
                    .filter((sort)=> sort !== undefined) 
            );
        }
        // })
        
    }, [sorts]);

    useEffect(() => {
        let flag = false;
        
        filters.forEach((filter) => {
            if (filter.id.length > 0 && String(filter.value).length > 0) {
                flag = true;
            }
        });
        if(!flag && filters.length > 0) return;
        setTableData([])
        // void utils.table.invalidate().then(()=>{
            if (filters.length == 0){
                setTrueFilters([])
            }
            
            else{
                setTrueFilters(
                    filters
                        .map((filter) => {
                            if (filter.id.length > 0) {
                                return filter;
                            }
                            return undefined;
                        })
                        .filter((filter) => filter !== undefined) 
                );
            }
        // })
        
    }, [filters]);

    const flatData = useMemo(
        () => rows_data?.pages?.flatMap(page => page.items) ?? [],
        [rows_data]
    )
    
    const totalDBRowCount = rows_data?.pages?.[0]?.meta?.totalRowCount ?? 0
    const totalFetched = flatData.length
    
    useEffect(() => {
        
        const newRows = flatData.filter((row) => 
            !(previousFlatData.current as TableRow[]).some(prevRow => prevRow?.rowId === (row as TableRow)?.rowId)
        );
        setTableData((prevTableData) => [...prevTableData, ...newRows]);
        previousFlatData.current = flatData; 
        
    }, [flatData]);

    useEffect(()=>{
        setTableData(flatData)
    },[trueFilters,trueSorts])

    const addRow = api.table.addRow.useMutation({
        onSuccess: (newRow) => {
            const updatedRawData = [...tableData, { 
                rowId: newRow.newRow.id, 
                values: newRow.newRow.values 
            }];
            setTableData(updatedRawData);
            
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
            
            const updatedRawData = tableData.map((row) => ({
                ...Object(row) as object,
                [newColumn.accessorKey]: "" 
            }));
            setTableData(updatedRawData);
        },
    });

    const updateRow = api.table.editRow.useMutation({
        onSuccess: (updatedRow) =>{
            //To do what
        }
    });

    const debouncedServerUpdate = useDebouncedCallback((rowId: number, newRow: JsonValue) => {
        updateRow.mutate({ rowId, row: newRow });
    }, 300);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, rowId: number, columnId: string) => {
        const newValue = e.target.value;
        const updatedRawData = tableData.map((row) => 
            (row as TableRow)?.rowId === rowId
                ? { 
                    ...Object(row) as object, 
                    [columnId]: newValue
                }
                : row
        );
        setTableData(updatedRawData);
        
        const updatedRow = updatedRawData.find(row => (row as TableRow)?.rowId === rowId);
        if (updatedRow) {
            debouncedServerUpdate(rowId, updatedRow);
        }
    };
    useEffect(() => {
        const fetchData = async () => {
            if (totalFetched < totalDBRowCount && !isFetching) {
                await fetchNextPage(); 
            }
        };
        void fetchData();
    }, [isFetching, totalFetched, totalDBRowCount, fetchNextPage]);

    useEffect(() => {
        const tableDataMap = new Map(
            tableData.map(row => [(row as TableRow)?.rowId, row])
        );
        const mergedData = flatData.map(row => {
            const existingRow = tableDataMap.get((row as TableRow)?.rowId);
            return existingRow ?? row;
        });
        if (searchKey.length === 0) {
            setTableData(mergedData);
            return;
        }
        setTableData(
            mergedData.filter((row) => {
                if(row == undefined) return false
                for (const col of columns) {
                    if(String(col.header) === "rowId"){
                        continue
                    }
                    const cellValue = row[String(col.header) as keyof object];
                    if (cellValue && String(cellValue).toLowerCase().includes(searchKey.toLowerCase())) {
                        return true; 
                    }
                }
                return false; 
            })
        );
    }, [searchKey,flatData]);
    
    const table = useReactTable({
        data: tableData,
        columns,
        getCoreRowModel: getCoreRowModel(),
        manualFiltering:true,
        manualSorting:true,
    });
    const { rows } = table.getRowModel()
    
    const rowVirtualizer = useVirtualizer({
        count: rows.length,
        estimateSize: () => 36,
        getScrollElement: () => tableRef.current,
        
        overscan: 5,
      })

    return (
        <div
        ref={tableRef}
       
        className="h-full overflow-auto relative"
        
        >
            <table className="w-fit overflow-auto relative">
                <thead>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id}>
                            <th className="h-[36px] w-[90px] text-sm font-light text-left border"></th>
                            {headerGroup.headers.map((header) => {
                                if (header.column.columnDef.header === 'rowId') return null;
                                return (
                                    <th
                                        className="h-[36px] w-[180px] text-sm font-light text-left border"
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
                                className="h-[36px] w-[93px] text-sm font-light flex justify-center border hover:bg-slate-400 hover:cursor-pointer"
                            >
                                <div className="flex flex-col justify-center">
                                    <FiPlus />
                                </div>
                            </th>
                        </tr>
                    ))}
                </thead>
                <tbody style={{
                    height: `${rowVirtualizer.getTotalSize()}px`,
                    width: '100%',
                    position: 'relative'
                }}>
                    {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                        const row = rows[virtualRow.index];

                        if(row == undefined) return null;
                        return (
                            <tr 
                                key={row.id} 
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: `${virtualRow.size}px`,
                                    transform: `translateY(${virtualRow.start}px)`
                                }}
                            >
                                <td className={`bg-white border h-[36px] w-[90px]`}>
                                    <p>{virtualRow.index + 1}</p>
                                </td>
                                {row?.getVisibleCells().map((cell, cellIndex) => {
                                    if (cell.column.columnDef.header === 'rowId') return null;
                                    if(row == undefined) return null
                                    const inputId = `${cell.column.id}_${String(row.getValue('rowId'))}`;
                                    return (
                                        <td 
                                        className={`bg-white border ${(searchKey!== "" && cell.getValue() !== undefined && String(cell.getValue()).toLowerCase().includes(searchKey.toLowerCase())) ? 'bg-yellow-100' : 'bg-white'} h-[36px] w-[180px]`}
                                        key={cell.id}
                                        >
                                            <input
                                                className={`w-full h-full ${(searchKey!== "" && cell.getValue() !== undefined && String(cell.getValue()).toLowerCase().includes(searchKey.toLowerCase())) ? 'bg-yellow-100' : 'bg-white'}`}
                                                id={inputId}
                                                type="text"
                                                value={String(tableData[virtualRow.index]?.[cell.column.id as keyof object] ?? '')}
                                                onChange={(e) => handleInputChange(e, row.getValue('rowId'), cell.column.id)}
                                                onKeyDown={(e) => {
                                                    if (cellIndex === row.getVisibleCells().length - 1 && e.key === 'Tab') {
                                                        e.preventDefault();
                                                        const nextRowIndex = virtualRow.index + 1;
                                                        if (nextRowIndex < tableData.length) {
                                                            const nextRowFirstCellId = `${String(columns.at(1)?.header)}_${String(
                                                                (tableData[nextRowIndex] as TableRow)?.rowId
                                                            )}`;
                                                            const nextInput = document.getElementById(nextRowFirstCellId);
                                                            nextInput?.focus();
                                                        }
                                                    }
                                                }}
                                            />
                                        </td>
                                    );
                                })}
                            </tr>
                        );
                    })}
                </tbody>
                <tfoot>
                    <tr className="bg-white">
                        <td
                            onClick={() => {
                                addRow.mutate({ row: {}, tableId: params.tableId });
                            }}
                            className="bg-white border h-[36px] w-[90px] hover:bg-slate-400 hover:cursor-pointer"
                        >
                            <div className="flex flex-col justify-center">
                                <FiPlus />
                            </div>
                        </td>
                        {columns.map((col, index) => {
                            if (col.header === 'rowId') return null;
                            return (
                                <td className="bg-white border h-[36px] w-[180px]" key={index}></td>
                            )
                        })}
                    </tr>
                </tfoot>
            </table>
        </div>
    );
}