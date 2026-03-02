
import { useSelector } from "react-redux";
import type { RootState } from '../store';

/**
 * ユーザーの役割（role）に基づくフラグを提供するカスタムフック
 *
 * Reduxの認証状態から現在のユーザーのroleを取得し、
 * それに応じたフラグを返す。
 *
 * @returns Object - ユーザーの役割情報とフラグ
 * @property role - 現在のユーザーのrole（ADMIN / STAFF / WAREHOUSE / undefined）
 * @property isAdmin - ユーザーが管理者（ADMIN）の場合true
 * @property isStaff - ユーザーがスタッフ（STAFF）の場合true
 * @property isWarehouse - ユーザーが倉庫担当（WAREHOUSE）の場合true
 */

const useRoleFlags = () => {
    const role = useSelector((state: RootState) => state.auth.user?.role);
    return {
        role,
        isAdmin: role === "ADMIN",
        isStaff: role === "STAFF",
        isWarehouse: role === "WAREHOUSE",
    };
}

export default useRoleFlags;