"use client";

import { useState } from "react";
import { SPORT_OPTIONS, ENTRY_FEE_UNITS, getCitySuggestions } from "@/lib/tournaments";

const initialForm = {
  name: "",
  sport: "",
  sportOther: "",
  city: "",
  venue: "",
  start_date: "",
  end_date: "",
  start_time: "",
  format: "",
  tag: "",
  image_url: "",
  description: "",
  entry_fee_amount: "",
  entry_fee_unit: "team",
  advance_amount: "",
  prize_pool: "",
  first_prize: "",
  second_prize: "",
  rules: "",
  trophy_details: "",
  other_contact: "",
  organizer_name: "",
  organizer_email: "",
  organizer_phone: "",
  website: "", // honeypot — real users never fill this in
};

export default function PostTournamentForm() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState("idle"); // idle | submitting | success | error
  const [error, setError] = useState("");

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("submitting");
    setError("");

    const sport = form.sport === "Other" ? form.sportOther.trim() : form.sport;

    try {
      const res = await fetch("/api/tournaments/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, sport }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        setStatus("error");
        return;
      }

      setStatus("success");
      setForm(initialForm);
    } catch {
      setError("Network error. Please try again.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="post-success">
        <h3>Thanks — your tournament is in!</h3>
        <p>
          It&rsquo;s now pending review. Once our team approves it (usually
          within 24–48 hrs), it&rsquo;ll go live and show up in search across
          the site.
        </p>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => setStatus("idle")}
        >
          Submit another
        </button>
      </div>
    );
  }

  return (
    <form className="post-form" onSubmit={handleSubmit}>
      <input
        type="text"
        name="website"
        value={form.website}
        onChange={(e) => update("website", e.target.value)}
        className="post-honeypot"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />

      <div className="post-form-grid">
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
          Venue
          <input
            type="text"
            required
            maxLength={160}
            value={form.venue}
            onChange={(e) => update("venue", e.target.value)}
          />
        </label>

        <label className="post-field">
          Start date
          <input
            type="date"
            required
            value={form.start_date}
            onChange={(e) => update("start_date", e.target.value)}
          />
        </label>

        <label className="post-field">
          End date <span>(optional)</span>
          <input
            type="date"
            value={form.end_date}
            onChange={(e) => update("end_date", e.target.value)}
          />
        </label>

        <label className="post-field">
          Start time <span>(optional)</span>
          <input
            type="time"
            value={form.start_time}
            onChange={(e) => update("start_time", e.target.value)}
          />
        </label>

        <label className="post-field">
          Format <span>(optional)</span>
          <input
            type="text"
            maxLength={120}
            placeholder="e.g. 16 teams · Knockout"
            value={form.format}
            onChange={(e) => update("format", e.target.value)}
          />
        </label>

        <label className="post-field">
          Badge <span>(optional)</span>
          <input
            type="text"
            maxLength={40}
            placeholder="e.g. Filling fast"
            value={form.tag}
            onChange={(e) => update("tag", e.target.value)}
          />
        </label>

        <label className="post-field post-field-wide">
          Cover image URL <span>(optional)</span>
          <input
            type="url"
            maxLength={500}
            placeholder="https://…"
            value={form.image_url}
            onChange={(e) => update("image_url", e.target.value)}
          />
        </label>

        <label className="post-field post-field-wide">
          Description <span>(optional)</span>
          <textarea
            rows={4}
            maxLength={1000}
            placeholder="Tell players what to expect — format, rules, who can join…"
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
          />
        </label>

        <label className="post-field post-field-wide">
          Rules <span>(optional, one per line)</span>
          <textarea
            rows={4}
            maxLength={1000}
            placeholder={"e.g.\n16 teams, single elimination\nSquad of 11 + 3 substitutes"}
            value={form.rules}
            onChange={(e) => update("rules", e.target.value)}
          />
        </label>

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
          Entry fee unit
          <select
            value={form.entry_fee_unit}
            onChange={(e) => update("entry_fee_unit", e.target.value)}
          >
            {ENTRY_FEE_UNITS.map((u) => (
              <option key={u.value} value={u.value}>
                {u.label}
              </option>
            ))}
          </select>
        </label>

        <label className="post-field">
          Advance to book (₹) <span>(optional)</span>
          <input
            type="number"
            min="0"
            step="1"
            value={form.advance_amount}
            onChange={(e) => update("advance_amount", e.target.value)}
          />
        </label>

        <label className="post-field">
          Prize pool (₹)
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
          1st prize (₹) <span>(optional)</span>
          <input
            type="number"
            min="0"
            step="1"
            value={form.first_prize}
            onChange={(e) => update("first_prize", e.target.value)}
          />
        </label>

        <label className="post-field">
          2nd prize (₹) <span>(optional)</span>
          <input
            type="number"
            min="0"
            step="1"
            value={form.second_prize}
            onChange={(e) => update("second_prize", e.target.value)}
          />
        </label>

        <label className="post-field post-field-wide">
          Trophy / medal details <span>(optional)</span>
          <textarea
            rows={2}
            maxLength={400}
            placeholder="e.g. Winner trophy + 11 medals, runners-up mini-cup"
            value={form.trophy_details}
            onChange={(e) => update("trophy_details", e.target.value)}
          />
        </label>

        <label className="post-field post-field-wide">
          Other contact details <span>(optional)</span>
          <textarea
            rows={2}
            maxLength={400}
            placeholder="e.g. Ground manager (matchday only): +91…"
            value={form.other_contact}
            onChange={(e) => update("other_contact", e.target.value)}
          />
        </label>

        <label className="post-field">
          Your name
          <input
            type="text"
            required
            maxLength={80}
            value={form.organizer_name}
            onChange={(e) => update("organizer_name", e.target.value)}
          />
        </label>

        <label className="post-field">
          Email
          <input
            type="email"
            required
            value={form.organizer_email}
            onChange={(e) => update("organizer_email", e.target.value)}
          />
        </label>

        <label className="post-field">
          Phone
          <input
            type="tel"
            required
            value={form.organizer_phone}
            onChange={(e) => update("organizer_phone", e.target.value)}
          />
        </label>
      </div>

      {error && <p className="post-error">{error}</p>}

      <button
        type="submit"
        className="btn btn-primary"
        disabled={status === "submitting"}
      >
        {status === "submitting" ? "Submitting…" : "Submit for review"}
      </button>
    </form>
  );
}
