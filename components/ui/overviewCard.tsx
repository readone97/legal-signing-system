// import { Eye, PlusIcon, Table } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import React, { useState } from "react";
// import { useRouter } from "next/router";
// import { SearchInput } from "@/components/ui/searchinput";
// import { Status } from "@/components/ui/status";
// import { TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
// import { Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectLabel, SelectItem } from "@radix-ui/react-select";
// import Image from "next/image";

// export type Card = {
//     title: string;
//     count: number | string | undefined; 
//     Icon: React.ComponentType;
// }

// // Payment History data type
// type PaymentRecord = {
//     date: string;
//     expenses: string;
//     paymentType: string;
//     amount: string;
//     status: "Pending" | "Completed" | "Failed";
// }

// const OverviewCard = ({ cards, text, griddCols, className, subtext, sidebutton, buttonText, onClick, buttonIcon }: { buttonIcon?: React.ComponentType , sidebutton?: boolean, subtext?: string, cards: Card[], text: string, buttonText?: string, griddCols?: string, className: string, onClick?: () => void }) => {
//     // Sample payment data
//     const paymentData: PaymentRecord[] = [
//         {
//             date: "25 February, 2025",
//             expenses: "School Fee",
//             paymentType: "Partial Payment",
//             amount: "₦50,000",
//             status: "Pending"
//         },
//         {
//             date: "25 February, 2025",
//             expenses: "School Fee",
//             paymentType: "Partial Payment",
//             amount: "₦50,000",
//             status: "Pending"
//         }
//     ];
//     const [currentPage, setCurrentPage] = useState(1);
//     const [search, setSearch] = useState("")
//         const [debouncedSearch, setDebouncedSearch] = useState("")
     
//         const [category, setCategory] = useState("")
//     const totalPages = 10;

//     return (
//         <div className={`bg-white rounded-[8px] max-sm:py-[25px] max-sm:px-[30px] min-h-[600px] ${className}`}>
//             <div className="flex flex-col gap-[15px]">
//                 <span className="flex justify-between items-center flex-wrap gap-3">
//                     <div className=" items-center gap-2 ">
//                         <p className="font-inter font-semibold text-lg capitalize">{text}</p>
//                         {subtext && <p className="font-inter text-sm text-[#424242]">{subtext}</p>}
//                     </div>
//                     {sidebutton && <Button variant="primary" className="rounded-full px-4 py-2 text-xs font-semibold flex items-center gap-3" onClick={onClick}>
//                        {buttonIcon ? React.createElement(buttonIcon) : <PlusIcon />} 
//                         {buttonText}
//                     </Button>}
//                 </span>
//                 <div className={`grid auto-rows-min gap-4 md:grid-cols-${griddCols ? griddCols : 3}`}>
//                     {cards.map(({ title, count, Icon }, index) => (
//                         <div
//                             key={index}
//                             className="rounded-xl bg-[#F9F9F9] border border-[#C2C2C280] h-[120px] flex items-center p-[25px]"
//                         >
//                             <div className="flex items-center gap-[15px]">
//                                 <Icon />
//                                 <div>
//                                     <p className="font-inter font-semibold text-xs text-[#62646A]">
//                                         {title}
//                                     </p>
//                                     <p className="font-inter text-xl font-bold text-[#404145]">
//                                         {count || 0}
//                                     </p>
//                                 </div>
//                             </div>
//                         </div>
//                     ))}
//                 </div>

//                 {/* Payment History Section */}
//                 <div className="mt-8">
//                     <div className="flex flex-col gap-4">
//                         <div className="flex items-center justify-between">
//                             <h3 className="font-inter font-semibold text-lg">Payment History</h3>
//                         </div>
                        
//                         {/* Filters and Search */}
//                         <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
//                             <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
//                                 <span className="font-inter font-semibold text-sm">Sort by:</span>
                                
//                                 <Select>
//                                     <SelectTrigger className="w-[140px] border rounded-[102px] h-[35px]">
//                                         <SelectValue placeholder="Payment Type" />
//                                     </SelectTrigger>
//                                     <SelectContent>
//                                         <SelectGroup>
//                                             <SelectLabel>Payment Type</SelectLabel>
//                                             <SelectItem value="all">All</SelectItem>
//                                             <SelectItem value="partial">Partial Payment</SelectItem>
//                                             <SelectItem value="full">Full Payment</SelectItem>
//                                         </SelectGroup>
//                                     </SelectContent>
//                                 </Select>
                                
//                                 <Select>
//                                     <SelectTrigger className="w-[120px] border rounded-[102px] h-[35px]">
//                                         <SelectValue placeholder="Status" />
//                                     </SelectTrigger>
//                                     <SelectContent>
//                                         <SelectGroup>
//                                             <SelectLabel>Status</SelectLabel>
//                                             <SelectItem value="all">All</SelectItem>
//                                             <SelectItem value="pending">Pending</SelectItem>
//                                             <SelectItem value="completed">Completed</SelectItem>
//                                             <SelectItem value="failed">Failed</SelectItem>
//                                         </SelectGroup>
//                                     </SelectContent>
//                                 </Select>
//                             </div>
                            
//                             <div className="w-full sm:w-auto min-w-[220px]">
//                                 <SearchInput />
//                             </div>
//                         </div> 

//                         {/* Payment History Table */}
//                      <div className="rounded-2xl bg-white p-4 shadow-[0px_0px_19px_rgba(0,0,0,0.02)] w-full">
//                             <Table className="overflow-auto">
//                                 <TableHeader>
//                                     <TableRow className="rounded-[8px] bg-[#F9F9F9] border-none uppercase font-inter text-[#424242] font-medium text-xs">
//                                         <TableHead className="rounded-l-[8px]">Date</TableHead>
//                                         <TableHead>Expenses</TableHead>
//                                         <TableHead>Payment Type</TableHead>
//                                         <TableHead>Amount</TableHead>
//                                         <TableHead>Status</TableHead>
//                                         <TableHead className="rounded-r-[8px]">Action</TableHead>
//                                     </TableRow>
//                                 </TableHeader>
//                                 <TableBody>
//                                     {paymentData.map((payment, idx) => (
//                                         <TableRow key={idx} className="capitalize font-inter font-normal text-sm bg-white">
//                                             <TableCell className="font-medium">{payment.date}</TableCell>
//                                             <TableCell className="font-medium">{payment.expenses}</TableCell>
//                                             <TableCell className="font-medium">{payment.paymentType}</TableCell>
//                                             <TableCell className="font-medium">{payment.amount}</TableCell>
//                                             <TableCell className="font-medium">
//                                                 <Status status={payment.status.toLowerCase() as any} />
//                                             </TableCell>
//                                             <TableCell className="font-medium">
//                                                 <Eye className="w-4 h-4 cursor-pointer text-gray-600 hover:text-gray-800" />
//                                             </TableCell>
//                                         </TableRow>
//                                     ))}
//                                 </TableBody>
//                             </Table>
//                         </div> 
//                          {/*  table section */}
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default OverviewCard;


import {  PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import React from "react";

import { SearchInput } from "@/components/ui/searchinput";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectLabel, SelectItem } from "@radix-ui/react-select";


export type Card = {
    title: string;
    count: number | string | undefined; 
    Icon: React.ComponentType;
}

// Payment History data type
// type PaymentRecord = {
//     date: string;
//     expenses: string;
//     paymentType: string;
//     amount: string;
//     status: "Pending" | "Completed" | "Failed";
// }

const OverviewCard = ({ cards, text, griddCols, className, subtext, sidebutton, buttonText, onClick, buttonIcon }: { buttonIcon?: React.ComponentType , sidebutton?: boolean, subtext?: string, cards: Card[], text: string, buttonText?: string, griddCols?: string, className: string, onClick?: () => void }) => {
    // Sample payment data
    // const paymentData: PaymentRecord[] = [
    //     {
    //         date: "25 February, 2025",
    //         expenses: "School Fee",
    //         paymentType: "Partial Payment",
    //         amount: "₦50,000",
    //         status: "Pending"
    //     },
    //     {
    //         date: "25 February, 2025",
    //         expenses: "School Fee",
    //         paymentType: "Partial Payment",
    //         amount: "₦50,000",
    //         status: "Pending"
    //     }
    // ];
    // const [currentPage, setCurrentPage] = useState(1);
    // const [search, setSearch] = useState("")
    // const [debouncedSearch, setDebouncedSearch] = useState("")
    // const [category, setCategory] = useState("")
    // const totalPages = 10;

    return (
        <div className={`bg-white rounded-[8px] max-sm:py-[25px] max-sm:px-[30px] min-h-[600px] ${className}`}>
            <div className="flex flex-col gap-[15px]">
                <span className="flex justify-between items-center flex-wrap gap-3">
                    <div className=" items-center gap-2 ">
                        <p className="font-inter font-semibold text-lg capitalize">{text}</p>
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

                {/* Payment History Section */}
                <div className="mt-8">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-inter font-semibold text-lg">Payment History</h3>
                        </div>
                        
                        {/* Filters and Search */}
                        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                                <span className="font-inter font-semibold text-sm">Sort by:</span>
                                
                                <Select>
                                    <SelectTrigger className="w-[140px] border rounded-[102px] h-[35px]">
                                        <SelectValue placeholder="Payment Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>Payment Type</SelectLabel>
                                            <SelectItem value="all">All</SelectItem>
                                            <SelectItem value="partial">Partial Payment</SelectItem>
                                            <SelectItem value="full">Full Payment</SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                
                                <Select>
                                    <SelectTrigger className="w-[120px] border rounded-[102px] h-[35px]">
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>Status</SelectLabel>
                                            <SelectItem value="all">All</SelectItem>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="completed">Completed</SelectItem>
                                            <SelectItem value="failed">Failed</SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>
                            
                            <div className="w-full sm:w-auto min-w-[220px]">
                                <SearchInput />
                            </div>
                        </div> 

                        {/* Payment History Table with Horizontal Scroll */}
                        {/* <div className="rounded-2xl bg-white p-4 shadow-[0px_0px_19px_rgba(0,0,0,0.02)] w-full">
                            
                             <div className="w-full overflow-x-auto">
                                <Table className="w-full min-w-[400px]">
                                    <TableHeader>
                                        <TableRow className="rounded-[8px] bg-[#F9F9F9] border-none uppercase font-inter text-[#424242] font-medium text-xs">
                                            <TableHead className="rounded-l-[8px] min-w-[120px]">Date</TableHead>
                                            <TableHead className="min-w-[100px]">Expenses</TableHead>
                                            <TableHead className="min-w-[120px]">Payment Type</TableHead>
                                            <TableHead className="min-w-[100px]">Amount</TableHead>
                                            <TableHead className="min-w-[100px]">Status</TableHead>
                                            <TableHead className="rounded-r-[8px] min-w-[80px]">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {paymentData.map((payment, idx) => (
                                            <TableRow key={idx} className="capitalize font-inter font-normal text-sm bg-white">
                                                <TableCell className="font-medium min-w-[120px]">{payment.date}</TableCell>
                                                <TableCell className="font-medium min-w-[100px]">{payment.expenses}</TableCell>
                                                <TableCell className="font-medium min-w-[120px]">{payment.paymentType}</TableCell>
                                                <TableCell className="font-medium min-w-[100px]">{payment.amount}</TableCell>
                                                <TableCell className="font-medium min-w-[100px]">
                                                    <Status status={payment.status.toLowerCase() as any} />
                                                </TableCell>
                                                <TableCell className="font-medium min-w-[80px]">
                                                    <Eye className="w-4 h-4 cursor-pointer text-gray-600 hover:text-gray-800" />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div> 
                        </div> */}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OverviewCard;