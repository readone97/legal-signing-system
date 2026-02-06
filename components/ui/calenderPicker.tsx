"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"


export function DatePicker({ onDateChange , dateString, className}: { onDateChange: (date: string) => void , dateString:string, className?:string}) {
  const [date, setDate] = React.useState<Date | undefined>();

  const handleDateChange = (selectedDate?: Date) => {
    setDate(selectedDate);
    if (selectedDate) {
      onDateChange(format(selectedDate, "yyyy-MM-dd")); // Formats date for API query
    }
  };

  return (
    <Popover>
      <PopoverTrigger className=" " asChild>
        <Button
          variant="outline"
          className={cn(
            `w-full justify-start text-left shadow-sm rounded-xl font-semibold",
            !date && "text-muted-foreground ${className}`
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>{dateString}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onDayTouchStart={()=>new Date()}
          onSelect={handleDateChange}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
