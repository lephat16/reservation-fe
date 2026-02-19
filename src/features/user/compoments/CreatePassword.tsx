import { useState } from "react";
import { useLocation } from "react-router-dom";
import { userAPI } from "../api/userAPI";

const CreatePasswordPage = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const location = useLocation();

  const token = new URLSearchParams(location.search).get("token");

  const handleSubmit = async () => {
    if (password !== confirmPassword) {
      alert("パスワードが一致しません");
      return;
    }
    if (!token) return alert("Tokenが無効です");

    try {
      await userAPI.setPasswordByToken({ token, password });
      alert("パスワード設定完了");
    } catch (err) {
      console.error(err);
      alert("エラーが発生しました");
    }
  };

  return (
    <div>
      <h1>パスワードを作成</h1>
      <input type="password" placeholder="パスワード" value={password} onChange={e => setPassword(e.target.value)} />
      <input type="password" placeholder="確認用パスワード" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
      <button onClick={handleSubmit}>保存</button>
    </div>
  );
};

export default CreatePasswordPage;
