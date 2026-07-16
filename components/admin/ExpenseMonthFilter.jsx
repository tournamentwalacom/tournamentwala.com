"use client";

import { useRouter } from "next/navigation";

export default function ExpenseMonthFilter({ month }) {
  const router = useRouter();

  return (
    <input
      type="month"
      className="admin-query-status-select"
      value={month}
      onChange={(e) => {
        if (e.target.value) router.push(`/admin/expenses?month=${e.target.value}`);
      }}
    />
  );
}
