const contenedor = document.getElementById("contenedorApod");
const inputFecha = document.getElementById("inputFecha");
const btnFavorito = document.getElementById("btnFavorito");
const listaFavoritos = document.getElementById("listaFavoritos");

let datosActuales = null;

inputFecha.max = new Date().toISOString().split("T")[0];

function cargarFoto(fecha = "") {
    contenedor.innerHTML = "<p>Buscando en el espacio...</p>";

    fetch("https://api.nasa.gov/planetary/apod?api_key=g4CebqpsAqhd0ueOg8SfOMQOEuYS0ygq5ivrPj2n" + "&date=" + fecha)
        .then(respuesta => {
            if (!respuesta.ok) {
                throw new Error("No se pudo conectar");
            }
            return respuesta.json();
        })
        .then(datos => {
            datosActuales = datos;
            
            // Si es video usamos iframe, si es imagen usamos img
            let contenidoMedia = "";
            if (datos.media_type === "image") {
                contenidoMedia = "<img src='" + datos.url + "' class='img-fluid'>";
            } else {
                contenidoMedia = "<div class='ratio ratio-16x9'><iframe src='" + datos.url + "'></iframe></div>";
            }

            // Mostramos todo en el HTML
            contenedor.innerHTML = `
                <h2>${datos.title}</h2>
                <p class='text-muted'>${datos.date}</p>
                ${contenidoMedia}
                <p class='mt-3'>${datos.explanation}</p>
            `;
        })
        .catch(error => {
            contenedor.innerHTML = "<p class='text-danger'>Error al cargar los datos.</p>";
        });
}

function mostrarFavoritos() {
    // Obtenemos lo que haya en memoria o una lista vacía si no hay nada
    let favoritos = JSON.parse(localStorage.getItem("mis_fotos_nasa")) || [];
    
    listaFavoritos.innerHTML = "";

    favoritos.forEach((fav, posicion) => {
        listaFavoritos.innerHTML += `
            <div class="list-group-item d-flex justify-content-between align-items-center">
                <span style="cursor:pointer" onclick="cargarFoto('${fav.fecha}')">${fav.titulo}</span>
                <button class="btn btn-danger btn-sm" onclick="borrarFavorito(${posicion})">X</button>
            </div>
        `;
    });
}

btnFavorito.onclick = function() {
    if (datosActuales) {
        let favoritos = JSON.parse(localStorage.getItem("mis_fotos_nasa")) || [];

        // Revisar si ya la guardamos antes
        let yaExiste = favoritos.some(f => f.fecha === datosActuales.date);
        
        if (yaExiste) {
            alert("Ya tienes esta foto en tus favoritos.");
        } else {
            // Agregamos el nuevo favorito a la lista
            favoritos.push({
                titulo: datosActuales.title,
                fecha: datosActuales.date
            });
            localStorage.setItem("mis_fotos_nasa", JSON.stringify(favoritos));
            mostrarFavoritos();
        }
    }
};

window.borrarFavorito = function(posicion) {
    let favoritos = JSON.parse(localStorage.getItem("mis_fotos_nasa")) || [];
    favoritos.splice(posicion, 1); // Quitar el elemento de esa posición
    localStorage.setItem("mis_fotos_nasa", JSON.stringify(favoritos));
    mostrarFavoritos();
};

inputFecha.onchange = function() {
    cargarFoto(inputFecha.value);
};

cargarFoto();
mostrarFavoritos();