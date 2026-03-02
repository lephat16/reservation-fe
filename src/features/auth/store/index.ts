
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";

/**
 * Redux Store 設定
 *
 * 認証情報を管理する auth slice を登録して、アプリ全体で利用できる Redux store を作成する。
 */

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