export const ACADEMIC_PROGRAM = "মাধ্যমিক (SSC)" as const;

export const GROUP_OPTIONS = [
  { value: "Science", label: "Science" },
  { value: "Commerce / Business Studies", label: "Commerce / Business Studies" },
  { value: "Humanities", label: "Humanities" },
] as const;

export const PASSING_YEARS = Array.from({ length: 2026 - 1962 + 1 }, (_, i) =>
  String(2026 - i),
);

export const OVERSEAS_COUNTRIES = [
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "United Arab Emirates",
  "Saudi Arabia",
  "Qatar",
  "Kuwait",
  "Oman",
  "Malaysia",
  "Singapore",
  "Germany",
  "Italy",
  "France",
  "Sweden",
  "Japan",
  "India",
  "Pakistan",
  "Nepal",
  "South Korea",
  "Bangladesh",
] as const;

export const BD_DIVISIONS = [
  { value: "Barishal", label: "বরিশাল (Barishal)", en: "Barishal" },
  { value: "Chattogram", label: "চট্টগ্রাম (Chattogram)", en: "Chattogram" },
  { value: "Dhaka", label: "ঢাকা (Dhaka)", en: "Dhaka" },
  { value: "Khulna", label: "খুলনা (Khulna)", en: "Khulna" },
  { value: "Rajshahi", label: "রাজশাহী (Rajshahi)", en: "Rajshahi" },
  { value: "Rangpur", label: "রংপুর (Rangpur)", en: "Rangpur" },
  { value: "Sylhet", label: "সিলেট (Sylhet)", en: "Sylhet" },
  { value: "Mymensingh", label: "ময়মনসিংহ (Mymensingh)", en: "Mymensingh" },
] as const;