# Persona AI Studio

A full-stack React web application for creating, configuring, and publishing Persona AI Agents to the Verana / Hologram ecosystem.

The project now includes:

- A light-theme React dashboard for registration, bot management, and step-by-step bot creation
- An Express API with SQLite persistence, JWT authentication, file uploads, and publish / unpublish actions
- Two implemented MCP integrations: Weather Planner and Wikipedia Research
- RAG document upload support
- Kubernetes deployment bundle generation based on the Verana agent-pack pattern already present in this repository
- Docker and GitHub Actions artifacts for containerized deployment

## Screenshots

Dashboard:

![Dashboard screenshot](docs/screenshots/dashboard-light.svg)

Bot builder:

![Builder screenshot](docs/screenshots/builder-light.svg)

## Project Structure

```text
.
├── web-app/
│   ├── client/                 # React frontend
│   ├── server/                 # Express API, SQLite, MCP endpoints
│   ├── Dockerfile              # Bonus containerization
│   └── .env.example            # Global configuration template
├── docs/
│   ├── README.md               # User documentation
│   ├── technical-architecture.md
│   └── screenshots/
├── agent-pack.yaml             # Legacy example agent pack kept for reference
├── deployment.yaml             # Legacy example deployment kept for reference
└── .github/workflows/deploy.yml
```

## Features Delivered

### Web interface

- Responsive React application
- Light visual theme
- Login, register, logout
- Dashboard with bot listing and status overview
- Guided bot creation flow
- Bot detail view
- Edit, save, publish, unpublish, and delete actions

### Bot configuration

- Persona attributes: name, profession, description, photo
- Service attributes: service name, description, category
- Prompt editor for personality and behavior
- MCP server selection
- RAG document uploads

### Platform integrations

- Weather Planner MCP server
- Wikipedia Research MCP server
- Deployment bundle generation for Verana-compatible agent packs and Helm values

## Quick Start

### 1. Configure environment

```bash
cd web-app
cp .env.example .env
```

Set at least:

- `JWT_SECRET`
- `BASE_DOMAIN`
- `TEAM_NAME`
- `BACKEND_PUBLIC_URL`
- `KUBECONFIG_PATH`
- `K8S_NAMESPACE`
- `OPENAI_API_KEY`

If you only want to generate bundles without applying them to Kubernetes, keep:

```bash
ENABLE_K8S_APPLY=false
```

### 2. Install dependencies

```bash
npm install
```

### 3. Run locally

```bash
npm run dev
```

The frontend runs on `http://localhost:5173` and the API on `http://localhost:4000`.

### 4. Build for production

```bash
npm run build
npm start
```

## Publishing Flow

When a user clicks `Publish`, the backend:

1. Validates the bot configuration
2. Generates an `agent-pack.yaml`
3. Generates a `values.yaml` bundle for the Hologram generic agent chart
4. Stores both under `web-app/server/generated/<bot-slug>/`
5. Optionally runs `helm upgrade --install ...` if `ENABLE_K8S_APPLY=true`
6. Saves the public URL as `https://<slug>.<base-domain>`

## Bonus CI/CD

The workflow at [.github/workflows/deploy.yml](.github/workflows/deploy.yml) builds the web application container, pushes it to Docker Hub, and updates the Kubernetes deployment on every push to `main`.

Required GitHub secrets:

- `DOCKERHUB_USERNAME`
- `DOCKERHUB_TOKEN`
- `KUBE_CONFIG`
- `K8S_NAMESPACE`

## Documentation

- User guide: [docs/README.md](docs/README.md)
- Technical architecture: [docs/technical-architecture.md](docs/technical-architecture.md)

## Notes

- The original challenge example-agent files remain in the repository because the publish flow reuses their Verana deployment conventions as a reference.
- Google OAuth was intentionally left as an optional future extension; the required auth flow is fully implemented with email/password.
