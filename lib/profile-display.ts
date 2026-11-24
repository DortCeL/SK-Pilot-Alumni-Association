import { BD_DIVISIONS } from "@/lib/constants";
import { districtLabel } from "@/lib/divisions-districts";
import type { Locale } from "@/lib/messages";

export type ProfileAddress = {
  regionType?: string;
  division?: string;
  district?: string;
  upazila?: string;
  postOffice?: string;
  streetAddress?: string;
  country?: string;
  customCountry?: string;
  stateOrRegion?: string;
  city?: string;
  postalCode?: string;
};

export function displayValue(value?: string | number | null) {
  if (value === undefined || value === null || String(value).trim() === "") return "—";
  return String(value);
}

export function formatAddress(address?: ProfileAddress | null, lang: Locale = "bn") {
  if (!address) return "—";
  if (address.regionType === "overseas") {
    const country = address.country === "CUSTOM" ? address.customCountry : address.country;
    const text = [address.streetAddress, address.city, address.stateOrRegion, address.postalCode, country]
      .filter(Boolean)
      .join(", ");
    return text || "—";
  }

  const divisionItem = BD_DIVISIONS.find((item) => item.value === address.division);
  const division =
    lang === "en" ? (divisionItem?.en ?? address.division) : (divisionItem?.label ?? address.division);
  const district = address.district ? districtLabel(address.district, lang) : "";
  const text = [address.streetAddress, address.upazila, address.postOffice, district, division]
    .filter(Boolean)
    .join(", ");
  return text || "—";
}
