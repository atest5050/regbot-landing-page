"use client";

// ComplianceMatrix — compact grid showing permit completion status across saved businesses.
// Columns: key permit types mapped to formIds.
// Rows: up to 6 businesses (with overflow indicator).
// Cells: green check (done), orange clock (in_progress / in-progress), gray dash (todo / pending / absent).
// Uses inline styles throughout for WKWebView compatibility. No external icon deps.

import type { SavedBusiness } from "@/lib/regbot-types";
import type { ChecklistItem } from "@/lib/checklist";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Props {
  businesses: SavedBusiness[];
  onSelectBusiness: (biz: SavedBusiness) => void;
  isDarkMode?: boolean;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const PERMIT_COLUMNS: { label: string; short: string; formId: string }[] = [
  { label: "Business License",      short: "Lic.",  formId: "business-license" },
  { label: "EIN / SS-4",            short: "EIN",   formId: "ein-application" },
  { label: "Sales Tax Reg.",        short: "Tax",   formId: "sales-tax-registration" },
  { label: "Food Service",          short: "Food",  formId: "food-service-permit" },
  { label: "Home Occupation",       short: "Home",  formId: "home-occupation-permit" },
  { label: "Business Registration", short: "Reg.",  formId: "business-registration" },
];

const MAX_ROWS = 6;

// ── Status detection ──────────────────────────────────────────────────────────

type CellStatus = "done" | "in_progress" | "pending";

function getFormStatus(biz: SavedBusiness, formId: string): CellStatus {
  const allItems: ChecklistItem[] = [
    ...(biz.checklist ?? []),
    ...(biz.locations ?? []).flatMap((l) => l.checklist ?? []),
  ];
  const item = allItems.find((i) => i.formId === formId);
  if (!item) return "pending";
  if (item.status === "done") return "done";
  // Support both "in-progress" (actual ChecklistStatus) and "in_progress" (legacy)
  if (item.status === "in-progress" || (item.status as string) === "in_progress") return "in_progress";
  return "pending";
}

// ── Inline SVG icons ──────────────────────────────────────────────────────────

function IconGrid({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
    </svg>
  );
}

function IconCheckCircle({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="#22c55e"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-label="Done"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  );
}

function IconClock({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="#f97316"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-label="In progress"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function IconDash({ size = 16, color = "#9ca3af" }: { size?: number; color?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2.5}
      strokeLinecap="round"
      aria-label="Pending"
    >
      <line x1="7" y1="12" x2="17" y2="12" />
    </svg>
  );
}

// ── Cell component ────────────────────────────────────────────────────────────

function StatusCell({ status }: { status: CellStatus }) {
  const cellStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 32,
    height: 32,
  };

  return (
    <div style={cellStyle}>
      {status === "done" && <IconCheckCircle size={17} />}
      {status === "in_progress" && <IconClock size={17} />}
      {status === "pending" && <IconDash size={17} />}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ComplianceMatrix({ businesses, onSelectBusiness, isDarkMode = false }: Props) {
  const visibleBiz = businesses.slice(0, MAX_ROWS);
  const overflowCount = businesses.length - MAX_ROWS;

  // ── Color tokens ──────────────────────────────────────────────────────────
  const bg = isDarkMode ? "#1e293b" : "#ffffff";
  const cardBorder = isDarkMode ? "#334155" : "#e2e8f0";
  const headerBg = isDarkMode ? "#0f172a" : "#f8fafc";
  const headerText = isDarkMode ? "#94a3b8" : "#64748b";
  const rowBorderColor = isDarkMode ? "#1e293b" : "#f1f5f9";
  const titleColor = isDarkMode ? "#f1f5f9" : "#1e293b";
  const bizNameColor = isDarkMode ? "#e2e8f0" : "#1e293b";
  const locationColor = isDarkMode ? "#64748b" : "#94a3b8";
  const overflowColor = isDarkMode ? "#94a3b8" : "#64748b";
  const overflowBg = isDarkMode ? "#1e293b" : "#f8fafc";
  const colDivider = isDarkMode ? "#334155" : "#e2e8f0";

  // ── Styles ────────────────────────────────────────────────────────────────
  const cardStyle: React.CSSProperties = {
    background: bg,
    border: `1px solid ${cardBorder}`,
    borderRadius: 12,
    overflow: "hidden",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    boxShadow: isDarkMode
      ? "0 1px 6px rgba(0,0,0,0.4)"
      : "0 1px 4px rgba(0,0,0,0.06)",
  };

  const titleRowStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 7,
    padding: "10px 14px 8px",
    borderBottom: `1px solid ${cardBorder}`,
  };

  const titleTextStyle: React.CSSProperties = {
    fontSize: 13,
    fontWeight: 600,
    color: titleColor,
    letterSpacing: "-0.01em",
  };

  // Scrollable table wrapper: max height ~280px
  const scrollWrapperStyle: React.CSSProperties = {
    overflowX: "auto",
    overflowY: "auto",
    maxHeight: 232, // title row ~48px = total ~280px
    WebkitOverflowScrolling: "touch",
  };

  const tableStyle: React.CSSProperties = {
    width: "100%",
    borderCollapse: "collapse",
    tableLayout: "fixed",
    minWidth: 340,
  };

  // First column (business name) is wider; permit columns are fixed narrow
  const bizColWidth = 110;
  const permitColWidth = 44;

  const thBaseStyle: React.CSSProperties = {
    background: headerBg,
    color: headerText,
    fontSize: 11,
    fontWeight: 600,
    textAlign: "center",
    padding: "5px 2px",
    borderBottom: `1px solid ${colDivider}`,
    position: "sticky",
    top: 0,
    zIndex: 1,
    letterSpacing: "0.01em",
  };

  const thBizStyle: React.CSSProperties = {
    ...thBaseStyle,
    textAlign: "left",
    paddingLeft: 12,
    width: bizColWidth,
    minWidth: bizColWidth,
  };

  const thPermitStyle: React.CSSProperties = {
    ...thBaseStyle,
    width: permitColWidth,
    minWidth: permitColWidth,
  };

  return (
    <div style={cardStyle}>
      {/* Title row */}
      <div style={titleRowStyle}>
        <IconGrid size={15} color={isDarkMode ? "#94a3b8" : "#64748b"} />
        <span style={titleTextStyle}>Compliance Matrix</span>
        {businesses.length > 0 && (
          <span
            style={{
              marginLeft: "auto",
              fontSize: 11,
              color: headerText,
              fontWeight: 500,
            }}
          >
            {businesses.length} {businesses.length === 1 ? "business" : "businesses"}
          </span>
        )}
      </div>

      {/* Scrollable grid */}
      <div style={scrollWrapperStyle}>
        {businesses.length === 0 ? (
          <div
            style={{
              padding: "24px 16px",
              textAlign: "center",
              color: headerText,
              fontSize: 13,
            }}
          >
            No saved businesses yet.
          </div>
        ) : (
          <table style={tableStyle}>
            <colgroup>
              <col style={{ width: bizColWidth }} />
              {PERMIT_COLUMNS.map((col) => (
                <col key={col.formId} style={{ width: permitColWidth }} />
              ))}
            </colgroup>

            {/* Header */}
            <thead>
              <tr>
                <th style={thBizStyle}>Business</th>
                {PERMIT_COLUMNS.map((col) => (
                  <th key={col.formId} style={thPermitStyle} title={col.label}>
                    {col.short}
                  </th>
                ))}
              </tr>
            </thead>

            {/* Business rows */}
            <tbody>
              {visibleBiz.map((biz, rowIdx) => {
                const isLast = rowIdx === visibleBiz.length - 1 && overflowCount <= 0;
                const rowStyle: React.CSSProperties = {
                  borderBottom: isLast ? "none" : `1px solid ${rowBorderColor}`,
                };

                const bizCellStyle: React.CSSProperties = {
                  padding: "5px 6px 5px 12px",
                  verticalAlign: "middle",
                  cursor: "pointer",
                  userSelect: "none",
                  WebkitUserSelect: "none",
                };

                const permitCellStyle: React.CSSProperties = {
                  textAlign: "center",
                  verticalAlign: "middle",
                  padding: "2px 0",
                };

                const truncatedName =
                  biz.name.length > 12 ? biz.name.slice(0, 12) + "…" : biz.name;

                return (
                  <tr key={biz.id} style={rowStyle}>
                    {/* Business name cell */}
                    <td
                      style={bizCellStyle}
                      onClick={() => onSelectBusiness(biz)}
                      title={biz.name}
                    >
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: bizNameColor,
                          lineHeight: 1.2,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          maxWidth: bizColWidth - 16,
                          textDecoration: "underline",
                          textDecorationStyle: "dotted",
                          textDecorationColor: isDarkMode ? "#475569" : "#cbd5e1",
                          textUnderlineOffset: 2,
                        }}
                      >
                        {truncatedName}
                      </div>
                      {biz.location && (
                        <div
                          style={{
                            fontSize: 10,
                            color: locationColor,
                            lineHeight: 1.2,
                            marginTop: 1,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            maxWidth: bizColWidth - 16,
                          }}
                        >
                          {biz.location}
                        </div>
                      )}
                    </td>

                    {/* Permit status cells */}
                    {PERMIT_COLUMNS.map((col) => (
                      <td key={col.formId} style={permitCellStyle}>
                        <StatusCell status={getFormStatus(biz, col.formId)} />
                      </td>
                    ))}
                  </tr>
                );
              })}

              {/* Overflow indicator row */}
              {overflowCount > 0 && (
                <tr>
                  <td
                    colSpan={PERMIT_COLUMNS.length + 1}
                    style={{
                      padding: "5px 12px",
                      fontSize: 11,
                      color: overflowColor,
                      background: overflowBg,
                      textAlign: "center",
                      fontStyle: "italic",
                    }}
                  >
                    +{overflowCount} more {overflowCount === 1 ? "business" : "businesses"} not shown
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Legend */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "6px 14px",
          borderTop: `1px solid ${cardBorder}`,
          background: headerBg,
        }}
      >
        <LegendItem icon={<IconCheckCircle size={13} />} label="Done" color={headerText} />
        <LegendItem icon={<IconClock size={13} />} label="In progress" color={headerText} />
        <LegendItem
          icon={<IconDash size={13} color={isDarkMode ? "#64748b" : "#9ca3af"} />}
          label="Pending"
          color={headerText}
        />
      </div>
    </div>
  );
}

// ── Legend helper ─────────────────────────────────────────────────────────────

function LegendItem({
  icon,
  label,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  color: string;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
      {icon}
      <span style={{ fontSize: 10, color, fontWeight: 500 }}>{label}</span>
    </div>
  );
}
