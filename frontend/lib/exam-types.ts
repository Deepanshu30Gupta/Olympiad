export const EXAM_TYPES = [
  // India
  { code: "IOQM", label: "IOQM / PRMO" },
  { code: "PRMO", label: "PRMO (legacy)" },
  { code: "RMO", label: "RMO" },
  { code: "INMO", label: "INMO" },

  // USA
  { code: "AMC10", label: "AMC 10" },
  { code: "AMC12", label: "AMC 12" },
  { code: "AIME", label: "AIME" },
  { code: "USAMO", label: "USAMO" },
  { code: "USAJMO", label: "USAJMO" },

  // UK / Europe
  { code: "BMO", label: "British Mathematical Olympiad" },
  { code: "EGMO", label: "European Girls' Mathematical Olympiad" },
  { code: "BALKAN_MO", label: "Balkan Mathematical Olympiad" },
  { code: "ARMO", label: "All-Russian Mathematical Olympiad" },

  // Asia Pacific
  { code: "APMO", label: "Asian Pacific Mathematics Olympiad" },
  { code: "CHINA_MO", label: "China Mathematical Olympiad" },

  // Americas
  { code: "CANADA_MO", label: "Canadian Mathematical Olympiad" },
  { code: "IBERO_MO", label: "Iberoamerican Mathematical Olympiad" },

  // International
  { code: "IMO", label: "International Mathematical Olympiad" },
] as const;

export type ExamTypeCode = (typeof EXAM_TYPES)[number]["code"];