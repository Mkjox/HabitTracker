import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LocaleConfig } from 'react-native-calendars';

import en from './translations/en.json';
import tr from './translations/tr.json';
import es from './translations/es.json';
import zh from './translations/zh.json';

const LANGUAGE_KEY = '@app_language';

const resources = {
  en: { translation: en },
  tr: { translation: tr },
  es: { translation: es },
  zh: { translation: zh },
};

LocaleConfig.locales['en'] = {
  monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  monthNamesShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  dayNamesShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  today: 'Today'
};

LocaleConfig.locales['tr'] = {
  monthNames: ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'],
  monthNamesShort: ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'],
  dayNames: ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'],
  dayNamesShort: ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'],
  today: 'Bugün'
};

LocaleConfig.locales['es'] = {
  monthNames: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
  monthNamesShort: ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'],
  dayNames: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
  dayNamesShort: ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'],
  today: 'Hoy'
};

LocaleConfig.locales['zh'] = {
  monthNames: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
  monthNamesShort: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
  dayNames: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
  dayNamesShort: ['日', '一', '二', '三', '四', '五', '六'],
  today: '今天'
};

const initI18n = async () => {
  let savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);

  if (!savedLanguage) {
    // Fallback to device language if nothing is saved
    const locales = Localization.getLocales();
    savedLanguage = locales[0]?.languageCode || 'en';
  }

  await i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: savedLanguage,
      fallbackLng: 'en',
      interpolation: {
        escapeValue: false, // React already escapes values
      },
    });

  LocaleConfig.defaultLocale = ['tr', 'es', 'zh'].includes(savedLanguage) ? savedLanguage : 'en';
};

// Custom wrapper to change language and persist it
export const changeLanguage = async (lng: string) => {
  await i18n.changeLanguage(lng);
  await AsyncStorage.setItem(LANGUAGE_KEY, lng);
  LocaleConfig.defaultLocale = ['tr', 'es', 'zh'].includes(lng) ? lng : 'en';
};

// Returns the app's effective language for use in background tasks (notifications, widgets)
export const getEffectiveLanguage = async (): Promise<string> => {
  const saved = await AsyncStorage.getItem(LANGUAGE_KEY);
  if (saved) return saved;

  // Try device locale if it's a supported resource
  const locales = Localization.getLocales();
  const deviceLang = locales[0]?.languageCode;
  if (deviceLang && Object.prototype.hasOwnProperty.call(resources, deviceLang)) {
    return deviceLang;
  }

  return 'en';
};

export { initI18n };
export default i18n;
