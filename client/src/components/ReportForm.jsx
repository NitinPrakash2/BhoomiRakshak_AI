import { MapPin, Plus } from "lucide-react";

export default function ReportForm({ form, setForm, incidents, useMyLocation, onSubmit, submitting, message, t }) {
  return (
    <form onSubmit={onSubmit} className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
        <Plus size={16} /> New field report
      </h2>

      <div className="mb-3 flex gap-2">
        <input required placeholder="Latitude" value={form.latitude}
          onChange={(e) => setForm({ ...form, latitude: e.target.value })}
          className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm" />
        <input required placeholder="Longitude" value={form.longitude}
          onChange={(e) => setForm({ ...form, longitude: e.target.value })}
          className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm" />
        <button type="button" onClick={useMyLocation} title="Use my GPS location"
          className="shrink-0 rounded-lg bg-slate-700 px-3 hover:bg-slate-600">
          <MapPin size={16} />
        </button>
      </div>

      <select value={form.incidentType} onChange={(e) => setForm({ ...form, incidentType: e.target.value })}
        className="mb-3 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm">
        {incidents.map((i) => <option key={i} value={i}>{i.replace("_", " ")}</option>)}
      </select>

      <select value={form.roadStatus} onChange={(e) => setForm({ ...form, roadStatus: e.target.value })}
        className="mb-3 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm">
        <option value="">Road status (optional)</option>
        {["OPEN", "AT_RISK", "BLOCKED", "PARTIALLY_BLOCKED"].map((r) => (
          <option key={r} value={r}>{r.replace("_", " ")}</option>
        ))}
      </select>

      <textarea placeholder="Description" rows={3} value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        className="mb-3 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm" />

      <button disabled={submitting} className="w-full rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold hover:bg-emerald-500 disabled:opacity-60">
        {submitting ? "Submitting…" : "Submit report"}
      </button>

      {message ? <p className="mt-2 text-xs text-slate-300">{message}</p> : null}
    </form>
  );
}