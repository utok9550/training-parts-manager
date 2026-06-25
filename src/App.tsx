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
const BACKUP_STORAGE_KEY = "training_logs_v1_backup";
const APP_VERSION = "2026.06.25.1";

type Tab = "record" | "summary" | "history";

const tabs: { id: Tab; label: string }[] = [
  { id: "record", label: "記録" },
  { id: "summary", label: "サマリー" },
  { id: "history", label: "履歴" },
];

function parseLogs(savedLogs: string | null): TrainingLog[] | null {
  try {
    if (!savedLogs) {
      return null;
    }
    const parsedLogs: unknown = JSON.parse(savedLogs);
    if (!Array.isArray(parsedLogs)) {
      return null;
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
    return null;
  }
}

function loadLogs(): TrainingLog[] {
  const savedLogs = parseLogs(localStorage.getItem(STORAGE_KEY));
  if (savedLogs !== null) {
    return savedLogs;
  }

  const backupLogs = parseLogs(localStorage.getItem(BACKUP_STORAGE_KEY));
  return backupLogs ?? [];
}

function App() {
  const [activeTab, setActiveTab] = useState<Tab>("record");
  const [logs, setLogs] = useState<TrainingLog[]>(loadLogs);
  const summaries = useMemo(
    () => buildPartSummaries(logs, getToday()),
    [logs],
  );

  const updateLogs = (nextLogs: TrainingLog[]) => {
    try {
      const serializedLogs = JSON.stringify(nextLogs);
      localStorage.setItem(STORAGE_KEY, serializedLogs);
      localStorage.setItem(BACKUP_STORAGE_KEY, serializedLogs);
      setLogs(nextLogs);
      return true;
    } catch {
      window.alert(
        "記録の保存に失敗しました。ブラウザの空き容量やサイトデータ設定を確認してください。",
      );
      return false;
    }
  };

  const saveLog = (log: TrainingLog) => {
    return updateLogs([...logs, log]);
  };

  const deleteLog = (id: string) => {
    updateLogs(logs.filter((log) => log.id !== id));
  };

  const importLogs = (serializedLogs: string) => {
    const importedLogs = parseLogs(serializedLogs);
    if (importedLogs === null) {
      return null;
    }

    const savedIds = new Set(logs.map((log) => log.id));
    const mergedLogs = [...logs];
    let importedCount = 0;

    importedLogs.forEach((log) => {
      if (savedIds.has(log.id)) {
        return;
      }

      savedIds.add(log.id);
      mergedLogs.push(log);
      importedCount += 1;
    });

    return updateLogs(mergedLogs) ? importedCount : null;
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
          <HistoryView
            logs={logs}
            onDelete={deleteLog}
            onImport={importLogs}
          />
        )}
      </main>

      <footer>
        <p>データはこの端末のブラウザに保存されます。</p>
        <p>Version {APP_VERSION}</p>
      </footer>
    </div>
  );
}

export default App;
