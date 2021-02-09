$.get("/api/ordenador", crearInterfazOrdenadores);

// -------------------------------------
// Gestión de tarjetas superiores
// -------------------------------------

function tarjeta(titulo, dato) {
	return `
    <div class="flex items-center p-4 bg-white rounded-lg shadow-xs dark:bg-gray-800">
			<div class="p-3 mr-4 text-orange-500 bg-orange-100 rounded-full dark:text-orange-100 dark:bg-orange-500">
				<svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 19 19">
					<path fill-rule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clip-rule="evenodd" />
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
    `
}

function crearTarjetas() {
	let tarjetas = tarjeta('Total de ordenadores', ordenadores.cantidad);

	$("#main-contenido").append(`
		<div class="grid gap-6 mb-8 md:grid-cols-2 xl:grid-cols-4">
			${tarjetas}
		</div>
  `)
}

// -------------------------------------
// Gestión de la tabla de componentes
// -------------------------------------

// Variable de estado para comprobar la página en la que se encuentra
let pagina = 1;
let ordenadores = null;
let numElementosActuales = 0;
let paginaMax = 0;

function fila(id, tipo, localizacion, observaciones, otro, posicion) {
	if (observaciones == null) observaciones = "";
	if (localizacion  == null) localizacion = "";

	return `
		<tr id="ordenador-${id}" class="ordenador text-gray-700 dark:text-gray-400">
			<td class="px-4 py-3">
				<div class="flex items-center text-sm">
					<svg class="relative hidden w-6 h-6 mr-3 md:block" aria-hidden="true" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" stroke="currentColor" >
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
					</svg>
					<div>
						<p class="font-semibold">${id}</p>
					</div>
				</div>
			</td>
			<td id="tipo-${id}" class="px-4 py-3 text-sm">
				${tipo}
			</td>
			<td id="localizacion-${id}" class="px-4 py-3 text-sm">
				${localizacion}
			</td>
			<td id="observaciones-${id}" class="px-4 py-3 text-sm">
				${observaciones}
			</td>
			<td class="px-4 py-3">
				<div class="flex items-center space-x-4 text-sm">
					<button id="editar-${id}" @click="openModal" onclick="cargarFormulario(${id}, '${tipo}', '${localizacion}', '${observaciones}', '${otro}', ${posicion})" class="flex items-center justify-between px-2 py-2 text-sm font-medium leading-5 text-purple-600 rounded-lg dark:text-gray-400 focus:outline-none focus:shadow-outline-gray" aria-label="Edit">
						<svg class="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
							<path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"></path>
						</svg>
					</button>
					<button onclick="eliminarComponente(${id}, ${posicion});" class="flex items-center justify-between px-2 py-2 text-sm font-medium leading-5 text-purple-600 rounded-lg dark:text-gray-400 focus:outline-none focus:shadow-outline-gray" aria-label="Delete">
						<svg class="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
							<path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"></path>
						</svg>
					</button>
				</div>
			</td>
		</tr>
  `;
}

function crearOrdenadores() {
	let filas = '';
	let elementos = ordenadores.data.slice((pagina - 1) * 10, (pagina - 1) * 10 + 10);

	// Elimina la tabla de ordenadores
	$('.ordenador').remove();

	for (i = 0; i < elementos.length; i++){
		if(elementos[i].tipo == "Portatil")
			filas += fila(elementos[i].id, elementos[i].tipo, elementos[i].localizacion_taller, elementos[i].observaciones, elementos[i].estado, (pagina - 1)*10+i );
		else
			filas += fila(elementos[i].id, elementos[i].tipo, elementos[i].localizacion_taller, elementos[i].observaciones, elementos[i].tamano, (pagina - 1)*10+i );
	}

	$("#body-tabla").append(filas);

	// Actualiza el pie de la tabla
	if(numElementosActuales){
		numElementosActuales = elementos.length;
		$('#cantidad-pie').html(`Mostrando ${numElementosActuales} de ${ordenadores.cantidad}`);
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
							<th class="px-4 py-3">Tipo</th>
							<th class="px-4 py-3">Localización</th>
							<th class="px-4 py-3">Observaciones</th>
							<th class="px-4 py-3">Acciones</th>
						</tr>
					</thead>
					<tbody id="body-tabla" class="bg-white divide-y dark:divide-gray-700 dark:bg-gray-800">
					</tbody>
				</table>
			</div>
	
		</div>
  `);

	crearOrdenadores();
}

function crearInterfazOrdenadores(data) {
	ordenadores = data;
	paginaMax = Math.ceil(data.cantidad/10);

	eliminaPantallaCargando();
	crearTarjetas();
	if (ordenadores.cantidad) {
		crearTabla();
		generarPie();
	}
}

function getPagina(num) {
	pagina = num;
	crearOrdenadores();
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
				Mostrando ${numElementosActuales} de ${ordenadores.data.length}
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

function editarCaracteristica(id, posicion_componente, posicion_caracteristica){

	const nombre = $(`#caracteristica-${id}-nombre`).val();
	const valor  = $(`#caracteristica-${id}-valor`).val();

	$.ajax({
		url: `/api/componente/caracteristica/${id}`,
		data: JSON.stringify({
			nombre: nombre,
			valor: valor
		}),
		contentType: "application/json; charset=utf-8",
		dataType: "json",
		type: 'PUT',
		success: function(){
			componentes.data[posicion_componente].caracteristicas[posicion_caracteristica].nombre = nombre;
			componentes.data[posicion_componente].caracteristicas[posicion_caracteristica].valor = valor;
			
			$(`#icono-cambiar-caracteristica-${id}`).html(`
				<svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
				</svg>
			`);

			setTimeout(() => {
				$(`#icono-cambiar-caracteristica-${id}`).html(`
					<svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
					</svg>
				`);
			}, 1000)
		},
		error: function (){
			$(`#icono-cambiar-caracteristica-${id}`).html(`
				<svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
				</svg>
			`);

			setTimeout(() => {
				$(`#icono-cambiar-caracteristica-${id}`).html(`
					<svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
					</svg>
				`);
			}, 1000)
		}
	});

}

function crearCaracteristica(id_componente, posicion){

	const nombre = $(`#caracteristica--1-nombre`).val();
	const valor  = $(`#caracteristica--1-valor`).val();

	$.ajax({
		url: `/api/componente/${id_componente}/caracteristica`,
		data: JSON.stringify({
			nombre: nombre,
			valor: valor
		}),
		contentType: "application/json; charset=utf-8",
		dataType: "json",
		type: 'POST',
		success: function(datos){
			componentes.data[posicion].caracteristicas.push({
				id: datos.id,
				nombre: nombre, 
				valor: valor
			});
			
			$(`#icono-cambiar-caracteristica--1`).html(`
				<svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
				</svg>
			`);

			// Cambiar todos los id a la nueva id
			$('#caracteristica--1-nombre').attr("id",`caracteristica-${datos.id}-nombre`);
			$('#caracteristica--1-valor').attr("id",`caracteristica-${datos.id}-valor`);
			$('#fila-caracteristica--1').attr("id",`fila-caracteristica-${datos.id}`);
			$('#icono-cambiar-caracteristica--1').attr("id",`icono-cambiar-caracteristica-${datos.id}`);
			$(`#icono-cambiar-caracteristica-${datos.id}`).attr("onclick",`editarCaracteristica(${datos.id}, ${posicion}, ${componentes.data[posicion].caracteristicas.length-1} );`);
			$('#icono-borrar-caracteristica--1').attr("id",`icono-borrar-caracteristica-${datos.id}`);
			$(`#icono-borrar-caracteristica-${datos.id}`).attr("onclick",`eliminarCaracteristica(${datos.id}, ${posicion}, ${componentes.data[posicion].caracteristicas.length-1} );`);

			$('#boton-nueva-caracteristica').removeClass('hidden');

			setTimeout(() => {
				$(`#icono-cambiar-caracteristica-${datos.id}`).html(`
					<svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
					</svg>
				`);
			}, 1000)
		},
		error: function (){
			$(`#icono-cambiar-caracteristica--1`).html(`
				<svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
				</svg>
			`);

			setTimeout(() => {
				$(`#icono-cambiar-caracteristica--1`).html(`
					<svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
					</svg>
				`);
			}, 1000)
		}
	});

}

function eliminarCaracteristica(id, posicion_componente, posicion_caracteristica){

	if(id == -1){
		$(`#fila-caracteristica--1`).remove();
		$('#boton-nueva-caracteristica').removeClass('hidden');
	}
	else
		$.ajax({
			url: `/api/componente/caracteristica/${id}`,
			type: 'DELETE',
			success: function(){
				componentes.data[posicion_componente].caracteristicas.splice(posicion_caracteristica, 1);
				$(`#fila-caracteristica-${id}`).remove();

				$(`#icono-cambiar-caracteristica-${id}`).html(`
					<svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
					</svg>
				`);

				setTimeout(() => {
					$(`#icono-cambiar-caracteristica-${id}`).html(`
						<svg class="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
							<path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"></path>
						</svg>
					`);
				}, 1000)
			},
			error: function (){
				$(`#icono-cambiar-caracteristica-${id}`).html(`
					<svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				`);

				setTimeout(() => {
					$(`#icono-cambiar-caracteristica-${id}`).html(`
						<svg class="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
							<path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"></path>
						</svg>
					`);
				}, 1000)
			}
		});

}

function aniadirCaracteristica(caracteristica, posicion_componente, posicion_caracteristica, id_componente, accion){

	$('#body-tabla-caracteristicas').append(`
		<tr id="fila-caracteristica-${caracteristica.id}" class="text-gray-700 dark:text-gray-400">
			<td class="px-2 py-3 text-sm">
				<input id="caracteristica-${caracteristica.id}-nombre" class="w-32 dark:border-gray-600 dark:bg-gray-800 focus:border-purple-400 focus:outline-none focus:shadow-outline-purple dark:text-gray-300 dark:focus:shadow-outline-gray" type="text" value="${caracteristica.nombre}"/>
			</td>
			<td class="px-2 py-3 text-sm">
				<input id="caracteristica-${caracteristica.id}-valor" class="w-32 dark:border-gray-600 dark:bg-gray-800 focus:border-purple-400 focus:outline-none focus:shadow-outline-purple dark:text-gray-300 dark:focus:shadow-outline-gray" type="text" value="${caracteristica.valor}"/>
			</td>
			<td class="px-2 py-3">
			
			<div class="flex items-center space-x-4 text-sm">
				<button id="icono-cambiar-caracteristica-${caracteristica.id}" 
					${(accion=='editar' ? 'onclick="editarCaracteristica(' + caracteristica.id + ', ' + posicion_componente + ', ' + posicion_caracteristica + ');"' : 'onclick="crearCaracteristica(' + id_componente + ', ' + posicion_componente + ');"')} class="flex items-center justify-between px-2 py-2 text-sm font-medium leading-5 text-purple-600 rounded-lg dark:text-gray-400 focus:outline-none focus:shadow-outline-gray">
					<svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
					</svg>
				</button>
				<button id="icono-borrar-caracteristica-${caracteristica.id}" onclick="eliminarCaracteristica(${caracteristica.id}, ${posicion_componente}, ${posicion_caracteristica});" class="flex items-center justify-between px-2 py-2 text-sm font-medium leading-5 text-purple-600 rounded-lg dark:text-gray-400 focus:outline-none focus:shadow-outline-gray" aria-label="Delete">
					<svg class="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
						<path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"></path>
					</svg>
				</button>
			</div>
			</td>
		</tr>
	`)

	// Si es una nueva característica, se oculta el botón para añadir nuevas hasta que se guarde o borre
	if(caracteristica.id == -1)
		$('#boton-nueva-caracteristica').addClass('hidden');

}

function cargarCaracteristicas(id, posicion){

	let numeroComponentes = componentes.data[posicion].caracteristicas.length;

	$('#body-tabla-caracteristicas').html('');

	for (let i = 0; i < numeroComponentes; i++) {
		aniadirCaracteristica(componentes.data[posicion].caracteristicas[i], posicion, i, id, 'editar');
	}
	
}

// --------------------------------
// Gestión de acciones
// --------------------------------

function eliminarComponente(id, posicion){
	$.ajax({
		url: `/api/componente/${id}`,
		type: 'DELETE',
		success: function(){
			componentes.data.splice(posicion,1);
			crearComponentes();
			generarPie();

			// Actualiza la tarjeta superior
			$('#elementos-totales-tarjeta').html(componentes.data.length);
		}
	});
}

function cargarFormulario(id, tipo, localizacion, observaciones, otro, posicion){

	$('#editar-localizacion').val(localizacion);
	$('#editar-observaciones').val(observaciones);
	if(tipo == "Sobremesa"){
		$('#estado-o-tamano').html(`
			<span class="text-gray-700 dark:text-gray-400">Tamaño</span>
			<input id="editar-estado-o-tamano"
				class="block w-full mt-1 text-sm dark:border-gray-600 dark:bg-gray-700 focus:border-purple-400 focus:outline-none focus:shadow-outline-purple dark:text-gray-300 dark:focus:shadow-outline-gray form-input"
				placeholder="" value="${otro}"
			/>
		`);
	}
	else{
		$('#estado-o-tamano').html(`
			<span class="text-gray-700 dark:text-gray-400">Estado</span>
			<select id="editar-estado"
				class="block w-full mt-1 text-sm dark:text-gray-300 dark:border-gray-600 dark:bg-gray-700 form-select focus:border-purple-400 focus:outline-none focus:shadow-outline-purple dark:focus:shadow-outline-gray"
				value="${otro}"
			>
				<option>Desconocido</option>
				<option>Bueno</option>
				<option>Regular</option>
				<option>Por revisar</option>
				<option>No aprovechable</option>
				<option>Roto</option>
			</select>
		`);
	}

	// cargarCaracteristicas(id, posicion);
	// $('#confirmar-modal').attr('onclick', `editarComponente(${id}, ${posicion})`);
	// $('#boton-nueva-caracteristica').attr('onclick', `aniadirCaracteristica({id: -1, nombre: '', valor: ''}, ${posicion}, null, ${id}, 'crear');`);
}

function editarComponente(id, posicion){

	const tipo 	        = $('#editar-tipo').val();
	const estado        = $('#editar-estado').val();
	const fecha         = $('#editar-fecha').val();
	const observaciones = $('#editar-observaciones').val();
	
	const json = {
		"tipo": tipo,
		"estado": estado,
		"observaciones": observaciones
	};

	if(fecha)
		json["fecha_entrada"] = fecha;

	$.ajax({
		url: `/api/componente/${id}`,
		data: JSON.stringify(json),
		contentType: "application/json; charset=utf-8",
		dataType: "json",
		type: 'PUT',
		success: function(){
			$(`#tipo-${id}`).html(tipo);
			$(`#estado-${id}`).html(obtenerEstadoFormateado(estado));
			$(`#fecha-${id}`).html(fecha);
			$(`#observaciones-${id}`).html(observaciones);
			$(`#editar-${id}`).attr('onclick', `cargarFormulario('${id}', '${tipo}', '${estado}', '${fecha}', '${observaciones}', ${posicion})`);

			componentes.data[posicion].estado = estado;
			componentes.data[posicion].observaciones = observaciones;
			componentes.data[posicion].fecha_entrada = fecha;
			componentes.data[posicion].tipo = tipo;
		}
	});

}