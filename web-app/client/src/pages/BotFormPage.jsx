import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BotEditor } from "../components/BotEditor";

export function BotFormPage({ api, token, platformConfig, mode }) {
  const navigate = useNavigate();
  const { botId } = useParams();
  const [bot, setBot] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(mode === "edit");
  const [error, setError] = useState("");

  useEffect(() => {
    if (mode !== "edit") return;
    api
      .getBot(token, botId)
      .then((response) => setBot(response.bot))
      .catch((reason) => setError(reason.message))
      .finally(() => setLoading(false));
  }, [api, botId, mode, token]);

  const saveBot = async (payload) => {
    setSaving(true);
    setError("");
    try {
      const response =
        mode === "create" ? await api.createBot(token, payload) : await api.updateBot(token, botId, payload);
      navigate(`/bots/${response.bot.id}`);
    } catch (reason) {
      setError(reason.message);
    } finally {
      setSaving(false);
    }
  };

  const uploadFiles = (files) => api.uploadFiles(token, files);

  if (loading) {
    return <div className="page-shell">Loading bot...</div>;
  }

  return (
    <div className="page-shell">
      <section className="page-header">
        <div>
          <p className="eyebrow">Builder</p>
          <h1>{mode === "create" ? "Create a new persona bot" : "Edit bot configuration"}</h1>
          <p>Work through the guided steps, then save or publish from the detail page.</p>
        </div>
      </section>

      {error ? <p className="form-error">{error}</p> : null}

      <BotEditor
        mode={mode}
        initialBot={bot}
        platformConfig={platformConfig}
        saving={saving}
        onSave={saveBot}
        onUploadPersona={uploadFiles}
        onUploadDocuments={uploadFiles}
      />
    </div>
  );
}
