export const EXAM_TYPES = [
  { code: "IOQM", label: "IOQM" },
  { code: "PRMO", label: "PRMO" },
  { code: "RMO", label: "RMO" },
  { code: "INMO", label: "INMO" },
  { code: "AMC10", label: "AMC 10" },
  { code: "AMC12", label: "AMC 12" },
  { code: "BMO", label: "British Mathematical Olympiad" },
  { code: "BALKAN_MO", label: "Balkan Mathematical Olympiad" },
] as const;

export type ExamTypeCode = (typeof EXAM_TYPES)[number]["code"];