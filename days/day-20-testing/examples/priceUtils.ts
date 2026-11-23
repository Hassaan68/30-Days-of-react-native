export interface CartLineItem {
  id: string;
  name: string;
  unitPriceCents: number;
  quantity: number;
}

export interface CartSummary {
  subtotalCents: number;
  discountCents: number;
  taxCents: number;
  totalCents: number;
}

/**
 * Calculates the raw subtotal in integer cents to avoid floating-point drift.
 */
export function calculateSubtotalCents(items: readonly CartLineItem[]): number {
  return items.reduce((sum, item) => {
    if (item.unitPriceCents < 0 || item.quantity < 0) {
      throw new RangeError('Item price and quantity must be non-negative.');
    }
    return sum + item.unitPriceCents * item.quantity;
  }, 0);
}

/**
 * Applies a percentage discount (0-100) to an amount in cents, rounding to the nearest cent.
 */
export function applyDiscountPercent(amountCents: number, discountPercent: number): number {
  if (amountCents < 0) {
    throw new RangeError('Amount must be non-negative.');
  }
  if (discountPercent < 0 || discountPercent > 100) {
    throw new RangeError('Discount percent must be between 0 and 100.');
  }
  const discountCents = Math.round((amountCents * discountPercent) / 100);
  return amountCents - discountCents;
}

/**
 * Computes subtotal, discount, tax, and final total in integer cents.
 */
export function calculateCartSummary(
  items: readonly CartLineItem[],
  options: { discountPercent?: number; taxRatePercent?: number } = {},
): CartSummary {
  const discountPercent = options.discountPercent ?? 0;
  const taxRatePercent = options.taxRatePercent ?? 0;

  if (taxRatePercent < 0 || taxRatePercent > 100) {
    throw new RangeError('Tax rate must be between 0 and 100.');
  }

  const subtotalCents = calculateSubtotalCents(items);
  const discountedCents = applyDiscountPercent(subtotalCents, discountPercent);
  const discountCents = subtotalCents - discountedCents;
  const taxCents = Math.round((discountedCents * taxRatePercent) / 100);
  const totalCents = discountedCents + taxCents;

  return {
    subtotalCents,
    discountCents,
    taxCents,
    totalCents,
  };
}

/**
 * Formats integer cents as a USD currency string (e.g., 1250 -> "$12.50").
 */
export function formatCurrency(cents: number): string {
  const isNegative = cents < 0;
  const absoluteDollars = (Math.abs(cents) / 100).toFixed(2);
  return isNegative ? `-$${absoluteDollars}` : `$${absoluteDollars}`;
}
