import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getReports, createReport } from "../services/data";
import ReportForm from "../components/ReportForm";
import ReportList from "../components/ReportList";

const INCIDENTS = ["CRACK", "SLOPE_MOVEMENT", "ROCKFALL", "MUD_DEBRIS", "ROAD_BLOCKAGE", "WATER_OVERFLOW", "OTHER"];

export default function Reports() {
  const { t } = useTranslation();
  const [reports, setReports] = useState([]);
  const [form, setForm] = useState({
    latitude: "", longitude: "", incidentType: "CRACK",
    description: "", roadStatus: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const load = () => getReports({}).then((r) => setReports(r.data ?? [])).catch(() => setReports([]));
  useEffect(() => { load(); }, []);

  // GPS capture (Section 28 field-report flow).
  const useMyLocation = () => {
    if (!navigator.geolocation) return setMessage("Geolocation not available.");
    navigator.geolocation.getCurrentPosition(
      (pos) => setForm((f) => ({
        ...f,
        latitude: pos.coords.latitude.toFixed(5),
        longitude: pos.coords.longitude.toFixed(5),
      })),
      () => setMessage("Could not read GPS location.")
    );
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setSubmitting(true);
    try {
      await createReport({
        latitude: parseFloat(form.latitude),
        longitude: parseFloat(form.longitude),
        incidentType: form.incidentType,
        description: form.description || undefined,
        roadStatus: form.roadStatus || undefined,
      });
      setForm({ latitude: "", longitude: "", incidentType: "CRACK", description: "", roadStatus: "" });
      setMessage("Report submitted.");
      await load();
    } catch (err) {
      setMessage(err.response?.data?.error?.message || "Submit failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("nav.reports")}</h1>
      <div className="grid gap-6 xl:grid-cols-3">
        <ReportForm
          form={form} setForm={setForm} incidents={INCIDENTS}
          useMyLocation={useMyLocation} onSubmit={onSubmit}
          submitting={submitting} message={message} t={t}
        />
        <div className="xl:col-span-2">
          <ReportList reports={reports} t={t} />
        </div>
      </div>
    </div>
  );
}