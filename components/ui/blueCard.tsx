'use client'
import { jarkata, jarkataBold } from '@/utils/fontfamilies';
import { ReactNode } from 'react';
import StarIcon from '@/icons/starIcon';

export const BlueCard = ({ icon, size, heading, items, customWidth, customHeight }: { 
    size: 'largeCard' | 'mediumCard' | 'smallCard' | 'smallResponsiveCard' | 'custom'  | 'xlargeCard', 
    icon: ReactNode, 
    heading: string, 
    items: string[],
    customWidth?: string,
    customHeight?: string
}) => {
    const sizeVariants = {
        xlargeCard: 'w-[551px] h-[437px] max-[989px]:w-full max-[989px]:h-full',
        largeCard: 'w-[531px] h-[324px] max-[989px]:w-full max-[989px]:h-full ',
        mediumCard: 'w-[369px] h-[407px] max-[989px]:w-full max-[989px]:h-full',
        smallCard: 'h-[358px] w-[319px] max-[989px]:w-full max-[989px]:h-full',
        smallResponsiveCard: 'h-[358px] w-[319px] max-xl:w-[531px] max-xl:h-[324px] max-[989px]:w-full max-[989px]:h-full  ',
        custom: `w-[${customWidth}] h-[${customHeight}] max-[989px]:w-full max-[989px]:h-full`,
    }

    const getSizeClass = () => {
        if (size === 'custom' && customWidth && customHeight) {
            return `w-[${customWidth}] h-[${customHeight}] max-[989px]:w-full max-[989px]:h-full`;
        }
        return sizeVariants[size];
    };

    return (
        <>
            <div className={` ${getSizeClass()}  max-[989px]:w-full max-[989px]:h-full flex flex-col bg-[#EEF1FC] p-[30px] gap-5 rounded-3xl`}
                style={{
                    fontFamily: jarkata.style.fontFamily
                }}
            >
                <span>  {icon}</span>
                <p className='text-[24px] font-medium' style={{ fontFamily: jarkataBold.style.fontFamily }}>{heading}</p>
                <span className='flex flex-col gap-2'>
                    {items.map((item, index) => (
                        <li key={index} className='flex items-center gap-2' style={{ fontFamily: jarkata.style.fontFamily }}>
                            <span >
                                <StarIcon />
                            </span>
                            <p>{item}</p>
                        </li>
                    ))}
                </span>
            </div>
        </>
    )
}