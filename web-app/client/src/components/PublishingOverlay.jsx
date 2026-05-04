export function PublishingOverlay({ message = "Publishing to Kubernetes..." }) {
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
          <p>This may take a few moments. We are deploying the agent and issuing its service credentials.</p>
        </div>
      </div>
    </div>
  );
}
