"use client";

import React from "react";
import Link from "next/link";
import { DollarSign, Layers, ArrowRight } from "lucide-react";
import { Portfolio } from "@/lib/types";
import { RiskBadge } from "@/components/RiskBadge";

interface PortfolioCardProps {
  portfolio: Portfolio;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function PortfolioCard({ portfolio }: PortfolioCardProps) {
  const allocationCount = portfolio.allocations?.length ?? 0;

  return (
    <div className="group bg-[#0d1526] border border-[#1e2d47] hover:border-blue-500 rounded-xl p-5 shadow-lg transition-all duration-200 flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-[#64748b] font-medium uppercase tracking-wider mb-1">
            Portfolio
          </p>
          <h3 className="text-lg font-bold text-[#f1f5f9]">
            {portfolio.name || `#${portfolio.id}`}
          </h3>
        </div>
        <RiskBadge level={portfolio.risk_level} />
      </div>

      <div className="flex items-center gap-2">
        <div className="p-2 rounded-lg bg-blue-500/10">
          <DollarSign size={18} className="text-blue-400" />
        </div>
        <div>
          <p className="text-xs text-[#64748b]">Capital</p>
          <p className="text-xl font-bold text-[#f1f5f9]">
            {formatCurrency(portfolio.capital)}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm text-[#64748b]">
        <Layers size={15} />
        <span>{allocationCount} allocation{allocationCount !== 1 ? "s" : ""}</span>
      </div>

      <Link
        href={`/dashboard/customer/portfolios/${portfolio.id}`}
        className="mt-auto inline-flex items-center justify-between w-full px-4 py-2.5 rounded-lg bg-[#111827] hover:bg-blue-500/10 border border-[#1e2d47] hover:border-blue-500 text-sm text-[#f1f5f9] font-medium transition-all duration-200 group"
      >
        <span>View Details</span>
        <ArrowRight size={16} className="text-[#64748b] group-hover:text-blue-400 transition-colors duration-200" />
      </Link>
    </div>
  );
}
