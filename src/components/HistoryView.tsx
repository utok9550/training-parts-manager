import type { TrainingLog } from "../types";
import { formatDisplayDate } from "../utils/date";

type HistoryViewProps = {
  logs: TrainingLog[];
  onDelete: (id: string) => void;
};

export function HistoryView({ logs, onDelete }: HistoryViewProps) {
  const sortedLogs = [...logs].sort((a, b) => {
    const dateOrder = b.date.localeCompare(a.date);
    return dateOrder !== 0 ? dateOrder : b.id.localeCompare(a.id);
  });

  const handleDelete = (log: TrainingLog) => {
    if (
      window.confirm(
        `${formatDisplayDate(log.date)}の「${log.menuName}」を削除しますか？`,
      )
    ) {
      onDelete(log.id);
    }
  };

  return (
    <section aria-labelledby="history-title">
      <div className="page-heading">
        <p className="eyebrow">HISTORY</p>
        <h2 id="history-title">トレーニング履歴</h2>
        <p>{logs.length}件の記録があります。</p>
      </div>

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
                  <h3>{log.menuName}</h3>
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
