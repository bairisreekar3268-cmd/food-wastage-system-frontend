export function StatCard({ label, value, tone = "" }) {
  return (
    <div className={`stat ${tone}`}>
      <span>{label}</span>
      <b>{value}</b>
    </div>
  );
}

export function LevelBadge({ level }) {
  return <span className={`badge ${level}`}>{level}</span>;
}

export function Loading({ text = "Loading..." }) {
  return (
    <div className="center">
      <div className="spinner" />
      <p>{text}</p>
    </div>
  );
}

export function EmptyState({ title, children }) {
  return (
    <div className="panel center">
      <h3>{title}</h3>
      {children}
    </div>
  );
}

export function ErrorBox({ message, onRetry }) {
  return (
    <div className="panel error-box" role="alert">
      <p>{message}</p>
      {onRetry && <button className="btn" onClick={onRetry}>Try again</button>}
    </div>
  );
}
