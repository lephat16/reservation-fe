import React, { Component, type ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
    state: State = { hasError: false };

    // エラーが発生した場合、stateを更新してfallback UIをレンダリングする
    static getDerivedStateFromError(error: Error): State {
        return { hasError: true };
    }

    // エラー情報をconsoleにログとして記録する（またはサーバーにエラー情報を送信することも可能）
    componentDidCatch(error: Error, info: React.ErrorInfo) {
        console.error("ErrorBoundaryがエラーをキャッチしました:", error, info);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ textAlign: 'center', marginTop: '50px' }}>
                    <h2>エラーが発生しました。後で再試行してください。</h2>
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            padding: '10px 20px',
                            fontSize: '16px',
                            cursor: 'pointer',
                            marginTop: '20px',
                            backgroundColor: '#721c24',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '5px',
                        }}
                    >
                        ページを再読み込み
                    </button>
                </div>
            );
        }

        return this.props.children; // エラーがない場合は、子コンポーネントをそのままレンダリング
    }
}

export default ErrorBoundary;
