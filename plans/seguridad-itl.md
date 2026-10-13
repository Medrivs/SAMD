# Plan: prototipo interactivo de seguridad del ITL

## Objetivo y alcance
Transformar el login y dashboard actuales en un prototipo UI completo, adaptable y exclusivamente simulado para el Instituto Tecnológico de León. Sin servidores, autenticación real, lectura de placas, cámara, micrófono, hardware ni comunicación real entre equipos. Todos los datos serán ficticios y se indicará «Modo simulación» de forma persistente.

## Decisiones confirmadas
- Fondo azul marino, tarjetas blancas redondeadas, acentos azules y Roboto; conservar el lenguaje visual actual y usar el logo oficial existente en `src/imports/itl_leon.png` mediante import de Vite.
- Login con zona: Acceso 1 permite peatones, autos, motos y bicicletas; Accesos 2 y 3 son exclusivamente peatonales.
- Aforo significa lugares disponibles, separado para autos, motos y bicicletas. Al llegar a cero recomendar desvío al Edificio ZZ.
- Alto Flujo agiliza presentación y repetición de operaciones, pero conserva todas las validaciones y exige autorización explícita.
- Excepciones fuera de horario requieren motivo obligatorio registrado en bitácora.
- Activación de emergencia y restablecimiento manual requieren doble confirmación.

## Evidencia del repositorio
React 19, Vite 8, TypeScript y Tailwind v4. `src/App.tsx` contiene login, dashboard fijo e iconos SVG locales; `src/index.css` ya importa Roboto y define colores. El logo actual apunta a `/attachment.jpg` pese a existir el PNG oficial. El dashboard simula detección de placas; emergencia y micrófono no tienen acciones. No existe infraestructura de backend ni pruebas en los scripts de `package.json`. No se modificarán scripts ni se iniciará otro servidor.

## Experiencia y flujos
### 1. Inicio de sesión y navegación
- Campos de correo, contraseña y selector obligatorio de Acceso 1/2/3, validación local y estado breve «Ingresando a simulación». Aceptar cualquier correo con formato válido y contraseña no vacía; advertir que no deben introducirse credenciales reales. No guardar contraseña.
- Encabezado con logo, guardia ficticio, zona, fecha/hora, indicador de simulación, emergencia y cierre de sesión.
- Permitir cambiar entre las tres zonas desde el dashboard para demostrar adaptación y efectos globales; el cambio no borra bitácora, mensajes, aforo ni emergencia.
- Estado mantenido en memoria durante la sesión de la página. Cerrar sesión elimina credenciales e interfaz de sesión, no restablece una emergencia. Recargar reinicia los datos de demostración; indicarlo expresamente.

### 2. Validación QR y consulta manual
- Sustituir detección de placas por paneles QR simulados: peatonal en todas las zonas y movilidad en Acceso 1, con selección auto/moto/bicicleta y entrada/salida.
- Controles claros para elegir muestras: válido y dentro de horario, fuera de horario, credencial vencida, QR inválido y persona no encontrada. No solicitar permiso de cámara.
- Mostrar identidad ficticia, número de control/identificador, rol, vigencia, horario permitido, fecha/hora de evaluación y resultado; movilidad muestra tipo de transporte, sin matrícula ni lectura de placas.
- Consulta manual por identificador o nombre en catálogo local; mostrar resultados seleccionables cuando haya varias coincidencias y estado «Sin resultados» cuando corresponda.
- Una validación válida habilita «Autorizar entrada/salida», nunca acciona automáticamente un dispositivo. Rechazo explícito disponible y registrado.
- Fuera de horario: permitir excepción solo con identidad encontrada y credencial vigente; pedir motivo no vacío y confirmar. QR inválido, desconocido o vencido no permite esta excepción. La consulta manual puede iniciar una nueva validación, no convertir un QR inválido en válido.
- Invalidar el resultado pendiente al cambiar zona, persona, modalidad o dirección. Cada resultado puede consumirse una sola vez para evitar duplicados por clic repetido.

### 3. Controles de dispositivos
- Representar torniquetes de entrada y salida en cada zona y pluma vehicular solo en Acceso 1. Separar estado operativo de autorización; eliminar toggles ambiguos «conectado/desconectado» como mecanismo de apertura.
- Acciones manuales de apertura/cierre o bloqueo/desbloqueo muestran dispositivo, acción y motivo obligatorio antes de confirmar. No deben presentarse como validación de identidad ni alterar aforo por sí solas.
- Una autorización normal produce un paso simulado y devuelve el dispositivo a cerrado; un bloqueo impide autorizar aunque la identidad sea válida.
- Estados explícitos: cerrado, apertura de paso, bloqueado, libre por evacuación; pluma abierta por evacuación. Registrar cambios en bitácora.

### 4. Aforo de Acceso 1
- Tres tarjetas independientes de lugares disponibles: autos, motos y bicicletas. Capacidades ficticias iniciales: 100, 40 y 60; disponibles iniciales: 24, 12 y 18. Etiquetar como datos de demostración.
- Entrada de movilidad confirmada reduce únicamente su categoría; salida confirmada incrementa únicamente esa categoría. Nunca valores negativos o superiores a capacidad.
- Con cero lugares impedir entrada de esa categoría, mostrar «Sin lugares disponibles — desviar a Edificio ZZ»; las otras categorías siguen operativas. Salidas continúan permitidas salvo bloqueo por emergencia.
- Controles de demostración para llevar una categoría a cero o restablecer sus cifras, separados de las operaciones reales simuladas y registrados como ajuste de demostración.
- Accesos 2/3 no muestran QR vehicular, pluma ni aforo de estacionamiento.

### 5. Modo Alto Flujo
- Interruptor por zona, con indicador visible y aviso de que las reglas no cambian.
- Interfaz compacta, énfasis en resultado y botón de autorización, y «Siguiente lectura» tras finalizar; sin autoapertura, omisión de horario, excepción implícita ni reducción de confirmaciones de emergencia.

### 6. Rondines con tablet QR
- Sección de rondines disponible en las tres zonas, con vista tipo tablet utilizable en pantallas pequeñas.
- Ruta ficticia de tres puntos por zona: caseta, perímetro y punto interior. Iniciar rondín, simular QR del punto seleccionado, registrar hora y observación opcional, mostrar progreso y finalizar al completar los puntos.
- QR incorrecto produce error sin avance; una lectura repetida no duplica el punto. Registrar inicio, puntos y cierre en bitácora.

### 7. Bitácora y reporte de turno
- Historial cronológico con hora, zona, guardia, categoría, acción, resultado y motivo cuando aplique. Registrar autorizaciones, rechazos, excepciones, controles manuales, emergencias/restablecimiento, rondines y ajustes de aforo.
- Filtros por zona y categoría; estado vacío claro. Resumen del turno calculado desde eventos de acceso, no cifras fijas desconectadas.
- Editor de nota manual y botón de dictado simulado: reposo → transcribiendo → texto ficticio editable → guardar. No solicitar micrófono ni guardar texto hasta confirmación. Poder cancelar y evitar sesiones de dictado simultáneas.

### 8. Chat intercasetas
- Conversaciones locales con Acceso 1/2/3 y canal general, mensajes ficticios iniciales, remitente/zona y hora.
- Envío de texto no vacío; dictado simulado con borrador editable y envío explícito. Respuesta local predefinida identificada como simulada, sin afirmar entrega real.
- Mensajes de emergencia al canal general se generan automáticamente y quedan visibles al cambiar de zona.

### 9. Emergencia global
- Modal con tres opciones y descripción del alcance. Primer paso selecciona tipo y permite contexto; segundo paso independiente presenta consecuencias exactas y botón final inequívoco. Cancelar cualquiera de los pasos no altera estado ni genera activación.
- Disturbios: alerta global visible en las tres zonas y aviso al chat general; no cambia dispositivos automáticamente.
- Sospecha de robo: bloquea torniquetes de los tres accesos y la pluma existente en Acceso 1. No inventar plumas en Accesos 2/3. Impide pasos, excepciones y controles manuales que contradigan el bloqueo.
- Evacuación: libera torniquetes de los tres accesos y mantiene abierta la pluma de Acceso 1. Suspende autorizaciones ordinarias y conteos de aforo derivados de pasos, porque no hay control individual simulado durante evacuación.
- Solo una emergencia activa; no permitir reemplazarla sin restablecimiento. Mantener banner persistente con tipo, hora y alcance, independiente de zona y login.
- «Restablecer operación» requiere motivo obligatorio y dos confirmaciones. Vuelve todos los dispositivos a estado seguro cerrado, sin recuperar aperturas o bloqueos previos, no borra historial y no modifica aforo. Registrar inicio/cierre y emitir mensaje general.

## Implementación técnica
- Antes de implementar UI, cargar `make/use-design-system` para respetar el flujo requerido y el lenguaje visual del proyecto. No agregar fotografía ni librerías visuales innecesarias; reutilizar SVG locales y quitar emojis de controles modificados.
- Mantener `src/App.tsx` como composición de sesión y zonas. Extraer estado/reglas a `src/securitySimulation.ts` y paneles/modal a `src/components/` cuando su tamaño lo justifique; no introducir un framework de estado.
- Usar `useReducer` y tipos discriminados para sesión, zona, persona, validación, dispositivo, aforo, rondín, eventos, conversaciones y emergencia. Centralizar todas las transiciones que combinan validación, dispositivo, aforo y bitácora en acciones atómicas.
- Modelar `AccessId = 1 | 2 | 3`, `MobilityType = 'auto' | 'moto' | 'bicicleta'`, dirección entrada/salida y emergencia disturbios/robo/evacuación. Configuración de capacidades por zona determina controles disponibles; estado global único garantiza coherencia al cambiar de zona.
- Catálogo ficticio local con identificadores estables, roles, vigencia y ventanas horarias. Escenarios QR reproducibles con reloj de evaluación de muestra visible para no depender de la hora real al demostrar fuera de horario. Eventos usan hora actual.
- Eventos con ID único y timestamp, zona o alcance global, actor, tipo, resultado, entidad y motivo opcional; mensajes con canal, remitente, texto y timestamp. Nunca almacenar contraseñas.
- Temporizadores cortos solo para feedback simulado; cancelar en desmontaje y evitar que una operación pendiente autorice tras un cambio de zona o emergencia. La confirmación revalida reglas contra el estado actual.
- `src/index.css` conserva imports iniciales y Roboto; ajustar estilos globales mínimos y usar utilidades Tailwind para layouts responsivos.

## Adaptación y accesibilidad
- Desktop: validación como foco principal y columna de controles/aforo; bitácora, rondines y chat en secciones secundarias accesibles. Zonas peatonales aprovechan el espacio al omitir movilidad.
- Tablet: dos columnas cuando el ancho lo permite; móvil: una columna, encabezado refluido y controles sin desplazamiento horizontal.
- Botones con etiquetas claras, foco visible, estados comunicados con texto además de color, mensajes de error próximos al campo y anuncios de resultados accesibles.
- Modales con rol/etiqueta, foco inicial, captura de foco, retorno al disparador y cierre por cancelar/Escape antes de confirmar. Nada se ejecuta al cerrar.

## Secuencia de trabajo
1. Corregir logo y adaptar login/zona/layout, conservando identidad visual.
2. Crear catálogo, reducer y reglas centrales; implementar QR y consulta manual.
3. Conectar dispositivos, aforo, excepciones y Alto Flujo.
4. Conectar bitácora, rondines y chat/dictados simulados.
5. Implementar emergencias y restablecimiento global con doble confirmación.
6. Revisar adaptación, accesibilidad y coherencia entre paneles; verificar flujos completos.

## Verificación y criterios de aceptación
- Por el alcance amplio, ejecutar `pnpm build` y el formateador prescrito `pnpm format` sobre archivos modificados con los argumentos adecuados del CLI; no añadir comandos de test/typecheck inexistentes ni iniciar Vite. Reportar comandos y resultados reales.
- En el preview existente, comprobar login de cada zona y cambio de zona; no aparecen funciones vehiculares en 2/3; logo oficial correcto y ausencia de lectura de placas.
- Demostrar válido, fuera de horario con y sin motivo, desconocido, vencido y QR inválido; no hay autorización sin validación ni doble consumo del resultado.
- Entrada/salida afecta solo su categoría y queda dentro de límites; aforo cero recomienda ZZ e impide esa entrada; controles manuales no alteran aforo.
- Alto Flujo mantiene validaciones y confirmaciones.
- Rondín completa tres puntos sin duplicados; bitácora refleja eventos y filtros; dictado puede editarse/cancelarse y no solicita permisos; chat envía y distingue respuesta simulada.
- Cancelar cualquiera de las dos confirmaciones de emergencia no cambia nada. Robo bloquea todos los dispositivos pertinentes y no permite excepciones; evacuación libera pasos y mantiene la pluma abierta; disturbios no altera hardware.
- Cambio de zona y cierre/login no evaden emergencia. Restablecimiento sin motivo o con confirmación incompleta no procede; confirmado deja dispositivos cerrados y conserva aforo/historial.
- Comprobar tamaños desktop, tablet y móvil, navegación por teclado, foco de modales y mensajes de error. Si no hay herramienta de interacción disponible, distinguir la compilación verificada de la revisión visual/manual pendiente.

## Exclusiones
Integraciones reales, autenticación o permisos de producción, reconocimiento/registro de placas, cámara y micrófono reales, sincronización multiusuario, persistencia duradera, notificaciones externas y control físico de seguridad. El prototipo no debe presentarse como sistema apto para operación real.
