import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type Theme = 'dark' | 'light' | 'system';
export type Language = 'ru' | 'en';

interface SettingsState {
    theme: Theme;
    language: Language;
}

const settingsSlice = createSlice({
    name: 'settings',
    initialState: (): SettingsState => ({
        theme: (localStorage.getItem('vt-theme') as Theme) || 'dark',
        language: (localStorage.getItem('vt-language') as Language) || 'ru',
    }),
    reducers: {
        setTheme(state, action: PayloadAction<Theme>) {
            state.theme = action.payload;
            localStorage.setItem('vt-theme', action.payload);
        },
        setLanguage(state, action: PayloadAction<Language>) {
            state.language = action.payload;
            localStorage.setItem('vt-language', action.payload);
        },
    },
});

export const { setTheme, setLanguage } = settingsSlice.actions;
export default settingsSlice.reducer;
