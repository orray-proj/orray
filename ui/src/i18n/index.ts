import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import it from "./locales/it.json";

const storedLocale = localStorage.getItem("orray-locale");
const browserLocale = navigator.language.split("-")[0];

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    it: { translation: it },
  },
  lng: storedLocale || browserLocale || "en",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});
