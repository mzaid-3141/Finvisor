"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { TrendingUp, DollarSign, Activity, PlusCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { getPortfolios } from "@/lib/api";
import { Portfolio } from "@/lib/types";
import { PortfolioCard } from "@/components/PortfolioCard";
import { Spinner } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/Button";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function formatDate(): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date());
}

interface StatCardProps {
  icon: React.ReactNode;
  value: string;
  label: string;
  gradient: string;
  iconBg: string;
}

function StatCard({ icon, value, label, gradient, iconBg }: StatCardProps) {
  return (
    <div
      className={`relative overflow-hidden bg-[#0d1526] border border-[#1e2d47] rounded-xl p-5 shadow-lg`}
    >
      <div
        className={`absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 -translate-y-8 translate-x-8 ${gradient}`}
      />
      <div className="relative flex items-start gap-4">
        <div className={`p-2.5 rounded-lg ${iconBg}`}>{icon}</div>
        <div>
          <p className="text-2xl font-bold text-[#f1f5f9] leading-tight">
            {value}
          </p>
          <p className="text-sm text-[#64748b] mt-0.5">{label}</p>
        </div>
      </div>
    </div>
  );
}

export default function CustomerDashboardPage() {
  const { user } = useAuth();
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPortfolios()
      .then(setPortfolios)
      .catch(() => setPortfolios([]))
      .finally(() => setLoading(false));
  }, []);

  const totalCapital = portfolios.reduce((sum, p) => sum + p.capital, 0);
  const avgRisk =
    portfolios.length > 0
      ? portfolios.reduce((sum, p) => sum + p.risk_level, 0) / portfolios.length
      : 0;

  const recentPortfolios = [...portfolios].slice(0, 4);

  const firstName = user?.name?.split(" ")[0] || "there";

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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#f1f5f9]">
          {getGreeting()},{" "}
          <span className="text-blue-400">{firstName}</span> 👋
        </h1>
        <p className="text-[#64748b] mt-1">{formatDate()}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard
          icon={<TrendingUp size={20} className="text-blue-400" />}
          value={String(portfolios.length)}
          label="Total Portfolios"
          gradient="bg-blue-500"
          iconBg="bg-blue-500/10"
        />
        <StatCard
          icon={<DollarSign size={20} className="text-emerald-400" />}
          value={formatCurrency(totalCapital)}
          label="Total Capital Invested"
          gradient="bg-emerald-500"
          iconBg="bg-emerald-500/10"
        />
        <StatCard
          icon={<Activity size={20} className="text-amber-400" />}
          value={avgRisk > 0 ? avgRisk.toFixed(1) : "—"}
          label="Avg Risk Level"
          gradient="bg-amber-500"
          iconBg="bg-amber-500/10"
        />
      </div>

      {/* Recent Portfolios */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-[#f1f5f9]">
          Recent Portfolios
        </h2>
        {portfolios.length > 0 && (
          <Link
            href="/dashboard/customer/portfolios"
            className="text-sm text-blue-400 hover:text-blue-300 transition-colors duration-200"
          >
            View all →
          </Link>
        )}
      </div>

      {portfolios.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-5">
            <TrendingUp size={36} className="text-blue-400" />
          </div>
          <h3 className="text-xl font-semibold text-[#f1f5f9] mb-2">
            No portfolios yet
          </h3>
          <p className="text-[#64748b] mb-6 max-w-sm">
            Create your first portfolio and let Finvisor automatically allocate
            your investments based on your risk profile.
          </p>
          <Link href="/dashboard/customer/portfolios/create">
            <Button variant="primary" size="lg">
              <PlusCircle size={18} />
              Create your first portfolio
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {recentPortfolios.map((portfolio) => (
            <PortfolioCard key={portfolio.id} portfolio={portfolio} />
          ))}
        </div>
      )}
    </div>
  );
}
