$.get("/api/cable", crearInterfazCables);

// -------------------------------------
// Gestión de tarjetas superiores
// -------------------------------------

function tarjeta(titulo, dato) {
	return `
    <div class="flex items-center p-4 bg-white rounded-lg shadow-xs dark:bg-gray-800">
			<div class="p-3 mr-4 text-orange-500 bg-orange-100 rounded-full dark:text-orange-100 dark:bg-orange-500">
				<svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
					<path fill-rule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd" />
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
				Añadir cable
				</p>
			</div>
    </div>
    `
}

function crearTarjetas() {
	let tarjetas = tarjeta('Total de cables', cables.cantidad);

	$("#main-contenido").append(`
		<div class="grid gap-6 mb-8 md:grid-cols-2 xl:grid-cols-4">
			${tarjetas}
		</div>
  `)
}

// -------------------------------------
// Gestión de la tabla de cables
// -------------------------------------

// Variable de estado para comprobar la página en la que se encuentra
let pagina = 1;
let cables = null;
let numElementosActuales = 0;
let paginaMax = 0;

function fila(id, tipo, version, posicion) {
	if (version == null) version = "";

	return `
		<tr id="cable-${id}" class="cable text-gray-700 dark:text-gray-400">
			<td class="px-4 py-3">
				<div class="flex items-center text-sm">
					<svg class="relative hidden w-6 h-6 mr-3 md:block" aria-hidden="true" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" stroke="currentColor" ><path d="M20 12H4" ></path></svg>
					<div>
						<p class="font-semibold">${id}</p>
					</div>
				</div>
			</td>
			<td id="tipo-${id}" class="px-4 py-3 text-sm">
				${tipo}
			</td>
			<td id="version-${id}" class="px-4 py-3 text-xs">
				${version}
			</td>
			<td class="px-4 py-3">
				<div class="flex items-center space-x-4 text-sm">
					<button id="editar-${id}" @click="openModal" onclick="cargarFormulario('${id}', '${tipo}', '${version}', ${posicion})" class="flex items-center justify-between px-2 py-2 text-sm font-medium leading-5 text-purple-600 rounded-lg dark:text-gray-400 focus:outline-none focus:shadow-outline-gray" aria-label="Edit">
						<svg class="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
							<path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"></path>
						</svg>
					</button>
					<button onclick="eliminarCable(${id}, ${posicion});" class="flex items-center justify-between px-2 py-2 text-sm font-medium leading-5 text-purple-600 rounded-lg dark:text-gray-400 focus:outline-none focus:shadow-outline-gray" aria-label="Delete">
						<svg class="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
							<path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"></path>
						</svg>
					</button>
				</div>
			</td>
		</tr>
  `;
}

function crearCables() {
	let filas = '';
	let elementos = cables.data.slice((pagina - 1) * 10, (pagina - 1) * 10 + 10);
	paginaMax = Math.ceil(cables.cantidad/10);

	// Elimina la tabla de cables
	$('.cable').remove();

	for (i = 0; i < elementos.length; i++)
		filas += fila(elementos[i].id, elementos[i].tipo, elementos[i].version_tipo, (pagina - 1)*10+i );

	$("#body-tabla").append(filas);

	// Actualiza el pie de la tabla
	if(numElementosActuales){
		numElementosActuales = elementos.length;
		$('#cantidad-pie').html(`Mostrando ${numElementosActuales} de ${cables.cantidad}`);
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
							<th class="px-4 py-3">Versión</th>
							<th class="px-4 py-3">Acciones</th>
						</tr>
					</thead>
					<tbody id="body-tabla" class="bg-white divide-y dark:divide-gray-700 dark:bg-gray-800">
					</tbody>
				</table>
			</div>
	
		</div>
  `);

	crearCables();
}

function crearInterfazCables(data) {
	cables = data;
	paginaMax = Math.ceil(data.cantidad/10);

	eliminaPantallaCargando();
	crearTarjetas();
	if (cables.cantidad) {
		crearTabla();
		generarPie();
	}
}

function getPagina(num) {
	pagina = num;
	crearCables();
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
				Mostrando ${numElementosActuales} de ${cables.data.length}
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

function eliminarCable(id, posicion){
	$.ajax({
		url: `/api/cable/id/${id}`,
		type: 'DELETE',
		success: function(){
			cables.cantidad--;
			
			if(cables.cantidad%10 == 0){
				pagina--;
			}

			cables.data.splice(posicion,1);
			crearCables();
			generarPie();

			// Actualiza la tarjeta superior
			$('#elementos-totales-tarjeta').html(cables.data.length);
		}
	});
}

function cargarFormulario(id, tipo, version, posicion){

	$('#editar-tipo').val(tipo);
	$('#editar-version').val(version);
	$('#confirmar-modal').attr('onclick', `editarCable(${id}, ${posicion})`);

}

function cargarFormularioVacio(){

	$('#editar-tipo').val('');
	$('#editar-version').val('');
	$('#confirmar-modal').attr('onclick', `crearCable()`);
}

function editarCable(id, posicion){

	let tipo 	= $('#editar-tipo').val();
	let version = $('#editar-version').val();
	
	$.ajax({
		url: `/api/cable/${id}/${tipo}/${version}`,
		type: 'PUT',
		success: function(){
			$(`#tipo-${id}`).html(tipo);
			$(`#version-${id}`).html(version);
			$(`#editar-${id}`).attr('onclick', `cargarFormulario('${id}', '${tipo}', '${version}', ${posicion})`);

			cables.data[posicion].tipo = tipo;
			cables.data[posicion].version_tipo = version;
		}
	});

}

var hola;

function crearCable(){

	let tipo 	= $('#editar-tipo').val();
	let version = $('#editar-version').val();
	
	$.ajax({
		url: `/api/cable/${tipo}/${version}`,
		type: 'POST',
		success: function(data){
			let id = data.id;
			cables.cantidad++;

			cables.data.push({
				id: id,
				tipo: tipo,
				version_tipo: version
			})

			$('#elementos-totales-tarjeta').html(cables.cantidad);
			crearCables();
		}
	});

}