import SearchIcon from "@/icons/searchIcon";

export const SearchInput = ({ className, onChange }: {
    className?: string,
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}
) => {
    return (
        <div className={`flex items-center rounded-full bg-white text-[#000000CC] border-2 border-[#A2A2A233] h-[35px] px-4  ${className}`}>
            <SearchIcon />
            <input
                type="search"
                placeholder="Search"
                className="w-full bg-transparent text-sm text-gray-700 outline-none placeholder-gray-400 focus:ring-0 pl-2 text-[rgba(0,0,0,0.80)] font-inter text-[20px] font-normal leading-normal"
                onChange={onChange}
            />
        </div>
    );
};