# Guía de Presentación Final — NextAgent
## Pitch ante audiencia de alto impacto · Versión concisa

> **Regla de oro de cada diapositiva:** una idea, una emoción, un dato.  
> **Duración total sugerida:** 10–12 minutos + 3 min preguntas  
> **Audiencia:** jueces, evaluadores, academia, público mixto técnico/no técnico

---

---
## SLIDE 1 — PORTADA
---

```
NextAgent
─────────────────────────────────
Trust your agents.
─────────────────────────────────
Agentes de IA con identidad verificable,
comunicación cifrada y control total.

IDENTIDAD REAL · IMPACTO REAL

Oscar David Rojas Bedoya · Yesid Alejandro Peláez Posada
Beca IA Ser ANDI · NODO EAFIT · Verana Foundation · 2026
```

**Diseño:** fondo oscuro, tipografía grande, línea de tagline en azul/teal  
**Nota del presentador:** Silencio de 3 segundos antes de hablar. Dejar que el tagline *"Trust your agents"* genere la pregunta.

---

---
## SLIDE 2 — EL PROBLEMA
---

**Titular:**
> *¿Confías en tu agente de IA?*

**Tres preguntas en pantalla (una por una, con animación):**
1. ¿Quién controla lo que el agente puede hacer?
2. ¿Cómo verifico que el agente es quien dice ser?
3. ¿Cómo sé que mis datos están protegidos?

**Frase de cierre:**
> *"Es como darle las llaves de tu empresa a un empleado sin contrato, sin identificación y sin límites."*

**Dato de impacto (recuadro lateral):**

| Estadística | Fuente |
|---|---|
| **56%** de organizaciones reporta incidentes de seguridad relacionados con IA | IBM X-Force, 2024 |
| Solo **24%** tiene políticas de gobernanza — aunque el 77% cree que la IA será transformadora | McKinsey, 2024 |
| **81%** de consumidores dice que la confianza en la marca es decisiva para adoptar IA | Deloitte, 2024 |

**Nota del presentador:** Hacer la primera pregunta directo a la audiencia. Pausa. Dejar el incómodo silencio. Luego continuar con las cifras — son todas verificables y recientes.

---

---
## SLIDE 3 — LA SOLUCIÓN PROPUESTA
---

**Titular:**
> *NextAgent: la plataforma donde cada agente tiene identidad, cifrado y control — con un clic.*

**Cuatro pilares (íconos + línea cada uno):**

| Pilar | Qué resuelve |
|---|---|
| 🔐 **Identidad Verificable (SSI)** | Cada agente se autentica con credenciales criptográficas — no con un simple login |
| 🔒 **Comunicación Cifrada (DIDComm)** | Ningún intermediario puede leer los mensajes entre usuario y agente |
| 🛠️ **Herramientas Controladas (MCP)** | El agente solo accede a lo que el usuario autoriza explícitamente |
| 📚 **Conocimiento Privado (RAG)** | El conocimiento de un agente nunca se mezcla con el de otro |

**Dato de oportunidad:**
> *El mercado de IA generativa llegará a **$1.3 billones para 2032** (Bloomberg, 2023).  
> Aún no existe un estándar de confianza. **NextAgent es ese estándar.***

**Nota del presentador:** Conectar directamente con el problema anterior: "Todo lo que preguntamos en la slide anterior, NextAgent lo resuelve." No más de 60 segundos en esta slide.

---

---
## SLIDE 4 — ARQUITECTURA
---

**Titular:**
> *Complejidad técnica invisible para el usuario — automatización total bajo el capó.*

**Diagrama simplificado:**

```
USUARIO FINAL          NEXTAGENT               INFRAESTRUCTURA
─────────────          ─────────               ───────────────
App Hologram    ──▶    Formulario web   ──▶    Kubernetes (EAFIT)
Escanea QR             [1 clic Publicar]        VS Agent + Chatbot
Ve credencial          Genera toda la           PostgreSQL · Redis
verificable            config técnica           OpenAI GPT-4o-mini
de EAFIT               automáticamente
```

**Lo que el usuario hace vs. lo que ocurre por detrás:**

| El usuario hace... | NextAgent ejecuta automáticamente... |
|---|---|
| Llena un formulario | Genera Helm values + agent-pack.yaml |
| Hace clic en "Publicar" | Despliega VS Agent en Kubernetes |
| Ve un QR en pantalla | Emite credencial verificable firmada por EAFIT |

**Nota del presentador:** Para la audiencia no técnica: "Todo lo complejo ocurre en esa segunda columna — el usuario solo ve el formulario." Para la técnica: destacar la automatización de Helm + credencial Verana.

---

---
## SLIDE 5 — USO DE IA
---

**Titular:**
> *Tres capas de IA que trabajan juntas en cada conversación.*

**Tres bloques visuales:**

```
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  GPT-4o-mini     │  │  RAG             │  │  MCP             │
│                  │  │                  │  │                  │
│  El cerebro      │  │  La memoria      │  │  Los sentidos    │
│  del agente      │  │  del negocio     │  │  del mundo       │
│                  │  │                  │  │                  │
│  Responde con    │  │  Tus documentos  │  │  Clima ·         │
│  lenguaje        │  │  PDF · TXT · MD  │  │  Wikipedia ·     │
│  natural         │  │  como base de    │  │  Google Calendar │
│                  │  │  conocimiento    │  │  (tiempo real)   │
└──────────────────┘  └──────────────────┘  └──────────────────┘
```

**Ejemplo concreto en pantalla:**
> *Un médico sube su tarifario → el agente responde con precios reales.*  
> *Un turista pregunta "¿va a llover hoy?" → el agente consulta Open-Meteo y responde.*

**Dato:**
> **25%** del software empresarial usará agentes de IA para 2028 — Gartner, 2024

**Nota del presentador:** La diferencia clave: "Un ChatGPT genérico no sabe nada de tu negocio. Con RAG, el agente se convierte en el experto de tu propio contexto."

---

---
## SLIDE 6 — RESULTADOS
---

**Titular:**
> *De semanas de trabajo técnico a 10 minutos para cualquier persona.*

**Métricas de la plataforma:**

| ✅ Funcionalidad | Estado |
|---|---|
| Plataforma en producción | `persona-ai.team-g.teams.eafit.testnet.verana.network` |
| Agentes publicados y verificables en Hologram | Funcional |
| Publicación automática en Kubernetes con 1 clic | Funcional |
| Credencial verificable firmada por EAFIT | Funcional |
| 2 integraciones MCP (Clima + Wikipedia) | Funcionales |
| CI/CD automatizado (GitHub Actions) | Funcional |
| Login con Google OAuth | Funcional |

**Número de impacto (en grande, centrado):**
```
     ANTES          →          HOY
  Días / semanas         10 minutos
  Solo para expertos     Para cualquier persona
```

**Nota del presentador:** Si es posible, abrir la URL en vivo. Si no, mostrar captura de pantalla real. El agente Alice es el mejor argumento — ya existe, ya es verificable.

---

---
## SLIDE 7 — APRENDIZAJES
---

**Titular:**
> *Lo que este reto nos dejó más allá del código.*

**Cuatro áreas con un aprendizaje clave por área:**

| Área | Aprendizaje central |
|---|---|
| 🌐 **Desarrollo Web** | Autenticar con JWT + Google OAuth en producción es muy diferente a hacerlo en localhost |
| 🐳 **Docker + CI/CD** | Un pipeline roto puede bloquearse solo — aprendimos a limpiar locks y hacer probing post-deploy |
| 🔐 **Verana / Hologram** | La identidad descentralizada no es teoría: tiene timing real, propagación en red y casos borde |
| 🤖 **IA aplicada** | RAG + MCP transforma un chatbot genérico en un experto verificable del contexto del negocio |

**Frase final de la slide (en grande):**
> *"La tecnología más avanzada pierde valor si el usuario no puede usarla. Construir para personas es el verdadero reto técnico."*

**Nota del presentador:** Ser honestos — este fue el aprendizaje más valioso. La parte técnica se domina con tiempo. Entender al usuario es lo que diferencia una herramienta de una solución.

---

---
## SLIDE 8 — RETOS ENCONTRADOS
---

**Titular:**
> *Los obstáculos que hicieron la plataforma más robusta.*

**Tres retos principales (problema → solución en una línea):**

| Reto | Cómo lo resolvimos |
|---|---|
| ⏳ **El agente tardaba 3–7 min en registrar su DID** antes de poder recibir una credencial | Bucle de sondeo con backoff — la plataforma espera y notifica al usuario en tiempo real |
| 🔒 **Un deploy fallido bloqueaba todos los siguientes** (lock de Helm) | Step automático de limpieza del lock antes de cada deploy en el pipeline CI/CD |
| 🌐 **Google OAuth fallaba en producción** porque las URLs apuntaban a localhost | Rutas relativas en el frontend + configuración correcta de variables en Helm values |

**Mensaje clave:**
> *Cada reto superado es evidencia de que la plataforma fue probada en condiciones reales de producción — no solo en un entorno local.*

**Nota del presentador:** No presentar los retos como fracasos. Son evidencia de profundidad. Cualquier evaluador técnico sabe que estos problemas solo aparecen cuando algo está realmente desplegado en producción.

---

---
## SLIDE 9 — FUTURO DEL PROYECTO
---

**Titular:**
> *Una plataforma donde publicar un agente verificable sea tan simple como publicar una página web.*

**Roadmap en tres horizontes (visual tipo línea de tiempo):**

| Horizonte | Qué viene |
|---|---|
| 🔜 **Corto plazo** | QR de invitación OOB directa · Google Calendar MCP · Store relacional (SQLite → PostgreSQL) |
| 📅 **Mediano plazo** | Panel de métricas por agente · Más integraciones MCP (CRM, Sheets, WhatsApp) · Multi-organización |
| 🚀 **Largo plazo** | Marketplace de agentes verificables · App móvil nativa · Motor RAG semántico (pgvector) |

**Dato de cierre:**
> *Para 2028, **25% del software empresarial usará agentes de IA** (Gartner).  
> La pregunta no es si habrá agentes — es si serán **verificables y confiables.***

**Nota del presentador:** Cerrar con la visión, no con el backlog. La audiencia recuerda las ideas grandes, no las listas de tareas.

---

---
## SLIDE 10 — CIERRE
---

**Titular (en grande, centrado):**
```
NextAgent
─────────────────────────────────────
"No se trata de construir agentes
más inteligentes.
Se trata de construir agentes
en los que puedas confiar."
─────────────────────────────────────
```

**QR y accesos (para que la audiencia escanee en vivo):**

| | |
|---|---|
| 🌐 Plataforma en producción | `persona-ai.team-g.teams.eafit.testnet.verana.network` |
| 🤖 Agente verificable en Hologram | `alice.agents.team-g.teams.eafit.testnet.verana.network` |
| 💻 Código abierto | `github.com/alejopp/agent-challenge-eafit` |

**Equipo:**  
**Oscar David Rojas Bedoya · Yesid Alejandro Peláez Posada**  
Beca IA Ser ANDI · NODO EAFIT · Verana Foundation · 2026

**Nota del presentador:** Dejar la diapositiva en pantalla durante las preguntas. Quien tenga Hologram puede conectarse al agente Alice en vivo durante la sesión de preguntas — ese es el mejor argumento final.

---

---
## RESUMEN EJECUTIVO
---

| # | Slide | Mensaje de 1 línea | Tiempo |
|---|---|---|---|
| 1 | Portada | *Trust your agents* | 20 seg |
| 2 | Problema | *56% reporta incidentes — nadie puede verificar su agente de IA* | 2 min |
| 3 | Solución | *Identidad + cifrado + control — con un clic* | 1.5 min |
| 4 | Arquitectura | *El usuario ve un formulario. Por detrás: Kubernetes + Verana* | 1.5 min |
| 5 | Uso de IA | *GPT + RAG + MCP = agente experto en tu contexto* | 1 min |
| 6 | Resultados | *De semanas a 10 minutos — en producción ahora* | 1 min |
| 7 | Aprendizajes | *La parte más técnica fue aprender a pensar en el usuario* | 1 min |
| 8 | Retos | *Problemas reales de producción, soluciones reales* | 1 min |
| 9 | Futuro | *Publicar un agente verificable, tan fácil como una página web* | 1 min |
| 10 | Cierre | *Trust your agents — escanea el QR* | 30 seg |

**Total: ~11 minutos + 3 min preguntas**

---

### Estadísticas verificables de referencia

| Dato | Fuente |
|---|---|
| Mercado IA generativa: **$1.3T para 2032, creciendo al 42% anual** | Bloomberg Intelligence, 2023 |
| **77%** cree que la IA será transformadora; solo **24%** tiene gobernanza | McKinsey Global Survey on AI, 2024 |
| **56%** de organizaciones con incidentes de seguridad por IA | IBM X-Force Threat Intelligence Index, 2024 |
| **25%** del software empresarial usará agentes de IA para 2028 | Gartner Emerging Tech Report, 2024 |
| **81%** de consumidores: la confianza en la marca es clave para adoptar IA | Deloitte Digital Trust Survey, 2024 |

---

*Guía de presentación final — NextAgent v2.0 · Mayo 2026*
