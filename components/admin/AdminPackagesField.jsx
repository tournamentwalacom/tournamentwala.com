"use client";

import { useEffect, useState } from "react";

function formatPrice(n) {
  return `₹${Number(n).toLocaleString("en-IN")}`;
}

/**
 * Admin equivalent of components/PromotionPackages.jsx, used on the manual
 * tournament form (create + edit) so admin-created orders can carry the same
 * promotions/promotion_total data public submissions do. Unlike the public
 * picker, every line's price is admin-editable and a manual "apply offer %"
 * control can knock every selected line down to ₹0 for a free/promo order —
 * the public route always re-derives prices server-side and never trusts the
 * client, but this route is admin-session-gated so the admin's own numbers
 * are trusted directly (see lib/tournamentValidation.js#optionalPromotions).
 */
export default function AdminPackagesField({ value, onChange }) {
  const [packages, setPackages] = useState(null);
  const [error, setError] = useState("");
  const [discountPct, setDiscountPct] = useState("");

  const promotions = value?.promotions || [];

  useEffect(() => {
    let cancelled = false;

    fetch("/api/promotion-packages")
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        setPackages((data.packages || []).map((p) => ({ ...p, price: p.original_price ?? p.price })));
      })
      .catch(() => {
        if (!cancelled) setError("Couldn't load packages. Please refresh the page.");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  function selectionFor(packageId) {
    return promotions.find((s) => s.package_id === packageId);
  }

  function emit(nextPromotions) {
    const promotion_total = nextPromotions.reduce((sum, s) => sum + Number(s.subtotal || 0), 0);
    onChange({ promotions: nextPromotions, promotion_total });
  }

  function toggle(pkg) {
    const existing = selectionFor(pkg.id);
    if (existing) {
      emit(promotions.filter((s) => s.package_id !== pkg.id));
      return;
    }

    emit([
      ...promotions,
      {
        package_id: pkg.id,
        name: pkg.name,
        price: pkg.price,
        price_unit: pkg.price_unit,
        quantity: 1,
        subtotal: pkg.price,
      },
    ]);
  }

  function updateLine(packageId, patch) {
    emit(
      promotions.map((s) => {
        if (s.package_id !== packageId) return s;
        const next = { ...s, ...patch };
        next.subtotal = Number(next.price) * Number(next.quantity);
        return next;
      })
    );
  }

  function applyDiscount() {
    const pct = Number(discountPct);
    if (!Number.isFinite(pct) || pct < 0 || pct > 100) return;

    emit(
      promotions.map((s) => {
        const pkg = packages.find((p) => p.id === s.package_id);
        const basePrice = pkg ? pkg.price : s.price;
        const price = Math.round(basePrice * (1 - pct / 100));
        return { ...s, price, subtotal: price * Number(s.quantity) };
      })
    );
  }

  if (error) {
    return <p className="post-error post-field-wide">{error}</p>;
  }

  if (!packages) {
    return <p className="post-field-wide promo-loading">Loading packages…</p>;
  }

  const paidPackages = packages.filter((p) => !p.is_free);
  const freePackage = packages.find((p) => p.is_free);
  const total = promotions.reduce((sum, s) => sum + Number(s.subtotal || 0), 0);

  return (
    <div className="post-field-wide">
      {freePackage && (
        <p className="promo-free-note">
          ✓ {freePackage.name} included free with every tournament — {freePackage.description}
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
                <input type="checkbox" checked={Boolean(selected)} onChange={() => toggle(pkg)} />
                <span className="promo-card-name">{pkg.name}</span>
                <span className="promo-card-price">
                  {formatPrice(pkg.price)}
                  {pkg.price_unit ? ` / ${pkg.price_unit}` : ""}
                </span>
              </div>
              {pkg.description && <p className="promo-card-desc">{pkg.description}</p>}

              {selected && (
                <div className="admin-promo-line" onClick={(e) => e.preventDefault()}>
                  {pkg.allow_quantity && (
                    <label className="admin-promo-line-field">
                      Qty
                      <input
                        type="number"
                        min="1"
                        max="50"
                        value={selected.quantity}
                        onChange={(e) =>
                          updateLine(pkg.id, { quantity: Math.max(1, Number(e.target.value) || 1) })
                        }
                        onWheel={(e) => e.target.blur()}
                      />
                    </label>
                  )}
                  <label className="admin-promo-line-field">
                    Price (₹)
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={selected.price}
                      onChange={(e) => updateLine(pkg.id, { price: Math.max(0, Number(e.target.value) || 0) })}
                      onWheel={(e) => e.target.blur()}
                    />
                  </label>
                  <span className="admin-promo-line-subtotal">{formatPrice(selected.subtotal)}</span>
                </div>
              )}
            </label>
          );
        })}
      </div>

      <div className="admin-promo-offer">
        <label className="admin-promo-line-field">
          Apply offer (%)
          <input
            type="number"
            min="0"
            max="100"
            step="1"
            placeholder="e.g. 50, or 100 for free"
            value={discountPct}
            onChange={(e) => setDiscountPct(e.target.value)}
            onWheel={(e) => e.target.blur()}
          />
        </label>
        <button
          type="button"
          className="admin-btn"
          disabled={!promotions.length || discountPct === ""}
          onClick={applyDiscount}
        >
          Apply to selected packages
        </button>
      </div>

      <div className="promo-total-bar">
        <span>Total</span>
        <strong>{formatPrice(total)}</strong>
      </div>
    </div>
  );
}
