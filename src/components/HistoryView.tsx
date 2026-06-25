import { useRef, useState, type ChangeEvent } from "react";
import type { TrainingLog, TrainingPart } from "../types";
import { formatDisplayDate, formatLocalDate, getToday } from "../utils/date";

type HistoryViewProps = {
  logs: TrainingLog[];
  onDelete: (id: string) => void;
  onImport: (serializedLogs: string) => number | null;
};

const weekdays = ["日", "月", "火", "水", "木", "金", "土"];

const shortPartLabels: Record<TrainingPart, string> = {
  胸: "胸",
  肩: "肩",
  背中: "背",
  脚: "脚",
  "腕（二頭）": "二",
  "腕（三頭）": "三",
};

function buildRecentDays(logs: TrainingLog[]) {
  const todayDate = new Date();
  const today = getToday();

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(todayDate);
    date.setDate(todayDate.getDate() - (6 - index));

    const dateKey = formatLocalDate(date);
    const parts = [
      ...new Set(
        logs
          .filter((log) => log.date === dateKey)
          .flatMap((log) => log.parts),
      ),
    ];

    return {
      date: dateKey,
      day: date.getDate(),
      month: date.getMonth() + 1,
      parts,
      weekday: weekdays[date.getDay()],
      isToday: dateKey === today,
    };
  });
}

export function HistoryView({ logs, onDelete, onImport }: HistoryViewProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [backupMessage, setBackupMessage] = useState("");
  const recentDays = buildRecentDays(logs);
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

      <div className="recent-calendar" aria-label="直近7日間の記録">
        {recentDays.map((day) => (
          <div
            className={`recent-calendar-day${day.isToday ? " is-today" : ""}${
              day.parts.length > 0 ? " has-log" : ""
            }`}
            key={day.date}
          >
            <span className="recent-calendar-weekday">{day.weekday}</span>
            <time dateTime={day.date}>
              {day.month}/{day.day}
            </time>
            {day.parts.length > 0 ? (
              <span className="recent-calendar-parts">
                {day.parts.map((part) => shortPartLabels[part]).join(" ")}
              </span>
            ) : (
              <span className="recent-calendar-empty">-</span>
            )}
          </div>
        ))}
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
