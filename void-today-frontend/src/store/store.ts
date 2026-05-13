import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import taskReducer from './slices/taskSlice';
import projectReducer from './slices/projectSlice';
import subscriptionReducer from './slices/subscriptionSlice';
import organizationReducer from './slices/organizationSlice';
import statsReducer from './slices/statsSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        tasks: taskReducer,
        projects: projectReducer,
        subscriptions: subscriptionReducer,
        organizations: organizationReducer,
        stats: statsReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;