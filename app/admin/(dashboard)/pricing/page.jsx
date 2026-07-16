import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase";
import DiscountBar from "@/components/admin/DiscountBar";

function formatPrice(pkg) {
  if (pkg.is_free) return "Free";
  const amount = `₹${Number(pkg.price).toLocaleString("en-IN")}`;
  return pkg.price_unit ? `${amount} / ${pkg.price_unit}` : amount;
}

export default async function AdminPricingPage() {
  const db = supabaseAdmin();
  const [{ data: packages }, { data: discount }] = await Promise.all([
    db.from("promotion_packages").select("*").order("sort_order", { ascending: true }),
    db.from("promotion_discount").select("message, percentage, is_active").eq("id", 1).maybeSingle(),
  ]);

  return (
    <>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Pricing</h1>
        <div className="admin-page-header-actions">
          <DiscountBar initial={discount || { message: null, percentage: 0, is_active: false }} />
          <Link href="/admin/pricing/new" className="btn btn-primary admin-add-btn">
            + Add package
          </Link>
        </div>
      </div>

      {!packages?.length ? (
        <div className="admin-placeholder">No promotion packages yet.</div>
      ) : (
        <div className="admin-table-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Package</th>
                <th>Price</th>
                <th>Quantity?</th>
                <th>Telegram?</th>
                <th>Brief?</th>
                <th>Active</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {packages.map((pkg) => (
                <tr key={pkg.id}>
                  <td>
                    <strong>{pkg.name}</strong>
                    {pkg.description && (
                      <div className="admin-row-sub">{pkg.description}</div>
                    )}
                  </td>
                  <td>{formatPrice(pkg)}</td>
                  <td>{pkg.allow_quantity ? "Yes" : "—"}</td>
                  <td>{pkg.requires_telegram_upload ? "Yes" : "—"}</td>
                  <td>{pkg.requires_brief ? "Yes" : "—"}</td>
                  <td>{pkg.is_active ? "Active" : "Hidden"}</td>
                  <td className="admin-row-actions">
                    <Link href={`/admin/pricing/${pkg.id}/edit`} className="admin-btn">
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
