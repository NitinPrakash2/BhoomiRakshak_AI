import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Section 36: at least English + Hindi; never hard-code user-facing strings.
const resources = {
  en: {
    translation: {
      app: { name: "BhoomiRakshak", tagline: "NER Landslide Intelligence" },
      nav: {
        dashboard: "Dashboard",
        riskZones: "Risk Zones",
        reports: "Field Reports",
        alerts: "Alerts",
        logout: "Log out",
      },
      auth: {
        login: "Log in",
        email: "Email",
        password: "Password",
        signingIn: "Signing in...",
        invalid: "Invalid email or password.",
      },
      dash: {
        activeAlerts: "Active Alerts",
        highRisk: "High Risk Zones",
        veryHighRisk: "Very High Risk Zones",
        blockedRoads: "Blocked Roads",
        fieldReports: "Field Reports",
        sensorsOnline: "Sensors Online",
        priorityQueue: "Priority Queue",
        weather: "Weather / Rainfall",
        riskTrend: "Risk Trend",
        noData: "Data unavailable",
      },
      zone: {
        riskScore: "Risk Score",
        district: "District",
        state: "State",
        rainfall: "Rainfall (24h)",
        soilMoisture: "Soil Moisture",
        slope: "Slope",
        elevation: "Elevation",
        lastUpdated: "Last updated",
        modelVersion: "Model version",
        whyAtRisk: "Why this area is at risk",
        recommendedAction: "Recommended action",
      },
      levels: {
        LOW: "LOW",
        MODERATE: "MODERATE",
        HIGH: "HIGH",
        VERY_HIGH: "VERY HIGH",
      },
      quality: {
        LIVE: "LIVE DATA",
        HISTORICAL: "HISTORICAL DATA",
        SIMULATED: "SIMULATED DATA",
        DEMO: "DEMO DATA",
      },
    },
  },
  hi: {
    translation: {
      app: { name: "भूमिरक्षक", tagline: "पूर्वोत्तर भूस्खलन निगरानी" },
      nav: {
        dashboard: "डैशबोर्ड",
        riskZones: "जोखिम क्षेत्र",
        reports: "फील्ड रिपोर्ट",
        alerts: "अलर्ट",
        logout: "लॉग आउट",
      },
      auth: {
        login: "लॉग इन",
        email: "ईमेल",
        password: "पासवर्ड",
        signingIn: "साइन इन हो रहा है...",
        invalid: "अमान्य ईमेल या पासवर्ड।",
      },
      dash: {
        activeAlerts: "सक्रिय अलर्ट",
        highRisk: "उच्च जोखिम क्षेत्र",
        veryHighRisk: "अति उच्च जोखिम क्षेत्र",
        blockedRoads: "बंद सड़कें",
        fieldReports: "फील्ड रिपोर्ट",
        sensorsOnline: "ऑनलाइन सेंसर",
        priorityQueue: "प्राथमिकता सूची",
        weather: "मौसम / वर्षा",
        riskTrend: "जोखिम प्रवृत्ति",
        noData: "डेटा उपलब्ध नहीं",
      },
      zone: {
        riskScore: "जोखिम स्कोर",
        district: "ज़िला",
        state: "राज्य",
        rainfall: "वर्षा (24 घंटे)",
        soilMoisture: "मिट्टी की नमी",
        slope: "ढलान",
        elevation: "ऊँचाई",
        lastUpdated: "अंतिम अद्यतन",
        modelVersion: "मॉडल संस्करण",
        whyAtRisk: "यह क्षेत्र जोखिम में क्यों है",
        recommendedAction: "अनुशंसित कार्रवाई",
      },
      levels: {
        LOW: "कम",
        MODERATE: "मध्यम",
        HIGH: "उच्च",
        VERY_HIGH: "अति उच्च",
      },
      quality: {
        LIVE: "लाइव डेटा",
        HISTORICAL: "ऐतिहासिक डेटा",
        SIMULATED: "अनुकरित डेटा",
        DEMO: "डेमो डेटा",
      },
    },
  },
};

i18n.use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    interpolation: { escapeValue: false },
  });

export default i18n;