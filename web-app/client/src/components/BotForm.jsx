import { useMemo, useState } from 'react';

const categories = ['Professional Services', 'Healthcare', 'Education', 'Creative', 'Home Services'];

const steps = [
  { id: 'persona', label: 'Persona', number: 1 },
  { id: 'service', label: 'Service', number: 2 },
  { id: 'prompt', label: 'Prompt', number: 3 },
  { id: 'mcp', label: 'MCP Services', number: 4 },
  { id: 'rag', label: 'RAG', number: 5 }
];

export function buildBotFormData(formState) {
  const formData = new FormData();
  Object.entries(formState).forEach(([key, value]) => {
    if (key === 'mcpServices') {
      formData.append(key, JSON.stringify(value));
      return;
    }

    if (key === 'personaPhotoFile' && value) {
      formData.append('personaPhoto', value);
      return;
    }

    if (key === 'ragFileList') {
      value.forEach((file) => formData.append('ragFiles', file));
      return;
    }

    if (!['personaPhotoPreview', 'personaPhotoFile'].includes(key) && key !== 'ragFileList') {
      formData.append(key, value ?? '');
    }
  });
  return formData;
}

export function BotForm({ initialValue, mcpServices, onSubmit, submitting, onComplete }) {
  const [formState, setFormState] = useState(() => ({
    personaName: initialValue?.personaName || '',
    profession: initialValue?.profession || '',
    personaDescription: initialValue?.personaDescription || '',
    serviceName: initialValue?.serviceName || '',
    serviceDescription: initialValue?.serviceDescription || '',
    serviceCategory: initialValue?.serviceCategory || categories[0],
    prompt: initialValue?.prompt || '',
    mcpServices: initialValue?.mcpServices || ['weather', 'wikipedia'],
    status: initialValue?.status || 'draft',
    personaPhotoPreview: initialValue?.personaPhotoPath || '',
    personaPhotoFile: null,
    ragFileList: []
  }));

  const selectedCount = useMemo(() => formState.mcpServices.length, [formState.mcpServices]);

  const toggleService = (serviceId) => {
    setFormState((current) => ({
      ...current,
      mcpServices: current.mcpServices.includes(serviceId)
        ? current.mcpServices.filter((item) => item !== serviceId)
        : [...current.mcpServices, serviceId]
    }));
  };

  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onSubmit(buildBotFormData(formState));
    if (onComplete) {
      onComplete();
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <section className="form-section">
            <div className="section-title">
              <h2>Persona data</h2>
              <p>Define the identity that users will meet on Hologram.</p>
            </div>

            <div className="grid two-columns">
              <label>
                <span>Name</span>
                <input
                  value={formState.personaName}
                  onChange={(event) => setFormState((prev) => ({ ...prev, personaName: event.target.value }))}
                  placeholder="Laura Plomeria"
                  required
                />
              </label>

              <label>
                <span>Profession</span>
                <input
                  value={formState.profession}
                  onChange={(event) => setFormState((prev) => ({ ...prev, profession: event.target.value }))}
                  placeholder="Residential plumber"
                  required
                />
              </label>
            </div>

            <label>
              <span>Description</span>
              <textarea
                value={formState.personaDescription}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, personaDescription: event.target.value }))
                }
                placeholder="Friendly, precise, and practical."
                rows={4}
                required
              />
            </label>

            <label className="file-field">
              <span>Persona photo</span>
              <input
                type="file"
                accept="image/*"
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, personaPhotoFile: event.target.files?.[0] || null }))
                }
              />
            </label>
          </section>
        );
      case 1:
        return (
          <section className="form-section">
            <div className="section-title">
              <h2>Service data</h2>
              <p>Describe the service credential the bot will expose.</p>
            </div>

            <div className="grid two-columns">
              <label>
                <span>Service name</span>
                <input
                  value={formState.serviceName}
                  onChange={(event) => setFormState((prev) => ({ ...prev, serviceName: event.target.value }))}
                  placeholder="Emergency plumbing booking"
                  required
                />
              </label>

              <label>
                <span>Category</span>
                <select
                  value={formState.serviceCategory}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, serviceCategory: event.target.value }))
                  }
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label>
              <span>Service description</span>
              <textarea
                value={formState.serviceDescription}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, serviceDescription: event.target.value }))
                }
                placeholder="Schedules visits, answers availability questions, and explains pricing."
                rows={4}
                required
              />
            </label>
          </section>
        );
      case 2:
        return (
          <section className="form-section">
            <div className="section-title">
              <h2>Prompt</h2>
              <p>Give the model its behavior, tone, and operating boundaries.</p>
            </div>

            <label>
              <span>System prompt</span>
              <textarea
                value={formState.prompt}
                onChange={(event) => setFormState((prev) => ({ ...prev, prompt: event.target.value }))}
                rows={7}
                placeholder="You are Laura's AI agent. Be warm, concise, and action-oriented..."
                required
              />
            </label>
          </section>
        );
      case 3:
        return (
          <section className="form-section">
            <div className="section-title">
              <h2>MCP services</h2>
              <p>Select one or more services. Active now: {selectedCount}</p>
            </div>

            <div className="mcp-grid">
              {mcpServices.map((service) => (
                <button
                  type="button"
                  key={service.id}
                  className={`mcp-card ${formState.mcpServices.includes(service.id) ? 'selected' : ''} ${
                    service.comingSoon ? 'disabled' : ''
                  }`}
                  onClick={() => !service.comingSoon && toggleService(service.id)}
                >
                  <div>
                    <strong>{service.name}</strong>
                    <span>{service.category}</span>
                  </div>
                  <p>{service.description}</p>
                  <small>{service.comingSoon ? 'Coming soon' : service.tools.join(' · ')}</small>
                </button>
              ))}
            </div>
          </section>
        );
      case 4:
        return (
          <section className="form-section">
            <div className="section-title">
              <h2>RAG documents</h2>
              <p>Upload PDFs, notes, or service policies to ground the bot.</p>
            </div>

            <label className="file-field">
              <span>Knowledge files</span>
              <input
                type="file"
                multiple
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, ragFileList: Array.from(event.target.files || []) }))
                }
              />
            </label>

            {formState.ragFileList.length > 0 && (
              <div className="rag-list">
                {formState.ragFileList.map((file) => (
                  <div key={file.name} className="rag-chip">
                    {file.name}
                  </div>
                ))}
              </div>
            )}

            {initialValue?.ragFiles?.length > 0 && (
              <div className="rag-list">
                {initialValue.ragFiles.map((file) => (
                  <div key={file.path} className="rag-chip">
                    {file.originalName}
                  </div>
                ))}
              </div>
            )}
          </section>
        );
      default:
        return null;
    }
  };

  const renderAllSections = () => (
    <>
      <section className="form-section">
        <div className="section-title">
          <h2>1. Persona data</h2>
          <p>Define the identity that users will meet on Hologram.</p>
        </div>

        <div className="grid two-columns">
          <label>
            <span>Name</span>
            <input
              value={formState.personaName}
              onChange={(event) => setFormState({ ...formState, personaName: event.target.value })}
              placeholder="Laura Plomeria"
              required
            />
          </label>

          <label>
            <span>Profession</span>
            <input
              value={formState.profession}
              onChange={(event) => setFormState({ ...formState, profession: event.target.value })}
              placeholder="Residential plumber"
              required
            />
          </label>
        </div>

        <label>
          <span>Description</span>
          <textarea
            value={formState.personaDescription}
            onChange={(event) =>
              setFormState({ ...formState, personaDescription: event.target.value })
            }
            placeholder="Friendly, precise, and practical."
            rows={4}
            required
          />
        </label>

        <label className="file-field">
          <span>Persona photo</span>
          <input
            type="file"
            accept="image/*"
            onChange={(event) =>
              setFormState({
                ...formState,
                personaPhotoFile: event.target.files?.[0] || null
              })
            }
          />
        </label>
      </section>

      <section className="form-section">
        <div className="section-title">
          <h2>2. Service data</h2>
          <p>Describe the service credential the bot will expose.</p>
        </div>

        <div className="grid two-columns">
          <label>
            <span>Service name</span>
            <input
              value={formState.serviceName}
              onChange={(event) => setFormState({ ...formState, serviceName: event.target.value })}
              placeholder="Emergency plumbing booking"
              required
            />
          </label>

          <label>
            <span>Category</span>
            <select
              value={formState.serviceCategory}
              onChange={(event) =>
                setFormState({ ...formState, serviceCategory: event.target.value })
              }
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label>
          <span>Service description</span>
          <textarea
            value={formState.serviceDescription}
            onChange={(event) =>
              setFormState({ ...formState, serviceDescription: event.target.value })
            }
            placeholder="Schedules visits, answers availability questions, and explains pricing."
            rows={4}
            required
          />
        </label>
      </section>

      <section className="form-section">
        <div className="section-title">
          <h2>3. Prompt</h2>
          <p>Give the model its behavior, tone, and operating boundaries.</p>
        </div>

        <label>
          <span>System prompt</span>
          <textarea
            value={formState.prompt}
            onChange={(event) => setFormState({ ...formState, prompt: event.target.value })}
            rows={7}
            placeholder="You are Laura's AI agent. Be warm, concise, and action-oriented..."
            required
          />
        </label>
      </section>

      <section className="form-section">
        <div className="section-title">
          <h2>4. MCP services</h2>
          <p>Select one or more services. Active now: {selectedCount}</p>
        </div>

        <div className="mcp-grid">
          {mcpServices.map((service) => (
            <button
              type="button"
              key={service.id}
              className={`mcp-card ${formState.mcpServices.includes(service.id) ? 'selected' : ''} ${
                service.comingSoon ? 'disabled' : ''
              }`}
              onClick={() => !service.comingSoon && toggleService(service.id)}
            >
              <div>
                <strong>{service.name}</strong>
                <span>{service.category}</span>
              </div>
              <p>{service.description}</p>
              <small>{service.comingSoon ? 'Coming soon' : service.tools.join(' · ')}</small>
            </button>
          ))}
        </div>
      </section>

      <section className="form-section">
        <div className="section-title">
          <h2>5. RAG documents</h2>
          <p>Upload PDFs, notes, or service policies to ground the bot.</p>
        </div>

        <label className="file-field">
          <span>Knowledge files</span>
          <input
            type="file"
            multiple
            onChange={(event) =>
              setFormState({
                ...formState,
                ragFileList: Array.from(event.target.files || [])
              })
            }
          />
        </label>

        {initialValue?.ragFiles?.length ? (
          <div className="rag-list">
            {initialValue.ragFiles.map((file) => (
              <div key={file.path} className="rag-chip">
                {file.originalName}
              </div>
            ))}
          </div>
        ) : null}
      </section>
    </>
  );

  return (
    <form className="bot-form" onSubmit={handleSubmit}>
      <div className="stepper">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`stepper-item ${index === currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}
          >
            <div className="stepper-number">{step.number}</div>
            <span className="stepper-label">{step.label}</span>
          </div>
        ))}
      </div>

      <div className="step-content">
        {renderStepContent()}
      </div>

      <div className="form-actions">
        <button
          type="button"
          className="secondary-button"
          onClick={handlePrevious}
          disabled={currentStep === 0}
        >
          ← Previous
        </button>
        {currentStep < steps.length - 1 ? (
          <button type="button" className="primary-button" onClick={handleNext}>
            Next →
          </button>
        ) : (
          <button type="submit" className="primary-button" disabled={submitting}>
            {submitting ? 'Saving...' : 'Save bot'}
          </button>
        )}
      </div>
    </form>
  );
}
