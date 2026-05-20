import { useState, useEffect } from 'react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

import { api } from '../lib/api';

export function MonitoringPage() {
  const [mounted, setMounted] = useState(false);
  const [messagesData, setMessagesData] = useState([]);
  const [latencyData, setLatencyData] = useState([]);
  const [pgData, setPgData] = useState([]);
  const [redisData, setRedisData] = useState([]);
  const [podResourceData, setPodResourceData] = useState([]);
  const [deploys, setDeploys] = useState([]);
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [kpis, setKpis] = useState({
    activeConversations: '-',
    messagesPerMinute: '-',
    p95Latency: '-',
    errorRate: '-'
  });

  useEffect(() => {
    setMounted(true);

    const loadAgentStatistics = async () => {
      try {
        const telemetryData = await api.getStats();
        if (telemetryData) {
          if (Array.isArray(telemetryData.messagesData)) setMessagesData(telemetryData.messagesData);
          if (Array.isArray(telemetryData.latencyData)) setLatencyData(telemetryData.latencyData);
          if (Array.isArray(telemetryData.pgData)) setPgData(telemetryData.pgData);
          if (Array.isArray(telemetryData.redisData)) setRedisData(telemetryData.redisData);
          if (Array.isArray(telemetryData.podResourceData)) setPodResourceData(telemetryData.podResourceData);
          if (Array.isArray(telemetryData.deploys)) setDeploys(telemetryData.deploys);
          if (Array.isArray(telemetryData.alerts)) setActiveAlerts(telemetryData.alerts);
          if (telemetryData.kpis) setKpis(telemetryData.kpis);
        }
      } catch (error) {
        console.warn('No se pudo conectar al API de telemetría.', error);
      }
    };

    loadAgentStatistics();
    
    // Configurar polling cada 30 segundos para reducir la carga de red
    const intervalId = setInterval(loadAgentStatistics, 30000);

    return () => clearInterval(intervalId);
  }, []);

  if (!mounted) return null;

  return (
    <div className="dashboard-layout">
      {/* Header */}
      <header className="page-header" style={{ marginBottom: '0' }}>
        <div>
          <div className="eyebrow">
            <span className="eyebrow-line" />
            TELEMETRÍA EN TIEMPO REAL
          </div>
          <h1>Monitoreo del Sistema</h1>
          <p>Métricas de rendimiento, uso de recursos y estado de los servicios.</p>
        </div>
      </header>

      {/* Stat Cards */}
      <section className="stats-grid">
        <article className="stat-card">
          <span>Conversaciones activas</span>
          <strong>{kpis.activeConversations}</strong>
        </article>
        <article className="stat-card">
          <span>Mensajes por minuto</span>
          <strong>{kpis.messagesPerMinute}</strong>
        </article>
        <article className="stat-card">
          <span>Latencia promedio (p95)</span>
          <strong>{kpis.p95Latency}</strong>
        </article>
        <article className="stat-card accent">
          <span>Tasa de error (%)</span>
          <strong>{kpis.errorRate}</strong>
        </article>
      </section>

      {/* Charts Grid */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
        
        {/* Chart 1: Messages by Bot */}
        <article className="workspace-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="workspace-header" style={{ marginBottom: '16px' }}>
            <h2>Mensajes procesados por bot</h2>
          </div>
          <div style={{ flex: 1, minHeight: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={messagesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="time" stroke="#94A3B8" fontSize={12} tickMargin={10} />
                <YAxis stroke="#94A3B8" fontSize={12} tickMargin={10} />
                <Tooltip contentStyle={{ backgroundColor: '#1E293B', borderColor: 'rgba(37, 99, 235, 0.2)' }} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Line type="monotone" dataKey="botA" stroke="#2563EB" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="botB" stroke="#22D3EE" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="botC" stroke="#7C3AED" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </article>

        {/* Chart 2: Response Time */}
        <article className="workspace-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="workspace-header" style={{ marginBottom: '16px' }}>
            <h2>Tiempo de respuesta (ms)</h2>
          </div>
          <div style={{ flex: 1, minHeight: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={latencyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="time" stroke="#94A3B8" fontSize={12} tickMargin={10} />
                <YAxis stroke="#94A3B8" fontSize={12} tickMargin={10} />
                <Tooltip contentStyle={{ backgroundColor: '#1E293B', borderColor: 'rgba(37, 99, 235, 0.2)' }} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Area type="monotone" dataKey="p99" stackId="1" stroke="#EC4899" fill="#EC4899" fillOpacity={0.4} />
                <Area type="monotone" dataKey="p95" stackId="1" stroke="#7C3AED" fill="#7C3AED" fillOpacity={0.5} />
                <Area type="monotone" dataKey="p50" stackId="1" stroke="#2563EB" fill="#2563EB" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </article>

        {/* Chart 3: Pod Resources */}
        <article className="workspace-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="workspace-header" style={{ marginBottom: '16px' }}>
            <h2>Uso de CPU y Memoria por Pod</h2>
          </div>
          <div style={{ flex: 1, minHeight: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={podResourceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="pod" stroke="#94A3B8" fontSize={12} tickMargin={10} />
                <YAxis stroke="#94A3B8" fontSize={12} tickMargin={10} />
                <Tooltip contentStyle={{ backgroundColor: '#1E293B', borderColor: 'rgba(37, 99, 235, 0.2)' }} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="cpu" name="CPU (%)" fill="#22D3EE" radius={[4, 4, 0, 0]} />
                <Bar dataKey="memory" name="Memoria (MB)" fill="#2563EB" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        {/* Chart 4: PostgreSQL */}
        <article className="workspace-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="workspace-header" style={{ marginBottom: '16px' }}>
            <h2>Consultas a PostgreSQL</h2>
          </div>
          <div style={{ flex: 1, minHeight: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={pgData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="time" stroke="#94A3B8" fontSize={12} tickMargin={10} />
                <YAxis yAxisId="left" stroke="#94A3B8" fontSize={12} />
                <YAxis yAxisId="right" orientation="right" stroke="#94A3B8" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#1E293B', borderColor: 'rgba(37, 99, 235, 0.2)' }} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Line yAxisId="left" type="monotone" dataKey="qps" name="Queries/sec" stroke="#10B981" strokeWidth={2} dot={false} />
                <Line yAxisId="right" type="monotone" dataKey="connections" name="Conexiones" stroke="#F59E0B" strokeWidth={2} dot={false} />
                <Line yAxisId="right" type="monotone" dataKey="slowQueries" name="Slow Queries" stroke="#EF4444" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </article>

        {/* Chart 5: Redis */}
        <article className="workspace-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="workspace-header" style={{ marginBottom: '16px' }}>
            <h2>Hit/Miss Rate de Redis (%)</h2>
          </div>
          <div style={{ flex: 1, minHeight: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={redisData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="time" stroke="#94A3B8" fontSize={12} tickMargin={10} />
                <YAxis stroke="#94A3B8" fontSize={12} tickMargin={10} domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor: '#1E293B', borderColor: 'rgba(37, 99, 235, 0.2)' }} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Area type="monotone" dataKey="hitRate" stackId="1" name="Hit Rate" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
                <Area type="monotone" dataKey="missRate" stackId="1" name="Miss Rate" stroke="#EF4444" fill="#EF4444" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </article>

        {/* Chart 6: CI/CD Table */}
        <article className="workspace-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="workspace-header" style={{ marginBottom: '16px' }}>
            <h2>Historial de Deploys CI/CD</h2>
          </div>
          <div style={{ flex: 1, overflow: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <th style={{ padding: '12px 8px', color: '#94A3B8', fontWeight: 500 }}>ID Deploy</th>
                  <th style={{ padding: '12px 8px', color: '#94A3B8', fontWeight: 500 }}>Servicio</th>
                  <th style={{ padding: '12px 8px', color: '#94A3B8', fontWeight: 500 }}>Estado</th>
                  <th style={{ padding: '12px 8px', color: '#94A3B8', fontWeight: 500 }}>Hace</th>
                </tr>
              </thead>
              <tbody>
                {deploys.map((dep) => (
                  <tr key={dep.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '12px 8px', fontFamily: 'monospace' }}>{dep.id}</td>
                    <td style={{ padding: '12px 8px', fontWeight: 500 }}>{dep.service}</td>
                    <td style={{ padding: '12px 8px' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        backgroundColor: dep.status === 'success' ? 'rgba(16, 185, 129, 0.15)' : 
                                         dep.status === 'failed' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                        color: dep.status === 'success' ? '#34D399' : 
                               dep.status === 'failed' ? '#F87171' : '#FBBF24',
                        textTransform: 'uppercase'
                      }}>
                        {dep.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 8px', color: '#94A3B8' }}>{dep.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

      </section>

      {/* Alerts */}
      <section className="workspace-card" style={{ marginTop: '0' }}>
        <div className="workspace-header" style={{ marginBottom: '16px' }}>
          <h2>Alertas Activas</h2>
        </div>
        
        {activeAlerts.length === 0 ? (
          <div style={{ padding: '20px', borderRadius: '12px', backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', display: 'flex', alignItems: 'center', gap: '12px', color: '#34D399' }}>
            <span style={{ fontSize: '1.5rem' }}>✓</span>
            <div>
              <strong style={{ display: 'block' }}>Todo en orden</strong>
              <span style={{ fontSize: '0.85rem', opacity: 0.8 }}>No hay alertas críticas ni advertencias en el sistema.</span>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '12px' }}>
            {activeAlerts.map(alert => (
              <div key={alert.id} style={{ 
                padding: '16px', 
                borderRadius: '12px', 
                backgroundColor: alert.level === 'critical' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)', 
                border: `1px solid ${alert.level === 'critical' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '1.2rem' }}>{alert.level === 'critical' ? '🚨' : '⚠️'}</span>
                  <div>
                    <strong style={{ display: 'block', color: alert.level === 'critical' ? '#FCA5A5' : '#FCD34D' }}>{alert.message}</strong>
                    <span style={{ fontSize: '0.85rem', color: '#94A3B8' }}>{alert.component}</span>
                  </div>
                </div>
                <span style={{ fontSize: '0.85rem', color: '#94A3B8' }}>{alert.time}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
