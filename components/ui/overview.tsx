import { PlusIcon } from "lucide-react";
import { Button } from "./button";
import React from "react";


export type Card = {
    title: string;
    count: number | string | undefined; 
    Icon: React.ComponentType;
}


const Overview = ({ cards, text, griddCols, className, subtext, sidebutton, buttonText, onClick, buttonIcon }: { buttonIcon?: React.ComponentType , sidebutton?: boolean, subtext?: string, cards: Card[], text: string, buttonText?: string, griddCols?: string, className: string, onClick?: () => void }) => {
    return (
        <div className={`bg-white rounded-[8px] max-sm:py-[25px] max-sm:px-[30px]  ${className}`}>
            <div className="flex flex-col gap-[15px]">
                <span className="flex justify-between items-center flex-wrap gap-3">
                    <div className=" items-center gap-2 ">
                        <p className="font-inter font-medium text-lg capitalize">{text}</p>
                        {subtext && <p className="font-inter text-sm text-[#424242]">{subtext}</p>}
                    </div>
                    {sidebutton && <Button variant="primary" className="rounded-full px-4 py-2 text-xs font-semibold flex items-center gap-3" onClick={onClick}>
                       {buttonIcon ? React.createElement(buttonIcon) : <PlusIcon />} 
                        {buttonText}
                    </Button>}
                </span>
                <div className={`grid auto-rows-min gap-4 md:grid-cols-${griddCols ? griddCols : 3}`}>
                    {cards.map(({ title, count, Icon }, index) => (
                        <div
                            key={index}
                            className="rounded-xl bg-[#F9F9F9] border border-[#C2C2C280] h-[120px] flex items-center p-[25px]"
                        >
                            <div className="flex items-center gap-[15px]">
                                <Icon />
                                <div>
                                    <p className="font-inter font-semibold text-xs text-[#62646A]">
                                        {title}
                                    </p>
                                    <p className="font-inter text-xl font-bold text-[#404145]">
                                        {count || 0}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Overview;
