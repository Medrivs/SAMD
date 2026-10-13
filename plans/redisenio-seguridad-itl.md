# Plan de rediseño: seguridad ITL con cuatro zonas

## Objetivo y alcance
Rediseñar el prototipo React existente como una demostración interactiva, exclusivamente simulada, del sistema de seguridad del Instituto Tecnológico de León. Implementar cuatro casetas con cuentas de zona fija, monitoreo CCTV de demostración, accesos, rondines, bitácora y comunicación intercasetas.

Este plan sustituye las decisiones incompatibles del documento anterior `plans/seguridad-itl.md`: tres accesos, vehículos en Principal, login libre, selector de zona, rutas genéricas y emergencias globales. No se implementará nada durante la etapa de revisión del plan.

Sin backend, autenticación real, cámaras o micrófono reales, reconocimiento de matrícula, control físico, sincronización entre navegadores ni persistencia duradera. Mostrar «Modo simulación» y «Datos en memoria; se reinician al recargar». No presentar el prototipo como apto para operación real.

## Decisiones confirmadas

| Cuenta demo | Contraseña | Zona fija | Operación |
| --- | --- | --- | --- |
| 23240426 | itl2026 | Acceso 1: Principal | Peatonal; torniquetes de entrada y salida |
| 23240427 | itl2026 | Acceso 2: Libramiento | Peatonal; torniquetes de entrada y salida |
| 23240428 | itl2026 | Acceso 3: Yupol | Peatonal; torniquetes de entrada y salida |
| 23240429 | itl2026 | Acceso 4: Estacionamiento | Vehicular; plumas de entrada y salida |

- No habrá selector ni cambio de zona dentro de una sesión. Para demostrar otra caseta se debe cerrar sesión e ingresar con su cuenta.
- Cada guardia solo verá CCTV, dispositivos, validaciones, aforo pertinente, rondines y bitácora de su zona.
- Emergencias locales por zona; las demás casetas reciben avisos por chat, pero sus dispositivos y reglas no cambian.
- Autos y motos: matrícula ficticia acompañada de QR vehicular vinculado. Bicicletas: QR, sin matrícula.
- Conservar identidad, horario, vigencia del pase, excepciones con motivo, Alto Flujo sin omitir validaciones y doble confirmación para activar emergencias y restablecer.
- Fondo azul marino, tarjetas blancas redondeadas, acentos azules, Roboto y logo oficial existente `src/imports/itl_leon.png`.

## Base técnica comprobada
- `src/App.tsx` concentra login, paneles, estados y SVG locales; `src/index.css` ya contiene Roboto, colores y estilos responsivos.
- El logo oficial ya se importa correctamente; conservarlo, sin volver a descargar el adjunto.
- Actualmente `Zone` contiene tres accesos; vehículos y aforo están en Acceso 1. El login acepta correo y contraseña no vacía; los rondines usan tres puntos genéricos.
- Emergencia, Alto Flujo y progreso del rondín comparten estados entre zonas. Restablecer elimina todos los estados de dispositivos. Las autorizaciones no consultan los bloqueos manuales.
- Bitácora muestra eventos sin limitar por caseta; chat filtra por destinatario sin comprobar ambos participantes.
- Dependencias: React 19, Vite 8, TypeScript y Tailwind v4. Scripts disponibles: `pnpm build` y `pnpm format`; no hay script de pruebas. No iniciar otro servidor.

## Experiencia visual
### Login
- Dos campos: número de control y contraseña. Validación local contra las cuatro cuentas exactas; error visible y accesible si no coinciden.
- Mostrar tabla compacta de cuentas demo y advertencia de no usar credenciales reales.
- Al ingresar, derivar la zona de la cuenta; no confiar en un valor seleccionable. Mostrar guardia demo identificado por su cuenta y zona.
- Cerrar sesión limpia contraseña, validación pendiente, confirmaciones, temporizadores y borradores de interfaz. Conserva estados operativos, emergencias, eventos y mensajes en memoria para demostrar el aislamiento al volver a ingresar. Recargar reinicia todo.

### Dashboard
- Encabezado con marca, zona completa, guardia demo, reloj, simulación, cierre de sesión y acción local de emergencia.
- Monitoreo principal con CCTV de la zona, validación de acceso, controles locales y progreso del rondín. Estacionamiento añade aforo; las otras zonas no muestran movilidad, plumas ni aforo vehicular.
- Dos cámaras demo por zona, etiquetadas con ubicación local, entrada/salida o área correspondiente. Usar fotografías de demostración, indicador «Imagen de demostración; no es transmisión en vivo» y ampliación accesible. No solicitar permisos.
- Las fotografías no se etiquetarán como imágenes reales del campus si no lo son. Añadir foto de identidad demo a las personas reconocidas con respaldo visual si no carga.
- Barra inferior del dashboard dividida en bitácora con editor/dictado simulado y chat intercasetas. No depender de pestañas separadas para acceder a estos dos paneles.
- Rondines: resumen y progreso visibles en dashboard, con vista detallada de tablet/ruta para operar sin saturar la pantalla.
- En desktop usar columnas con jerarquía clara; en tablet reducir columnas; en móvil apilar CCTV, operación, rondín, bitácora y chat. La barra inferior forma parte del flujo, no tapa contenido. Listas con altura limitada y desplazamiento interno cuando corresponda.

## Reglas operativas
### Validación y autorización
- Escenarios reproducibles: válido, fuera de horario, pase vencido, QR inválido e identidad desconocida. Catálogo ficticio con nombre, foto, control, rol, pase y ventana horaria.
- Mostrar hora de evaluación de muestra cuando se use un escenario horario predeterminado; los eventos conservan hora real.
- Permitir consulta manual en el catálogo local, sin convertir automáticamente un QR inválido en válido: seleccionar una persona inicia una evaluación nueva.
- Peatonal: evaluar identidad, QR/pase y horario; elegir entrada o salida.
- Vehicular: añadir tipo de vehículo y QR vinculado. Autos/motos muestran matrícula simulada y comparación contra la vinculada al QR; discrepancia bloquea autorización. Bicicletas omiten matrícula por completo. No habrá OCR ni capturas reales.
- Un resultado válido habilita autorización explícita, nunca apertura automática. Ofrecer rechazo explícito registrado.
- Excepción solo por horario: identidad reconocida, pase vigente, QR válido y, cuando corresponda, matrícula coincidente. Exigir motivo no vacío y confirmación explícita. No permitir excepciones a pase vencido, QR inválido, identidad desconocida, aforo lleno o dispositivo bloqueado.
- Cambiar identidad, código, dirección, tipo o matrícula invalida la evaluación anterior. Cada evaluación se consume una sola vez. Revalidar reglas actuales al confirmar, incluyendo emergencia, dispositivo y aforo.

### Dispositivos
- Dos torniquetes por zona peatonal; dos plumas únicamente en Estacionamiento.
- Estados explícitos: cerrado, apertura de paso, abierto manualmente, bloqueado y libre por evacuación.
- Paso autorizado: apertura simulada breve y retorno a cerrado, con evento único.
- Controles manuales requieren dispositivo, acción y motivo; no sustituyen identidad ni alteran aforo. Un dispositivo abierto manualmente no elimina validaciones. Bloquear/desbloquear debe ser explícito.
- No permitir acciones que contradigan el protocolo local vigente.

### Aforo de Estacionamiento
- Tres conteos de lugares disponibles independientes. Conservar constantes actuales: autos 120/18 disponibles, motos 40/12 y bicicletas 60/24; etiquetar como cifras ficticias.
- Entrada autorizada resta uno a su categoría; salida suma uno sin superar capacidad. Ningún valor negativo.
- Cero disponibles bloquea entradas únicamente de esa categoría y muestra recomendación de desvío al Edificio ZZ; las salidas y otras categorías siguen sus reglas habituales.
- Controles demo separados para simular lleno y restablecer conteos, registrados como ajustes, no como pasos.
- Controles manuales y evacuación no modifican aforo.

### Alto Flujo
- Estado independiente por zona. Compactar presentación y ofrecer «Siguiente lectura».
- No autorizar automáticamente, omitir identidad/horario/pase/matrícula/aforo, aceptar excepciones implícitas ni reducir confirmaciones.

## Rondines específicos
Configurar puntos estables por zona en este orden:
- Principal: Biblioteca, Edificio A, Q, R, P, J, H, B, G, K, F, C y D — 13 puntos.
- Libramiento: Canchas, Edificio W y E — 3 puntos.
- Yupol: Edificio T, S, Ñ, O, M y L — 6 puntos.
- Estacionamiento: entrada vehicular, área de cajones y salida vehicular — 3 puntos.

Mostrar ruta ordenada; permitir registrar puntos de esa ruta en cualquier orden y señalar el siguiente pendiente. Usar IDs técnicos estables y conservar «Ñ» en etiquetas visibles.

Iniciar rondín, seleccionar/simular QR local, registrar fecha/hora y observación opcional. Un QR ajeno o inexistente produce error sin avance; duplicados no cuentan dos veces. Finalizar solo al completar la ruta; iniciar un nuevo rondín limpia el progreso actual pero conserva los eventos previos. Progreso y estado permanecen aislados por zona al cerrar y volver a ingresar. Registrar inicio, puntos y finalización en bitácora local.

## Bitácora y chat
### Bitácora
- Eventos con ID, timestamp, zona, cuenta/actor, categoría, acción, resultado y motivo opcional.
- Registrar validaciones, autorizaciones/rechazos, excepciones, dispositivos, Alto Flujo, ajustes de aforo, emergencias/restablecimiento, rondines y notas.
- El selector de zona no existe: filtrar siempre por la sesión activa. Ofrecer filtro local por categoría y estado vacío.
- Mostrar actividad reciente y resumen calculado a partir de eventos, no contadores fijos.
- Dictado simulado: reposo → generando texto → borrador editable → guardar explícitamente. Cancelar sin guardar; impedir operaciones simultáneas y cancelar temporizadores al salir de sesión. No usar micrófono.

### Chat exclusivo entre cuatro casetas
- Solo participantes del catálogo de las cuatro zonas; no usuarios externos.
- Conversaciones directas con las otras tres casetas y canal «Todas las casetas» para coordinación.
- En conversación directa incluir mensajes cuyo par de participantes coincida exactamente con zona activa y destino; nunca mostrar una conversación entre otras dos casetas.
- Canal general visible a las cuatro cuentas. Mensajes con remitente, destino/canal, hora y marca de simulación cuando sean respuestas de muestra.
- Enviar texto no vacío de manera explícita. Mantener acción «Simular respuesta» identificada, sin afirmar entrega real.
- Dictado opcional de chat reutiliza el mismo mecanismo de borrador y envío explícito, sin compartir borrador con bitácora.
- Activación/restablecimiento envía aviso al canal general indicando zona y alcance local; el aviso no activa acciones remotas.

## Emergencias locales
- Tipos: Disturbio, Sospecha de robo y Evacuación.
- Primer paso muestra zona, tipo y efectos; segundo paso independiente muestra consecuencias exactas y acción final inequívoca. Cancelar/Escape en cualquiera no modifica estado operativo.
- Disturbio: alerta local y aviso a casetas; no cambia dispositivos automáticamente y conserva las validaciones.
- Sospecha de robo: bloquea entrada y salida de la zona activa; impide autorizaciones, excepciones y aperturas manuales.
- Evacuación: suspende entradas ordinarias y autorizaciones individuales; libera dispositivos de salida y mantiene entrada bloqueada. En Estacionamiento la pluma de salida permanece abierta. No se contabilizan pasos durante evacuación.
- Solo una emergencia activa por zona; puede coexistir con emergencias distintas en otras zonas. No reemplazarla sin restablecimiento.
- Banner persistente local con tipo, hora, zona y consecuencias; vuelve a mostrarse al reingresar.
- Restablecer requiere motivo obligatorio y dos confirmaciones. Cierra los dispositivos de esa zona, elimina únicamente su emergencia, conserva aforo/historial y no altera ninguna otra caseta. No restaurar aperturas manuales anteriores.

## Implementación técnica
1. Antes de implementar UI, cargar `make/use-design-system`. Antes de seleccionar fotografías, cargar `make/unsplash`; preferir recursos existentes apropiados y fotografías autorizadas de demostración. No se necesita contexto Figma porque no hay diseño adjunto que reproducir.
2. Crear `src/securitySimulation.ts` con catálogo de cuentas, configuración de zonas/cámaras/dispositivos/rutas, personas y vehículos de muestra, tipos y reducer puro. Mantener `src/App.tsx` como composición y extraer paneles a `src/components/` según responsabilidad.
3. Modelar `ZoneId` con cuatro valores estables, sesión derivada de cuenta, `zones: Record<ZoneId, ZoneState>`, eventos y mensajes compartidos con selectores restrictivos.
4. `ZoneState` contiene dispositivos, emergencia, Alto Flujo y rondín. El aforo existe únicamente en Estacionamiento. Formularios, borradores y modal son estado efímero de sesión.
5. Centralizar transiciones de autorización, dispositivos, aforo y eventos en acciones atómicas del reducer. Incluir zona de origen y evaluación vigente; rechazar operaciones de otra zona y resultados consumidos.
6. Modelar confirmación con acción tipada, zona, paso y motivo, no cadenas ambiguas. Comprobar sesión y reglas nuevamente al ejecutar la segunda confirmación.
7. Eventos y mensajes tienen IDs únicos estables; tiempos proporcionados a las acciones para facilitar verificaciones deterministas. Nunca almacenar contraseña.
8. Cancelar temporizadores al salir/cambiar de sesión; no permitir transcripciones, aperturas o confirmaciones tardías que afecten una nueva sesión.
9. Conservar imports CSS primero, fuente Roboto, tokens y SVG existentes; ampliar iconos locales sin dependencias innecesarias. No cambiar scripts, configuración de Vite ni infraestructura.

## Secuencia de entrega
1. Configuración de cuatro zonas, cuentas, estado aislado y reglas/selectores.
2. Login fijo y estructura visual del dashboard/CCTV.
3. Validación peatonal/vehicular, matrícula simulada, dispositivos, aforo y Alto Flujo.
4. Rutas específicas y progreso de rondines.
5. Barra inferior de bitácora/chat, filtros correctos y dictado simulado.
6. Emergencias locales y restablecimiento con dos confirmaciones.
7. Ajuste responsivo, accesibilidad y verificación integral.

## Verificación y aceptación
Por ser un rediseño amplio, ejecutar `pnpm format` limitado a los archivos modificados con los argumentos admitidos por oxfmt, seguido de `pnpm build`. No inventar scripts de pruebas/typecheck ni iniciar Vite. Comprobar flujos en el preview existente; si no hay capacidad de interacción, documentar la revisión manual pendiente sin afirmar que se realizó.

- Las cuatro cuentas válidas ingresan en su zona; cuenta inexistente/contraseña incorrecta falla; no existe cambio de zona.
- Principal, Libramiento y Yupol solo muestran sus cámaras, torniquetes y accesos peatonales. Estacionamiento solo muestra su operación vehicular, plumas y aforo.
- Escenarios válidos, inválidos, vencidos, desconocidos, fuera de horario y matrícula no coincidente producen resultados correctos. Bicicletas no requieren ni muestran matrícula.
- Excepción sin motivo no procede; resultado obsoleto/consumido no autoriza; bloqueo manual impide paso; apertura manual no altera aforo.
- Conteos no exceden límites; categoría llena no bloquea las otras; Alto Flujo conserva reglas.
- Rutas muestran 13/3/6/3 puntos; QR ajeno/repetido no avanza; no finalizar incompleto.
- Al alternar cuentas mediante cierre/login se conservan estados de cada zona sin filtraciones de bitácora ni de conversaciones directas. El canal general sí es compartido.
- Emergencia en una zona no cambia dispositivos, aforo ni permisos de las otras. Cancelar cualquier confirmación no activa/restablece nada. Restablecer sin motivo no procede y solo afecta la zona activa.
- Dictado produce borrador editable y cancelable; no solicita permisos ni guarda/envía automáticamente.
- Verificar desktop, tablet y móvil, imágenes con respaldo, teclado, etiquetas de formulario, errores cercanos al campo y anuncios accesibles. Modal con foco inicial, contención y retorno al disparador; no comunicar estados solo por color.
- Reportar comandos ejecutados, resultados y cualquier revisión visual pendiente. No modificar archivos ajenos ni realizar commits.
