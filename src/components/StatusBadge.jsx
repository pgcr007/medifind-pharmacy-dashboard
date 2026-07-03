const STYLES = {
  pending: "bg-amber-light/40 text-amber border-amber/40",
  confirmed: "bg-sage-light text-sage border-sage/40",
  rejected: "bg-rust-light text-rust border-rust/40",
  cancelled: "bg-paper-dim text-ink-soft border-hairline",
};

export default function StatusBadge({ status }) {
  const style = STYLES[status] || STYLES.cancelled;
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border capitalize ${style}`}
    >
      {status}
    </span>
  );
}
