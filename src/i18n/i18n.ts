import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import bn from './locales/bn.json';
import hi from './locales/hi.json';
import es from './locales/es.json';
import ar from './locales/ar.json';
import de from './locales/de.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      bn: { translation: bn },
      hi: { translation: hi },
      es: { translation: es },
      ar: { translation: ar },
      de: { translation: de },
    },
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
