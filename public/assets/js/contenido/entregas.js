$.get("/api/recogida/Entrega", crearInterfazRecogidas);

// -------------------------------------
// Gestión de tarjetas superiores
// -------------------------------------

function tarjeta(titulo, dato) {
	return `
    <div class="flex items-center p-4 bg-white rounded-lg shadow-xs dark:bg-gray-800 cursor-pointer" onclick="exportarDatos()">
		<div class="p-3 mr-4 text-orange-500 bg-orange-100 rounded-full dark:text-orange-100 dark:bg-orange-500">
			<svg class="w-6 h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
				<path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" />
			</svg>
		</div>
		<div>
			<p class="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
			Exportar datos
			</p>
		</div>
	</div>
    <a href="localizaciones.html">
        <div class="flex items-center p-4 h-full bg-white rounded-lg shadow-xs dark:bg-gray-800 cursor-pointer">
            <div class="p-3 mr-4 text-orange-500 bg-orange-100 rounded-full dark:text-orange-100 dark:bg-orange-500">
                <svg class="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            </div>
            <div>
                <p class="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                    Gestionar localizaciones
                </p>
            </div>
        </div>
    </a>
    <div class="flex items-center p-4 bg-white rounded-lg shadow-xs dark:bg-gray-800">
			<div class="p-3 mr-4 text-orange-500 bg-orange-100 rounded-full dark:text-orange-100 dark:bg-orange-500">
                <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
			</div>
			<div>
				<p class="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
				${titulo}
				</p>
				<p id="elementos-totales-tarjeta" class="text-lg font-semibold text-gray-700 dark:text-gray-200">
				${dato}
				</p>
			</div>
    </div>
	<div class="flex items-center p-4 bg-white rounded-lg shadow-xs dark:bg-gray-800 cursor-pointer" onclick="cargarFormularioVacio()" @click="openModal">
			<div class="p-3 mr-4 text-orange-500 bg-orange-100 rounded-full dark:text-orange-100 dark:bg-orange-500">
				<svg class="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
				</svg>
			</div>
			<div>
				<p class="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
				Añadir recogida
				</p>
			</div>
    </div>
    `
}

function crearTarjetas() {
	let tarjetas = tarjeta('Recogidas totales', recogidas.cantidad);

	$("#main-contenido").append(`
		<div class="grid gap-6 mb-8 md:grid-cols-2 xl:grid-cols-4">
			${tarjetas}
		</div>
  `)
}

// -------------------------------------
// Gestión de la tabla de recogidas
// -------------------------------------

// Variable de estado para comprobar la página en la que se encuentra
let pagina = 1;
let recogidas = null;
let localizaciones = null;
let numElementosActuales = 0;
let paginaMax = 0;

// Carga las localizaciones
$.get("/api/localizacion", function(data){
    localizaciones = data;

    $('#editar-localizacion').html('');
    
    for (let i = 0; i < localizaciones.cantidad; i++) {
        $('#editar-localizacion').append(`
            <option>${localizaciones.data[i].nombre}</option>
        `)
    }
})

function fila(id, fecha, localizacion, posicion) {
	if (fecha == null)  fecha = "";

	return `
		<tr id="recogida-${id}" class="recogida text-gray-700 dark:text-gray-400">
			<td class="px-4 py-3">
				<div class="cursor-pointer flex items-center text-sm" onclick="window.location.href='recogida?id=${id}'">
					<svg class="relative hidden w-6 h-6 mr-3 md:block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <div>
						<p class="font-semibold">${id}</p>
					</div>
				</div>
			</td>
			<td id="fecha-${id}" class="cursor-pointer px-4 py-3 text-xs" onclick="window.location.href='recogida?id=${id}'">
                ${fecha.split('T')[0]}
			</td>
			<td id="localizacion-${id}" class="cursor-pointer px-4 py-3 text-xs" onclick="window.location.href='recogida?id=${id}'">
				${localizacion}
			</td>
			<td class="px-4 py-3">
				<div class="flex items-center space-x-4 text-sm">
					<button id="editar-${id}" @click="openModal" onclick="cargarFormulario('${id}', '${fecha.split('T')[0]}', '${localizacion}', ${posicion})" class="flex items-center justify-between px-2 py-2 text-sm font-medium leading-5 text-purple-600 rounded-lg dark:text-gray-400 focus:outline-none focus:shadow-outline-gray" aria-label="Edit">
						<svg class="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
							<path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"></path>
						</svg>
					</button>
					<button onclick="eliminarRecogida(${id}, ${posicion});" class="flex items-center justify-between px-2 py-2 text-sm font-medium leading-5 text-purple-600 rounded-lg dark:text-gray-400 focus:outline-none focus:shadow-outline-gray" aria-label="Delete">
						<svg class="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
							<path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"></path>
						</svg>
					</button>
				</div>
			</td>
		</tr>
  `;
}

function crearRecogidas() {
	let filas = '';
	let elementos = recogidas.data.slice((pagina - 1) * 10, (pagina - 1) * 10 + 10);
	paginaMax = Math.ceil(recogidas.cantidad/10);

	// Elimina la tabla de recogidas
	$('.recogida').remove();

	for (i = 0; i < elementos.length; i++)
		filas += fila(elementos[i].id, elementos[i].fecha, elementos[i].localizacion, (pagina - 1)*10+i );

	$("#body-tabla").append(filas);

	// Actualiza el pie de la tabla
	if(numElementosActuales){
		numElementosActuales = elementos.length;
		$('#cantidad-pie').html(`Mostrando ${numElementosActuales} de ${recogidas.cantidad}`);
	}
	else
		numElementosActuales = elementos.length;

	generarNavegadorTabla();
}

function crearTabla() {

	$("#main-contenido").append(`
		<div id="main-tabla" class="w-full overflow-hidden rounded-lg shadow-xs">

			<div class="w-full overflow-x-auto">
				<table class="w-full whitespace-no-wrap">
					<thead>
						<tr class="text-xs font-semibold tracking-wide text-left text-gray-500 uppercase border-b dark:border-gray-700 bg-gray-50 dark:text-gray-400 dark:bg-gray-800">
							<th class="px-4 py-3">ID</th>
							<th class="px-4 py-3">Fecha</th>
							<th class="px-4 py-3">Localización</th>
							<th class="px-4 py-3">Acciones</th>
						</tr>
					</thead>
					<tbody id="body-tabla" class="bg-white divide-y dark:divide-gray-700 dark:bg-gray-800">
					</tbody>
				</table>
			</div>
	
		</div>
  `);

	crearRecogidas();
}

function crearInterfazRecogidas(data) {
	recogidas = data;
	paginaMax = Math.ceil(data.cantidad/10);

	eliminaPantallaCargando();
	crearTarjetas();
	if (recogidas.cantidad) {
		crearTabla();
		generarPie();
	}
}

function getPagina(num) {
	pagina = num;
	crearRecogidas();
}

function generarNavegadorTabla(){
	let html = "";

	// Elimina los actuales al cambiar de tabla
	$('.elemento-navegacion-tabla').remove();

	html += `
		<li class="elemento-navegacion-tabla">
			<button onclick="if(pagina>1) getPagina(pagina-1);" class="px-3 py-1 rounded-md rounded-l-lg focus:outline-none focus:shadow-outline-purple" aria-label="Previous">
				<svg class="w-4 h-4 fill-current" aria-hidden="true" viewBox="0 0 20 20">
					<path d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" fill-rule="evenodd"></path>
				</svg>
			</button>
		</li>
	`;

	if(paginaMax > 5){

		if(pagina != 1){
			html += `<li class="elemento-navegacion-tabla"> 
						<button onclick="getPagina(1);" class="px-3 py-1 rounded-md focus:outline-none focus:shadow-outline-purple">
							1 
						</button>
					</li>
					`
		}

		if(pagina >= 3){
			html += `<li class="elemento-navegacion-tabla">
						<span class="px-3 py-1">...</span>
					</li>
					`
		}

		html += `<li class="elemento-navegacion-tabla">
					<button onclick="getPagina(${pagina});" class="px-3 py-1 text-white transition-colors duration-150 bg-purple-600 border border-r-0 border-purple-600 rounded-md focus:outline-none focus:shadow-outline-purple">
						${pagina}
					</button>
				</li>
				`

		if(pagina != paginaMax){
			if(pagina<paginaMax-1){
				html += `<li class="elemento-navegacion-tabla">
							<span class="px-3 py-1">...</span> 
						</li>
						`
			}

			html += `
				<li class="elemento-navegacion-tabla">
					<button onclick="getPagina(${paginaMax});" class="px-3 py-1 rounded-md focus:outline-none focus:shadow-outline-purple">
						${paginaMax}
					</button>
				</li>
			`
		}
	}
	else{

		for (i = 1; i <= paginaMax; i++) {
			html += `
				<li class="elemento-navegacion-tabla">
					<button onclick="getPagina(${i});" 
						${ pagina!=i ? 'class="px-3 py-1 rounded-md focus:outline-none focus:shadow-outline-purple"' : 'class="px-3 py-1 text-white transition-colors duration-150 bg-purple-600 border border-r-0 border-purple-600 rounded-md focus:outline-none focus:shadow-outline-purple"' } >
						${i}
					</button>
				</li>
			`
		}

	}

	html += `
		<li class="elemento-navegacion-tabla">
			<button onclick="if(pagina<paginaMax) getPagina(pagina+1);" class="px-3 py-1 rounded-md rounded-r-lg focus:outline-none focus:shadow-outline-purple" aria-label="Next">
				<svg class="w-4 h-4 fill-current" aria-hidden="true" viewBox="0 0 20 20">
					<path d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" fill-rule="evenodd"></path>
				</svg>
			</button>
		</li>
	`;
	
	$('#navegacion-tablas').html(html);
}

function generarPie() {
	$('#pie-tabla').remove();

	$("#main-tabla").append(`
		<div id="pie-tabla" class="grid px-4 py-3 text-xs font-semibold tracking-wide text-gray-500 uppercase border-t dark:border-gray-700 bg-gray-50 sm:grid-cols-9 dark:text-gray-400 dark:bg-gray-800">
			<span id="cantidad-pie" class="flex items-center col-span-3">
				Mostrando ${numElementosActuales} de ${recogidas.data.length}
			</span>
			<span class="col-span-2"></span>
			<!-- Pagination -->
			<span class="flex col-span-4 mt-2 sm:mt-auto sm:justify-end">
				<nav aria-label="Table navigation">
					<ul id="navegacion-tablas" class="inline-flex items-center">
					</ul>
				</nav>
			</span>
		</div>
	  `);
	  
	  generarNavegadorTabla();
}

function eliminarRecogida(id, posicion){
	$.ajax({
		url: `/api/recogida/${id}`,
		type: 'DELETE',
		success: function(){
			recogidas.cantidad--;
			
			if(recogidas.cantidad%10 == 0 && pagina!=1){
				pagina--;
			}

			recogidas.data.splice(posicion,1);
			crearRecogidas();
			generarPie();

			// Actualiza la tarjeta superior
			$('#elementos-totales-tarjeta').html(recogidas.data.length);
		},
		error: function(){
			$('#titulo-error').html('Error al eliminar')
			$('#mensaje-error').html('Ha habido un error al eliminar la entrega')
			$('.popup').removeClass('hidden');

			setTimeout(() => $('.popup').addClass('hidden'), 3000 )
		}
	});
}

function cargarFormulario(id, fecha, localizacion, posicion){

	$('#editar-fecha').val(fecha);
	$('#editar-localizacion').val(localizacion);
	$('#confirmar-modal').attr('onclick', `editarRecogida(${id}, ${posicion})`);

}

function cargarFormularioVacio(){

	$('#editar-fecha').val('');
	$('#editar-localizacion').val('');
	$('#confirmar-modal').attr('onclick', `crearRecogida()`);
}

function editarRecogida(id, posicion){
	
	let fecha 	     = $('#editar-fecha').val();
	let localizacion = $('#editar-localizacion').val();
	
    let json = {
        fecha: fecha,
        localizacion: localizacion
    }

	$.ajax({
		url: `/api/recogida/${id}/`,
		type: 'PUT',
        data: JSON.stringify(json),
		contentType: "application/json; charset=utf-8",
		dataType: "json",
		success: function(){
			$(`#fecha-${id}`).html(fecha);
			$(`#localizacion-${id}`).html(localizacion);
			$(`#editar-${id}`).attr('onclick', `cargarFormulario('${id}', '${fecha}', '${localizacion}', ${posicion})`);

			recogidas.data[posicion].fecha = fecha;
			recogidas.data[posicion].localizacion = localizacion;
		},
		error: function(){
			$('#titulo-error').html('Error al editar')
			$('#mensaje-error').html('Ha habido un error al editar la entrega')
			$('.popup').removeClass('hidden');

			setTimeout(() => $('.popup').addClass('hidden'), 3000 )
		}
	});

}

function crearRecogida(){

	let fecha 	     = $('#editar-fecha').val();
	let localizacion = $('#editar-localizacion').val();
	
    let json = {
        fecha: fecha,
        tipo: "Entrega",
        localizacion: localizacion
    }

	$.ajax({
		url: `/api/recogida/`,
        data: JSON.stringify(json),
		contentType: "application/json; charset=utf-8",
		dataType: "json",
		type: 'POST',
		success: function(data){
			let id = data.id;
			recogidas.cantidad++;

			recogidas.data.push({
				id: id,
				fecha: fecha,
				localizacion: localizacion,
                tipo: "Recogida"
			})

			$('#elementos-totales-tarjeta').html(recogidas.cantidad);
			if(!$('#main-tabla').length){
				crearTabla();
				generarPie();
			}
			else
				crearRecogidas();
		},
		error: function(){
			$('#titulo-error').html('Error al crear')
			$('#mensaje-error').html('Ha habido un error al crear la entrega')
			$('.popup').removeClass('hidden');

			setTimeout(() => $('.popup').addClass('hidden'), 3000 )
		}
	});

}


// ----------------------------------------------------------------------------------
// EXPORTACIÓN DE DATOS
// ----------------------------------------------------------------------------------

function exportarDatos(){

	$.ajax({
		url: `/api/recogida/Entrega/exportar`,
		type: 'GET',
		success: function(data){
			texto = `"id_recogida","fecha","tipo","localizacion","numero_cables","numero_componentes","numero_ordenadores","numero_transformadores"\n`;

			for (let i = 0; i < data.data.length; i++) {
				
				texto += `${data.data[i].id},${data.data[i].fecha},"${data.data[i].tipo}","${data.data[i].localizacion}",${data.data[i].numero_cables},${data.data[i].numero_componentes},${data.data[i].numero_ordenadores},${data.data[i].numero_transformadores}\n`;
				
			}

			let archivo = `recogidas.csv`;

			var element = document.createElement('a');
			element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(texto));
			element.setAttribute('download', archivo);

			element.style.display = 'none';
			document.body.appendChild(element);

			element.click();

			document.body.removeChild(element);
		},
		error: function(){
			$('#titulo-error').html('Error al exportar')
			$('#mensaje-error').html('No se han podido obtener los datos')
			$('.popup').removeClass('hidden');

			setTimeout(() => $('.popup').addClass('hidden'), 3000 )
		}
	});

}