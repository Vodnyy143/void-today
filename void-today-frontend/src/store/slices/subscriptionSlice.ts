import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import api from "../../services/api.ts";

interface Subscription {
    id: string;
    plan: 'FREE' | 'PRO' | 'BUSINESS';
    expiresAt: string | null;
}

interface SubscriptionState {
    subscription: Subscription | null;
    status: 'idle' | 'loading' | 'error';
}

const initialState: SubscriptionState = {
    subscription: null,
    status: 'idle',
};

export const fetchSubscription = createAsyncThunk(
    'subscription/fetch',
    async () => {
        const res = await api.get('/subscriptions/me');
        return res.data;
    }
);

export const upgradePlan = createAsyncThunk(
    'subscription/upgrade',
    async (plan: 'PRO' | 'BUSINESS') => {
        const res = await api.patch('/subscriptions/upgrade', { plan });
        return res.data;
    }
);

const subscriptionSlice = createSlice({
    name: 'subscription',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchSubscription.fulfilled, (state, action) => {
                state.subscription = action.payload;
                state.status = 'idle';
            })
            .addCase(upgradePlan.fulfilled, (state, action) => {
                state.subscription = action.payload;
            });
    },
});

export default subscriptionSlice.reducer;