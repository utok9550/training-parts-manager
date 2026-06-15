import {
  TRAINING_PARTS,
  type PartSummary,
  type Priority,
  type TrainingLog,
} from "../types";
import { differenceInDays, isWithinRecentSevenDays } from "./date";

function getPriority(
  hasLog: boolean,
  recentCount: number,
  elapsedDays: number | null,
): Priority {
  if (!hasLog || recentCount === 0) {
    return "最優先";
  }
  if (recentCount >= 2) {
    return "低";
  }
  return elapsedDays !== null && elapsedDays >= 2 ? "高" : "中";
}

export function buildPartSummaries(
  logs: TrainingLog[],
  today: string,
): PartSummary[] {
  return TRAINING_PARTS.map((part) => {
    const partLogs = logs.filter((log) => log.parts.includes(part));
    const lastDate =
      partLogs.reduce<string | null>(
        (latest, log) => (!latest || log.date > latest ? log.date : latest),
        null,
      );
    const elapsedDays =
      lastDate === null ? null : differenceInDays(today, lastDate);
    const recentCount = partLogs.filter((log) =>
      isWithinRecentSevenDays(log.date, today),
    ).length;

    return {
      part,
      lastDate,
      elapsedDays,
      recentCount,
      priority: getPriority(partLogs.length > 0, recentCount, elapsedDays),
    };
  });
}
