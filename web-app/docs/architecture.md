# Architecture

```mermaid
flowchart LR
  user["User"] --> web["React UI"]
  web --> api["Express API"]
  api --> store["JSON persistence / uploads"]
  api --> mcp["Shared MCP endpoints"]
  api --> helm["Helm release generator"]
  api --> schema["Schema bootstrap per bot"]
  api --> k8s["Kubernetes namespace team-g"]
  shared["Shared platform services"] --> ollama["One Ollama service"]
  shared --> redis["One Redis service"]
  shared --> postgres["One Postgres service"]
  k8s --> shared
  k8s --> bots["Persona Agent pods"]
  bots --> ollama
  bots --> redis
  bots --> postgres
```

## Notes

- The platform runs as a single web application deployed in the academic namespace `team-g`.
- Bot publishing is generated from the UI and executed with Helm using shared infra services.
- Each bot should use a dedicated schema inside the shared Postgres instance, not a dedicated Postgres server.
- Chatbot pods talk to Ollama through its OpenAI-compatible `/v1` endpoint, so no real OpenAI account is required.
- Generated per-bot assets are written to `web-app/generated/<slug>/`.
