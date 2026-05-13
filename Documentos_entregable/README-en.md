# NextAgent — Platform for Creating and Deploying Verifiable AI Agents

> **Verana Foundation × NODO EAFIT — Beca IA Ser ANDI**
> Generative AI Challenge: Verifiable AI Agents with Hologram

---

## 👥 Team Members

| Name | Role |
|---|---|
| **Oscar David Rojas Bedoya** | Full-stack development, Kubernetes infrastructure | Verana/Hologram integration |
| **Yesid Alejandro Peláez Posada** | Full-stack development, Verana/Hologram integration| Kubernetes infrastructure |

---

## 📋 Problem Description

Current AI chatbots and agents operate on **centralized platforms with no verifiable trust mechanisms**. This creates three fundamental problems:

1. **Unverifiable identity**: there is no way to know who operates a bot, what policies it follows, or whether it is legitimate. Anyone can create an agent that impersonates a real company or person.
2. **Blind user trust**: people interact with bots without being able to confirm their authenticity, exposing themselves to misinformation, fraud, or identity spoofing.
3. **Technical deployment barriers**: creating and publishing an AI agent with decentralized identity requires advanced infrastructure knowledge (Docker, Kubernetes, DIDComm protocols, W3C credentials) that is inaccessible to non-technical users.

The **Verana/Hologram** ecosystem challenge requires integrating AI agents into a decentralized trust network based on **DIDs (Decentralized Identifiers)** and **Verifiable Credentials (W3C)**, which involves a specialized credentialing and automated deployment process.

---

## 🎯 General Objective

Develop **NextAgent**, a web platform that enables **anyone — without technical knowledge** — to create, configure, and publish their own verifiable **Persona AI Agent**, accessible from the Hologram app, fully automating the Kubernetes deployment process and the issuance of cryptographic identity credentials through the Verana network.

### Specific Objectives

- Provide an intuitive visual interface to define an AI agent's personality, knowledge, and services.
- Automate agent deployment as a **VS Agent** on Kubernetes via Helm with a single click.
- Automatically issue a **verifiable service credential** (signed by EAFIT) to the deployed agent.
- Generate a **connection QR code** that allows end users to connect to the agent from Hologram.
- Integrate external capabilities through **MCP** servers (weather, Wikipedia, calendar) to enrich agent responses.

---

## 🛠️ Technologies Used

### Frontend
- **React 18** + **Vite** — reactive and responsive user interface
- **React Router v6** — SPA navigation
- **Custom CSS** — dark-themed design inspired by the challenge brief

### Backend
- **Node.js 20** + **Express.js** — REST API
- **Passport.js** — local authentication + Google OAuth 2.0
- **JWT** — stateless session management
- **Multer** — profile image and RAG document uploads

### Infrastructure
- **Kubernetes** (namespace `team-g`) — container orchestration
- **Helm 3** — declarative agent packaging and deployment
- **Docker** + **Docker Hub** — image building and distribution
- **GitHub Actions** — automated CI/CD pipeline (build → push → deploy)

### Verana / Hologram Network
- **VS Agent** (`veranalabs/vs-agent`) — DIDComm identity agent
- **DID (Decentralized Identifiers)** — verifiable identity per agent
- **DIDComm / WebSocket Secure (WSS)** — encrypted P2P communication protocol
- **Verifiable Credentials (VC)** — service credential issued by EAFIT via Verana

### MCP Integrations (Model Context Protocol)
- **Open-Meteo API** — real-time weather data
- **Wikimedia API** — Wikipedia search and summaries
- **Google Calendar API** — calendar management *(in progress)*

### Shared Infrastructure (EAFIT Cluster)
- **PostgreSQL** — database with dedicated schema per bot
- **Redis** — conversational memory and vector storage
- **OpenAI API (GPT-4o-mini)** — generative language model

---

## 🏗️ General Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                       End User                                │
│               (Hologram App / Web Browser)                    │
└─────────────────────────┬────────────────────────────────────┘
                          │ Scans connection QR
                          ▼
┌──────────────────────────────────────────────────────────────┐
│               Verana / Hologram Network                       │
│     DIDComm over WSS — cryptographic verifiable identity      │
└─────────────────────────┬────────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────────┐
│           Kubernetes — namespace: team-g (EAFIT)             │
│                                                              │
│  ┌──────────────────┐    ┌───────────────────────────────┐   │
│  │  NextAgent App   │    │  VS Agent per Bot             │   │
│  │  (persona-ai-    │    │  persona-<slug>-0             │   │
│  │   creator)       │    │  :3000 admin / :3011 public   │   │
│  │                  │    └───────────────┬───────────────┘   │
│  │  React + Vite    │                    │                   │
│  │  Express API     │    ┌───────────────▼───────────────┐   │
│  │  Port 4000       │    │  Bot Chatbot                  │   │
│  └────────┬─────────┘    │  persona-<slug>-chatbot-0     │   │
│           │              └───────────────────────────────┘   │
│           │                                                  │
│  ┌────────▼──────────────────────────────────────────────┐   │
│  │              Shared Infrastructure                    │   │
│  │     PostgreSQL  |  Redis  |  OpenAI API               │   │
│  └───────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
                          ▲
                          │ Automated CI/CD
┌─────────────────────────┴────────────────────────────────────┐
│                   GitHub Actions                             │
│    Build Docker → Push Hub → Helm upgrade → VC Credential    │
└──────────────────────────────────────────────────────────────┘
```

---

## 🔄 How It Works

```
1. REGISTRATION / LOGIN
   └─ User creates account with email/password or Google OAuth

2. AGENT CREATION
   └─ Defines: name, profession, description, profile picture,
               system prompt, RAG documents, MCP services

3. PUBLISHING (one click on "Publish")
   ├─ Backend generates Helm values + agent-pack.yaml
   ├─ Creates dedicated schema in shared PostgreSQL
   ├─ Runs helm upgrade --install → deploys VS Agent in K8s
   ├─ Polls /v1/agent until agent is ready
   └─ Issues verifiable service credential (EAFIT → Agent)

4. END USER CONNECTION
   ├─ Platform displays QR with connection URL
   ├─ End user scans with Hologram app
   └─ Encrypted DIDComm connection established

5. VERIFIED CONVERSATION
   └─ Agent responds using configured prompt,
      queries external data via MCP (weather / Wikipedia),
      and maintains conversational memory in Redis
```

---

## 🚀 How to Run the Project

### Prerequisites

- Node.js 18+
- npm 9+
- *(Optional for real publishing)* Docker, kubectl, Helm 3

### Local Execution — Development Mode

```bash
# 1. Clone the repository
git clone https://github.com/alejopp/agent-challenge-eafit.git
cd agent-challenge-eafit/web-app

# 2. Copy environment file
cp .env.example .env

# 3. Install dependencies
npm install

# 4. Start frontend and backend
npm run dev
```

Access at:
- **Frontend:** `http://localhost:5173`
- **Backend API:** `http://localhost:4000`

### Key Environment Variables (`.env`)

```env
# Server
APP_URL=http://localhost:4000
CLIENT_DEV_URL=http://localhost:5173
JWT_SECRET=your-jwt-secret

# Google OAuth (optional)
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# OpenAI
OPENAI_API_KEY=...

# Kubernetes (for real agent publishing)
ENABLE_HELM_DEPLOY=true
KUBECONFIG_PATH=./secrets/team-g-kubeconfig.yaml
K8S_NAMESPACE=team-g
BASE_AGENT_DOMAIN=agents.team-g.teams.eafit.testnet.verana.network
```

### Production Deployment (GitHub Actions)

The pipeline triggers automatically on every `push` to `main`. Requires the following secrets configured in the GitHub repository:

| Secret | Description |
|---|---|
| `DOCKERHUB_USERNAME` | Docker Hub username |
| `DOCKERHUB_TOKEN` | Docker Hub token |
| `OVH_KUBECONFIG` | Cluster kubeconfig (base64) |
| `APP_JWT_SECRET` | JWT secret |
| `SHARED_POSTGRES_PASSWORD` | Shared PostgreSQL password |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `EXAMPLE_AGENT_OPENAI_API_KEY` | OpenAI API key |
| `EXAMPLE_AGENT_WALLET_KEY` | Verana agent wallet key |

---

## 📊 Current Development Status

| Feature | Status |
|---|---|
| Registration and login (local + Google OAuth) | ✅ Working |
| Bot CRUD with image and RAG documents | ✅ Working |
| Automatic Kubernetes publishing via Helm | ✅ Working |
| Verifiable service credential issuance | ✅ Working |
| Connection QR code visible on the platform | ✅ Working |
| MCP Integration — Weather (Open-Meteo) | ✅ Working |
| MCP Integration — Wikipedia (Wikimedia) | ✅ Working |
| MCP Integration — Calendar (Google Calendar) | 🔄 In progress |
| Connection from Hologram app (VS Agent QR) | ✅ Working |
| Direct OOB invitation QR from the platform | 🔄 In progress |
| CI/CD with automatic Helm lock cleanup | ✅ Working |

---

## ⚠️ Known Limitations

- **OOB invitation QR**: the QR on the platform currently redirects to the VS Agent's public page. Direct single-scan connection from Hologram is being adjusted (pending identification of the correct `/oob/create-invitation` endpoint on the VS Agent).
- **Data storage**: the bot store uses a JSON file. Not ready for high concurrency or multiple backend instances.
- **Single namespace**: all agents share the `team-g` namespace on the academic cluster, with shared network and compute resources.
- **TLS on testnet**: the cluster uses self-signed certificates. The backend disables internal SSL verification (`NODE_TLS_REJECT_UNAUTHORIZED=0`).
- **Publishing time**: deploying a new agent takes 3–7 minutes due to VS Agent initialization and the credentialing process.

---

## 🔮 Possible Future Improvements

- **Direct OOB QR**: generate a direct Hologram connection QR without an intermediate page.
- **Relational database**: migrate from JSON file store to PostgreSQL or SQLite for multi-user robustness.
- **Multi-organization support**: allow different organizations to use the platform with their own Verana credentials.
- **Metrics dashboard**: conversation statistics, MCP usage, response time, and agent health status.
- **More MCP integrations**: CRM, proprietary knowledge bases, custom REST APIs.
- **Enhanced RAG**: vector search engine (pgvector, ChromaDB) for more accurate context retrieval.
- **Agent scalability**: multiple replicas per bot and load balancing for DIDComm connections.
- **Mobile app**: companion interface for managing agents from mobile devices.

---

## 📁 Repository Structure

```
agent-challenge-eafit/
├── .github/workflows/
│   └── deploy.yml               # Full CI/CD pipeline
├── web-app/
│   ├── client/src/              # React frontend
│   │   ├── pages/               # AuthPage, Dashboard, BotDetailPage
│   │   ├── components/          # BotForm, PublishingOverlay, etc.
│   │   └── lib/api.js           # HTTP client for the backend
│   ├── server/
│   │   ├── index.js             # Express server entry point
│   │   ├── config.js            # Environment variables
│   │   ├── routes/
│   │   │   ├── bots.js          # Bot CRUD + /invitation endpoint
│   │   │   └── auth.js          # Login, registration, OAuth
│   │   └── services/
│   │       └── deployment.js    # Helm deploy + Verana credential
│   └── helm/persona-ai-creator/ # Platform Helm chart
├── common/common.sh             # Shared bash scripts
└── agent-pack.yaml              # Agent configuration pack
```

### Delivery Structure

```
Proyecto_Final_EquipoG/
├── 01_Repositorio/     → Source code (fork on GitHub)
├── 02_Documentacion/   → Final report, manuals, log, AI evidence
├── 03_Presentacion/    → Pitch slides
├── 04_Demo/            → Platform demo video
├── 05_Datasets/        → RAG documents used
├── 06_Evidencias/      → Screenshots and execution records
└── README.md           → This file
```

---

## 🌐 Production URLs

- **NextAgent Platform:** `https://persona-ai.team-g.teams.eafit.testnet.verana.network`
- **Example — Agent Alice (Hologram):** `https://alice.agents.team-g.teams.eafit.testnet.verana.network`

---

## 📚 Challenge Resources

- [Challenge base repository](https://github.com/verana-labs/eafit-challenge)
- [Verana documentation](https://verana.io)
- [Hologram app](https://hologram.zone)
- [Support Discord — #eafit-challenges](https://discord.com/invite/edjaFn252q)
