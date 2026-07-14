import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import PricingForm from "@/components/admin/PricingForm";

export default async function EditPricingPage({ params }) {
  const { id } = params;
  const { data: pkg } = await supabaseAdmin()
    .from("promotion_packages")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!pkg) {
    notFound();
  }

  return (
    <div className="admin-form-page">
      <Link href="/admin/pricing" className="admin-form-back">
        ← Back to pricing
      </Link>
      <h1 className="admin-page-title">Edit package</h1>
      <PricingForm mode="edit" initial={pkg} />
    </div>
  );
}
