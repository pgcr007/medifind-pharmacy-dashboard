import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, Search, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import * as api from "../api/endpoints";
import { PageShell } from "./PharmacyProfilePage";

export default function InventoryPage() {
  const { pharmacy, pharmacyLoading } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  const load = useCallback(async () => {
    if (!pharmacy) return;
    setLoading(true);
    setError("");
    try {
      const data = await api.getInventory(pharmacy._id);
      setItems(data);
    } catch {
      setError("Couldn't load inventory. Try refreshing.");
    } finally {
      setLoading(false);
    }
  }, [pharmacy]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleUpdate(medicineId, stockQty, price) {
    const updated = await api.upsertInventoryItem(pharmacy._id, {
      medicineId,
      stockQty,
      price,
    });
    setItems((prev) =>
      prev.map((it) =>
        it.medicineId._id === medicineId ? { ...it, stockQty: updated.stockQty, price: updated.price } : it
      )
    );
  }

  async function handleDelete(medicineId) {
    if (!confirm("Remove this medicine from your inventory?")) return;
    await api.deleteInventoryItem(pharmacy._id, medicineId);
    setItems((prev) => prev.filter((it) => it.medicineId._id !== medicineId));
  }

  if (pharmacyLoading || !pharmacy) {
    return (
      <PageShell title="Inventory">
        <p className="text-ink-soft text-sm">Loading…</p>
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Inventory"
      action={
        <button
          onClick={() => setShowAdd(true)}
          className="inline-flex items-center gap-1.5 rounded bg-bottle text-paper text-sm font-medium px-4 py-2 hover:bg-bottle-dark transition-colors"
        >
          <Plus size={16} /> Add medicine
        </button>
      }
    >
      {error && <p className="text-sm text-rust mb-4">{error}</p>}

      {loading ? (
        <p className="text-ink-soft text-sm">Loading inventory…</p>
      ) : items.length === 0 ? (
        <EmptyState onAdd={() => setShowAdd(true)} />
      ) : (
        <div className="ledger-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-hairline bg-paper-dim/60 text-left text-xs uppercase tracking-wide text-ink-soft">
                <th className="px-5 py-3 font-medium">Medicine</th>
                <th className="px-5 py-3 font-medium w-32">Stock</th>
                <th className="px-5 py-3 font-medium w-36">Price (₹)</th>
                <th className="px-5 py-3 font-medium w-16"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <InventoryRow
                  key={item._id}
                  item={item}
                  onSave={handleUpdate}
                  onDelete={handleDelete}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showAdd && (
        <AddMedicineModal
          pharmacyId={pharmacy._id}
          existingIds={items.map((i) => i.medicineId._id)}
          onClose={() => setShowAdd(false)}
          onAdded={(newItem) => {
            setItems((prev) => [...prev, newItem]);
            setShowAdd(false);
          }}
        />
      )}
    </PageShell>
  );
}

function InventoryRow({ item, onSave, onDelete }) {
  const [stockQty, setStockQty] = useState(item.stockQty);
  const [price, setPrice] = useState(item.price);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      await onSave(item.medicineId._id, Number(stockQty), Number(price));
      setDirty(false);
    } finally {
      setSaving(false);
    }
  }

  const outOfStock = Number(stockQty) <= 0;

  return (
    <tr className="border-b border-hairline last:border-0">
      <td className="px-5 py-3">
        <div className="font-medium text-ink">{item.medicineId.name}</div>
        {item.medicineId.genericName && (
          <div className="text-xs text-ink-soft">{item.medicineId.genericName}</div>
        )}
        {outOfStock && (
          <span className="inline-block mt-1 text-xs font-medium text-rust">Out of stock</span>
        )}
      </td>
      <td className="px-5 py-3">
        <input
          type="number"
          min="0"
          className="input font-mono py-1.5 px-2 text-sm w-20"
          value={stockQty}
          onChange={(e) => {
            setStockQty(e.target.value);
            setDirty(true);
          }}
        />
      </td>
      <td className="px-5 py-3">
        <input
          type="number"
          min="0"
          step="0.01"
          className="input font-mono py-1.5 px-2 text-sm w-24"
          value={price}
          onChange={(e) => {
            setPrice(e.target.value);
            setDirty(true);
          }}
        />
      </td>
      <td className="px-5 py-3 text-right whitespace-nowrap">
        {dirty && (
          <button
            onClick={save}
            disabled={saving}
            className="text-xs font-medium text-bottle hover:text-bottle-dark mr-3 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        )}
        <button
          onClick={() => onDelete(item.medicineId._id)}
          className="text-ink-soft hover:text-rust transition-colors"
          aria-label="Remove"
        >
          <Trash2 size={15} />
        </button>
      </td>
    </tr>
  );
}

function AddMedicineModal({ pharmacyId, existingIds, onClose, onAdded }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState(null);
  const [stockQty, setStockQty] = useState("");
  const [price, setPrice] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSearch(e) {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    setError("");
    try {
      const data = await api.searchMedicines(query.trim());
      setResults(data.filter((m) => !existingIds.includes(m._id)));
    } catch {
      setError("Search failed. Check the medicine name and try again.");
    } finally {
      setSearching(false);
    }
  }

  async function handleAdd(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const updated = await api.upsertInventoryItem(pharmacyId, {
        medicineId: selected._id,
        stockQty: Number(stockQty),
        price: Number(price),
      });
      onAdded({ ...updated, medicineId: selected });
    } catch {
      setError("Couldn't add this item. Try again.");
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-ink/40 flex items-center justify-center z-50 px-4">
      <div className="ledger-card bg-white w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-ink-soft hover:text-ink"
          aria-label="Close"
        >
          <X size={18} />
        </button>
        <h2 className="font-display text-xl text-ink mb-5">Add medicine</h2>

        {!selected ? (
          <form onSubmit={handleSearch} className="space-y-3">
            <div className="flex gap-2">
              <input
                className="input"
                placeholder="Search by medicine name"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
              />
              <button
                type="submit"
                disabled={searching}
                className="rounded bg-bottle text-paper px-3.5 shrink-0 hover:bg-bottle-dark disabled:opacity-60"
                aria-label="Search"
              >
                <Search size={16} />
              </button>
            </div>
            {error && <p className="text-sm text-rust">{error}</p>}
            {searching && <p className="text-sm text-ink-soft">Searching…</p>}
            {!searching && results.length > 0 && (
              <ul className="border border-hairline rounded divide-y divide-hairline max-h-56 overflow-y-auto">
                {results.map((m) => (
                  <li key={m._id}>
                    <button
                      type="button"
                      onClick={() => setSelected(m)}
                      className="w-full text-left px-3.5 py-2.5 hover:bg-paper-dim transition-colors"
                    >
                      <div className="text-sm font-medium text-ink">{m.name}</div>
                      {m.genericName && (
                        <div className="text-xs text-ink-soft">{m.genericName}</div>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </form>
        ) : (
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="rounded border border-hairline px-3.5 py-2.5 bg-paper-dim/50">
              <div className="text-sm font-medium text-ink">{selected.name}</div>
              {selected.genericName && (
                <div className="text-xs text-ink-soft">{selected.genericName}</div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="block text-xs font-medium uppercase tracking-wide text-ink-soft mb-1.5">
                  Stock qty
                </span>
                <input
                  type="number"
                  min="0"
                  required
                  className="input"
                  value={stockQty}
                  onChange={(e) => setStockQty(e.target.value)}
                />
              </label>
              <label className="block">
                <span className="block text-xs font-medium uppercase tracking-wide text-ink-soft mb-1.5">
                  Price (₹)
                </span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  className="input"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </label>
            </div>
            {error && <p className="text-sm text-rust">{error}</p>}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="flex-1 rounded border border-hairline text-ink text-sm font-medium py-2 hover:bg-paper-dim transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 rounded bg-bottle text-paper text-sm font-medium py-2 hover:bg-bottle-dark disabled:opacity-60"
              >
                {saving ? "Adding…" : "Add to inventory"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function EmptyState({ onAdd }) {
  return (
    <div className="ledger-card p-12 text-center">
      <p className="text-ink font-medium mb-1">No medicines in stock yet</p>
      <p className="text-ink-soft text-sm mb-5">
        Add your first item so patients can find it in the app.
      </p>
      <button
        onClick={onAdd}
        className="inline-flex items-center gap-1.5 rounded bg-bottle text-paper text-sm font-medium px-4 py-2 hover:bg-bottle-dark transition-colors"
      >
        <Plus size={16} /> Add medicine
      </button>
    </div>
  );
}
