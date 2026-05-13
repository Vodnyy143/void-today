import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { api } from '../../services/api';

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE' | 'ARCHIVED';
export type TaskPriority = 'HIGH' | 'MEDIUM' | 'LOW';
export type TaskType = 'MICRO' | 'MACRO';
export type RepeatType = 'NONE' | 'DAILY' | 'WEEKLY';

export interface CheckPoint {
    id: string;
    title: string;
    done: boolean;
    order: number;
}

export interface Task {
    id: string;
    title: string;
    description?: string;
    type: TaskType;
    status: TaskStatus;
    priority: TaskPriority;
    dueDate?: string;
    repeat: RepeatType;
    completedAt?: string;
    creatorId: string;
    assigneeId?: string;
    assignee?: {
        id: string;
        name: string | null;
        email: string;
        avatar?: string;
    };
    categoryId?: string;
    goalId?: string;
    projectId?: string;
    kanbanColumnId?: string;
    sprintId?: string;
    checkpoints?: CheckPoint[];
    createdAt: string;
    updatedAt: string;
}

interface TaskState {
    tasks: Task[];
    currentTask: Task | null;
    isLoading: boolean;
    error: string | null;
    filters: {
        view: 'today' | 'tomorrow' | 'week' | 'all';
        status?: TaskStatus;
        priority?: TaskPriority;
        projectId?: string;
    };
}

const initialState: TaskState = {
    tasks: [],
    currentTask: null,
    isLoading: false,
    error: null,
    filters: {
        view: 'today',
    },
};

export const createTask = createAsyncThunk(
    'tasks/create',
    async (
        taskData: {
            title: string;
            description?: string;
            type?: TaskType;
            priority?: TaskPriority;
            dueDate?: string;
            categoryId?: string;
            projectId?: string;
            assigneeId?: string;  // ← добавь это
            checkpoints?: Array<{ title: string; order: number }>;
        },
        { rejectWithValue }
    ) => {
        try {
            const response = await api.post('/tasks', taskData);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create task');
        }
    }
);

export const getTasks = createAsyncThunk(
    'tasks/getAll',
    async (
        filters: {
            view?: 'today' | 'tomorrow' | 'week' | 'all';
            status?: TaskStatus;
            priority?: TaskPriority;
            projectId?: string;
        } = {},
        { rejectWithValue }
    ) => {
        try {
            const response = await api.get('/tasks', { params: filters });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch tasks');
        }
    }
);

export const getTask = createAsyncThunk(
    'tasks/getOne',
    async (taskId: string, { rejectWithValue }) => {
        try {
            const response = await api.get(`/tasks/${taskId}`);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch task');
        }
    }
);

export const updateTask = createAsyncThunk(
    'tasks/update',
    async (
        {
            taskId,
            updates,
        }: {
            taskId: string;
            updates: Partial<Task>;
        },
        { rejectWithValue }
    ) => {
        try {
            const response = await api.patch(`/tasks/${taskId}`, updates);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update task');
        }
    }
);

export const toggleTaskStatus = createAsyncThunk(
    'tasks/toggleStatus',
    async (taskId: string, { getState, rejectWithValue }) => {
        try {
            const state = getState() as { tasks: TaskState };
            const task = state.tasks.tasks.find((t) => t.id === taskId);

            if (!task) {
                throw new Error('Task not found');
            }

            const newStatus: TaskStatus = task.status === 'DONE' ? 'TODO' : 'DONE';

            const response = await api.patch(`/tasks/${taskId}`, {
                status: newStatus,
                completedAt: newStatus === 'DONE' ? new Date().toISOString() : null,
            });

            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to toggle task status');
        }
    }
);

export const toggleCheckpoint = createAsyncThunk(
    'tasks/toggleCheckpoint',
    async (
        { taskId, checkpointId }: { taskId: string; checkpointId: string },
        { rejectWithValue }
    ) => {
        try {
            const response = await api.patch(`/tasks/${taskId}/checkpoints/${checkpointId}`);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to toggle checkpoint');
        }
    }
);

export const deleteTask = createAsyncThunk(
    'tasks/delete',
    async (taskId: string, { rejectWithValue }) => {
        try {
            await api.delete(`/tasks/${taskId}`);
            return taskId;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete task');
        }
    }
);

export const getChaos = createAsyncThunk(
    'tasks/getChaos',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/tasks/chaos');
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch chaos tasks');
        }
    }
);

const taskSlice = createSlice({
    name: 'tasks',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        setFilters: (state, action: PayloadAction<Partial<TaskState['filters']>>) => {
            if (Object.keys(action.payload).length === 0) {
                state.filters = { view: 'all' };
            } else {
                state.filters = { view: 'all', ...action.payload };
            }
        },
        clearCurrentTask: (state) => {
            state.currentTask = null;
        },
        optimisticToggle: (state, action: PayloadAction<string>) => {
            const task = state.tasks.find((t) => t.id === action.payload);
            if (task) {
                task.status = task.status === 'DONE' ? 'TODO' : 'DONE';
                task.completedAt = task.status === 'DONE' ? new Date().toISOString() : undefined;
            }
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(createTask.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(createTask.fulfilled, (state, action: PayloadAction<Task>) => {
                state.isLoading = false;
                state.tasks.unshift(action.payload);
            })
            .addCase(createTask.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        builder
            .addCase(getTasks.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getTasks.fulfilled, (state, action: PayloadAction<Task[]>) => {
                state.isLoading = false;
                state.tasks = action.payload;
            })
            .addCase(getTasks.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Get Single Task
        builder
            .addCase(getTask.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getTask.fulfilled, (state, action: PayloadAction<Task>) => {
                state.isLoading = false;
                state.currentTask = action.payload;
            })
            .addCase(getTask.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Update Task
        builder
            .addCase(updateTask.fulfilled, (state, action: PayloadAction<Task>) => {
                const index = state.tasks.findIndex((t) => t.id === action.payload.id);
                if (index !== -1) {
                    state.tasks[index] = action.payload;
                }
                if (state.currentTask?.id === action.payload.id) {
                    state.currentTask = action.payload;
                }
            });

        // Toggle Task Status
        builder
            .addCase(toggleTaskStatus.fulfilled, (state, action: PayloadAction<Task>) => {
                const index = state.tasks.findIndex((t) => t.id === action.payload.id);
                if (index !== -1) {
                    state.tasks[index] = action.payload;
                }
            });

        // Toggle Checkpoint
        builder
            .addCase(toggleCheckpoint.fulfilled, (state, action: PayloadAction<Task>) => {
                const index = state.tasks.findIndex((t) => t.id === action.payload.id);
                if (index !== -1) {
                    state.tasks[index] = action.payload;
                }
                if (state.currentTask?.id === action.payload.id) {
                    state.currentTask = action.payload;
                }
            });

        // Delete Task
        builder
            .addCase(deleteTask.fulfilled, (state, action: PayloadAction<string>) => {
                state.tasks = state.tasks.filter((t) => t.id !== action.payload);
                if (state.currentTask?.id === action.payload) {
                    state.currentTask = null;
                }
            });

        // Get Chaos
        builder
            .addCase(getChaos.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getChaos.fulfilled, (state, action: PayloadAction<Task[]>) => {
                state.isLoading = false;
                state.tasks = action.payload;
            })
            .addCase(getChaos.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearError, setFilters, clearCurrentTask, optimisticToggle } = taskSlice.actions;
export default taskSlice.reducer;