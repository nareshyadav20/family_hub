import React from "react"
import { cn } from "@/utils/cn"

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-11 w-full rounded-[16px] border border-[#E9E5F8] bg-white px-4 py-2 text-[15px] font-semibold text-[#1F2430] placeholder:text-[#6B7280]/60 transition-all focus:outline-none focus:border-[#7C5CFC] focus:ring-2 focus:ring-[#7C5CFC]/10 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Input.displayName = "Input"

export { Input }
