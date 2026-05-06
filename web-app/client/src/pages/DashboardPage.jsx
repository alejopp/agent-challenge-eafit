import { Link } from 'react-router-dom';

export function DashboardPage({ bots, stats, meta }) {
  return (
    <div className="dashboard-layout">
      <section className="stats-grid">
        <article className="stat-card">
          <span>Total de bots</span>
          <strong>{stats.totalBots}</strong>
        </article>
        <article className="stat-card">
          <span>Publicados</span>
          <strong>{stats.publishedBots}</strong>
        </article>
        <article className="stat-card">
          <span>Borradores</span>
          <strong>{stats.draftBots}</strong>
        </article>
        <article className="stat-card accent">
          <span>Servicios MCP</span>
          <strong>{stats.mcpServices}</strong>
        </article>
      </section>

      <section className="workspace-card">
        <div className="workspace-header">
          <div>
            <h2>Espacio de trabajo</h2>
          </div>
          <Link to="/bots/new" className="text-link">
            Nuevo bot →
          </Link>
        </div>

        {bots.length ? (
          <div className="bot-list">
            {bots.map((bot) => (
              <Link key={bot.id} to={`/bots/${bot.id}`} className="bot-card">
                <div className="bot-topline">
                  <span className={`status-pill ${bot.status}`}>
                    {bot.status === 'published' ? 'publicado' : bot.status === 'draft' ? 'borrador' : bot.status}
                  </span>
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
            <strong>Aún no hay bots</strong>
            <p>Crea tu primer Agente de IA para empezar a construir tu portafolio.</p>
            <Link to="/bots/new" className="primary-link">
              Crear bot
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
