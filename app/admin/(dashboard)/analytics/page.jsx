import { supabaseAdmin } from "@/lib/supabase";
import AnalyticsDashboard from "@/components/admin/AnalyticsDashboard";

function monthsAgoIso(n) {
  const d = new Date();
  d.setMonth(d.getMonth() - n, 1);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

export default async function AdminAnalyticsPage() {
  const db = supabaseAdmin();

  const [{ data: tournaments }, { data: expenses }] = await Promise.all([
    db
      .from("tournaments")
      .select("id, created_at, status, sport, city, promotion_total, promotions")
      .gte("created_at", monthsAgoIso(24))
      .order("created_at", { ascending: true }),
    db.from("expenses").select("amount, expense_date, category").order("expense_date", { ascending: true }),
  ]);

  return (
    <>
      <h1 className="admin-page-title">Analytics</h1>
      <AnalyticsDashboard tournaments={tournaments || []} expenses={expenses || []} />
    </>
  );
}
