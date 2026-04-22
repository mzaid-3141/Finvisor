"use client";

import React from "react";
import { Badge } from "@/components/ui/Badge";

const riskConfig: Record<
  number,
  { label: string; color: "green" | "lime" | "yellow" | "orange" | "red" }
> = {
  1: { label: "Conservative", color: "green" },
  2: { label: "Mod. Conservative", color: "lime" },
  3: { label: "Balanced", color: "yellow" },
  4: { label: "Growth", color: "orange" },
  5: { label: "Aggressive", color: "red" },
};

interface RiskBadgeProps {
  level: number;
  showLevel?: boolean;
}

export function RiskBadge({ level, showLevel = true }: RiskBadgeProps) {
  const config = riskConfig[level] || { label: "Unknown", color: "gray" as const };
  return (
    <Badge color={config.color as "green" | "lime" | "yellow" | "orange" | "red"}>
      {showLevel ? `${level} - ` : ""}
      {config.label}
    </Badge>
  );
}
