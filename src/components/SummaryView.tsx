import type { PartSummary, Priority } from "../types";
import { formatDisplayDate } from "../utils/date";

type SummaryViewProps = {
  summaries: PartSummary[];
};

const priorityClassNames: Record<Priority, string> = {
  最優先: "priority-urgent",
  高: "priority-high",
  中: "priority-medium",
  低: "priority-low",
};

export function SummaryView({ summaries }: SummaryViewProps) {
  return (
    <section aria-labelledby="summary-title">
      <div className="page-heading">
        <p className="eyebrow">BODY STATUS</p>
        <h2 id="summary-title">部位サマリー</h2>
        <p>直近の記録から、次に取り組みたい部位を確認できます。</p>
      </div>

      <div className="summary-grid">
        {summaries.map((summary) => (
          <article
            className={`summary-card ${priorityClassNames[summary.priority]}`}
            key={summary.part}
          >
            <div className="summary-card-header">
              <h3>{summary.part}</h3>
              <span className="priority-badge">{summary.priority}</span>
            </div>
            <dl className="summary-stats">
              <div>
                <dt>最終実施日</dt>
                <dd>
                  {summary.lastDate
                    ? formatDisplayDate(summary.lastDate)
                    : "なし"}
                </dd>
              </div>
              <div>
                <dt>経過日数</dt>
                <dd>
                  {summary.elapsedDays === null
                    ? "-"
                    : `${summary.elapsedDays}日`}
                </dd>
              </div>
              <div>
                <dt>直近7日</dt>
                <dd>{summary.recentCount}回</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    </section>
  );
}
