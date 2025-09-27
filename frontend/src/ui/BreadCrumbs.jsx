// src/ui/Breadcrumbs.jsx
import { Link, useLocation } from "react-router-dom";
import { Home, ChevronRight } from "lucide-react";
import { routesConfig } from "../config/routesConfig";

/**
 * Breadcrumbs:
 * - placed below header (in main content area)
 * - collapses middle if path is long
 * - uses location.state.breadcrumbTitle for the last segment if provided
 */

function findRouteLabelForSegments(segSlice) {
  const candidate = Object.values(routesConfig).find((rt) => {
    if (!rt.path) return false;
    const parts = rt.path.split("/").filter(Boolean);
    if (parts.length !== segSlice.length) return false;
    return parts.every((p, i) => p.startsWith(":") || p === segSlice[i]);
  });
  return candidate?.label ?? null;
}

export default function Breadcrumbs({ className = "" }) {
  const { pathname, state } = useLocation();
  const parts = pathname.split("/").filter(Boolean); // e.g. ['director','courses','5-CO...']
  if (parts.length === 0) return null;

  const role = parts[0];
  const rest = parts.slice(1);

  // base home
  const items = [
    {
      label: "Home",
      to: `/${role}/dashboard`,
      //   icon: <Home className="h-4 w-4 text-gray-500" />,
    },
  ];

  // build readable labels for suffixes
  let acc = `/${role}`;
  for (let i = 0; i < rest.length; i++) {
    acc += `/${rest[i]}`;
    const suffix = rest.slice(0, i + 1);
    // prefer route label
    let label = findRouteLabelForSegments(suffix);

    if (!label) {
      // last segment: prefer provided breadcrumbTitle
      if (i === rest.length - 1 && state?.breadcrumbTitle) {
        label = state.breadcrumbTitle;
      } else {
        // nice formatting fallback for literal segments
        const seg = rest[i];
        if (/^\d+-/.test(seg) || (seg.length > 10 && seg.includes("-"))) {
          label = seg; // raw id fallback
        } else {
          label = seg
            .replace(/-/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase());
        }
      }
    }

    items.push({ label, to: acc });
  }

  // compact long breadcrumbs: show first, maybe one middle, then last
  const MAX_VISIBLE = 4; // including Home
  let visible = items;
  if (items.length > MAX_VISIBLE) {
    // keep first (Home), second, last two; collapse middle
    visible = [
      items[0],
      items[1],
      { label: "…", to: items[items.length - 2].to + "#", isEllipsis: true },
      items[items.length - 1],
    ];
  }

  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex items-center gap-2 ${className}`}
    >
      {visible.map((it, idx) => {
        const isLast = idx === visible.length - 1;
        return (
          <span key={it.to + idx} className="flex items-center gap-2">
            {it.isEllipsis ? (
              <span className="text-sm text-gray-400">…</span>
            ) : (
              <Link
                to={it.to}
                className={`inline-flex items-center text-sm ${isLast ? "font-medium text-gray-700" : "text-gray-500 hover:text-gray-700"}`}
                aria-current={isLast ? "page" : undefined}
              >
                {it.icon ? <span className="mr-2">{it.icon}</span> : null}
                <span className={isLast ? "" : "truncate"}>{it.label}</span>
              </Link>
            )}
            {!isLast && <ChevronRight className="h-3 w-3 text-gray-300" />}
          </span>
        );
      })}
    </nav>
  );
}
