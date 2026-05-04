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
          <div className="brand-logo">
            <img src="/nextagent-logo.png" alt="NextAgent" className="sidebar-logo" />
          </div>

          <nav className="sidebar-nav">
            {links.map((link) => (
              <NavLink key={link.to} to={link.to} className="nav-item">
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="sidebar-footer">
          <div className="sidebar-footer-content">
            <div className="avatar-pill">{user.displayName?.slice(0, 1) || 'U'}</div>
            <div className="sidebar-footer-info">
              <strong>{user.displayName}</strong>
              <span>{user.email}</span>
            </div>
            <button onClick={onLogout} className="ghost-button logout-button">
              Logout
            </button>
          </div>
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
