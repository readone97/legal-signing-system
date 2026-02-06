

export const Status = ({ status }: { status: string }) => {
  return (
    <div
      className={`flex py-1 px-4 rounded-full capitalize gap-2 w-fit items-center
          ${(status.toLowerCase() === "present" || status.toLowerCase() === "active" || status.toLocaleLowerCase() === "approved" || status.toLocaleLowerCase() === "completed" || status.toLocaleLowerCase() === "successful") && "bg-[#E9FFEF] text-[#409261]"}
          ${status.toLowerCase() === "absent" && "bg-[#FFEAEB] text-error"}
          ${status.toLowerCase() === "disabled" && "bg-[#FFEAEB] text-error"}
          ${status.toLowerCase() === "suspended" && "bg-[#FFEAEB] text-error"}
          ${status.toLowerCase() === "rejected" && "bg-[#FFEAEB] text-error"}
          ${status.toLowerCase() === "leave" && "bg-[#E0F0FF] text-[#007BFF]"}
          ${status.toLowerCase() === "pending" && "bg-[#FFE7DA] text-[#DF6420]"}
        `}
    >
      <div
        className={`rounded-full w-2 h-2
            ${(status.toLowerCase() === "present" || status.toLowerCase() === "active" || status.toLocaleLowerCase() === "approved" || status.toLocaleLowerCase() === "completed" || status.toLocaleLowerCase() === "successful") && "bg-[#409261]"}
            ${status.toLowerCase() === "absent" && "bg-error"}
            ${status.toLowerCase() === "disabled" && "bg-error"}
            ${status.toLowerCase() === "suspended" && "bg-error"}
            ${status.toLowerCase() === "rejected" && "bg-error"}
            ${status.toLowerCase() === "leave" && "bg-[#007BFF]"}
            ${status.toLowerCase() === "pending" && "bg-[#DF6420]"}
          `}
      ></div>
      {status}
    </div>
  );
};
