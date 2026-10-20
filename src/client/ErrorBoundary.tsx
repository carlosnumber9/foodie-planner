import { Component, type ReactNode } from "react";

interface ErrorBoundaryState {
  failed: boolean;
}
export class ErrorBoundary extends Component<
  { children: ReactNode },
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { failed: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { failed: true };
  }

  render() {
    if (this.state.failed) {
      return (
        <main className="main-content">
          <section className="page-card" role="alert">
            <h1>Algo ha ido mal</h1>
            <p>
              No se ha podido mostrar esta pantalla. Recarga la página para
              volver a intentarlo.
            </p>
          </section>
        </main>
      );
    }
    return this.props.children;
  }
}
