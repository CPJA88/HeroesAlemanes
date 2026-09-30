export const VERSION = '0.1.0';
export const SAVE_SCHEMA = 1;
export const STAT_NAMES = {
  force: 'Fuerza', agility: 'Agilidad', endurance: 'Resistencia',
  perception: 'Percepción', intellect: 'Ingenio', will: 'Voluntad', social: 'Trato'
};

// Identidades nuevas de la adaptación. La apariencia no modifica los atributos.
export const CHARACTERS = [
  { id:'fritz', name:'Fritz Wagner', origin:'Alemania', age:27, sprite:0, description:'Un rostro que reconoces, una vida que todavía debes reconstruir. El olor del bosque te resulta familiar.' },
  { id:'claire', name:'Claire Moreau', origin:'Francia', age:25, sprite:1, description:'Al despertar recuerdas dos idiomas y el sonido de una puerta cerrándose. El resto vuelve poco a poco.' },
  { id:'tomas', name:'Tomás Vidal', origin:'España', age:34, sprite:2, description:'Tus manos conservan pequeñas cicatrices. Recuerdas haber viajado lejos, aunque aún no cómo acabaste aquí.' },
  { id:'lucia', name:'Lucia Bianchi', origin:'Italia', age:31, sprite:3, description:'Una vieja carta espera junto a la cama. Reconoces la letra, pero prefieres escuchar primero al médico.' },
  { id:'idris', name:'Idris Benali', origin:'Argelia francesa', age:29, sprite:4, description:'Las voces del pasillo te despiertan antes que la luz. Tu pasado ha dejado asuntos pendientes a ambos lados de la frontera.' },
  { id:'aminata', name:'Aminata Diallo', origin:'Senegal francés', age:30, sprite:5, description:'Recuerdas un viaje, una dirección y una promesa. El doctor quiere saber qué ocurrió después.' },
  { id:'piotr', name:'Piotr Kowalski', origin:'Polonia', age:37, sprite:6, description:'Buscas tus pertenencias antes de hacer preguntas. Hay cosas que quieres recuperar y otras de las que no hablas todavía.' },
  { id:'mei', name:'Mei Lin', origin:'China', age:26, sprite:7, description:'El cuaderno de tu equipaje sigue cerrado. Reconoces el lugar en un dibujo, aunque no recuerdas haberlo visitado.' }
];

export const QUESTIONS = [
  {
    id:'livelihood', title:'Antes de llegar aquí…', text:'¿Qué ocupaba tus días? Los recuerdos más sencillos suelen ser los primeros en volver.',
    answers:[
      {text:'Trabajaba con las manos. Recuerdo el peso de las herramientas.',points:{force:1,endurance:1},background:'Oficio manual'},
      {text:'Arreglaba cosas. Me costaba dejar un mecanismo sin entender.',points:{intellect:1,perception:1},background:'Oficio técnico'},
      {text:'Trataba con gente. Hablar era parte de mi trabajo.',points:{social:1,will:1},background:'Oficio social'},
      {text:'Me desplazaba mucho. Aprendí a viajar ligero.',points:{agility:1,endurance:1},background:'Vida itinerante'}
    ]
  },
  {
    id:'emergency', title:'Una situación difícil', text:'Había alguien en peligro y el camino estaba bloqueado. ¿Qué hiciste?',
    answers:[
      {text:'Intenté abrir paso con lo que tenía a mano.',points:{force:1,will:1}},
      {text:'Busqué un acceso que los demás no habían visto.',points:{perception:1,agility:1}},
      {text:'Organizamos el esfuerzo antes de actuar.',points:{social:1,intellect:1}},
      {text:'Me quedé sosteniendo la estructura mientras salían.',points:{endurance:1,force:1}}
    ]
  },
  {
    id:'travel', title:'El camino', text:'Cuando había que recorrer una distancia larga, ¿en qué confiabas?',
    answers:[
      {text:'En mi resistencia. Podía continuar cuando otros paraban.',points:{endurance:1,will:1}},
      {text:'En mis ojos. Los caminos cuentan más de lo que parece.',points:{perception:1,intellect:1}},
      {text:'En mis piernas. Prefería un paso rápido y poco equipaje.',points:{agility:1,endurance:1}},
      {text:'En conocer a alguien en cada parada.',points:{social:1,perception:1}}
    ]
  },
  {
    id:'notice', title:'Una habitación desconocida', text:'¿Qué recuerdas mirar primero al entrar en un lugar nuevo?',
    answers:[
      {text:'Las salidas, las ventanas y quién podía verme.',points:{perception:1,agility:1}},
      {text:'Los objetos. Siempre quería saber para qué servían.',points:{intellect:1,perception:1}},
      {text:'Las personas y cómo se hablaban entre sí.',points:{social:1,perception:1}},
      {text:'Buscaba un sitio donde estar tranquilo.',points:{will:1,intellect:1}}
    ]
  },
  {
    id:'disagreement', title:'Un desacuerdo', text:'Alguien estaba convencido de algo que tú veías de otra manera. ¿Cómo respondías?',
    answers:[
      {text:'Le pedía que me explicara sus razones.',points:{social:1,intellect:1}},
      {text:'Mantenía mi posición sin levantar la voz.',points:{will:1,social:1}},
      {text:'Comprobaba los hechos antes de discutir.',points:{intellect:1,perception:1}},
      {text:'Esperaba. A veces la paciencia hacía más que las palabras.',points:{endurance:1,will:1}}
    ]
  },
  {
    id:'effort', title:'Una tarea que se resistía', text:'¿Qué te ayudaba cuando un trabajo parecía imposible?',
    answers:[
      {text:'Insistir y aprender de cada intento.',points:{will:1,intellect:1}},
      {text:'Encontrar una forma de repartir el esfuerzo.',points:{social:1,endurance:1}},
      {text:'Cambiar la técnica y moverme con precisión.',points:{agility:1,intellect:1}},
      {text:'Aguantar el esfuerzo hasta terminar.',points:{force:1,endurance:1}}
    ]
  },
  {
    id:'danger', title:'El último recuerdo del bosque', text:'Alguien te seguía. Entre los árboles había poco espacio para maniobrar.',
    answers:[
      {text:'Intenté desaparecer de su vista.',points:{agility:1,perception:1}},
      {text:'Me giré y le pregunté qué quería.',points:{social:1,will:1}},
      {text:'Busqué algo que pudiera utilizar a mi favor.',points:{intellect:1,agility:1}},
      {text:'Me preparé para impedirle el paso.',points:{force:1,will:1}}
    ]
  },
  {
    id:'habit', title:'Antes de descansar', text:'Una última pregunta. ¿Hay algo cuya ausencia te resulte difícil?',
    answers:[
      {text:'El tabaco. Lo echo de menos más de lo que quisiera.',points:{will:1,perception:1},habit:'tobacco'},
      {text:'La compañía. Me cuesta acostumbrarme al silencio.',points:{social:1,endurance:1},habit:null},
      {text:'Tener algo entre manos. Estar quieto no es lo mío.',points:{agility:1,intellect:1},habit:null},
      {text:'Nada en particular. Creo que podré descansar.',points:{endurance:1,will:1},habit:null}
    ]
  }
];

export const LOCATIONS = {
  refuge:{name:'La finca',subtitle:'Un techo, por ahora',image:'assets/finca.png',position:'center',cost:0},
  clinic:{name:'La clínica',subtitle:'Consulta del doctor Baumann',image:'assets/clinica.png',position:'center',cost:45*60},
  trail:{name:'Sendero del arroyo',subtitle:'Los caminos de Ernst',image:'assets/finca.png',position:'left center',cost:90*60}
};

export const NARRATIVE_CAST = [
  ['susanne','Susanne Adler','Dánae','1921-01'], ['josef','Josef Kreuz','Ánima','1921-03'],
  ['alexander','Alexander Berger','Testigo','1921-04'], ['daniel','Daniel Albers','Lastre','1921-06'],
  ['eleonore','Eleonore Weiß','Umbral','1921-07'], ['klara','Klara Voss','Sutura','1922-01'],
  ['elias','Elias Weber','Eco','1922-02'], ['marta','Marta Fink','Velo','1922-03'],
  ['abel','Abel Krämer','Réplica','1922-04'], ['beatrix','Beatrix Schuster','Compás','1922-05'],
  ['friedrich','Friedrich Keller','Descarga','1922-06'], ['ada','Ada Meier','Intervalo','1922-07'],
  ['simon','Simon Heller','Pacto','1922-08'], ['lotte','Lieselotte Arndt','Ascua','1922-09'],
  ['otto','Otto Stein','Quimera','1922-10'], ['rosa','Rosa Engel','Raíz','1922-11']
].map(([id,name,alias,arrival])=>({id,name,alias,arrival}));

// Catálogo de escritura de la campaña. Estas rutas no se anuncian como implementadas.
export const ENDING_CATALOGUE = [
  {id:'free_community',name:'La casa de todos',route:'luz',outcome:'Liberación con comunidad preservada'},
  {id:'costly_freedom',name:'Los nombres que quedan',route:'variable',outcome:'Liberación con pérdidas'},
  {id:'prevented_crisis',name:'Antes de la fractura',route:'variable',outcome:'Prevención de la catástrofe'},
  {id:'hartmann_renounces',name:'El derecho a marcharse',route:'luz',outcome:'Renuncia de Hartmann'},
  {id:'voluntary_concordance',name:'Una voz compartida',route:'luz',outcome:'Concordancia voluntaria reformada'},
  {id:'forced_concordance',name:'El silencio del desacuerdo',route:'oscuridad',outcome:'Concordancia impuesta'},
  {id:'player_dominion',name:'Mi voluntad',route:'oscuridad',outcome:'Apropiación del proyecto'},
  {id:'hartmann_wins',name:'La obra del maestro',route:'variable',outcome:'Victoria de Hartmann'},
  {id:'public_truth',name:'Que lo sepan',route:'variable',outcome:'Verdad demostrada y expuesta'},
  {id:'hidden_bargain',name:'Lo que no contamos',route:'variable',outcome:'Acuerdo que conserva secretos'},
  {id:'sacrifice',name:'El último vínculo',route:'variable',outcome:'Sacrificio decisivo'},
  {id:'withdrawal',name:'Una vida al margen',route:'variable',outcome:'Retirada y futuro propio'}
];

export const START_DATE = Date.UTC(1921,9,17,8,0,0);
export const WORLD_RATE = 30;
export const COURIER_HURT_TIME = 8*3600;
export const COURIER_DEATH_TIME = 16*3600;
export const COURIER_RETURN_TIME = 18*3600;

export const ITEMS = {
  ration:{name:'Ración de pan y queso',description:'Recupera alimento. Comer ocupa diez minutos.',sprite:'food'},
  water:{name:'Cantimplora',description:'Una carga de agua. Beber ocupa dos minutos.',sprite:'water'},
  bandage:{name:'Vendaje limpio',description:'Sirve para tratar heridas o estabilizar a alguien.',sprite:'health'},
  tobacco:{name:'Tabaco',description:'Alivia temporalmente la abstinencia si tienes ese hábito.',sprite:'leaf'}
};
