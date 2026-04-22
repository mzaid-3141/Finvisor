"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { PlusCircle, Briefcase } from "lucide-react";
import { getPortfolios } from "@/lib/api";
import { Portfolio } from "@/lib/types";
import { PortfolioCard } from "@/components/PortfolioCard";
import { Spinner } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/Button";

export default function PortfoliosPage() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPortfolios()
      .then(setPortfolios)
      .catch(() => setPortfolios([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#f1f5f9]">My Portfolios</h1>
          <p className="text-[#64748b] mt-1">
            {portfolios.length} portfolio{portfolios.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <Link href="/dashboard/customer/portfolios/create">
          <Button variant="primary">
            <PlusCircle size={16} />
            Create Portfolio
          </Button>
        </Link>
      </div>

      {portfolios.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-5">
            <Briefcase size={36} className="text-blue-400" />
          </div>
          <h3 className="text-xl font-semibold text-[#f1f5f9] mb-2">
            No portfolios yet
          </h3>
          <p className="text-[#64748b] mb-6 max-w-sm">
            Create your first investment portfolio and let Finvisor
            automatically allocate your capital based on your risk appetite.
          </p>
          <Link href="/dashboard/customer/portfolios/create">
            <Button variant="primary" size="lg">
              <PlusCircle size={18} />
              Create Portfolio
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {portfolios.map((portfolio) => (
            <PortfolioCard key={portfolio.id} portfolio={portfolio} />
          ))}
        </div>
      )}
    </div>
  );
}
