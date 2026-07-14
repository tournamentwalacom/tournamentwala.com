// Shared between the public submit route and the admin pricing CRUD routes.
// Prices are always resolved server-side from the DB — a submitted
// promotions payload only ever carries { package_id, quantity }, never a
// price or total, so the client can't influence what gets charged/recorded.

const MAX_QUANTITY = 50;

function trimmed(value, maxLength) {
  if (typeof value !== "string") return null;
  const t = value.trim();
  if (!t || t.length > maxLength) return null;
  return t;
}

function nonNegativeNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

/**
 * Takes the client's raw `promotions` array (untrusted) and resolves it
 * against currently-active packages in the DB, computing quantity/subtotal/
 * total itself. Unknown, inactive, or free package ids are silently dropped.
 */
export async function resolvePromotionSelections(db, rawSelections) {
  if (!Array.isArray(rawSelections) || rawSelections.length === 0) {
    return { selections: [], total: 0, error: null };
  }

  const ids = [...new Set(rawSelections.map((s) => s?.package_id).filter(Boolean))];
  if (!ids.length) return { selections: [], total: 0, error: null };

  const { data: packages, error } = await db
    .from("promotion_packages")
    .select("*")
    .in("id", ids)
    .eq("is_active", true);

  if (error) {
    return { selections: null, total: 0, error: "Couldn't validate promotion packages." };
  }

  const byId = new Map(packages.map((p) => [p.id, p]));
  const selections = [];
  let total = 0;

  for (const raw of rawSelections) {
    const pkg = byId.get(raw?.package_id);
    if (!pkg || pkg.is_free) continue;

    const quantity = pkg.allow_quantity
      ? Math.max(1, Math.min(MAX_QUANTITY, Math.floor(Number(raw.quantity)) || 1))
      : 1;
    const price = Number(pkg.price);
    const subtotal = price * quantity;

    selections.push({
      package_id: pkg.id,
      name: pkg.name,
      price,
      price_unit: pkg.price_unit,
      quantity,
      subtotal,
    });
    total += subtotal;
  }

  return { selections, total, error: null };
}

/**
 * Validates an admin create/update payload for a promotion package. Returns
 * { data, error } — data is null when error is set.
 */
export function parsePricingPackageInput(body) {
  const name = trimmed(body.name, 120);
  const description =
    typeof body.description === "string" ? body.description.trim().slice(0, 500) || null : null;
  const price = nonNegativeNumber(body.price);
  const price_unit =
    typeof body.price_unit === "string" && body.price_unit.trim()
      ? body.price_unit.trim().slice(0, 40)
      : null;
  const allow_quantity = Boolean(body.allow_quantity);
  const requires_telegram_upload = Boolean(body.requires_telegram_upload);
  const requires_brief = Boolean(body.requires_brief);
  const is_free = Boolean(body.is_free);
  const is_active = body.is_active === undefined ? true : Boolean(body.is_active);
  const sort_order = Number.isFinite(Number(body.sort_order)) ? Math.trunc(Number(body.sort_order)) : 0;

  if (!name || price === null) {
    return { data: null, error: "Please fill in all required fields correctly." };
  }

  return {
    data: {
      name,
      description,
      price,
      price_unit,
      allow_quantity,
      requires_telegram_upload,
      requires_brief,
      is_free,
      is_active,
      sort_order,
    },
    error: null,
  };
}
