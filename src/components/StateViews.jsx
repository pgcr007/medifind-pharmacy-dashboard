import { AlertCircle, RotateCw } from "lucide-react";

export function ErrorState({ message, onRetry }) {
  return (
    <div className="ledger-card p-8 text-center">
      <AlertCircle className="mx-auto mb-2 text-rust" size={22} />
      <p className="text-sm text-ink mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 rounded border border-hairline text-sm font-medium text-ink px-3.5 py-1.5 hover:bg-paper-dim transition-colors"
        >
          <RotateCw size={14} /> Try again
        </button>
      )}
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }) {
  return (
    <div className="ledger-card overflow-hidden">
      <table className="w-full text-sm">
        <tbody>
          {Array.from({ length: rows }).map((_, r) => (
            <tr key={r} className="border-b border-hairline last:border-0">
              {Array.from({ length: cols }).map((_, c) => (
                <td key={c} className="px-5 py-4">
                  <div className="h-3.5 rounded bg-paper-dim animate-pulse" style={{ width: `${50 + ((r + c) % 3) * 15}%` }} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}