export function formatCurrency(value: number | null | undefined) {
  if (value == null) {
    return "N/A";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(value);
}

export function roundCurrency(value: number) {
  return Math.round(value * 100) / 100;
}
