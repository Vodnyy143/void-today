import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { api } from '../../services/api';

export type ProjectRole = 'MANAGER' | 'MEMBER';

export interface ProjectMember {
    id: string;
    userId: string;
    projectId: string;
    role: ProjectRole;
    user: {
        id: string;
        name: string;
        email: string;
        avatar?: string;
    };
}

export interface Project {
    id: string;
    name: string;
    color?: string;
    description?: string;
    orgId?: string;
    departmentId?: string;
    createdAt: string;
    updatedAt: string;
    members?: ProjectMember[];
    taskCount?: number;
    completedTaskCount?: number;
}

export interface ProjectStats {
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    todoTasks: number;
    highPriorityTasks: number;
}

export interface TeamStats {
    memberId: string;
    memberName: string;
    assignedTasks: number;
    completedTasks: number;
    completionRate: number;
}

interface ProjectState {
    projects: Project[];
    currentProject: Project | null;
    currentProjectStats: ProjectStats | null;
    teamStats: TeamStats[];
    isLoading: boolean;
    error: string | null;
}

const initialState: ProjectState = {
    projects: [],
    currentProject: null,
    currentProjectStats: null,
    teamStats: [],
    isLoading: false,
    error: null,
};

// Create Project
export const createProject = createAsyncThunk(
    'projects/create',
    async (
        projectData: {
            name: string;
            description?: string;
            color?: string;
            orgId?: string;
            departmentId?: string;
        },
        { rejectWithValue }
    ) => {
        try {
            console.log('Sending to API:', projectData);
            const response = await api.post('/projects', projectData);
            console.log('Response from API:', response.data);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create project');
        }
    }
);

export const getProjects = createAsyncThunk(
    'projects/getAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/projects');
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch projects');
        }
    }
);

export const getProject = createAsyncThunk(
    'projects/getOne',
    async (projectId: string, { rejectWithValue }) => {
        try {
            const response = await api.get(`/projects/${projectId}`);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch project');
        }
    }
);

export const getProjectStats = createAsyncThunk(
    'projects/getStats',
    async (projectId: string, { rejectWithValue }) => {
        try {
            const response = await api.get(`/projects/${projectId}/stats`);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch project stats');
        }
    }
);

export const getTeamStats = createAsyncThunk(
    'projects/getTeamStats',
    async (projectId: string, { rejectWithValue }) => {
        try {
            const response = await api.get(`/projects/${projectId}/team-stats`);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch team stats');
        }
    }
);

export const updateProject = createAsyncThunk(
    'projects/update',
    async (
        {
            projectId,
            updates,
        }: {
            projectId: string;
            updates: Partial<Project>;
        },
        { rejectWithValue }
    ) => {
        try {
            const response = await api.patch(`/projects/${projectId}`, updates);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update project');
        }
    }
);

// Add Member
export const addMember = createAsyncThunk(
    'projects/addMember',
    async (
        { projectId, userId }: { projectId: string; userId: string },
        { rejectWithValue }
    ) => {
        try {
            const response = await api.post(`/projects/${projectId}/members`, { userId });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to add member');
        }
    }
);

// Remove Member
export const removeMember = createAsyncThunk(
    'projects/removeMember',
    async (
        { projectId, memberId }: { projectId: string; memberId: string },
        { rejectWithValue }
    ) => {
        try {
            await api.delete(`/projects/${projectId}/members/${memberId}`);
            return { projectId, memberId };
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to remove member');
        }
    }
);

// Update Member Role
export const updateMemberRole = createAsyncThunk(
    'projects/updateMemberRole',
    async (
        {
            projectId,
            memberId,
            role,
        }: {
            projectId: string;
            memberId: string;
            role: ProjectRole;
        },
        { rejectWithValue }
    ) => {
        try {
            await api.patch(`/projects/${projectId}/members/${memberId}/role`, { role });
            return { projectId, memberId, role };
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update member role');
        }
    }
);

// Delete Project
export const deleteProject = createAsyncThunk(
    'projects/delete',
    async (projectId: string, { rejectWithValue }) => {
        try {
            await api.delete(`/projects/${projectId}`);
            return projectId;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete project');
        }
    }
);

const projectSlice = createSlice({
    name: 'projects',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearCurrentProject: (state) => {
            state.currentProject = null;
            state.currentProjectStats = null;
            state.teamStats = [];
        },
    },
    extraReducers: (builder) => {
        // Create Project
        builder
            .addCase(createProject.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(createProject.fulfilled, (state, action: PayloadAction<Project>) => {
                state.isLoading = false;
                state.projects.push(action.payload);
            })
            .addCase(createProject.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Get All Projects
        builder
            .addCase(getProjects.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getProjects.fulfilled, (state, action: PayloadAction<Project[]>) => {
                state.isLoading = false;
                state.projects = action.payload;
            })
            .addCase(getProjects.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Get Single Project
        builder
            .addCase(getProject.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getProject.fulfilled, (state, action: PayloadAction<Project>) => {
                state.isLoading = false;
                state.currentProject = action.payload;
            })
            .addCase(getProject.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Get Project Stats
        builder
            .addCase(getProjectStats.fulfilled, (state, action: PayloadAction<ProjectStats>) => {
                state.currentProjectStats = action.payload;
            });

        // Get Team Stats
        builder
            .addCase(getTeamStats.fulfilled, (state, action: PayloadAction<TeamStats[]>) => {
                state.teamStats = action.payload;
            });

        // Update Project
        builder
            .addCase(updateProject.fulfilled, (state, action: PayloadAction<Project>) => {
                const index = state.projects.findIndex((p) => p.id === action.payload.id);
                if (index !== -1) {
                    state.projects[index] = action.payload;
                }
                if (state.currentProject?.id === action.payload.id) {
                    state.currentProject = action.payload;
                }
            });

        // Add Member
        builder
            .addCase(addMember.fulfilled, (state, action: PayloadAction<ProjectMember>) => {
                if (state.currentProject) {
                    if (!state.currentProject.members) {
                        state.currentProject.members = [];
                    }
                    state.currentProject.members.push(action.payload);
                }
            });

        // Remove Member
        builder
            .addCase(removeMember.fulfilled, (state, action: PayloadAction<{ projectId: string; memberId: string }>) => {
                if (state.currentProject?.id === action.payload.projectId) {
                    state.currentProject.members = state.currentProject.members?.filter(
                        (m) => m.id !== action.payload.memberId
                    );
                }
            });

        // Update Member Role
        builder
            .addCase(updateMemberRole.fulfilled, (state, action: PayloadAction<{ projectId: string; memberId: string; role: ProjectRole }>) => {
                if (state.currentProject?.id === action.payload.projectId) {
                    const member = state.currentProject.members?.find((m) => m.id === action.payload.memberId);
                    if (member) {
                        member.role = action.payload.role;
                    }
                }
            });

        // Delete Project
        builder
            .addCase(deleteProject.fulfilled, (state, action: PayloadAction<string>) => {
                state.projects = state.projects.filter((p) => p.id !== action.payload);
                if (state.currentProject?.id === action.payload) {
                    state.currentProject = null;
                    state.currentProjectStats = null;
                    state.teamStats = [];
                }
            });
    },
});

export const { clearError, clearCurrentProject } = projectSlice.actions;
export default projectSlice.reducer;