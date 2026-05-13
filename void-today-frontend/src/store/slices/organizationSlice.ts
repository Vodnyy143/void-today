import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import api from "../../services/api.ts";

export interface OrgMember {
    id: string;
    userId: string;
    orgId: string;
    role: 'OWNER' | 'ADMIN' | 'MEMBER';
    user: {
        id: string;
        email: string;
        name: string | null;
        avatar: string | null;
    };
}

export interface Department {
    id: string;
    name: string;
    orgId: string;
    _count?: { projects: number };
}

export interface Organization {
    id: string;
    name: string;
    logo: string | null;
    ownerId: string;
    createdAt: string;
    members?: OrgMember[];
    departments?: Department[];
    _count?: { members: number; projects: number };
    myRole?: 'OWNER' | 'ADMIN' | 'MEMBER';
}

interface OrganizationsState {
    organizations: Organization[];
    currentOrg: Organization | null;
    status: 'idle' | 'loading' | 'error';
    error: string | null;
}

const initialState: OrganizationsState = {
    organizations: [],
    currentOrg: null,
    status: 'idle',
    error: null,
};

// ─── Thunks ───────────────────────────────────────────────────────────────────

export const fetchOrganizations = createAsyncThunk(
    'organizations/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const res = await api.get('/organizations');
            return res.data;
        } catch (e: any) {
            return rejectWithValue(e.response?.data?.message ?? 'Ошибка загрузки');
        }
    }
);

export const fetchOrganization = createAsyncThunk(
    'organizations/fetchOne',
    async (orgId: string, { rejectWithValue }) => {
        try {
            const res = await api.get(`/organizations/${orgId}`);
            return res.data;
        } catch (e: any) {
            return rejectWithValue(e.response?.data?.message ?? 'Ошибка загрузки');
        }
    }
);

export const createOrganization = createAsyncThunk(
    'organizations/create',
    async (data: { name: string; logo?: string }, { rejectWithValue }) => {
        try {
            const res = await api.post('/organizations', data);
            return res.data;
        } catch (e: any) {
            return rejectWithValue(e.response?.data?.message ?? 'Ошибка создания');
        }
    }
);

export const updateOrganization = createAsyncThunk(
    'organizations/update',
    async (
        { orgId, data }: { orgId: string; data: { name?: string; logo?: string } },
        { rejectWithValue }
    ) => {
        try {
            const res = await api.patch(`/organizations/${orgId}`, data);
            return res.data;
        } catch (e: any) {
            return rejectWithValue(e.response?.data?.message ?? 'Ошибка обновления');
        }
    }
);

export const deleteOrganization = createAsyncThunk(
    'organizations/delete',
    async (orgId: string, { rejectWithValue }) => {
        try {
            await api.delete(`/organizations/${orgId}`);
            return orgId;
        } catch (e: any) {
            return rejectWithValue(e.response?.data?.message ?? 'Ошибка удаления');
        }
    }
);

export const inviteMember = createAsyncThunk(
    'organizations/inviteMember',
    async (
        { orgId, email, role }: { orgId: string; email: string; role: 'ADMIN' | 'MEMBER' },
        { rejectWithValue }
    ) => {
        try {
            const res = await api.post(`/organizations/${orgId}/members`, { email, role });
            return { orgId, member: res.data };
        } catch (e: any) {
            return rejectWithValue(e.response?.data?.message ?? 'Ошибка приглашения');
        }
    }
);

export const removeMember = createAsyncThunk(
    'organizations/removeMember',
    async (
        { orgId, userId }: { orgId: string; userId: string },
        { rejectWithValue }
    ) => {
        try {
            await api.delete(`/organizations/${orgId}/members/${userId}`);
            return { orgId, userId };
        } catch (e: any) {
            return rejectWithValue(e.response?.data?.message ?? 'Ошибка удаления');
        }
    }
);

export const updateMemberRole = createAsyncThunk(
    'organizations/updateMemberRole',
    async (
        { orgId, userId, role }: { orgId: string; userId: string; role: 'ADMIN' | 'MEMBER' },
        { rejectWithValue }
    ) => {
        try {
            const res = await api.patch(`/organizations/${orgId}/members/${userId}`, { role });
            return { orgId, member: res.data };
        } catch (e: any) {
            return rejectWithValue(e.response?.data?.message ?? 'Ошибка обновления');
        }
    }
);

export const createDepartment = createAsyncThunk(
    'organizations/createDepartment',
    async (
        { orgId, name }: { orgId: string; name: string },
        { rejectWithValue }
    ) => {
        try {
            const res = await api.post(`/organizations/${orgId}/departments`, { name });
            return { orgId, department: res.data };
        } catch (e: any) {
            return rejectWithValue(e.response?.data?.message ?? 'Ошибка создания отдела');
        }
    }
);

export const deleteDepartment = createAsyncThunk(
    'organizations/deleteDepartment',
    async (
        { orgId, departmentId }: { orgId: string; departmentId: string },
        { rejectWithValue }
    ) => {
        try {
            await api.delete(`/organizations/${orgId}/departments/${departmentId}`);
            return { orgId, departmentId };
        } catch (e: any) {
            return rejectWithValue(e.response?.data?.message ?? 'Ошибка удаления отдела');
        }
    }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const organizationsSlice = createSlice({
    name: 'organizations',
    initialState,
    reducers: {
        clearCurrentOrg(state) {
            state.currentOrg = null;
        },
    },
    extraReducers: (builder) => {
        // fetchAll
        builder.addCase(fetchOrganizations.pending, (state) => {
            state.status = 'loading';
        });
        builder.addCase(fetchOrganizations.fulfilled, (state, action) => {
            state.status = 'idle';
            state.organizations = action.payload;
        });
        builder.addCase(fetchOrganizations.rejected, (state, action) => {
            state.status = 'error';
            state.error = action.payload as string;
        });

        // fetchOne
        builder.addCase(fetchOrganization.fulfilled, (state, action) => {
            state.currentOrg = action.payload;
        });

        // create
        builder.addCase(createOrganization.fulfilled, (state, action) => {
            state.organizations.push(action.payload);
        });

        // update
        builder.addCase(updateOrganization.fulfilled, (state, action) => {
            const idx = state.organizations.findIndex(o => o.id === action.payload.id);
            if (idx !== -1) state.organizations[idx] = { ...state.organizations[idx], ...action.payload };
            if (state.currentOrg?.id === action.payload.id) {
                state.currentOrg = { ...state.currentOrg, ...action.payload };
            }
        });

        // delete
        builder.addCase(deleteOrganization.fulfilled, (state, action) => {
            state.organizations = state.organizations.filter(o => o.id !== action.payload);
            if (state.currentOrg?.id === action.payload) state.currentOrg = null;
        });

        // inviteMember
        builder.addCase(inviteMember.fulfilled, (state, action) => {
            if (state.currentOrg?.id === action.payload.orgId && state.currentOrg.members) {
                state.currentOrg.members.push(action.payload.member);
            }
        });

        // removeMember
        builder.addCase(removeMember.fulfilled, (state, action) => {
            if (state.currentOrg?.id === action.payload.orgId && state.currentOrg.members) {
                state.currentOrg.members = state.currentOrg.members.filter(
                    m => m.userId !== action.payload.userId
                );
            }
        });

        builder.addCase(updateMemberRole.fulfilled, (state, action) => {
            if (state.currentOrg?.id === action.payload.orgId && state.currentOrg.members) {
                const idx = state.currentOrg.members.findIndex(
                    m => m.userId === action.payload.member.userId
                );
                if (idx !== -1) state.currentOrg.members[idx] = action.payload.member;
            }
        });

        builder.addCase(createDepartment.fulfilled, (state, action) => {
            if (state.currentOrg?.id === action.payload.orgId) {
                if (!state.currentOrg.departments) state.currentOrg.departments = [];
                state.currentOrg.departments.push(action.payload.department);
            }
        });

        builder.addCase(deleteDepartment.fulfilled, (state, action) => {
            if (state.currentOrg?.id === action.payload.orgId && state.currentOrg.departments) {
                state.currentOrg.departments = state.currentOrg.departments.filter(
                    d => d.id !== action.payload.departmentId
                );
            }
        });
    },
});

export const { clearCurrentOrg } = organizationsSlice.actions;
export default organizationsSlice.reducer;
