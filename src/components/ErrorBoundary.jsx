import { Component } from "react";
import { AlertTriangle } from "lucide-react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // Kept as console output for now — swap for a real logging service later.
    console.error("Dashboard crashed:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-paper px-6">
          <div className="ledger-card p-8 max-w-sm text-center">
            <AlertTriangle className="mx-auto mb-3 text-rust" size={28} />
            <p className="font-display text-lg text-ink mb-1">
              Something went wrong
            </p>
            <p className="text-sm text-ink-soft mb-5">
              This page hit an unexpected error. Reloading usually fixes it.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="rounded bg-bottle text-paper text-sm font-medium px-4 py-2 hover:bg-bottle-dark transition-colors"
            >
              Reload page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}