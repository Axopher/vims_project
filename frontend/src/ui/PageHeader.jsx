// src/ui/PageHeader.jsx
import React from "react";

/**
 * PageHeader — small reusable header used across pages
 *
 * Props:
 * - title (string) — main title
 * - subtitle (string|node) — optional subtitle or description
 * - actions (node) — right-aligned actions (buttons, menus)
 * - breadcrumb (node) — optional breadcrumb UI
 */
export default function PageHeader({ title, subtitle, breadcrumb }) {
  return (
    <div className="mb-6 flex items-start justify-between gap-4">
      <div>
        {breadcrumb && <div className="mb-1 text-sm text-gray-500">{breadcrumb}</div>}
        <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-gray-600">{subtitle}</p>}
      </div>

    </div>
  );
}
