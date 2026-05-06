export function PublishingOverlay({ message = "Publicando..." }) {
  return (
    <div className="inline-publishing-status">
      <div className="lottie-inline">
        <dotlottie-wc
          src="https://lottie.host/6ad89052-9af1-460c-8f1e-f3d646b965e5/S6y0uN9u7j.json"
          background="transparent"
          speed="1.2"
          style={{ width: '120px', height: '120px' }}
          loop
          autoplay
        ></dotlottie-wc>
      </div>
      <div className="status-text">
        <strong>{message}</strong>
        <p>Esto puede tardar unos momentos...</p>
      </div>
    </div>
  );
}
