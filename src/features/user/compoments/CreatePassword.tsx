
import TokenGuard from "./TokenGuard";
import PasswordForm from "./PasswordForm";

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
