import { useEffect, useMemo, useRef, useState } from 'react';

const categories = ['Servicios Profesionales', 'Salud', 'Educación', 'Creativo', 'Servicios del Hogar'];

const steps = [
  { id: 'persona', label: 'Persona', number: 1 },
  { id: 'service', label: 'Servicio', number: 2 },
  { id: 'prompt', label: 'Instrucciones', number: 3 },
  { id: 'mcp', label: 'Servicios MCP', number: 4 },
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
    mcpServices: initialValue?.mcpServices || [],
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
  const [stepError, setStepError] = useState('');
  const justNavigatedToLastStep = useRef(false);

  const validateStep = (step) => {
    switch (step) {
      case 0:
        if (!formState.personaName.trim()) return 'El nombre de la persona es obligatorio.';
        if (!formState.profession.trim()) return 'La profesión es obligatoria.';
        if (!formState.personaDescription.trim()) return 'La descripción es obligatoria.';
        return '';
      case 1:
        if (!formState.serviceName.trim()) return 'El nombre del servicio es obligatorio.';
        if (!formState.serviceDescription.trim()) return 'La descripción del servicio es obligatoria.';
        return '';
      case 2:
        if (!formState.prompt.trim()) return 'Las instrucciones (system prompt) son obligatorias.';
        return '';
      case 3:
        if (formState.mcpServices.length === 0) return 'Debes seleccionar al menos un servicio MCP.';
        return '';
      default:
        return '';
    }
  };

  const handleNext = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const error = validateStep(currentStep);
    if (error) {
      setStepError(error);
      return;
    }
    setStepError('');
    if (currentStep < steps.length - 1) {
      if (currentStep === steps.length - 2) {
        justNavigatedToLastStep.current = true;
      }
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (currentStep > 0) {
      justNavigatedToLastStep.current = false;
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSave = async () => {
    if (justNavigatedToLastStep.current) {
      justNavigatedToLastStep.current = false;
      return;
    }
    await onSubmit(buildBotFormData(formState));
    if (onComplete) {
      onComplete();
    }
  };

  useEffect(() => {
    if (currentStep !== steps.length - 1) {
      justNavigatedToLastStep.current = false;
    }
  }, [currentStep]);

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <section className="form-section">
            <div className="section-title">
              <h2>Datos de la Persona</h2>
              <p>Define la identidad que los usuarios conocerán en Hologram.</p>
            </div>

            <div className="grid two-columns">
              <label>
                <span>Nombre</span>
                <input
                  value={formState.personaName}
                  onChange={(event) => setFormState((prev) => ({ ...prev, personaName: event.target.value }))}
                  placeholder="Laura Plomería"
                  required
                />
              </label>

              <label>
                <span>Profesión</span>
                <input
                  value={formState.profession}
                  onChange={(event) => setFormState((prev) => ({ ...prev, profession: event.target.value }))}
                  placeholder="Plomera residencial"
                  required
                />
              </label>
            </div>

            <label>
              <span>Descripción</span>
              <textarea
                value={formState.personaDescription}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, personaDescription: event.target.value }))
                }
                placeholder="Amigable, precisa y práctica."
                rows={4}
                required
              />
            </label>

            <div className="photo-upload-row">
              {formState.personaPhotoPreview && (
                <img
                  src={formState.personaPhotoPreview}
                  alt="Vista previa"
                  className="persona-photo-preview"
                />
              )}
              <label className="file-field" style={{ flex: 1 }}>
                <span>Foto de la persona</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    const file = event.target.files?.[0] || null;
                    setFormState({
                      ...formState,
                      personaPhotoFile: file,
                      personaPhotoPreview: file
                        ? URL.createObjectURL(file)
                        : formState.personaPhotoPreview
                    });
                  }}
                />
              </label>
            </div>
          </section>
        );
      case 1:
        return (
          <section className="form-section">
            <div className="section-title">
              <h2>Datos del Servicio</h2>
              <p>Describe la credencial de servicio que el bot expondrá.</p>
            </div>

            <div className="grid two-columns">
              <label>
                <span>Nombre del servicio</span>
                <input
                  value={formState.serviceName}
                  onChange={(event) => setFormState((prev) => ({ ...prev, serviceName: event.target.value }))}
                  placeholder="Reserva de plomería de emergencia"
                  required
                />
              </label>

              <label>
                <span>Categoría</span>
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
              <span>Descripción del servicio</span>
              <textarea
                value={formState.serviceDescription}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, serviceDescription: event.target.value }))
                }
                placeholder="Agenda visitas, responde dudas de disponibilidad y explica precios."
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
              <h2>Instrucciones (Prompt)</h2>
              <p>Define el comportamiento, tono y límites operativos del modelo.</p>
            </div>

            <label>
              <span>System prompt</span>
              <textarea
                value={formState.prompt}
                onChange={(event) => setFormState((prev) => ({ ...prev, prompt: event.target.value }))}
                rows={7}
                placeholder="Eres el agente de IA de Laura. Sé amable, conciso y orientado a la acción..."
                required
              />
            </label>
          </section>
        );
      case 3:
        return (
          <section className="form-section">
            <div className="section-title">
              <h2>Servicios MCP</h2>
              <p>Selecciona uno o más servicios. Activos: {selectedCount}</p>
            </div>

            <div className="mcp-grid">
              {mcpServices.map((service) => (
                <button
                  type="button"
                  key={service.id}
                  className={`mcp-card ${formState.mcpServices.includes(service.id) ? 'selected' : ''} ${service.comingSoon ? 'disabled' : ''
                    }`}
                  onClick={() => !service.comingSoon && toggleService(service.id)}
                >
                  <div>
                    <strong>{service.name}</strong>
                    <span>{service.category}</span>
                  </div>
                  <p>{service.description}</p>
                  <small>{service.comingSoon ? 'Próximamente' : service.tools.join(' · ')}</small>
                </button>
              ))}
            </div>
          </section>
        );
      case 4:
        return (
          <section className="form-section">
            <div className="section-title">
              <h2>Documentos RAG</h2>
              <p>Sube PDFs, notas o políticas de servicio para fundamentar al bot.</p>
            </div>

            <label className="file-field">
              <span>Archivos de conocimiento</span>
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

  return (
    <form className="bot-form" onSubmit={(e) => e.preventDefault()} noValidate>
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

      {stepError && (
        <div className="step-error-banner">
          {stepError}
        </div>
      )}

      <div className="form-actions">
        <button
          type="button"
          className="secondary-button"
          onClick={handlePrevious}
          disabled={currentStep === 0}
        >
          ← Anterior
        </button>
        {currentStep < steps.length - 1 ? (
          <button type="button" className="primary-button" onClick={handleNext}>
            Siguiente →
          </button>
        ) : (
          <button type="button" className="primary-button" onClick={handleSave} disabled={submitting}>
            {submitting ? 'Guardando...' : 'Guardar bot'}
          </button>
        )}
      </div>
    </form>
  );
}
