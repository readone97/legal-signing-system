import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import DeleteIcon from "@/icons/deleteIcon";
import ThreeDotsIcon from "@/icons/threeDotsIcon";
import React from "react";



interface EditAndDeletePopProps {
    deleteitem: string;
    onDelete: (id: string) => void;
    editModal?: React.JSX.Element;
}

export const EditAndDeletePop = ({ deleteitem, onDelete, editModal }: EditAndDeletePopProps) => {
    return (
        <Popover>
            <PopoverTrigger>
                <ThreeDotsIcon />
            </PopoverTrigger>
            <PopoverContent className="w-full flex flex-col gap-5 p-2 rounded-lg bg-white ">
                {editModal}
                <span className="flex gap-2 items-center hover:bg-white cursor-pointer text-[#C81720]" onClick={() => onDelete(deleteitem)}>
                    <DeleteIcon />
                    <p>Delete</p>
                </span>
            </PopoverContent>
        </Popover>
    )
}