import { FaTable } from "react-icons/fa6";
import { IoCheckmark } from "react-icons/io5";

export function Views(){
    const views = [
        {
            'name':'Grid View',
            'id': 1
        }
    ]
    return(
        <div className="flex flex-col flex-grow  pt-[8px] py-[12px]">
            {views?.map((view) =>(
                <div key={view.id} className="bg-soft-blue rounded flex justify-between p-[8px] hover:cursor-pointer hover:bg-hover-view-blue">
                    <div className="flex">
                        <FaTable className="mr-2 text-blue-400"/>
                        <span className="text-xs font-medium">{view.name}</span>
                    </div>
                    <IoCheckmark/>
                </div>
            ))}
        </div>
    );
}