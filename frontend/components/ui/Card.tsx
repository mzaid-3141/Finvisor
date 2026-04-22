"use client";

import React from "react";
import { clsx } from "clsx";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  header?: React.ReactNode;
  onClick?: () => void;
}

export function Card({ children, className, header, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={clsx(
        "bg-[#0d1526] border border-[#1e2d47] rounded-xl shadow-lg",
        onClick && "cursor-pointer hover:border-blue-500 transition-all duration-200",
        className
      )}
    >
      {header && (
        <div className="px-5 py-4 border-b border-[#1e2d47]">{header}</div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}
