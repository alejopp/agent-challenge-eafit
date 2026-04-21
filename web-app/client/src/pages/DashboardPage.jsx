import { Link } from "react-router-dom";
import { BotCard } from "../components/BotCard";
import { StatCard } from "../components/StatCard";

export function DashboardPage({ dashboard, onPublish, onUnpublish, onDelete, busyAction }) {
  const { summary, bots } = dashboard;

  return (
    <div className="page-shell">
      <section className="page-header">
        <div>
          <p className="eyebrow">Operations hub</p>
          <h1>My AI Bots</h1>
          <p>Manage drafts, publish to Kubernetes, and open Hologram-ready agent URLs from one place.</p>
        </div>
      </section>

      <section className="stats-grid">
        <StatCard label="Total bots" value={summary.totalBots} accent="amber" />
        <StatCard label="Published" value={summary.publishedBots} accent="mint" />
        <StatCard label="Drafts" value={summary.draftBots} accent="sky" />
        <StatCard label="MCP services in use" value={summary.totalSelectedMcp} accent="rose" />
      </section>

      <section className="action-bar">
        <h2 className="section-title">Bot workspace</h2>
        <Link className="btn-new" to="/bots/new">
          <span className="plus">+</span>
          Create bot
        </Link>
      </section>

      <section className="card-grid">
        {bots.length ? (
          bots.map((bot) => (
            <BotCard
              key={bot.id}
              bot={bot}
              onPublish={onPublish}
              onUnpublish={onUnpublish}
              onDelete={onDelete}
              busyAction={busyAction}
            />
          ))
        ) : (
          <article className="empty-state">
            <div className="empty-icon">◫</div>
            <h3>No bots yet</h3>
            <p>Create your first Persona AI Agent to start building your portfolio.</p>
            <Link className="btn-start" to="/bots/new">
              Start now
            </Link>
          </article>
        )}
      </section>
    </div>
  );
}
