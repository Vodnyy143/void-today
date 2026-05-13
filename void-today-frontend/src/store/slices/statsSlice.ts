import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api } from '../../services/api';

export const fetchDashboard = createAsyncThunk('stats/dashboard', async () => {
    const res = await api.get('/stats/dashboard');
    return res.data;
});

export const fetchWeeklyStats = createAsyncThunk('stats/weekly', async () => {
    const res = await api.get('/stats/weekly');
    return res.data;
});

export const fetchHeatmap = createAsyncThunk('stats/heatmap', async () => {
    const res = await api.get('/stats/heatmap');
    return res.data;
});

interface StatsState {
    dashboard: any;
    weekly: any;
    heatmap: any[];
    status: 'idle' | 'loading' | 'error';
}

const initialState: StatsState = {
    dashboard: null,
    weekly: null,
    heatmap: [],
    status: 'idle',
};

const statsSlice = createSlice({
    name: 'stats',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(fetchDashboard.fulfilled, (state, action) => {
            state.dashboard = action.payload;
        });
        builder.addCase(fetchWeeklyStats.fulfilled, (state, action) => {
            state.weekly = action.payload;
        });
        builder.addCase(fetchHeatmap.fulfilled, (state, action) => {
            state.heatmap = action.payload;
        });
    },
});

export default statsSlice.reducer;