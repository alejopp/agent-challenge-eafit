import { Link, NavLink } from 'react-router-dom';

const links = [
  { to: '/', label: 'Dashboard' },
  { to: '/bots/new', label: 'New Bot' }
];

export function AppShell({ user, onLogout, children }) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <div className="brand">
            <div className="brand-mark">PA</div>
            <div>
              <strong>Persona AI</strong>
              <span>Agent builder</span>
            </div>
          </div>

          <nav className="sidebar-nav">
            {links.map((link) => (
              <NavLink key={link.to} to={link.to} className="nav-item">
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="sidebar-card">
            <p>Shared infra</p>
            <strong>Ollama + Redis + Postgres</strong>
            <span>One academic environment for `team-g`.</span>
          </div>
        </div>

        <div className="sidebar-footer">
          <div className="avatar-pill">{user.displayName?.slice(0, 1) || 'U'}</div>
          <div>
            <strong>{user.displayName}</strong>
            <span>{user.email}</span>
          </div>
          <button onClick={onLogout} className="ghost-button">
            Logout
          </button>
        </div>
      </aside>

      <main className="main-panel">
        <header className="page-header">
          <div>
            <div className="eyebrow">
              <span className="eyebrow-line" />
              OPERATIONS HUB
            </div>
            <h1>My AI Bots</h1>
            <p>Manage drafts, publish to Kubernetes, and open Hologram-ready URLs.</p>
          </div>
          <Link to="/bots/new" className="primary-link">
            + Create bot
          </Link>
        </header>
        {children}
      </main>
    </div>
  );
}
