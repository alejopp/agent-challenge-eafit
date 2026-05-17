import { spawnSync } from 'node:child_process';

const TSDB_POINTS = 30;

// State to simulate TSDB logic across requests
const tsdbState = {
  latency: [45, 120, 250],
  pg: [500, 50, 2],
  redis: [85, 15],
  history: {
    latencyData: [],
    pgData: [],
    redisData: []
  }
};

function generateTick(keys, baseValues, volatility, stateKey) {
  const currentValues = tsdbState[stateKey];
  const point = {};
  
  keys.forEach((key, index) => {
    currentValues[index] = Math.max(0, currentValues[index] + (Math.random() - 0.45) * volatility);
    point[key] = Math.round(currentValues[index]);
  });
  return point;
}

function updateSimulatedMetrics() {
  const now = Date.now();
  const timeStr = new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  const latencyPoint = { time: timeStr, ...generateTick(['p50', 'p95', 'p99'], [45, 120, 250], 10, 'latency') };
  const pgPoint = { time: timeStr, ...generateTick(['qps', 'connections', 'slowQueries'], [500, 50, 2], 20, 'pg') };
  const redisPoint = { time: timeStr, ...generateTick(['hitRate', 'missRate'], [85, 15], 5, 'redis') };
  
  tsdbState.history.latencyData.push(latencyPoint);
  tsdbState.history.pgData.push(pgPoint);
  tsdbState.history.redisData.push(redisPoint);
  
  if (tsdbState.history.latencyData.length > TSDB_POINTS) tsdbState.history.latencyData.shift();
  if (tsdbState.history.pgData.length > TSDB_POINTS) tsdbState.history.pgData.shift();
  if (tsdbState.history.redisData.length > TSDB_POINTS) tsdbState.history.redisData.shift();
}

// Initialize history to have 30 points
for(let i = 0; i < TSDB_POINTS; i++) {
    updateSimulatedMetrics();
    // mock past times
    const pastTimeStr = new Date(Date.now() - ((TSDB_POINTS - i) * 60000)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    tsdbState.history.latencyData[i].time = pastTimeStr;
    tsdbState.history.pgData[i].time = pastTimeStr;
    tsdbState.history.redisData[i].time = pastTimeStr;
}

function getDeploys(config) {
  const helmEnv = { ...process.env, KUBECONFIG: config.kubeconfigPath };
  const result = spawnSync('kubectl', ['get', 'deployments,statefulsets', '--namespace', config.k8sNamespace, '-o', 'json'], { env: helmEnv, encoding: 'utf-8' });
  
  if (result.status !== 0) {
    return [
      { id: 'sim-1', service: 'cluster-connection-error', status: 'failed', time: 'now' }
    ];
  }
  
  try {
    const data = JSON.parse(result.stdout);
    return data.items.map(item => {
      const isReady = item.status?.readyReplicas === item.status?.replicas && item.status?.replicas > 0;
      return {
        id: item.metadata.uid.substring(0, 8),
        service: item.metadata.name,
        status: isReady ? 'success' : 'running',
        time: item.metadata.creationTimestamp ? new Date(item.metadata.creationTimestamp).toLocaleDateString() : 'N/A'
      };
    }).slice(0, 10);
  } catch (e) {
    return [];
  }
}

function getAlerts(config) {
  const helmEnv = { ...process.env, KUBECONFIG: config.kubeconfigPath };
  const result = spawnSync('kubectl', ['get', 'events', '--field-selector', 'type=Warning', '--namespace', config.k8sNamespace, '-o', 'json'], { env: helmEnv, encoding: 'utf-8' });
  
  if (result.status !== 0) {
    return [];
  }
  
  try {
    const data = JSON.parse(result.stdout);
    return data.items.map((item, index) => ({
      id: index + 1,
      level: 'warning',
      message: item.message,
      component: item.involvedObject.kind,
      time: item.lastTimestamp ? new Date(item.lastTimestamp).toLocaleTimeString() : 'N/A'
    })).slice(0, 5);
  } catch (e) {
    return [];
  }
}

function getPodResources(config) {
  const helmEnv = { ...process.env, KUBECONFIG: config.kubeconfigPath };
  const result = spawnSync('kubectl', ['top', 'pods', '--namespace', config.k8sNamespace, '--no-headers'], { env: helmEnv, encoding: 'utf-8' });
  
  if (result.status !== 0) {
    // Fallback if metrics-server isn't installed
    return [
      { pod: 'api-pod-1 (simulado)', cpu: 45, memory: 512 },
      { pod: 'api-pod-2 (simulado)', cpu: 60, memory: 620 },
      { pod: 'worker-1 (simulado)', cpu: 85, memory: 1024 }
    ];
  }
  
  try {
    const lines = result.stdout.trim().split('\n');
    return lines.map(line => {
      const parts = line.split(/\s+/);
      return {
        pod: parts[0],
        cpu: parseInt(parts[1].replace('m', ''), 10) || 0,
        memory: parseInt(parts[2].replace('Mi', ''), 10) || 0
      };
    }).slice(0, 10);
  } catch (e) {
    return [];
  }
}

function getKPIs() {
  const lastLatency = tsdbState.history.latencyData[tsdbState.history.latencyData.length - 1];
  return {
    activeConversations: Math.floor(Math.random() * 50) + 1200,
    messagesPerMinute: Math.floor(Math.random() * 20) + 330,
    p95Latency: `${lastLatency ? lastLatency.p95 : 128}ms`,
    errorRate: '0.04%'
  };
}

export function getDashboardMetrics(config) {
  updateSimulatedMetrics();
  
  return {
    latencyData: tsdbState.history.latencyData,
    pgData: tsdbState.history.pgData,
    redisData: tsdbState.history.redisData,
    deploys: getDeploys(config),
    alerts: getAlerts(config),
    podResourceData: getPodResources(config),
    kpis: getKPIs()
  };
}
