import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { api } from '../../services/api';

interface User {
    id: string;
    email: string;
    name: string;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
};

// Sign Up
export const signUp = createAsyncThunk(
    'auth/signUp',
    async (credentials: { name: string; email: string; password: string }, { rejectWithValue }) => {
        try {
            const response = await api.post('/auth/sign-up', credentials);
            return response.data.user;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Ошибка регистрации');
        }
    }
);

// Sign In
export const signIn = createAsyncThunk(
    'auth/signIn',
    async (credentials: { email: string; password: string }, { rejectWithValue }) => {
        try {
            const response = await api.post('/auth/sign-in', credentials);
            return response.data.user;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Неверный email или пароль');
        }
    }
);

// Get Me (проверка авторизации)
export const getMe = createAsyncThunk(
    'auth/getMe',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/auth/me');
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Не авторизован');
        }
    }
);

// Refresh Token
export const refreshToken = createAsyncThunk(
    'auth/refresh',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.post('/auth/refresh');
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Ошибка обновления токена');
        }
    }
);

// Sign Out
export const signOut = createAsyncThunk(
    'auth/signOut',
    async (_, { rejectWithValue }) => {
        try {
            await api.post('/auth/sign-out');
            return null;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Ошибка выхода');
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        resetAuth: (state) => {
            state.user = null;
            state.isAuthenticated = false;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        // Sign Up
        builder
            .addCase(signUp.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(signUp.fulfilled, (state, action: PayloadAction<User>) => {
                state.isLoading = false;
                state.user = action.payload;
                state.isAuthenticated = true;
            })
            .addCase(signUp.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Sign In
        builder
            .addCase(signIn.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(signIn.fulfilled, (state, action: PayloadAction<User>) => {
                state.isLoading = false;
                state.user = action.payload;
                state.isAuthenticated = true;
            })
            .addCase(signIn.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Get Me
        builder
            .addCase(getMe.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getMe.fulfilled, (state, action: PayloadAction<User>) => {
                state.isLoading = false;
                state.user = action.payload;
                state.isAuthenticated = true;
            })
            .addCase(getMe.rejected, (state) => {
                state.isLoading = false;
                state.user = null;
                state.isAuthenticated = false;
            });

        // Sign Out
        builder
            .addCase(signOut.fulfilled, (state) => {
                state.user = null;
                state.isAuthenticated = false;
                state.error = null;
            });
    },
});

export const { clearError, resetAuth } = authSlice.actions;
export default authSlice.reducer;