# Dirección visual y movimiento

## Muestra producida

Pixel art de alta resolución, atmósfera adulta y humana, bosque húmedo del Wasgau, arquitectura europea rural de principios de los años veinte, crema, verde bosque, burdeos y latón. La referencia a Fallout se utiliza para la exploración y elección; la historia y su mundo proceden de Héroes alemanes.

Los tres recursos de la muestra se han generado expresamente con el generador de imágenes integrado y se conservan en el código. No hay imágenes remotas dependientes de terceros.

| Archivo | Tamaño | Contenido |
|---|---|---|
| public/assets/finca.png | 1672 × 941, RGB | Finca forestal, aserradero cerrado, agua y arenisca rojiza |
| public/assets/clinica.png | 1672 × 941, RGB | Sala médica de época, cama, ventanas y mesa de consulta |
| public/assets/personajes.png | 1024 × 1536, RGBA | Ocho protagonistas y cuatro figuras de apoyo |

El atlas tiene cuatro columnas y tres filas. Cada celda mide 256 × 512. Los índices 0–7 corresponden a los protagonistas, 8 a Baumann, 9 a Hanne, 10 a Greta y 11 al hombre del sendero. El fondo tiene transparencia real. Las figuras están orientadas a la derecha; los adversarios y el médico se reflejan horizontalmente para la composición.

El sendero usa temporalmente el escenario de la finca desplazado. Se necesita una escena propia antes de considerar terminado el arte de la primera aventura. El interior representa una sala de la clínica, separada de la finca; la enfermería de la finca requerirá otro lugar si se incorpora.

## Interfaz

Escenarios dominantes con viñeta suave para legibilidad. Paneles oscuros semitransparentes, texto claro, iconos lineales y tipografía sin recursos externos. El texto de lectura no usa una tipografía pixelada estrecha. Los atributos y recursos tienen etiquetas y cifras además de barras. La moralidad se presenta como recorrido sin revelar requisitos secretos de los finales.

Mapa de nodos para viajes y ubicación; no pretende ser un mapa topográfico exacto del Wasgau. El HUD mantiene reloj y pausado visibles. Diálogos y elecciones deben conservar suficiente espacio y evitar tapar los rostros. Menús de combate en cuatro órdenes reconocibles.

## Animación actual y acabado objetivo

Implementado: aparición de escenas y menús, texto progresivo que puede completarse, respuestas de botones, respiración y balanceo de figuras, desplazamiento en ataque, transición de barras y niebla ambiental. Se respeta la preferencia de movimiento reducido. No existe todavía animación por fotogramas de todas las poses.

Objetivo: cada personaje tendrá reposo, alerta, desplazamiento, ataque, impacto, defensa, caída y gestos de conversación; cada escena tendrá dos o tres capas ambientales motivadas. La animación debe comunicar una acción y preservar lectura, tiempos y clics. El reloj no cobra al jugador la duración de una animación visual además del coste de la acción.

Las secuencias se organizarán por personaje y acción, con duración explícita, pivote de pies constante y cajas de recorte documentadas. La fuente, paleta y tamaño deben ser consistentes entre fotogramas. No se considerará acabado un sprite que solo cambie de escala; el movimiento actual es una primera composición funcional.

## Criterios de revisión

- Siluetas, anatomía, manos, prendas y rostro legibles al tamaño real de juego.
- Ocho apariencias distinguibles, evitando que origen equivalga a clase o moralidad.
- Ropa y escenarios acordes con el periodo y la biblia; sin ciudad futurista ni apocalipsis añadido.
- Compañeros y adversarios orientados según su lado del campo de combate.
- Sin texto horneado dentro de imágenes que impida traducir o cambiar contenidos.
- Texto estable, botones accesibles, alternativa a sonido y movimiento reducido.
- Pruebas de encuadre y navegación tanto en móvil como en escritorio antes de cerrar la entrega.
