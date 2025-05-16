import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { LanguageCode, supportedLngs } from "./language";
import { defaultLng, defaultNS, fallbackNS } from "./settings";

import enUSLocales from "../../public/locales/en-US";
import esPELocales from "../../public/locales/es-PE";
import ptBRLocales from "../../public/locales/pt-BR";
import jaJPLocales from "../../public/locales/ja-JP";

i18next
    .use(initReactI18next)
    .use(LanguageDetector)
    .init({
        supportedLngs: supportedLngs.map((lng) => lng.code),
        lng: defaultLng,
        fallbackLng: defaultLng,
        defaultNS,
        fallbackNS,
        preload: supportedLngs.map((lng) => lng.code),
        detection: {
            order: ["path", "htmlTag", "cookie", "navigation"],
            caches: ["cookie"],
        },
        resources: {
            [LanguageCode.EN_US]: enUSLocales,
            [LanguageCode.ES_PE]: esPELocales,
            [LanguageCode.PT_BR]: ptBRLocales,
            [LanguageCode.JA_JP]: jaJPLocales
        },
    });

export default i18next;
