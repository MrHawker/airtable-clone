export function BaseCards(){
    return (
        <div className="flex flex-wrap gap-2">
            <div className="p-4 flex border-2 rounded-md bg-white flex-grow md:basis-1/2 lg:basis-1/4 md:flex-none shadow-sm hover:shadow-md hover:cursor-pointer">
                <div className="h-full p-4 text-xl text-center bg-card-brown text-white rounded-xl">
                    Un
                </div>
                <div className="flex flex-col justify-center ml-4">
                    <p className="font-medium text-sm mr-3 mb-2">Untitled Base</p>
                    <p className="text-xs mr-3 text-slate-500">Base</p>
                </div>
            </div>
            
        </div>
        
    );
}