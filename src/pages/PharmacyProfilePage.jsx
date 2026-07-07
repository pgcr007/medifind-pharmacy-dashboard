import { useState, useEffect } from "react";
import { BadgeCheck, ShieldQuestion, Clock, Star, Store } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import * as api from "../api/endpoints";
import Toggle from "../components/Toggle";

const EMPTY_FORM = { name: "", address: "", latitude: "", longitude: "", is24Hours: false };

export default function PharmacyProfilePage() {
  const { pharmacy, pharmacyLoading, pharmacyError, pharmacyNotFound, setPharmacy, reloadPharmacy } = useAuth();
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (pharmacy) setForm(pharmacy);
  }, [pharmacy]);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setSaveError("");
    setSaved(false);
    try {
      const updated = await api.updatePharmacy(pharmacy._id, {
        name: form.name,
        address: form.address,
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
        is24Hours: form.is24Hours,
      });
      setPharmacy(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      setSaveError("Couldn't save changes. Try again.");
    } finally {
      setSaving(false);
    }
  }

  if (pharmacyLoading) {
    return (
      <PageShell title="Pharmacy">
        <p className="text-ink-soft text-sm">Loading your pharmacy…</p>
      </PageShell>
    );
  }

  // No pharmacy exists yet for this account -- show the one-time setup form
  // instead of a dead-end error. This is the missing piece: previously
  // nothing in the app or dashboard ever created this record.
  if (pharmacyNotFound) {
    return <CreatePharmacyForm onCreated={reloadPharmacy} />;
  }

  if (pharmacyError) {
    return (
      <PageShell title="Pharmacy">
        <p className="text-sm text-rust">{pharmacyError}</p>
      </PageShell>
    );
  }

  if (!form) return null;

  return (
    <PageShell title="Pharmacy">
      <form onSubmit={handleSave} className="max-w-lg space-y-6">
        <div className="ledger-card p-6 space-y-5">
          <div className="flex items-center gap-4">
            {pharmacy.verified ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-sage">
                <BadgeCheck size={15} /> Verified
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber">
                <ShieldQuestion size={15} /> Pending verification
              </span>
            )}
            {pharmacy.reviewCount > 0 && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-ink-soft">
                <Star size={13} className="fill-amber text-amber" />
                {pharmacy.averageRating} ({pharmacy.reviewCount})
              </span>
            )}
          </div>

          <Field label="Pharmacy name">
            <input
              className="input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </Field>

          <Field label="Address">
            <input
              className="input"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              required
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Latitude">
              <input
                className="input font-mono text-sm"
                type="number"
                step="any"
                value={form.latitude}
                onChange={(e) => setForm({ ...form, latitude: e.target.value })}
                required
              />
            </Field>
            <Field label="Longitude">
              <input
                className="input font-mono text-sm"
                type="number"
                step="any"
                value={form.longitude}
                onChange={(e) => setForm({ ...form, longitude: e.target.value })}
                required
              />
            </Field>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-hairline">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-ink-soft" />
              <div>
                <div className="text-sm font-medium text-ink">Open 24 hours</div>
                <div className="text-xs text-ink-soft">
                  Shown to patients in Emergency Mode
                </div>
              </div>
            </div>
            <Toggle
              checked={form.is24Hours}
              onChange={(val) => setForm({ ...form, is24Hours: val })}
              label="Open 24 hours"
            />
          </div>
        </div>

        {saveError && <p className="text-sm text-rust">{saveError}</p>}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded bg-bottle text-paper text-sm font-medium px-5 py-2.5 hover:bg-bottle-dark disabled:opacity-60 transition-colors"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
          {saved && <span className="text-sm text-sage">Saved.</span>}
        </div>
      </form>
    </PageShell>
  );
}

function CreatePharmacyForm({ onCreated }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  async function handleCreate(e) {
    e.preventDefault();
    setCreating(true);
    setError("");
    try {
      await api.createPharmacy({
        name: form.name,
        address: form.address,
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
        is24Hours: form.is24Hours,
      });
      // Re-fetch through the normal auth flow so `pharmacy` and `pharmacyError`
      // in context update correctly, the same way they do on every other load.
      await onCreated();
    } catch (err) {
      setError(
        err.response?.data?.error || "Couldn't create your pharmacy. Please check the details and try again."
      );
    } finally {
      setCreating(false);
    }
  }

  return (
    <PageShell title="Set up your pharmacy">
      <div className="max-w-lg">
        <div className="ledger-card p-6 mb-6 flex items-start gap-3">
          <Store size={20} className="text-bottle shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-ink font-medium">Welcome! Let's get your pharmacy set up.</p>
            <p className="text-xs text-ink-soft mt-1">
              Your account is registered, but you haven't created a pharmacy profile yet.
              Fill this in once -- an admin will need to verify it before it appears in patient
              searches, but you can start managing inventory right away.
            </p>
          </div>
        </div>

        <form onSubmit={handleCreate} className="ledger-card p-6 space-y-5">
          <Field label="Pharmacy name">
            <input
              className="input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. City Pharmacy"
              required
            />
          </Field>

          <Field label="Address">
            <input
              className="input"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="Street, area, city"
              required
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Latitude">
              <input
                className="input font-mono text-sm"
                type="number"
                step="any"
                value={form.latitude}
                onChange={(e) => setForm({ ...form, latitude: e.target.value })}
                placeholder="19.2403"
                required
              />
            </Field>
            <Field label="Longitude">
              <input
                className="input font-mono text-sm"
                type="number"
                step="any"
                value={form.longitude}
                onChange={(e) => setForm({ ...form, longitude: e.target.value })}
                placeholder="73.1305"
                required
              />
            </Field>
          </div>
          <p className="text-xs text-ink-soft -mt-2">
            Tip: search your pharmacy on Google Maps, right-click the pin, and the coordinates
            are the first thing shown.
          </p>

          <div className="flex items-center justify-between pt-2 border-t border-hairline">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-ink-soft" />
              <div className="text-sm font-medium text-ink">Open 24 hours</div>
            </div>
            <Toggle
              checked={form.is24Hours}
              onChange={(val) => setForm({ ...form, is24Hours: val })}
              label="Open 24 hours"
            />
          </div>

          {error && <p className="text-sm text-rust">{error}</p>}

          <button
            type="submit"
            disabled={creating}
            className="rounded bg-bottle text-paper text-sm font-medium px-5 py-2.5 hover:bg-bottle-dark disabled:opacity-60 transition-colors"
          >
            {creating ? "Creating…" : "Create pharmacy"}
          </button>
        </form>
      </div>
    </PageShell>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium uppercase tracking-wide text-ink-soft mb-1.5">
        {label}
      </span>
      {children}
    </label>
  );
}

export function PageShell({ title, action, children }) {
  return (
    <div className="px-10 py-8 max-w-5xl">
      <div className="flex items-center justify-between mb-7">
        <h1 className="font-display text-2xl text-ink">{title}</h1>
        {action}
      </div>
      {children}
    </div>
  );
}