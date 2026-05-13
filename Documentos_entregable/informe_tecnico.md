---
title: "Informe Técnico Final — NextAgent"
subtitle: "Plataforma de Creación y Despliegue de Agentes de IA Verificables"
author:
  - "Oscar David Rojas Bedoya"
  - "Yesid Alejandro Peláez Posada"
date: "Mayo 2026"
lang: es
---

# Informe Técnico Final — NextAgent

**Plataforma de Creación y Despliegue de Agentes de IA Verificables**

> Verana Foundation × NODO EAFIT — Beca IA Ser ANDI  
> Reto IA Generativa: Agentes IA Verificables con Hologram

| Campo | Detalle |
|---|---|
| **Equipo** | Oscar David Rojas Bedoya · Yesid Alejandro Peláez Posada |
| **Repositorio** | https://github.com/alejopp/agent-challenge-eafit |
| **Plataforma en producción** | https://persona-ai.team-g.teams.eafit.testnet.verana.network |
| **Fecha** | Mayo 2026 |

---

## Tabla de Contenidos

1. [Contexto del Reto](#1-contexto-del-reto)
2. [Definición del Problema](#2-definición-del-problema)
3. [Justificación de la Solución](#3-justificación-de-la-solución)
4. [Metodología de Desarrollo](#4-metodología-de-desarrollo)

---

## 1. Contexto del Reto

### 1.1. Programa y Organización

El presente proyecto se desarrolla en el marco del programa **"Beca IA Ser ANDI"**, una iniciativa conjunta entre **NODO EAFIT** y la **Verana Foundation**, orientada a formar talento técnico universitario en tecnologías emergentes de inteligencia artificial e identidad digital descentralizada.

El reto propuesto — *"Agentes IA Verificables con Hologram"* — tiene como trasfondo el ecosistema tecnológico de Verana y su aplicación de mensajería Hologram.

### 1.2. El Ecosistema Verana / Hologram

**Verana** es una capa de confianza abierta para internet, fundamentada en los estándares W3C de DIDs (Decentralized Identifiers) y Credenciales Verificables (Verifiable Credentials). Su objetivo es permitir que actores digitales —personas, organizaciones y agentes IA— puedan ser identificados y verificados de forma criptográfica, sin depender de intermediarios centralizados.

**Hologram** es una aplicación de mensajería que actúa como navegador de agentes IA verificables. A diferencia de los chatbots convencionales, Hologram muestra al usuario quién opera el agente con el que se está comunicando, respaldado por una credencial verificable emitida por una entidad de confianza.

**VS Agent** (Verifiable Service Agent) es el componente de software que actúa como capa de identidad de cada chatbot: gestiona el DID propio del agente, establece canales DIDComm cifrados punto a punto y recibe credenciales de servicio emitidas por la red Verana.


### 1.4. Concepto de Persona AI Agent

Un **AI Agent** representa a una persona real y actúa en su nombre dentro del ecosistema Hologram. Cada agente posee:

- Una **identidad DID** propia, verificable criptográficamente.
- Una **Credencial Verificable de servicio**, emitida por una institución de confianza (EAFIT).
- Un **canal DIDComm cifrado** para comunicarse de forma segura con los usuarios de Hologram.
- Capacidades extendidas mediante servidores **MCP** (herramientas como clima, Wikipedia, calendario).

*Ejemplo del reto*: un plomero puede tener un agente IA que gestione su calendario. Los clientes se conectan al agente vía Hologram para agendar una intervención, confirmando previamente que el agente es legítimo.

---

## 2. Definición del Problema

### 2.1. Problema Central

Los chatbots y agentes de IA actualmente operan en **plataformas centralizadas sin ningún mecanismo de confianza verificable**. Esto genera tres problemáticas fundamentales:

#### a) Identidad no verificable

No existe ningún mecanismo que permita confirmar quién opera un bot, qué políticas sigue ni si actúa de forma legítima. Cualquier actor puede crear un agente que suplante la identidad de una empresa, profesional o institución real sin posibilidad de detección por parte del usuario.

#### b) Confianza ciega del usuario

Las personas interactúan con chatbots sin poder verificar su autenticidad, quedando expuestas a desinformación, fraude, phishing o suplantación de identidad. La confianza se otorga de forma implícita, no basada en evidencia criptográfica.

#### c) Barreras técnicas de despliegue

Crear y publicar un agente de IA con identidad descentralizada requiere conocimientos avanzados en múltiples disciplinas:

- Containerización con **Docker** y orquestación con **Kubernetes**
- Configuración de protocolos **DIDComm** y gestión de wallets criptográficas
- Emisión y verificación de **Credenciales Verificables W3C**
- Configuración de **Helm charts** y pipelines **CI/CD**

Estas barreras hacen que la tecnología sea inaccesible para cualquier usuario no especializado.

### 2.2. Brecha Identificada

El ecosistema Verana/Hologram resuelve el problema de la confianza criptográfica, pero el proceso de incorporarse a dicho ecosistema sigue siendo complejo y manual. **No existía una plataforma que abstrajera completamente este proceso técnico**, permitiendo que cualquier persona —un plomero, un médico, un docente— pudiera publicar su propio agente verificable sin escribir una sola línea de código.

### 2.3. Alcance del Problema

La ausencia de herramientas de democratización en el ecosistema Verana implica:

- Que solo desarrolladores especializados pueden beneficiarse de la tecnología.
- Que el número de agentes verificables en la red permanece artificialmente bajo.
- Que los potenciales beneficiarios (profesionales independientes, pequeñas empresas, instituciones educativas) quedan excluidos del ecosistema.
- Que la adopción masiva del protocolo DIDComm se ve obstaculizada por la ausencia de interfaces accesibles.

---

## 3. Justificación de la Solución

### 3.1. Propuesta de Valor

**NextAgent** es una plataforma web que elimina la complejidad técnica del despliegue de agentes IA verificables, entregando a cualquier usuario —sin conocimientos de programación— la capacidad de crear, configurar y publicar su propio **AI Agent** en el ecosistema Hologram/Verana con un solo clic.

### 3.2. Por qué esta solución es la adecuada

#### Democratización del acceso

La solución traduce un proceso que requería horas de trabajo técnico especializado en un formulario web guiado que cualquier persona puede completar en minutos. Esto alinea directamente con el propósito del reto: hacer accesible la identidad verificable para todos.

#### Automatización total del pipeline técnico

NextAgent abstrae completamente el proceso técnico:

1. Generación dinámica de **Helm values** y `agent-pack.yaml` por agente
2. Creación de **schema PostgreSQL dedicado** en la base de datos compartida
3. Despliegue del VS Agent en Kubernetes mediante `helm upgrade --install`
4. Sondeo del endpoint `/v1/agent` hasta confirmar disponibilidad del agente
5. Emisión automática de la **credencial de servicio verificable** (firmada por EAFIT)
6. Generación del **QR de conexión** para usuarios finales de Hologram

#### Integración nativa con la red Verana

La plataforma no crea chatbots genéricos: cada agente publicado obtiene una **identidad DID propia**, se registra en la red Verana y recibe una Credencial Verificable de servicio emitida por EAFIT. Esto garantiza que los agentes sean verificables en Hologram desde el primer momento.

#### Extensibilidad mediante MCP

La integración del **Model Context Protocol (MCP)** permite que cada agente acceda a herramientas externas durante la conversación — datos meteorológicos (Open-Meteo), Wikipedia (Wikimedia), Google Calendar — dotándolo de capacidades que van más allá de un simple chatbot de texto estático.

#### Arquitectura sostenible

La solución reutiliza infraestructura compartida del cluster de EAFIT (PostgreSQL, Redis, OpenAI), minimizando el costo por agente e implementando aislamiento mediante schemas independientes. El pipeline CI/CD en GitHub Actions garantiza despliegues reproducibles y auditables.

### 3.3. Comparativa con el enfoque manual

| Tarea | Sin NextAgent | Con NextAgent |
|---|---|---|
| Configurar Helm chart | 1–2 horas (experto) | Automático |
| Desplegar VS Agent en K8s | 30–60 min (experto) | 1 clic |
| Emitir credencial Verana | 30–60 min (experto) | Automático |
| Tiempo total para un usuario no técnico | Inviable | 5–10 minutos |

### 3.4. Impacto esperado

- Reducción del tiempo de publicación de un agente verificable de horas a minutos.
- Habilitación de perfiles no técnicos para adoptar el ecosistema Verana/Hologram.
- Demostración concreta y replicable de identidad descentralizada aplicada a IA.
- Contribución al crecimiento del número de agentes verificables en la red Verana.

---

## 4. Metodología de Desarrollo

### 4.1. Enfoque general

El desarrollo siguió un **enfoque ágil e iterativo**, priorizando la entrega de valor funcional en cada ciclo. Las decisiones técnicas se tomaron de forma incremental, validando cada componente de la arquitectura antes de avanzar al siguiente. Se utilizó **Windsurf IDE**, **Antigravity IDE** y **Codex IDE** con asistencia de IA como entorno de desarrollo principal.

### 4.2. Stack tecnológico

| Capa | Tecnologías |
|---|---|
| **Frontend** | React 18, Vite, React Router v6, CSS personalizado |
| **Backend** | Node.js 20, Express.js, Passport.js, JWT, Multer |
| **Infraestructura** | Kubernetes (namespace `team-g`), Helm 3, Docker, Docker Hub |
| **CI/CD** | GitHub Actions |
| **Red Verana** | VS Agent, DIDComm/WSS, Credenciales Verificables W3C |
| **Shared Infra** | PostgreSQL, Redis, OpenAI GPT-4o-mini |
| **MCP** | Open-Meteo API, Wikimedia API, Google Calendar API |

### 4.3. Fases de desarrollo

#### Fase 1 — Exploración del ecosistema *(Paso 1 del reto)*

**Objetivo**: comprender el funcionamiento del VS Agent y el protocolo DIDComm antes de construir la plataforma.

Actividades:

- Fork del repositorio oficial `verana-labs/eafit-challenge`.
- Configuración del chatbot base con Docker Compose de forma local.
- Personalización del `agent-pack.yaml`: nombre, prompt del sistema, idiomas, RAG.
- Incorporación de documentos RAG (bases de conocimiento en PDF/TXT).
- Exposición del servicio vía `ngrok` y pruebas de conectividad desde Hologram.
- Estudio del API admin del VS Agent (`/v1/agent`, `/oob/create-invitation`).

**Resultado**: chatbot funcional en Hologram con identidad verificable local.

---

#### Fase 2 — Despliegue en Kubernetes *(Paso 2 del reto)*

**Objetivo**: trasladar el chatbot a infraestructura productiva en el cluster de EAFIT.

Actividades:

- Recepción y configuración del `kubeconfig` del namespace `team-g`.
- Adaptación de manifiestos al cluster académico compartido.
- Creación del Helm chart inicial para el agente de prueba (Alice).
- Configuración del Ingress con dominio público verificable.
- Verificación de conectividad desde Hologram sin dependencia de `ngrok`.
- Ajuste del Helm chart para parametrizar nombre, prompt, logo y credenciales.

**Resultado**: agente Alice operativo en `alice.agents.team-g.teams.eafit.testnet.verana.network`, accesible desde Hologram con credencial EAFIT.

---

#### Fase 3 — Desarrollo de la plataforma web *(Paso 3 — reto principal)*

##### 3.A. Diseño de la arquitectura

Se definió una arquitectura full-stack de tres capas:

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React + Vite)              │
│    AuthPage │ Dashboard │ BotDetailPage │ QR de conexión│
└──────────────────────────┬──────────────────────────────┘
                           │ API REST / JWT
┌──────────────────────────▼──────────────────────────────┐
│                  Backend (Node.js + Express)            │
│    Auth (local + Google OAuth) │ CRUD bots │ deployment │
└──────────┬──────────────────────────────────────────────┘
           │
┌──────────▼──────────────────────────────────────────────┐
│         Kubernetes — namespace team-g (EAFIT)           │
│   VS Agent por bot │ Bot Chatbot │ PostgreSQL │ Redis   │
└─────────────────────────────────────────────────────────┘
```

##### 3.B. Iteraciones de implementación

**Iteración 1 — Autenticación y CRUD básico**

- Sistema de registro/login local con JWT.
- Formulario de creación de bot con campos básicos (nombre, profesión, descripción, foto).
- Persistencia en archivo JSON como store inicial.

**Iteración 2 — Pipeline de publicación**

- Servicio `deployment.js` que encapsula toda la lógica de Kubernetes.
- Generación dinámica de Helm values y `agent-pack.yaml` por bot.
- Sondeo del endpoint `/v1/agent` con backoff hasta confirmar disponibilidad.
- Emisión automática de la credencial de servicio Verana post-deploy.
- Overlay visual de publicación con estados progresivos en el frontend.

**Iteración 3 — Google OAuth y experiencia de usuario**

- Integración de Passport.js con `GoogleStrategy`.
- Configuración de OAuth 2.0 en Google Cloud Console.
- Ajuste de URLs de callback para entornos desarrollo/producción.
- Mejoras de UX: feedback visual, manejo de errores, estados de carga.

**Iteración 4 — QR de conexión**

- Endpoint `/invitation` en el backend para obtener la URL de invitación OOB del VS Agent.
- Visualización del QR en `BotDetailPage` mediante la API `qrserver.com`.
- Estrategia multi-fallback: parseo del HTML público del VS Agent, múltiples endpoints admin.

**Iteración 5 — Integraciones MCP**

- Servidor MCP **Open-Meteo** para datos meteorológicos en tiempo real.
- Servidor MCP **Wikimedia** para búsqueda y resúmenes de Wikipedia.
- Inicio de integración de **Google Calendar API**.
- Configuración dinámica de MCP servers en el `agent-pack.yaml` generado por bot.

**Iteración 6 — CI/CD y estabilización**

- Pipeline GitHub Actions: `build Docker → push Docker Hub → helm upgrade → probing`.
- Limpieza automática de lock de Helm antes de cada despliegue.
- Corrección del manejo de logos: descarga, codificación base64, validación previa.
- Logging detallado del proceso de credencialización para depuración.

### 4.4. Estado final del proyecto

| Funcionalidad | Estado |
|---|---|
| Registro y login (local + Google OAuth) | ✅ Funcional |
| CRUD de bots con imagen y documentos RAG | ✅ Funcional |
| Publicación automática en Kubernetes vía Helm | ✅ Funcional |
| Emisión de credencial de servicio verificable (EAFIT) | ✅ Funcional |
| QR de conexión visible en la plataforma | ✅ Funcional |
| Integración MCP — Clima (Open-Meteo) | ✅ Funcional |
| Integración MCP — Wikipedia (Wikimedia) | ✅ Funcional |
| Conexión verificable desde app Hologram | ✅ Funcional |
| CI/CD con limpieza automática de lock Helm | ✅ Funcional |
| Integración MCP — Google Calendar | 🔄 En ajuste |
| QR de invitación OOB directa | 🔄 En ajuste |

### 4.5. Estructura del repositorio

```
agent-challenge-eafit/
├── .github/workflows/
│   └── deploy.yml               # Pipeline CI/CD completo
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
├── agent-pack.yaml              # Pack de configuración del agente base
└── Documentos_entregable/
    ├── README.md                # Documentación en español
    ├── README-en.md             # Documentación en inglés
    └── informe_tecnico.md       # Este documento
```

---

*Documento generado para el reto "Agentes IA Verificables con Hologram" — Verana Foundation × NODO EAFIT — Beca IA Ser ANDI — Mayo 2026*
