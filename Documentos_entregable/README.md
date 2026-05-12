# NextAgent — Plataforma de Creación y Despliegue de Agentes de IA Verificables

> **Verana Foundation × NODO EAFIT — Beca IA Ser ANDI**
> Reto IA Generativa: Agentes IA Verificables con Hologram

---

## 👥 Integrantes

| Nombre | Rol |
|---|---|
| **Oscar David Rojas Bedoya** | Desarrollo full-stack, infraestructura Kubernetes |
| **Yesid Alejandro Peláez Posada** | Desarrollo full-stack, integración Verana/Hologram |

---

## 📋 Descripción del Problema

Los chatbots y agentes de IA actuales operan en plataformas **centralizadas y sin mecanismos de confianza verificable**. Esto genera tres problemas fundamentales:

1. **Identidad no verificable**: no hay forma de saber quién opera un bot, qué políticas sigue ni si es legítimo. Cualquiera puede crear un agente que se haga pasar por una empresa o persona real.
2. **Confianza ciega del usuario**: las personas interactúan con bots sin poder confirmar su autenticidad, exponiéndose a desinformación, fraude o suplantación de identidad.
3. **Barreras técnicas de despliegue**: crear y publicar un agente de IA con identidad descentralizada requiere conocimientos avanzados en infraestructura (Docker, Kubernetes, protocolos DIDComm, credenciales W3C), inaccesibles para usuarios no técnicos.

El reto del ecosistema **Verana/Hologram** exige integrar agentes de IA en una red de confianza descentralizada basada en **DIDs (Decentralized Identifiers)** y **Credenciales Verificables (W3C)**, lo cual implica un proceso especializado de credencialización y despliegue automatizado.

---

## 🎯 Objetivo General de la Solución

Desarrollar **NextAgent**, una plataforma web que permita a **cualquier persona — sin conocimientos técnicos** — crear, configurar y publicar su propio **Persona AI Agent** verificable, accesible desde la app Hologram, automatizando completamente el proceso de despliegue en Kubernetes y la emisión de credenciales criptográficas de identidad a través de la red Verana.

### Objetivos Específicos

- Proveer una interfaz visual intuitiva para definir la personalidad, conocimiento y servicios de un agente de IA.
- Automatizar el despliegue del agente como **VS Agent** en Kubernetes mediante Helm con un solo clic.
- Emitir automáticamente una **credencial de servicio verificable** (firmada por EAFIT) al agente desplegado.
- Generar un **QR de conexión** que permita a usuarios finales conectarse al agente desde Hologram.
- Integrar capacidades externas mediante servidores **MCP** (clima, Wikipedia) para enriquecer las respuestas del agente.

---

## 🛠️ Tecnologías Utilizadas

### Frontend
- **React 18** + **Vite** — interfaz de usuario reactiva y responsiva
- **React Router v6** — navegación SPA
- **CSS personalizado** — diseño con tema oscuro inspirado en el brief del reto

### Backend
- **Node.js 20** + **Express.js** — API REST
- **Passport.js** — autenticación local + Google OAuth 2.0
- **JWT** — manejo de sesiones sin estado
- **Multer** — carga de imágenes de perfil y documentos RAG

### Infraestructura
- **Kubernetes** (namespace `team-g`) — orquestación de contenedores
- **Helm 3** — empaquetado y despliegue declarativo de agentes
- **Docker** + **Docker Hub** — construcción y distribución de imágenes
- **GitHub Actions** — pipeline CI/CD automatizado (build → push → deploy)

### Red Verana / Hologram
- **VS Agent** (`veranalabs/vs-agent`) — agente de identidad DIDComm
- **DID (Decentralized Identifiers)** — identidad verificable por agente
- **DIDComm / WebSocket Secure (WSS)** — protocolo de comunicación P2P cifrado
- **Credenciales Verificables (VC)** — credencial de servicio emitida por EAFIT vía Verana

### Integraciones MCP (Model Context Protocol)
- **Open-Meteo API** — datos meteorológicos en tiempo real
- **Wikimedia API** — búsqueda y resúmenes de Wikipedia

### Infraestructura Compartida (Cluster EAFIT)
- **PostgreSQL** — base de datos con schema dedicado por bot
- **Redis** — memoria conversacional y almacenamiento vectorial
- **OpenAI API (GPT-4o-mini)** — modelo de lenguaje generativo

---

## 🏗️ Arquitectura General

```
┌──────────────────────────────────────────────────────────────┐
│                      Usuario Final                            │
│               (App Hologram / Navegador Web)                  │
└─────────────────────────┬────────────────────────────────────┘
                          │ Escanea QR de conexión
                          ▼
┌──────────────────────────────────────────────────────────────┐
│               Red Verana / Hologram                           │
│     DIDComm over WSS — identidad verificable criptográf.      │
└─────────────────────────┬────────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────────┐
│           Kubernetes — namespace: team-g (EAFIT)              │
│                                                               │
│  ┌──────────────────┐    ┌───────────────────────────────┐   │
│  │  NextAgent App   │    │  VS Agent por Bot             │   │
│  │  (persona-ai-    │    │  persona-<slug>-0             │   │
│  │   creator)       │    │  :3000 admin / :3011 público  │   │
│  │                  │    └───────────────┬───────────────┘   │
│  │  React + Vite    │                    │                    │
│  │  Express API     │    ┌───────────────▼───────────────┐   │
│  │  Puerto 4000     │    │  Bot Chatbot                   │   │
│  └────────┬─────────┘    │  persona-<slug>-chatbot-0     │   │
│           │              └───────────────────────────────┘   │
│           │                                                   │
│  ┌────────▼──────────────────────────────────────────────┐   │
│  │            Infraestructura Compartida                  │   │
│  │     PostgreSQL  |  Redis  |  OpenAI API               │   │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
                          ▲
                          │ CI/CD automático
┌─────────────────────────┴────────────────────────────────────┐
│                   GitHub Actions                              │
│    Build Docker → Push Hub → Helm upgrade → Credencial VC    │
└──────────────────────────────────────────────────────────────┘
```

---

## 🔄 Flujo de Funcionamiento

```
1. REGISTRO / LOGIN
   └─ El usuario crea cuenta con email/contraseña o Google OAuth

2. CREACIÓN DEL AGENTE
   └─ Define: nombre, profesión, descripción, foto de perfil,
              prompt del sistema, documentos RAG, servicios MCP

3. PUBLICACIÓN (un clic en "Publicar")
   ├─ Backend genera Helm values + agent-pack.yaml
   ├─ Crea schema dedicado en PostgreSQL compartido
   ├─ Ejecuta helm upgrade --install → despliega VS Agent en K8s
   ├─ Sondea /v1/agent hasta que el agente esté listo
   └─ Emite credencial de servicio verificable (EAFIT → Agente)

4. CONEXIÓN DEL USUARIO FINAL
   ├─ La plataforma muestra QR con URL de conexión
   ├─ Usuario final escanea con app Hologram
   └─ Conexión DIDComm cifrada establecida

5. CONVERSACIÓN VERIFICADA
   └─ El agente responde usando el prompt configurado,
      consulta datos externos vía MCP (clima / Wikipedia),
      y mantiene memoria conversacional en Redis
```

---

## 🚀 Cómo Ejecutar el Proyecto

### Requisitos Previos

- Node.js 18+
- npm 9+
- *(Opcional para publicación real)* Docker, kubectl, Helm 3

### Ejecución Local — Modo Desarrollo

```bash
# 1. Clonar el repositorio
git clone https://github.com/alejopp/agent-challenge-eafit.git
cd agent-challenge-eafit/web-app

# 2. Copiar archivo de entorno
cp .env.example .env

# 3. Instalar dependencias
npm install

# 4. Iniciar frontend y backend
npm run dev
```

Acceder en:
- **Frontend:** `http://localhost:5173`
- **Backend API:** `http://localhost:4000`

### Variables de Entorno Clave (`.env`)

```env
# Servidor
APP_URL=http://localhost:4000
CLIENT_DEV_URL=http://localhost:5173
JWT_SECRET=tu-secreto-jwt

# Google OAuth (opcional)
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# OpenAI
OPENAI_API_KEY=...

# Kubernetes (para publicación real de agentes)
ENABLE_HELM_DEPLOY=true
KUBECONFIG_PATH=./secrets/team-g-kubeconfig.yaml
K8S_NAMESPACE=team-g
BASE_AGENT_DOMAIN=agents.team-g.teams.eafit.testnet.verana.network
```

### Despliegue en Producción (GitHub Actions)

El pipeline se activa automáticamente con cada `push` a `main`. Requiere los siguientes secrets configurados en el repositorio de GitHub:

| Secret | Descripción |
|---|---|
| `DOCKERHUB_USERNAME` | Usuario Docker Hub |
| `DOCKERHUB_TOKEN` | Token Docker Hub |
| `OVH_KUBECONFIG` | Kubeconfig del cluster (base64) |
| `APP_JWT_SECRET` | Secreto para JWT |
| `SHARED_POSTGRES_PASSWORD` | Contraseña PostgreSQL compartido |
| `GOOGLE_CLIENT_ID` | ID cliente Google OAuth |
| `GOOGLE_CLIENT_SECRET` | Secreto Google OAuth |
| `EXAMPLE_AGENT_OPENAI_API_KEY` | Clave OpenAI |
| `EXAMPLE_AGENT_WALLET_KEY` | Clave wallet del agente Verana |

---

## 📊 Estado Actual del Desarrollo

| Funcionalidad | Estado |
|---|---|
| Registro y login (local + Google OAuth) | ✅ Funcional |
| CRUD de bots con imagen y documentos RAG | ✅ Funcional |
| Publicación automática en Kubernetes vía Helm | ✅ Funcional |
| Emisión de credencial de servicio verificable | ✅ Funcional |
| QR de conexión visible en la plataforma | ✅ Funcional |
| Integración MCP — Clima (Open-Meteo) | ✅ Funcional |
| Integración MCP — Wikipedia (Wikimedia) | ✅ Funcional |
| Conexión desde app Hologram (QR del VS Agent) | ✅ Funcional |
| QR de invitación OOB directo desde la plataforma | 🔄 En ajuste |
| CI/CD con limpieza automática de lock Helm | ✅ Funcional |

---

## ⚠️ Limitaciones Conocidas

- **QR de invitación OOB**: el QR en la plataforma actualmente redirige a la página pública del VS Agent. La conexión directa en un único escaneo desde Hologram está en proceso de ajuste (pendiente identificar el endpoint correcto de `/oob/create-invitation` del VS Agent).
- **Almacenamiento de datos**: el store de bots usa un archivo JSON. No está preparado para alta concurrencia ni múltiples instancias del backend.
- **Namespace único**: todos los agentes comparten el namespace `team-g` del cluster académico, con recursos de red y cómputo compartidos.
- **TLS en testnet**: el cluster usa certificados autofirmados. El backend desactiva la verificación SSL interna (`NODE_TLS_REJECT_UNAUTHORIZED=0`).
- **Tiempo de publicación**: el despliegue de un agente tarda entre 3 y 7 minutos por los tiempos de inicialización del VS Agent y el proceso de credencialización.

---

## 🔮 Posibles Mejoras Futuras

- **QR OOB directo**: generar QR de conexión directa con Hologram sin página intermedia.
- **Base de datos relacional**: migrar a PostgreSQL o SQLite para mayor robustez multiusuario.
- **Multi-organización**: soporte para que distintas organizaciones usen la plataforma con sus propias credenciales Verana.
- **Panel de métricas**: estadísticas de conversaciones, uso de MCP, tiempo de respuesta y estado de salud por agente.
- **Más integraciones MCP**: calendario, CRM, bases de conocimiento propietarias, APIs REST personalizadas.
- **RAG mejorado**: motor de búsqueda vectorial (pgvector, ChromaDB) para contexto más preciso.
- **Escalabilidad**: réplicas múltiples por bot y balanceo de carga en conexiones DIDComm.
- **App móvil**: interfaz complementaria para gestión de agentes desde dispositivos móviles.

---

## 📁 Estructura del Repositorio

```
agent-challenge-eafit/
├── .github/workflows/
│   └── deploy.yml               # CI/CD pipeline completo
├── web-app/
│   ├── client/src/              # Frontend React
│   │   ├── pages/               # AuthPage, Dashboard, BotDetailPage
│   │   ├── components/          # BotForm, PublishingOverlay, etc.
│   │   └── lib/api.js           # Cliente HTTP hacia el backend
│   ├── server/
│   │   ├── index.js             # Entrada del servidor Express
│   │   ├── config.js            # Variables de entorno
│   │   ├── routes/
│   │   │   ├── bots.js          # CRUD bots + endpoint /invitation
│   │   │   └── auth.js          # Login, registro, OAuth
│   │   └── services/
│   │       └── deployment.js    # Helm deploy + credencial Verana
│   └── helm/persona-ai-creator/ # Helm chart de la plataforma
├── common/common.sh             # Scripts bash compartidos
└── agent-pack.yaml              # Pack de configuración del agente
```

### Estructura de Entrega

```
Proyecto_Final_EquipoG/
├── 01_Repositorio/     → Código fuente (fork en GitHub)
├── 02_Documentacion/   → Informe, manuales, bitácora, evidencias IA
├── 03_Presentacion/    → Slides del pitch
├── 04_Demo/            → Video demo de la plataforma
├── 05_Datasets/        → Documentos RAG utilizados
├── 06_Evidencias/      → Screenshots y registros de ejecución
└── README.md           → Este archivo
```

---

## 🌐 URLs de Producción

- **Plataforma NextAgent:** `https://persona-ai.team-g.teams.eafit.testnet.verana.network`
- **Ejemplo — Agente Alice (Hologram):** `https://alice.agents.team-g.teams.eafit.testnet.verana.network`

---

## 📚 Recursos del Reto

- [Repositorio base del challenge](https://github.com/verana-labs/eafit-challenge)
- [Documentación Verana](https://verana.io)
- [App Hologram](https://hologram.zone)
- [Discord soporte — #eafit-challenges](https://discord.com/invite/edjaFn252q)
