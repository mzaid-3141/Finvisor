"use client";

import React from "react";
import { clsx } from "clsx";

type BadgeColor =
  | "blue"
  | "green"
  | "lime"
  | "yellow"
  | "orange"
  | "red"
  | "purple"
  | "teal"
  | "amber"
  | "gray";

interface BadgeProps {
  children: React.ReactNode;
  color?: BadgeColor;
  className?: string;
}

const colorClasses: Record<BadgeColor, string> = {
  blue: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  green: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  lime: "bg-lime-500/20 text-lime-400 border-lime-500/30",
  yellow: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  orange: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  red: "bg-red-500/20 text-red-400 border-red-500/30",
  purple: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  teal: "bg-teal-500/20 text-teal-400 border-teal-500/30",
  amber: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  gray: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

export function Badge({ children, color = "blue", className }: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        colorClasses[color],
        className
      )}
    >
      {children}
    </span>
  );
}
