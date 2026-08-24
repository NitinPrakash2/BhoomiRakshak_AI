import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, BrainCircuit } from "lucide-react";
import RiskBadge, { riskColor } from "../components/RiskBadge";
import RiskMap from "../maps/RiskMap";
import { getRiskZone, predictRisk } from "../services/data";

// Build the ML feature payload (Section 16 allowlist) from zone attributes.
const featuresFromZone = (z) => ({
  rainfall_1h: z.rainfall != null ? Math.max(0, z.rainfall * 0.02) : 0,
  rainfall_6h: z.rainfall != null ? Math.max(0, z.rainfall * 0.09) : 0,
  rainfall_24h: z.rainfall ?? 0,
  rainfall_72h: z.rainfall != null ? z.rainfall * 1.5 : 0,
  soil_moisture: z.soilMoisture ?? 50,
  elevation: z.elevation ?? 0,
  slope: z.slope ?? 0,
  aspect: 180,
  terrain_ruggedness: z.slope != null ? Math.min(1, z.slope / 65) : 0.2,
  historical_landslide_count: 2,
  distance_to_road: 500,
  distance_to_river: 1000,
  geological_risk_indicator: z.riskLevel === "VERY_HIGH" ? 0.85 : z.riskLevel === "HIGH" ? 0.6 : 0.3,
  recent_surface_change: z.riskLevel === "VERY_HIGH" ? 0.6 : 0.25,
});

export default function RiskZoneDetail() {
  const { t } = useTranslation();
  const { id } = useParams();
  const [zone, setZone] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [mlError, setMlError] = useState("");

  useEffect(() => {
    getRiskZone(id)
      .then((r) => {
        setZone(r.data);
        // Ask the ML service WHY this zone is at risk (Section 21).
        return predictRisk(featuresFromZone(r.data)).catch((e) => {
          setMlError(e.response?.data?.error?.message || "ML inference unavailable.");
          return null;
        });
      })
      .then((pred) => pred && setPrediction(pred.data))
      .catch(() => setZone(null));
  }, [id]);

  if (!zone) {
    return <div className="text-sm text-slate-400">Loading…</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link to="/risk-zones" className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200">
            <ArrowLeft size={14} /> {t("nav.riskZones")}
          </Link>
          <h1 className="mt-1 text-2xl font-bold">{zone.name}</h1>
          <p className="text-sm text-slate-400">{zone.district}, {zone.state}</p>
        </div>
        <div className="text-right">
          <div className="text-xs uppercase text-slate-400">{t("zone.riskScore")}</div>
          <div className="text-4xl font-extrabold" style={{ color: riskColor(zone.riskLevel) }}>
            {zone.riskScore ?? "—"}
          </div>
          <RiskBadge level={zone.riskLevel} t={t} />
        </div>
      </div>

      {/* Zone attributes (Section 34) */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6 text-sm">
        <Attr label={t("zone.rainfall")} value={`${zone.rainfall ?? "—"} mm`} />
        <Attr label={t("zone.soilMoisture")} value={`${zone.soilMoisture ?? "—"}%`} />
        <Attr label={t("zone.slope")} value={`${zone.slope ?? "—"}°`} />
        <Attr label={t("zone.elevation")} value={`${zone.elevation ?? "—"} m`} />
        <Attr label={t("zone.modelVersion")} value={zone.modelVersion ?? "—"} />
        <Attr label={t("zone.lastUpdated")} value={zone.lastUpdated ? new Date(zone.lastUpdated).toLocaleString() : "—"} />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <RiskMap zones={[zone]} height={320} />
        </div>

        {/* Explainable AI panel (Section 21) */}
        <div className="rounded-xl border border-indigo-900 bg-indigo-950/30 p-4">
          <div className="mb-2 flex items-center gap-2 font-semibold">
            <BrainCircuit size={18} className="text-indigo-300" />
            {t("zone.whyAtRisk")}
          </div>

          {prediction ? (
            <>
              <div className="mb-3 flex items-baseline gap-2">
                <span className="text-3xl font-bold text-indigo-200">{prediction.riskScore}</span>
                <span className="text-xs text-indigo-300/80">/ 100 · {(prediction.modelProbability * 100).toFixed(0)}% probability</span>
              </div>
              <ul className="space-y-1 text-sm">
                {(prediction.topFactors || []).map((f) => (
                  <li key={f.feature} className="flex items-center justify-between rounded-md bg-slate-800/60 px-3 py-1.5">
                    <span>{f.feature}</span>
                    <span className={`text-xs ${f.direction === "increases_risk" ? "text-red-300" : "text-emerald-300"}`}>
                      {f.direction === "increases_risk" ? "▲ increases risk" : "▼ lowers risk"}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-[11px] leading-relaxed text-indigo-300/70">
                Model {prediction.modelVersion} ({t(`quality.${prediction.dataQuality}`)}). Decision-support estimate only — not a guaranteed landslide prediction.
              </p>
            </>
          ) : mlError ? (
            <p className="text-sm text-red-300">{mlError}</p>
          ) : (
            <p className="text-sm text-slate-400">Analyzing…</p>
          )}
        </div>
      </div>
    </div>
  );
}

function Attr({ label, value }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2">
      <div className="text-[10px] uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-0.5 font-medium">{value}</div>
    </div>
  );
}