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
5. [Arquitectura Técnica](#5-arquitectura-técnica)
6. [Flujo de Datos](#6-flujo-de-datos)
7. [Bases de Datos Utilizadas](#7-bases-de-datos-utilizadas)
8. [APIs, Modelos o Servicios Implementados](#8-apis-modelos-o-servicios-implementados)
9. [Explicación de Componentes IA](#9-explicación-de-componentes-ia)
10. [Resultados Obtenidos](#10-resultados-obtenidos)
11. [Dificultades Encontradas](#11-dificultades-encontradas)
12. [Recomendaciones](#12-recomendaciones)
13. [Conclusiones](#13-conclusiones)

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

## 5. Arquitectura Técnica

La arquitectura de **NextAgent** se fundamenta en un modelo de microservicios distribuido sobre **Kubernetes** en el namespace `team-g`. El diseño prioriza la escalabilidad de agentes individuales mientras reutiliza componentes críticos de infraestructura.

### 5.1. Componentes del Sistema

*   **Plataforma de Control (Backend Express)**: Actúa como el centro de mando. Gestiona la autenticación de usuarios, la persistencia de configuraciones de bots y la orquestación de comandos `kubectl` y `helm` para el despliegue de infraestructura.
*   **Interfaz de Usuario (React + Vite)**: Una SPA (Single Page Application) moderna que abstrae la complejidad técnica del cluster en una experiencia de usuario fluida.
*   **Agentes Desplegados**: Cada bot publicado consta de dos contenedores principales:
    *   **Chatbot App**: El motor de ejecución del agente, basado en el framework Hologram.
    *   **VS Agent**: El middleware de identidad que gestiona las comunicaciones DIDComm cifradas y las carteras (wallets) de credenciales.

### 5.2. Infraestructura Compartida

Para optimizar recursos en el entorno académico de EAFIT, implementamos un modelo de infraestructura compartida:
- **Shared Postgres**: Una única instancia robusta donde cada bot posee un **Schema propio** para aislamiento de datos.
- **Shared Redis**: Un cluster para gestión de memoria de corto plazo y búsqueda vectorial.
- **Shared Ollama**: Servicio de inferencia LLM centralizado accesible vía API compatible con OpenAI.

---

## 6. Flujo de Datos

El ciclo de vida de la información en NextAgent sigue un proceso lineal desde la creación hasta la interacción con el usuario final:

1.  **Captura de Configuración**: El usuario ingresa la "Persona" del bot y sube documentos a través del frontend. Los archivos se almacenan temporalmente y la metadata persiste en SQLite.
2.  **Preparación de Despliegue**: El backend transforma los datos en archivos YAML estructurados (`agent-pack.yaml` y `values.yaml`).
3.  **Ejecución en K8s**: El backend invoca a Helm para crear los recursos (Deployments, Services, ConfigMaps) en el cluster.
4.  **Autenticación de Agente**: Una vez que el bot está activo, el sistema consulta su DID público y solicita una **Credencial Verificable (VC)** a la organización raíz (EAFIT).
5.  **Interacción DIDComm**: El usuario final escanea el QR generado, estableciendo un canal cifrado entre su app Hologram y el VS Agent desplegado, permitiendo una conversación segura y verificada.

---

## 7. Bases de Datos Utilizadas

### 7.1. SQLite (Capa de Aplicación)
Se utiliza para la gestión interna de NextAgent:
- Usuarios y sesiones (JWT).
- Perfiles de bots creados (Persona, Prompt, Categoría).
- Registro de estados de despliegue (Pendiente, Publicado, Error).

### 7.2. PostgreSQL (Capa de Persistencia de Agentes)
Almacena la lógica persistente de los agentes publicados:
- **Aislamiento**: Cada bot utiliza un usuario y esquema dedicado.
- **Datos**: Logs de auditoría, historiales de interacciones técnicas y metadatos de configuración persistente del VS Agent.

### 7.3. Redis (Capa de Memoria y RAG)
Fundamental para la experiencia de IA:
- **Memoria de Ventana**: Almacena los últimos turnos de conversación para mantener el contexto.
- **Vector Store**: Indexa los documentos subidos por el usuario (PDF/TXT) permitiendo búsquedas semánticas ultrarrápidas durante la fase de generación (RAG).

---

## 8. APIs, Modelos o Servicios Implementados

*   **API NextAgent (REST)**: Endpoints desarrollados en Express para la gestión de bots, carga de archivos y control de despliegue.
*   **APIs MCP (Model Context Protocol)**:
    *   **Servicio de Clima**: Integración con Open-Meteo para datos geográficos y meteorológicos.
    *   **Servicio de Wikipedia**: Acceso a la base de conocimiento de Wikimedia para resúmenes enciclopédicos.
*   **Modelos de Lenguaje (LLM)**:
    *   **GPT-4o-mini**: Modelo principal para procesamiento complejo y razonamiento de herramientas.
    *   **Llama 3.2 (Ollama)**: Alternativa local para inferencia en el cluster.
*   **Servicios de Identidad**: Conexión con los servicios de **Verana Foundation** para la resolución de DIDs y validación de confianza.

---

## 9. Explicación de Componentes IA

El "cerebro" de cada agente en NextAgent se compone de tres tecnologías convergentes:

### 9.1. Persona Engine (Prompting)
Transformamos el lenguaje natural en instrucciones de sistema rigurosas. El prompt define no solo la personalidad del bot, sino también sus límites éticos, su estilo de respuesta y sus prioridades operativas.

### 9.2. Retrieval-Augmented Generation (RAG)
Permitimos que el agente acceda a conocimiento privado. Cuando un usuario sube un PDF, el sistema lo fragmenta, lo convierte en vectores numéricos (embeddings) y lo almacena. Durante una pregunta, el bot "busca" en estos vectores la información más relevante antes de formular una respuesta.

### 9.3. Agentes de Herramientas (MCP Integration)
A diferencia de los chatbots estáticos, nuestros agentes son dinámicos. Gracias al protocolo MCP, el LLM tiene la capacidad de "decidir" cuándo necesita usar una herramienta externa (como consultar el clima) para responder con datos reales y actuales, en lugar de alucinar o depender de su conocimiento de entrenamiento.

---

## 10. Resultados Obtenidos

*   **Eficiencia Operativa**: Hemos automatizado un proceso técnico que tomaba horas, permitiendo que cualquier usuario despliegue un agente verificado en **menos de 5 minutos**.
*   **Garantía de Confianza**: El 100% de los agentes publicados a través de la plataforma obtienen el sello de **"Verificado"** en la aplicación Hologram, respaldado por la infraestructura de EAFIT.
*   **Flexibilidad Tecnológica**: Implementamos con éxito un sistema que soporta tanto LLMs comerciales (OpenAI) como locales (Ollama), demostrando soberanía tecnológica.
*   **Democratización**: Se eliminó la barrera de entrada para perfiles no técnicos (como los casos de uso de plomeros, guías o soporte técnico), permitiéndoles poseer su propia identidad digital en la red Verana.
---

## 11. Dificultades Encontradas

Durante el desarrollo del proyecto, el equipo enfrentó diversos desafíos técnicos y logísticos que requirieron soluciones creativas y coordinación técnica:

| # | Problema | Fecha aproximada | Impacto | Cómo se solucionó |
|---|---|---|---|---|
| 1 | **Namespace eliminado accidentalmente** en el cluster de producción | 27/04/2026 | Alto — toda la plataforma caída | Se solicitó un nuevo namespace al equipo de EAFIT vía Discord; se restauró la configuración en el mismo día |
| 2 | **Timing de credencialización Verana** — el VS Agent tardaba entre 3 y 7 minutos en registrar su DID antes de estar listo para recibir una VC | 1–5/05/2026 | Alto — los agentes fallaban en publicación | Se implementó un bucle de sondeo con backoff exponencial en el backend; la plataforma espera pacientemente y notifica al usuario el progreso en tiempo real |
| 3 | **Lock de Helm en despliegues fallidos** — un deploy fallido dejaba el release en estado "pending" bloqueando todos los deploys siguientes | 3–4/05/2026 | Alto — CI/CD inoperante | Se agregó un step automático de limpieza del lock (`helm rollback`) antes de cada deploy en el workflow de GitHub Actions |
| 4 | **Google OAuth fallando en producción** — las URLs de callback apuntaban a localhost, causando error en el servidor | 5–6/05/2026 | Medio — OAuth inutilizable en producción | Se migraron las URLs a rutas relativas en el frontend + configuración de `APP_URL` y `CLIENT_DEV_URL` correctas en los Helm values del deployment |
| 5 | **QR no funcional directamente con Hologram** — el QR generado llevaba a la página web del VS Agent en lugar del parámetro OOB de invitación directa | 5–6/05/2026 | Bajo-Medio — QR funciona pero requiere paso adicional | Solución parcial: el QR lleva a la página del VS Agent donde está el QR de Hologram. La solución definitiva (extraer el parámetro OOB) sigue en desarrollo |
| 6 | **Agente no respondía durante la demo intermedia** (6/5) | 6/05/2026 | Alto para la demo | Identificado el día siguiente como un error en la integración del MCP Wikipedia. Corregido por Alejandro el 7/5/2026 |
| 7 | **Descarga de logo fallaba silenciosamente** en el proceso de credencialización, causando que la VC se emitiera sin imagen | 6–7/05/2026 | Medio — credenciales sin avatar | Se eliminó la redirección de errores a `/dev/null` en el script bash, se agregó manejo explícito de errores y skip del agente si la imagen falla |
| 8 | **TLS autofirmado** rechazaba conexiones HTTPS internas de Node.js | Persistente | Bajo-Medio — solo en testnet | Configuración controlada `NODE_TLS_REJECT_UNAUTHORIZED=0` en el entorno testnet académico |
| 9 | **Permisos de GitHub** — Oscar no podía crear ramas en el repositorio | 1/05/2026 | Bajo — bloqueó el inicio de trabajo en el repo | Configuración correcta de la clave SSH local; Alejandro ajustó los permisos del repositorio |
| 10 | **Chatbot respondía en idioma incorrecto** o con respuestas inconsistentes | 3/05/2026 | Medio — experiencia de usuario deficiente | Migración de Groq a OpenAI GPT-4o-mini como modelo base del chatbot |

---

## 12. Recomendaciones

### Recomendaciones generales

#### Para un agente de calidad

- **Sé específico en el prompt**: cuanto más detallado, mejor se comportará el agente. Incluye: tono de voz, idioma, temas que SÍ puede tratar, temas que NO debe tratar, y cómo debe responder cuando no sabe algo.

- **Sube documentos relevantes**: el RAG (base de conocimiento) es la principal fuente de información específica del agente. Un PDF bien estructurado con preguntas frecuentes mejora significativamente la calidad de las respuestas.

- **Prueba antes de compartir el QR**: después de publicar, conéctate tú mismo al agente desde Hologram y verifica que responde correctamente antes de compartirlo con otros.

#### Para la publicación

- **No uses caracteres especiales** en el nombre del agente (evita ñ, tildes, símbolos). Usa letras, números y guiones.
- **No cierres el navegador** durante el proceso de publicación; espera a que aparezca el mensaje de éxito.
- **La primera publicación es la más lenta** (5–7 min). Las republicaciones tras edición son más rápidas.
---

## 13. Conclusiones

1.  **Democratización de la Identidad Digital**: El proyecto demuestra que es posible abstraer la complejidad de los protocolos de identidad descentralizada (DIDs y VCs) mediante interfaces intuitivas. NextAgent permite que el valor de la red Verana llegue a usuarios finales y profesionales sin conocimientos técnicos, cumpliendo el objetivo de democratizar la confianza en la IA.
2.  **Eficiencia en el Despliegue de Agentes**: La automatización integral del pipeline (desde la configuración hasta el despliegue en Kubernetes y la emisión de credenciales) reduce drásticamente las barreras de entrada. Lo que antes requería intervención experta ahora es un proceso reproducible, escalable y auditable que se completa en minutos.
3.  **Valor del Ecosistema Académico-Industrial**: La colaboración entre NODO EAFIT y Verana Foundation proporciona un entorno ideal para la experimentación con tecnologías de vanguardia. Este reto ha permitido aplicar conocimientos de orquestación, desarrollo full-stack e IA en un caso de uso real con impacto directo en la forma en que interactuaremos con agentes inteligentes en el futuro.

---
