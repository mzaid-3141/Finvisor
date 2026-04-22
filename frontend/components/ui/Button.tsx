"use client";

import React from "react";
import { clsx } from "clsx";
import { Spinner } from "./Spinner";

type Variant = "primary" | "secondary" | "danger" | "ghost";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  children: React.ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-blue-500 hover:bg-blue-600 text-white border border-blue-500 hover:border-blue-600",
  secondary:
    "bg-transparent hover:bg-[#1e2d47] text-[#f1f5f9] border border-[#1e2d47] hover:border-blue-500",
  danger:
    "bg-red-500 hover:bg-red-600 text-white border border-red-500 hover:border-red-600",
  ghost:
    "bg-transparent hover:bg-[#1e2d47] text-[#64748b] hover:text-[#f1f5f9] border border-transparent",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm rounded-md",
  md: "px-4 py-2 text-sm rounded-lg",
  lg: "px-6 py-3 text-base rounded-lg",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  children,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={clsx(
        "inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {loading && <Spinner size="sm" />}
      {children}
    </button>
  );
}
