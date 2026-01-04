import { useState } from "react";
import type { AlertColor } from "@mui/material"; // MUIのアラートカラー型

// スナックバーの状態の型定義
interface SnackbarState {
  open: boolean; // スナックバーが開いているかどうか
  message: string; // 表示するメッセージ
  severity: AlertColor; // 表示の種類（"error", "success", "info", "warning"）
}

// カスタムフック: スナックバー管理
export const useSnackbar = (defaultSeverity: AlertColor = "info") => {
  
  // スナックバーの状態をuseStateで管理
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false, // 初期状態は閉じている
    message: "", // 初期メッセージは空
    severity: defaultSeverity, // 初期の表示種類
  });

  // スナックバーを表示する関数
  const showSnackbar = (message: string, severity: AlertColor = defaultSeverity) => {
    // openをtrueにして状態更新
    setSnackbar({ open: true, message, severity });
  };

  // スナックバーを閉じる関数
  const closeSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // フックが返すオブジェクト
  return { snackbar, showSnackbar, closeSnackbar };
};
