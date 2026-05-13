---
title: "Evidencias del Proceso de Trabajo — NextAgent"
subtitle: "Registro completo del desarrollo del proyecto"
author:
  - "Oscar David Rojas Bedoya"
  - "Yesid Alejandro Peláez Posada"
date: "Mayo 2026"
lang: es
---

# Evidencias del Proceso de Trabajo — NextAgent

**Reto:** IA Generativa — Agentes IA Verificables con Hologram  
**Programa:** Beca IA Ser ANDI · NODO EAFIT · Verana Foundation  
**Período:** 6 de abril – 12 de mayo de 2026  
**Repositorio:** https://github.com/alejopp/agent-challenge-eafit

---

## Tabla de Contenidos

1. [Distribución de Roles del Equipo](#1-distribución-de-roles-del-equipo)
2. [Cronograma y Roadmap](#2-cronograma-y-roadmap)
3. [Bitácora de Trabajo](#3-bitácora-de-trabajo)
4. [Evidencias de Reuniones](#4-evidencias-de-reuniones)
5. [Versiones y Prototipos](#5-versiones-y-prototipos)
6. [Historial de Commits GitHub](#6-historial-de-commits-github)
7. [Decisiones Técnicas Tomadas](#7-decisiones-técnicas-tomadas)
8. [Problemas Encontrados y Soluciones](#8-problemas-encontrados-y-soluciones)
9. [Capturas del Desarrollo](#9-capturas-del-desarrollo)

---

---
## 1. DISTRIBUCIÓN DE ROLES DEL EQUIPO
---

### Integrantes activos

El equipo inició con 3 integrantes (6/4/2026). Uno abandonó el programa antes del 15/4/2026, quedando el proyecto a cargo de dos personas.

| Integrante | Rol Principal | Responsabilidades |
|---|---|---|
| **Yesid Alejandro Peláez Posada** | Frontend · UI/UX| Tech Lead · Backend · DevOps | Infraestructura Kubernetes, Helm charts, CI/CD GitHub Actions, integración VS Agent y red Verana, emisión de credenciales verificables, MCP servers, chatbot, base de datos |
| **Oscar David Rojas Bedoya** | Frontend · UI/UX · Documentación | MCP servers, Infraestructura Kubernetes, integración VS Agent y red Verana| Interfaz React, identidad de marca NextAgent, integración OAuth Google, implementación QR, CSS/UX, documentación técnica, README, manual de usuario, evidencias 

### División por módulo

| Módulo | Responsable principal | Colaboración |
|---|---|---|
| Plataforma web (React + Vite) | Alejandro | Oscar (revisión funcional) |
| API REST (Express.js) | Alejandro | Oscar (endpoints de autenticación) |
| Kubernetes / Helm deployment | Alejandro | Oscar |
| GitHub Actions CI/CD | Alejandro | Oscar (ajustes de secretos) |
| VS Agent + DIDComm | Alejandro | - |
| Credenciales Verana | Alejandro | Oscar |
| MCP servers (Clima, Wikipedia) | Alejandro | Oscar (Google Calendar) |
| Identidad de marca / UI NextAgent | Oscar | — |
| Google OAuth 2.0 | Oscar | — |
| QR de conexión | Oscar | Alejandro (debugging) |
| RAG (documentos conocimiento) | Oscar | Alejandro (config servidor) |
| Documentación (README, informe, manual) | Oscar | Alejandro (secciones técnicas) |

> **Nota:** Dada la baja del 50% del equipo inicial, ambos integrantes trabajaron significativamente por encima de la carga esperada, cubriendo múltiples roles de forma simultánea.

---

---
## 2. CRONOGRAMA Y ROADMAP
---

### Fases del proyecto

```
FASE 0 — EXPLORACIÓN Y CONFIGURACIÓN
Semana 1 · 6 abril – 14 abril 2026
────────────────────────────────────────────────────────────────
  ✅ Lectura y comprensión del reto (README-es.md, challenge.pdf)
  ✅ Instalación y configuración del entorno local
  ✅ Fork del repositorio base eafit-challenge
  ✅ Configuración de GitHub, secretos y permisos
  ✅ Primera reunión de coordinación del equipo
  ✅ Definición de cronograma de reuniones (mar/vie 7pm, sáb 8:30am)
  ✅ Despliegue inicial del agente de ejemplo en Kubernetes (manual)

FASE 1 — INFRAESTRUCTURA BASE
Semana 2 · 14 abril – 21 abril 2026
────────────────────────────────────────────────────────────────
  ✅ Primer agente desplegado en Kubernetes (Alejandro)
  ✅ Primer agente verificado en red Verana / Hologram
  ✅ Configuración del namespace team-g en el cluster EAFIT
  ✅ Pipeline CI/CD inicial con GitHub Actions
  ✅ Prototipo de interfaz web (login + creación de bot)
  ✅ Video demo del prototipo inicial (Oscar)

FASE 2 — PLATAFORMA WEB + AUTOMATIZACIÓN
Semana 3 · 22 abril – 2 mayo 2026
────────────────────────────────────────────────────────────────
  ✅ Plataforma web completa (React + Express) desplegada en producción
  ✅ URL en vivo: persona-ai.team-g.teams.eafit.testnet.verana.network
  ✅ Login funcional (email/contraseña)
  ✅ Creación, publicación y despublicación de bots desde la UI
  ✅ Pipeline de publicación automatizada (Helm) con 1 clic
  ✅ Implementación MCP servers (clima Open-Meteo + Wikipedia)
  ✅ RAG: subida y procesamiento de documentos propios

FASE 3 — PULIMIENTO Y FEATURES FINALES
Semana 4 · 3 mayo – 7 mayo 2026
────────────────────────────────────────────────────────────────
  ✅ Identidad de marca: nombre "NextAgent", tema oscuro, UI rediseñada
  ✅ Integración Google OAuth 2.0
  ✅ Subida de imagen de perfil del agente (preview + avatar en chatbot)
  ✅ Página de resumen del bot (estado, URL pública, QR)
  ✅ QR de conexión integrado en la plataforma
  ✅ Emisión automatizada de Credencial Verificable (firmada por EAFIT)
  ✅ Lottie animation en dashboard y overlay de publicación
  ✅ Traducción completa de la UI al español
  ✅ Limpieza automática de lock Helm en CI/CD
  ✅ Primera demo intermedia ante el grupo (6/5/2026)

FASE 4 — DOCUMENTACIÓN Y ENTREGA FINAL
Semana 5 · 7 mayo – 12 mayo 2026
────────────────────────────────────────────────────────────────
  ✅ README.md completo (español + inglés)
  ✅ Informe técnico (.txt + .md)
  ✅ Manual de usuario (.txt + .md)
  ✅ Guía de presentación final
  ✅ Evidencias del proceso de trabajo (este documento)
  ✅ Carpeta Documentos_entregable con todos los entregables
```

### Línea de tiempo resumida

| Semana | Período | Hito principal |
|---|---|---|
| 1 | 6–14 abr | Equipo formado, entorno configurado, primer agente en K8s |
| 2 | 14–21 abr | Agente verificado, CI/CD inicial, prototipo web |
| 3 | 22 abr–2 may | Plataforma en producción, MCP funcional, RAG integrado |
| 4 | 3–7 may | NextAgent brand, OAuth, QR, credenciales, demo intermedia |
| 5 | 7–12 may | Documentación completa, preparación entrega final |

---

---
## 3. BITÁCORA DE TRABAJO
---

La bitácora se construyó a partir del historial de conversaciones de WhatsApp (chat privado y grupo), del historial de commits de GitHub y de las reuniones en Microsoft Teams.

### Semana 1 — Exploración (6–14 abril 2026)

| Fecha | Actividad | Participante |
|---|---|---|
| 6/4/2026 | Creación del grupo de WhatsApp GRUPO G - VERANA | Oscar |
| 8/4/2026 | Primer contacto del equipo; definición de inicio desde cero; creación del repositorio GitHub | Oscar |
| 8/4/2026 | Instalación del entorno local (WSL, dependencias Verana) | Todos |
| 11/4/2026 | Reunión coordinada para sábado 10:30/11:30 am | Todos |
| 13/4/2026 | Definición de horario de reuniones: martes, viernes y sábados | Todos |
| 13/4/2026 | Recolección de usuarios GitHub; invitaciones al repositorio | Oscar |
| 14/4/2026 | **Primera reunión formal en Teams** — lectura del reto, distribución de tareas iniciales | Todos |
| 14/4/2026 | Publicación de recursos del reto en el grupo (README, hologram-generic, Verana docs) | Oscar |
| 15/4/2026 | Instalación de VS Agent en local (lucha con errores de configuración) | Oscar, Alejandro |
| 15/4/2026 | Una integrante abandona el grupo y el programa | — |
| 15/4/2026 | Oscar levanta VS Agent localmente por primera vez | Oscar |

### Semana 2 — Infraestructura (14–21 abril 2026)

| Fecha | Actividad | Participante |
|---|---|---|
| 17/4/2026 | Reunión de seguimiento — revisión de avances individuales | Oscar, Alejandro |
| 18/4/2026 | Reunión de sábado — configuración del pipeline de despliegue | Oscar, Alejandro |
| 19/4/2026 | **Hito:** primer agente desplegado en Kubernetes, accesible desde internet (sin VC aún) | Alejandro |
| 19/4/2026 | Oscar prueba el agente desplegado por Alejandro vía Hologram | Oscar |
| 20/4/2026 | Resolución de errores de configuración del namespace y CI/CD | Oscar, Alejandro |
| 20/4/2026 | Reunión corta (8:30-9pm) — alineación de próximos pasos | Todos |
| 21/4/2026 | **Hito:** primer agente corriendo en la nube CON credencial verificada | Alejandro |
| 21/4/2026 | Reunión 7:15pm — nivelación del equipo, depuración de errores de dominio/secretos | Oscar, Alejandro |
| 21/4/2026 | Oscar levanta su propio pod de agente | Oscar |

### Semana 3 — Plataforma web (22 abril – 2 mayo 2026)

| Fecha | Actividad | Participante |
|---|---|---|
| 22/4/2026 | Múltiples pods activos simultáneamente en el cluster | Alejandro |
| 22/4/2026 | Reunión vespertina — preparación del pitch | Oscar, Alejandro |
| 24/4/2026 | Reunión 7pm — revisión de arquitectura y pitch | Oscar, Alejandro |
| 25/4/2026 | Oscar comparte video del prototipo de web app con login y creación de bot | Oscar |
| 27/4/2026 | **Incidente crítico:** namespace eliminado accidentalmente → solicitud de nuevo namespace | Alejandro |
| 27/4/2026 | **Hito:** plataforma web completa en producción con URL persona-ai | Alejandro |
| 28/4/2026 | Se integra un tercer miembro al grupo (decide no participar activamente) | — |
| 28/4/2026 | Reunión de presentación del estado del proyecto al nuevo integrante | Oscar, Alejandro |
| 29/4/2026 | Reunión 8pm — asignación de tareas para el sprint final | Oscar, Alejandro |
| 29/4/2026 | **Tareas asignadas a Oscar:** señal visual en botones, preview avatar, sección resumen, OAuth Google, RAG | Oscar |
| 1/5/2026 | Oscar configura kubectl local, clona el repositorio y trabaja en rama feat/web | Oscar |
| 1/5/2026 | Decisión de no subir kubeconfig al repo por seguridad | Oscar (confirmado por Alejandro) |
| 2/5/2026 | Reunión 6:15pm — revisión de avances, primera vista de la URL en vivo | Oscar, Alejandro |
| 2/5/2026 | **Hito:** Oscar crea la identidad de marca "NextAgent" — diseño UI, tema oscuro | Oscar |

### Semana 4 — Features finales y demo (3–7 mayo 2026)

| Fecha | Actividad | Participante |
|---|---|---|
| 3/5/2026 | Oscar implementa login con GitHub OAuth | Oscar |
| 3/5/2026 | Alejandro trabaja en integración del chatbot (migración de Groq a OpenAI) | Alejandro |
| 3/5/2026 | Oscar implementa el ajuste para RAG | Oscar |
| 3/5/2026 | Reunión 8pm — revisión de RAG e integración de branches | Oscar, Alejandro |
| 4/5/2026 | Alejandro logra credencialización completa con MCP funcional | Alejandro |
| 4/5/2026 | Implementación: Layout component con sidebar y navegación | Alejandro |
| 4/5/2026 | Implementación: PublishingOverlay con feedback visual de despliegue | Alejandro |
| 4/5/2026 | Oscar conecta el MCP Google Calendar (usuarios de prueba) | Oscar |
| 5/5/2026 | Reunión 9pm — integración de ramas, planning de la demo | Oscar, Alejandro |
| 6/5/2026 | Oscar implementa Google OAuth funcional en producción | Oscar |
| 6/5/2026 | Oscar implementa QR de conexión (primera versión) | Oscar |
| 6/5/2026 | Alejandro traduce toda la UI al español | Alejandro |
| 6/5/2026 | Alejandro agrega animación Lottie de IA al dashboard | Alejandro |
| 6/5/2026 | **Reunión pre-demo 5pm** — verificación del estado antes de la presentación intermedia | Oscar, Alejandro |
| 6/5/2026 | **Demo intermedia** ante el grupo del programa (presencia de Federico/Fabrice) | Oscar, Alejandro |
| 6/5/2026 | El agente no respondió durante la demo (problema con MCP Wikipedia) | Alejandro |
| 6/5/2026 | Reunión post-demo 7:45pm — análisis del incidente, plan para la final | Oscar, Alejandro |
| 7/5/2026 | Alejandro identifica y corrige el problema del MCP Wikipedia | Alejandro |

### Semana 5 — Documentación y cierre (7–12 mayo 2026)

| Fecha | Actividad | Participante |
|---|---|---|
| 11/5/2026 | Definición de la estructura de entrega final (asignación de documentos) | Alejandro |
| 11/5/2026 | Creación de la carpeta `Documentos_entregable` en el repositorio | Oscar |
| 11/5/2026 | Generación del README.md completo (español + inglés) | Oscar |
| 11/5/2026 | Generación del informe técnico (.txt + .md) | Oscar |
| 11/5/2026 | Reunión 8pm — revisión de avances de documentación | Oscar, Alejandro |
| 12/5/2026 | Generación del manual de usuario (.txt + .md) | Oscar |
| 12/5/2026 | Generación de la guía de presentación final | Oscar |
| 12/5/2026 | Generación de evidencias del proceso de trabajo (este documento) | Oscar |

---

---
## 4. EVIDENCIAS DE REUNIONES
---

### Reuniones en Microsoft Teams

Se realizaron reuniones periódicas a través de Microsoft Teams. El historial de capturas de pantalla de las reuniones se encuentra la carpeta `evidencias_imagenes
`.

**Enlace recurrente de reunión:**
```
https://teams.microsoft.com/meet/232951605928091?p=Wh3i8AvW48OijiE9Aa
```

**Registro de reuniones identificadas:**

| # | Fecha | Tipo | Participantes | Temas tratados |
|---|---|---|---|---|
| 1 | 14/04/2026 ~7pm | Reunión formal | Oscar, Alejandro, Santiago | Lectura del reto, distribución de tareas, configuración GitHub |
| 2 | 15/04/2026 ~8pm | Reunión técnica | Oscar, Alejandro, Santiago | Instalación del entorno, problemas con VS Agent |
| 3 | 17/04/2026 ~7pm | Seguimiento | Oscar, Alejandro | Revisión de avances individuales |
| 4 | 18/04/2026 ~8am | Reunión sábado | Oscar, Alejandro | Pipeline de despliegue, depuración de CI/CD |
| 5 | 20/04/2026 8:30pm | Rápida | Oscar, Alejandro | Alineación de pods, instrucciones kubectl |
| 6 | 21/04/2026 7:15pm | Técnica | Oscar, Alejandro, Santiago | Nivelación del equipo, agente verificado |
| 7 | 22/04/2026 9pm | Pitch | Oscar, Alejandro | Preparación del pitch del proyecto |
| 8 | 24/04/2026 7pm | Revisión | Oscar, Alejandro | Arquitectura y estrategia del pitch |
| 9 | 28/04/2026 8:30pm | Presentación | Oscar, Alejandro | Presentación del estado al nuevo integrante |
| 10 | 29/04/2026 8pm | Sprint planning | Oscar, Alejandro | Asignación de tareas para el sprint final |
| 11 | 02/05/2026 6:15pm | Revisión | Oscar, Alejandro | Avances plataforma, primera vista en producción |
| 12 | 03/05/2026 8pm | Técnica | Oscar, Alejandro | Integración de ramas RAG + chatbot |
| 13 | 05/05/2026 9pm | Integración | Oscar, Alejandro | Merge de ramas, preparación demo |
| 14 | 06/05/2026 5pm | Pre-demo | Oscar, Alejandro | Verificación de la plataforma antes de la demo |
| 15 | 06/05/2026 7:45pm | Post-demo | Oscar, Alejandro | Análisis de la demo, plan de mejoras |
| 16 | 11/05/2026 8pm | Final | Oscar, Alejandro | Estructura de entrega, asignación documentos |

**Total de reuniones registradas: 16**

> Las capturas de pantalla de las sesiones de Teams se encuentran en:
> `Documentos_entregable/evidencias_imagenes/teams_image1.PNG` a `teams_image13.PNG`

---

---
## 5. VERSIONES Y PROTOTIPOS
---

### Evolución del producto

#### Versión 0.1 — Proof of Concept (14–21 abril 2026)
**Tipo:** Despliegue manual directo  
**Descripción:** Fork del repositorio `hologram-generic-ai-agent-vs`. Configuración y despliegue manual de un agente de ejemplo en el cluster Kubernetes de EAFIT, sin interfaz gráfica.  
**Logro:** Primer agente accesible desde internet, primer agente con credencial verificable en Hologram.  
**URL de ejemplo:** `https://example-agent.agents.team-g.teams.eafit.testnet.verana.network/` (primer deploy, 19/4/2026)

#### Versión 0.2 — Prototipo Web (25 abril 2026)
**Tipo:** Prototipo funcional local  
**Descripción:** Primera interfaz web con login básico y flujo de creación de bot. Desarrollada por Oscar con Windsurf (IA).  
**Demostración:** Video compartido al equipo vía Google Drive (25/4/2026).  
**Tecnología:** React + Express, login básico, sin despliegue en producción aún.

#### Versión 0.3 — Plataforma en Producción (27 abril – 1 mayo 2026)
**Tipo:** Versión alpha funcional  
**Descripción:** Primera versión completa de la plataforma Persona AI Creator desplegada en Kubernetes, accesible desde internet con URL propia. Login funcional con email/contraseña.  
**URL:** `https://persona-ai.team-g.teams.eafit.testnet.verana.network/`  
**Características:** Creación/publicación de bots, pipeline CI/CD automatizado, despliegue Helm.

#### Versión 0.4 — NextAgent Brand + Features (2–5 mayo 2026)
**Tipo:** Versión beta  
**Descripción:** Rediseño completo de la UI con identidad de marca NextAgent (Oscar). Tema oscuro, logo, CSS personalizado. Integración de Google OAuth, previsualización de avatar del agente, página de resumen, RAG funcional.  
**Características nuevas:** Identidad visual, OAuth Google, upload avatar, RAG, mejoras UX.

#### Versión 0.5 — Credenciales + QR (5–6 mayo 2026)
**Tipo:** Release candidate  
**Descripción:** Emisión automatizada de Credencial Verificable firmada por EAFIT al publicar un agente. QR de conexión integrado en la plataforma. Overlay de publicación con progreso en tiempo real. UI traducida al español. Animación Lottie.  
**Demo:** Demostración intermedia ante grupo del programa (6/5/2026).

#### Versión 1.0 — Release Final (6–12 mayo 2026)
**Tipo:** Versión de producción  
**Descripción:** Versión estable con todas las funcionalidades principales. CI/CD optimizado con limpieza de lock Helm. Debugging del MCP Wikipedia. Documentación completa.  
**Funcionalidades completas:**
- Login (email + Google OAuth)
- CRUD bots con imagen y documentos RAG
- Publicación automática en Kubernetes (1 clic)
- Credencial verificable EAFIT
- QR de conexión
- 2 integraciones MCP (clima + Wikipedia)
- CI/CD con GitHub Actions

### Ramas del repositorio

| Rama | Propósito | Estado |
|---|---|---|
| `main` | Producción — triggers CI/CD | Activa |
| `develop` | Integración de features antes de main | Activa |
| `feat/web-page` | Desarrollo inicial de la web app | Mergeada |
| `web_app_integration` | Integración de funcionalidades web (Oscar) | Mergeada |

> Las capturas de las ramas de GitHub se encuentran en:
> `Documentos_entregable/evidencias_imagenes/github_image5.PNG` (GitHub_branches.PNG)

---

---
## 6. HISTORIAL DE COMMITS GITHUB
---

El repositorio tiene commits de tres contribuidores: **Yesid Alejandro Peláez Posada** (alias `alejopp` / `Yesid Pelaez`), **Oscar David Rojas Bedoya** (alias `Oscar Rojas B`) y **Fabrice Rochette** (facilitador del reto, commits iniciales del repositorio base).

### Estadísticas del repositorio

| Métrica | Valor |
|---|---|
| Período de desarrollo | 13 abril – 12 mayo 2026 (29 días) |
| Total de commits | ~75 commits del equipo |
| Contribuidores del equipo | 2 (Oscar + Alejandro) |
| Pull Requests mergeados | 3 (PR#1, PR#2, PR#3 de develop a main) |
| Ramas activas | main, develop |

> Las métricas detalladas del repositorio (frecuencia de código, tráfico, contributors, Actions usage) se encuentran en las capturas:
> - `evidencias_imagenes/github_image1.PNG` — GitHub Actions Usage Metrics
> - `evidencias_imagenes/github_image2.PNG` — Code Frequency
> - `evidencias_imagenes/github_image3.PNG` — Traffic
> - `evidencias_imagenes/github_image4.PNG` — Contributors
> - `evidencias_imagenes/github_image5.PNG` — Branches

### Commits destacados por fase

#### Fase 1 — Infraestructura base (13–21 abril)

| Fecha | Autor | Commit | Descripción |
|---|---|---|---|
| 13/04 | Fabrice Rochette | `fe12b17` | feat: agent example (base del reto) |
| 18/04 | Yesid Pelaez | `206e158` | feat: configure my custom AI agent |
| 19/04 | Yesid Pelaez | `e37c082` | fix: update agent public URL and enable ingress |
| 19/04 | Yesid Pelaez | `aa80d9f` | fix: update Helm deployment with OpenAI API settings |
| 21/04 | Yesid Pelaez | `fbe2727` | fix: correct ingress for VS Agent |
| 21/04 | Yesid Pelaez | `eb67e1b` | fix: removed self issuer |

#### Fase 2 — Plataforma web (22 abril – 2 mayo)

| Fecha | Autor | Commit | Descripción |
|---|---|---|---|
| 25/04 | Yesid Pelaez | `8efe63c` | **feat: implemented webpage** |
| 26/04 | Yesid Pelaez | `705eade` | feat: Prepare Helm deployment for persona platform |
| 26/04 | Yesid Pelaez | `7a360c2` | feat: add RAG configuration for langchain provider |
| 26/04 | Yesid Pelaez | `3505291` | fix: set deployment strategy to Recreate |
| 28/04 | Yesid Pelaez | `3e9c3b3` | **feat: implement MCP server with weather and Wikipedia** |
| 30/04 | Yesid Pelaez | `e93ad54` | refactor: replace local DBs with shared Postgres |
| 01/05 | Oscar Rojas B | `a43b83a` | Cambios CSS botones Deployment, sección creación bot |
| 02/05 | Oscar Rojas B | `27a7db1` | **Identidad de marca NextAgent, bug fix creación bot, página resumen** |
| 03/05 | Yesid Pelaez | `224706c` | Merge PR#2 from develop |

#### Fase 3 — Features finales (3–7 mayo)

| Fecha | Autor | Commit | Descripción |
|---|---|---|---|
| 03/05 | Oscar Rojas B | `0d27d14` | **Conexión con GitHub OAuth y previsualización del avatar** |
| 03/05 | Yesid Pelaez | `4666efa` | feat: endpoint to issue service credentials for bots |
| 03/05 | Yesid Pelaez | `aeaaaf1` | feat: add OpenAI API key support in deployment |
| 03/05 | Yesid Pelaez | `bdddbd7` | feat: cert-manager annotation for Let's Encrypt |
| 04/05 | Yesid Pelaez | `d68843a` | feat: implement PublishingOverlay component |
| 04/05 | Yesid Pelaez | `cc1f854` | feat: create Layout component with sidebar navigation |
| 04/05 | Yesid Pelaez | `967b4e5` | feat: kubectl port-forwarding for agent admin APIs |
| 05/05 | Yesid Pelaez | `cfd01cb` | feat: automated retrieval and linking of service credentials |
| 06/05 | Oscar Rojas B | `74609b7` | **Configuración OAuth** |
| 06/05 | Oscar Rojas B | `4af921e` | **Implementación QR** |
| 06/05 | Yesid Pelaez | `c2ab46f` | feat: translate UI to Spanish |
| 06/05 | Yesid Pelaez | `09bf479` | feat: add Lottie animation for AI agent |
| 06/05 | Oscar Rojas B | `5eafddf` | Probe VS Agent admin API |
| 07/05 | Yesid Pelaez | `bc21c85` | refactor: remove validation requirement for MCP services |

#### Fase 4 — Documentación (11 mayo)

| Fecha | Autor | Commit | Descripción |
|---|---|---|---|
| 11/05 | Oscar Rojas B | `c15859c` | **Documento README.md entregable final** |
| 11/05 | Oscar Rojas B | `1e724ef` | **Informe técnico y manual del usuario completos** |

---

---
## 7. DECISIONES TÉCNICAS TOMADAS
---

| # | Decisión | Alternativa descartada | Razón |
|---|---|---|---|
| 1 | **GPT-4o-mini (OpenAI) como LLM** | Groq, OLLAMA/Llama | Groq era parcialmente funcional; OLLAMA inestable en K8s. OpenAI demostró mayor confiabilidad y disponibilidad en el cluster |
| 2 | **PostgreSQL compartido** (un schema por bot) | PostgreSQL dedicado por bot | Los recursos del cluster académico son limitados; el schema dedicado es más eficiente |
| 3 | **GitHub Actions** para CI/CD | Despliegue manual | La automatización garantiza reproducibilidad, elimina errores humanos y permite colaboración |
| 4 | **Helm charts** para cada agente | Scripts bash o manifests kubectl | Helm permite configuración declarativa y reutilizable con sobreescritura de valores por agente |
| 5 | **React 18 + Vite** para el frontend | Vue, Angular, o SSR | Experiencia del equipo, velocidad de desarrollo y compatibilidad con el ecosistema Node.js |
| 6 | **JWT sin estado** para sesiones | Sesiones server-side | Escalabilidad: permite múltiples réplicas del backend sin compartir estado de sesión |
| 7 | **CSS personalizado** (sin librería UI) | Bootstrap, Tailwind, MUI | Control total sobre la identidad visual de NextAgent sin dependencias adicionales |
| 8 | **kubeconfig fuera del repo** (variable de entorno) | Archivo en el repositorio | Seguridad: previene la exposición accidental de credenciales del cluster |
| 9 | **Gitflow** con ramas `main`/`develop`/`feat/*` | Desarrollo directo en main | Separación de desarrollo e integración; permite PR reviews antes de producción |
| 10 | **Frontend servido desde Express** en producción | Servidor separado (Nginx) | Un solo contenedor simplifica el despliegue en Kubernetes |
| 11 | **Nombre "NextAgent"** para la plataforma | "Persona AI Creator" (nombre base) | Identidad de marca más impactante, memorable y orientada al usuario final |
| 12 | **Limpieza automática del lock Helm** en CI/CD | Limpieza manual | Los despliegues fallidos bloqueaban el pipeline; la automatización previene el problema |
| 13 | **Desarrollo colaborativo con Git y GitHub**  Trabajo colaborativo en equipo | Permite darle orden y estructura al proyecto | Creación de ramas para cada funcionalidad y merge a develop |

---

---
## 8. PROBLEMAS ENCONTRADOS Y SOLUCIONES
---

### Problemas técnicos

| # | Problema | Fecha aproximada | Impacto | Cómo se solucionó |
|---|---|---|---|---|
| 1 | **Namespace eliminado accidentalmente** en el cluster de producción | 27/04/2026 | Alto — toda la plataforma caída | Se solicitó un nuevo namespace al equipo de EAFIT vía Discord; se restauró la configuración en el mismo día |
| 2 | **Timing de credencialización Verana** — el VS Agent tardaba entre 3 y 7 minutos en registrar su DID antes de estar listo para recibir una VC | 1–5/05/2026 | Alto — los agentes fallaban en publicación | Se implementó un bucle de sondeo con backoff exponencial en el backend; la plataforma espera pacientemente y notifica al usuario el progreso en tiempo real |
| 3 | **Lock de Helm en despliegues fallidos** — un deploy fallido dejaba el release en estado "pending" bloqueando todos los deploys siguientes | 3–4/05/2026 | Alto — CI/CD inoperante | Se agregó un step automático de limpieza del lock (`helm rollback`) antes de cada deploy en el workflow de GitHub Actions |
| 4 | **Google OAuth fallando en producción** — las URLs de callback apuntaban a localhost, causando error en el servidor | 5–6/05/2026 | Medio — OAuth inutilizable en producción | Se migraron las URLs a rutas relativas en el frontend + configuración de `APP_URL` y `CLIENT_DEV_URL` correctas en los Helm values del deployment |
| 5 | **QR no funcional directamente con Hologram** — el QR generado llevaba a la página web del VS Agent en lugar del parámetro OOB de invitación directa | 5–6/05/2026 | Bajo-Medio — QR funciona pero requiere paso adicional | Solución parcial: el QR lleva a la página del VS Agent donde está el QR de Hologram. La solución definitiva (extraer el parámetro OOB) sigue en desarrollo |
| 6 | **Agente no respondía durante la demo intermedia** (6/5) | 6/05/2026 | Alto para la demo | Identificado el día siguiente como un error en la integración del MCP Wikipedia. Corregido por Alejandro el 7/5/2026 |
| 7 | **Descarga de logo fallaba silenciosamente** en el proceso de credencialización, causando que la VC se emitiera sin imagen | 6–7/05/2026 | Medio — credenciales sin avatar | Se eliminó la redirección de errores a `/dev/null` en el script bash, se agregó manejo explícito de errores y skip del agente si la imagen falla |
| 9 | **Permisos de GitHub** — Oscar no podía crear ramas en el repositorio | 1/05/2026 | Bajo — bloqueó el inicio de trabajo en el repo | Configuración correcta de la clave SSH local; Alejandro ajustó los permisos del repositorio |
| 10 | **Chatbot respondía en idioma incorrecto** o con respuestas inconsistentes | 3/05/2026 | Medio — experiencia de usuario deficiente | Migración de Groq a OpenAI GPT-4o-mini como modelo base del chatbot |

### Problemas no técnicos

| # | Problema | Impacto | Resolución |
|---|---|---|---|
| 1 | **Reducción del equipo** — 2 de 4 integrantes abandonaron el programa entre el 7/4 y el 15/4 | Alto — carga de trabajo duplicada | El equipo de dos personas redistribuyó todas las responsabilidades y mantuvo el ritmo de trabajo |
| 2 | **Tercer integrante** se unió tardíamente (28/4) sin background técnico ni participación en clases | Medio — coordinación | Se le asignaron tareas de UX/documentación de bajo riesgo; finalmente no participó activamente |
| 3 | **Disponibilidad limitada** — ambos integrantes trabajan y estudian simultáneamente | Alto — horas de trabajo reducidas | Se estableció un horario fijo (mar/vie 7pm, sáb 8:30am) y trabajo asincrónico entre reuniones |

---

---
## 9. CAPTURAS DEL DESARROLLO
---

### Capturas de GitHub (en `evidencias_imagenes/`)

| Archivo | Contenido |
|---|---|
| `github_image1.PNG` | GitHub Actions — métricas de uso del pipeline CI/CD |
| `github_image2.PNG` | GitHub — frecuencia de código (commits por semana) |
| `github_image3.PNG` | GitHub — tráfico del repositorio (clones, visitas) |
| `github_image4.PNG` | GitHub — estadísticas de contribuidores |
| `github_image5.PNG` | GitHub — historial y estado de ramas |

### Capturas de reuniones Teams (en `evidencias_imagenes/`)

| Archivo | Contenido |
|---|---|
| `teams_image1.PNG` a `teams_image13.PNG` | 13 capturas de las sesiones de trabajo en Microsoft Teams |

### Capturas del proceso de desarrollo (WhatsApp)

Las siguientes capturas fueron compartidas durante el desarrollo vía WhatsApp y documentan hitos visuales del producto:

| Fecha | Descripción | Enviado por |
|---|---|---|
| 19/04/2026 | Primer agente en Hologram (sin credencial) | Oscar |
| 21/04/2026 | Primer agente verificado en red Verana | Alejandro |
| 25/04/2026 | Video del prototipo web (login + creación bot) | Oscar |
| 02/05/2026 | Screenshots de la nueva identidad NextAgent — pantalla de inicio | Oscar |
| 02/05/2026 | Screenshot del Dashboard NextAgent | Oscar |
| 02/05/2026 | Screenshot de la página de resumen del bot | Oscar |
| 02/05/2026 | Preview de la foto del agente | Oscar |
| 03/05/2026 | Screenshot del login con GitHub OAuth funcional | Oscar |
| 04/05/2026 | Screenshot de conexión con MCP Google Calendar | Oscar |
| 06/05/2026 | Screenshot de QR en el resumen del agente | Oscar |

---

*Evidencias del Proceso de Trabajo — NextAgent v1.0*  
*Oscar David Rojas Bedoya · Yesid Alejandro Peláez Posada*  
*Beca IA Ser ANDI · NODO EAFIT · Verana Foundation · Mayo 2026*
