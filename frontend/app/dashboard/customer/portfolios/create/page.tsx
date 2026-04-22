"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, DollarSign } from "lucide-react";
import { createPortfolio } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { ToastContainer } from "@/components/ui/Toast";
import { useToast } from "@/components/ui/useToast";
import { clsx } from "clsx";

const riskLevels = [
  {
    level: 1,
    label: "Conservative",
    shortLabel: "Conserv.",
    description: "Low risk, stable returns. Focus on bonds and fixed deposits.",
    color: "emerald",
    gradient: "from-emerald-500/20 to-emerald-500/5",
    border: "border-emerald-500",
    text: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  {
    level: 2,
    label: "Mod. Conservative",
    shortLabel: "Mod. Cons.",
    description: "Slightly more risk for better returns with some diversification.",
    color: "lime",
    gradient: "from-lime-500/20 to-lime-500/5",
    border: "border-lime-500",
    text: "text-lime-400",
    bg: "bg-lime-500/10",
  },
  {
    level: 3,
    label: "Balanced",
    shortLabel: "Balanced",
    description: "Equal mix of growth and safety. Good for most investors.",
    color: "yellow",
    gradient: "from-yellow-500/20 to-yellow-500/5",
    border: "border-yellow-500",
    text: "text-yellow-400",
    bg: "bg-yellow-500/10",
  },
  {
    level: 4,
    label: "Growth",
    shortLabel: "Growth",
    description: "Majority in high-performing assets. Higher potential returns.",
    color: "orange",
    gradient: "from-orange-500/20 to-orange-500/5",
    border: "border-orange-500",
    text: "text-orange-400",
    bg: "bg-orange-500/10",
  },
  {
    level: 5,
    label: "Aggressive",
    shortLabel: "Aggressive",
    description: "Maximum growth. Crypto and stocks dominant. High risk, high reward.",
    color: "red",
    gradient: "from-red-500/20 to-red-500/5",
    border: "border-red-500",
    text: "text-red-400",
    bg: "bg-red-500/10",
  },
];

export default function CreatePortfolioPage() {
  const router = useRouter();
  const { toasts, toast, removeToast } = useToast();
  const [capital, setCapital] = useState("");
  const [riskLevel, setRiskLevel] = useState<number>(3);
  const [loading, setLoading] = useState(false);

  const selectedRisk = riskLevels.find((r) => r.level === riskLevel)!;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const capitalNum = parseFloat(capital);
    if (!capitalNum || capitalNum <= 0) {
      toast.error("Please enter a valid capital amount greater than 0");
      return;
    }

    setLoading(true);
    try {
      const portfolio = await createPortfolio({
        capital: capitalNum,
        risk_level: riskLevel,
      });
      toast.success("Portfolio created successfully!");
      setTimeout(() => {
        router.push(`/dashboard/customer/portfolios/${portfolio.id}`);
      }, 800);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create portfolio"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8 max-w-2xl">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Back */}
      <Link
        href="/dashboard/customer/portfolios"
        className="inline-flex items-center gap-2 text-sm text-[#64748b] hover:text-[#f1f5f9] mb-6 transition-colors duration-200"
      >
        <ArrowLeft size={16} />
        Back to Portfolios
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#f1f5f9]">
          Create Portfolio
        </h1>
        <p className="text-[#64748b] mt-1">
          Set your investment capital and risk profile. Finvisor will
          automatically allocate your assets.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        {/* Capital */}
        <div className="bg-[#0d1526] border border-[#1e2d47] rounded-xl p-6">
          <h2 className="text-base font-semibold text-[#f1f5f9] mb-1">
            Investment Capital
          </h2>
          <p className="text-sm text-[#64748b] mb-4">
            How much would you like to invest?
          </p>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748b]">
              <DollarSign size={18} />
            </span>
            <input
              type="number"
              placeholder="10,000"
              value={capital}
              onChange={(e) => setCapital(e.target.value)}
              min="1"
              step="any"
              required
              className="w-full bg-[#111827] border border-[#1e2d47] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl pl-12 pr-4 py-4 text-xl font-bold text-[#f1f5f9] placeholder-[#64748b] outline-none transition-all duration-200"
            />
          </div>
          {capital && parseFloat(capital) > 0 && (
            <p className="mt-2 text-sm text-[#64748b]">
              Investing{" "}
              <span className="text-blue-400 font-medium">
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                }).format(parseFloat(capital))}
              </span>{" "}
              total
            </p>
          )}
        </div>

        {/* Risk Level */}
        <div className="bg-[#0d1526] border border-[#1e2d47] rounded-xl p-6">
          <h2 className="text-base font-semibold text-[#f1f5f9] mb-1">
            Risk Profile
          </h2>
          <p className="text-sm text-[#64748b] mb-4">
            Choose your investment risk tolerance
          </p>

          {/* Risk selector cards */}
          <div className="grid grid-cols-5 gap-2 mb-5">
            {riskLevels.map((r) => (
              <button
                key={r.level}
                type="button"
                onClick={() => setRiskLevel(r.level)}
                className={clsx(
                  "flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 transition-all duration-200 cursor-pointer",
                  riskLevel === r.level
                    ? `${r.border} ${r.bg}`
                    : "border-[#1e2d47] hover:border-[#3b4a6a] bg-[#111827]"
                )}
              >
                <span
                  className={clsx(
                    "text-2xl font-bold",
                    riskLevel === r.level ? r.text : "text-[#64748b]"
                  )}
                >
                  {r.level}
                </span>
                <span
                  className={clsx(
                    "text-xs font-medium text-center leading-tight",
                    riskLevel === r.level ? r.text : "text-[#64748b]"
                  )}
                >
                  {r.shortLabel}
                </span>
              </button>
            ))}
          </div>

          {/* Description card */}
          <div
            className={clsx(
              "rounded-xl p-4 bg-gradient-to-r border",
              selectedRisk.gradient,
              `border-${selectedRisk.color}-500/30`
            )}
          >
            <div className="flex items-start gap-3">
              <div
                className={clsx(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 mt-0.5",
                  selectedRisk.bg,
                  selectedRisk.text
                )}
              >
                {selectedRisk.level}
              </div>
              <div>
                <p className={clsx("font-semibold text-sm mb-1", selectedRisk.text)}>
                  {selectedRisk.label}
                </p>
                <p className="text-sm text-[#94a3b8] leading-relaxed">
                  {selectedRisk.description}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={loading}
          className="w-full"
        >
          Create Portfolio
        </Button>
      </form>
    </div>
  );
}
