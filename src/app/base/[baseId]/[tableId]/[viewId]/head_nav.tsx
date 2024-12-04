"use client";

import { api } from "~/trpc/react";

import { useState, useEffect } from "react";
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
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
} from "@tanstack/react-table";
import { JsonValue } from "@prisma/client/runtime/library";
import { FaRegTrashAlt } from "react-icons/fa";
import { RxCross1 } from "react-icons/rx";
import { useDebouncedCallback } from "use-debounce";

interface AdvColumnDef {
  header: string;
  accessorKey: string;
  type: string;
}

export function HeadNav({
  open,
  setOpen,
  openView,
  setOpenView,
  filters,
  setFilters,
  sorts,
  setSorts,
  searchKey,
  setSearchKey,
  columns,
  setColumns,
  isLoading,
  setIsLoading,
  filterbutton,
  setFilterButton,
  sortbutton,
  setSortButton,
  session,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  filterbutton: boolean;
  setFilterButton: React.Dispatch<React.SetStateAction<boolean>>;
  sortbutton: boolean;
  setSortButton: React.Dispatch<React.SetStateAction<boolean>>;
  openView: boolean;
  setOpenView: React.Dispatch<React.SetStateAction<boolean>>;
  filters: ColumnFiltersState;
  setFilters: React.Dispatch<React.SetStateAction<ColumnFiltersState>>;
  sorts: SortingState;
  setSorts: React.Dispatch<React.SetStateAction<SortingState>>;
  searchKey: string;
  setSearchKey: React.Dispatch<React.SetStateAction<string>>;
  columns: ColumnDef<JsonValue>[];
  setColumns: React.Dispatch<React.SetStateAction<ColumnDef<JsonValue>[]>>;
  session: Session | null;
}) {
  const [isDesktop, setIsDesktop] = useState(false);
  
  const [searchbutton, setSearchButton] = useState(false);

  useEffect(() => {
    const isDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    isDesktop();

    window.addEventListener("resize", isDesktop);

    return () => window.removeEventListener("resize", isDesktop);
  }, []);

  const params = useParams<{
    baseId: string;
    tableId: string;
    viewId: string;
  }>();
  const router = useRouter();
  const utils = api.useUtils();
  const createTable = api.table.create.useMutation({
    onSuccess: async (data) => {
      // await utils.table.invalidate();

      window.location.href = `/base/${params.baseId}/${data.newTable.id}/${data.newView.id}`;
    },
  });

  const addbunch = api.table.addManyRows.useMutation({
    onSuccess: async (data) => {
      await utils.table.invalidate();
    },
  });
  const handleAddBunch = (count: number) => {
    const columnsId = columns.map((col) => {
      return String((col as AdvColumnDef).accessorKey);
    });
    const columnsType = columns.map((col) =>
      String((col as AdvColumnDef).type),
    );
    addbunch.mutate({
      count: count,
      tableId: params.tableId,
      columnsId,
      columnsType,
    });
  };

  const handleSearchChange = useDebouncedCallback((keyword: string) => {
    setSearchKey(keyword);
  }, 300);

  const handleCreateTable = () => {
    createTable.mutate({
      baseId: params.baseId,
      name: "default",
    });
  };

  const handleDeleteFilter = (index: number) => {
    const updatedFilters = filters.filter((fil, i) => i !== index);
    handleChangeConfig(updatedFilters, sorts);
    setFilters(updatedFilters);
  };

  const handleSetFilter = (index: number, field: string, value: string) => {
    const newFilters = [...filters];
    let newValue = value;
    if (field === "id") {
      newFilters[index] = {
        id: value,
        value: "",
      };
    } else if (
      field === "value" &&
      value !== "Empty" &&
      value !== "Not Empty"
    ) {
      const temp = (
        document.getElementById(`FilterNumber_${index}`) as HTMLInputElement
      ).value;
      newValue = value + "_" + temp;
      newFilters[index] = {
        id: newFilters[index]?.id ?? "",
        value: newValue,
      };
    } else {
      newFilters[index] = {
        id: newFilters[index]?.id ?? "",
        value: newFilters[index]?.value ?? "",
        [field]: newValue ?? "",
      };
    }

    handleChangeConfig(newFilters, sorts);

    setFilters(newFilters);
  };

  const handleSetSort = (index: number, field: string, value: string) => {
    const newSorts = [...sorts];
    if (field === "id") {
      newSorts[index] = {
        id: value,
        desc: newSorts[index]?.desc ?? false,
      };
    } else if (field === "order") {
      newSorts[index] = {
        id: newSorts[index]?.id ?? "",
        desc: value === "Descending" ? true : false,
      };
    }
    handleChangeConfig(filters, newSorts);
    setSorts(newSorts);
  };

  const handleDeleteSort = (index: number) => {
    const newSorts = sorts.filter((fil, i) => i !== index);
    handleChangeConfig(filters, newSorts);
    setSorts(newSorts);
  };

  const handleSetKeyword = useDebouncedCallback(
    (index: number, keyword: string) => {
      const newFilters = [...filters];
      const key = String(newFilters[index]?.value).split("_")[0];
      if (key === "" || key === "Empty" || key === "Not Empty") return;

      const newValue = key + "_" + keyword;

      newFilters[index] = {
        id: newFilters[index]?.id ?? "",
        value: newValue ?? "",
      };

      handleChangeConfig(newFilters, sorts);

      setFilters(newFilters);
    },
    500,
  );

  const updateView = api.view.editView.useMutation({});

  const handleChangeConfig = (
    filters: ColumnFiltersState,
    sorts: SortingState,
  ) => {
    const filterId: string[] = [];
    const filterVal: string[] = [];
    const sortId: string[] = [];
    const sortOrder: string[] = [];

    filters.forEach((filter) => {
      if (filter.value == "" || String(filter.value) == "") return;

      filterId.push(filter.id);
      filterVal.push(String(filter.value));
    });

    sorts.forEach((sort) => {
      if (sort.id === "") return;
      sortId.push(sort.id);
      sortOrder.push(sort.desc ? "Descending" : "Ascending");
    });

    updateView.mutate({
      viewId: params.viewId,
      filterBy: filterId,
      filterVal: filterVal,
      sortBy: sortId,
      sortOrder: sortOrder,
    });
  };

  return (
    <header
      onClick={() => {
        setFilterButton(false);
        setSortButton(false);
      }}
      className="sticky top-0 z-30 min-w-full border border-slate-300 bg-card-brown text-white"
    >
      <nav className="flex h-[56px] items-center justify-between overflow-hidden py-[12px] pl-[20px] pr-[16px]">
        <div className="flex items-center">
          <button className="ml-2 mr-2 mt-1 flex lg:ml-0">
            <svg
              onClick={()=>{window.location.href = '/dashboard'}}
              className="mr-[16px]"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 200 170"
            >
              <path
                fill="#ffffff"
                d="M90.039 12.368 24.079 39.66c-3.667 1.519-3.63 6.729.062 8.192l66.235 26.266a24.58 24.58 0 0 0 18.12 0l66.236-26.266c3.69-1.463 3.729-6.673.06-8.191l-65.958-27.293a24.58 24.58 0 0 0-18.795 0"
              ></path>
              <path
                fill="#ffffff"
                d="M105.312 88.46v65.617c0 3.12 3.147 5.258 6.048 4.108l73.806-28.648a4.42 4.42 0 0 0 2.79-4.108V59.813c0-3.121-3.147-5.258-6.048-4.108l-73.806 28.648a4.42 4.42 0 0 0-2.79 4.108"
              ></path>
              <path
                fill="#ffffff"
                d="m88.078 91.846-21.904 10.576-2.224 1.075-46.238 22.155c-2.93 1.414-6.672-.722-6.672-3.978V60.088c0-1.178.604-2.195 1.414-2.96a5 5 0 0 1 1.12-.84c1.104-.663 2.68-.84 4.02-.31L87.71 83.76c3.564 1.414 3.844 6.408.368 8.087"
              ></path>
            </svg>
            {isDesktop && (
              <span className="mr-1 min-w-0 flex-shrink overflow-hidden truncate whitespace-nowrap text-[16.5px] font-bold opacity-95 hover:opacity-100">
                Untitled Base
              </span>
            )}

            <RiArrowDownSLine className="mr-[4px] mt-[3px]" />
          </button>
          <ul className="flex items-center text-[12px] font-light text-slate-50">
            <li className="mr-[8px]">
              <div className="rounded-2xl bg-data-brown px-[12px] py-[6px] text-center shadow-inner-strong">
                <p>Data</p>
              </div>
            </li>
            <li className="mr-[8px] rounded-2xl transition duration-200 ease-in-out hover:cursor-pointer hover:bg-data-brown">
              <div className="rounded-2xl px-[14px] py-[7px] text-center">
                <p>Automations</p>
              </div>
            </li>
            <li className="mr-[8px] rounded-2xl transition duration-200 ease-in-out hover:cursor-pointer hover:bg-data-brown">
              <div className="rounded-2xl px-[14px] py-[7px] text-center">
                <p>Interfaces</p>
              </div>
            </li>
            <div
              className="w-[0.5px] bg-gray-400 opacity-30"
              style={{ height: "20px" }}
            ></div>
            <li className="mr-[10px] pl-[12px]">
              <div className="rounded-2xl px-[14px] py-[7px] text-center transition duration-200 ease-in-out hover:cursor-pointer hover:bg-data-brown">
                <p>Forms</p>
              </div>
            </li>
          </ul>
        </div>
        <ul className="flex items-center text-xs font-light text-slate-50 text-opacity-90">
          <li className="rounded-2xl transition duration-200 ease-in-out hover:cursor-pointer hover:bg-data-brown">
            <div className="rounded-2xl px-[12px] py-[7px] text-center">
              <LuHistory style={{ fontSize: "16px" }} />
            </div>
          </li>
          <li className="rounded-2xl transition duration-200 ease-in-out hover:cursor-pointer hover:bg-data-brown">
            <div className="flex rounded-2xl px-[12px] py-[7px] text-center">
              <AiOutlineQuestionCircle style={{ fontSize: "16px" }} />
              <p className="ml-[4px]">Help</p>
            </div>
          </li>

          <li className="mx-[8px] mr-[8px] rounded-2xl bg-[#faf6f5] px-[12px] py-[6px] transition duration-200 ease-in-out hover:cursor-pointer hover:bg-white">
            <div className="flex text-center">
              <GoPeople
                style={{ fontSize: "16px" }}
                className="mr-1 text-card-brown"
              />
              <span className="mt-[1px] text-card-brown">Share</span>
            </div>
          </li>
          <li className="mx-[8px] mr-[5px] rounded-full bg-[#faf6f5] p-[6px] pl-[7px] transition duration-200 ease-in-out hover:cursor-pointer hover:bg-white">
            <VscBell style={{ fontSize: "16px" }} className="text-card-brown" />
          </li>

          <li className="pl-[12px]">
            {session?.user.image && (
              <img
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen(true);
                }}
                src={session.user.image}
                alt="User profile"
                className="h-[27px] w-[27px] rounded-full border border-white shadow-md hover:cursor-pointer"
              />
            )}
          </li>
        </ul>
      </nav>
      <div className="flex justify-between overflow-hidden">
        <div className="mr-2 flex flex-grow rounded-tr bg-lower-brown pl-[12px]">
          <TableList />
          <div
            onClick={() => {
              handleCreateTable();
            }}
            className="flex flex-col justify-center px-[12px] hover:cursor-pointer"
          >
            <RiArrowDownSLine className="text-slate-200 hover:text-white" />
          </div>
          <div className="my-[10px] w-[0.5px] bg-gray-400 opacity-30"></div>
          <div className="flex px-[12px] opacity-80 hover:cursor-pointer hover:opacity-100">
            <div className="flex flex-col justify-center">
              <GoPlus className="text-slate-200" style={{ fontSize: "20px" }} />
            </div>
            {isDesktop && (
              <div className="ml-[7px] flex flex-col justify-center">
                <span className="mt-1 text-[12.9px] font-light text-white opacity-95 hover:opacity-100">
                  Add or import
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="flex rounded-tl rounded-tr-sm bg-lower-brown pt-1 text-xs text-slate-200">
          <div className="flex flex-col justify-center px-[12px] hover:cursor-pointer hover:text-white">
            Extensions
          </div>
          <div className="flex px-[12px] hover:cursor-pointer hover:text-white">
            <div className="flex flex-col justify-center pr-[4px]">
              <span>Tools</span>
            </div>

            <div className="flex flex-col justify-center">
              <RiArrowDownSLine style={{ fontSize: "18px" }} />
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-between overflow-x-clip bg-white py-[6px]">
        <div className="flex pl-[12px]">
          <button
            onClick={() => {
              setOpenView(!openView);
            }}
            className="mr-[8px] flex rounded border border-white bg-slate-signin px-[8px] py-[7px] hover:border-slate-200"
          >
            <div className="flex h-full flex-col justify-center text-black">
              <AiOutlineMenu style={{ fontSize: "14px" }} />
            </div>
            <div className="ml-[4px] flex flex-col text-xs font-medium text-black">
              Views{" "}
            </div>
          </button>
          <div className="my-[8px] ml-[4px] mr-[12px] w-[0.5px] bg-black opacity-50"></div>
          <button className="flex rounded px-[8px] transition duration-200 hover:cursor-pointer hover:bg-slate-signin">
            <div className="flex h-full flex-col justify-center">
              <FaTable className="text-blue-500" />
            </div>
            <div className="ml-[8px] flex h-full flex-col justify-center text-xs font-semibold text-black">
              Grid view
            </div>
            <div className="mx-[8px] flex h-full flex-col justify-center text-black">
              <GoPeople />
            </div>
            <div className="flex h-full flex-col justify-center text-black">
              <RiArrowDownSLine />
            </div>
          </button>
          <div className="f-full flex space-x-[9.5px] px-[8px] text-base">
            <div className="flex h-full rounded px-[8px] py-[4px] text-black transition duration-200 hover:cursor-pointer hover:bg-slate-signin">
              <div className="flex h-full flex-col justify-center">
                <BsEyeSlash />
              </div>
              {isDesktop && (
                <div className="ml-[4px] flex h-full flex-col justify-center text-xs font-light">
                  Hide fields
                </div>
              )}
            </div>
            <div
              onClick={(e)=>e.stopPropagation()}
              className="relative"
            >
              <div onClick={(e) => {
                e.stopPropagation();
                setSortButton(false);
                setSearchButton(false);
                setFilterButton(!filterbutton);
              }} className="relative flex h-full rounded px-[8px] py-[4px] text-black transition duration-200 hover:cursor-pointer hover:bg-slate-signin">
                <div className="flex h-full flex-col justify-center">
                  <IoFilterOutline />
                </div>
                {isDesktop && (
                  <div className="ml-[4px] flex h-full flex-col justify-center text-xs font-light">
                    Filter
                  </div>
                )}
              </div>
              {filterbutton && (
                <div className="absolute top-[30px] rounded border bg-white shadow-xl">
                  {filters.length == 0 ? (
                    <div className="w-[296px] px-[16px] pt-[16px] text-xs text-slate-400">
                      No filter conditions are applied
                    </div>
                  ) : (
                    <div>
                      <div className="px-[16px] pt-[16px] text-xs text-slate-400">
                        In this view, show records
                      </div>
                      <div className="space-y-3 px-[16px] pt-[12px]">
                        {filters?.map((filter, index) => {
                          return (
                            <div
                              key={index}
                              className="flex text-xs text-black"
                            >
                              <div className="px-[8px]">
                                {index == 0 ? (
                                  <span className="px-[8px] text-center">
                                    Where
                                  </span>
                                ) : (
                                  <span className="mr-[14px] px-[8px] text-center">
                                    And
                                  </span>
                                )}
                              </div>
                              <div id={`FilterDiv_${index}`} className="flex">
                                <select
                                  onChange={(e) =>
                                    handleSetFilter(index, "id", e.target.value)
                                  }
                                  value={String(filter.id) || "default"}
                                  className="mr-2 border"
                                >
                                  <option value="default" disabled>
                                    Choose a column
                                  </option>
                                  {columns?.map((col, index) => {
                                    if (col.header?.toString() === "rowId") {
                                      return null;
                                    }
                                    return (
                                      <option key={index}>
                                        {col.header?.toString()}
                                      </option>
                                    );
                                  })}
                                </select>
                                {columns.find(
                                  (col) => col.header === filter.id,
                                ) ? (
                                  (
                                    columns.find(
                                      (col) => col.header === filter.id,
                                    ) as AdvColumnDef
                                  ).type === "String" ? (
                                    <select
                                      id={`Select_${index}`}
                                      onChange={(e) =>
                                        handleSetFilter(
                                          index,
                                          "value",
                                          e.target.value,
                                        )
                                      }
                                      value={
                                        String(filter.value).split("_")[0] ===
                                          "" ||
                                        String(filter.value).split("_")[0] ===
                                          undefined
                                          ? "default"
                                          : String(filter.value).split("_")[0]
                                      }
                                      className="mr-2 border"
                                    >
                                      <option value="default" disabled>
                                        Choose a kind
                                      </option>
                                      <option value="Empty">Empty</option>
                                      <option value="Not Empty">
                                        Not Empty
                                      </option>
                                      <option value="Contain">Contain</option>
                                      <option value="Not Contain">
                                        Not Contain
                                      </option>
                                      <option value="Is">Is</option>
                                      <option value="Is Not">Is Not</option>
                                    </select>
                                  ) : (
                                    <select
                                      onChange={(e) =>
                                        handleSetFilter(
                                          index,
                                          "value",
                                          e.target.value,
                                        )
                                      }
                                      value={
                                        String(filter.value).split("_")[0] ===
                                          "" ||
                                        String(filter.value).split("_")[0] ===
                                          undefined
                                          ? "default"
                                          : String(filter.value).split("_")[0]
                                      }
                                      className="mr-2 border"
                                    >
                                      <option value="default" disabled>
                                        Choose a kind
                                      </option>
                                      <option value="Greater Than">&gt;</option>
                                      <option value="Less Than">&lt;</option>
                                      <option value="Greater Than Or Equal">
                                        &ge;
                                      </option>
                                      <option value="Less Than Or Equal">
                                        &le;
                                      </option>
                                      <option value="Equal">=</option>
                                      <option value="Not Equal">&ne;</option>
                                      <option value="Empty">Empty</option>
                                      <option value="Not Empty">
                                        Not Empty
                                      </option>
                                    </select>
                                  )
                                ) : (
                                  <select
                                    value="default"
                                    disabled
                                    className="mr-2 border"
                                  >
                                    <option value="default">
                                      Choose a field first
                                    </option>
                                  </select>
                                )}

                                <input
                                  defaultValue={
                                    String(filter.value).split("_")[1]
                                  }
                                  id={`FilterNumber_${index}`}
                                  type={
                                    (
                                      columns.find(
                                        (col) => col.header === filter.id,
                                      ) as AdvColumnDef
                                    )?.type === "Number"
                                      ? "number"
                                      : "text"
                                  }
                                  disabled={
                                    filter.value === "" ||
                                    filter.value === "Empty" ||
                                    filter.value === "Not Empty"
                                  }
                                  placeholder={
                                    filter.value === "" ||
                                    filter.value === "Empty" ||
                                    filter.value === "Not Empty"
                                      ? "N/A"
                                      : "Enter a value"
                                  }
                                  onChange={(e) =>
                                    handleSetKeyword(index, e.target.value)
                                  }
                                  className="border p-1 focus:outline-none focus:ring-2 focus:ring-blue-600"
                                ></input>
                              </div>
                              <div
                                onClick={() => handleDeleteFilter(index)}
                                className="ml-3 px-2 py-1 transition duration-200 ease-in-out hover:cursor-pointer hover:bg-red-500"
                              >
                                <FaRegTrashAlt className="text-md" />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="flex p-[16px] text-slate-500">
                    <div
                      onClick={() => {
                        setFilters((prev) => [...prev, { id: "", value: "" }]);
                      }}
                      className="mr-[16px] flex hover:cursor-pointer hover:text-black"
                    >
                      <GoPlus />
                      <span className="text-xs font-semibold">
                        Add condition
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="flex h-full rounded px-[8px] py-[4px] text-black transition duration-200 hover:cursor-pointer hover:bg-slate-signin">
              <div className="flex h-full flex-col justify-center">
                <FaRegObjectUngroup />
              </div>
              {isDesktop && (
                <div className="ml-[4px] flex h-full flex-col justify-center text-xs font-light">
                  Group
                </div>
              )}
            </div>
            <div
              onClick={(e)=>e.stopPropagation()}
              className="relative"
            >
              <div
              onClick={(e) => {
                e.stopPropagation();
                setFilterButton(false);
                setSearchButton(false);
                setSortButton(!sortbutton);
              }}
              className="flex h-full rounded px-[8px] py-[4px] text-black transition duration-200 hover:cursor-pointer hover:bg-slate-signin">
                <div className="flex h-full flex-col justify-center">
                  <BiSortAlt2 />
                </div>
                {isDesktop && (
                  <div className="ml-[4px] flex h-full flex-col justify-center text-xs font-light">
                    Sort
                  </div>
                )}
              </div>
              {sortbutton && (
                <div className="absolute top-[30px] rounded border bg-white shadow-xl">
                  {
                    <div>
                      <div className="w-[296px] px-[16px] pt-[16px] text-xs text-slate-400">
                        Sort by
                      </div>
                      <div className="space-y-3 px-[16px] pt-[12px]">
                        {sorts?.map((sort, index) => {
                          return (
                            <div
                              key={index}
                              className="flex text-xs text-black"
                            >
                              <div id={`SortDiv_${index}`} className="flex">
                                <select
                                  onChange={(e) =>
                                    handleSetSort(index, "id", e.target.value)
                                  }
                                  value={String(sort.id) || ""}
                                  className="mr-2 border"
                                >
                                  <option value="" disabled>
                                    Choose a column
                                  </option>
                                  {columns?.map((col, index) => {
                                    if (col.header?.toString() === "rowId") {
                                      return null;
                                    }
                                    return (
                                      <option key={index}>
                                        {col.header?.toString()}
                                      </option>
                                    );
                                  })}
                                </select>
                                <select
                                  onChange={(e) =>
                                    handleSetSort(
                                      index,
                                      "order",
                                      e.target.value,
                                    )
                                  }
                                  value={sort.desc ? "Descending" : "Ascending"}
                                  className="border"
                                >
                                  <option value="Ascending">Ascending</option>
                                  <option value="Descending">Descending</option>
                                </select>
                              </div>
                              <div
                                onClick={() => handleDeleteSort(index)}
                                className="ml-3 px-2 py-1 transition duration-200 ease-in-out hover:cursor-pointer hover:bg-red-500"
                              >
                                <FaRegTrashAlt className="text-md" />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  }
                  <div className="flex p-[16px] text-slate-500">
                    <div
                      onClick={() => {
                        setSorts((prev) => [...prev, { id: "", desc: false }]);
                      }}
                      className="mr-[16px] flex hover:cursor-pointer hover:text-black"
                    >
                      <GoPlus />
                      <span className="text-xs font-semibold">Add sort</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex h-full rounded px-[8px] py-[4px] text-black transition duration-200 hover:cursor-pointer hover:bg-slate-signin">
              <div className="flex h-full flex-col justify-center">
                <IoColorFillOutline />
              </div>
              {isDesktop && (
                <div className="ml-[4px] flex h-full flex-col justify-center text-xs font-light">
                  Color
                </div>
              )}
            </div>
            <div className="flex h-full rounded px-[8px] py-[4px] text-black transition duration-200 hover:cursor-pointer hover:bg-slate-signin">
              <div className="flex h-full flex-col justify-center">
                <CiLineHeight />
              </div>
            </div>
            <div className="flex h-full rounded px-[8px] py-[4px] text-black transition duration-200 hover:cursor-pointer hover:bg-slate-signin">
              <div className="flex h-full flex-col justify-center">
                <CiShare1 />
              </div>
              {isDesktop && (
                <div className="ml-[4px] flex h-full flex-col justify-center text-xs font-light">
                  Share and sync
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex">
          {isLoading && (
            <div className="mr-2 flex animate-pulse flex-col justify-center text-xs font-bold text-black opacity-20">
              <div className="flex">
                <svg
                  className="w-[16px]"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 200 200"
                >
                  <path
                    style={{ transformOrigin: "center" }}
                    fill="#FF156D"
                    stroke="#FF156D"
                    strokeWidth="15"
                    d="m148 84.7 13.8-8-10-17.3-13.8 8a50 50 0 0 0-27.4-15.9v-16h-20v16A50 50 0 0 0 63 67.4l-13.8-8-10 17.3 13.8 8a50 50 0 0 0 0 31.7l-13.8 8 10 17.3 13.8-8a50 50 0 0 0 27.5 15.9v16h20v-16a50 50 0 0 0 27.4-15.9l13.8 8 10-17.3-13.8-8a50 50 0 0 0 0-31.7Zm-47.5 50.8a35 35 0 1 1 0-70 35 35 0 0 1 0 70Z"
                  >
                    <animateTransform
                      type="rotate"
                      attributeName="transform"
                      calcMode="spline"
                      dur="2"
                      values="0;120"
                      keyTimes="0;1"
                      keySplines="0 0 1 1"
                      repeatCount="indefinite"
                    ></animateTransform>
                  </path>
                </svg>
                Loading...
              </div>
            </div>
          )}

          <div
            onClick={() => {
              handleAddBunch(5000);
            }}
            className="mr-5 flex h-full rounded px-[8px] py-[4px] font-bold text-red-400 transition duration-200 hover:cursor-pointer hover:bg-slate-signin"
          >
            <div className="flex h-full flex-col justify-center">
              <GoPlus />
            </div>
            {isDesktop && (
              <div className="ml-[4px] flex h-full flex-col justify-center text-xs">
                Add 5k
              </div>
            )}
          </div>
          <div
            onClick={(e) => {
              e.stopPropagation();
              setFilterButton(false);
              setSortButton(false);
              setSearchButton(true);

              setTimeout(
                () => document.getElementById("searchInput")?.focus(),
                100,
              );
            }}
            className="relative flex justify-center"
          >
            <div className="flex flex-col justify-center pr-[16px] text-black opacity-70 hover:cursor-pointer hover:opacity-100">
              <PiMagnifyingGlass />
            </div>
            {searchbutton && (
              <div className="absolute right-[12px] top-[30px] flex w-[297px] justify-between border bg-white shadow-xl">
                <div className="m-[2px] flex flex-grow p-[8px]">
                  <input
                    id="searchInput"
                    onChange={(e) => {
                      handleSearchChange(e.target.value);
                    }}
                    className="h-[18px] w-full text-xs font-semibold text-black outline-none"
                    placeholder="Find in view"
                  ></input>
                </div>
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    setSearchKey("");
                    setSearchButton(false);
                  }}
                  className="flex flex-col justify-center px-[8px] text-sm text-slate-400 hover:cursor-pointer hover:text-black"
                >
                  <RxCross1 />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
