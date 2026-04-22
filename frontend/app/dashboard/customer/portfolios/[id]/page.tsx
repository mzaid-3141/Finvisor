"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Trash2,
  DollarSign,
  Layers,
  AlertTriangle,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getPortfolio, deletePortfolio } from "@/lib/api";
import { Portfolio, AllocationItem } from "@/lib/types";
import { RiskBadge } from "@/components/RiskBadge";
import { AssetTypeBadge } from "@/components/AssetTypeBadge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Spinner } from "@/components/ui/Spinner";
import { ToastContainer } from "@/components/ui/Toast";
import { useToast } from "@/components/ui/useToast";

const PIE_COLORS = [
  "#3b82f6",
  "#f59e0b",
  "#10b981",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#f97316",
];

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: { amount: number } }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const item = payload[0];
    return (
      <div className="bg-[#0d1526] border border-[#1e2d47] rounded-xl p-3 shadow-xl">
        <p className="text-sm font-medium text-[#f1f5f9]">{item.name}</p>
        <p className="text-xs text-[#64748b] mt-1">
          {item.value.toFixed(1)}% · {formatCurrency(item.payload.amount)}
        </p>
      </div>
    );
  }
  return null;
}

export default function PortfolioDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toasts, toast, removeToast } = useToast();
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const id = Number(params.id);

  const fetchPortfolio = useCallback(async () => {
    try {
      const data = await getPortfolio(id);
      setPortfolio(data);
    } catch {
      toast.error("Failed to load portfolio");
    } finally {
      setLoading(false);
    }
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchPortfolio();
  }, [fetchPortfolio]);

  async function handleDelete() {
    setDeleting(true);
    try {
      await deletePortfolio(id);
      toast.success("Portfolio deleted successfully");
      setTimeout(() => router.push("/dashboard/customer/portfolios"), 800);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete portfolio"
      );
      setDeleting(false);
      setDeleteModalOpen(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="p-8 text-center">
        <p className="text-[#64748b]">Portfolio not found.</p>
        <Link href="/dashboard/customer/portfolios">
          <Button variant="secondary" className="mt-4">
            Back to Portfolios
          </Button>
        </Link>
      </div>
    );
  }

  const allocations: AllocationItem[] = portfolio.allocations || [];

  const pieData = allocations.map((a) => ({
    name: a.asset.name,
    value: a.percentage,
    amount: a.amount,
  }));

  return (
    <div className="p-8">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Back */}
      <Link
        href="/dashboard/customer/portfolios"
        className="inline-flex items-center gap-2 text-sm text-[#64748b] hover:text-[#f1f5f9] mb-6 transition-colors duration-200"
      >
        <ArrowLeft size={16} />
        Back to Portfolios
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#f1f5f9]">
            {portfolio.name || `Portfolio #${portfolio.id}`}
          </h1>
          {portfolio.description && (
            <p className="text-[#64748b] mt-1">{portfolio.description}</p>
          )}
        </div>
        <Button
          variant="danger"
          size="sm"
          onClick={() => setDeleteModalOpen(true)}
        >
          <Trash2 size={15} />
          Delete Portfolio
        </Button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-[#0d1526] border border-[#1e2d47] rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <DollarSign size={18} className="text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-[#64748b] mb-0.5">Capital</p>
              <p className="text-xl font-bold text-[#f1f5f9]">
                {formatCurrency(portfolio.capital)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-[#0d1526] border border-[#1e2d47] rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <AlertTriangle size={18} className="text-amber-400" />
            </div>
            <div>
              <p className="text-xs text-[#64748b] mb-1">Risk Level</p>
              <RiskBadge level={portfolio.risk_level} />
            </div>
          </div>
        </div>
        <div className="bg-[#0d1526] border border-[#1e2d47] rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10">
              <Layers size={18} className="text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-[#64748b] mb-0.5">Allocations</p>
              <p className="text-xl font-bold text-[#f1f5f9]">
                {allocations.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {allocations.length === 0 ? (
        <div className="bg-[#0d1526] border border-[#1e2d47] rounded-xl p-10 text-center">
          <p className="text-[#64748b]">No allocations found for this portfolio.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie Chart */}
          <div className="bg-[#0d1526] border border-[#1e2d47] rounded-xl p-6">
            <h2 className="text-base font-semibold text-[#f1f5f9] mb-5">
              Asset Allocation
            </h2>
            <div className="w-full" style={{ height: "240px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((_, index) => (
                      <Cell
                        key={index}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                        stroke="transparent"
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="mt-4 flex flex-col gap-2">
              {pieData.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{
                        backgroundColor: PIE_COLORS[index % PIE_COLORS.length],
                      }}
                    />
                    <span className="text-[#94a3b8] truncate">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-3 text-right shrink-0">
                    <span className="text-[#64748b]">
                      {item.value.toFixed(1)}%
                    </span>
                    <span className="text-[#f1f5f9] font-medium w-24 text-right">
                      {formatCurrency(item.amount)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Allocation Table */}
          <div className="bg-[#0d1526] border border-[#1e2d47] rounded-xl p-6">
            <h2 className="text-base font-semibold text-[#f1f5f9] mb-5">
              Allocation Details
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#1e2d47]">
                    <th className="text-left py-2 pb-3 text-xs text-[#64748b] font-medium">
                      Asset
                    </th>
                    <th className="text-left py-2 pb-3 text-xs text-[#64748b] font-medium">
                      Type
                    </th>
                    <th className="text-right py-2 pb-3 text-xs text-[#64748b] font-medium">
                      Risk
                    </th>
                    <th className="text-right py-2 pb-3 text-xs text-[#64748b] font-medium">
                      Return
                    </th>
                    <th className="text-right py-2 pb-3 text-xs text-[#64748b] font-medium">
                      %
                    </th>
                    <th className="text-right py-2 pb-3 text-xs text-[#64748b] font-medium">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {allocations.map((allocation, index) => (
                    <tr
                      key={allocation.id}
                      className="border-b border-[#1e2d47]/50 hover:bg-[#111827] transition-colors duration-150"
                    >
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{
                              backgroundColor:
                                PIE_COLORS[index % PIE_COLORS.length],
                            }}
                          />
                          <span className="text-[#f1f5f9] font-medium">
                            {allocation.asset.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-3">
                        <AssetTypeBadge type={allocation.asset.asset_type} />
                      </td>
                      <td className="py-3 text-right">
                        <RiskBadge
                          level={allocation.asset.risk_score}
                          showLevel={false}
                        />
                      </td>
                      <td className="py-3 text-right text-emerald-400 font-medium">
                        {allocation.asset.expected_return}%
                      </td>
                      <td className="py-3 text-right text-[#f1f5f9] font-medium">
                        {allocation.percentage.toFixed(1)}%
                      </td>
                      <td className="py-3 text-right text-[#f1f5f9]">
                        {formatCurrency(allocation.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        open={deleteModalOpen}
        onClose={() => !deleting && setDeleteModalOpen(false)}
        title="Delete Portfolio"
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
            <AlertTriangle size={20} className="text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-[#f1f5f9] mb-1">
                This action cannot be undone
              </p>
              <p className="text-sm text-[#64748b]">
                Deleting this portfolio will permanently remove all allocations
                and investment data.
              </p>
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <Button
              variant="secondary"
              onClick={() => setDeleteModalOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              loading={deleting}
            >
              Delete Portfolio
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
