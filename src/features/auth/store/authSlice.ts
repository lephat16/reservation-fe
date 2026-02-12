
import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Role } from '../types/auth';

type AuthState = {
    accessToken: string | null;
    role: Role | null;
};

const initialState: AuthState = {
    accessToken: null,
    role: null,
}

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setToken: (state, action: PayloadAction<string | null>) => {
            state.accessToken = action.payload;
        },
        setRole: (state, action: PayloadAction<Role | null>) => {
            state.role = action.payload;
        },
        logout: (state) => {
            state.accessToken = null;
            state.role = null;
        }
    }
});

export const { setToken, setRole, logout } = authSlice.actions;
export default authSlice.reducer;