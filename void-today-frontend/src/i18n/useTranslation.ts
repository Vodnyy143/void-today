import { useAppSelector } from '../store/hooks';
import { translations } from './translations';

type TranslationDict = typeof translations.ru;

type DotPaths<T, Prefix extends string = ''> = {
    [K in keyof T]: T[K] extends string
        ? `${Prefix}${K & string}`
        : DotPaths<T[K], `${Prefix}${K & string}.`>;
}[keyof T];

type TranslationKey = DotPaths<TranslationDict>;

export const useTranslation = () => {
    const { language } = useAppSelector(s => s.settings);
    const dict = translations[language];

    const t = (key: TranslationKey): string => {
        const parts = (key as string).split('.');
        let val: unknown = dict;
        for (const p of parts) {
            val = (val as Record<string, unknown>)?.[p];
        }
        return typeof val === 'string' ? val : key;
    };

    const tf = (key: TranslationKey, vars: Record<string, string | number>): string => {
        let str = t(key);
        for (const [k, v] of Object.entries(vars)) {
            str = str.replace(`{${k}}`, String(v));
        }
        return str;
    };

    return { t, tf, language };
};
