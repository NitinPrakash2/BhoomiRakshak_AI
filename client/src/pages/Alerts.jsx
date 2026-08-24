import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { BellRing, Check } from "lucide-react";
import RiskBadge from "../components/RiskBadge";
import { getAlerts, acknowledgeAlert } from "../services/data";

export default function Alerts() {
  const { t } = useTranslation();
  const [alerts, setAlerts] = useState([]);
  const [busyId, setBusyId] = useState(null);

  const load = () => getAlerts({}).then((r) => setAlerts(r.data ?? [])).catch(() => setAlerts([]));
  useEffect(() => { load(); }, []);

  const onAcknowledge = async (id) => {
    setBusyId(id);
    try {
      await acknowledgeAlert(id);
      await load();
    } catch (e) {
      alert(e.response?.data?.error?.message || "Could not acknowledge alert.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{t("nav.alerts")}</h1>

      <div className="space-y-3">
        {alerts.map((a) => (
          <div key={a.id} className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 font-semibold">
                <BellRing size={16} className={a.acknowledged ? "text-slate-500" : "text-red-400"} />
                {a.title}
              </div>
              <RiskBadge level={a.alertLevel === "CRITICAL" ? "VERY_HIGH" : a.riskLevel} t={t} />
            </div>

            <p className="mt-2 text-sm text-slate-300">{a.message}</p>

            <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-400 md:grid-cols-4">
              <div>📍 {a.riskZone?.name ?? "—"}</div>
              <div>🛣 {a.affectedRoad ?? "—"}</div>
              <div>🏘 {a.affectedVillage ?? "—"}</div>
              <div>🕒 {new Date(a.createdAt).toLocaleString()}</div>
            </div>

            {a.recommendedAction ? (
              <div className="mt-3 rounded-lg bg-emerald-950/40 px-3 py-2 text-xs text-emerald-200">
                ✔ {t("zone.recommendedAction")}: {a.recommendedAction}
              </div>
            ) : null}

            {Array.isArray(a.contributingFactors) ? (
              <div className="mt-2 flex flex-wrap gap-1">
                {a.contributingFactors.map((f, i) => (
                  <span key={i} className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300">{f}</span>
                ))}
              </div>
            ) : null}

            <div className="mt-3 flex items-center justify-between">
              <span className={`text-[10px] uppercase ${a.acknowledged ? "text-slate-500" : "text-amber-300"}`}>
                {a.acknowledged
                  ? `Acknowledged by ${a.acknowledgedBy ?? "—"}`
                  : "Pending acknowledgement"}
              </span>
              {!a.acknowledged ? (
                <button
                  disabled={busyId === a.id}
                  onClick={() => onAcknowledge(a.id)}
                  className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold hover:bg-emerald-500 disabled:opacity-60"
                >
                  <Check size={14} /> Acknowledge
                </button>
              ) : null}
            </div>
          </div>
        ))}
        {!alerts.length ? <p className="text-sm text-slate-500">{t("dash.noData")}</p> : null}
      </div>
    </div>
  );
}