import { JsonValue } from "@prisma/client/runtime/library";

interface filterSchema {
  id: string;
  value?: unknown;
}
interface sortSchema {
  id: string;
  desc: boolean;
}

interface RowData {
  values: JsonValue;
  id: number | string;
}

export const applyFilter = (
  data: RowData[],
  filters: filterSchema[],
  sorts: sortSchema[],
  columns_id: string[],
): JsonValue[] => {
  return data
    .filter((row) => {
      if (row.values == null) return false;
      for (const filter of filters) {
        if (filter.id === "Search") {
          let flag = false;

          for (const id of columns_id) {
            if (
              String(row.values[id as keyof object])
                .toLowerCase()
                .includes(String(filter.value).toLowerCase())
            ) {
              flag = true;
            }
          }

          if (!flag) return false
        }
      }
      for (const filter of filters) {
        if(filter.id === "Search") continue;
        const temp = String(filter.value).split("_");
        const filterKey = temp[0];
        const filterVal = temp[1];
        const val = String(row.values[filter.id as keyof object]);

        if (filterKey === "Empty") {
          if (!(val === "undefined" || val === "")) {
            return false;
          }
        } else if (filterKey === "Not Empty") {
          if (val === "undefined" || val === "") {
            return false;
          }
        }
        if (filterVal === undefined || filterVal === "") {
          return true;
        }
        if (filterKey === "Contain") {
          if (!val.toLowerCase().includes(filterVal.toLowerCase())) {
            return false;
          }
        } else if (filterKey === "Not Contain") {
          if (val.toLowerCase().includes(filterVal.toLowerCase())) {
            return false;
          }
        } else if (filterKey === "Is") {
          if (!(val === filterVal)) {
            return false;
          }
        } else if (filterKey === "Is Not") {
          if (val === filterVal) {
            return false;
          }
        } else if (filterKey === "Equal") {
          if (!(val === filterVal)) {
            return false;
          }
        } else if (filterKey === "Not Equal") {
          if (val === filterVal) {
            return false;
          }
        } else if (filterKey === "Greater Than") {
          if (!(parseFloat(val) > parseFloat(filterVal))) {
            return false;
          }
        } else if (filterKey === "Less Than") {
          if (!(parseFloat(val) < parseFloat(filterVal))) {
            return false;
          }
        } else if (filterKey === "Less Than Or Equal") {
          if (!(parseFloat(val) <= parseFloat(filterVal))) {
            return false;
          }
        } else if (filterKey === "Greater Than Or Equal") {
          if (!(parseFloat(val) >= parseFloat(filterVal))) {
            return false;
          }
        }
      }
      return true;
    })
    .sort((x, y) => {
      if (x.values == null || y.values == null) return 0;
      for (const sort of sorts) {
        if (sort.id === "") return 0;
        if (
          x.values[sort.id as keyof object] === undefined ||
          String(x.values[sort.id as keyof object]) === ""
        )
          return 1;
        if (
          y.values[sort.id as keyof object] === undefined ||
          String(y.values[sort.id as keyof object]) === ""
        )
          return -1;
        if (
          x.values[sort.id as keyof object] > y.values[sort.id as keyof object]
        ) {
          return sort.desc ? -1 : 1;
        }
        if (
          x.values[sort.id as keyof object] < y.values[sort.id as keyof object]
        ) {
          return sort.desc ? 1 : -1;
        }
      }
      return 0;
    })
    .map((row) => ({ rowId: row.id, ...Object(row.values) }) as JsonValue);
};

export const checkValidFieldName = (
  existingNames: string[],
  newName: string,
): boolean => {
  if (!newName.trim()) {
    return false;
  }

  const lower = existingNames.map((name) => name.toLowerCase());
  return !lower.includes(newName.toLowerCase());
};

export const nextDefaultName = (existingNames: string[]): string => {
  let maxLabelIndex = 1;
  existingNames.forEach((name) => {
    const parts = name.split(" ");
    if (parts[0] === "Label" && parts.length === 2 && parts[1] !== undefined) {
      const index = parseInt(parts[1], 10);
      if (!isNaN(index) && maxLabelIndex < index) {
        maxLabelIndex = index;
      }
    }
  });
  return `Label ${maxLabelIndex + 1}`;
};
