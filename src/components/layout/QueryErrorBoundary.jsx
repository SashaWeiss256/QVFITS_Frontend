/* Query Error Boundary */
import { Component } from "react";
import { QueryErrorResetBoundary } from "@tanstack/react-query";

/**
 * Catches server failures (5xx) that queries throw on a first load and
 * anything else a page throws while rendering. "Try again" resets the failed
 * queries; `resetKey` (the pathname) clears the error on navigation.
 */
// A page file that is gone after a new deploy: only a full reload brings the new one.
const STALE = /dynamically imported module|Importing a module script failed|error loading dynamically imported/i;

class Boundary extends Component {
  state = { error: null, key: this.props.resetKey };

  static getDerivedStateFromError(error) {
    return { error };
  }

  static getDerivedStateFromProps(props, state) {
    return props.resetKey !== state.key ? { error: null, key: props.resetKey } : null;
  }

  retry = () => {
    if (STALE.test(String(this.state.error?.message))) return window.location.reload();
    this.props.onReset();
    this.setState({ error: null });
  };

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <section role="alert" className="wrap section center">
        <h2>Something went wrong on our side</h2>
        <p className="lede mx-auto">This part of the page could not load. Try again in a moment.</p>
        {/* Dev only: what actually broke, so a report comes with its cause. */}
        {import.meta.env.DEV && <pre className="mx-auto max-w-2xl whitespace-pre-wrap text-left text-xs text-warn">{String(this.state.error?.stack || this.state.error)}</pre>}
        <button type="button" onClick={this.retry} className="btn btn--primary">Try again</button>
      </section>
    );
  }
}

export default function QueryErrorBoundary({ resetKey, children }) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <Boundary resetKey={resetKey} onReset={reset}>
          {children}
        </Boundary>
      )}
    </QueryErrorResetBoundary>
  );
}
