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
 * Knocks `percentage` off `price`, rounded to the nearest rupee. Shared by
 * the server-side charge calculation (resolvePromotionSelections) and the
 * public /api/promotion-packages route (display prices) so the two never
 * disagree about what a discounted price actually is.
 */
export function applyDiscount(price, percentage) {
  const pct = Number(percentage) || 0;
  if (pct <= 0) return Number(price);
  return Math.round(Number(price) * (1 - pct / 100));
}

/**
 * Fetches the singleton discount row. Returns { message, percentage, is_active }
 * with percentage forced to 0 when inactive, so callers never need to check
 * is_active separately before using percentage.
 */
export async function getActiveDiscount(db) {
  const { data } = await db
    .from("promotion_discount")
    .select("message, percentage, is_active")
    .eq("id", 1)
    .maybeSingle();

  if (!data || !data.is_active) {
    return { message: null, percentage: 0, is_active: false };
  }

  return { message: data.message, percentage: Number(data.percentage) || 0, is_active: true };
}

/**
 * Takes the client's raw `promotions` array (untrusted) and resolves it
 * against currently-active packages in the DB, computing quantity/subtotal/
 * total itself. Unknown, inactive, or free package ids are silently dropped.
 * Any active site-wide discount is applied to the per-unit price here, so
 * the charged total always matches what the picker displayed.
 */
export async function resolvePromotionSelections(db, rawSelections) {
  if (!Array.isArray(rawSelections) || rawSelections.length === 0) {
    return { selections: [], total: 0, requiresBrief: false, error: null };
  }

  const ids = [...new Set(rawSelections.map((s) => s?.package_id).filter(Boolean))];
  if (!ids.length) return { selections: [], total: 0, requiresBrief: false, error: null };

  const { data: packages, error } = await db
    .from("promotion_packages")
    .select("*")
    .in("id", ids)
    .eq("is_active", true);

  if (error) {
    return { selections: null, total: 0, requiresBrief: false, error: "Couldn't validate promotion packages." };
  }

  const discount = await getActiveDiscount(db);

  const byId = new Map(packages.map((p) => [p.id, p]));
  const selections = [];
  let total = 0;
  // Mirrors the client's needsBrief check (PromotionPackages.jsx) — a
  // Poster Design / Reel Creation package selected server-side means the
  // main poster upload isn't required, since our team creates it instead.
  let requiresBrief = false;

  for (const raw of rawSelections) {
    const pkg = byId.get(raw?.package_id);
    if (!pkg) continue;
    if (pkg.requires_brief) requiresBrief = true;
    if (pkg.is_free) continue;

    const quantity = pkg.allow_quantity
      ? Math.max(1, Math.min(MAX_QUANTITY, Math.floor(Number(raw.quantity)) || 1))
      : 1;
    const price = applyDiscount(pkg.price, discount.percentage);
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

  return { selections, total, requiresBrief, error: null };
}

/**
 * Validates an admin discount/announcement payload. Returns { data, error } —
 * data is null when error is set. message is optional (no message = no
 * banner, discount can still apply silently); percentage 0 effectively
 * disables the discount even if is_active is true.
 */
export function parseDiscountInput(body) {
  const message =
    typeof body.message === "string" && body.message.trim()
      ? body.message.trim().slice(0, 200)
      : null;
  const percentage = nonNegativeNumber(body.percentage);
  const is_active = Boolean(body.is_active);

  if (percentage === null || percentage > 100) {
    return { data: null, error: "Percentage must be a number between 0 and 100." };
  }

  return { data: { message, percentage, is_active }, error: null };
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
