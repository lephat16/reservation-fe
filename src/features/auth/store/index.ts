
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";

// Redux store を作成
export const store = configureStore({
    reducer: {
        auth: authReducer, // auth slice を登録
    }
});
// RootState の型定義（store 全体の state 型）
export type RootState = ReturnType<typeof store.getState>;
// AppDispatch の型定義（dispatch 関数の型）
export type AppDispatch = typeof store.dispatch;