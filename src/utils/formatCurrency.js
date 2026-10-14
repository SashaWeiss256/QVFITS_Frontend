/* Currency Formatting (from Quivogue js/app.js) */

/**
 * Every price is stored in UGX, the only currency the shop settles in. Other
 * currencies are display only. UGX shows its code ("UGX 250,000"), because
 * Intl's own symbol for it, "USh", is one nobody on this site has seen.
 */
export function formatIn(currency, ugx) {
  const value = (Number(ugx) || 0) * currency.perUGX;
  try {
    return new Intl.NumberFormat("en-UG", {
      style: "currency",
      currency: currency.code,
      currencyDisplay: currency.display || "narrowSymbol",
      minimumFractionDigits: currency.decimals,
      maximumFractionDigits: currency.decimals,
    }).format(value);
  } catch {
    // Older engines without that currency in their tables.
    return `${currency.code} ${value.toLocaleString("en-US", {
      minimumFractionDigits: currency.decimals,
      maximumFractionDigits: currency.decimals,
    })}`;
  }
}
