"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { BarChart3, PlusCircle, TrendingUp } from "lucide-react";
import { getAssets } from "@/lib/api";
import { Asset } from "@/lib/types";
import { AssetTypeBadge } from "@/components/AssetTypeBadge";
import { RiskBadge } from "@/components/RiskBadge";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";

const ASSET_TYPES = [
  "Stock",
  "Bond",
  "Real Estate",
  "Crypto",
  "Fixed Deposit",
] as const;

const TYPE_COLORS: Record<string, string> = {
  Stock: "text-blue-400 bg-blue-500/10",
  Bond: "text-emerald-400 bg-emerald-500/10",
  "Real Estate": "text-amber-400 bg-amber-500/10",
  Crypto: "text-purple-400 bg-purple-500/10",
  "Fixed Deposit": "text-teal-400 bg-teal-500/10",
};

export default function AdminDashboardPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAssets()
      .then(setAssets)
      .catch(() => setAssets([]))
      .finally(() => setLoading(false));
  }, []);

  const recentAssets = [...assets].slice(-5).reverse();

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
          <h1 className="text-3xl font-bold text-[#f1f5f9]">
            Admin Dashboard
          </h1>
          <p className="text-[#64748b] mt-1">
            Manage asset classes and platform settings
          </p>
        </div>
        <Link href="/dashboard/admin/assets">
          <Button variant="primary">
            <PlusCircle size={16} />
            Add Asset
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <div className="bg-[#0d1526] border border-[#1e2d47] rounded-xl p-5 col-span-2 lg:col-span-1">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-blue-500/10">
              <BarChart3 size={20} className="text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#f1f5f9]">
                {assets.length}
              </p>
              <p className="text-sm text-[#64748b]">Total Asset Classes</p>
            </div>
          </div>
        </div>
        {ASSET_TYPES.map((type) => {
          const count = assets.filter((a) => a.asset_type === type).length;
          const colorClass = TYPE_COLORS[type] || "text-gray-400 bg-gray-500/10";
          return (
            <div
              key={type}
              className="bg-[#0d1526] border border-[#1e2d47] rounded-xl p-5"
            >
              <div className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium mb-2 ${colorClass}`}>
                {type}
              </div>
              <p className="text-2xl font-bold text-[#f1f5f9]">{count}</p>
              <p className="text-sm text-[#64748b]">assets</p>
            </div>
          );
        })}
      </div>

      {/* Recent Assets */}
      <div className="bg-[#0d1526] border border-[#1e2d47] rounded-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e2d47]">
          <h2 className="text-base font-semibold text-[#f1f5f9]">
            Recent Assets
          </h2>
          <Link
            href="/dashboard/admin/assets"
            className="text-sm text-blue-400 hover:text-blue-300 transition-colors duration-200"
          >
            Manage all →
          </Link>
        </div>

        {assets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4">
              <TrendingUp size={22} className="text-blue-400" />
            </div>
            <p className="text-[#64748b] text-sm">No assets yet.</p>
            <Link href="/dashboard/admin/assets" className="mt-3">
              <Button variant="primary" size="sm">
                <PlusCircle size={14} />
                Add First Asset
              </Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1e2d47]">
                  <th className="text-left px-6 py-3 text-xs text-[#64748b] font-medium">
                    Name
                  </th>
                  <th className="text-left px-6 py-3 text-xs text-[#64748b] font-medium">
                    Type
                  </th>
                  <th className="text-left px-6 py-3 text-xs text-[#64748b] font-medium">
                    Risk Score
                  </th>
                  <th className="text-right px-6 py-3 text-xs text-[#64748b] font-medium">
                    Expected Return
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentAssets.map((asset) => (
                  <tr
                    key={asset.id}
                    className="border-b border-[#1e2d47]/50 hover:bg-[#111827] transition-colors duration-150"
                  >
                    <td className="px-6 py-3 font-medium text-[#f1f5f9]">
                      {asset.name}
                    </td>
                    <td className="px-6 py-3">
                      <AssetTypeBadge type={asset.asset_type} />
                    </td>
                    <td className="px-6 py-3">
                      <RiskBadge level={asset.risk_score} />
                    </td>
                    <td className="px-6 py-3 text-right text-emerald-400 font-medium">
                      {asset.expected_return}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
