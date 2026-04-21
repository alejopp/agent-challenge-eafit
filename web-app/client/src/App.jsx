import { useEffect, useState } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { api } from "./lib/api";
import { AuthPanel } from "./components/AuthPanel";
import { Layout } from "./components/Layout";
import { DashboardPage } from "./pages/DashboardPage";
import { BotFormPage } from "./pages/BotFormPage";
import { BotDetailPage } from "./pages/BotDetailPage";

const TOKEN_KEY = "persona-ai-token";

function ProtectedRoutes({ user, onLogout, dashboard, refreshDashboard, platformConfig }) {
  const [busyAction, setBusyAction] = useState("");

  const handleBotAction = async (action, botId) => {
    setBusyAction(botId);
    try {
      await action();
      await refreshDashboard();
    } finally {
      setBusyAction("");
    }
  };

  return (
    <Layout user={user} onLogout={onLogout}>
      <Routes>
        <Route
          path="/"
          element={
            <DashboardPage
              dashboard={dashboard}
              busyAction={busyAction}
              onPublish={(botId) => handleBotAction(() => api.publishBot(localStorage.getItem(TOKEN_KEY), botId), botId)}
              onUnpublish={(botId) =>
                handleBotAction(() => api.unpublishBot(localStorage.getItem(TOKEN_KEY), botId), botId)
              }
              onDelete={(botId) => handleBotAction(() => api.deleteBot(localStorage.getItem(TOKEN_KEY), botId), botId)}
            />
          }
        />
        <Route
          path="/bots/new"
          element={<BotFormPage api={api} token={localStorage.getItem(TOKEN_KEY)} platformConfig={platformConfig} mode="create" />}
        />
        <Route
          path="/bots/:botId/edit"
          element={<BotFormPage api={api} token={localStorage.getItem(TOKEN_KEY)} platformConfig={platformConfig} mode="edit" />}
        />
        <Route
          path="/bots/:botId"
          element={<BotDetailPage api={api} token={localStorage.getItem(TOKEN_KEY)} platformConfig={platformConfig} />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

export default function App() {
  const navigate = useNavigate();
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(null);
  const [dashboard, setDashboard] = useState({ summary: { totalBots: 0, publishedBots: 0, draftBots: 0, totalSelectedMcp: 0 }, bots: [] });
  const [platformConfig, setPlatformConfig] = useState({ mcpServers: [] });
  const [loading, setLoading] = useState(Boolean(token));
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  const refreshDashboard = async (activeToken = token) => {
    if (!activeToken) return;
    const [dashboardResponse, configResponse] = await Promise.all([
      api.getDashboard(activeToken),
      api.getPlatformConfig(activeToken)
    ]);
    setDashboard(dashboardResponse);
    setPlatformConfig(configResponse);
  };

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    Promise.all([api.me(token), refreshDashboard(token)])
      .then(([meResponse]) => setUser(meResponse.user))
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const authenticate = async (mode, payload) => {
    setAuthLoading(true);
    setAuthError("");
    try {
      const response = mode === "login" ? await api.login(payload) : await api.register(payload);
      localStorage.setItem(TOKEN_KEY, response.token);
      setToken(response.token);
      setUser(response.user);
      navigate("/");
    } catch (reason) {
      setAuthError(reason.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
    setDashboard({ summary: { totalBots: 0, publishedBots: 0, draftBots: 0, totalSelectedMcp: 0 }, bots: [] });
  };

  if (loading) {
    return <div className="loading-screen">Loading Persona AI Studio...</div>;
  }

  if (!token || !user) {
    return <AuthPanel onAuthenticate={authenticate} loading={authLoading} error={authError} />;
  }

  return (
    <ProtectedRoutes
      user={user}
      onLogout={logout}
      dashboard={dashboard}
      refreshDashboard={refreshDashboard}
      platformConfig={platformConfig}
    />
  );
}
