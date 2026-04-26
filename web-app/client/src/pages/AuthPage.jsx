import { useState } from 'react';

export function AuthPage({ onLogin, onRegister, submitting, error }) {
  const [mode, setMode] = useState('login');
  const [formState, setFormState] = useState({
    displayName: '',
    email: '',
    password: ''
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    if (mode === 'login') {
      onLogin({ email: formState.email, password: formState.password });
      return;
    }
    onRegister(formState);
  };

  return (
    <div className="auth-screen">
      <div className="auth-panel auth-left">
        <div>
          <div className="brand">
            <div className="brand-mark">PA</div>
            <div>
              <strong>Persona AI</strong>
              <span>Agent builder</span>
            </div>
          </div>
          <h1>Build smarter AI agents, faster</h1>
          <p>Deploy virtual agents in minutes with a polished no-code workspace.</p>

          <div className="benefit-list">
            <div>Deploy bots with Helm on `team-g`.</div>
            <div>Reuse shared Ollama, Postgres, and Redis.</div>
            <div>Choose MCP tools and RAG content without touching code.</div>
          </div>
        </div>
        <small>© 2026 Persona AI Studio · Academic edition</small>
      </div>

      <div className="auth-panel auth-right">
        <div className="eyebrow">
          <span className="eyebrow-line" />
          OPERATIONS HUB
        </div>
        <h2>{mode === 'login' ? 'Welcome back' : 'Create your workspace'}</h2>
        <p>
          {mode === 'login'
            ? 'Sign in to manage your Persona AI bot portfolio.'
            : 'Create an account to start building Hologram-ready bots.'}
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === 'register' ? (
            <label>
              <span>Display name</span>
              <input
                value={formState.displayName}
                onChange={(event) =>
                  setFormState({ ...formState, displayName: event.target.value })
                }
                required
              />
            </label>
          ) : null}

          <label>
            <span>Email</span>
            <input
              type="email"
              value={formState.email}
              onChange={(event) => setFormState({ ...formState, email: event.target.value })}
              required
            />
          </label>

          <label>
            <span>Password</span>
            <input
              type="password"
              value={formState.password}
              onChange={(event) => setFormState({ ...formState, password: event.target.value })}
              required
            />
          </label>

          {error ? <div className="error-banner">{error}</div> : null}

          <button className="primary-button" disabled={submitting}>
            {submitting ? 'Working...' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <button className="text-button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
          {mode === 'login' ? 'Need an account? Register for free' : 'Already have an account? Login'}
        </button>
      </div>
    </div>
  );
}
