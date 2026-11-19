"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface CouponInputProps {
  onApply: (code: string) => void;
  onRemove: () => void;
  appliedCode?: string;
  className?: string;
}

export function CouponInput({ onApply, onRemove, appliedCode, className }: CouponInputProps) {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleApply = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError("");

    try {
      // TODO: Validate with API
      // Simulate validation for now
      await new Promise((r) => setTimeout(r, 500));

      if (input.toUpperCase() === "LAV10") {
        onApply(input.toUpperCase());
        setInput("");
      } else {
        setError("Invalid coupon code");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (appliedCode) {
    return (
      <div className={cn("coupon-applied", className)}>
        <span className="coupon-code">{appliedCode}</span>
        <span>applied</span>
        <button className="coupon-remove" onClick={onRemove}>
          Remove
        </button>
        <style>{`
          .coupon-applied {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 10px 14px;
            background: color-mix(in oklch, var(--ok) 10%, transparent);
            border-radius: var(--r-3);
            font-size: var(--step--2);
            color: var(--ok);
          }
          .coupon-code {
            font-family: var(--font-mono);
            font-weight: 700;
          }
          .coupon-remove {
            margin-left: auto;
            background: none;
            border: none;
            color: var(--fg-muted);
            cursor: pointer;
            font-size: var(--step--4);
          }
          .coupon-remove:hover { color: var(--bad); }
        `}</style>
      </div>
    );
  }

  return (
    <div className={cn("coupon-input-wrap", className)}>
      <div className="coupon-row">
        <input
          type="text"
          placeholder="Coupon code"
          value={input}
          onChange={(e) => setInput(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === "Enter" && handleApply()}
          className="coupon-field"
          disabled={loading}
        />
        <button
          className="btn"
          onClick={handleApply}
          disabled={loading || !input.trim()}
          style={{ height: "auto", padding: "10px 16px" }}
        >
          {loading ? "..." : "Apply"}
        </button>
      </div>
      {error && <p className="coupon-error">{error}</p>}
      <style>{`
        .coupon-input-wrap { }
        .coupon-row { display: flex; gap: 8px; }
        .coupon-field {
          flex: 1;
          padding: 10px 14px;
          border-radius: var(--r-3);
          border: 1px solid var(--line);
          background: var(--bg);
          color: var(--fg);
          font-size: var(--step--2);
          font-family: var(--font-mono);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .coupon-field::placeholder { text-transform: none; letter-spacing: 0; }
        .coupon-field:focus { outline: 2px solid var(--joy-500); border-color: var(--joy-500); }
        .coupon-error { color: var(--bad); font-size: var(--step--4); margin-top: 6px; }
      `}</style>
    </div>
  );
}
