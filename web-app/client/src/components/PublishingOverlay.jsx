export function PublishingOverlay({ message = "Publicando en Kubernetes..." }) {
  return (
    <div className="publishing-overlay">
      <div className="overlay-content">
        <div className="lottie-container">
          <dotlottie-wc
            src="https://lottie.host/6ad89052-9af1-460c-8f1e-f3d646b965e5/S6y0uN9u7j.json"
            background="transparent"
            speed="1.2"
            style={{ width: '300px', height: '300px' }}
            loop
            autoplay
          ></dotlottie-wc>
        </div>
        <div className="overlay-text">
          <h2>{message}</h2>
          <p>Esto puede tardar unos momentos. Estamos desplegando el agente y vinculando sus credenciales de servicio.</p>
        </div>
      </div>
    </div>
  );
}
