
import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { UserData } from '../../user/types/user';

// 認証情報の状態を定義
type AuthState = {
    user: UserData | null;
};

// 初期状態
const initialState: AuthState = {
    user: null,
}

// 認証用 slice を作成
const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {

        // ユーザー情報をセット
        setUser: (state, action: PayloadAction<UserData | null>) => {
            state.user = action.payload;
        },
        // ログアウト処理（トークンとユーザー情報をクリア）
        logout: (state) => {
            state.user = null;
        }
    }
});

export const { setUser, logout } = authSlice.actions;
export default authSlice.reducer;