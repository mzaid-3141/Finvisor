"use client";

import React from "react";
import { Badge } from "@/components/ui/Badge";
import { Asset } from "@/lib/types";

type AssetType = Asset["asset_type"];

const typeConfig: Record<
  AssetType,
  { color: "blue" | "green" | "amber" | "purple" | "teal" }
> = {
  Stock: { color: "blue" },
  Bond: { color: "green" },
  "Real Estate": { color: "amber" },
  Crypto: { color: "purple" },
  "Fixed Deposit": { color: "teal" },
};

interface AssetTypeBadgeProps {
  type: AssetType;
}

export function AssetTypeBadge({ type }: AssetTypeBadgeProps) {
  const config = typeConfig[type] || { color: "gray" as const };
  return <Badge color={config.color}>{type}</Badge>;
}
