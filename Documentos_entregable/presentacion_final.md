# Presentación Técnica Final — NextAgent
## Plataforma de Creación y Despliegue de Agentes de IA Verificables

**Equipo:** Oscar David Rojas Bedoya · Yesid Alejandro Peláez Posada  
**Proyecto:** Beca IA Ser ANDI — Reto EAFIT × Verana  
**Fecha:** Mayo 2026

---

## 1. Arquitectura Técnica

La plataforma **NextAgent** utiliza una arquitectura de microservicios orquestada en **Kubernetes** (namespace `team-g`). Se divide en tres capas principales:

1.  **Frontend (React + Vite)**: Interfaz de usuario intuitiva que permite gestionar el ciclo de vida de los agentes.
2.  **Backend (Node.js + Express)**: Actúa como el orquestador, gestionando la lógica de negocio, la persistencia y la comunicación con el cluster de Kubernetes mediante Helm.
3.  **Capa de Agentes**: Cada bot publicado es un despliegue independiente que contiene:
    *   **Chatbot (Hologram AI Agent)**: El motor de conversación.
    *   **VS Agent (Verana)**: La capa de identidad y comunicación DIDComm.

### Diagrama de Arquitectura
![Arquitectura del Proyecto](https://raw.githubusercontent.com/alejopp/agent-challenge-eafit/main/web-app/public/screenshots/architecture-diagram.png)
*(Nota: Reemplazar con la imagen de soporte proporcionada)*

---

## 2. Flujo de Datos

El flujo de información en NextAgent está diseñado para ser asíncrono y seguro:

1.  **Configuración**: El usuario define el "Persona" del agente (nombre, prompt, herramientas MCP).
2.  **Generación de Assets**: El backend genera dinámicamente archivos `agent-pack.yaml` y valores de Helm específicos para ese bot.
3.  **Despliegue**: Se ejecuta un comando `helm upgrade` que levanta los pods en el cluster.
4.  **Verificación de Identidad**: Una vez el pod está activo, el backend detecta el DID del agente y solicita automáticamente una **Credencial Verificable** a la autoridad de confianza (EAFIT).
5.  **Publicación**: El bot queda disponible en la red Verana y se genera un QR de invitación OOB para que los usuarios lo agreguen en la app Hologram.

---

## 3. Bases de Datos Utilizadas

El sistema implementa una estrategia de persistencia híbrida:

*   **SQLite (Plataforma)**: Utilizada por el servidor central de NextAgent para gestionar usuarios, perfiles de bots y estados de publicación de forma ágil y ligera.
*   **PostgreSQL (Agentes)**: Instancia compartida donde cada bot posee su propio **Schema dedicado**. Aquí se almacenan los logs de auditoría y estados persistentes de cada agente.
*   **Redis (Memoria y Vectores)**: Utilizada por los bots para la memoria de corto plazo (ventana de conversación) y como motor de búsqueda semántica para los documentos RAG (Retrieval-Augmented Generation).

---

## 4. APIs, Modelos y Servicios Implementados

*   **Modelos de Lenguaje (LLM)**: Uso de **GPT-4o-mini** (vía OpenAI) y **Llama 3.2** (vía Ollama local) mediante una interfaz compatible con OpenAI.
*   **Servidores MCP (Model Context Protocol)**:
    *   **Open-Meteo**: API para consultas climáticas en tiempo real.
    *   **Wikipedia (Wikimedia)**: Búsqueda de conocimiento externo y resúmenes históricos.
*   **Servicios de Identidad**: Integración con el **VS Agent Admin API** para la gestión de DIDs y canales DIDComm.
*   **OAuth 2.0**: Integración con Google Cloud para autenticación federada de usuarios.

---

## 5. Explicación de Componentes de IA

La inteligencia de los agentes se basa en tres pilares:

1.  **Prompting de Persona**: Definición de la identidad, tono y límites del agente mediante "System Prompts" dinámicos.
2.  **RAG (Retrieval-Augmented Generation)**: Capacidad de procesar archivos PDF/TXT subidos por el usuario, indexarlos en Redis y permitir que el agente responda basándose en conocimiento propietario.
3.  **Tool Use (MCP)**: El agente puede decidir autónomamente cuándo usar herramientas externas (clima o Wikipedia) para enriquecer sus respuestas con datos reales.

---

## 6. Resultados Obtenidos

*   **Automatización**: Reducción del tiempo de despliegue de un agente verificable de 2 horas (manual) a menos de **5 minutos**.
*   **Identidad Verificable**: El 100% de los agentes creados en la plataforma obtienen automáticamente su estado de **"Verificado"** en la red Verana.
*   **Accesibilidad**: Una interfaz web que permite a usuarios no técnicos participar en el ecosistema de Identidad Descentralizada.
*   **Escalabilidad**: Soporte para múltiples agentes operando simultáneamente bajo una infraestructura compartida optimizada.

---
*Documento generado para el entregable final del reto "Agentes IA Verificables con Hologram" — Mayo 2026*
