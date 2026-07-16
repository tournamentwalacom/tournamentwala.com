"use client";

import { useEffect, useState } from "react";

function formatPrice(n) {
  return `₹${Number(n).toLocaleString("en-IN")}`;
}

/**
 * Promotion add-on picker for the post-tournament form. Packages (names,
 * prices, descriptions) are fetched from /api/promotion-packages at runtime
 * rather than hardcoded here, so admins can add/edit/deactivate them from
 * /admin/pricing with no code change. The total shown here is a client-side
 * display only — the real total is always recomputed server-side on submit.
 */
export default function PromotionPackages({
  selections,
  onChange,
  onTelegramPackageSelected,
  onTelegramStateChange,
  onBriefStateChange,
}) {
  const [packages, setPackages] = useState(null);
  const [discount, setDiscount] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    fetch("/api/promotion-packages")
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        setPackages(data.packages || []);
        setDiscount(data.discount || null);
      })
      .catch(() => {
        if (!cancelled) setError("Couldn't load promotion packages. Please refresh the page.");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!packages || !onTelegramStateChange) return;
    const hasTelegramPackage = selections.some((s) =>
      packages.find((p) => p.id === s.package_id)?.requires_telegram_upload
    );
    onTelegramStateChange(hasTelegramPackage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [packages, selections]);

  useEffect(() => {
    if (!packages || !onBriefStateChange) return;
    const hasBriefPackage = selections.some((s) =>
      packages.find((p) => p.id === s.package_id)?.requires_brief
    );
    onBriefStateChange(hasBriefPackage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [packages, selections]);

  function selectionFor(packageId) {
    return selections.find((s) => s.package_id === packageId);
  }

  function toggle(pkg) {
    const existing = selectionFor(pkg.id);
    if (existing) {
      onChange(selections.filter((s) => s.package_id !== pkg.id));
      return;
    }

    onChange([...selections, { package_id: pkg.id, quantity: 1 }]);
    if (pkg.requires_telegram_upload) {
      onTelegramPackageSelected();
    }
  }

  function setQuantity(packageId, quantity) {
    onChange(
      selections.map((s) =>
        s.package_id === packageId ? { ...s, quantity: Math.max(1, quantity) } : s
      )
    );
  }

  if (error) {
    return <p className="post-error post-field-wide">{error}</p>;
  }

  if (!packages) {
    return <p className="post-field-wide promo-loading">Loading promotion packages…</p>;
  }

  const paidPackages = packages.filter((p) => !p.is_free);
  const freePackage = packages.find((p) => p.is_free);

  const total = paidPackages.reduce((sum, pkg) => {
    const s = selectionFor(pkg.id);
    return s ? sum + pkg.price * s.quantity : sum;
  }, 0);

  return (
    <div className="post-field-wide">
      {discount?.is_active && discount.message && (
        <p className="promo-discount-banner">🔥 {discount.message}</p>
      )}

      {freePackage && (
        <p className="promo-free-note">
          ✓ {freePackage.name} included free with every submission — {freePackage.description}
        </p>
      )}

      <div className="promo-grid">
        {paidPackages.map((pkg) => {
          const selected = selectionFor(pkg.id);
          return (
            <label
              key={pkg.id}
              className={`promo-card${selected ? " promo-card-selected" : ""}`}
            >
              <div className="promo-card-header">
                <input
                  type="checkbox"
                  checked={Boolean(selected)}
                  onChange={() => toggle(pkg)}
                />
                <span className="promo-card-name">{pkg.name}</span>
                <span className="promo-card-price">
                  {pkg.original_price != null && (
                    <span className="promo-card-price-original">
                      {formatPrice(pkg.original_price)}
                    </span>
                  )}
                  {formatPrice(pkg.price)}
                  {pkg.price_unit ? ` / ${pkg.price_unit}` : ""}
                </span>
              </div>
              {pkg.description && <p className="promo-card-desc">{pkg.description}</p>}
              {pkg.allow_quantity && selected && (
                <div className="promo-card-qty" onClick={(e) => e.preventDefault()}>
                  <span>Quantity</span>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={selected.quantity}
                    onChange={(e) => setQuantity(pkg.id, Number(e.target.value) || 1)}
                  />
                </div>
              )}
            </label>
          );
        })}
      </div>

      <div className="promo-total-bar">
        <span>Total add-ons</span>
        <strong>{formatPrice(total)}</strong>
      </div>
    </div>
  );
}
