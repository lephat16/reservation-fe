
import TokenGuard from "./TokenGuard";
import PasswordForm from "./PasswordForm";

/**
 * パスワード作成ページコンポーネント。
 * トークンを検証し、有効な場合にパスワード作成フォームを表示する。
 *
 * @returns パスワード作成ページのJSX要素
 */

const CreatePasswordPage = () => {
  return (
    <TokenGuard>
      {(token) => (
        <PasswordForm
          token={token}
          title="パスワードを作成"
        />
      )}
    </TokenGuard>
  );
};

export default CreatePasswordPage;
