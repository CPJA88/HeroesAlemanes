# Validación de 0.1.0

Fecha: 30 de septiembre de 2026.

## Comprobaciones de reglas

`npm run check`: sintaxis correcta en los tres módulos JavaScript.

`npm test`: doce pruebas automatizadas aprobadas. Comprueban presupuesto de atributos igual para ocho apariencias, respuestas y dependencia, pausas, resolución cronológica de plazos, rescate temprano, rescate herido y cura, irreversibilidad de muerte, coacción y memoria moral, iniciativa por sigilo y coste de objetos en combate, negociación según voz, conservación al guardar/cargar y rechazo de partidas inválidas.

Estas pruebas verifican reglas y guardado. No sustituyen las pruebas de interfaz ni el balance de la campaña futura.

## Interfaz

La herramienta de prueba Playwright está preparada en `tools/smoke-ui.mjs`; requiere Playwright y un Chromium instalado en el equipo que la ejecute. No pudo ejecutarse aquí porque falta ese binario. El navegador remoto no tiene acceso a `localhost:4173`. La revisión se ha realizado sobre la publicación privada de Sites después de acceder con la cuenta elegida por el autor. Se ha completado elección de Tomás, ocho respuestas, revisión de atributos, llegada a finca, aceptación del rescate, viaje, combate, perdón del adversario, rescate temprano, incorporación de Greta, guardado, recarga y cierre La puerta abierta. Los estados visibles se conservaron al cargar. El reloj permaneció en pausa durante la lectura y avanzó por los costes de acciones. Se verificó la orientación de los combatientes y la presentación de las ocho apariencias.

La revisión detectó que el estilo de pulsación sustituía la transformación de los botones del mapa, desplazándolos durante el clic. Se ha corregido con un desplazamiento independiente. También se ha ajustado el recorte de las celdas del atlas para evitar fragmentos de la fila siguiente y se bloquean las órdenes durante la breve animación del ataque. La próxima publicación incluye estas correcciones.

La página de comprobación `qa/mobile.html` encuadra el juego en un iframe de 390 × 844 píxeles, para revisar sus reglas de presentación móvil en el navegador. Esto verifica el encuadre, pero no sustituye probar gestos y rendimiento en un teléfono físico.

## Pendiente

Prueba móvil física, más variantes de cuestionario, consumos y recuperación equilibrados, animaciones por fotogramas y carga de archivos exportados mediante interfaz. Las familias de finales de la campaña todavía no tienen lógica de resolución implementada.
