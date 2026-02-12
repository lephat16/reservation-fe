
import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type {  UserData } from '../types/auth';

type AuthState = {
    accessToken: string | null;
    user: UserData | null;
};

const initialState: AuthState = {
    accessToken: null,
    user: null,
}

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setToken: (state, action: PayloadAction<string | null>) => {
            state.accessToken = action.payload;
        },
        
        setUser: (state, action: PayloadAction<UserData | null>) => {
            state.user = action.payload;
        },
        logout: (state) => {
            state.accessToken = null;
            state.user = null;
        }
    }
});

export const { setToken, setUser, logout } = authSlice.actions;
export default authSlice.reducer;