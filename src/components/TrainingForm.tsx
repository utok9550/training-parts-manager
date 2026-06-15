import { useState, type FormEvent } from "react";
import {
  INTENSITIES,
  MENU_NAMES,
  TRAINING_PARTS,
  type Intensity,
  type TrainingLog,
  type TrainingPart,
} from "../types";
import { getToday } from "../utils/date";

type TrainingFormProps = {
  onSave: (log: TrainingLog) => void;
};

type FormState = {
  date: string;
  menuName: string;
  parts: TrainingPart[];
  intensity: Intensity;
  memo: string;
};

function createInitialForm(): FormState {
  return {
    date: getToday(),
    menuName: MENU_NAMES[0],
    parts: [],
    intensity: "普通",
    memo: "",
  };
}

function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function TrainingForm({ onSave }: TrainingFormProps) {
  const [form, setForm] = useState<FormState>(createInitialForm);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const togglePart = (part: TrainingPart) => {
    setForm((current) => ({
      ...current,
      parts: current.parts.includes(part)
        ? current.parts.filter((item) => item !== part)
        : [...current.parts, part],
    }));
    setError("");
    setSaved(false);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (form.parts.length === 0) {
      setError("実施した部位を1つ以上選択してください。");
      return;
    }

    onSave({
      id: createId(),
      date: form.date,
      menuName: form.menuName,
      parts: form.parts,
      intensity: form.intensity,
      memo: form.memo.trim(),
    });
    setForm(createInitialForm());
    setError("");
    setSaved(true);
  };

  return (
    <section className="panel form-panel" aria-labelledby="record-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">TRAINING LOG</p>
          <h2 id="record-title">今日のトレーニング</h2>
        </div>
        <span className="section-mark" aria-hidden="true">
          ＋
        </span>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <label className="field">
            <span>日付</span>
            <input
              type="date"
              required
              value={form.date}
              onChange={(event) => {
                setForm({ ...form, date: event.target.value });
                setSaved(false);
              }}
            />
          </label>

          <label className="field">
            <span>メニュー名</span>
            <select
              value={form.menuName}
              onChange={(event) => {
                setForm({ ...form, menuName: event.target.value });
                setSaved(false);
              }}
            >
              {MENU_NAMES.map((menu) => (
                <option key={menu} value={menu}>
                  {menu}
                </option>
              ))}
            </select>
          </label>
        </div>

        <fieldset className="parts-fieldset">
          <legend>実施した部位</legend>
          <div className="part-options">
            {TRAINING_PARTS.map((part) => (
              <label
                className={`part-option ${
                  form.parts.includes(part) ? "is-selected" : ""
                }`}
                key={part}
              >
                <input
                  type="checkbox"
                  checked={form.parts.includes(part)}
                  onChange={() => togglePart(part)}
                />
                <span>{part}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <label className="field">
          <span>強度</span>
          <select
            value={form.intensity}
            onChange={(event) => {
              setForm({
                ...form,
                intensity: event.target.value as Intensity,
              });
              setSaved(false);
            }}
          >
            {INTENSITIES.map((intensity) => (
              <option key={intensity} value={intensity}>
                {intensity}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>メモ</span>
          <textarea
            rows={4}
            placeholder="重量、回数、コンディションなど"
            value={form.memo}
            onChange={(event) => {
              setForm({ ...form, memo: event.target.value });
              setSaved(false);
            }}
          />
        </label>

        {error && <p className="form-message error-message">{error}</p>}
        {saved && (
          <p className="form-message success-message">記録を保存しました。</p>
        )}

        <button className="primary-button" type="submit">
          記録を保存
        </button>
      </form>
    </section>
  );
}
