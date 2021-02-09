
function eliminaPantallaCargando() {
	$('#cargando').remove();
}

// Funciones auxiliares que pueden servir en diferentes páginas
function obtenerEstadoFormateado ( estado ){
    if(estado=='Desconocido' || estado=='Por revisar'){
        return `<span class="px-2 py-1 font-semibold leading-tight text-gray-700 bg-gray-100 rounded-full dark:text-gray-100 dark:bg-gray-700">
                    ${estado}
                </span>
                `
    }
    else if(estado=='Bueno'){
        return `<span class="px-2 py-1 font-semibold leading-tight text-green-700 bg-green-100 rounded-full dark:bg-green-700 dark:text-green-100">
                    Bueno
                </span>
                `
    }
    else if(estado=='Regular'){
        return `<span class="px-2 py-1 font-semibold leading-tight text-orange-700 bg-orange-100 rounded-full dark:text-white dark:bg-orange-600">
                    Regular
                </span>
                `
    }
    else if(estado=='No aprovechable' || estado=='Roto'){
        return `<span class="px-2 py-1 font-semibold leading-tight text-red-700 bg-red-100 rounded-full dark:text-red-100 dark:bg-red-700" >
                    ${estado}
                </span>
                `
    }
}