import PasswordForm from "./PasswordForm";
import TokenGuard from "./TokenGuard";

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