# Héroes alemanes RPG

Primera base jugable de un RPG de supervivencia y decisiones, ambientado en el evento fundacional de la biblia literaria **Héroes alemanes, Atlas v0.5**. La campaña está en desarrollo. El prólogo tiene narrativa escrita y cuatro resultados según el rescate y las decisiones; la campaña completa y sus numerosos finales aún no están implementados.

El juego publicado está en [Sites](https://heroes-alemanes-rpg.srgnomo.chatgpt.site/). El código se entrega en [CPJA88/HeroesAlemanes](https://github.com/CPJA88/HeroesAlemanes).

## Jugar y ejecutar

Requiere Node.js 20 o posterior; no hay dependencias que instalar.

```sh
npm run dev
```

Abrir `http://localhost:4173`. Para comprobar las reglas:

```sh
npm run check
npm test
```

Para empaquetar la publicación estática: `npm run build`. Se genera `dist` a partir de `public`. El servidor de desarrollo sirve `public`. `.openai/hosting.json` identifica el proyecto de Sites una vez creado. El mismo código se puede publicar en cualquier servidor estático con soporte para módulos JavaScript.

## Qué permite esta versión 0.1.0

- Elegir entre ocho protagonistas humanos con nombres y apariencias diferentes.
- Responder ocho preguntas de Baumann, revisar siete atributos y salir de la clínica.
- Viajar entre clínica, finca y sendero; gestionar necesidades y recursos.
- Ayudar en la finca, ganar marcos y obtener una habitación después de tres trabajos.
- Resolver un encuentro hablando, usando sigilo o combatiendo por turnos.
- Rescatar a Greta temprano o herida, imponerle condiciones, o llegar después de su muerte.
- Llevarla como compañera, consultar su conocimiento y curarla si hace falta.
- Ver un cierre escrito para la primera aventura y continuar viviendo en la finca.
- Guardar, cargar, exportar e importar el estado de la partida.

Los menús y diálogos pausan el reloj. El mundo también se pausa al pasar la pestaña a segundo plano o cerrar el juego. Las acciones consumen tiempo aunque el reloj continuo esté pausado manualmente. La muerte de Greta no cancela la partida.

## Límites actuales

El poder del protagonista permanece latente. Solo hay una compañera incorporable, un encuentro de combate, tres lugares y cuatro cierres del prólogo. El sendero usa temporalmente una vista del escenario de la finca. La habitación es una prueba de pertenencia al refugio; todavía no existe construcción de vivienda. Fatiga, higiene y abstinencia se calculan, pero sus efectos sistémicos completos están pendientes. Los sprites usan poses animadas mediante composición y movimiento; faltan secuencias de fotogramas para el acabado definitivo. No hay banda sonora ni doblaje. El guardado es local y utiliza una ranura; puede descargarse una copia JSON. No hay sincronización entre dispositivos.

## Diseño y registro

- `docs/REGISTRO.md`: visión aprobada, brainstorming, siete saltos y notas de progreso.
- `docs/DISENO.md`: decisiones concretas de la primera entrega y asuntos abiertos.
- `docs/RUTAS.md`: variables, rutas y familias de finales previstas para la campaña.
- `docs/ARTE.md`: dirección visual, atlas y criterios de animación.
- `docs/VALIDACION.md`: comprobaciones realizadas y sus límites.

La biblia original permanece separada y sin modificar. Las identidades del jugador, Greta y el hombre del sendero son adiciones de la adaptación. Los nombres y poderes de los personajes literarios se mantienen como referencia. Cada partida podrá cambiar sus acontecimientos y desenlaces, según la visión aprobada por el autor.

## Organización

`data.js` contiene datos escritos; `engine.js` contiene reglas comprobables sin navegador; `app.js` presenta las pantallas y registra las decisiones; `style.css` define la presentación. Los recursos gráficos están en `public/assets` y las pruebas de reglas en `tests`.

Los cambios se organizan por los grandes saltos del roadmap. Esta versión es una entrega parcial y no marca los saltos 1 o 2 como terminados.
