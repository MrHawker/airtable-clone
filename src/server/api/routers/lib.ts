import { JsonValue } from "@prisma/client/runtime/library";

interface filterSchema {
    id:string;
    value?:unknown;
}
interface sortSchema {
    id: string;
    desc:boolean;
}

interface RowData {
    values: JsonValue;
    id: number | string;
    
}

export const applyFilter = (data: RowData[],filters: filterSchema[],sorts:sortSchema[]): JsonValue[] => {
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
                if(x.values[sort.id as keyof object] === undefined || String(x.values[sort.id as keyof object]) === "") return 1
                if(y.values[sort.id as keyof object] === undefined || String(y.values[sort.id as keyof object]) === "") return -1
                if(x.values[sort.id as keyof object] > y.values[sort.id as keyof object]){
                    return sort.desc ? -1 : 1
                }
                if(x.values[sort.id as keyof object] < y.values[sort.id as keyof object]){
                    return sort.desc ? 1 : -1
                }
            }
            return 0;
        })
        .map((row) => ({ rowId: row.id, ...Object(row.values) }) as JsonValue)
        ;
};

export const checkValidFieldName = (existingNames: string[], newName: string): boolean => {
    if (!newName.trim()) {
      return false;
    }

    const lower = existingNames.map(name => name.toLowerCase());
    return !lower.includes(newName.toLowerCase());

};

export const nextDefaultName = (existingNames:string[]) : string =>{
    let maxLabelIndex = 1
    existingNames.forEach((name) => {
        const parts = name.split(" ");
        if (parts[0] === "Label" && parts.length === 2 && parts[1] !== undefined)  {
            const index = parseInt(parts[1], 10);
            if (!isNaN(index) && maxLabelIndex < index) {
                maxLabelIndex = index
            }
        }
    });
    return `Label ${maxLabelIndex+1}`;
}