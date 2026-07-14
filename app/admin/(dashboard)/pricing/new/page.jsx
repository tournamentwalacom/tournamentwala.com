import Link from "next/link";
import PricingForm from "@/components/admin/PricingForm";

export default function NewPricingPage() {
  return (
    <div className="admin-form-page">
      <Link href="/admin/pricing" className="admin-form-back">
        ← Back to pricing
      </Link>
      <h1 className="admin-page-title">Add package</h1>
      <PricingForm mode="create" />
    </div>
  );
}
