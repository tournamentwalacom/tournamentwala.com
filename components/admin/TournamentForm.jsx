"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  SPORT_OPTIONS,
  TOURNAMENT_FORMATS,
  getCitySuggestions,
} from "@/lib/tournaments";
import PosterUploadField from "@/components/PosterUploadField";
import AdminPackagesField from "@/components/admin/AdminPackagesField";

const STATUS_OPTIONS = [
  { value: "live", label: "Live" },
  { value: "pending", label: "Pending review" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "rejected", label: "Rejected" },
];

function toFormValue(n) {
  return n === null || n === undefined ? "" : String(n);
}

function buildInitialForm(initial) {
  if (!initial) {
    return {
      name: "",
      sport: "",
      sportOther: "",
      organizer_name: "",
      organizer_phone: "",
      instagram_id: "",
      city: "",
      venue: "",
      address: "",
      pincode: "",
      start_date: "",
      format: "",
      formatOther: "",
      hot: false,
      announce: false,
      slots_left: "",
      image_url: "",
      entry_fee_amount: "",
      prize_pool: "",
      total_teams: "",
      status: "live",
      promotions: [],
      promotion_total: 0,
    };
  }

  const knownSport = SPORT_OPTIONS.includes(initial.sport);
  const knownFormat = TOURNAMENT_FORMATS.includes(initial.format);

  return {
    name: initial.name || "",
    sport: knownSport ? initial.sport : "Other",
    sportOther: knownSport ? "" : initial.sport || "",
    organizer_name: initial.organizer_name || "",
    organizer_phone: initial.organizer_phone || "",
    instagram_id: initial.instagram_id || "",
    city: initial.city || "",
    venue: initial.venue || "",
    address: initial.address || "",
    pincode: initial.pincode || "",
    start_date: initial.start_date || "",
    format: initial.format ? (knownFormat ? initial.format : "Other") : "",
    formatOther: knownFormat ? "" : initial.format || "",
    hot: Boolean(initial.hot),
    announce: Boolean(initial.announce),
    slots_left: toFormValue(initial.slots_left),
    image_url: initial.image_url || "",
    entry_fee_amount: toFormValue(initial.entry_fee_amount),
    prize_pool: toFormValue(initial.prize_pool),
    total_teams: toFormValue(initial.total_teams),
    status: initial.status || "pending",
    promotions: initial.promotions || [],
    promotion_total: initial.promotion_total ?? 0,
  };
}

export default function TournamentForm({ mode, initial }) {
  const router = useRouter();
  const [form, setForm] = useState(() => buildInitialForm(initial));
  const [status, setStatus] = useState("idle"); // idle | submitting | error
  const [error, setError] = useState("");

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!form.image_url) {
      setError("Please upload the main tournament poster.");
      setStatus("error");
      return;
    }

    setStatus("submitting");

    const sport = form.sport === "Other" ? form.sportOther.trim() : form.sport;
    const format = form.format === "Other" ? form.formatOther.trim() : form.format;
    const fields = { ...form, sport, format };

    try {
      const res =
        mode === "create"
          ? await fetch("/api/admin/tournaments", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(fields),
            })
          : await fetch(`/api/admin/tournaments/${initial.id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ action: "update", fields }),
            });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        setStatus("error");
        return;
      }

      router.push("/admin/tournaments");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setStatus("error");
    }
  }

  return (
    <form className="post-form" onSubmit={handleSubmit}>
      <div className="post-form-grid">
        <h3 className="post-form-section">1. Basic information</h3>

        <label className="post-field post-field-wide">
          Tournament name
          <input
            type="text"
            required
            maxLength={120}
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
          />
        </label>

        <label className="post-field">
          Sport
          <select
            required
            value={form.sport}
            onChange={(e) => update("sport", e.target.value)}
          >
            <option value="" disabled>
              Pick a sport
            </option>
            {SPORT_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
            <option value="Other">Other</option>
          </select>
        </label>

        {form.sport === "Other" && (
          <label className="post-field">
            Name your sport
            <input
              type="text"
              required
              maxLength={60}
              value={form.sportOther}
              onChange={(e) => update("sportOther", e.target.value)}
            />
          </label>
        )}

        <h3 className="post-form-section">2. Organizer</h3>

        <label className="post-field">
          Organizer name
          <input
            type="text"
            required
            maxLength={80}
            value={form.organizer_name}
            onChange={(e) => update("organizer_name", e.target.value)}
          />
        </label>

        <label className="post-field">
          Contact number
          <input
            type="tel"
            required
            value={form.organizer_phone}
            onChange={(e) => update("organizer_phone", e.target.value)}
          />
        </label>

        <label className="post-field">
          Instagram ID
          <div className="post-input-prefix">
            <input
              type="text"
              required
              maxLength={60}
              placeholder="yourhandle"
              value={form.instagram_id}
              onChange={(e) =>
                update("instagram_id", e.target.value.replace(/^@+/, ""))
              }
            />
          </div>
        </label>

        <h3 className="post-form-section">3. Venue</h3>

        <label className="post-field">
          City
          <input
            type="text"
            required
            maxLength={60}
            list="city-suggestions"
            value={form.city}
            onChange={(e) => update("city", e.target.value)}
          />
          <datalist id="city-suggestions">
            {getCitySuggestions().map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </label>

        <label className="post-field post-field-wide">
          Venue name
          <input
            type="text"
            required
            maxLength={160}
            value={form.venue}
            onChange={(e) => update("venue", e.target.value)}
          />
        </label>

        <label className="post-field post-field-wide">
          Address
          <input
            type="text"
            required
            maxLength={300}
            value={form.address}
            onChange={(e) => update("address", e.target.value)}
          />
        </label>

        <label className="post-field">
          Venue pincode
          <input
            type="text"
            required
            inputMode="numeric"
            pattern="\d{6}"
            title="6-digit pincode"
            maxLength={6}
            placeholder="e.g. 560001"
            value={form.pincode}
            onChange={(e) => update("pincode", e.target.value.replace(/\D/g, ""))}
          />
        </label>

        <h3 className="post-form-section">4. Schedule</h3>

        <label className="post-field">
          Tournament date
          <input
            type="date"
            required
            value={form.start_date}
            onChange={(e) => update("start_date", e.target.value)}
          />
        </label>

        <h3 className="post-form-section">5. Tournament details</h3>

        <label className="post-field">
          Tournament format
          <select
            required
            value={form.format}
            onChange={(e) => update("format", e.target.value)}
          >
            <option value="" disabled>
              Pick a format
            </option>
            {TOURNAMENT_FORMATS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
            <option value="Other">Other</option>
          </select>
        </label>

        {form.format === "Other" && (
          <label className="post-field">
            Describe the format
            <input
              type="text"
              required
              maxLength={160}
              value={form.formatOther}
              onChange={(e) => update("formatOther", e.target.value)}
            />
          </label>
        )}

        <label className="post-field">
          Entry fee (₹)
          <input
            type="number"
            required
            min="0"
            step="1"
            value={form.entry_fee_amount}
            onChange={(e) => update("entry_fee_amount", e.target.value)}
          />
        </label>

        <label className="post-field">
          Status
          <select value={form.status} onChange={(e) => update("status", e.target.value)}>
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>

        <label className="post-field post-field-checkbox">
          <input
            type="checkbox"
            checked={form.hot}
            onChange={(e) => update("hot", e.target.checked)}
          />
          Mark as hot
        </label>

        <label className="post-field post-field-checkbox">
          <input
            type="checkbox"
            checked={form.announce}
            onChange={(e) => update("announce", e.target.checked)}
          />
          Announcement (show in the homepage announcement bar)
        </label>

        {form.announce && (
          <label className="post-field">
            Slots left <span>(optional)</span>
            <input
              type="number"
              min="0"
              step="1"
              placeholder="e.g. 8"
              value={form.slots_left}
              onChange={(e) => update("slots_left", e.target.value)}
            />
          </label>
        )}

        <h3 className="post-form-section">6. Prize pool</h3>

        <label className="post-field">
          Winner prize (₹)
          <input
            type="number"
            required
            min="0"
            step="1"
            value={form.prize_pool}
            onChange={(e) => update("prize_pool", e.target.value)}
          />
        </label>

        <label className="post-field">
          Total teams that took part <span>(optional, fill in after the event)</span>
          <input
            type="number"
            min="0"
            step="1"
            placeholder="e.g. 24"
            value={form.total_teams}
            onChange={(e) => update("total_teams", e.target.value)}
          />
        </label>

        <h3 className="post-form-section">7. Packages &amp; pricing</h3>

        <AdminPackagesField
          value={{ promotions: form.promotions, promotion_total: form.promotion_total }}
          onChange={({ promotions, promotion_total }) => {
            setForm((f) => ({ ...f, promotions, promotion_total }));
          }}
        />

        <h3 className="post-form-section">8. Upload poster ⭐</h3>

        <div className="post-field post-field-wide">
          Main tournament poster <span>(required)</span>
          <PosterUploadField
            value={form.image_url}
            onChange={(url) => update("image_url", url)}
          />
        </div>
      </div>

      {error && <p className="post-error">{error}</p>}

      <button type="submit" className="btn btn-primary" disabled={status === "submitting"}>
        {status === "submitting"
          ? "Saving…"
          : mode === "create"
          ? "Create tournament"
          : "Save changes"}
      </button>
    </form>
  );
}
