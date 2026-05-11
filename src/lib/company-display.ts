import type { CompanySize } from "@/types/company";

const SIZE_LABELS: Record<CompanySize, string> = {
  STARTUP: "Startup",
  SMB: "SMB",
  MID_MARKET: "Mid-market",
  ENTERPRISE: "Enterprise",
};

export function formatCompanySize(size: CompanySize) {
  return SIZE_LABELS[size];
}

export function companyInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
