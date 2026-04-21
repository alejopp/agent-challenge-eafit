import { useEffect, useMemo, useState } from "react";

const blankBot = {
  name: "",
  slug: "",
  profession: "",
  personaDescription: "",
  personaPhotoUrl: "",
  serviceName: "",
  serviceDescription: "",
  serviceCategory: "",
  prompt: "",
  mcpServers: [],
  ragDocuments: []
};

const steps = [
  { id: "persona", title: "Persona" },
  { id: "service", title: "Service" },
  { id: "prompt", title: "Prompt" },
  { id: "integrations", title: "MCP + RAG" },
  { id: "review", title: "Review" }
];

export function BotEditor({
  mode,
  initialBot,
  platformConfig,
  saving,
  onSave,
  onUploadPersona,
  onUploadDocuments
}) {
  const [activeStep, setActiveStep] = useState("persona");
  const [bot, setBot] = useState(initialBot || blankBot);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setBot(initialBot || blankBot);
  }, [initialBot]);

  const selectedIntegrations = useMemo(
    () => platformConfig.mcpServers.filter((server) => bot.mcpServers.includes(server.id)),
    [bot.mcpServers, platformConfig.mcpServers]
  );

  const updateField = (field, value) => setBot((current) => ({ ...current, [field]: value }));

  const toggleMcp = (serverId) => {
    setBot((current) => ({
      ...current,
      mcpServers: current.mcpServers.includes(serverId)
        ? current.mcpServers.filter((item) => item !== serverId)
        : [...current.mcpServers, serverId]
    }));
  };

  const uploadPersonaPhoto = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const response = await onUploadPersona([file]);
      updateField("personaPhotoUrl", response.files[0].url);
    } finally {
      setUploading(false);
    }
  };

  const uploadRagFiles = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    setUploading(true);
    try {
      const response = await onUploadDocuments(files);
      updateField("ragDocuments", [...bot.ragDocuments, ...response.files]);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onSave(bot);
  };

  return (
    <form className="editor-shell" onSubmit={handleSubmit}>
      <div className="stepper">
        {steps.map((step) => (
          <button
            key={step.id}
            type="button"
            className={activeStep === step.id ? "active" : ""}
            onClick={() => setActiveStep(step.id)}
          >
            {step.title}
          </button>
        ))}
      </div>

      <div className="editor-panel">
        {activeStep === "persona" && (
          <section className="form-grid">
            <label>
              Agent name
              <input value={bot.name} onChange={(event) => updateField("name", event.target.value)} required />
            </label>
            <label>
              URL slug
              <input
                value={bot.slug}
                onChange={(event) => updateField("slug", event.target.value.toLowerCase().replace(/\s+/g, "-"))}
                placeholder="andrea-plumber"
                required
              />
            </label>
            <label>
              Profession
              <input
                value={bot.profession}
                onChange={(event) => updateField("profession", event.target.value)}
                placeholder="Residential plumber"
                required
              />
            </label>
            <label className="file-label">
              Persona photo
              <input type="file" accept="image/*" onChange={uploadPersonaPhoto} />
              <span>{bot.personaPhotoUrl ? "Photo uploaded" : "Upload portrait"}</span>
            </label>
            <label className="full-span">
              Persona description
              <textarea
                rows="5"
                value={bot.personaDescription}
                onChange={(event) => updateField("personaDescription", event.target.value)}
                placeholder="Explain who this person is, how they speak, and what they care about."
                required
              />
            </label>
          </section>
        )}

        {activeStep === "service" && (
          <section className="form-grid">
            <label>
              Service name
              <input
                value={bot.serviceName}
                onChange={(event) => updateField("serviceName", event.target.value)}
                placeholder="Andrea Emergency Plumbing"
                required
              />
            </label>
            <label>
              Category
              <input
                value={bot.serviceCategory}
                onChange={(event) => updateField("serviceCategory", event.target.value)}
                placeholder="Home services"
                required
              />
            </label>
            <label className="full-span">
              Service description
              <textarea
                rows="6"
                value={bot.serviceDescription}
                onChange={(event) => updateField("serviceDescription", event.target.value)}
                placeholder="What does the agent help clients achieve?"
                required
              />
            </label>
          </section>
        )}

        {activeStep === "prompt" && (
          <section className="form-grid">
            <label className="full-span">
              Personality prompt
              <textarea
                rows="12"
                value={bot.prompt}
                onChange={(event) => updateField("prompt", event.target.value)}
                placeholder="Define tone, boundaries, scheduling rules, sales approach, and escalation instructions."
                required
              />
            </label>
          </section>
        )}

        {activeStep === "integrations" && (
          <section className="integration-grid">
            <div>
              <h3>Available MCP services</h3>
              <div className="integration-list">
                {platformConfig.mcpServers.map((server) => (
                  <label key={server.id} className="integration-item">
                    <input
                      type="checkbox"
                      checked={bot.mcpServers.includes(server.id)}
                      onChange={() => toggleMcp(server.id)}
                    />
                    <div>
                      <strong>{server.name}</strong>
                      <p>{server.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h3>Knowledge base (RAG)</h3>
              <label className="file-label">
                <input type="file" multiple onChange={uploadRagFiles} />
                <span>{uploading ? "Uploading..." : "Upload PDFs, docs, or notes"}</span>
              </label>

              <ul className="document-list">
                {bot.ragDocuments.map((document) => (
                  <li key={document.url || document.originalName}>
                    <strong>{document.originalName}</strong>
                    <span>{document.sizeLabel || "Uploaded"}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {activeStep === "review" && (
          <section className="review-grid">
            <article>
              <p className="eyebrow">Persona</p>
              <h3>{bot.name || "Unnamed bot"}</h3>
              <p>{bot.personaDescription || "No persona description yet."}</p>
            </article>
            <article>
              <p className="eyebrow">Service</p>
              <h3>{bot.serviceName || "Service pending"}</h3>
              <p>{bot.serviceDescription || "No service description yet."}</p>
            </article>
            <article>
              <p className="eyebrow">Prompt</p>
              <p>{bot.prompt || "No prompt yet."}</p>
            </article>
            <article>
              <p className="eyebrow">Integrations</p>
              <p>{selectedIntegrations.length ? selectedIntegrations.map((item) => item.name).join(", ") : "None selected"}</p>
              <p>{bot.ragDocuments.length} RAG documents uploaded</p>
            </article>
          </section>
        )}

        <div className="editor-actions">
          <button className="secondary-button" type="button" onClick={() => setActiveStep(steps[Math.max(0, steps.findIndex((step) => step.id === activeStep) - 1)].id)}>
            Back
          </button>
          {activeStep !== "review" ? (
            <button
              className="primary-button"
              type="button"
              onClick={() => setActiveStep(steps[Math.min(steps.length - 1, steps.findIndex((step) => step.id === activeStep) + 1)].id)}
            >
              Continue
            </button>
          ) : (
            <button className="primary-button" type="submit" disabled={saving}>
              {saving ? "Saving..." : mode === "create" ? "Save bot" : "Save changes"}
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
