import { Link } from "react-router-dom";

export function BotCard({ bot, onPublish, onUnpublish, onDelete, busyAction }) {
  const isBusy = busyAction === bot.id;

  return (
    <article className="bot-card">
      <div className="bot-card-header">
        <div>
          <p className="eyebrow">{bot.serviceCategory || "Service Agent"}</p>
          <h3>{bot.name}</h3>
        </div>
        <span className={`status-pill status-${bot.status}`}>{bot.status}</span>
      </div>

      <p className="card-copy">{bot.serviceDescription || "No description provided yet."}</p>

      <dl className="bot-meta">
        <div>
          <dt>Persona</dt>
          <dd>{bot.profession || "Not defined"}</dd>
        </div>
        <div>
          <dt>MCP</dt>
          <dd>{bot.mcpServers.length ? bot.mcpServers.join(", ") : "None selected"}</dd>
        </div>
        <div>
          <dt>RAG files</dt>
          <dd>{bot.ragDocuments.length}</dd>
        </div>
        <div>
          <dt>Public URL</dt>
          <dd>{bot.publicUrl ? "Ready" : "Draft"}</dd>
        </div>
      </dl>

      <div className="card-actions">
        <Link className="ghost-button" to={`/bots/${bot.id}`}>
          Open
        </Link>
        <Link className="ghost-button" to={`/bots/${bot.id}/edit`}>
          Edit
        </Link>
        {bot.status === "published" ? (
          <button className="secondary-button" onClick={() => onUnpublish(bot.id)} disabled={isBusy}>
            {isBusy ? "Working..." : "Unpublish"}
          </button>
        ) : (
          <button className="primary-button" onClick={() => onPublish(bot.id)} disabled={isBusy}>
            {isBusy ? "Working..." : "Publish"}
          </button>
        )}
        <button className="danger-button" onClick={() => onDelete(bot.id)} disabled={isBusy}>
          Delete
        </button>
      </div>
    </article>
  );
}
