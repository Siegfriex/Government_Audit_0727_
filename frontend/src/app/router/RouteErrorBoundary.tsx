import { Component, type ErrorInfo, type ReactNode } from 'react';

interface RouteErrorBoundaryProps {
  children: ReactNode;
}

interface RouteErrorBoundaryState {
  error: Error | null;
}

export class RouteErrorBoundary extends Component<RouteErrorBoundaryProps, RouteErrorBoundaryState> {
  state: RouteErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): RouteErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Route rendering failed', error, info);
  }

  render(): ReactNode {
    if (this.state.error) {
      return (
        <main id="main-content" className="page-frame py-20" role="alert" tabIndex={-1}>
          <h1 className="type-heading-1 font-serif">화면을 표시하지 못했습니다</h1>
          <p className="mt-4">페이지를 새로고침하거나 메인 스토리로 돌아가 주세요.</p>
          <a className="inline-block mt-6 underline" href="/">메인 스토리로 이동</a>
        </main>
      );
    }
    return this.props.children;
  }
}
