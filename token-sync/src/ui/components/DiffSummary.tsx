import type { DiffResult } from "../../shared/types";

export default function DiffSummary({ counts }: { counts: DiffResult["counts"] }) {
  return (
    <div className="diff-summary">
      <Pill count={counts.modified} label="Modified" className="pill-modified" />
      <Pill count={counts.added} label="Added" className="pill-added" />
      <Pill count={counts.removed} label="Removed" className="pill-removed" />
      <Pill count={counts.unchanged} label="Unchanged" className="pill-unchanged" />
    </div>
  );
}

function Pill({
  count,
  label,
  className,
}: {
  count: number;
  label: string;
  className: string;
}) {
  return (
    <span className={`pill ${className}`}>
      <strong>{count}</strong> {label}
    </span>
  );
}
