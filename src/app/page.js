"use client";

import { useState } from "react";

const chips = [
  { id: "exams", label: "الامتحانات" },
  { id: "family", label: "العائلة" },
  { id: "work", label: "العمل" },
  { id: "relationships", label: "العلاقات" },
  { id: "sleep", label: "النوم" },
  { id: "money", label: "المال" },
  { id: "other", label: "حاجة ثانية" },
];

const recipients = [
  { id: "friend", label: "صديق/ة" },
  { id: "sibling", label: "أخ/أخت" },
  { id: "parent", label: "أحد الوالدين" },
  { id: "trusted_adult", label: "شخص كبير نثق فيه" },
  { id: "counsellor", label: "مرشد/ة أو معلم/ة" },
];

export default function Home() {
  const [selectedChips, setSelectedChips] = useState([]);
  const [text, setText] = useState("");
  const [recipient, setRecipient] = useState("");

  function toggleChip(id) {
    setSelectedChips((current) =>
      current.includes(id)
        ? current.filter((chip) => chip !== id)
        : [...current, id]
    );
  }

  return (
    <main className="page">
      <section className="card">
        <div className="brand">
          <h1>جسر</h1>
          <p>خطوتك الأولى باش تبدأ تحكي مع حد تثق فيه.</p>
        </div>

        <div className="section">
          <h2>شن أكثر حاجة شاغلة بالك هالفترة؟</h2>
          <p className="hint">تقدر تختار أكثر من حاجة.</p>

          <div className="chips">
            {chips.map((chip) => (
              <button
                key={chip.id}
                type="button"
                className={
                  selectedChips.includes(chip.id)
                    ? "chip selected"
                    : "chip"
                }
                onClick={() => toggleChip(chip.id)}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        <div className="section">
          <label htmlFor="message">لو تبي، اكتب شوية على اللي في بالك</label>

          <textarea
            id="message"
            rows="3"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="اكتب هنا... (اختياري)"
          />
        </div>

        <div className="section">
          <h2>من الشخص اللي ممكن تحكي معاه؟</h2>

          <div className="recipients">
            {recipients.map((item) => (
              <button
                key={item.id}
                type="button"
                className={
                  recipient === item.id
                    ? "recipient selected"
                    : "recipient"
                }
                onClick={() => setRecipient(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <button
          className="continueButton"
          type="button"
          disabled={selectedChips.length === 0}
        >
          نكمل
        </button>
      </section>
    </main>
  );
}