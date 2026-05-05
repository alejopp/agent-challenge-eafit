import { Link, NavLink } from "react-router-dom";

export function Layout({ user, onLogout, children }) {
  const initials = user.name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((chunk) => chunk[0]?.toUpperCase())
    .join("");

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link to="/" className="brand">
          <span className="brand-mark">PA</span>
          <div className="brand-text">
            <strong>Persona AI Studio</strong>
            <p>Agent builder</p>
          </div>
        </Link>

        <nav className="nav">
          <div className="nav-section">
            <NavLink to="/" className={({ isActive }) => `nav-link${isActive ? " active" : ""}`} end>
              <span className="nav-icon">◫</span>
              Dashboard
            </NavLink>
            <NavLink
              to="/bots/new"
              className={({ isActive }) => `nav-link nav-link-highlight${isActive ? " active" : ""}`}
            >
              <span className="nav-icon">＋</span>
              New Bot
              <span className="badge">+</span>
            </NavLink>
          </div>

          <div className="nav-section">
            <p className="nav-label">Workspace</p>
            <span className="nav-link nav-link-muted">
              <span className="nav-icon">≡</span>
              My agents
            </span>
            <span className="nav-link nav-link-muted">
              <span className="nav-icon">▦</span>
              Templates
            </span>
            <span className="nav-link nav-link-muted">
              <span className="nav-icon">◌</span>
              MCP Services
            </span>
          </div>

          <div className="nav-section">
            <p className="nav-label">Account</p>
            <span className="nav-link nav-link-muted">
              <span className="nav-icon">◍</span>
              Profile
            </span>
            <span className="nav-link nav-link-muted">
              <span className="nav-icon">⚙</span>
              Settings
            </span>
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="user-row">
            <span className="user-dot">{initials || "DU"}</span>
            <div className="user-info">
              <strong>{user.name}</strong>
              <p>{user.email}</p>
            </div>
          </div>
          <button className="logout-button" onClick={onLogout}>
            Logout
          </button>
          <button className="ghost-button sidebar-logout" onClick={onLogout}>
            Logout
          </button>
        </div>
      </aside>

      <main className="content">{children}</main>
    </div>
  );
}
