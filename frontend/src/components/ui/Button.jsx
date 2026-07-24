import React from 'react';
import { cn } from '@/utils/cn';

export function Button({ className, variant = "default", size = "default", ...props }) {
  const baseStyled = "inline-flex items-center justify-center font-semibold transition-all duration-200 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 active:scale-95";
  const variants = {
    default: "bg-[#7C5CFC] text-white shadow-md shadow-[#7C5CFC]/20 hover:bg-[#6B49F6] rounded-[16px]",
    destructive: "bg-[#EF5350]/10 text-[#EF5350] hover:bg-[#EF5350]/20 rounded-[16px]",
    outline: "border-2 border-[#7C5CFC] bg-white text-[#7C5CFC] hover:bg-[#FAF8FF] rounded-[16px]",
    secondary: "bg-[#FAF8FF] border border-[#E9E5F8] text-[#7C5CFC] hover:bg-[#EEE8FF] rounded-[16px]",
    ghost: "bg-transparent text-[#6B7280] hover:bg-[#FAF8FF] hover:text-[#7C5CFC] rounded-[16px]",
    link: "text-[#7C5CFC] underline-offset-4 hover:underline",
    success: "bg-[#2EB67D]/10 text-[#2EB67D] hover:bg-[#2EB67D]/20 rounded-[16px]"
  };
  const sizes = {
    default: "h-11 px-6 text-[15px]",
    sm: "h-9 rounded-[12px] px-4 text-[13px]",
    lg: "h-12 rounded-[18px] px-8 text-[16px]",
    icon: "h-10 w-10 rounded-full",
  };

  return (
    <button
      className={cn(baseStyled, variants[variant], sizes[size], className)}
      {...props}
    />
  );
}
