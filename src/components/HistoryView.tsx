import { useRef, useState, type ChangeEvent } from "react";
import type { TrainingLog } from "../types";
import { formatDisplayDate } from "../utils/date";

type HistoryViewProps = {
  logs: TrainingLog[];
  onDelete: (id: string) => void;
  onImport: (serializedLogs: string) => number | null;
};

export function HistoryView({ logs, onDelete, onImport }: HistoryViewProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [backupMessage, setBackupMessage] = useState("");
  const sortedLogs = [...logs].sort((a, b) => {
    const dateOrder = b.date.localeCompare(a.date);
    return dateOrder !== 0 ? dateOrder : b.id.localeCompare(a.id);
  });

  const handleDelete = (log: TrainingLog) => {
    if (
      window.confirm(
        `${formatDisplayDate(log.date)}の記録（${log.parts.join("、")}）を削除しますか？`,
      )
    ) {
      onDelete(log.id);
    }
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(logs, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = `training-logs-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    setBackupMessage("バックアップを書き出しました。");
  };

  const handleImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      return;
    }

    const importedCount = onImport(await file.text());
    if (importedCount === null) {
      setBackupMessage("バックアップを読み込めませんでした。");
      return;
    }

    setBackupMessage(`${importedCount}件の記録を読み込みました。`);
  };

  return (
    <section aria-labelledby="history-title">
      <div className="page-heading">
        <p className="eyebrow">HISTORY</p>
        <h2 id="history-title">トレーニング履歴</h2>
        <p>{logs.length}件の記録があります。</p>
      </div>

      <div className="backup-actions" aria-label="バックアップ操作">
        <button type="button" onClick={handleExport}>
          書き出し
        </button>
        <button type="button" onClick={() => fileInputRef.current?.click()}>
          読み込み
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          onChange={handleImport}
        />
      </div>

      {backupMessage && (
        <p className="backup-message" role="status">
          {backupMessage}
        </p>
      )}

      {sortedLogs.length === 0 ? (
        <div className="empty-state">
          <p className="empty-icon" aria-hidden="true">
            0
          </p>
          <h3>まだ記録がありません</h3>
          <p>「記録」画面から最初のトレーニングを追加しましょう。</p>
        </div>
      ) : (
        <div className="history-list">
          {sortedLogs.map((log) => (
            <article className="history-card" key={log.id}>
              <div className="history-card-header">
                <div>
                  <time dateTime={log.date}>
                    {formatDisplayDate(log.date)}
                  </time>
                </div>
                <span className={`intensity intensity-${log.intensity}`}>
                  {log.intensity}
                </span>
              </div>

              <div className="part-tags" aria-label="実施部位">
                {log.parts.map((part) => (
                  <span key={part}>{part}</span>
                ))}
              </div>

              {log.memo && <p className="history-memo">{log.memo}</p>}

              <button
                className="delete-button"
                type="button"
                onClick={() => handleDelete(log)}
              >
                削除
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
