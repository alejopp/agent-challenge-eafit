import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BotForm } from '../components/BotForm';

export function BotEditPage({ botId, mcpServices, loadBot, onSave, onPublish, onUnpublish }) {
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
        <BotForm
          initialValue={bot}
          mcpServices={mcpServices}
          onSubmit={handleSave}
          submitting={busy}
          onComplete={handleComplete}
        />
      </div>

      <aside className="detail-sidebar">
        <div className="detail-card">
          <div className="sidebar-profile-header">
            {bot.personaPhotoPath ? (
              <img src={bot.personaPhotoPath} alt={bot.personaName} className="sidebar-avatar" />
            ) : (
              <div className="sidebar-avatar-placeholder">
                {bot.personaName?.charAt(0)?.toUpperCase() ?? '?'}
              </div>
            )}
            <div className="sidebar-profile-info">
              <span className={`status-pill ${bot.status}`}>
                {bot.status === 'published' ? 'publicado' : 'borrador'}
              </span>
              <h2>{bot.personaName}</h2>
            </div>
          </div>
          {bot.serviceDescription && (
            <p className="sidebar-profile-desc">{bot.serviceDescription}</p>
          )}
          {bot.publicUrl && bot.status === 'published' && (
            <a href={bot.publicUrl} target="_blank" rel="noreferrer" className="text-link">
              Ver URL pública →
            </a>
          )}
        </div>

        <div className="detail-card">
          <h3>Despliegue</h3>
          <p>{bot.deploymentNotes || 'Este bot aún no ha sido publicado.'}</p>
          <div className="stacked-actions">
            <button className="deploy-button" onClick={handlePublish} disabled={busy}>
              Publicar en Kubernetes
            </button>
            <button className="deploy-button" onClick={handleUnpublish} disabled={busy}>
              Despublicar
            </button>
          </div>
        </div>

        {bot.mcpServices?.length > 0 && (
          <div className="detail-card">
            <h3>Servicios MCP</h3>
            <div className="rag-list">
              {bot.mcpServices.map((serviceId) => {
                const svc = mcpServices?.find((s) => s.id === serviceId);
                return (
                  <div key={serviceId} className="rag-chip">
                    {svc?.name || serviceId}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
