import { useMemo, useState } from "react";
import { HistoryView } from "./components/HistoryView";
import { SummaryView } from "./components/SummaryView";
import { TrainingForm } from "./components/TrainingForm";
import type { TrainingLog } from "./types";
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
    return Array.isArray(parsedLogs) ? (parsedLogs as TrainingLog[]) : [];
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
