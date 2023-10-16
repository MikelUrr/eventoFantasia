Readme del Código - Obtener Datos de API
Este código JavaScript está diseñado para interactuar con una API que proporciona información sobre eventos culturales en municipios. Permite a los usuarios buscar eventos en un pueblo específico, filtrar eventos por fecha y mostrar sugerencias basadas en la búsqueda anterior. Además, guarda los datos de búsqueda en el almacenamiento local del navegador para futuras referencias.

Funciones Principales
obtenerPueblo()
Esta función maneja la lógica principal del formulario de búsqueda. Recolecta datos del formulario, hace llamadas a la API y gestiona eventos del usuario.

getMunicipalityFromApi(pueblo, fecha, sugest)
Realiza una solicitud a la API para obtener información sobre municipios y filtra el municipio proporcionado. Los resultados se pasan a getDataFromApi() para obtener detalles de eventos específicos.

getDataFromApi(puebloid, fecha, sugest)
Hace una solicitud a la API para obtener datos de eventos para un municipio específico y una fecha dada. Los resultados se filtran y se pasan a filterData() o sugestData() según el valor de sugest.

filterData(info, fecha, sugest)
Filtra los eventos basados en la fecha proporcionada y los muestra en la interfaz.

sugestData(info, fecha, sugest)
Filtra los eventos y muestra una sugerencia aleatoria si sugest es verdadero. Si no hay sugerencias disponibles, devuelve un mensaje indicando la falta de sugerencias.

almacenarDatos(nombrePueblo, fecha)
Almacena los datos de búsqueda en el almacenamiento local del navegador para su posterior recuperación.

getDataFromStorage(sugest)
Recupera datos almacenados previamente del almacenamiento local del navegador, identifica los nombres y fechas más frecuentes y realiza una nueva búsqueda basada en estos datos si es posible.

getIp()
Obtiene la ubicación del usuario basándose en su dirección IP, realiza una búsqueda de eventos en esa ubicación y almacena los datos de búsqueda.

crearSugerencia(sugerencia)
Crea una interfaz visual para mostrar una sugerencia de evento, incluyendo detalles como el nombre del evento, la ubicación, la fecha, la hora de inicio y el precio. También muestra una descripción del evento y su ubicación en un mapa interactivo.

crearBusqueda(datosFiltrados)
Crea una interfaz visual para mostrar los resultados de búsqueda de eventos, incluyendo detalles similares a la función crearSugerencia.

Uso
El código está configurado para ejecutarse en un entorno web. Al cargar la página, se activa la función obtenerPueblo(), que inicializa la lógica de búsqueda y muestra los resultados de la última búsqueda almacenada en el almacenamiento local.


