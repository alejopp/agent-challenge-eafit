import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BotForm } from '../components/BotForm';

export function BotDetailPage({ botId, mcpServices, loadBot, onSave, onPublish, onUnpublish }) {
  const navigate = useNavigate();
  const [bot, setBot] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadBot(botId)
      .then(setBot)
      .catch((loadError) => setError(loadError.message));
  }, [botId, loadBot]);

  if (error) {
    return <div className="error-banner">{error}</div>;
  }

  if (!bot) {
    return <div className="loading-card">Loading bot...</div>;
  }

  const handleSave = async (formData) => {
    setBusy(true);
    try {
      const updatedBot = await onSave(botId, formData);
      setBot(updatedBot);
    } finally {
      setBusy(false);
    }
  };

  const handleComplete = () => {
    navigate('/');
  };

  const handlePublish = async () => {
    setBusy(true);
    try {
      const updatedBot = await onPublish(botId);
      setBot(updatedBot);
    } finally {
      setBusy(false);
    }
  };

  const handleUnpublish = async () => {
    setBusy(true);
    try {
      const updatedBot = await onUnpublish(botId);
      setBot(updatedBot);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="detail-layout">
      <div className="detail-main">
        <BotForm initialValue={bot} mcpServices={mcpServices} onSubmit={handleSave} submitting={busy} onComplete={handleComplete} />
      </div>

      <aside className="detail-sidebar">
        <div className="detail-card">
          <span className={`status-pill ${bot.status}`}>{bot.status}</span>
          <h2>{bot.personaName}</h2>
          <p>{bot.serviceDescription}</p>
          <a href={bot.publicUrl} target="_blank" rel="noreferrer" className="text-link">
            Open public URL
          </a>
        </div>

        <div className="detail-card">
          <h3>Deployment</h3>
          <p>{bot.deploymentNotes || 'This bot has not been published yet.'}</p>
          <div className="stacked-actions">
            <button className="deploy-button" onClick={handlePublish} disabled={busy}>
              Publish to Kubernetes
            </button>
            <button className="deploy-button" onClick={handleUnpublish} disabled={busy}>
              Unpublish
            </button>
          </div>
        </div>

        <div className="detail-card">
          <h3>MCP services</h3>
          <div className="rag-list">
            {bot.mcpServices.map((service) => (
              <div key={service} className="rag-chip">
                {service}
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
