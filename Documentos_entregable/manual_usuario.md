---
title: "Manual de Usuario — NextAgent"
subtitle: "Plataforma de Creación y Despliegue de Agentes de IA Verificables"
author:
  - "Oscar David Rojas Bedoya"
  - "Yesid Alejandro Peláez Posada"
date: "Mayo 2026"
lang: es
---

# Manual de Usuario — NextAgent

**Plataforma de Creación y Despliegue de Agentes de IA Verificables**

> **URL de la plataforma:** https://persona-ai.team-g.teams.eafit.testnet.verana.network  
> **Versión:** 1.0 · Mayo 2026

---

## Tabla de Contenidos

1. [Introducción](#1-introducción)
2. [Cómo ingresar al sistema](#2-cómo-ingresar-al-sistema)
3. [Cómo usar la solución](#3-cómo-usar-la-solución)
4. [Funcionalidades principales](#4-funcionalidades-principales)
5. [Casos de uso](#5-casos-de-uso)
6. [Errores comunes y recomendaciones](#6-errores-comunes-y-recomendaciones)

---

## 1. Introducción

**NextAgent** es una plataforma web que permite a **cualquier persona — sin conocimientos técnicos** — crear, configurar y publicar su propio **Persona AI Agent** verificable, accesible desde la aplicación **Hologram Messaging**.

Un **Persona AI Agent** es un agente de inteligencia artificial que representa a una persona o servicio y puede interactuar con usuarios a través de Hologram de forma verificable y criptográficamente segura. Cada agente publicado en NextAgent:

- Posee una **identidad DID** (Decentralized Identifier) propia.
- Recibe una **Credencial Verificable** emitida por EAFIT a través de la red Verana.
- Establece **conversaciones cifradas** vía el protocolo DIDComm.
- Puede consultar **información externa en tiempo real** mediante integraciones MCP (clima, Wikipedia).

### ¿Qué necesita el usuario?

| Requisito | Detalle |
|---|---|
| Navegador web | Chrome, Firefox, Edge o Safari actualizado |
| Cuenta en NextAgent | Registro con email o Google |
| App Hologram | Para conectarse al agente creado (opcional para probar) |
| Conexión a internet | Requerida en todo momento |

> **No se requiere** ningún conocimiento de programación, Docker, Kubernetes ni infraestructura.

---

## 2. Cómo ingresar al sistema

### 2.1. Acceder a la plataforma

Abre tu navegador web y dirígete a:

```
https://persona-ai.team-g.teams.eafit.testnet.verana.network
```

Verás la pantalla de inicio de sesión de NextAgent.

> **Nota:** La plataforma usa un certificado TLS del entorno testnet de EAFIT. Si el navegador muestra una advertencia de seguridad, haz clic en *"Avanzado"* → *"Continuar al sitio"*. Esto es normal en el entorno académico.

---

### 2.2. Opción A — Registro con email y contraseña

Si es la primera vez que usas la plataforma:

1. Haz clic en **"¿No tienes cuenta? Regístrate"**.
2. Ingresa tu **nombre**, **correo electrónico** y una **contraseña** (mínimo 8 caracteres).
3. Haz clic en **"Crear cuenta"**.
4. Serás redirigido automáticamente al **Dashboard principal**.

Si ya tienes cuenta:

1. Ingresa tu **correo electrónico** y **contraseña**.
2. Haz clic en **"Iniciar sesión"**.

---

### 2.3. Opción B — Acceso con Google OAuth

1. En la pantalla de login, haz clic en **"Continuar con Google"**.
2. Selecciona tu cuenta de Google en la ventana emergente.
3. Autoriza el acceso a NextAgent.
4. Serás redirigido al **Dashboard principal**.

> Con Google no necesitas recordar contraseñas adicionales. Es el método recomendado.

---

### 2.4. Cerrar sesión

Desde cualquier pantalla, haz clic en tu nombre de usuario (esquina inferior izquierda) y selecciona **"Cerrar sesión"**.

---

## 3. Cómo usar la solución

### 3.1. Visión general del flujo

```
Registro / Login
      │
      ▼
Dashboard — ver mis agentes
      │
      ▼
Crear nuevo agente → Configurar → Guardar
      │
      ▼
Publicar (un clic) → Esperar despliegue (~5 min)
      │
      ▼
Obtener QR de conexión → Compartir con usuarios finales
      │
      ▼
Usuarios finales se conectan desde Hologram
```

---

### 3.2. Paso 1 — Crear un nuevo agente

Desde el **Dashboard**, haz clic en el botón **"+ Nuevo Bot"**.

Se abrirá el formulario de configuración del agente. Completa los siguientes campos:

#### Datos de identidad del agente

| Campo | Descripción | Ejemplo |
|---|---|---|
| **Nombre** | Nombre visible del agente | `Dr. Carlos Asistente` |
| **Profesión / Categoría** | Tipo de servicio que ofrece | `Médico general` |
| **Descripción** | Texto breve que verán los usuarios en Hologram | `Agente IA para agendar consultas médicas` |
| **Foto de perfil** | Imagen representativa (JPG/PNG, máx. 2 MB) | Logo de la clínica |

#### Personalidad del agente (Prompt)

El **prompt del sistema** define cómo se comporta el agente en las conversaciones. Escribe instrucciones en lenguaje natural. Por ejemplo:

```
Eres un asistente médico amable y profesional. Ayudas a los pacientes
a agendar citas con el Dr. García. Responde siempre en español, de forma
clara y empática. No brindes diagnósticos médicos, solo gestiona citas.
```

> **Consejo:** Sé específico sobre el tono, el idioma y lo que el agente debe o no debe hacer.

#### Documentos de conocimiento (RAG)

Sube archivos que el agente usará como **base de conocimiento** para responder preguntas específicas:

- Formatos aceptados: `.pdf`, `.txt`, `.md`
- Tamaño máximo por archivo: 5 MB
- Ejemplos: tarifario de servicios, preguntas frecuentes, manual de procedimientos.

#### Servicios MCP (herramientas externas)

Selecciona las herramientas que el agente podrá consultar durante la conversación:

| Herramienta | Qué hace |
|---|---|
| **Clima (Open-Meteo)** | Consulta el clima actual o pronóstico de cualquier ciudad |
| **Wikipedia (Wikimedia)** | Busca y resume información de Wikipedia |
| **Google Calendar** | Gestiona eventos de calendario *(en ajuste)* |

---

### 3.3. Paso 2 — Guardar el agente

Una vez completados los campos, haz clic en **"Guardar"**. El agente quedará en estado **"Borrador"** — visible solo para ti en el Dashboard, sin estar publicado.

Puedes volver a editarlo en cualquier momento haciendo clic sobre su nombre en el Dashboard.

---

### 3.4. Paso 3 — Publicar el agente

Cuando el agente esté listo para ser accesible desde Hologram:

1. Abre el agente desde el Dashboard.
2. Haz clic en el botón **"Publicar"**.
3. Aparecerá un **overlay de progreso** que mostrará las etapas del despliegue:

```
[1/4] Preparando configuración del agente...
[2/4] Desplegando en Kubernetes...
[3/4] Esperando inicialización del agente...
[4/4] Emitiendo credencial verificable (EAFIT)...
✅ ¡Agente publicado con éxito!
```

> **El proceso tarda entre 3 y 7 minutos.** No cierres el navegador durante este tiempo.

Una vez publicado, el agente mostrará:
- Su **URL pública** (dominio en `agents.team-g.teams.eafit.testnet.verana.network`).
- Un **código QR** para que los usuarios finales se conecten desde Hologram.

---

### 3.5. Paso 4 — Conectar desde Hologram

Comparte el **QR de conexión** o la **URL pública** del agente con los usuarios finales. Ellos:

1. Abren la app **Hologram Messaging** (disponible en iOS, Android y web).
2. Escanean el QR o acceden a la URL del agente.
3. Hologram muestra la **identidad verificable** del agente (credencial emitida por EAFIT).
4. El usuario acepta la conexión y comienza a chatear.

---

### 3.6. Paso 5 — Desmontar o eliminar un agente

- **Desmontar**: detiene el agente en Kubernetes pero conserva su configuración. Haz clic en **"Desmontar"** en la página del agente. El agente deja de ser accesible desde Hologram.
- **Eliminar**: borra permanentemente el agente y toda su configuración. Esta acción **no se puede deshacer**.

---

## 4. Funcionalidades principales

### 4.1. Gestión de agentes (Dashboard)

El Dashboard es la pantalla principal. Desde aquí puedes:

- **Ver** todos los agentes creados con su estado (Borrador / Publicado).
- **Acceder** a la configuración de cada agente con un clic.
- **Crear** nuevos agentes con el botón "+ Nuevo Bot".
- **Ver de un vistazo** el estado de salud de cada agente publicado.

---

### 4.2. Creación y edición de agentes

- Formulario guiado con todos los parámetros del agente.
- Subida de imagen de perfil directamente desde el formulario.
- Subida de documentos RAG (PDF, TXT, MD) para la base de conocimiento.
- Selección de servidores MCP disponibles en la plataforma.
- Editor de prompt del sistema con texto libre.
- Guardado automático de borradores.

---

### 4.3. Publicación automatizada en Kubernetes

Con un solo clic, la plataforma ejecuta automáticamente:

1. Generación de la configuración técnica (Helm values, agent-pack.yaml).
2. Creación de una base de datos dedicada para el agente.
3. Despliegue del VS Agent y chatbot en el cluster Kubernetes de EAFIT.
4. Emisión de la **Credencial Verificable de Servicio** a través de la red Verana.
5. Asignación de un dominio público único para el agente.

---

### 4.4. QR de conexión

Cada agente publicado muestra un **código QR** en su página de detalle. Este QR contiene la URL de conexión del agente en la red Hologram. Compartirlo es suficiente para que cualquier usuario con Hologram pueda conectarse.

---

### 4.5. Integraciones MCP

Cuando un usuario del agente pregunta sobre un tema cubierto por MCP, el agente consulta automáticamente la fuente externa y usa la información en su respuesta:

- *"¿Qué tiempo hace hoy en Medellín?"* → el agente consulta Open-Meteo y responde con datos reales.
- *"¿Qué es el DIDComm?"* → el agente busca en Wikipedia y resume el artículo.

El usuario final no necesita saber que se están usando estas integraciones; el agente las usa de forma transparente.

---

### 4.6. Autenticación segura

- **Login local** con correo y contraseña (cifrada con hash seguro).
- **Google OAuth 2.0** para inicio de sesión rápido sin contraseña adicional.
- **JWT** para manejo de sesiones: cada sesión tiene un tiempo de vida limitado.
- **Logout** disponible en todo momento.

---

## 5. Casos de uso

### Caso 1 — Profesional independiente (plomero, electricista, médico)

**Objetivo:** ofrecer a los clientes un agente que gestione citas y responda preguntas frecuentes.

**Flujo:**
1. El profesional crea un agente en NextAgent con su nombre, foto y descripción del servicio.
2. Escribe un prompt: *"Ayudas a agendar citas con el Sr. Pérez, plomero. Horario disponible: lunes a viernes 8 AM - 6 PM."*
3. Sube un PDF con su tarifario de servicios como documento RAG.
4. Activa la integración de **Google Calendar** (cuando esté disponible).
5. Publica el agente y comparte el QR en su WhatsApp o tarjeta de presentación.
6. Los clientes escanean el QR desde Hologram y agendan su cita conversando con el agente.

---

### Caso 2 — Institución educativa

**Objetivo:** agente que responde preguntas de aspirantes sobre programas académicos.

**Flujo:**
1. La institución crea un agente llamado *"Asistente de Admisiones EAFIT"*.
2. Prompt: *"Eres el asistente de admisiones de EAFIT. Respondes preguntas sobre programas, fechas de inscripción y requisitos."*
3. Sube el documento oficial del proceso de admisiones como RAG.
4. Activa la integración de **Wikipedia** para responder preguntas generales sobre la institución.
5. Publica el agente y lo integra en la página web institucional como QR de contacto.

---

### Caso 3 — Agente informativo con clima

**Objetivo:** guía turístico virtual que combina información y clima local.

**Flujo:**
1. Prompt: *"Eres un guía turístico de Cartagena. Ayudas a los turistas a planificar su visita con información histórica y clima actual."*
2. Activa **Open-Meteo** (clima) y **Wikipedia** (información histórica).
3. El turista pregunta: *"¿Qué puedo visitar hoy? ¿Va a llover?"*
4. El agente responde con información de Wikipedia sobre atracciones y el pronóstico del tiempo de Open-Meteo.

---

### Caso 4 — Soporte técnico empresarial

**Objetivo:** primer nivel de soporte que filtra y responde consultas frecuentes.

**Flujo:**
1. Prompt: *"Eres el soporte técnico de nivel 1 de TechCorp. Resuelves dudas básicas sobre nuestros productos y escals los casos complejos al equipo humano."*
2. Sube manuales y guías de productos en PDF como base RAG.
3. Publica el agente y comparte el QR con los clientes vía email o factura.

---

## 6. Errores comunes y recomendaciones

### 6.1. Tabla de errores frecuentes

| Situación | Causa probable | Solución |
|---|---|---|
| La página muestra advertencia de certificado SSL | Certificado autofirmado del entorno testnet | Haz clic en "Avanzado" → "Continuar al sitio" |
| El login con Google no funciona | Ventana emergente bloqueada por el navegador | Permite ventanas emergentes para este sitio en la configuración del navegador |
| La publicación tarda más de 10 minutos | El cluster puede estar bajo alta carga | Espera hasta 15 minutos; si no responde, intenta despublicar y publicar de nuevo |
| El agente queda en estado "error" tras publicar | Falló el despliegue Kubernetes o la credencialización | Despublica, revisa que el nombre del agente no tenga caracteres especiales, y vuelve a publicar |
| El QR no conecta desde Hologram | El agente aún está inicializándose | Espera 2–3 minutos después de que aparezca el QR y vuelve a intentarlo |
| No puedo subir un documento RAG | Formato no soportado o archivo mayor a 5 MB | Convierte el archivo a PDF o TXT y asegúrate de que pese menos de 5 MB |
| No recuerdo mi contraseña | — | Por ahora, crea una nueva cuenta o usa "Continuar con Google" con el mismo correo |
| El agente responde en el idioma equivocado | El prompt no especifica el idioma | Agrega al inicio del prompt: *"Responde siempre en español."* |

---

### 6.2. Recomendaciones generales

#### Para un agente de calidad

- **Sé específico en el prompt**: cuanto más detallado, mejor se comportará el agente. Incluye: tono de voz, idioma, temas que SÍ puede tratar, temas que NO debe tratar, y cómo debe responder cuando no sabe algo.

- **Sube documentos relevantes**: el RAG (base de conocimiento) es la principal fuente de información específica del agente. Un PDF bien estructurado con preguntas frecuentes mejora significativamente la calidad de las respuestas.

- **Prueba antes de compartir el QR**: después de publicar, conéctate tú mismo al agente desde Hologram y verifica que responde correctamente antes de compartirlo con otros.

#### Para la publicación

- **No uses caracteres especiales** en el nombre del agente (evita ñ, tildes, símbolos). Usa letras, números y guiones.
- **No cierres el navegador** durante el proceso de publicación; espera a que aparezca el mensaje de éxito.
- **La primera publicación es la más lenta** (5–7 min). Las republicaciones tras edición son más rápidas.

#### Para Hologram

- Asegúrate de tener instalada la versión más reciente de **Hologram Messaging** (iOS/Android).
- Si el QR no escanea correctamente, accede directamente a la URL pública del agente desde el navegador del teléfono.
- La conexión inicial con el agente puede tardar 10–20 segundos en establecerse por primera vez.

#### Seguridad

- **No compartas tu contraseña** de NextAgent con nadie.
- Si usas Google OAuth, asegúrate de que tu cuenta de Google tiene verificación en dos pasos activada.
- Los documentos RAG que subes son privados y solo los usa tu agente. No se comparten entre usuarios.

---

## Apéndice — Glosario

| Término | Definición |
|---|---|
| **DID** | Decentralized Identifier — identificador único y verificable para un agente o persona, no controlado por ninguna empresa centralizada |
| **Credencial Verificable (VC)** | Documento digital firmado criptográficamente que certifica la identidad o atributos de un agente |
| **DIDComm** | Protocolo de comunicación cifrado punto a punto basado en DIDs, usado por Hologram |
| **VS Agent** | Verifiable Service Agent — componente que gestiona la identidad DID del agente de IA |
| **MCP** | Model Context Protocol — estándar que permite a los agentes IA acceder a herramientas y datos externos |
| **RAG** | Retrieval-Augmented Generation — técnica que permite al agente buscar en documentos propios antes de responder |
| **Hologram** | App de mensajería para interactuar con agentes IA verificables |
| **Verana** | Red de confianza descentralizada basada en DIDs y Credenciales Verificables W3C |
| **Kubernetes** | Sistema de orquestación de contenedores donde se despliegan los agentes |
| **Helm** | Gestor de paquetes para Kubernetes, usado internamente por NextAgent para desplegar cada agente |

---

*Manual de Usuario — NextAgent v1.0 · Verana Foundation × NODO EAFIT · Mayo 2026*
