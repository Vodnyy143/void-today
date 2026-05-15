import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { notificationsApi, type Notification } from '../../api/notificationsApi';

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
    async (params?: { unreadOnly?: boolean; limit?: number; offset?: number }) => {
        const res = await notificationsApi.getAll(params);
        return res.data;
    }
);

export const fetchUnreadCount = createAsyncThunk(
    'notifications/fetchUnreadCount',
    async () => {
        const res = await notificationsApi.getUnreadCount();
        return res.data;
    }
);

export const markRead = createAsyncThunk(
    'notifications/markRead',
    async (ids: string[]) => {
        const res = await notificationsApi.markRead(ids);
        return { ids, unreadCount: res.data.count };
    }
);

export const markAllRead = createAsyncThunk(
    'notifications/markAllRead',
    async () => {
        await notificationsApi.markAllRead();
    }
);

export const deleteNotification = createAsyncThunk(
    'notifications/deleteOne',
    async (id: string) => {
        await notificationsApi.deleteOne(id);
        return id;
    }
);

export const deleteAllNotifications = createAsyncThunk(
    'notifications/deleteAll',
    async () => {
        await notificationsApi.deleteAll();
    }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const notificationsSlice = createSlice({
    name: 'notifications',
    initialState,
    reducers: {
        // Для добавления уведомления в реальном времени (например, через WebSocket)
        addNotification(state, action: PayloadAction<Notification>) {
            state.items.unshift(action.payload);
            state.total += 1;
            if (!action.payload.read) state.unreadCount += 1;
        },
    },
    extraReducers: (builder) => {
        builder
            // fetchNotifications
            .addCase(fetchNotifications.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchNotifications.fulfilled, (state, action) => {
                state.status = 'idle';
                state.items = action.payload.notifications;
                state.unreadCount = action.payload.unreadCount;
                state.total = action.payload.total;
                state.hasMore = action.payload.hasMore;
            })
            .addCase(fetchNotifications.rejected, (state) => {
                state.status = 'error';
            })

            // fetchUnreadCount
            .addCase(fetchUnreadCount.fulfilled, (state, action) => {
                state.unreadCount = action.payload.count;
            })

            // markRead
            .addCase(markRead.fulfilled, (state, action) => {
                action.payload.ids.forEach(id => {
                    const n = state.items.find(n => n.id === id);
                    if (n) n.read = true;
                });
                state.unreadCount = action.payload.unreadCount;
            })

            // markAllRead
            .addCase(markAllRead.fulfilled, (state) => {
                state.items.forEach(n => { n.read = true; });
                state.unreadCount = 0;
            })

            // deleteNotification
            .addCase(deleteNotification.fulfilled, (state, action) => {
                const removed = state.items.find(n => n.id === action.payload);
                if (removed && !removed.read) state.unreadCount -= 1;
                state.items = state.items.filter(n => n.id !== action.payload);
                state.total -= 1;
            })

            // deleteAllNotifications
            .addCase(deleteAllNotifications.fulfilled, (state) => {
                state.items = [];
                state.unreadCount = 0;
                state.total = 0;
                state.hasMore = false;
            });
    },
});

export const { addNotification } = notificationsSlice.actions;
export default notificationsSlice.reducer;
