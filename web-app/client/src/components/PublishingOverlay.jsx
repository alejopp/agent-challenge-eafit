export function PublishingOverlay({ message = "Publicando..." }) {
  return (
    <div className="inline-publishing-status">
      <div className="lottie-inline">
        <dotlottie-player
          src="/ai-agent.json"
          background="transparent"
          speed="1"
          style={{ width: '100px', height: '100px' }}
          loop
          autoplay
        ></dotlottie-player>
      </div>
      <div className="status-text">
        <strong>{message}</strong>
        <p>Esto puede tardar unos momentos...</p>
      </div>
    </div>
  );
}
