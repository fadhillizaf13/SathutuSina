// UI form validation. Server must revalidate all data independently.
export function validateRecord(record, fields) {
  if (!record || typeof record !== "object") return "Invalid form data.";
  for (const key of fields) {
    const value = record[key];
    if (value === undefined || value === null || String(value).trim() === "")
      return `${key.replace(/([A-Z])/g, " $1")} is required.`;
    if (String(value).length > 500) return `${key} is too long (maximum 500 characters).`;
    if (["quantity", "price", "stock", "salary", "amount", "min", "capacity", "occupied", "basic", "overtime", "deductions"].includes(key) && (!Number.isFinite(Number(value)) || Number(value) < 0))
      return `${key} must be a valid non-negative number.`;
  }
  if (record.capacity !== undefined && record.occupied !== undefined && Number(record.occupied) > Number(record.capacity))
    return "Occupied units cannot exceed capacity.";
  if (record.from && record.to && record.from > record.to) return "End date must follow start date.";
  return "";
}
export function csvCell(value) {
  let text = String(value ?? "").replace(/\r|\n/g, " ").trim();
  // Avoid spreadsheet formula injection when someone opens an exported CSV.
  if (/^[=+@-]/.test(text)) text = "'" + text;
  return `"${text.replace(/"/g, '""')}"`;
}
