import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api } from '../../services/api';

export type SprintStatus = 'PLANNED' | 'ACTIVE' | 'COMPLETED';

export interface Sprint {
    id: string;
    name: string;
    projectId: string;
    goal?: string | null;
    status: SprintStatus;
    startDate?: string | null;
    endDate?: string | null;
    tasks?: any[];
    _count?: { tasks: number };
    createdAt: string;
}

export interface SprintStats {
    sprintId: string;
    sprintName: string;
    status: SprintStatus;
    startDate?: string | null;
    endDate?: string | null;
    total: number;
    done: number;
    inProgress: number;
    review: number;
    todo: number;
    completionRate: number;
    burndown: { date: string; remaining: number }[];
    byAssignee: { name: string; total: number; done: number }[];
}

interface SprintsState {
    sprints: Sprint[];
    currentSprint: Sprint | null;
    currentStats: SprintStats | null;
    backlog: any[];
    status: 'idle' | 'loading' | 'error';
    error: string | null;
}

const initialState: SprintsState = {
    sprints: [],
    currentSprint: null,
    currentStats: null,
    backlog: [],
    status: 'idle',
    error: null,
};

// ─── Thunks ───────────────────────────────────────────────────────────────────

export const fetchSprints = createAsyncThunk(
    'sprints/fetchAll',
    async (projectId: string, { rejectWithValue }) => {
        try {
            const res = await api.get(`/sprints?projectId=${projectId}`);
            return res.data;
        } catch (e: any) {
            return rejectWithValue(e.response?.data?.message ?? 'Ошибка загрузки');
        }
    }
);

export const fetchSprint = createAsyncThunk(
    'sprints/fetchOne',
    async (sprintId: string, { rejectWithValue }) => {
        try {
            const res = await api.get(`/sprints/${sprintId}`);
            return res.data;
        } catch (e: any) {
            return rejectWithValue(e.response?.data?.message ?? 'Ошибка загрузки');
        }
    }
);

export const createSprint = createAsyncThunk(
    'sprints/create',
    async (
        data: { name: string; projectId: string; goal?: string; startDate?: string; endDate?: string },
        { rejectWithValue }
    ) => {
        try {
            const res = await api.post('/sprints', data);
            return res.data;
        } catch (e: any) {
            return rejectWithValue(e.response?.data?.message ?? 'Ошибка создания');
        }
    }
);

export const updateSprint = createAsyncThunk(
    'sprints/update',
    async (
        { sprintId, data }: { sprintId: string; data: Partial<Sprint> },
        { rejectWithValue }
    ) => {
        try {
            const res = await api.patch(`/sprints/${sprintId}`, data);
            return res.data;
        } catch (e: any) {
            return rejectWithValue(e.response?.data?.message ?? 'Ошибка обновления');
        }
    }
);

export const deleteSprint = createAsyncThunk(
    'sprints/delete',
    async (sprintId: string, { rejectWithValue }) => {
        try {
            await api.delete(`/sprints/${sprintId}`);
            return sprintId;
        } catch (e: any) {
            return rejectWithValue(e.response?.data?.message ?? 'Ошибка удаления');
        }
    }
);

export const startSprint = createAsyncThunk(
    'sprints/start',
    async (sprintId: string, { rejectWithValue }) => {
        try {
            const res = await api.post(`/sprints/${sprintId}/start`);
            return res.data;
        } catch (e: any) {
            return rejectWithValue(e.response?.data?.message ?? 'Ошибка запуска');
        }
    }
);

export const completeSprint = createAsyncThunk(
    'sprints/complete',
    async (sprintId: string, { rejectWithValue }) => {
        try {
            const res = await api.post(`/sprints/${sprintId}/complete`);
            return res.data;
        } catch (e: any) {
            return rejectWithValue(e.response?.data?.message ?? 'Ошибка завершения');
        }
    }
);

export const addTasksToSprint = createAsyncThunk(
    'sprints/addTasks',
    async (
        { sprintId, taskIds }: { sprintId: string; taskIds: string[] },
        { rejectWithValue }
    ) => {
        try {
            const res = await api.post(`/sprints/${sprintId}/tasks`, { taskIds });
            return res.data;
        } catch (e: any) {
            return rejectWithValue(e.response?.data?.message ?? 'Ошибка добавления задач');
        }
    }
);

export const removeTaskFromSprint = createAsyncThunk(
    'sprints/removeTask',
    async (
        { sprintId, taskId }: { sprintId: string; taskId: string },
        { rejectWithValue }
    ) => {
        try {
            await api.delete(`/sprints/${sprintId}/tasks/${taskId}`);
            return { sprintId, taskId };
        } catch (e: any) {
            return rejectWithValue(e.response?.data?.message ?? 'Ошибка удаления задачи');
        }
    }
);

export const fetchBacklog = createAsyncThunk(
    'sprints/fetchBacklog',
    async (projectId: string, { rejectWithValue }) => {
        try {
            const res = await api.get(`/sprints/backlog/${projectId}`);
            return res.data;
        } catch (e: any) {
            return rejectWithValue(e.response?.data?.message ?? 'Ошибка загрузки бэклога');
        }
    }
);

export const fetchSprintStats = createAsyncThunk(
    'sprints/fetchStats',
    async (sprintId: string, { rejectWithValue }) => {
        try {
            const res = await api.get(`/sprints/${sprintId}/stats`);
            return res.data;
        } catch (e: any) {
            return rejectWithValue(e.response?.data?.message ?? 'Ошибка загрузки статистики');
        }
    }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const sprintsSlice = createSlice({
    name: 'sprints',
    initialState,
    reducers: {
        clearCurrentSprint(state) {
            state.currentSprint = null;
            state.currentStats = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchSprints.pending, (state) => { state.status = 'loading'; })
            .addCase(fetchSprints.fulfilled, (state, action) => {
                state.status = 'idle';
                state.sprints = action.payload;
            })
            .addCase(fetchSprints.rejected, (state, action) => {
                state.status = 'error';
                state.error = action.payload as string;
            });

        builder.addCase(fetchSprint.fulfilled, (state, action) => {
            state.currentSprint = action.payload;
        });

        builder.addCase(createSprint.fulfilled, (state, action) => {
            state.sprints.unshift(action.payload);
        });

        builder.addCase(updateSprint.fulfilled, (state, action) => {
            const idx = state.sprints.findIndex(s => s.id === action.payload.id);
            if (idx !== -1) state.sprints[idx] = action.payload;
            if (state.currentSprint?.id === action.payload.id) {
                state.currentSprint = { ...state.currentSprint, ...action.payload };
            }
        });

        builder.addCase(deleteSprint.fulfilled, (state, action) => {
            state.sprints = state.sprints.filter(s => s.id !== action.payload);
            if (state.currentSprint?.id === action.payload) state.currentSprint = null;
        });

        builder.addCase(startSprint.fulfilled, (state, action) => {
            const idx = state.sprints.findIndex(s => s.id === action.payload.id);
            if (idx !== -1) state.sprints[idx] = { ...state.sprints[idx], ...action.payload };
        });

        builder.addCase(completeSprint.fulfilled, (state, action) => {
            const sprint = action.payload.sprint;
            const idx = state.sprints.findIndex(s => s.id === sprint.id);
            if (idx !== -1) state.sprints[idx] = { ...state.sprints[idx], ...sprint };
        });

        builder.addCase(addTasksToSprint.fulfilled, (state, action) => {
            state.currentSprint = action.payload;
        });

        builder.addCase(removeTaskFromSprint.fulfilled, (state, action) => {
            if (state.currentSprint?.tasks) {
                state.currentSprint.tasks = state.currentSprint.tasks.filter(
                    t => t.id !== action.payload.taskId
                );
            }
        });

        builder.addCase(fetchBacklog.fulfilled, (state, action) => {
            state.backlog = action.payload;
        });

        builder.addCase(fetchSprintStats.fulfilled, (state, action) => {
            state.currentStats = action.payload;
        });
    },
});

export const { clearCurrentSprint } = sprintsSlice.actions;
export default sprintsSlice.reducer;
