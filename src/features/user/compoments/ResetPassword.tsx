import PasswordForm from "./PasswordForm";
import TokenGuard from "./TokenGuard";

/**
 * パスワード再設定ページコンポーネント。
 * TokenGuardでトークンを検証し、
 * 有効なトークンが取得できた場合のみPasswordFormを表示する。
 *
 * @returns パスワード再設定ページのJSX要素
 */

const ResetPassword = () => {
    return (
        <TokenGuard>
            {(token) => (
                <PasswordForm
                    token={token}
                    title="パスワードを再設定"
                />
            )}
        </TokenGuard>
    );
};
export default ResetPassword;