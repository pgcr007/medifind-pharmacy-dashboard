import { useState, useEffect, useCallback, useMemo } from "react";
import { Check, X as XIcon, Search } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import * as api from "../api/endpoints";
import { PageShell } from "./PharmacyProfilePage";
import StatusBadge from "../components/StatusBadge";
import Pagination from "../components/Pagination";
import { ErrorState, TableSkeleton } from "../components/StateViews";

const PAGE_SIZE = 8;

export default function ReservationsPage() {
  const { pharmacy, pharmacyLoading } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [updatingId, setUpdatingId] = useState(null);
  const [priceByMedicineId, setPriceByMedicineId] = useState({});

  const load = useCallback(async () => {
    if (!pharmacy) return;
    setLoading(true);
    setError("");
    try {
      const [reservationData, inventoryData] = await Promise.all([
        api.getPharmacyReservations(pharmacy._id),
        api.getInventory(pharmacy._id),
      ]);
      setReservations(reservationData);
      const priceMap = {};
      inventoryData.forEach((item) => {
        if (item.medicineId) priceMap[item.medicineId._id] = item.price;
      });
      setPriceByMedicineId(priceMap);
    } catch {
      setError("Couldn't load reservations.");
    } finally {
      setLoading(false);
    }
  }, [pharmacy]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleStatusChange(id, status) {
    setUpdatingId(id);
    try {
      const updated = await api.updateReservationStatus(id, status);
      setReservations((prev) => prev.map((r) => (r._id === id ? updated : r)));
    } catch {
      setError("Couldn't update that reservation. Try again.");
    } finally {
      setUpdatingId(null);
    }
  }

  const stats = useMemo(() => {
    const confirmed = reservations.filter((r) => r.status === "confirmed");
    // MVP estimate: current inventory price at time of viewing, not a historical snapshot
    // (Reservation has no price/qty field — see Phase 7 planning notes).
    const revenue = confirmed.reduce(
      (sum, r) => sum + (priceByMedicineId[r.medicineId?._id] || 0),
      0
    );
    return {
      pending: reservations.filter((r) => r.status === "pending").length,
      confirmed: confirmed.length,
      rejected: reservations.filter((r) => r.status === "rejected").length,
      cancelled: reservations.filter((r) => r.status === "cancelled").length,
      revenue,
    };
  }, [reservations, priceByMedicineId]);

  const filtered = useMemo(() => {
    let list = filter === "all" ? reservations : reservations.filter((r) => r.status === filter);
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (r) =>
          r.userId?.name?.toLowerCase().includes(q) ||
          r.userId?.email?.toLowerCase().includes(q) ||
          r.medicineId?.name?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [reservations, filter, search]);

  useEffect(() => {
    setPage(1);
  }, [filter, search]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (pharmacyLoading || !pharmacy) {
    return (
      <PageShell title="Reservations">
        <TableSkeleton cols={5} />
      </PageShell>
    );
  }

  return (
    <PageShell title="Reservations">
      <StatsBar stats={stats} />

      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex gap-2 flex-wrap">
          {["all", "pending", "confirmed", "rejected", "cancelled"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-xs font-medium px-3 py-1.5 rounded-full border capitalize transition-colors ${
                filter === f
                  ? "bg-bottle text-paper border-bottle"
                  : "border-hairline text-ink-soft hover:bg-paper-dim"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="relative w-56">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft"
          />
          <input
            className="input pl-8 py-1.5 text-sm"
            placeholder="Search patient or medicine…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <TableSkeleton cols={5} />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : filtered.length === 0 ? (
        <div className="ledger-card p-12 text-center">
          <p className="text-ink font-medium mb-1">
            {reservations.length === 0 ? "No reservations here" : "No matches"}
          </p>
          <p className="text-ink-soft text-sm">
            {reservations.length === 0
              ? "Reservations made through the app will show up here."
              : "Try a different search or filter."}
          </p>
        </div>
      ) : (
        <>
          <div className="ledger-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-hairline bg-paper-dim/60 text-left text-xs uppercase tracking-wide text-ink-soft">
                  <th className="px-5 py-3 font-medium">Patient</th>
                  <th className="px-5 py-3 font-medium">Medicine</th>
                  <th className="px-5 py-3 font-medium">Requested</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium w-40"></th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((r) => (
                  <tr key={r._id} className="border-b border-hairline last:border-0">
                    <td className="px-5 py-3">
                      <div className="font-medium text-ink">{r.userId?.name || "—"}</div>
                      <div className="text-xs text-ink-soft">{r.userId?.email}</div>
                    </td>
                    <td className="px-5 py-3 text-ink">{r.medicineId?.name || "—"}</td>
                    <td className="px-5 py-3 text-ink-soft font-mono text-xs">
                      {new Date(r.createdAt).toLocaleString(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="px-5 py-3 text-right">
                      {r.status === "pending" && (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleStatusChange(r._id, "confirmed")}
                            disabled={updatingId === r._id}
                            className="inline-flex items-center gap-1 text-xs font-medium text-sage hover:text-sage/80 disabled:opacity-50"
                          >
                            <Check size={14} /> Confirm
                          </button>
                          <button
                            onClick={() => handleStatusChange(r._id, "rejected")}
                            disabled={updatingId === r._id}
                            className="inline-flex items-center gap-1 text-xs font-medium text-rust hover:text-rust/80 disabled:opacity-50"
                          >
                            <XIcon size={14} /> Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            page={page}
            pageCount={pageCount}
            onChange={setPage}
            total={filtered.length}
            pageSize={PAGE_SIZE}
          />
        </>
      )}
    </PageShell>
  );
}

function StatsBar({ stats }) {
  const cells = [
    { label: "Pending", value: stats.pending, color: "text-amber" },
    { label: "Confirmed", value: stats.confirmed, color: "text-sage" },
    { label: "Rejected", value: stats.rejected, color: "text-rust" },
    { label: "Cancelled", value: stats.cancelled, color: "text-ink-soft" },
    {
      label: "Est. revenue",
      value: `₹${stats.revenue.toFixed(2)}`,
      color: "text-ink",
      mono: true,
    },
  ];
  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
      {cells.map((c) => (
        <div key={c.label} className="ledger-card px-4 py-3">
          <div
            className={`font-display text-2xl ${c.color} ${c.mono ? "font-mono text-xl" : ""}`}
          >
            {c.value}
          </div>
          <div className="text-xs text-ink-soft uppercase tracking-wide mt-0.5">
            {c.label}
          </div>
        </div>
      ))}
    </div>
  );
}
