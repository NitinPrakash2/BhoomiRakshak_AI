import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import RiskBadge from "../components/RiskBadge";
import { getRiskZones } from "../services/data";

export default function RiskZones() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [zones, setZones] = useState([]);
  const [stateFilter, setStateFilter] = useState("");

  useEffect(() => {
    getRiskZones(stateFilter ? { state: stateFilter } : undefined)
      .then((r) => setZones(r.data ?? []))
      .catch(() => setZones([]));
  }, [stateFilter]);

  const states = Array.from(new Set(zones.map((z) => z.state))).sort();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{t("nav.riskZones")}</h1>
        <select
          value={stateFilter}
          onChange={(e) => setStateFilter(e.target.value)}
          className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm"
        >
          <option value="">All states</option>
          {states.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {zones.map((z) => (
          <button
            key={z.id}
            onClick={() => navigate(`/risk-zones/${z.id}`)}
            className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 text-left hover:border-slate-600"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="font-semibold">{z.name}</div>
              <RiskBadge level={z.riskLevel} t={t} />
            </div>
            <div className="mt-1 text-xs text-slate-400">{z.district}, {z.state}</div>

            <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-300">
              <div>🌧 {t("zone.rainfall")}: {z.rainfall ?? "—"} mm</div>
              <div>💧 {t("zone.soilMoisture")}: {z.soilMoisture ?? "—"}%</div>
              <div>⛰ {t("zone.slope")}: {z.slope ?? "—"}°</div>
              <div>🏔 {t("zone.elevation")}: {z.elevation ?? "—"} m</div>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <span className="text-2xl font-bold">{z.riskScore ?? "—"}</span>
              <span className="text-[10px] uppercase text-amber-300/80">{t(`quality.${z.dataQuality}`)}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}