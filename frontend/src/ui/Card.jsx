// src/ui/Card.jsx
import React from "react";

/**
 * Card — minimal card wrapper for consistent spacing & visual rhythm
 *
 * className can be supplied to further customize the card.
 */
export default function Card({ children, className = "" }) {
  return (
    <div className={`rounded-2xl border bg-white p-6 shadow-sm ${className}`}>
      {children}
    </div>
  );
}
