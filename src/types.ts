export const TRAINING_PARTS = [
  "胸",
  "肩",
  "背中",
  "脚",
  "二頭",
  "三頭",
  "腹",
] as const;

export const MENU_NAMES = [
  "胸・肩",
  "背中・脚",
  "胸のみ",
  "背中のみ",
  "脚のみ",
  "腕",
  "調整日",
  "その他",
] as const;

export const INTENSITIES = ["軽め", "普通", "重め"] as const;

export type TrainingPart = (typeof TRAINING_PARTS)[number];
export type MenuName = (typeof MENU_NAMES)[number];
export type Intensity = (typeof INTENSITIES)[number];
export type Priority = "最優先" | "高" | "中" | "低";

export type TrainingLog = {
  id: string;
  date: string;
  menuName: string;
  parts: string[];
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
