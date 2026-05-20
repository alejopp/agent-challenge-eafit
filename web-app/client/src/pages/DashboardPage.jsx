import { useState } from 'react';
import { Link } from 'react-router-dom';

export function DashboardPage({ bots, stats }) {
  const [activeFilter, setActiveFilter] = useState('all');

  const toggleFilter = (filter) => setActiveFilter((prev) => (prev === filter ? 'all' : filter));

  const filteredBots = activeFilter === 'all'
    ? bots
    : bots.filter((bot) =>
        activeFilter === 'published' ? bot.status === 'published' : bot.status !== 'published'
      );

  return (
    <div className="dashboard-layout">
      <section className="stats-grid">
        <article
          className={`stat-card clickable ${activeFilter === 'all' ? 'filter-active' : ''}`}
          onClick={() => setActiveFilter('all')}
        >
          <span>Total de bots</span>
          <strong>{stats.totalBots}</strong>
        </article>
        <article
          className={`stat-card clickable ${activeFilter === 'published' ? 'filter-active' : ''}`}
          onClick={() => toggleFilter('published')}
        >
          <span>Publicados</span>
          <strong>{stats.publishedBots}</strong>
        </article>
        <article
          className={`stat-card clickable ${activeFilter === 'draft' ? 'filter-active' : ''}`}
          onClick={() => toggleFilter('draft')}
        >
          <span>Borradores</span>
          <strong>{stats.draftBots}</strong>
        </article>
        <article className="stat-card accent">
          <span>Servicios MCP activos</span>
          <strong>{stats.mcpServices}</strong>
        </article>
      </section>

      <section className="workspace-card">
        <div className="workspace-header">
          <div>
            <h2>Espacio de trabajo</h2>
            {activeFilter !== 'all' && (
              <p className="filter-label">
                Mostrando: <strong>{activeFilter === 'published' ? 'Publicados' : 'Borradores'}</strong> ({filteredBots.length})
              </p>
            )}
          </div>
          <Link to="/bots/new" className="text-link">Nuevo bot →</Link>
        </div>

        {filteredBots.length ? (
          <div className="bot-list">
            {filteredBots.map((bot) => (
              <Link key={bot.id} to={`/bots/${bot.id}`} className="bot-card">
                <div className="bot-card-image">
                  {bot.personaPhotoPath ? (
                    <img src={bot.personaPhotoPath} alt={bot.personaName} />
                  ) : (
                    <div className="bot-card-avatar">
                      {bot.personaName?.charAt(0)?.toUpperCase() ?? '?'}
                    </div>
                  )}
                </div>
                <div className="bot-card-body">
                  <strong className="bot-card-name">{bot.personaName}</strong>
                  <p className="bot-card-desc">{bot.serviceDescription}</p>
                </div>
                <div className="bot-card-footer">
                  <span className={`status-pill ${bot.status}`}>
                    {bot.status === 'published' ? 'publicado' : 'borrador'}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            {activeFilter !== 'all' ? (
              <>
                <strong>No hay bots {activeFilter === 'published' ? 'publicados' : 'borradores'}</strong>
                <p>No tienes bots con este estado aún.</p>
                <button className="primary-link" onClick={() => setActiveFilter('all')}>Ver todos</button>
              </>
            ) : (
              <>
                <strong>Aún no hay bots</strong>
                <p>Crea tu primer Agente de IA para empezar a construir tu portafolio.</p>
                <Link to="/bots/new" className="primary-link">Crear bot</Link>
              </>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
