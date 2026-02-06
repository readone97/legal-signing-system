'use client'
import React from "react";
import "react-datepicker/dist/react-datepicker.css";
import { Control, Controller, FieldValues, Path, PathValue } from "react-hook-form";


interface CalendarDropdownProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  placeholderText?: string;
  className?: string;
  defaultValue?: PathValue<T, Path<T>>;
}


const CalendarDropdown = <T extends FieldValues>({
  control,
  name,
  placeholderText,
  className,
  defaultValue,
}: CalendarDropdownProps<T>) => {

  return (
    <Controller
      name={name}
      control={control}
      defaultValue={defaultValue ?? "" as PathValue<T, Path<T>>}
      render={({ field }) => (
        <input
          type="date"
          {...field}
          className={`w-full px-4 py-2 border rounded-xl shadow-sm font-semibold ${className}`}
          placeholder={placeholderText || "Select a date"}
        />
      )}
    />
  );
};


export default CalendarDropdown;
