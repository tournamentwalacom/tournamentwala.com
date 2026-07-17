"use client";

import { useState } from "react";

const REASONS = [
  { value: "general", label: "General question" },
  { value: "player", label: "Player support" },
  { value: "organizer", label: "Organizer support" },
];

const initialForm = {
  name: "",
  email: "",
  phone: "",
  reason: "general",
  message: "",
  website: "", // honeypot — real users never fill this in
};

export default function ContactForm() {
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

    try {
      const res = await fetch("/api/contact/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
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
        <h3>Message sent — thanks!</h3>
        <p>
          We typically reply within 24 hrs. Keep an eye on the email you
          gave us.
        </p>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => setStatus("idle")}
        >
          Send another
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
        <label className="post-field">
          Your name
          <input
            type="text"
            required
            maxLength={80}
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
          />
        </label>

        <label className="post-field">
          Email
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
          />
        </label>

        <label className="post-field">
          Phone
          <input
            type="tel"
            required
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
          />
        </label>

        <label className="post-field">
          I&rsquo;m reaching out as
          <select
            value={form.reason}
            onChange={(e) => update("reason", e.target.value)}
          >
            {REASONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </label>

        <label className="post-field post-field-wide">
          Message
          <textarea
            required
            maxLength={2000}
            rows={6}
            value={form.message}
            onChange={(e) => update("message", e.target.value)}
          />
        </label>
      </div>

      {error && <p className="post-error">{error}</p>}

      <button
        type="submit"
        className="btn btn-primary"
        disabled={status === "submitting"}
      >
        {status === "submitting" ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
