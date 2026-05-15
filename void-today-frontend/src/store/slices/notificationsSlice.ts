import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api } from '../../services/api';

export type NotificationType =
    | 'TASK_ASSIGNED'
    | 'TASK_DUE'
    | 'TASK_DONE'
    | 'SPRINT_START'
    | 'SPRINT_END'
    | 'INVITE'
    | 'MENITION';

export interface Notification {
    id: string;
    userId: string;
    type: NotificationType;
    text: string;
    read: boolean;
    createdAt: string;
}

interface NotificationsState {
    items: Notification[];
    unreadCount: number;
    total: number;
    hasMore: boolean;
    status: 'idle' | 'loading' | 'error';
}

const initialState: NotificationsState = {
    items: [],
    unreadCount: 0,
    total: 0,
    hasMore: false,
    status: 'idle',
};

// ─── Thunks ───────────────────────────────────────────────────────────────────

export const fetchNotifications = createAsyncThunk(
    'notifications/fetchAll',
    async (
        params: { unreadOnly?: boolean; limit?: number; offset?: number } = {},
        { rejectWithValue }
    ) => {
        try {
            const res = await api.get('/notifications', { params });
            return res.data;
        } catch (e: any) {
            return rejectWithValue(e.response?.data?.message ?? 'Ошибка загрузки');
        }
    }
);

export const fetchUnreadCount = createAsyncThunk(
    'notifications/fetchUnreadCount',
    async (_, { rejectWithValue }) => {
        try {
            const res = await api.get('/notifications/unread-count');
            return res.data;
        } catch (e: any) {
            return rejectWithValue(e.response?.data?.message ?? 'Ошибка');
        }
    }
);

export const markRead = createAsyncThunk(
    'notifications/markRead',
    async (ids: string[], { rejectWithValue }) => {
        try {
            const res = await api.patch('/notifications/read', { ids });
            return { ids, unreadCount: res.data.count };
        } catch (e: any) {
            return rejectWithValue(e.response?.data?.message ?? 'Ошибка');
        }
    }
);

export const markAllRead = createAsyncThunk(
    'notifications/markAllRead',
    async (_, { rejectWithValue }) => {
        try {
            await api.patch('/notifications/read-all');
            return true;
        } catch (e: any) {
            return rejectWithValue(e.response?.data?.message ?? 'Ошибка');
        }
    }
);

export const deleteNotification = createAsyncThunk(
    'notifications/deleteOne',
    async (id: string, { rejectWithValue }) => {
        try {
            await api.delete(`/notifications/${id}`);
            return id;
        } catch (e: any) {
            return rejectWithValue(e.response?.data?.message ?? 'Ошибка');
        }
    }
);

export const deleteAllNotifications = createAsyncThunk(
    'notifications/deleteAll',
    async (_, { rejectWithValue }) => {
        try {
            await api.delete('/notifications');
            return true;
        } catch (e: any) {
            return rejectWithValue(e.response?.data?.message ?? 'Ошибка');
        }
    }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const notificationsSlice = createSlice({
    name: 'notifications',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchNotifications.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchNotifications.fulfilled, (state, action) => {
                state.status = 'idle';
                state.items = action.payload.notifications;
                state.total = action.payload.total;
                state.unreadCount = action.payload.unreadCount;
                state.hasMore = action.payload.hasMore;
            })
            .addCase(fetchNotifications.rejected, (state) => {
                state.status = 'error';
            });

        builder.addCase(fetchUnreadCount.fulfilled, (state, action) => {
            state.unreadCount = action.payload.count;
        });

        builder.addCase(markRead.fulfilled, (state, action) => {
            const { ids, unreadCount } = action.payload;
            ids.forEach(id => {
                const n = state.items.find(n => n.id === id);
                if (n) n.read = true;
            });
            state.unreadCount = unreadCount;
        });

        builder.addCase(markAllRead.fulfilled, (state) => {
            state.items.forEach(n => { n.read = true; });
            state.unreadCount = 0;
        });

        builder.addCase(deleteNotification.fulfilled, (state, action) => {
            const deleted = state.items.find(n => n.id === action.payload);
            if (deleted && !deleted.read) state.unreadCount = Math.max(0, state.unreadCount - 1);
            state.items = state.items.filter(n => n.id !== action.payload);
            state.total = Math.max(0, state.total - 1);
        });

        builder.addCase(deleteAllNotifications.fulfilled, (state) => {
            state.items = [];
            state.total = 0;
            state.unreadCount = 0;
        });
    },
});

export default notificationsSlice.reducer;
