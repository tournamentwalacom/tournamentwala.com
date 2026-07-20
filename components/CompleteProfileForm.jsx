"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CompleteProfileForm({
  initialName = "",
  initialPhone = "",
  mode = "create",
}) {
  const router = useRouter();
  const [fullName, setFullName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [status, setStatus] = useState("idle"); // idle | busy | error
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setStatus("busy");

    const res = await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ full_name: fullName, phone }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Couldn't save your details. Please try again.");
      setStatus("error");
      return;
    }

    router.refresh();
  }

  const isEdit = mode === "edit";

  return (
    <div className="auth-card">
      <h3>{isEdit ? "Edit your details" : "One last thing"}</h3>
      <p className="post-intro">
        {isEdit
          ? "Update your name and phone number — this is what organizers and our team see for you."
          : "Tell us your name and phone number so organizers and our team can reach you about your listing."}
      </p>

      <form className="post-form" onSubmit={handleSubmit}>
        <label className="post-field">
          Full name
          <input
            type="text"
            required
            maxLength={80}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </label>

        <label className="post-field">
          Phone number
          <input
            type="tel"
            required
            maxLength={20}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </label>

        {error && <p className="post-error">{error}</p>}

        <button type="submit" className="btn btn-primary" disabled={status === "busy"}>
          {status === "busy" ? "Saving…" : isEdit ? "Save changes" : "Continue"}
        </button>
      </form>
    </div>
  );
}
