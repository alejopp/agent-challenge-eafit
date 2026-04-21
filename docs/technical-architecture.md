# Persona AI Studio — Technical Architecture

## Stack

### Frontend

- React 18
- React Router
- Vite
- Custom CSS light theme

### Backend

- Express
- SQLite via `better-sqlite3`
- JWT auth
- Multer uploads
- YAML generation for deployment bundles

## Architecture overview

```text
React client
  -> auth, dashboard, wizard, bot detail
  -> calls /api/*

Express API
  -> auth routes
  -> bot CRUD routes
  -> upload route
  -> platform config route
  -> MCP endpoints
  -> deployment bundle generator

SQLite
  -> users
  -> bots

Generated output
  -> agent-pack.yaml
  -> values.yaml
  -> metadata.json
  -> publish.sh

Optional cluster execution
  -> helm upgrade --install
```

## Data model

### `users`

- `id`
- `name`
- `email`
- `password_hash`
- `created_at`

### `bots`

- `id`
- `user_id`
- `slug`
- `name`
- `status`
- `profession`
- `persona_description`
- `persona_photo_url`
- `service_name`
- `service_description`
- `service_category`
- `prompt`
- `mcp_servers_json`
- `rag_documents_json`
- `public_url`
- `generated_bundle_path`
- `published_at`
- `created_at`
- `updated_at`

## API summary

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Bots

- `GET /api/dashboard`
- `POST /api/bots`
- `GET /api/bots/:botId`
- `PUT /api/bots/:botId`
- `DELETE /api/bots/:botId`
- `POST /api/bots/:botId/publish`
- `POST /api/bots/:botId/unpublish`

### Platform

- `GET /api/platform/config`
- `POST /api/uploads`

### MCP endpoints

- `POST /mcp/weather`
- `POST /mcp/wikipedia`

## Implemented MCP integrations

### 1. Weather Planner

Location: `web-app/server/src/mcp/weatherMcp.js`

Tools exposed:

- `lookup_weather`
- `plan_outdoor_visit`

Provider used:

- Open-Meteo geocoding API
- Open-Meteo forecast API

### 2. Wikipedia Research

Location: `web-app/server/src/mcp/wikipediaMcp.js`

Tools exposed:

- `search_wikipedia`
- `read_wikipedia_summary`

Provider used:

- Wikipedia search API
- Wikipedia REST summary endpoint

## Deployment design

The application does not hardcode one static bot deployment. Instead, when a user publishes a bot it creates a deployment bundle under:

```text
web-app/server/generated/<slug>/
```

That bundle includes:

- `agent-pack.yaml`
- `values.yaml`
- `metadata.json`
- `publish.sh`

The generated files follow the conventions already present in the repository's earlier Verana example-agent assets.

## Global configuration

The environment file supports:

- Kubernetes credentials path
- base domain
- backend public URL
- namespace
- chart version
- LLM model settings
- credential definition id
- Verana organization URL

See [web-app/.env.example](../web-app/.env.example) for the full list.

## Tradeoffs

- Email/password auth was chosen over OAuth for a fully working baseline with fewer external secrets.
- SQLite keeps local setup simple and matches the challenge's suggested persistence options.
- MCP endpoints are hosted inside the backend to reduce operational overhead and make the platform self-contained.
- Publishing defaults to bundle generation first, with actual Helm execution gated behind `ENABLE_K8S_APPLY=true`.
