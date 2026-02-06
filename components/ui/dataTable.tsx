'use client'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Status } from "@/components/ui/status"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";
import { useState, useMemo } from "react";

interface Column<T> {
  header: string;
  accessor: keyof T;
  isStatus?: boolean;
  cell?: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  pageSize?: number;
}

const DataTable = <T,>({ columns, data, pageSize = 5 }: DataTableProps<T>) => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(data.length / pageSize);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return data.slice(start, end);
  }, [currentPage, data, pageSize]);

  return (
    <>
      <div className="rounded-2xl bg-white p-4 shadow-[0px_0px_19px_rgba(0,0,0,0.02)] w-full max-md:w-[330px] mt-5">
        <Table className="overflow-auto">
          <TableHeader>
            <TableRow className="rounded-[8px] bg-[#F9F9F9] border-none uppercase font-inter text-[#424242] font-medium text-xs">
              {columns.map((col, idx) => (
                <TableHead key={idx} className={idx === 0 ? "rounded-l-[8px]" : ""}>
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {paginatedData.map((row, i) => (
              <TableRow key={i} className="capitalize font-inter font-normal text-sm">
                {columns.map((col, ci) => {
                  const accessor = row[col.accessor];

                  return (
                    <TableCell key={ci} className={ci === 0 ? "font-medium" : ""}>
                      {col.cell
                        ? col.cell(row)
                        : col.isStatus
                          ? <Status status={String(accessor)} />
                          : String(accessor)}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="w-full py-4">
        <div className="flex justify-end items-center gap-4">
          <span className="text-gray-700">Page</span>
          <Select value={`${currentPage}`} onValueChange={(value) => setCurrentPage(Number(value))}>
            <SelectTrigger className="bg-primary rounded-[8px] text-white w-max gap-2">
              <SelectValue>{currentPage}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: totalPages }, (_, i) => (
                <SelectItem key={i + 1} value={`${i + 1}`}>
                  {i + 1}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-gray-700">of {totalPages}</span>
        </div>
      </div>
    </>
  );
};

export default DataTable;
