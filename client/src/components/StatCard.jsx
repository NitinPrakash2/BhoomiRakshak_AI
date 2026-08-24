export default function StatCard({ icon: Icon, label, value, tone = "slate" }) {
  const tones = {
    slate: "bg-slate-800 border-slate-700 text-slate-100",
    red: "bg-red-950/60 border-red-900 text-red-100",
    orange: "bg-orange-950/60 border-orange-900 text-orange-100",
    green: "bg-emerald-950/60 border-emerald-900 text-emerald-100",
  };
  return (
    <div className={`rounded-xl border p-4 ${tones[tone]}`}>
      <div className="flex items-center gap-2">
        {Icon ? <Icon size={18} className="opacity-80" /> : null}
        <span className="text-xs font-medium uppercase tracking-wide opacity-70">{label}</span>
      </div>
      <div className="mt-2 text-2xl font-bold">{value ?? "—"}</div>
    </div>
  );
}