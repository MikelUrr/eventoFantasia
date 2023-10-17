//getdatofromapi

function obtenerPueblo() {
    const puebloForm = document.getElementById('puebloForm');
    const puebloInput = document.getElementById('puebloInput');
    //comento la parte del precio hasta revisarlo bien
    //const precioMaximoInput = document.getElementById('precioMaximoInput');
    const fechaInput = document.getElementById('fechaInput');
    const boton7Dias = document.getElementById('boton7dias');
    const cercaMi = document.getElementById('cercaDeMi')
    puebloForm.addEventListener('submit', function (event) {
        // Prevenimos que el formulario se envíe de forma convencional
        event.preventDefault();
        // Obtenemos el valor de los inputs
        const nombrePueblo = puebloInput.value;
        //const precioMaximo = precioMaximoInput.value;
        const fecha = fechaInput.value;
        // Mostramos un mensaje con el nombre del pueblo almacenado
        //alert('Nombre del pueblo almacenado: ' + nombrePueblo);
        // Llamamos a la función getMunicipalityFromApi y pasamos nombrePueblo como argumento
        //getMunicipalityFromApi(nombrePueblo, precioMaximo, fecha);
        getMunicipalityFromApi(nombrePueblo, fecha, suggest);
        //Llamamos a la funcion almacenar datos para guardar en localstorage información de la busqueda
        almacenarDatos(nombrePueblo, fecha)
    });
    boton7Dias.addEventListener('click', function (event) {
        event.preventDefault();
        const fecha = "7"
        if (puebloInput.value.trim() === '') {
            //alert('Por favor, ingrese un nombre de pueblo.');
            return; 
        }
        const nombrePueblo = puebloInput.value;
        getMunicipalityFromApi(nombrePueblo, fecha, suggest);
        almacenarDatos(nombrePueblo, fecha)
    });
    cercaMi.addEventListener('click', function (event) {
        event.preventDefault();
        const fecha = "7"
        getIp()
    });
    //incluyo boton de borrado hasta saber que hacer con el borrado
    borrarLocalStorage.addEventListener('click', function (event) {
        event.preventDefault();
       borradolocalStorage();
    });
}

async function getMunicipalityFromApi(pueblo, fecha, suggest) {
    try {

        const response = await fetch("https://api.euskadi.eus/culture/events/v1.0/municipalities?_elements=100000&_page=1")
        if (!response.ok) {
            throw new Error('La solicitud ha fallado');
        }
        const data = await response.json()
        const municipios = data.items
        let puebloEncontrado = false;
        municipios.forEach(municipio => {
            //con este if tambien nos verifica si parte del valor introducido coincide con algun municipio (es para prevenir errores en nombres largos tipo vitoria-gazteiz)
            if (!puebloEncontrado && municipio.nameEs.toLowerCase().includes(pueblo.toLowerCase())) {
                console.log(municipio.municipalityId);
                getDataFromApi(municipio.municipalityId, fecha, suggest)
                puebloEncontrado = true;
            }
        });
        if (!puebloEncontrado) {
            alert("El nombre del pueblo no existe");
            return;
        }
    } catch (error) {
        console.error(error)
    }
}

async function getDataFromApi(puebloid, fecha, suggest) {
    try {

        const respuesta = await fetch(`https://api.euskadi.eus/culture/events/v1.0/events/upcoming?_elements=1000&_page=1&municipalityNoraCode=${puebloid}&type=1`)
        if (!respuesta.ok) {
            throw new Error('La solicitud ha fallado');
        }
        const data = await respuesta.json()
        const info = await data.items

        processData(info, fecha, suggest)

        
    } catch (error) {
        console.error(error)
    }
}
async function processData(info, fecha, suggest) {
    const filteredData = [];
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    info.forEach(element => {
        const endDate = new Date(element.endDate);
        endDate.setUTCHours(0, 0, 0, 0);

        if (suggest) {
            if (endDate >= today && endDate <= nextWeek) {
                filteredData.push(element);
            }
        } else {
            if (fecha === "7" && endDate >= today && endDate <= nextWeek) {
                filteredData.push(element);
            } else if (element.endDate.split("T")[0] === fecha) {
                filteredData.push(element);
            }
        }
    });

    if (suggest && filteredData.length > 0) {
        const randomIndex = Math.floor(Math.random() * filteredData.length);
        const suggestedData = filteredData[randomIndex];
        console.log("Evento sugerido:", suggestedData);
        crearSugerencia(suggestedData);
    } else if (filteredData.length > 0) {
        console.log("Datos filtrados:", filteredData);
        crearBusqueda(filteredData);
    } else {
        console.log("No hay eventos disponibles para mostrar.");
        // Handle this case according to your application's requirements
    }
}


function almacenarDatos(nombrePueblo, fecha) {
      
    // Recuperar los datos del localStorage
    let nombres = JSON.parse(localStorage.getItem('nombres')) || [];
    let fechas = JSON.parse(localStorage.getItem('fechas')) || [];
    nombres.push(nombrePueblo);
    fechas.push(fecha);
    localStorage.setItem('nombres', JSON.stringify(nombres));
    localStorage.setItem('fechas', JSON.stringify(fechas));

    //no se como hacer para borrar los datos de localstorage al de un dia o dos dias xej
}
function borradolocalStorage() {
    return localStorage.clear();
}

function getDataFromStorage(suggest) {
    const nombres = JSON.parse(localStorage.getItem('nombres'));
    const fechas = JSON.parse(localStorage.getItem('fechas'));


    console.log(nombres);
    console.log(fechas);
    if (nombres === null || fechas === null) {
        return;
    } else {

        // Inicializar el objeto conteo para contar la frecuencia de los nombres
        const conteoNombres = {};
        const nombreMasRepetido = nombres.reduce((max, elemento) => {
            conteoNombres[elemento] = (conteoNombres[elemento] || 0) + 1;
            return conteoNombres[elemento] > conteoNombres[max] ? elemento : max;
        }, nombres[0]);

        // Inicializar el objeto conteo para contar la frecuencia de las fechas
        const conteoFechas = {};
        const fechaMasRepetida = fechas.reduce((max, elemento) => {
            conteoFechas[elemento] = (conteoFechas[elemento] || 0) + 1;
            return conteoFechas[elemento] > conteoFechas[max] ? elemento : max;
        }, fechas[0]);

        // Llama a la función getMunicipalityFromApi con los nombres y fechas más repetidos
        getMunicipalityFromApi(nombreMasRepetido, fechaMasRepetida, suggest = true);

    }


}
async function getIp() {

    try {
        const respuesta = await fetch('http://ip-api.com/json');
        const datos = await respuesta.json();
        console.log('Datos brutos de la IP:', datos);  // Agrega un registro para ver los datos brutos

        const ciudad = datos.city;
        console.log('Ciudad:', ciudad);  // Agrega un registro para ver la ciudad

        if (datos.status === 'success') {
            const fecha = "7";
           // alert('Estás en: ' + ciudad);
            almacenarDatos(ciudad, fecha);
            getMunicipalityFromApi(ciudad, fecha, suggest)

        } else {
            console.error('Error al obtener la IP: ', datos.message);
        }
    } catch (error) {
        console.error('Error al obtener la IP: ', error);
    }

}

function crearSugerencia(sugerencia) {
    // Obtener el contenedor de sugerencias
    const sugerenciaDelDia = document.getElementById("suggestions");
    //creando cosas
    const nuevoH1 = document.createElement("h1");
    const nuevoH3 = document.createElement("h3");
    const nuevoH4 = document.createElement("h4");
    const nuevoH4_1 = document.createElement("h4");
    const nuevoH4_2 = document.createElement("h4");
    const botonInfo = document.createElement("button");
    const botonCompra = document.createElement("button");

    nuevoH3.innerText = `Lugar: ${sugerencia.establishmentEs} Localidad: ${sugerencia.municipalityEs}`;
    nuevoH4.innerText = `Fecha ${sugerencia.startDate.split("T")[0]}`;
    nuevoH4_1.innerText = `Hora comienzo: ${sugerencia.openingHoursEs}`;
    nuevoH4_2.innerText = `Precio: ${sugerencia.priceEs}`;
    nuevoH1.innerText = sugerencia.nameEs;
    botonInfo.innerText = "+ Info";
    botonInfo.addEventListener('click', function (event) {
        event.preventDefault();
        window.open(sugerencia.sourceUrlEs, '_blank');
    });
    botonCompra.innerText = "Comprar";
    botonCompra.addEventListener('click', function (event) {
        event.preventDefault();
        window.open(sugerencia.purchaseUrlEu, '_blank');

    });
    //limpiamos la anterior busqueda

    // Limpiar el contenido anterior antes de agregar nuevos elementos
    sugerenciaDelDia.innerHTML = "";

    // Crear un contenedor para la sugerencia
    const contenedorSugerencia = document.createElement("div");
    contenedorSugerencia.classList.add("sugerencia");

    // Crear elementos para los datos de la sugerencia
    const titulo = document.createElement("h2");
    titulo.innerText = sugerencia.nameEs;

    const ubicacion = document.createElement("p");
    ubicacion.innerHTML = `Lugar: ${sugerencia.establishmentEs} - Localidad: ${sugerencia.municipalityEs}`;

    const fecha = document.createElement("p");
    const variable= sugerencia.startDate.split("T")[0]
    
    fecha.innerText = `Fecha: ${sugerencia.startDate.split("T")[0]}`;

    const horaComienzo = document.createElement("p");
    horaComienzo.innerText = `Hora comienzo: ${sugerencia.openingHoursEs}`;

    const precio = document.createElement("p");
    precio.innerText = `Precio: ${sugerencia.priceEs}`;

    // Adjuntar elementos al contenedor de sugerencia
    contenedorSugerencia.appendChild(titulo);
    contenedorSugerencia.appendChild(ubicacion);
    contenedorSugerencia.appendChild(fecha);
    contenedorSugerencia.appendChild(horaComienzo);
    contenedorSugerencia.appendChild(precio);

    // Adjuntar el contenedor de sugerencia al contenedor principal
    sugerenciaDelDia.appendChild(contenedorSugerencia);
    sugerenciaDelDia.appendChild(botonInfo);
    sugerenciaDelDia.appendChild(botonCompra);


    // Acceder al elemento de descripción y establecer su contenido
    const descripcion = document.getElementById('description');
    if(sugerencia.descriptionEs!== undefined){
        descripcion.innerHTML = sugerencia.descriptionEs;
    }
    

    // Inicializar el mapa
    const mapa = L.map('map').setView([sugerencia.municipalityLatitude, sugerencia.municipalityLongitude], 15);

    // Agregar una capa de mapa de OpenStreetMap al mapa
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(mapa);

    // Puedes agregar marcadores u otras capas al mapa si lo deseas
    // Ejemplo de marcador en una ubicación específica
    const marcador = L.marker([sugerencia.municipalityLatitude, sugerencia.municipalityLongitude]).addTo(mapa);
    marcador.bindPopup(sugerencia.municipalityEs).openPopup();
}


function crearBusqueda(datosFiltrados) {
    const contenedorElementos = document.getElementById("content");
    

    // Limpiamos el contenido anterior antes de empezar a agregar nuevos elementos
    contenedorElementos.innerHTML = "";

    datosFiltrados.forEach(dato => {
        // Crear elementos para cada iteración
        const article = document.createElement("article");
        article.classList.add("article");

        const nuevoH1 = document.createElement("h1");
        const nuevaImagen = document.createElement("img");
        const nuevoH3 = document.createElement("h3");
        const nuevoH4 = document.createElement("h4");
        const nuevoH4_1 = document.createElement("h4");
        const nuevoH4_2 = document.createElement("h4");
        const botonInfo = document.createElement("button");
        const botonCompra = document.createElement("button");

        
       // Establecer el contenido de los elementos si no son undefined
       nuevoH1.innerText = dato.nameEs;
       if (dato.establishmentEs !== undefined) {
           nuevoH3.innerText = `Lugar: ${dato.establishmentEs}`;
       }
       if (dato.municipalityEs !== undefined) {
           nuevoH3.innerText += ` Localidad: ${dato.municipalityEs}`;
       }
       if (dato.startDate !== undefined) {
           nuevoH4.innerText = `Fecha: ${dato.startDate}`;
       }
       if (dato.openingHoursEs !== undefined) {
           nuevoH4_1.innerText = `Hora comienzo: ${dato.openingHoursEs}`;
       }
       if (dato.priceEs !== undefined) {
           nuevoH4_2.innerText = `Precio: ${dato.priceEs}`;
       }
       if (dato.images !== undefined && dato.images.length > 0 && dato.images[0].imageUrl !== undefined) {
           nuevaImagen.src = dato.images[0].imageUrl;
           nuevaImagen.classList.add("tipo-imagen");
       }

        botonInfo.innerText = "+ Info"; botonInfo.addEventListener('click', function (event) {
            event.preventDefault();
            window.open(dato.sourceUrlEs, '_blank');
            
        });
        botonCompra.innerText = "Comprar";botonCompra.addEventListener('click', function (event) {
            event.preventDefault(); 
            window.open(dato.purchaseUrlEs, '_blank');         ;
    
        });


        // Adjuntar elementos al contenedor en cada iteración
        article.appendChild(nuevoH1);
        article.appendChild(nuevoH3);
        article.appendChild(nuevoH4);
        article.appendChild(nuevoH4_1);
        article.appendChild(nuevoH4_2);
        article.appendChild(nuevaImagen);
        article.appendChild(botonInfo);
        article.appendChild(botonCompra);

        contenedorElementos.appendChild(article);  
    });
}
//obtenerPueblo()
const suggest = false;
window.addEventListener('load', obtenerPueblo, getDataFromStorage(suggest));
//window.addEventListener('load', getDataFromStorage(suggest));


