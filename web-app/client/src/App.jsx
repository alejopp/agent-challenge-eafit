import { useEffect, useState } from 'react';
import { Route, Routes, useParams } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { api } from './lib/api';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { NewBotPage } from './pages/NewBotPage';
import { BotDetailPage } from './pages/BotDetailPage';

function BotRoute(props) {
  const { botId } = useParams();
  return <BotDetailPage botId={botId} {...props} />;
}

export default function App() {
  const [session, setSession] = useState(undefined);
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState('');
  const [bots, setBots] = useState([]);
  const [stats, setStats] = useState({
    totalBots: 0,
    publishedBots: 0,
    draftBots: 0,
    mcpServices: 0
  });
  const [meta, setMeta] = useState({
    namespace: 'team-g',
    baseDomain: 'agents.team-g.teams.eafit.testnet.verana.network'
  });
  const [mcpServices, setMcpServices] = useState([]);

  const refreshBots = async () => {
    const response = await api.getBots();
    setBots(response.bots);
    setStats(response.stats);
    return response;
  };

  useEffect(() => {
    api
      .getSession()
      .then((response) => setSession(response.user))
      .catch(() => setSession(null));

    api.getMeta().then(setMeta).catch(() => null);
    api.getMcpServices().then((response) => setMcpServices(response.services)).catch(() => null);
  }, []);

  useEffect(() => {
    if (session) {
      refreshBots().catch(() => null);
    }
  }, [session]);

  const handleLogin = async (payload) => {
    setAuthBusy(true);
    setAuthError('');
    try {
      const response = await api.login(payload);
      setSession(response.user);
    } catch (error) {
      setAuthError(error.message);
    } finally {
      setAuthBusy(false);
    }
  };

  const handleRegister = async (payload) => {
    setAuthBusy(true);
    setAuthError('');
    try {
      const response = await api.register({
        ...payload,
        name: payload.displayName
      });
      setSession(response.user);
    } catch (error) {
      setAuthError(error.message);
    } finally {
      setAuthBusy(false);
    }
  };

  const handleLogout = async () => {
    await api.logout();
    setSession(null);
    setBots([]);
  };

  const createBot = async (formData) => {
    const response = await api.createBot(formData);
    await refreshBots();
    return response.bot;
  };

  const loadBot = async (botId) => {
    const response = await api.getBot(botId);
    return response.bot;
  };

  const saveBot = async (botId, formData) => {
    const response = await api.updateBot(botId, formData);
    await refreshBots();
    return response.bot;
  };

  const publishBot = async (botId) => {
    const response = await api.publishBot(botId);
    await refreshBots();
    return response.bot;
  };

  const unpublishBot = async (botId) => {
    const response = await api.unpublishBot(botId);
    await refreshBots();
    return response.bot;
  };

  if (session === undefined) {
    return <div className="loading-screen">Loading workspace...</div>;
  }

  if (!session) {
    return (
      <AuthPage
        onLogin={handleLogin}
        onRegister={handleRegister}
        submitting={authBusy}
        error={authError}
      />
    );
  }

  return (
    <AppShell user={session} onLogout={handleLogout}>
      <Routes>
        <Route path="/" element={<DashboardPage bots={bots} stats={stats} meta={meta} />} />
        <Route path="/bots/new" element={<NewBotPage mcpServices={mcpServices} onCreate={createBot} />} />
        <Route
          path="/bots/:botId"
          element={
            <BotRoute
              mcpServices={mcpServices}
              loadBot={loadBot}
              onSave={saveBot}
              onPublish={publishBot}
              onUnpublish={unpublishBot}
            />
          }
        />
      </Routes>
    </AppShell>
  );
}
