import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BotForm } from '../components/BotForm';
import { PublishingOverlay } from '../components/PublishingOverlay';

export function BotDetailPage({ botId, loadBot, onSave, onDelete, onPublish, onUnpublish }) {
  const navigate = useNavigate();
  const [bot, setBot] = useState(null);
  const [busy, setBusy] = useState(false);
  const [busyAction, setBusyAction] = useState(''); // 'saving', 'publishing', 'unpublishing'
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    loadBot(botId)
      .then(setBot)
      .catch((loadError) => setError(loadError.message));
  }, [botId, loadBot]);

  if (error) {
    return <div className="error-banner">{error}</div>;
  }

  if (!bot) {
    return <div className="loading-card">Cargando bot...</div>;
  }

  const handleSave = async (formData) => {
    setBusy(true);
    setBusyAction('saving');
    try {
      const updatedBot = await onSave(botId, formData);
      setBot(updatedBot);
    } finally {
      setBusy(false);
      setBusyAction('');
    }
  };

  const handleComplete = () => {
    navigate('/');
  };

  const handlePublish = async () => {
    setBusy(true);
    setBusyAction('publishing');
    setError('');
    try {
      const updated = await onPublish(botId);
      setBot(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
      setBusyAction('');
    }
  };

  const handleUnpublish = async () => {
    setBusy(true);
    setBusyAction('unpublishing');
    setError('');
    try {
      const updated = await onUnpublish(botId);
      setBot(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
      setBusyAction('');
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setBusy(true);
    try {
      await onDelete(botId);
      navigate('/');
    } catch (err) {
      setError(err.message);
      setBusy(false);
      setConfirmDelete(false);
    }
  };

  return (
    <div className="bot-summary-page">
      <div className="bot-summary-header">
        <div className="bot-summary-title">
          <span className={`status-pill ${bot.status}`}>
            {bot.status === 'published' ? 'publicado' : bot.status === 'draft' ? 'borrador' : bot.status}
          </span>
          <h1>{bot.personaName}</h1>
          <p className="bot-summary-profession">{bot.profession}</p>
        </div>
        <div className="bot-summary-avatar">
          {bot.personaPhotoPath ? (
            <img src={bot.personaPhotoPath} alt={bot.personaName} className="bot-summary-photo" />
          ) : (
            <div className="bot-summary-avatar-placeholder">
              {bot.personaName?.slice(0, 2).toUpperCase()}
            </div>
          )}
        </div>
      </div>

      <div className="bot-summary-grid">
        <div className="bot-summary-card">
          <h3>Persona</h3>
          <div className="bot-summary-field">
            <span className="field-label">Nombre</span>
            <span className="field-value">{bot.personaName}</span>
          </div>
          <div className="bot-summary-field">
            <span className="field-label">Profesión</span>
            <span className="field-value">{bot.profession}</span>
          </div>
          <div className="bot-summary-field">
            <span className="field-label">Descripción</span>
            <span className="field-value">{bot.personaDescription}</span>
          </div>
        </div>

        <div className="bot-summary-card">
          <h3>Servicio</h3>
          <div className="bot-summary-field">
            <span className="field-label">Nombre</span>
            <span className="field-value">{bot.serviceName}</span>
          </div>
          <div className="bot-summary-field">
            <span className="field-label">Categoría</span>
            <span className="field-value">{bot.serviceCategory}</span>
          </div>
          <div className="bot-summary-field">
            <span className="field-label">Descripción</span>
            <span className="field-value">{bot.serviceDescription}</span>
          </div>
        </div>

        <div className="bot-summary-card">
          <h3>Instrucciones (System Prompt)</h3>
          <pre className="bot-summary-prompt">{bot.prompt}</pre>
        </div>

        <div className="bot-summary-card">
          <h3>Servicios MCP</h3>
          <div className="rag-list">
            {bot.mcpServices.map((service) => (
              <div key={service} className="rag-chip">{service}</div>
            ))}
          </div>
        </div>

        {bot.ragFiles?.length > 0 && (
          <div className="bot-summary-card">
            <h3>Documentos RAG</h3>
            <div className="rag-list">
              {bot.ragFiles.map((file) => (
                <div key={file.path} className="rag-chip">{file.originalName}</div>
              ))}
            </div>
          </div>
        )}

        {bot.publicUrl && (
          <div className="bot-summary-card">
            <h3>URL Pública</h3>
            <a href={bot.publicUrl} target="_blank" rel="noreferrer" className="text-link">
              {bot.publicUrl}
            </a>
          </div>
        )}

        <div className="bot-summary-card deployment-card">
          <h3>Despliegue</h3>
          {bot.deploymentNotes && (
            <p className="deployment-notes">{bot.deploymentNotes}</p>
          )}

          {busy && (busyAction === 'publishing' || busyAction === 'unpublishing') ? (
            <PublishingOverlay
              message={busyAction === 'publishing' ? "Publicando en Kubernetes..." : "Despublicando bot..."}
            />
          ) : (
            <div className="stacked-actions">
              <button
                className="deploy-button"
                onClick={handlePublish}
                disabled={busy}
              >
                Publicar en Kubernetes
              </button>
              <button
                className="deploy-button"
                onClick={handleUnpublish}
                disabled={busy}
              >
                Despublicar
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="bot-summary-actions">
        <button
          className="primary-button"
          onClick={() => navigate(`/bots/${botId}/edit`)}
          disabled={busy}
        >
          ✏️ Editar bot
        </button>
        <button
          className={`delete-button ${confirmDelete ? 'confirm' : ''}`}
          onClick={handleDelete}
          disabled={busy}
        >
          {confirmDelete ? '⚠️ Confirmar borrado' : '🗑️ Borrar bot'}
        </button>
        {confirmDelete && (
          <button
            className="secondary-button"
            onClick={() => setConfirmDelete(false)}
            disabled={busy}
          >
            Cancelar
          </button>
        )}
      </div>
    </div>
  );
}
