import { useMemo, useState } from "react";
import { HistoryView } from "./components/HistoryView";
import { SummaryView } from "./components/SummaryView";
import { TrainingForm } from "./components/TrainingForm";
import {
  INTENSITIES,
  TRAINING_PARTS,
  type Intensity,
  type TrainingLog,
  type TrainingPart,
} from "./types";
import { getToday } from "./utils/date";
import { buildPartSummaries } from "./utils/summary";

const STORAGE_KEY = "training_logs_v1";

type Tab = "record" | "summary" | "history";

const tabs: { id: Tab; label: string }[] = [
  { id: "record", label: "記録" },
  { id: "summary", label: "サマリー" },
  { id: "history", label: "履歴" },
];

function loadLogs(): TrainingLog[] {
  try {
    const savedLogs = localStorage.getItem(STORAGE_KEY);
    if (!savedLogs) {
      return [];
    }
    const parsedLogs: unknown = JSON.parse(savedLogs);
    if (!Array.isArray(parsedLogs)) {
      return [];
    }

    return parsedLogs.flatMap((value): TrainingLog[] => {
      if (
        typeof value !== "object" ||
        value === null ||
        typeof value.id !== "string" ||
        typeof value.date !== "string" ||
        !Array.isArray(value.parts) ||
        !INTENSITIES.includes(value.intensity as Intensity)
      ) {
        return [];
      }

      const parts: TrainingPart[] = (value.parts as unknown[])
        .map((part: unknown): string => {
          if (part === "二頭") return "腕（二頭）";
          if (part === "三頭") return "腕（三頭）";
          return typeof part === "string" ? part : "";
        })
        .filter((part: string): part is TrainingPart =>
          TRAINING_PARTS.includes(part as TrainingPart),
        );

      if (parts.length === 0) {
        return [];
      }

      return [
        {
          id: value.id,
          date: value.date,
          parts: [...new Set(parts)],
          intensity: value.intensity as Intensity,
          memo: typeof value.memo === "string" ? value.memo : "",
        },
      ];
    });
  } catch {
    return [];
  }
}

function App() {
  const [activeTab, setActiveTab] = useState<Tab>("record");
  const [logs, setLogs] = useState<TrainingLog[]>(loadLogs);
  const summaries = useMemo(
    () => buildPartSummaries(logs, getToday()),
    [logs],
  );

  const updateLogs = (nextLogs: TrainingLog[]) => {
    setLogs(nextLogs);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextLogs));
  };

  const saveLog = (log: TrainingLog) => {
    updateLogs([...logs, log]);
  };

  const deleteLog = (id: string) => {
    updateLogs(logs.filter((log) => log.id !== id));
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">
          <div className="brand-mark" aria-hidden="true">
            M
          </div>
          <div>
            <h1>筋トレ部位管理</h1>
            <p>TRAIN SMARTER, RECOVER BETTER</p>
          </div>
        </div>
      </header>

      <nav className="tab-navigation" aria-label="画面切り替え">
        {tabs.map((tab) => (
          <button
            className={activeTab === tab.id ? "is-active" : ""}
            type="button"
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            aria-current={activeTab === tab.id ? "page" : undefined}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <main>
        {activeTab === "record" && <TrainingForm onSave={saveLog} />}
        {activeTab === "summary" && (
          <SummaryView summaries={summaries} />
        )}
        {activeTab === "history" && (
          <HistoryView logs={logs} onDelete={deleteLog} />
        )}
      </main>

      <footer>
        <p>データはこの端末のブラウザに保存されます。</p>
      </footer>
    </div>
  );
}

export default App;
