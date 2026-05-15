import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { api } from '../../services/api';

export interface KanbanTask {
    id: string;
    title: string;
    status: string;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    dueDate?: string;
    assignee?: { id: string; name: string | null; email: string; avatar?: string };
    checkpoints?: { id: string; title: string; done: boolean }[];
    projectId?: string;
    sprintId?: string;
    kanbanColumnId?: string;
    createdAt: string;
}

export interface KanbanColumn {
    id: string;
    name: string;
    order: number;
    boardId: string;
    wipLimit?: number | null;
    tasks: KanbanTask[];
}

export interface KanbanBoard {
    id: string;
    name: string;
    projectId: string;
    columns: KanbanColumn[];
    _count?: { columns: number };
}

interface KanbanState {
    boards: KanbanBoard[];
    currentBoard: KanbanBoard | null;
    status: 'idle' | 'loading' | 'error';
    error: string | null;
}

const initialState: KanbanState = {
    boards: [],
    currentBoard: null,
    status: 'idle',
    error: null,
};

// ─── Thunks ───────────────────────────────────────────────────────────────────

export const fetchBoards = createAsyncThunk(
    'kanban/fetchBoards',
    async (projectId: string, { rejectWithValue }) => {
        try {
            const res = await api.get(`/kanban/boards/project/${projectId}`);
            return res.data;
        } catch (e: any) {
            return rejectWithValue(e.response?.data?.message ?? 'Ошибка загрузки досок');
        }
    }
);

export const fetchBoard = createAsyncThunk(
    'kanban/fetchBoard',
    async (boardId: string, { rejectWithValue }) => {
        try {
            const res = await api.get(`/kanban/boards/${boardId}`);
            return res.data;
        } catch (e: any) {
            return rejectWithValue(e.response?.data?.message ?? 'Ошибка загрузки доски');
        }
    }
);

export const createBoard = createAsyncThunk(
    'kanban/createBoard',
    async (data: { name: string; projectId: string }, { rejectWithValue }) => {
        try {
            const res = await api.post('/kanban/boards', data);
            return res.data;
        } catch (e: any) {
            return rejectWithValue(e.response?.data?.message ?? 'Ошибка создания доски');
        }
    }
);

export const deleteBoard = createAsyncThunk(
    'kanban/deleteBoard',
    async (boardId: string, { rejectWithValue }) => {
        try {
            await api.delete(`/kanban/boards/${boardId}`);
            return boardId;
        } catch (e: any) {
            return rejectWithValue(e.response?.data?.message ?? 'Ошибка удаления');
        }
    }
);

export const createColumn = createAsyncThunk(
    'kanban/createColumn',
    async (
        data: { boardId: string; name: string; wipLimit?: number },
        { rejectWithValue }
    ) => {
        try {
            const res = await api.post(`/kanban/boards/${data.boardId}/columns`, {
                name: data.name,
                wipLimit: data.wipLimit,
            });
            return res.data;
        } catch (e: any) {
            return rejectWithValue(e.response?.data?.message ?? 'Ошибка создания колонки');
        }
    }
);

export const deleteColumn = createAsyncThunk(
    'kanban/deleteColumn',
    async (columnId: string, { rejectWithValue }) => {
        try {
            await api.delete(`/kanban/columns/${columnId}`);
            return columnId;
        } catch (e: any) {
            return rejectWithValue(e.response?.data?.message ?? 'Ошибка удаления колонки');
        }
    }
);

export const moveTask = createAsyncThunk(
    'kanban/moveTask',
    async (
        data: { taskId: string; columnId: string },
        { rejectWithValue }
    ) => {
        try {
            const res = await api.patch(`/kanban/tasks/${data.taskId}/move`, {
                columnId: data.columnId,
            });
            return res.data;
        } catch (e: any) {
            return rejectWithValue(e.response?.data?.message ?? 'Ошибка перемещения задачи');
        }
    }
);

export const reorderColumns = createAsyncThunk(
    'kanban/reorderColumns',
    async (
        data: { boardId: string; columns: { id: string; order: number }[] },
        { rejectWithValue }
    ) => {
        try {
            const res = await api.patch(`/kanban/boards/${data.boardId}/columns/reorder`, {
                columns: data.columns,
            });
            return res.data;
        } catch (e: any) {
            return rejectWithValue(e.response?.data?.message ?? 'Ошибка перестановки');
        }
    }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const kanbanSlice = createSlice({
    name: 'kanban',
    initialState,
    reducers: {
        clearCurrentBoard(state) {
            state.currentBoard = null;
        },
        // Оптимистичное перемещение задачи (до ответа сервера)
        optimisticMoveTask(
            state,
            action: PayloadAction<{ taskId: string; fromColumnId: string; toColumnId: string }>
        ) {
            if (!state.currentBoard) return;
            const { taskId, fromColumnId, toColumnId } = action.payload;

            const fromCol = state.currentBoard.columns.find(c => c.id === fromColumnId);
            const toCol = state.currentBoard.columns.find(c => c.id === toColumnId);

            if (!fromCol || !toCol) return;

            const taskIndex = fromCol.tasks.findIndex(t => t.id === taskId);
            if (taskIndex === -1) return;

            const [task] = fromCol.tasks.splice(taskIndex, 1);
            task.kanbanColumnId = toColumnId;
            toCol.tasks.push(task);
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchBoards.pending, (state) => { state.status = 'loading'; })
            .addCase(fetchBoards.fulfilled, (state, action) => {
                state.status = 'idle';
                state.boards = action.payload;
            })
            .addCase(fetchBoards.rejected, (state, action) => {
                state.status = 'error';
                state.error = action.payload as string;
            });

        builder
            .addCase(fetchBoard.pending, (state) => { state.status = 'loading'; })
            .addCase(fetchBoard.fulfilled, (state, action) => {
                state.status = 'idle';
                state.currentBoard = action.payload;
            })
            .addCase(fetchBoard.rejected, (state, action) => {
                state.status = 'error';
                state.error = action.payload as string;
            });

        builder.addCase(createBoard.fulfilled, (state, action) => {
            state.boards.push(action.payload);
            state.currentBoard = action.payload;
        });

        builder.addCase(deleteBoard.fulfilled, (state, action) => {
            state.boards = state.boards.filter(b => b.id !== action.payload);
            if (state.currentBoard?.id === action.payload) state.currentBoard = null;
        });

        builder.addCase(createColumn.fulfilled, (state, action) => {
            if (state.currentBoard) {
                state.currentBoard.columns.push(action.payload);
            }
        });

        builder.addCase(deleteColumn.fulfilled, (state, action) => {
            if (state.currentBoard) {
                state.currentBoard.columns = state.currentBoard.columns.filter(
                    c => c.id !== action.payload
                );
            }
        });

        builder.addCase(moveTask.fulfilled, (state, action) => {
            if (!state.currentBoard) return;
            const updatedTask = action.payload;
            // Синхронизируем после ответа сервера
            for (const col of state.currentBoard.columns) {
                const idx = col.tasks.findIndex(t => t.id === updatedTask.id);
                if (idx !== -1) {
                    col.tasks[idx] = updatedTask;
                }
            }
        });

        builder.addCase(reorderColumns.fulfilled, (state, action) => {
            state.currentBoard = action.payload;
        });
    },
});

export const { clearCurrentBoard, optimisticMoveTask } = kanbanSlice.actions;
export default kanbanSlice.reducer;
