'use client';

import { flexRender, getCoreRowModel, useReactTable, ColumnDef, ColumnFiltersState, SortingState, getFilteredRowModel, Cell } from "@tanstack/react-table";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { api } from "~/trpc/react";
import { FiPlus } from "react-icons/fi";
import { JsonValue } from "@prisma/client/runtime/library";
import { useDebouncedCallback } from 'use-debounce';
import { useVirtualizer } from '@tanstack/react-virtual'
import { TbLetterA } from "react-icons/tb";
import { RiArrowDownSLine } from "react-icons/ri";
import { createId } from "@paralleldrive/cuid2";

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
    setColumns,
    isLoading,
    setIsLoading
}: {
    filters: ColumnFiltersState,
    setFilters: React.Dispatch<React.SetStateAction<ColumnFiltersState>>,
    sorts: SortingState,
    setSorts: React.Dispatch<React.SetStateAction<SortingState>>,
    searchKey:string,
    setSearchKey: React.Dispatch<React.SetStateAction<string>>,
    columns: ColumnDef<JsonValue>[],
    setColumns: React.Dispatch<React.SetStateAction<ColumnDef<JsonValue>[]>>
    isLoading:boolean,
    setIsLoading:React.Dispatch<React.SetStateAction<boolean>>,
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
    const [recordsCount,setRecordsCount] = useState(0)
    const { data: rows_data, isLoading: isRowLoading,fetchNextPage,isFetching } = api.table.getRows.useInfiniteQuery(    
        { 
            tableId: params.tableId,sorts:trueSorts,filters:trueFilters,
            limit:100
        },
            {
                getNextPageParam: (lastPage) => lastPage.nextCursor,
                refetchOnWindowFocus:false,
                gcTime:0,
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
    const debouncedSetLoading = useDebouncedCallback((loading: boolean) => {
            setIsLoading(loading);
    },300);
    useEffect(()=>{
        debouncedSetLoading(isFetching);
    },[isFetching])


    // MARKED FOR CHANGE
    useEffect(() => {
        if (tables?.columns) {
            const fields = tables.columns.map((column,index) => ({
                accessorKey: column, // Replace with column id
                header: column,
                type: tables.columns_type.at(index)
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
        setRecordsCount(totalDBRowCount)
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
        onMutate : async (newRow) =>{
            void utils.table.getRows.cancel();
            const updatedRawData = [...tableData, { 
                rowId: newRow.id,
                values: {},
            }];
            setTableData(updatedRawData);
            setRecordsCount(recordsCount+1);
            setTimeout(() => {
                const firstInputId = `${columns.at(1)?.header?.toString()}_${newRow.id}`;
                const firstInput = document.getElementById(firstInputId) as HTMLInputElement;
                if (firstInput) {
                    firstInput.focus();
                }
            }, 300);
        },
        // onSuccess: (newRow) => {
        //     const updatedRawData = [...tableData, { 
        //         rowId: newRow.newRow.id, 
        //         values: newRow.newRow.values 
        //     }];
        //     setTableData(updatedRawData);
        //     setRecordsCount(recordsCount+1);
        //     setTimeout(() => {
        //         const firstInputId = `${columns.at(1)?.header?.toString()}_${newRow.newRow.id}`;
        //         const firstInput = document.getElementById(firstInputId) as HTMLInputElement;
        //         if (firstInput) {
        //             firstInput.focus();
        //         }
        //     }, 300);
        // },
    });

    const addColumn = api.table.addColumn.useMutation({
        onMutate: async (col) => {
            void utils.table.getRows.cancel();
            const newColumn = {
                accessorKey: col.columnName ?? 'Column',
                header: col.columnName ?? 'Column',
            };
            setColumns((prevColumns) => [...prevColumns, newColumn]);
            
            const updatedRawData = tableData.map((row) => ({
                ...Object(row) as object,
                [newColumn.accessorKey]: "" 
            }));
            setTableData(updatedRawData);
            
        },
        // onSuccess: (newTable) => {
        //     const newColumn = {
        //         accessorKey: newTable.newTable.columns.at(-1) ?? 'Column',
        //         header: newTable.newTable.columns.at(-1) ?? 'Column',
        //     };
        //     setColumns((prevColumns) => [...prevColumns, newColumn]);
            
        //     const updatedRawData = tableData.map((row) => ({
        //         ...Object(row) as object,
        //         [newColumn.accessorKey]: "" 
        //     }));
        //     setTableData(updatedRawData);
        // },
    });

    const updateRow = api.table.editRow.useMutation({
        onSuccess: async (updatedRow) =>{
            await utils.table.invalidate()
        }
    });

    // This may cause changes to not be saved if the user tab away too quickly
    const debouncedServerUpdate = useDebouncedCallback((rowId: string, newRow: JsonValue) => {
        updateRow.mutate({ rowId, row: newRow });
    }, 300);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, rowId: string, columnId: string) => {
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
        enableColumnPinning:true,
        
    });

    const { rows } = table.getRowModel()

    const fetchMoreOnBottomReached = useCallback(
        (containerRefElement?: HTMLDivElement | null) => {
          if (containerRefElement) {
            const { scrollHeight, scrollTop, clientHeight } = containerRefElement
            
            if (
              scrollHeight - scrollTop - clientHeight < 500 &&
              !isFetching &&
              totalFetched < totalDBRowCount
            ) {
              void fetchNextPage()
            }
          }
        },
        [fetchNextPage, isFetching, totalFetched, totalDBRowCount]
      )
    useEffect(() => {
        fetchMoreOnBottomReached(tableRef.current)
    }, [fetchMoreOnBottomReached])

    useEffect(()=>{
        if(tableData.length < 100 && totalDBRowCount > totalFetched){
            void fetchNextPage()
        }
    },[tableData])

    const rowVirtualizer = useVirtualizer({
        count: rows.length,
        estimateSize: () => 36,
        getScrollElement: () => tableRef.current,
        overscan: 5,
    })

    const handleInputFocus = (inputElement: HTMLInputElement) => {
        if (!tableRef.current) return;

        const inputRect = inputElement.getBoundingClientRect();
        const containerRect = tableRef.current.getBoundingClientRect();

        const l = containerRect.left + 245; 
        const r = containerRect.right - 20; 
        if (inputRect.left < l || inputRect.right > r) {
            const scrollLeft = inputRect.left - l - 65; 
            tableRef.current.scrollTo({
                left: tableRef.current.scrollLeft + scrollLeft,
            });
        }
    };

    return (
        <div className="h-full relative">
        <div className="absolute left-[244px] h-[calc(100%-45px)] border border-slate-300 z-50"></div>
        <div
            ref={tableRef}
            id="tableContainer"
            onScroll={e => fetchMoreOnBottomReached(e.target as HTMLDivElement)}
            className="h-[calc(100%-30px)] relative w-full overflow-x-scroll overflow-auto bg-table-background rounded-lg shadow-md"
        >
            <table id="table" className="w-fit table-fixed relative">
                <thead className="bg-gray-100 sticky top-0 z-40">
                    {table.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id} className="">
                            <th className="sticky left-0 w-[65px] p-1 bg-header-background ">
                            </th>
                            {headerGroup.headers.map((header, index) => {
                                if (header.column.columnDef.header === 'rowId') return null;
                                return (
                                    <th
                                        className={`${
                                            index === 1 ? 'sticky left-[65px] ' : ''
                                        } bg-header-background border-slate-300  w-[180px] p-1 text-xs font-light
                                         text-black text-left border-r truncate overflow-hidden hover:bg-table-background hover:cursor-pointer transition-colors duration-75`}
                                        key={header.id}
                                    >
                                        <div className="flex justify-between">
                                            <div className="flex">
                                                <TbLetterA className="text-[16px] text-slate-500 mr-1"/>
                                                {flexRender(header.column.columnDef.header, header.getContext())}
                                            </div>
                                            <RiArrowDownSLine className="text-[16px] text-slate-500 mr-1"/>
                                        </div>
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
                                className="w-[94px] bg-header-background p-2 text-xs font-medium text-center border-slate-300 border border-t-0 hover:bg-table-background transition-colors duration-75 cursor-pointer group"
                            >
                                <div className="flex justify-center items-center">
                                    <FiPlus className="text-slate-500 text-[16px]" />
                                </div>
                            </th>
                        </tr>
                    ))}
                </thead>
                <tbody
                    className="w-fit z-10"
                    style={{
                        height: `${rowVirtualizer.getTotalSize()}px`,
                        position: 'relative'
                    }}
                >
                    {rowVirtualizer.getVirtualItems().map((virtualRow,index) => {
                        const row = rows[virtualRow.index];
                        
                        if(row == undefined) return null;
                        return (
                            <tr 
                                key={row.id} 
                                className="group w-fit focus-within:z-40"
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    height: `${virtualRow.size}px`,
                                    transform: `translateY(${virtualRow.start}px)`
                                }}
                            >
                                <td className="sticky left-0  bg-white border border-t border-r-0 border-l-0 text-gray-600 
                                    truncate p-0 group-hover:bg-table-background w-[65px] pr-8  border-slate-300">
                                    <div className="truncate text-center text-xs text-ellipsis font-light ">
                                        {virtualRow.index + 1}
                                    </div>
                                </td>
                                {row?.getVisibleCells().map((cell, cellIndex) => {
                                    if (cell.column.columnDef.header === 'rowId') return null;
                                    
                                    if(row == undefined) return null;
                                    const inputId = `${cell.column.id}_${String(row.getValue('rowId'))}`;
                                    return (
                                        <td 
                                            className={`border p-0 border-slate-300 border-l-0 w-[180px] h-[${virtualRow.size}px] ${
                                                cellIndex === 1 ? 'sticky left-[65px] ' : ''
                                            } ${
                                                (searchKey !== "" && cell.getValue() !== undefined && String(cell.getValue()).toLowerCase().includes(searchKey.toLowerCase())) 
                                                ? 'bg-yellow-50' 
                                                : 'bg-white'
                                            }`}
                                            key={cell.id}
                                        >
                                            <input
                                                onFocus={(e)=>handleInputFocus(e.target)}
                                                className={`w-full h-[36px] px-1 text-xs 
                                                    group-hover:bg-table-background group-hover:cursor-default
                                                    focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-600  focus:rounded-sm truncate overflow-hidden text-ellipsis ${
                                                    (searchKey !== "" && cell.getValue() !== undefined && String(cell.getValue()).toLowerCase().includes(searchKey.toLowerCase())) 
                                                    ? 'bg-yellow-50' 
                                                    : 'bg-white'
                                                }`}
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
                <tfoot className="z-0">
                    <tr
                        onClick={() => {
                            addRow.mutate({ id:createId(), row: {}, tableId: params.tableId });
                        }}
                        className="bg-white group"
                    >
                        <td className="sticky left-0 p-2 border-b border-slate-300 group-hover:bg-table-background cursor-pointer group group-hover:cursor-pointer">
                            <div className="flex justify-center items-center pr-8">
                                <FiPlus className="text-gray-500 group-hover:text-gray-700" />
                            </div>
                        </td>
                        {columns.map((col, index) => {
                            if (col.header === 'rowId') return null;
                            return (
                                <td 
                                    className={`border-b border-slate-300 ${index === 1 ? 'sticky left-[65px] ' : ''} ${
                                        index == columns.length - 1 && 'border-r'
                                    } group-hover:bg-table-background group-hover:cursor-pointer p-2 w-[180px]`} 
                                    key={index}
                                />
                            )
                        })}
                    </tr>
                </tfoot>
            </table>
        </div>
        <div className="fixed bottom-0 w-full h-[34px] z-50 bg-[#fbfbfb] border pl-[8px] pt-[4px] text-xs text-black font-light">
            {recordsCount} 
            <span className="text-[11px] ml-[2px]">records</span>
        </div>
        </div>
    );
}