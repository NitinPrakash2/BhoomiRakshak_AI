export default function ReportList({ reports, t }) {
  return (
    <div className="space-y-3">
      {reports.map((r) => (
        <div key={r.id} className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
          <div className="flex items-center justify-between">
            <span className="font-semibold">{(r.incidentType || "").replace("_", " ")}</span>
            <span className="text-xs text-slate-400">{new Date(r.submittedAt).toLocaleString()}</span>
          </div>
          <div className="mt-1 text-xs text-slate-400">
            📍 {typeof r.latitude === "number" ? r.latitude.toFixed(4) : r.latitude},{" "}
            {typeof r.longitude === "number" ? r.longitude.toFixed(4) : r.longitude}
            {" · by "}{r.user?.name ?? "—"} ({r.user?.role ?? ""})
          </div>
          {r.description ? <p className="mt-2 text-sm text-slate-300">{r.description}</p> : null}
          <div className="mt-2 flex flex-wrap gap-2 text-[10px]">
            {r.roadStatus ? (
              <span className="rounded-full bg-orange-950/50 px-2 py-0.5 text-orange-200">
                {r.roadStatus.replace("_", " ")}
              </span>
            ) : null}
            <span className={`rounded-full px-2 py-0.5 ${r.syncStatus === "SYNCED" ? "bg-emerald-950/50 text-emerald-200" : "bg-slate-800 text-slate-300"}`}>
              sync: {(r.syncStatus || "").toLowerCase()}
            </span>
            <span className="rounded-full bg-amber-950/40 px-2 py-0.5 text-amber-200">{t(`quality.${r.dataQuality}`)}</span>
          </div>
        </div>
      ))}
      {!reports.length ? <p className="text-sm text-slate-500">{t("dash.noData")}</p> : null}
    </div>
  );
}