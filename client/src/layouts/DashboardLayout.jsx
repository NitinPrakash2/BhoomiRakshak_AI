import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard, MapPin, FileText, Bell, LogOut, Languages,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const NAV = [
  { to: "/", icon: LayoutDashboard, key: "dashboard" },
  { to: "/risk-zones", icon: MapPin, key: "riskZones" },
  { to: "/reports", icon: FileText, key: "reports" },
  { to: "/alerts", icon: Bell, key: "alerts" },
];

export default function DashboardLayout() {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const toggleLanguage = () => {
    const next = i18n.language?.startsWith("hi") ? "en" : "hi";
    i18n.changeLanguage(next);
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      {/* Sidebar */}
      <aside className="flex w-60 flex-col border-r border-slate-800 bg-slate-900/70 p-4">
        <div className="mb-6">
          <div className="text-lg font-bold tracking-tight">{t("app.name")}</div>
          <div className="text-xs text-slate-400">{t("app.tagline")}</div>
        </div>

        <nav className="flex flex-col gap-1">
          {NAV.map(({ to, icon: Icon, key }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                  isActive ? "bg-slate-800 font-semibold" : "text-slate-300 hover:bg-slate-800/60"
                }`
              }
            >
              <Icon size={16} />
              {t(`nav.${key}`)}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto flex flex-col gap-3">
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-slate-800/60"
          >
            <Languages size={16} />
            {i18n.language?.startsWith("hi") ? "हिन्दी" : "English"}
          </button>

          {user ? (
            <div className="rounded-lg border border-slate-800 bg-slate-900 p-3 text-xs">
              <div className="font-semibold">{user.name}</div>
              <div className="text-slate-400">{user.role}</div>
              <button
                onClick={() => { logout(); navigate("/login"); }}
                className="mt-2 flex w-full items-center gap-2 rounded-md bg-slate-800 px-2 py-1.5 hover:bg-red-900/40"
              >
                <LogOut size={14} /> {t("nav.logout")}
              </button>
            </div>
          ) : null}
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}