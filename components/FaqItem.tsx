"use client";
import { useState } from "react";

export default function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="faq-item">
      <button className="faq-question" onClick={() => setOpen(!open)}>
        <span>{q}</span>
        <svg className={`faq-chevron ${open ? "open" : ""}`} width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="4,7 9,12 14,7" />
        </svg>
      </button>
      <div className={`faq-answer ${open ? "open" : ""}`}>
        <p>{a}</p>
      </div>
    </div>
  );
}
