import { useState } from "react";

const initialForm = {
  name: "",
  email: "",
  password: ""
};

export function AuthPanel({ onAuthenticate, loading, error }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState(initialForm);

  const submitLabel = mode === "login" ? "Access Studio" : "Create Account";

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onAuthenticate(mode, form);
  };

  return (
    <section className="auth-shell">
      <div className="hero-card">
        <p className="eyebrow">Persona AI Studio</p>
        <h1>Launch polished service agents without touching Kubernetes by hand.</h1>
        <p className="hero-copy">
          Build persona-driven assistants, attach MCP tools, upload reference documents, and publish a Hologram-ready
          URL from one light-theme dashboard.
        </p>
        <div className="hero-pills">
          <span>React Frontend</span>
          <span>Express API</span>
          <span>SQLite</span>
          <span>MCP + RAG</span>
        </div>
      </div>

      <form className="auth-card" onSubmit={handleSubmit}>
        <div className="segment">
          <button type="button" className={mode === "login" ? "active" : ""} onClick={() => setMode("login")}>
            Login
          </button>
          <button type="button" className={mode === "register" ? "active" : ""} onClick={() => setMode("register")}>
            Register
          </button>
        </div>

        {mode === "register" && (
          <label>
            Full name
            <input
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              placeholder="Andrea Rivera"
              required={mode === "register"}
            />
          </label>
        )}

        <label>
          Email
          <input
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            placeholder="andrea@example.com"
            type="email"
            required
          />
        </label>

        <label>
          Password
          <input
            value={form.password}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            placeholder="At least 8 characters"
            type="password"
            minLength={8}
            required
          />
        </label>

        {error ? <p className="form-error">{error}</p> : null}

        <button className="primary-button" type="submit" disabled={loading}>
          {loading ? "Working..." : submitLabel}
        </button>

        <p className="muted-note">
          Optional OAuth can be added later; this starter includes email/password auth so the challenge flow works end
          to end right away.
        </p>
      </form>
    </section>
  );
}
