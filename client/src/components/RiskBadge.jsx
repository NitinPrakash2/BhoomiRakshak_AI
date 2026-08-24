// Color mapping per Section 12 risk thresholds.
export const RISK_COLORS = {
  LOW: "#22c55e",
  MODERATE: "#eab308",
  HIGH: "#f97316",
  VERY_HIGH: "#ef4444",
};

export const riskColor = (level) => RISK_COLORS[level] || "#94a3b8";

export default function RiskBadge({ level, t }) {
  if (!level) return null;
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold text-white"
      style={{ backgroundColor: riskColor(level) }}
    >
      {t ? t(`levels.${level}`) : level.replace("_", " ")}
    </span>
  );
}