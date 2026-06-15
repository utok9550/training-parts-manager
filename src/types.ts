export const TRAINING_PARTS = [
  "胸",
  "肩",
  "背中",
  "脚",
  "腕（二頭）",
  "腕（三頭）",
] as const;

export const INTENSITIES = ["軽め", "普通", "重め"] as const;

export type TrainingPart = (typeof TRAINING_PARTS)[number];
export type Intensity = (typeof INTENSITIES)[number];
export type Priority = "最優先" | "高" | "中" | "低";

export type TrainingLog = {
  id: string;
  date: string;
  parts: TrainingPart[];
  intensity: Intensity;
  memo: string;
};

export type PartSummary = {
  part: TrainingPart;
  lastDate: string | null;
  elapsedDays: number | null;
  recentCount: number;
  priority: Priority;
};
