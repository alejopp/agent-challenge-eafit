---
title: "Evidencias del Uso de Inteligencia Artificial — NextAgent"
subtitle: "Documento 10 — Beca IA Ser ANDI"
author:
  - "Oscar David Rojas Bedoya"
  - "Yesid Alejandro Peláez Posada"
date: "Mayo 2026"
lang: es
---

# Evidencias del Uso de Inteligencia Artificial — NextAgent

**Programa:** Beca IA Ser ANDI · NODO EAFIT · Verana Foundation  
**Proyecto:** NextAgent — Plataforma de Agentes IA Verificables  
**Período:** Abril – Mayo 2026

---

## 1. Herramientas de IA Utilizadas

Durante el desarrollo del proyecto **NextAgent** el equipo utilizó inteligencia artificial en dos dimensiones distintas: como **herramienta de desarrollo** (para construir el producto) y como **componente del producto** (el motor del chatbot que los usuarios finales utilizan).

### 1.1 IA como herramienta de desarrollo

| Herramienta | Categoría | Utilizada por |
|---|---|---|
| **Windsurf** | IDE con IA integrada (agente de código) | Oscar Rojas |
| **Antigravity** | Agente de código (IA integrada) — herramienta principal | Yesid Alejandro Peláez |
| **Codex** (OpenAI) | Agente de código en terminal — herramienta secundaria / experiencia previa | Yesid Alejandro Peláez |
| **Claude AI** (Anthropic) | Asistente conversacional / revisión de código | Ambos |
| **ChatGPT** (OpenAI) | Asistente conversacional / debugging | Ambos |

### 1.2 IA como componente del producto

| Modelo / API | Función en el producto |
|---|---|
| **GPT-4o-mini** (OpenAI API) | Motor del chatbot de cada agente publicado en la plataforma |
| **Groq / Llama 3** | Motor del chatbot — versión inicial, reemplazado por inestabilidad |
| **OLLAMA / Llama 3:8b** | Motor del chatbot — versión previa a la migración a OpenAI |

---

## 2. Modelos de IA Utilizados

| Modelo | Proveedor | Uso |
|---|---|---|
| GPT-4o-mini | OpenAI | Motor del chatbot de los agentes en producción |
| Llama 3:8b | Meta / OLLAMA | Motor del chatbot — fase inicial de pruebas |
| Llama 3 | Meta / Groq | Motor del chatbot — fase de pruebas intermedia |
| Modelo interno de Windsurf | Codeium | Generación de código frontend y documentación |
| Modelo interno de Antigravity | Antigravity | Generación de código backend e infraestructura — herramienta principal |
| Modelo interno de Codex | OpenAI | Generación de código — experiencia previa con licencia empresarial |

---

## 3. Plataformas Utilizadas

| Plataforma | Tipo | Para qué se usó |
|---|---|---|
| **Windsurf** | IDE con IA (agente) | Desarrollo del frontend React, identidad de marca, OAuth, QR, CSS, documentación |
| **Antigravity** | Agente de código en terminal (IA) | Construcción del núcleo de la plataforma web (backend + infraestructura) — herramienta principal |
| **Codex** (OpenAI) | Agente de código en terminal | Herramienta secundaria / experiencia previa de Alejandro con licencia empresarial |
| **Claude AI** (claude.ai) | Chat IA | Consultas técnicas, revisión de código, depuración puntual |
| **ChatGPT** (chat.openai.com) | Chat IA | Consultas de sintaxis, nombres de variables, guía de configuración Kubernetes |
| **OpenAI API** | API REST | Servicio de chatbot en producción para los agentes de los usuarios |
| **Groq API** | API REST | Prueba inicial del chatbot (velocidad de inferencia), descartada |


---

## 4. Para Qué Usaron IA Dentro del Proyecto

### 4.1 Construcción de la plataforma (IA como desarrollador)

La IA fue una herramienta de desarrollo activa, no solo consultiva. Los dos integrantes trabajaron en un modelo de **pair programming con IA**, donde el desarrollador dirige y la IA ejecuta o propone.

**Oscar (Windsurf):**
- Diseño y maquetación del frontend React (componentes, páginas, navegación)
- Creación de la identidad de marca NextAgent (nombre, tema visual oscuro, CSS personalizado)
- Configuración de la infraestructura Kubernetes y Helm charts
- Implementación de la integración Google OAuth 2.0
- Implementación del QR de conexión con la API de qrserver.com
- Generación de toda la documentación técnica (README, informe, manual, evidencias)
- Implementación de los servidores MCP (Google Calendar)

**Alejandro (Antigravity):**
- Construcción del núcleo de la plataforma web: backend Express, rutas API, autenticación JWT
- Configuración completa de la infraestructura Kubernetes y Helm charts
- Pipeline CI/CD con GitHub Actions
- Integración con VS Agent y la red Verana (credenciales, DIDComm)
- Implementación de los servidores MCP (clima Open-Meteo + Wikipedia)
- Configuración de RAG con LangChain

### 4.2 Depuración y resolución de problemas

La IA fue consultada en momentos de bloqueo técnico:

- **Credenciales Verana + RAG:** *"le pedí a la ia que mirara lo de las credenciales y pues ya con eso solucionó lo de paso lo del rag"* — Alejandro, 4/05/2026
- **Configuración de dominio Kubernetes:** *"Según ChatGPT puedes poner algo como agent-oscar"* — orientación de nomenclatura de agentes, 21/04/2026
- **OAuth en producción:** Diagnóstico de las URLs de callback incorrectas

**Oscar — Problemas resueltos con ChatGPT (Kubernetes e infraestructura):**

- **Despliegue fallido de pods Kubernetes:** Pods en estado `CrashLoopBackOff` y error `ECONNREFUSED`, PostgreSQL sin endpoints válidos. ChatGPT guió la limpieza de PVCs, eliminación de recursos huérfanos y redeploy automático vía GitHub Actions. *Resultado: pods en estado Running, PostgreSQL y Redis operativos.*
- **Recuperación de acceso al cluster:** Acceso local perdido tras modificación accidental del namespace y kubeconfig. ChatGPT orientó la restauración manual del archivo kubeconfig y la reconfiguración del contexto Kubernetes (`export KUBECONFIG=~/ruta/team_g_kubeconfig.yaml`). *Resultado: acceso completo restablecido.*
- **Conexión Backend ↔ Frontend bloqueada:** Frontend React/Vite no podía comunicarse con el backend Node.js (`ECONNREFUSED 127.0.0.1:4000`) por ausencia del archivo `.env`. ChatGPT identificó la causa y guió la creación y configuración correcta del entorno. *Resultado: comunicación restablecida.*
- **Autenticación GitHub bloqueada (push fallido):** Error `Invalid username or token / Password authentication is not supported`. ChatGPT orientó la generación de claves SSH ed25519 y su configuración en GitHub. *Resultado: acceso seguro al repositorio.*
- **Persistencia y base de datos (StatefulSets y PVCs):** PostgreSQL no iniciaba, StatefulSets inconsistentes, volúmenes persistentes corruptos. ChatGPT guió la validación de StatefulSets, revisión de PVCs, eliminación de volúmenes inconsistentes y nuevo despliegue automatizado. *Resultado: base de datos funcional y persistencia restablecida.*
- **Configuración OAuth (Google/GitHub):** El login no mostraba correctamente el selector de cuentas ni redireccionaba adecuadamente. ChatGPT guió la configuración correcta de callback URLs, revisión de la OAuth App y ajuste de variables de entorno. *Resultado: autenticación OAuth funcionando correctamente.*

### 4.3 El producto final (IA como servicio)

La plataforma NextAgent **usa IA como su núcleo funcional**. Cada agente publicado por los usuarios es impulsado por GPT-4o-mini a través de la API de OpenAI, con las siguientes capacidades:
- Respuestas conversacionales naturales
- Consulta de herramientas externas vía MCP (clima, Wikipedia, Google Calendar)
- Uso de documentos propios del usuario vía RAG
- Memoria de la conversación vía Redis

---

## 5. Qué Tareas Resolvió la IA

| Tarea | Herramienta IA | Nivel de automatización |
|---|---|---|
| Núcleo de la plataforma web (backend + infra) | Antigravity | ~95% |
| Frontend React (componentes, páginas) | Windsurf | ~80% (Oscar dirigía, Windsurf ejecutaba) |
| Identidad de marca NextAgent (CSS, tema visual) | Windsurf | ~70% |
| Documentos (README, informe técnico, manual) | Windsurf | ~75% |
| Depuración de credenciales Verana | Claude / ChatGPT | Orientación técnica (30–40%) |
| Configuración de Kubernetes y Helm | Antigravity | ~80% |
| Animación Lottie en el dashboard | Antigravity | ~90% |
| Traducción UI al español | Antigravity | ~95% |
| Motor del chatbot de los agentes | OpenAI GPT-4o-mini (API) | 100% (componente externo) |

---

## 6. Qué Tareas Fueron Desarrolladas Manualmente

A pesar del alto uso de IA, hubo decisiones y tareas que **requirieron criterio humano**, comprensión del dominio y no podían delegarse a la IA:

| Tarea | Responsable | Por qué fue manual |
|---|---|---|
| **Comprensión del ecosistema Verana** — entender DIDs, Verifiable Credentials, DIDComm y cómo funcionan juntos | Alejandro | No existe una IA que entienda el stack específico de Verana; requirió leer la especificación, revisar el código base y preguntar en Discord a los maintainers |
| **Arquitectura general de la solución** — decidir componentes, cómo conectarlos, qué tecnologías usar | Ambos | La IA propone, pero las decisiones de arquitectura con impacto en infraestructura limitada requieren criterio humano |
| **Configuración de secretos de GitHub Actions** (KUBECONFIG, OPENAI_API_KEY, etc.) | Oscar y Alejandro | Seguridad: las claves nunca se delegan a la IA ni se suben al repositorio |
| **Gestión del cluster Kubernetes** (namespaces, recursos, límites de memoria) | Alejandro | Requirió ajustes finos a los recursos del cluster académico y coordinación con el equipo de EAFIT |
| **Debugging del incidente de la demo** (agente no respondía) | Alejandro | Revisión manual de logs del cluster para identificar el timeout del MCP Wikipedia |
| **Decisión de migrar de OLLAMA/Groq a OpenAI** | Alejandro | Evaluación práctica de confiabilidad: la IA no puede tomar esta decisión operativa |
| **Nombre y estrategia de producto** ("NextAgent") | Oscar | Creatividad y posicionamiento de producto |
| **Solicitud del nuevo namespace** tras el incidente | Alejandro | Coordinación humana con el equipo de EAFIT vía Discord |
| **Configuración del Step 1 y Step 2 del reto** — seguimiento del paso a paso de la guía: inclusión de variables de entorno, secretos y configuraciones manuales sobre el código base del reto | Oscar | El código base no incluía todas las variables de entorno ni los secretos necesarios; configurarlos correctamente requirió comprensión del entorno y criterio sobre qué valores exponer o proteger |
| **Decisión de los componentes del frontend** — qué páginas incluir, qué mostrar en el dashboard, qué funcionalidades exponer al usuario final | Oscar | Requirió criterio de producto/UX: la IA puede sugerir pero no puede decidir qué funcionalidades son relevantes para el usuario final del proyecto |

---

## 7. Cómo Fue el Proceso de Adopción de Estas Herramientas

### Línea de adopción

```
Abril 8          Abril 14         Abril 25         Mayo 2
     │                │                │               │
     ▼                ▼                ▼               ▼
Equipo formado   Primera reunión   Oscar comparte   Alejandro
Inicio desde 0   Todos intentan    video del        confirma:
                 instalar el       prototipo web    "95% fue
                 entorno           hecho con        Antigravity"
                 (Claude/ChatGPT   Windsurf
                 para orientarse)
```

**Fase inicial (abril 8–14):** El equipo usó Claude AI y ChatGPT principalmente como **consultores** para entender el ecosistema Verana, resolver errores de instalación y orientarse en la arquitectura del reto.

**Fase intermedia (abril 14–27):** Alejandro adoptó **Antigravity** como agente de desarrollo principal para construir el núcleo de la plataforma. Oscar comenzó a usar **Windsurf** para el frontend. La IA pasó de ser consultiva a ser **generativa** (escribe código, no solo lo explica).

**Fase avanzada (abril 27 – mayo 12):** Las herramientas de IA se volvieron parte del flujo de trabajo diario. El modelo de trabajo fue: **el desarrollador define la tarea → la IA genera el código → el desarrollador revisa, ajusta y decide**.

**Experiencia previa con las herramientas:**

- **Alejandro (Antigravity):** Contaba con experiencia previa en **Codex** (OpenAI) con **licencia empresarial**, lo que facilitó su adopción rápida de Antigravity y su uso como agente de desarrollo intensivo desde el inicio del proyecto.
- **Oscar (Windsurf):** No tenía experiencia previa con **Windsurf**. Utilizó una **prueba gratuita de la plataforma** que incluía acceso a modelos avanzados de **Claude** (Anthropic), lo que le permitió aprovechar capacidades superiores de generación de código y documentación, aunque implicó una curva de aprendizaje inicial para familiarizarse con el flujo de trabajo del IDE con IA integrada.

---

## 8. Dificultades Encontradas Usando IA

### Dificultades técnicas documentadas

| Dificultad | Herramienta | Descripción | Lección aprendida |
|---|---|---|---|
| **Namespace eliminado en producción** | Antigravity | Al pedirle a Antigravity que limpiara recursos, ejecutó `kubectl delete namespace team-g`, eliminando toda la plataforma | La IA no distingue entre entornos de prueba y producción. Siempre revisar los comandos destructivos antes de ejecutar |
| **Modificaciones inesperadas en backend** | Windsurf | Al pedir implementar el QR en el frontend, Windsurf también modificó archivos del backend que no eran parte de la tarea | Las IA de código tienen "contexto amplio" — pueden tocar archivos fuera del scope. Revisar todos los cambios antes del commit |
| **Código que compila pero no funciona** | Antigravity / Windsurf | En varias ocasiones el código generado era sintácticamente correcto pero con lógica incorrecta (ej. URLs internas de Kubernetes mal construidas) | La IA no tiene contexto del entorno real; siempre requiere validación con el sistema en funcionamiento |
| **Stack específico de Verana** | Claude / ChatGPT | Las IA no tenían conocimiento actualizado del ecosistema Verana/Hologram; las respuestas eran genéricas o incorrectas | Para tecnologías muy nuevas o nicho, la IA es menos confiable; toca ir a la fuente (docs, Discord, código fuente) |

### Dificultades de proceso

- **Dependencia excesiva:** Cuando la IA no funcionaba o daba respuestas incorrectas, era difícil avanzar si no se tenía el conocimiento base del dominio.
- **Caja negra parcial:** En etapas tempranas, parte del código generado no se entendía completamente, lo que dificultó el debugging posterior.

**Dificultades específicas de Oscar con Windsurf (experiencia directa):**

| Dificultad | Herramienta | Descripción | Lección aprendida |
|---|---|---|---|
| **Múltiples consultas sin solución definitiva** | Windsurf | Ante un mismo problema la IA respondía con variaciones de la misma solución sin llegar a una respuesta definitiva, generando ciclos de consultas sin avance real | Acotar mejor el contexto y reformular la pregunta; en algunos casos fue necesario cambiar de herramienta o consultar documentación directa |
| **Exceso de comandos sin resolución completa** | Windsurf / ChatGPT | La IA orientaba a ejecutar muchos comandos consecutivos, pero algunos no resolvían completamente el problema y agregaban complejidad innecesaria | Evaluar cada comando antes de ejecutarlo; no seguir ciegamente la secuencia propuesta |
| **Modificación innecesaria de múltiples archivos** | Windsurf | La IA modificaba archivos por fuera del scope de la tarea solicitada sin que fuera necesario, dificultando el control del código y el seguimiento de cambios | Revisar todos los diffs antes del commit; definir el alcance de la tarea con mayor precisión |
| **Bloqueo por terminología fuera de contexto o soluciones circulares** | Windsurf | En ciertos momentos la IA introducía terminología que no venía al caso o comenzaba a "darle demasiadas vueltas" a una solución, generando confusión y bloqueo | Redirigir la conversación con preguntas simples y directas; reiniciar el contexto cuando la IA se desvía demasiado |

---

## 9. Qué Tan Útil Consideramos la IA para Proyectos Reales

### Valoración del equipo

Este proyecto es un **caso de estudio excepcional** sobre el uso de IA en el desarrollo de software, porque el reto mismo era de alta complejidad técnica (Kubernetes, Verana, DIDComm, credenciales verificables, CI/CD) y fue completado por **solo 2 personas** en **menos de 5 semanas**.

**Conclusión directa:** Sin las herramientas de IA, la plataforma NextAgent con el nivel de funcionalidad alcanzado **no habría sido posible** en el tiempo disponible con solo dos integrantes trabajando a tiempo parcial.

La IA permitió que un equipo pequeño, con conocimiento parcial del dominio, **multiplicara su capacidad de producción** actuando como un tercer (y cuarto) integrante que nunca se cansa y siempre está disponible.

| Dimensión | Valoración | Comentario |
|---|---|---|
| **Velocidad de desarrollo** | 9/10 | Lo que hubiera tomado semanas se hizo en días |
| **Calidad del código generado** | 7/10 | Funcional pero requiere revisión; no siempre sigue las mejores prácticas |
| **Utilidad en dominios nuevos** | 8/10 | Excelente para tecnologías comunes (React, Express, K8s), limitada para stacks muy específicos (Verana) |
| **Confiabilidad en producción** | 6/10 | Los comandos destructivos y las suposiciones de entorno pueden causar incidentes |
| **Utilidad como par de programación** | 9/10 | El modelo de “el humano decide, la IA ejecuta” fue muy efectivo |
| **Comprensión del proyecto mediante artefactos de Claude** | 9/10 | Crear artefactos en Claude para leer y analizar el código fuente completo, entender la arquitectura y el propósito de cada componente —sin ejecutar comandos— fue fundamental para tomar decisiones informadas y evitar ejecutar comandos “porque sí” o porque lo sugería la IA. Entender el trasfondo del proyecto antes de actuar es tan importante como la ejecución misma |

---

## 10. Aprendizajes de Trabajar con IA en un Desarrollo Tecnológico

### Aprendizajes técnicos

1. **La IA amplifica al desarrollador, no lo reemplaza.** El 95% de código generado por Antigravity (Alejandro) no significa que Alejandro no trabajó: significa que su trabajo fue de nivel superior — arquitectura, decisiones, validación, integración. Sin criterio técnico, el código de la IA no llega a producción.

2. **El contexto es todo.** Windsurf y Antigravity son más efectivos cuando el desarrollador puede darles contexto rico: el problema exacto, el entorno, las restricciones, el código existente. La calidad del output es proporcional a la calidad del input.

3. **La IA no conoce tu entorno de producción.** Todo código generado para infraestructura (Kubernetes, CI/CD, bases de datos) debe revisarse manualmente. La IA asume condiciones ideales que en el cluster académico no siempre se cumplen.

4. **Para tecnologías emergentes, la IA tiene límites claros.** El ecosistema Verana/Hologram es muy nuevo; las IA no tenían entrenamiento suficiente. En estos casos, la documentación oficial y la comunidad (Discord) fueron más confiables.

5. **La IA acelera la documentación tanto como el código.** La generación de README, informe técnico, manual de usuario y evidencias fue posible en pocas horas gracias a Windsurf, cuando normalmente tomaría días.

### Aprendizajes de proceso

6. **El pair programming con IA requiere disciplina.** Es fácil "aceptar todo" sin leer. El equipo aprendió a revisar cada diff antes del commit, especialmente para cambios que afectan infraestructura.

7. **Divide las tareas para la IA igual que para un humano.** Tareas pequeñas y bien definidas producen mejores resultados que pedidos amplios y vagos.

8. **La IA como primer respondedor de debugging.** Antes de buscar en Stack Overflow o preguntar a un colega, consultar a la IA con el error exacto y el contexto del sistema ahorró tiempo significativo en la mayoría de los casos.

### Reflexión final

El proyecto NextAgent nos demostró que la IA generativa es ya una herramienta de trabajo real, no experimental. No porque haga todo por sí sola, sino porque **democratiza el acceso a la complejidad técnica**: permite que un equipo pequeño, motivado y con criterio enfrente desafíos que antes requerían equipos grandes o años de especialización.

La clave no está en saber usar la IA, sino en **saber dirigirla** — y eso sigue siendo profundamente humano.

**Reflexión personal — Oscar David Rojas Bedoya (Ingeniero Civil):**

> *“Para mí, que soy Ingeniero Civil, fue muy difícil entender la terminología de tecnologías que están muy a la vanguardia. Un proyecto de este tamaño es complejo entenderlo en su totalidad y contiene mucho código que puede abrumar. Pero afortunadamente está la IA para educarme y ayudarme en el proceso de aprendizaje y aplicación del código. Sin la IA, se vuelve muy complejo que una persona no TIC pueda aportar en este tipo de proyectos.”*

Esta reflexión sintetiza una de las conclusiones más importantes del proyecto: **la IA como herramienta de democratización del acceso técnico**. No solo para acelerar el desarrollo, sino para permitir que personas con formación en otros campos puedan comprender, aprender y contribuir activamente en proyectos de software de alta complejidad tecnológica.

---

---
*Evidencias del Uso de Inteligencia Artificial — NextAgent v1.0*  
*Oscar David Rojas Bedoya · Yesid Alejandro Peláez Posada*  
*Beca IA Ser ANDI · NODO EAFIT · Verana Foundation · Mayo 2026*

---