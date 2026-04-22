"use client";

import React, { useEffect, useState, useCallback } from "react";
import { PlusCircle, Pencil, Trash2, AlertTriangle } from "lucide-react";
import {
  getAssets,
  createAsset,
  updateAsset,
  deleteAsset,
} from "@/lib/api";
import { Asset, CreateAssetPayload, UpdateAssetPayload } from "@/lib/types";
import { AssetTypeBadge } from "@/components/AssetTypeBadge";
import { RiskBadge } from "@/components/RiskBadge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Spinner } from "@/components/ui/Spinner";
import { ToastContainer } from "@/components/ui/Toast";
import { useToast } from "@/components/ui/useToast";
import { clsx } from "clsx";

const ASSET_TYPES = [
  "Stock",
  "Bond",
  "Real Estate",
  "Crypto",
  "Fixed Deposit",
] as const;

type AssetTypeValue = (typeof ASSET_TYPES)[number];

interface AssetFormState {
  name: string;
  asset_type: AssetTypeValue;
  risk_score: string;
  expected_return: string;
}

const emptyForm: AssetFormState = {
  name: "",
  asset_type: "Stock",
  risk_score: "3",
  expected_return: "",
};

const riskScoreColors: Record<number, string> = {
  1: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  2: "text-lime-400 bg-lime-500/10 border-lime-500/20",
  3: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  4: "text-orange-400 bg-orange-500/10 border-orange-500/20",
  5: "text-red-400 bg-red-500/10 border-red-500/20",
};

function AssetForm({
  form,
  onChange,
  onSubmit,
  loading,
  submitLabel,
}: {
  form: AssetFormState;
  onChange: (field: keyof AssetFormState, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  submitLabel: string;
}) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <Input
        label="Asset Name"
        type="text"
        placeholder="e.g. Apple Stock"
        value={form.name}
        onChange={(e) => onChange("name", e.target.value)}
        required
      />

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-[#f1f5f9]">Asset Type</label>
        <select
          value={form.asset_type}
          onChange={(e) => onChange("asset_type", e.target.value)}
          required
          className="w-full bg-[#111827] border border-[#1e2d47] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg px-3 py-2.5 text-sm text-[#f1f5f9] outline-none transition-all duration-200"
        >
          {ASSET_TYPES.map((t) => (
            <option key={t} value={t} className="bg-[#111827]">
              {t}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-[#f1f5f9]">
          Risk Score (1–5)
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((score) => (
            <button
              key={score}
              type="button"
              onClick={() => onChange("risk_score", String(score))}
              className={clsx(
                "flex-1 py-2.5 rounded-lg border text-sm font-bold transition-all duration-200",
                Number(form.risk_score) === score
                  ? riskScoreColors[score]
                  : "border-[#1e2d47] text-[#64748b] hover:border-[#3b4a6a] bg-[#111827]"
              )}
            >
              {score}
            </button>
          ))}
        </div>
      </div>

      <Input
        label="Expected Return (%)"
        type="number"
        placeholder="e.g. 12.5"
        value={form.expected_return}
        onChange={(e) => onChange("expected_return", e.target.value)}
        min="0"
        max="100"
        step="0.1"
        required
      />

      <Button
        type="submit"
        variant="primary"
        size="lg"
        loading={loading}
        className="w-full mt-2"
      >
        {submitLabel}
      </Button>
    </form>
  );
}

export default function AdminAssetsPage() {
  const { toasts, toast, removeToast } = useToast();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);

  // Add modal
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState<AssetFormState>(emptyForm);
  const [addLoading, setAddLoading] = useState(false);

  // Edit modal
  const [editOpen, setEditOpen] = useState(false);
  const [editAsset, setEditAsset] = useState<Asset | null>(null);
  const [editForm, setEditForm] = useState<AssetFormState>(emptyForm);
  const [editLoading, setEditLoading] = useState(false);

  // Delete modal
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Asset | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchAssets = useCallback(async () => {
    try {
      const data = await getAssets();
      setAssets(data);
    } catch {
      toast.error("Failed to load assets");
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  function openEdit(asset: Asset) {
    setEditAsset(asset);
    setEditForm({
      name: asset.name,
      asset_type: asset.asset_type,
      risk_score: String(asset.risk_score),
      expected_return: String(asset.expected_return),
    });
    setEditOpen(true);
  }

  function openDelete(asset: Asset) {
    setDeleteTarget(asset);
    setDeleteOpen(true);
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setAddLoading(true);
    try {
      const payload: CreateAssetPayload = {
        name: addForm.name,
        asset_type: addForm.asset_type,
        risk_score: Number(addForm.risk_score),
        expected_return: Number(addForm.expected_return),
      };
      const created = await createAsset(payload);
      setAssets((prev) => [...prev, created]);
      toast.success(`Asset "${created.name}" created successfully`);
      setAddOpen(false);
      setAddForm(emptyForm);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create asset"
      );
    } finally {
      setAddLoading(false);
    }
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editAsset) return;
    setEditLoading(true);
    try {
      const payload: UpdateAssetPayload = {
        name: editForm.name,
        asset_type: editForm.asset_type,
        risk_score: Number(editForm.risk_score),
        expected_return: Number(editForm.expected_return),
      };
      const updated = await updateAsset(editAsset.id, payload);
      setAssets((prev) =>
        prev.map((a) => (a.id === updated.id ? updated : a))
      );
      toast.success(`Asset "${updated.name}" updated successfully`);
      setEditOpen(false);
      setEditAsset(null);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update asset"
      );
    } finally {
      setEditLoading(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteAsset(deleteTarget.id);
      setAssets((prev) => prev.filter((a) => a.id !== deleteTarget.id));
      toast.success(`Asset "${deleteTarget.name}" deleted`);
      setDeleteOpen(false);
      setDeleteTarget(null);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete asset"
      );
    } finally {
      setDeleteLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#f1f5f9]">Asset Classes</h1>
          <p className="text-[#64748b] mt-1">
            {assets.length} asset{assets.length !== 1 ? "s" : ""} configured
          </p>
        </div>
        <Button variant="primary" onClick={() => setAddOpen(true)}>
          <PlusCircle size={16} />
          Add Asset
        </Button>
      </div>

      {/* Table */}
      <div className="bg-[#0d1526] border border-[#1e2d47] rounded-xl overflow-hidden">
        {assets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4">
              <PlusCircle size={28} className="text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-[#f1f5f9] mb-2">
              No assets yet
            </h3>
            <p className="text-[#64748b] text-sm mb-5">
              Add your first asset class to get started
            </p>
            <Button variant="primary" onClick={() => setAddOpen(true)}>
              <PlusCircle size={16} />
              Add First Asset
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1e2d47] bg-[#111827]">
                  <th className="text-left px-6 py-3.5 text-xs text-[#64748b] font-semibold uppercase tracking-wider">
                    Name
                  </th>
                  <th className="text-left px-6 py-3.5 text-xs text-[#64748b] font-semibold uppercase tracking-wider">
                    Type
                  </th>
                  <th className="text-left px-6 py-3.5 text-xs text-[#64748b] font-semibold uppercase tracking-wider">
                    Risk Score
                  </th>
                  <th className="text-right px-6 py-3.5 text-xs text-[#64748b] font-semibold uppercase tracking-wider">
                    Exp. Return
                  </th>
                  <th className="text-right px-6 py-3.5 text-xs text-[#64748b] font-semibold uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {assets.map((asset) => (
                  <tr
                    key={asset.id}
                    className="border-b border-[#1e2d47]/50 hover:bg-[#111827] transition-colors duration-150 group"
                  >
                    <td className="px-6 py-4 font-medium text-[#f1f5f9]">
                      {asset.name}
                    </td>
                    <td className="px-6 py-4">
                      <AssetTypeBadge type={asset.asset_type} />
                    </td>
                    <td className="px-6 py-4">
                      <RiskBadge level={asset.risk_score} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-emerald-400 font-medium">
                        {asset.expected_return}%
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(asset)}
                          className="p-2 rounded-lg text-[#64748b] hover:text-blue-400 hover:bg-blue-500/10 border border-transparent hover:border-blue-500/20 transition-all duration-200"
                          title="Edit"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => openDelete(asset)}
                          className="p-2 rounded-lg text-[#64748b] hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all duration-200"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Modal */}
      <Modal
        open={addOpen}
        onClose={() => !addLoading && setAddOpen(false)}
        title="Add New Asset"
      >
        <AssetForm
          form={addForm}
          onChange={(field, value) =>
            setAddForm((prev) => ({ ...prev, [field]: value }))
          }
          onSubmit={handleAdd}
          loading={addLoading}
          submitLabel="Create Asset"
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        open={editOpen}
        onClose={() => !editLoading && setEditOpen(false)}
        title="Edit Asset"
      >
        <AssetForm
          form={editForm}
          onChange={(field, value) =>
            setEditForm((prev) => ({ ...prev, [field]: value }))
          }
          onSubmit={handleEdit}
          loading={editLoading}
          submitLabel="Save Changes"
        />
      </Modal>

      {/* Delete Modal */}
      <Modal
        open={deleteOpen}
        onClose={() => !deleteLoading && setDeleteOpen(false)}
        title="Delete Asset"
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
            <AlertTriangle
              size={20}
              className="text-red-400 shrink-0 mt-0.5"
            />
            <div>
              <p className="text-sm font-medium text-[#f1f5f9] mb-1">
                Delete &ldquo;{deleteTarget?.name}&rdquo;?
              </p>
              <p className="text-sm text-[#64748b]">
                This will permanently remove this asset class. Existing
                portfolio allocations may be affected.
              </p>
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <Button
              variant="secondary"
              onClick={() => setDeleteOpen(false)}
              disabled={deleteLoading}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              loading={deleteLoading}
            >
              Delete Asset
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
