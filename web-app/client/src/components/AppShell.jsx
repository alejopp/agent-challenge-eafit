import { Link, NavLink } from 'react-router-dom';

const PulseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px', verticalAlign: 'middle'}}>
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
  </svg>
);

const links = [
  { to: '/', label: 'Panel de Control' },
  { to: '/monitoring', label: <span style={{display: 'flex', alignItems: 'center'}}><PulseIcon /> Monitoreo</span> },
  { to: '/bots/new', label: 'Nuevo Bot' }
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
              Cerrar sesión
            </button>
          </div>
        </div>
      </aside>

      <main className="main-panel">
        <header className="page-header">
          <div>
            <div className="eyebrow">
              <span className="eyebrow-line" />
              CENTRO DE OPERACIONES
            </div>
            <h1>Mis Bots de IA</h1>
            <p>Gestiona borradores, despliega en Kubernetes y abre URLs listas para Hologram.</p>
          </div>
          <Link to="/bots/new" className="primary-link">
            + Crear bot
          </Link>
        </header>
        {children}
      </main>
    </div>
  );
}
