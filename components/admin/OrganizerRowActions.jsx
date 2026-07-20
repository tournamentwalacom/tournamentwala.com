"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function OrganizerRowActions({ organizer, tournamentCount }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function deleteOrganizer() {
    const name = organizer.full_name || organizer.email || "this organizer";
    const warning =
      tournamentCount > 0
        ? ` They have ${tournamentCount} posted tournament${
            tournamentCount === 1 ? "" : "s"
          }, which will be kept but unlinked from their account.`
        : "";
    if (!window.confirm(`Delete "${name}"?${warning} This cannot be undone.`)) {
      return;
    }
    setBusy(true);
    const res = await fetch(`/api/admin/organizers/${organizer.id}`, { method: "DELETE" });
    setBusy(false);
    if (res.ok) {
      router.refresh();
    } else {
      alert("Couldn't delete this organizer. Please try again.");
    }
  }

  return (
    <button
      type="button"
      className="admin-btn admin-btn-reject"
      disabled={busy}
      onClick={deleteOrganizer}
    >
      Delete
    </button>
  );
}
