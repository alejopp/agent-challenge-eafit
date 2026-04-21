import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

export function BotDetailPage({ api, token, platformConfig }) {
  const { botId } = useParams();
  const [bot, setBot] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const loadBot = () =>
    api
      .getBot(token, botId)
      .then((response) => setBot(response.bot))
      .catch((reason) => setError(reason.message));

  useEffect(() => {
    loadBot();
  }, [botId]);

  const togglePublish = async () => {
    setBusy(true);
    setError("");
    try {
      if (bot.status === "published") {
        await api.unpublishBot(token, botId);
      } else {
        await api.publishBot(token, botId);
      }
      await loadBot();
    } catch (reason) {
      setError(reason.message);
    } finally {
      setBusy(false);
    }
  };

  if (!bot) {
    return <div className="page-shell">Loading bot details...</div>;
  }

  const selectedIntegrations = platformConfig.mcpServers.filter((server) => bot.mcpServers.includes(server.id));

  return (
    <div className="page-shell">
      <section className="page-header split">
        <div>
          <p className="eyebrow">Bot detail</p>
          <h1>{bot.name}</h1>
          <p>{bot.serviceDescription}</p>
        </div>
        <div className="inline-actions">
          <Link className="ghost-button" to={`/bots/${bot.id}/edit`}>
            Edit
          </Link>
          <button className="primary-button" onClick={togglePublish} disabled={busy}>
            {busy ? "Working..." : bot.status === "published" ? "Unpublish" : "Publish"}
          </button>
          {bot.publicUrl ? (
            <a className="secondary-button" href={bot.publicUrl} target="_blank" rel="noreferrer">
              Open URL
            </a>
          ) : null}
        </div>
      </section>

      {error ? <p className="form-error">{error}</p> : null}

      <section className="detail-grid">
        <article className="detail-card">
          <p className="eyebrow">Persona</p>
          <h3>{bot.profession}</h3>
          <p>{bot.personaDescription}</p>
          {bot.personaPhotoUrl ? <img className="detail-photo" src={bot.personaPhotoUrl} alt={bot.name} /> : null}
        </article>

        <article className="detail-card">
          <p className="eyebrow">Service</p>
          <h3>{bot.serviceName}</h3>
          <p>{bot.serviceCategory}</p>
          <p>{bot.prompt}</p>
        </article>

        <article className="detail-card">
          <p className="eyebrow">MCP Servers</p>
          <ul className="detail-list">
            {selectedIntegrations.map((integration) => (
              <li key={integration.id}>
                <strong>{integration.name}</strong>
                <span>{integration.description}</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="detail-card">
          <p className="eyebrow">RAG Documents</p>
          <ul className="detail-list">
            {bot.ragDocuments.map((document) => (
              <li key={document.url}>
                <strong>{document.originalName}</strong>
                <span>{document.url}</span>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="detail-card">
        <p className="eyebrow">Deployment summary</p>
        <p>Status: {bot.status}</p>
        <p>Public URL: {bot.publicUrl || "Will be generated on publish"}</p>
        <p>
          Generated bundle:{" "}
          {bot.generatedBundlePath ? (
            <code>{bot.generatedBundlePath}</code>
          ) : (
            "No deployment files generated yet."
          )}
        </p>
      </section>
    </div>
  );
}
