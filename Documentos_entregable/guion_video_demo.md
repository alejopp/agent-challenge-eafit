# Guion para Video Demo — NextAgent
## Plataforma de Creación y Despliegue de Agentes de IA Verificables

**Duración estimada:** 4 minutos

---

### Bloque 1: El Problema (0:00 - 0:45)
**Visual:** Pantalla dividida. A la izquierda, un chat genérico de WhatsApp/Telegram sin identidad. A la derecha, el logo de Verana tachado con una cruz roja.
**Audio (Voz en off):**
"Hoy en día, interactuamos con decenas de chatbots, pero ¿cómo sabemos quién está realmente detrás de ellos? ¿Es una empresa legítima o un atacante suplantando una identidad? 

Hasta ahora, publicar un agente de IA con identidad verificable mediante DIDs y Credenciales Verificables era un proceso técnico extremadamente complejo, que requería conocimientos avanzados en Kubernetes, Helm y protocolos criptográficos. Esto dejaba a profesionales y pequeñas empresas fuera del ecosistema de confianza de Verana y Hologram."

---

### Bloque 2: La Solución - NextAgent (0:45 - 1:15)
**Visual:** Intro animada de la plataforma NextAgent con el dashboard principal.
**Audio (Voz en off):**
"Presentamos **NextAgent**, la plataforma que democratiza el acceso a la identidad digital descentralizada. NextAgent es un orquestador que permite a cualquier usuario crear, configurar y desplegar su propio 'Persona AI Agent' en minutos, sin escribir una sola línea de código, garantizando que cada bot nazca con una identidad verificada y segura."

---

### Bloque 3: Demo - Flujo de Creación (1:15 - 2:30)
**Visual:** Grabación de pantalla de la plataforma web.
**Audio (Voz en off):**
"Veamos cómo funciona. Primero, iniciamos sesión, ya sea de forma local o mediante Google OAuth. En el dashboard, podemos ver nuestros agentes activos.

Al crear un nuevo agente, definimos su 'Persona'. Le damos un nombre, elegimos su profesión y subimos una imagen de perfil. Pero lo más importante es su 'Cerebro': aquí definimos el prompt que guiará su comportamiento y podemos subir documentos PDF o TXT para alimentar su base de conocimiento mediante RAG.

Con un solo clic en 'Publicar', NextAgent se encarga de todo el trabajo sucio en el cluster de Kubernetes: genera los assets, configura la base de datos aislada y solicita automáticamente la Credencial Verificable a la red Verana."

---

### Bloque 4: Verificación en Hologram (2:30 - 3:15)
**Visual:** Grabación de pantalla de un celular usando la app Hologram. Se ve el escaneo del QR en la web y la apertura del chat.
**Audio (Voz en off):**
"Una vez publicado, obtenemos un QR de invitación. Al escanearlo desde la app Hologram, el canal DIDComm cifrado se establece instantáneamente. 

Noten lo más importante: la insignia de verificación. Hologram confirma que este agente pertenece a la organización EAFIT. Ahora, el usuario puede interactuar con total confianza, sabiendo que la identidad del bot es criptográficamente real."

---

### Bloque 5: Inteligencia y Resultados (3:15 - 3:45)
**Visual:** El chatbot respondiendo una pregunta sobre el clima o buscando en Wikipedia. Esquema técnico rápido de fondo.
**Audio (Voz en off):**
"Nuestros agentes no solo hablan, también actúan. Mediante el protocolo MCP, pueden consultar el clima en tiempo real o buscar información en Wikipedia. Todo esto es procesado por modelos avanzados como GPT-4o-mini o Llama 3.2, corriendo de forma eficiente en nuestra infraestructura compartida de Postgres y Redis.

¿El resultado? Hemos reducido el tiempo de despliegue de 2 horas a menos de 5 minutos, garantizando un 100% de éxito en la emisión de credenciales."

---

### Bloque 6: Cierre (3:45 - 4:00)
**Visual:** Logos de NODO EAFIT, Verana y el equipo.
**Audio (Voz en off):**
"NextAgent es más que una plataforma; es el puente que faltaba para que la IA y la identidad digital caminen de la mano hacia una internet más transparente. NextAgent: tu identidad, tu agente, tu confianza. Gracias."

---
*Fin del video*
