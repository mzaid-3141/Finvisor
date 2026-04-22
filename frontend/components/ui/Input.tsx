"use client";

import React from "react";
import { clsx } from "clsx";

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "prefix"> {
  label?: string;
  error?: string;
  prefix?: React.ReactNode;
}

export function Input({
  label,
  error,
  prefix,
  className,
  id,
  ...props
}: InputProps) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-[#f1f5f9]"
        >
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {prefix && (
          <span className="absolute left-3 text-[#64748b] text-sm select-none pointer-events-none">
            {prefix}
          </span>
        )}
        <input
          id={inputId}
          className={clsx(
            "w-full bg-[#111827] border rounded-lg px-3 py-2.5 text-sm text-[#f1f5f9] placeholder-[#64748b] outline-none transition-all duration-200",
            "focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
            error ? "border-red-500" : "border-[#1e2d47]",
            prefix ? "pl-8" : "",
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
