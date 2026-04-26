import { Link } from 'react-router-dom';

export function DashboardPage({ bots, stats, meta }) {
  return (
    <div className="dashboard-layout">
      <section className="stats-grid">
        <article className="stat-card">
          <span>Total bots</span>
          <strong>{stats.totalBots}</strong>
        </article>
        <article className="stat-card">
          <span>Published</span>
          <strong>{stats.publishedBots}</strong>
        </article>
        <article className="stat-card">
          <span>Drafts</span>
          <strong>{stats.draftBots}</strong>
        </article>
        <article className="stat-card accent">
          <span>MCP services</span>
          <strong>{stats.mcpServices}</strong>
        </article>
      </section>

      <section className="workspace-card">
        <div className="workspace-header">
          <div>
            <h2>Bot workspace</h2>
            <p>
              Namespace: <code>{meta.namespace}</code> · Domain suffix: <code>{meta.baseDomain}</code>
            </p>
          </div>
          <Link to="/bots/new" className="text-link">
            New bot →
          </Link>
        </div>

        {bots.length ? (
          <div className="bot-list">
            {bots.map((bot) => (
              <Link key={bot.id} to={`/bots/${bot.id}`} className="bot-card">
                <div className="bot-topline">
                  <span className={`status-pill ${bot.status}`}>{bot.status}</span>
                  <span>{bot.mcpServices.length} MCP</span>
                </div>
                <strong>{bot.personaName}</strong>
                <p>{bot.serviceDescription}</p>
                <small>{bot.publicUrl}</small>
              </Link>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <strong>No bots yet</strong>
            <p>Create your first Persona AI Agent to start building your portfolio.</p>
            <Link to="/bots/new" className="primary-link">
              Create bot
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
