import { RiArrowDownSLine } from "react-icons/ri"

const tables = [
{
    'name':"Table 1",
    'id': 1,
},
]

export function TableList(){
    return <div className="flex space-x-5 ">
        {tables?.map((table) =>(
          <div key={table.id} className="px-[12px] py-2 bg-white rounded-t text-black flex justify-center shadow-sm hover:cursor-pointer">
            <p className="font-medium text-xs mr-1">{table.name}</p>
            <div className="flex flex-col justify-center"><RiArrowDownSLine /></div>
            
          </div>
      ))}
    </div>
}