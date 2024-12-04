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
import { GoPencil } from "react-icons/go";
import { createId } from "@paralleldrive/cuid2";
import { BiTrash } from "react-icons/bi";
import { checkValidFieldName,nextDefaultName } from "~/server/api/routers/lib";

interface TableRow {
    rowId: string |number;  
    [key: string]: JsonValue;
}

interface AdvColumnDef{
    header: string; 
    accessorKey: string; 
    type: string; 
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
    const [headerCIndex,setheaderCIndex] = useState(-1)
    const [editHIndex,seteditHIndex] = useState(-1)
    const [addColumnButton,setAddColumnButton] = useState(false)
    const [errorMsg,setErrorMsg] = useState("")

    const { data: rows_data, isLoading: isRowLoading,fetchNextPage,isFetching } = api.table.getRows.useInfiniteQuery(    
        { 
            tableId:params.tableId,sorts:trueSorts,filters:trueFilters,
            limit:100
        },
            {
                getNextPageParam: (lastPage) => lastPage.nextCursor,
                refetchOnWindowFocus:false,
                gcTime:0,
                staleTime:0
            }
        );
    useEffect(()=>{
        if(searchKey !== ""){
            const newFilter = [...filters,{
                id: 'Search',
                value: searchKey
            }]
            setTrueFilters(newFilter)
        }else{
            const newFilter = filters.filter((fil)=>fil.id === "Search")
            setTrueFilters(newFilter)
        }
       
    },[searchKey])
    useEffect(() => {
        const content = view?.filterBy.map((filter, index) => ({
            id: filter,
            value: view?.filterVal.at(index)
        }));
        const content2 = view?.sortBy.map((sort,index)=>({
            id: sort,
            desc: view?.sortOrder.at(index) === "Descending" ? true : false
        }));
        setFilters(content ?? [])
        setSorts(content2 ?? [])
        
    }, [view,params.viewId]);
    
    const debouncedSetLoading = useDebouncedCallback((loading: boolean) => {
            setIsLoading(loading);
    },300);

    useEffect(()=>{
        debouncedSetLoading(isFetching);
    },[isFetching])

    
    useEffect(() => {
        if (tables?.columns) {
            const fields = tables.columns.map((column,index) => ({
                accessorKey: tables.columns_id.at(index),
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

        if (sorts.length == 0){
            setTrueSorts([])
        }else{
            const newSorts = sorts
                        .map((sort) => {
                            if (sort.id.length > 0) {
                                const colInterest = columns.find((col) => sort.id === (col as AdvColumnDef).header)
                                if(colInterest === undefined) return undefined
                                return {
                                    id: (colInterest as AdvColumnDef).accessorKey,
                                    desc: sort.desc
                                };
                            }
                            return undefined; 
                        })
                        .filter((sort)=> sort !== undefined)

            let equal = false
            
            if(newSorts.length === trueSorts.length){
                equal = newSorts.every((sort, index) => {
                    if(trueSorts[index] === undefined) return false;
                    return sort.id === trueSorts[index].id && sort.desc === trueSorts[index].desc
                }  
                );
            }
            
            if (!equal) {
                setTrueSorts(newSorts);
            }
        }
    }, [sorts]);

    useEffect(() => {
        let flag = false;
        filters.forEach((filter) => {
            if (filter.id.length > 0 && String(filter.value).length > 0) {
                flag = true;
            }
        });
        if(!flag && filters.length > 0) return;

            if (filters.length == 0){
                setTrueFilters([])
            }
            
            else{
                const newFilters = filters.map((filter) => {
                                if (filter.id.length > 0 && filter.value !== "") {
                                    if(filter.value !== "Empty" && filter.value !== "Not Empty"){
                                        const temp = String(filter.value).split("_")
                                        if(temp.length < 2 || temp[1] === undefined || temp[1] === "") return undefined;
                                    }
                                    const colInterest = columns.find((col) => filter.id === (col as AdvColumnDef).header)
                                    if(colInterest === undefined) return undefined
                                    return {
                                        id: (colInterest as AdvColumnDef).accessorKey,
                                        value: filter.value
                                    };
                                }
                                return undefined;
                            })
                            .filter((filter) => filter !== undefined)
                
                let equal = false
                if(newFilters !== undefined){
                    if(newFilters.length === trueFilters.length){
                        equal = newFilters.every((filter, index) => {
                            if(trueFilters[index] === undefined) return false;
                            return filter.id === trueFilters[index].id && filter.value === trueFilters[index].value
                        }  
                        );
                    }
                    
                }
                
                if (!equal) {
                    setTrueFilters(newFilters);
                }
            }
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
        
    });

    const addColumn = api.table.addColumn.useMutation({
        onMutate: async (col) => {
            
            const newColumn = {
                accessorKey: col.id,
                header: col.columnName ?? 'Column',
                type: col.columnType ?? 'String'
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
        
    });
    
    const deleteColumn = api.table.deleteColumn.useMutation({
        onMutate: ({tableId,newColumns,newColumnsId,newColumnsType}: 
          {tableId:string;newColumns:string[];newColumnsId:string[];newColumnsType: string[]}) => {
            const toSet = newColumns.map((col,index)=>{
                return {
                    accessorKey: newColumnsId.at(index),
                    header: col,
                    type: newColumnsType.at(index)
                }
            })
            const rowId = {
                accessorKey: 'rowId',
                header: 'rowId',
            };
            setColumns([rowId,...toSet])
            setheaderCIndex(-1)
        },
        
    })
    const updateView = api.view.editView.useMutation({});

    const editColumnName = api.table.editColumnName.useMutation({
        onMutate: ({tableId,oldName,newName,orgColumns}) =>{
            setColumns(columns.map((col,index)=>{
                return String(col.header) !== oldName ? col : {
                    header:newName,
                    accessorKey: (col as AdvColumnDef).accessorKey,
                    type: (col as AdvColumnDef).type,
                }
            }))

            const newFilters = [...filters]

            const index = newFilters.findIndex((col)=>col.id === oldName)
            newFilters[index] = {
                id:newName,
                value: newFilters[index]?.value ?? ""
            }
            
            const newSorts = [...sorts]

            const index2 = newSorts.findIndex((col)=>col.id === oldName)
            newSorts[index2] = {
                id: newName,
                desc: newSorts[index]?.desc ?? false
            }
            
            handleChangeConfig(newFilters,newSorts)
            setFilters(newFilters)
            setSorts(newSorts)
        }
    })
    const handleChangeConfig = (filters:ColumnFiltersState,sorts:SortingState) =>{
        const filterId: string[] = [];
        const filterVal: string[] = [];
        const sortId: string[] = [];
        const sortOrder: string[] = [];
        
        filters.forEach((filter) => {
            if (filter.value == '' || String(filter.value) == '') return;
            
            filterId.push(filter.id);
            filterVal.push(String(filter.value));
        });

        sorts.forEach((sort) => {
            if (sort.id === '') return;
            sortId.push(sort.id);
            sortOrder.push(sort.desc ? "Descending" : "Ascending");
        });
        
        updateView.mutate({
            viewId: params.viewId,
            filterBy: filterId,
            filterVal: filterVal,
            sortBy: sortId,
            sortOrder: sortOrder
        });
  }
    const handleEditColumnName = (oldName:string,newName:string) => {
        if(newName === ""){
            seteditHIndex(-1)
            return;
        }
        const orgColumns = columns.filter((col)=> {return String(col.header) !== 'rowId'}).map((col)=>String(col.header))
        if(!checkValidFieldName(
            orgColumns,
            newName
        )){
            setErrorMsg("Please enter unique field name");
            return;
        }
        setErrorMsg("")
        seteditHIndex(-1)
        
        editColumnName.mutate({
            tableId:params.tableId,
            oldName,
            newName,
            orgColumns
        })
    }

    const handleDeleteColumn = (columnName:string) =>{
        
        const newColumns = columns.filter(col => col.header!== 'rowId' && col.header !== columnName).map((val)=>String(val.header));
        const newColumnsId = columns.filter(col => col.header!== 'rowId' && col.header !== columnName).map((val)=>String((val as AdvColumnDef).accessorKey));
        const newColumnsType = columns.filter(col =>  col.header!== 'rowId' && col.header !== columnName).map((val)=>String((val as AdvColumnDef).type));

        deleteColumn.mutate({
            tableId:params.tableId,
            newColumns,
            newColumnsId,
            newColumnsType
        })
    }
    // This may cause changes to not be saved if the user tab away too quickly, change the debounced time to fix
    const debouncedServerUpdate = useDebouncedCallback((rowId: string, newRow: JsonValue) => {
        updateRow.mutate({ rowId, row: newRow });
    }, 300);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, rowId: string, columnId: string) => {
        const newValue = e.target.value;
        const colInterest = columns.find((col)=>(col as AdvColumnDef).accessorKey === columnId)
        const updatedRawData = tableData.map((row) => 
            (row as TableRow)?.rowId === rowId
                ? { 
                    ...Object(row) as object, 
                    [columnId]: (colInterest as AdvColumnDef).type === "String" ? newValue : parseFloat(e.target.value)
                }
                : row
        );
        setTableData(updatedRawData);
        
        const updatedRow = updatedRawData.find(row => (row as TableRow)?.rowId === rowId);
        if (updatedRow) {
            debouncedServerUpdate(rowId, updatedRow);
        }
    };
    
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

    const handleAddColumn = (name:string,type:string) =>{
        if(name === ""){
            setErrorMsg("")
            setAddColumnButton(false)
            addColumn.mutate({
                id:createId(), 
                tableId: params.tableId, 
                columnName: nextDefaultName(columns.map((col)=>String(col.header))), 
                columnType: type 
            });
            return;
        }
        if(!checkValidFieldName(
            columns.map((col)=>String(col.header)),
            name
        )){
            setErrorMsg("Please enter unique field name");
            return;
        }
        setErrorMsg("")
        setAddColumnButton(false)
        addColumn.mutate({
            id:createId(),  
            tableId: params.tableId, 
            columnName: name, 
            columnType: type 
        });
    }
    
    if(isRowLoading){
        return <div>
            Loading...
        </div>
    }
    
    return (
        <div onClick={()=>{setheaderCIndex(-1);seteditHIndex(-1);setAddColumnButton(false)}} className="h-full relative">
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
                                        onClick={(e)=>{e.stopPropagation();setheaderCIndex(index);seteditHIndex(-1);setAddColumnButton(false)}}
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
                                onClick={(e)=>{e.stopPropagation();setheaderCIndex(-1);seteditHIndex(-1);setAddColumnButton(true)}} 
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
                                    const temp = columns.find(col => (col as AdvColumnDef).accessorKey === cell.column.id)

                                    if(temp == null) return;

                                    const type = (temp as AdvColumnDef).type;

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
                                                type={type === 'Number' ? 'number' : 'text'}
                                                onFocus={(e)=>handleInputFocus(e.target)}
                                                className={`w-full h-[36px] px-1 text-xs 
                                                    group-hover:bg-table-background group-hover:cursor-default
                                                    focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-600  focus:rounded-sm truncate overflow-hidden text-ellipsis ${
                                                    (searchKey !== "" && cell.getValue() !== undefined && String(cell.getValue()).toLowerCase().includes(searchKey.toLowerCase())) 
                                                    ? 'bg-yellow-50' 
                                                    : 'bg-white'
                                                }`}
                                                id={inputId}
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
        {
            headerCIndex !== -1 &&
            <div
            onClick={(e) => e.stopPropagation()}
            className="absolute w-[308px] top-[32px] bg-white shadow-xl p-[12px] z-50 border text-[12.5px] rounded "
            style={{ left: `calc(65px + 180px * (${headerCIndex - 1}))` }}>
            <div onClick={()=>{seteditHIndex(headerCIndex);setheaderCIndex(-1)}}
             className="p-[8px] flex items-center hover:bg-table-background hover:cursor-pointer text-slate-700 transition-colors duration-200 rounded">
                <GoPencil className="mr-[8px] text-lg"/>
                Edit field
            </div>
            <hr className="my-2"/>
            <div
                onClick={()=>{
                    if(headerCIndex !== 1) handleDeleteColumn(String(columns.at(headerCIndex)?.header))
                }} 
                className={`p-[8px] text-red-500 flex items-center hover:bg-table-background hover:cursor-pointer transition-colors duration-200 rounded ${headerCIndex === 1 && 'opacity-30'}`}>
                <BiTrash className="text-lg mr-[8px]"/>
                {
                    headerCIndex === 1 ? 'Can not delete primary field' : 'Delete field'
                }
            </div>
            </div>
        }
        {
            editHIndex !== -1 &&
            <div
            onClick={(e) => e.stopPropagation()}
            className="absolute w-[500px] top-[32px] bg-white shadow-xl p-[16px] z-50 border text-[12.5px] rounded "
            style={{ left: `calc(65px + 180px * (${editHIndex - 1}))` }}>
            <input id="FieldNameEdit"
            className="w-full px-2 py-[6px] rounded focus:outline-none focus:ring-2 focus:ring-blue-600 border shadow-sm hover:shadow-md" defaultValue={String(columns.at(editHIndex)?.header)}>
            </input>
            {
                errorMsg !== "" &&
                <div className="mt-2 text-red-500 text-xs">{errorMsg}</div> 
            }
            
            <div className="flex mt-8 justify-end space-x-3">
                <button onClick={()=>{seteditHIndex(-1)}}
                className="px-[12px] py-[8px] rounded hover:bg-table-background">Cancel</button>
                <button
                onClick={()=>{
                    const newName = (document.getElementById("FieldNameEdit") as HTMLInputElement)?.value ?? "";
                    handleEditColumnName(String(columns.at(editHIndex)?.header),newName)
                }}
                className="bg-blue-600 text-white px-[12px] py-[8px] rounded shadow hover:shadow-md">Save</button>
            </div>
            
            </div>
        }
        {
            addColumnButton && 
            <div
            onClick={(e) => e.stopPropagation()}
            className="absolute w-[500px] top-[32px] bg-white shadow-xl p-[16px] z-50 border text-[12.5px] rounded "
            style={{ left: `calc(65px + 180px * (${columns.length - 1 }))` }}>
            <input
            id="FieldName"
            placeholder={`Optional`}
            className="w-full px-2 py-[6px] rounded focus:outline-none focus:ring-2 focus:ring-blue-600 border shadow-sm mb-4 hover:shadow-md" >
            </input> 
            {
                errorMsg !== "" &&
                <div className="mt-2 text-red-500 text-xs">{errorMsg}</div> 
            }
            <select id="FieldType"
            className="w-full px-2 py-[6px] rounded focus:outline-none focus:ring-2 focus:ring-blue-600 border shadow-sm hover:shadow-md" >
            
            <option value="String">String</option>
            <option value="Number">Number</option>
            </select> 
            <div className="flex mt-8 justify-end space-x-3">
                <button onClick={()=>{setAddColumnButton(false)}}
                className="px-[12px] py-[8px] rounded hover:bg-table-background">Cancel</button>
                <button 
                onClick={() => {
                    const name = (document.getElementById("FieldName") as HTMLInputElement)?.value ?? "";
                    const type = (document.getElementById("FieldType") as HTMLSelectElement)?.value ?? "String";
                    handleAddColumn(name, type);
                }
                }
                className="bg-blue-600 text-white px-[12px] py-[8px] rounded shadow hover:shadow-md">Create field</button>
            </div>
            
            </div>
        }
        <div className="fixed bottom-0 w-full h-[34px] z-50 bg-[#fbfbfb] border pl-[8px] pt-[4px] text-xs text-black font-light">
            {recordsCount} 
            <span className="text-[11px] ml-[2px]">records</span>
        </div>
        </div>
    );
}