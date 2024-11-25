import { createI18n } from 'vue-i18n';
import en from '@/i18n/en.json';
import uk from '@/i18n/uk.json';
import ru from '@/i18n/ru.json';

const savedLanguage = localStorage.getItem('preferredLanguage');
const defaultLocale = savedLanguage && (savedLanguage === 'en' || savedLanguage === 'uk' || savedLanguage === 'ru') ? savedLanguage : 'en';

export const i18n = createI18n({
    legacy: false, // Включаем Composition API для i18n
    globalInjection: true, // Позволяет использовать $t глобально без необходимости импорта
    locale: defaultLocale, // Язык по умолчанию
    fallbackLocale: 'en', // Резервный язык
    messages: {
        en,
        uk,
        ru
    },
});

export default i18n;