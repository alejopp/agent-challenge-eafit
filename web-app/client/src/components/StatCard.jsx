export function StatCard({ label, value, accent }) {
  return (
    <article className={`stat-card stat-${accent}`}>
      <p className="stat-label">{label}</p>
      <strong className="stat-value">{value}</strong>
    </article>
  );
}
