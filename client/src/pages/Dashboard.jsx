import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  BellRing, TriangleAlert, MapPinned, Ban, FileText, Radio,
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip as RTooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import StatCard from "../components/StatCard";
import RiskBadge, { riskColor } from "../components/RiskBadge";
import RiskMap from "../maps/RiskMap";
import {
  getDashboardSummary, getRiskZones, getRiskTrends, getWeather, getAlerts,
} from "../services/data";

export default function Dashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [zones, setZones] = useState([]);
  const [trends, setTrends] = useState([]);
  const [weather, setWeather] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    Promise.all([
      getDashboardSummary().catch(() => null),
      getRiskZones().catch(() => null),
      getRiskTrends(48).catch(() => null),
      getWeather().catch(() => null),
      getAlerts({}).catch(() => null),
    ]).then(([s, z, tr, w, al]) => {
      if (!alive) return;
      if (!s && !z) setError(t("dash.noData"));
      setSummary(s?.data ?? null);
      setZones(z?.data ?? []);
      setTrends(tr?.data ?? []);
      setWeather(w?.data ?? []);
      setAlerts(al?.data ?? []);
    });
    return () => { alive = false; };
  }, [t]);

  const stats = summary?.stats;

  const trendChart = (() => {
    const byTime = new Map();
    trends.forEach((zone) => {
      zone.points.forEach((pt) => {
        const key = new Date(pt.time).toISOString().slice(0, 13);
        const arr = byTime.get(key) || [];
        arr.push(pt.riskScore);
        byTime.set(key, arr);
      });
    });
    return Array.from(byTime.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => ({ time: k.slice(11), score: Math.round(v.reduce((a, b) => a + b, 0) / v.length) }));
  })();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("nav.dashboard")}</h1>
        <span className="rounded-full border border-amber-700 bg-amber-950/50 px-3 py-1 text-xs text-amber-200">
          {t("quality.SIMULATED")}
        </span>
      </div>

      {error ? (
        <div className="rounded-lg bg-red-950/60 px-4 py-3 text-sm text-red-200">{error}</div>
      ) : null}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        <StatCard icon={BellRing} label={t("dash.activeAlerts")} value={stats?.activeAlerts} tone="red" />
        <StatCard icon={TriangleAlert} label={t("dash.highRisk")} value={stats?.highRiskZones} tone="orange" />
        <StatCard icon={MapPinned} label={t("dash.veryHighRisk")} value={stats?.veryHighRiskZones} tone="red" />
        <StatCard icon={Ban} label={t("dash.blockedRoads")} value={stats?.blockedRoads} />
        <StatCard icon={FileText} label={t("dash.fieldReports")} value={stats?.fieldReports} tone="green" />
        <StatCard icon={Radio} label={t("dash.sensorsOnline")} value={stats?.sensorsOnline} />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">GIS Risk Map</h2>
          <RiskMap zones={zones} onSelectZone={(id) => navigate(`/risk-zones/${id}`)} height={430} />
        </div>
        <div className="space-y-4">
          <WeatherPanel weather={weather} t={t} />
          <AlertsPanel alerts={alerts} t={t} navigate={navigate} />
        </div>
      </div>

      <TrendAndPriority trendChart={trendChart} summary={summary} t={t} navigate={navigate} />
    </div>
  );
}

function WeatherPanel({ weather, t }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">{t("dash.weather")}</h2>
      {weather.length ? (
        <ul className="space-y-2 text-sm">
          {weather.slice(0, 5).map((w, i) => (
            <li key={i} className="flex items-center justify-between rounded-lg bg-slate-800/60 px-3 py-2">
              <span>{Number(w.latitude).toFixed(2)}, {Number(w.longitude).toFixed(2)}</span>
              <span className="text-slate-300">
                🌧 {w.rainfall24h ?? "—"} mm · 💧 {w.soilMoisture ?? "—"}%
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-slate-500">{t("dash.noData")}</p>
      )}
    </div>
  );
}

function AlertsPanel({ alerts, t, navigate }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">{t("nav.alerts")}</h2>
      {alerts.length ? (
        <ul className="space-y-2 text-sm">
          {alerts.slice(0, 4).map((a) => (
            <li
              key={a.id}
              onClick={() => navigate("/alerts")}
              className="cursor-pointer rounded-lg bg-slate-800/60 px-3 py-2 hover:bg-slate-800"
            >
              <div className="font-medium">{a.title}</div>
              <div className="mt-0.5 flex items-center justify-between text-xs text-slate-400">
                <span>{a.riskZone?.district ?? "—"}</span>
                <RiskBadge level={a.riskLevel} t={t} />
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-slate-500">{t("dash.noData")}</p>
      )}
    </div>
  );
}

function TrendAndPriority({ trendChart, summary, t, navigate }) {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">{t("dash.riskTrend")}</h2>
        <div style={{ height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendChart}>
              <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
              <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} />
              <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={11} />
              <RTooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 8 }} />
              <Line type="monotone" dataKey="score" stroke="#f97316" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">{t("dash.priorityQueue")}</h2>
        <ul className="space-y-2">
          {(summary?.priorityQueue ?? []).slice(0, 6).map((z) => (
            <li key={z.id}>
              <button
                onClick={() => navigate(`/risk-zones/${z.id}`)}
                className="w-full rounded-lg bg-slate-800/60 px-3 py-2 text-left hover:bg-slate-800"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{z.name}</span>
                  <span className="text-xs text-slate-400">{z.district}, {z.state}</span>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-lg font-bold" style={{ color: riskColor(z.riskLevel) }}>{z.riskScore}</span>
                  <RiskBadge level={z.riskLevel} t={t} />
                  <span className="ml-auto text-[10px] uppercase text-amber-300/80">{t(`quality.${z.dataQuality}`)}</span>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}