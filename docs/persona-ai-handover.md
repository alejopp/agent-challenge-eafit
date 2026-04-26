# Persona AI Handover

Este archivo aterriza en este workspace el contexto importado del chat `Implementa agentes Persona AI`.

## Estado de la migracion a este proyecto

El contexto conversacional ya fue copiado a este repo, pero el estado del codigo no coincide por completo con lo descrito en el chat original.

Hallazgos verificados en este workspace:

- El repo raiz sigue teniendo como base el proyecto `EAFIT Challenge - Example Agent`.
- `web-app/` existe como carpeta no versionada, pero actualmente contiene sobre todo artefactos generados, `dist/`, datos locales y secretos.
- No estan presentes en este workspace los archivos fuente que el chat original daba por existentes, por ejemplo:
  - `web-app/server/services/deployment.js`
  - `web-app/helm/persona-ai-creator/templates/shared-services.yaml`
  - `web-app/client/src/...`
- Si queremos continuar exactamente donde quedo el otro proyecto, todavia falta traer o reconstruir aqui esos archivos fuente.

## Objetivo actual

Implementar y dejar operativa una plataforma web `Persona AI Agent Creator` para el reto Verana-EAFIT, basada en `challenge-agent-eafit`, con estas metas:

- Web app full-stack para registro/login, CRUD de bots, configuracion de persona/servicio/prompt/MCP/RAG.
- Publicacion de bots a Kubernetes en `team-g`.
- Arquitectura academica con un solo ambiente y servicios compartidos:
  - un Postgres
  - un Redis
  - un Ollama
- Cada bot debe usar:
  - schema propio en Postgres compartido
  - Redis compartido
  - Ollama compartido
- MCPs funcionales minimos:
  - Weather
  - Wikipedia
- Despliegue de la plataforma por Helm + GitHub Actions.

## Estado del trabajo reportado por el chat anterior

La app web ya existia y funcionaba localmente para:

- registro
- login
- logout
- crear bot
- editar bot
- guardar bot
- listar bots
- publicar/despublicar en logica de backend
- subir foto/documentos
- MCP demo endpoints

Estado por area:

- Frontend local: funcional.
- Backend local: funcional.
- Build: `npm run build` pasa.
- Publish local dry-run: funciono.
- Publish real anterior: se probo con `persona-sofia-jardin`, pero fallo por configuracion vieja del chart/runtime.
- Refactor de arquitectura compartida: ya aplicado en codigo.
- Chart Helm de la plataforma: extendido para desplegar servicios compartidos `postgres`, `redis-master`, `ollama`.
- Namespace `team-g`: quedo limpiado de workloads viejos.
- No se habia hecho aun redeploy final de `persona-ai-creator` con el chart nuevo ni una nueva publicacion limpia de bot sobre esa base.

Estado final del namespace tras la limpieza:

- sin pods
- sin deployments
- sin statefulsets
- sin PVCs
- quedaron solo:
  - `configmap/kube-root-ca.crt`
  - `secret/team-g-token`
  - algunos secretos TLS del namespace

## Decisiones tomadas

- Stack: React + Vite en frontend, Express/Node en backend.
- La plataforma administrativa mantuvo persistencia local simple en archivo tipo SQLite-like; no Postgres aun.
- Para bots publicados se abandono el enfoque `Postgres/Redis por bot`.
- Se migro a infraestructura compartida.
- Se implemento schema por bot en Postgres compartido.
- Se decidio usar Ollama como LLM real.
- El chatbot desplegado parece esperar API OpenAI-compatible, por lo que:
  - `LLM_PROVIDER=openai`
  - `OPENAI_BASE_URL` apunta a Ollama
  - `OPENAI_MODEL` usa el modelo de Ollama
  - `OPENAI_API_KEY` se setea con placeholder no real
- Esto se hizo porque el runtime del chatbot fallaba exigiendo `OPENAI_API_KEY`, aunque el backend real sea Ollama.
- El chart `persona-ai-creator` fue extendido para desplegar:
  - `postgres`
  - `redis-master`
  - `ollama`
- Se agrego al contenedor de la plataforma:
  - `helm`
  - `kubectl`
  - `psql`
- Se conservo un unico namespace academico `team-g`.

## Archivos mencionados por el chat anterior

Archivos principales del proyecto web:

- `web-app/package.json`
- `web-app/.env`
- `web-app/.env.example`
- `web-app/Dockerfile`

Backend:

- `web-app/server/index.js`
- `web-app/server/config.js`
- `web-app/server/routes/auth.js`
- `web-app/server/routes/bots.js`
- `web-app/server/routes/meta.js`
- `web-app/server/services/deployment.js`

Frontend:

- `web-app/client/src/App.jsx`
- `web-app/client/src/lib/api.js`
- `web-app/client/vite.config.js`

Helm de la plataforma:

- `web-app/helm/persona-ai-creator/Chart.yaml`
- `web-app/helm/persona-ai-creator/values.yaml`
- `web-app/helm/persona-ai-creator/templates/configmap.yaml`
- `web-app/helm/persona-ai-creator/templates/deployment.yaml`
- `web-app/helm/persona-ai-creator/templates/secret.yaml`
- `web-app/helm/persona-ai-creator/templates/service.yaml`
- `web-app/helm/persona-ai-creator/templates/pvc.yaml`
- `web-app/helm/persona-ai-creator/templates/ingress.yaml`
- `web-app/helm/persona-ai-creator/templates/shared-services.yaml`

Documentacion:

- `README.md`
- `web-app/docs/architecture.md`

CI/CD:

- `.github/workflows/deploy.yml`
- `.github/workflows/example-agent.yml`

Artefactos generados:

- `web-app/generated/sofia-jardin/values.generated.yaml`
- `web-app/generated/sofia-jardin/agent-pack.yaml`
- `web-app/generated/pikchu/...`
- `web-app/generated/laura-persona/...`

## Comandos importantes ejecutados en el otro proyecto

Build y verificacion:

```bash
cd web-app
npm install
npm run dev
npm run build
```

Validacion de endpoints:

```bash
curl -s http://127.0.0.1:4000/api/health
curl -s http://127.0.0.1:4000/api/meta/config
curl -s http://127.0.0.1:4000/api/mcp/weather/demo?location=Medellin
curl -s http://127.0.0.1:4000/api/mcp/wikipedia/demo?q=Verana
```

Inspeccion y logs del cluster:

```bash
KUBECONFIG=web-app/secrets/team-g-kubeconfig.yaml kubectl get pods -n team-g
KUBECONFIG=web-app/secrets/team-g-kubeconfig.yaml kubectl get svc -n team-g
KUBECONFIG=web-app/secrets/team-g-kubeconfig.yaml kubectl get deploy,statefulset,secret,configmap -n team-g
KUBECONFIG=web-app/secrets/team-g-kubeconfig.yaml helm list -n team-g
KUBECONFIG=web-app/secrets/team-g-kubeconfig.yaml kubectl logs persona-sofia-jardin-0 -n team-g --previous --tail=100
KUBECONFIG=web-app/secrets/team-g-kubeconfig.yaml kubectl logs persona-sofia-jardin-chatbot-0 -n team-g --previous --tail=100
```

Render Helm:

```bash
helm template persona-ai-creator ./web-app/helm/persona-ai-creator
```

## Errores o bloqueos encontrados

Errores funcionales ya corregidos segun el chat anterior:

- Registro fallaba con `"name" is required`.
- Frontend mostraba `Unexpected token 'T', "Too many r"... is not valid JSON`.
- Registro pegaba a otro servicio local por proxy Vite y devolvia `Too many requests, please try again later.`

Causas tecnicas de despliegue real anteriores:

- `vs-agent` fallaba con `password authentication failed for user "example-db-user"`.
- `chatbot` fallaba con `Environment variable OPENAI_API_KEY is required.`

Hallazgos importantes:

- El release vivo de `sofia-jardin` seguia usando valores viejos en `web-app/generated/sofia-jardin/values.generated.yaml`.
- En este workspace actual ese archivo sigue mostrando configuracion por bot, por ejemplo:
  - `redis.enabled: true`
  - `postgres.enabled: true`
  - `REDIS_URL` apuntando a `persona-sofia-jardin-redis`
  - `POSTGRES_HOST` apuntando a `persona-sofia-jardin-postgres`
- El contenedor original de la plataforma no traia `helm`, `kubectl`, `psql`.
- En salidas locales aparecia `Unable to locate a Java Runtime.` como ruido del entorno.

Bloqueo actual real heredado del otro chat:

- Falta hacer el redeploy final del chart nuevo de `persona-ai-creator` con secretos validos.
- Falta luego publicar un bot nuevo para validar end-to-end sobre la nueva infraestructura compartida.

## Suposiciones y contexto relevante

- Namespace unico academico: `team-g`
- Un solo ambiente.
- No hay API de OpenAI; debe usarse Ollama.
- Kubeconfig local usado: `web-app/secrets/team-g-kubeconfig.yaml`
- El usuario esta dispuesto a proporcionar secretos faltantes.

Variables relevantes reportadas:

```env
LLM_PROVIDER=ollama
OLLAMA_BASE_URL=http://ollama.team-g.svc.cluster.local:11434/v1
OLLAMA_MODEL=llama3.1:8b

SHARED_REDIS_URL=redis://redis-master.team-g.svc.cluster.local:6379

SHARED_POSTGRES_HOST=postgres.team-g.svc.cluster.local
SHARED_POSTGRES_PORT=5432
SHARED_POSTGRES_USER=persona_agents
SHARED_POSTGRES_DATABASE=persona_agents
SHARED_POSTGRES_SCHEMA_PREFIX=persona_bot
```

Logica importante reportada en deploy:

```js
function getSchemaName(bot, config) {
  const suffix = bot.slug.replace(/-/g, '_');
  return `${config.sharedPostgresSchemaPrefix}_${suffix}`.slice(0, 63);
}
```

Bootstrap del schema:

```sql
CREATE SCHEMA IF NOT EXISTS "<schema>";
GRANT USAGE ON SCHEMA "<schema>" TO <user>;
GRANT CREATE ON SCHEMA "<schema>" TO <user>;
ALTER ROLE <user> IN DATABASE <db> SET search_path TO "<schema>", public;
```

Compatibilidad Ollama/OpenAI:

```text
LLM_PROVIDER=openai
OPENAI_MODEL=<modelo-ollama>
OPENAI_BASE_URL=<base-url-ollama>
OPENAI_API_KEY=ollama-local-placeholder
```

## Pendientes inmediatos heredados

- Conseguir o definir secretos reales:
  - `APP_JWT_SECRET`
  - `SHARED_POSTGRES_PASSWORD`
  - `DOCKERHUB_USERNAME`
  - `DOCKERHUB_TOKEN`
  - `KUBE_CONFIG` en GitHub Actions
- Ajustar `web-app/.env` local con secretos reales.
- Construir y subir imagen nueva.
- Desplegar la plataforma nueva por Helm.
- Verificar que suban:
  - `persona-ai-creator`
  - `postgres`
  - `redis-master`
  - `ollama`
- Probar desde la UI:
  - registro/login
  - crear bot
  - publish
- Confirmar que el publish nuevo genere valores nuevos, no viejos, y que el bot ya no cree Postgres o Redis propios.

## Riesgos o cosas a validar

- El runtime del chatbot puede seguir teniendo expectativas no documentadas sobre variables del chart `hologram-generic-ai-agent-chart`.
- Aunque se configuro Ollama como backend real, el chatbot se configuro como `openai` por compatibilidad de API. Validar que esto sea aceptable academicamente.
- Validar si `vs-agent-chart` realmente respeta:
  - `POSTGRES_SCHEMA`
  - `PGOPTIONS`
  - `POSTGRES_DB`
  - `POSTGRES_DATABASE`
- `ALTER ROLE ... SET search_path` sobre un usuario compartido puede no aislar idealmente si varios bots usan el mismo usuario.
- La plataforma administrativa aun no usa Postgres real; usa persistencia local simple.
- El chart de Ollama hace `ollama pull` al arrancar; validar recursos, tiempo de arranque y persistencia del modelo.
- Validar storage class `csi-cinder-high-speed`.
- Validar permisos para imagenes:
  - `postgres:16-alpine`
  - `redis:7-alpine`
  - `ollama/ollama:latest`
- No se ejecuto aun `docker build` real ni despliegue final tras el ultimo refactor.

## Siguiente paso recomendado

Primero desplegar `persona-ai-creator` con el chart nuevo y validar que existan `postgres`, `redis-master` y `ollama` en `team-g` antes de volver a publicar cualquier bot.

Orden recomendado:

1. Poner secretos reales en `web-app/.env`.
2. Construir y subir la imagen nueva.
3. Ejecutar `helm upgrade --install persona-ai-creator ...`.
4. Verificar pods y servicios.
5. Abrir la plataforma desplegada.
6. Crear un bot nuevo desde cero.
7. Publicarlo.
8. Inspeccionar logs y confirmar:
   - no se creo Postgres por bot
   - no se creo Redis por bot
   - el chatbot usa Ollama via endpoint compatible
   - `vs-agent` abre su store sin error de credenciales
   - el schema del bot se creo en el Postgres compartido

## Diferencia critica a resolver en este repo

Antes de ejecutar ese plan en este workspace, necesitamos una de estas dos cosas:

1. Traer a este repo los archivos fuente reales del proyecto `Persona AI Agent Creator`.
2. O reconstruir aqui esos archivos a partir del proyecto anterior y de los artefactos que si quedaron.

Sin eso, este proyecto ya tiene el contexto del chat, pero todavia no tiene el mismo estado de codigo que el chat daba por hecho.
