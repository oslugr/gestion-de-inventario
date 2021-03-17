let recogida = null
const urlParams = new URLSearchParams(window.location.search);
if(urlParams.has('id')){
    $.get(`/api/recogida/info/${urlParams.get('id')}`, crearInterfazRecogida);
}
else{
    window.location.replace('../pages/404.html')
}

function crearInterfazRecogida(data){
    recogida = data;

    eliminaPantallaCargando();
    mostrarRecogida();
	crearTarjetas();

    // Crear cables
    $.get(`/api/recogida/${recogida.id}/cable`, crearInterfazCables);
    // Crear ordenadores
    $.get(`/api/recogida/${recogida.id}/ordenador`, crearInterfazOrdenadores);
    // Crear Transformadores
    $.get(`/api/recogida/${recogida.id}/transformador`, crearInterfazTransformadores);
    // Crear componentes
    $.get(`/api/recogida/${recogida.id}/componente`, crearInterfazComponentes);
}

function mostrarRecogida(){

	if (recogida.fecha  == null) recogida.fecha = "";

    $("#main-contenido").append(`
		<div id="tabla-recogida" class="w-full overflow-hidden rounded-lg shadow-xs mt-10">

			<div class="w-full overflow-x-auto">
				<table class="w-full whitespace-no-wrap">
					<thead>
						<tr class="text-xs font-semibold tracking-wide text-left text-gray-500 uppercase border-b dark:border-gray-700 bg-gray-50 dark:text-gray-400 dark:bg-gray-800">
							<th class="px-4 py-3">ID</th>
							<th class="px-4 py-3">Fecha</th>
							<th class="px-4 py-3">Localización</th>
						</tr>
					</thead>
					<tbody id="body-tabla-recogida" class="bg-white divide-y dark:divide-gray-700 dark:bg-gray-800">
					
                    <tr id="recogida" class=" cursor-pointer text-gray-700 dark:text-gray-400" onclick="cargarInfoOrdenador(id, this)">
                        <td class="px-4 py-3">
                            <div class="flex items-center text-sm">
                                <svg class="relative hidden w-6 h-6 mr-3 md:block" aria-hidden="true" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" stroke="currentColor" >
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <div>
                                    <p class="font-semibold">${recogida.id}</p>
                                </div>
                            </div>
                        </td>
                        <td class="px-4 py-3 text-sm">
                            ${recogida.fecha.split('T')[0]}
                        </td>
                        <td class="px-4 py-3 text-sm">
                            ${recogida.localizacion}
                        </td>
                    </tr>
                    
                    </tbody>
				</table>
			</div>
	
		</div>
  `);

}

// -------------------------------------
// Gestión de tarjetas superiores
// -------------------------------------

function tarjeta(tipo,titulo, dato) {
	return `
    <div class="flex items-center p-4 bg-white rounded-lg shadow-xs dark:bg-gray-800">
			<div class="p-3 mr-4 text-orange-500 bg-orange-100 rounded-full dark:text-orange-100 dark:bg-orange-500">
				<svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
				</svg>
			</div>
			<div>
				<p class="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
				${titulo}
				</p>
				<p id="elementos-totales-tarjeta-${tipo}" class="text-lg font-semibold text-gray-700 dark:text-gray-200">
				${dato}
				</p>
			</div>
    </div>
	<div id="boton-aniadir-${tipo}" class="flex items-center p-4 bg-white rounded-lg shadow-xs dark:bg-gray-800 cursor-pointer" @click="openModal">
			<div class="p-3 mr-4 text-orange-500 bg-orange-100 rounded-full dark:text-orange-100 dark:bg-orange-500">
				<svg class="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
				</svg>
			</div>
			<div>
				<p class="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
				Añadir ${tipo}
				</p>
			</div>
    </div>
    `
}

function crearTarjetas() {
	$("#main-contenido").append(`
		<div id="main-tarjetas" class="grid gap-6 mt-4 md:grid-cols-2 xl:grid-cols-4">
			<div class="flex items-center p-4 bg-white rounded-lg shadow-xs dark:bg-gray-800 cursor-pointer" onclick="descargarArchivoDatos()">
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
		</div>
  `)
}

// ----------------------------------------------------------------------------------
// CABLES
// ----------------------------------------------------------------------------------

// Variable de estado para comprobar la página en la que se encuentra
let pagina_cables = 1;
let cables = null;
let numElementosActuales_cables = 0;
let paginaMax_cables = 0;

function fila_cables(id, tipo, version, posicion) {
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
			<td id="cable_tipo-${id}" class="px-4 py-3 text-sm">
				${tipo}
			</td>
			<td id="cable_version-${id}" class="px-4 py-3 text-xs">
				${version}
			</td>
			<td class="px-4 py-3">
				<div class="flex items-center space-x-4 text-sm">
					<button id="cable_editar-${id}" @click="openModal" onclick="cargarFormularioCable('${id}', '${tipo}', '${version}', ${posicion})" class="flex items-center justify-between px-2 py-2 text-sm font-medium leading-5 text-purple-600 rounded-lg dark:text-gray-400 focus:outline-none focus:shadow-outline-gray" aria-label="Edit">
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
	let elementos = cables.data.slice((pagina_cables - 1) * 10, (pagina_cables - 1) * 10 + 10);
	paginaMax_cables = Math.ceil(cables.cantidad/10);

	// Elimina la tabla de cables
	$('.cable').remove();

	for (i = 0; i < elementos.length; i++)
		filas += fila_cables(elementos[i].id, elementos[i].tipo, elementos[i].version_tipo, (pagina_cables - 1)*10+i );

	$("#body-tabla-cables").append(filas);

	// Actualiza el pie de la tabla
	if(numElementosActuales_cables){
		numElementosActuales_cables = elementos.length;
		$('#cantidad-pie_cables').html(`Mostrando ${numElementosActuales_cables} de ${cables.cantidad}`);
	}
	else
		numElementosActuales_cables = elementos.length;

	generarNavegadorTablaCables();
}

function crearTablaCables() {

	$("#cables-contenido").append(`
		<div id="main-tabla-cables" class="w-full overflow-hidden rounded-lg shadow-xs">

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
					<tbody id="body-tabla-cables" class="bg-white divide-y dark:divide-gray-700 dark:bg-gray-800">
					</tbody>
				</table>
			</div>
	
		</div>
  `);

	crearCables();
}

function crearInterfazCables(data) {
	cables = data;
	paginaMax_cables = Math.ceil(data.cantidad/10);

	$('#cargando-cables').remove();
	$('#main-tarjetas').append(tarjeta('cables', 'Total de cables', cables.cantidad));
	$('#boton-aniadir-cables').attr("onclick","cargarFormularioVacioCable()"); 
	if (cables.cantidad) {
		crearTablaCables();
		generarPieCables();
	}
}

function getPaginaCables(num) {
	pagina_cables = num;
	crearCables();
}

function generarNavegadorTablaCables(){
	let html = "";

	// Elimina los actuales al cambiar de tabla
	$('.elemento-navegacion-tabla_cables').remove();

	html += `
		<li class="elemento-navegacion-tabla_cables">
			<button onclick="if(pagina_cables>1) getPaginaCables(pagina_cables-1);" class="px-3 py-1 rounded-md rounded-l-lg focus:outline-none focus:shadow-outline-purple" aria-label="Previous">
				<svg class="w-4 h-4 fill-current" aria-hidden="true" viewBox="0 0 20 20">
					<path d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" fill-rule="evenodd"></path>
				</svg>
			</button>
		</li>
	`;

	if(paginaMax_cables > 5){

		if(pagina_cables != 1){
			html += `<li class="elemento-navegacion-tabla_cables"> 
						<button onclick="getPaginaCables(1);" class="px-3 py-1 rounded-md focus:outline-none focus:shadow-outline-purple">
							1 
						</button>
					</li>
					`
		}

		if(pagina_cables >= 3){
			html += `<li class="elemento-navegacion-tabla_cables">
						<span class="px-3 py-1">...</span>
					</li>
					`
		}

		html += `<li class="elemento-navegacion-tabla_cables">
					<button onclick="getPaginaCables(${pagina_cables});" class="px-3 py-1 text-white transition-colors duration-150 bg-purple-600 border border-r-0 border-purple-600 rounded-md focus:outline-none focus:shadow-outline-purple">
						${pagina_cables}
					</button>
				</li>
				`

		if(pagina_cables != paginaMax_cables){
			if(pagina_cables<paginaMax_cables-1){
				html += `<li class="elemento-navegacion-tabla_cables">
							<span class="px-3 py-1">...</span> 
						</li>
						`
			}

			html += `
				<li class="elemento-navegacion-tabla_cables">
					<button onclick="getPaginaCables(${paginaMax_cables});" class="px-3 py-1 rounded-md focus:outline-none focus:shadow-outline-purple">
						${paginaMax_cables}
					</button>
				</li>
			`
		}
	}
	else{

		for (i = 1; i <= paginaMax_cables; i++) {
			html += `
				<li class="elemento-navegacion-tabla_cables">
					<button onclick="getPaginaCables(${i});" 
						${ pagina_cables!=i ? 'class="px-3 py-1 rounded-md focus:outline-none focus:shadow-outline-purple"' : 'class="px-3 py-1 text-white transition-colors duration-150 bg-purple-600 border border-r-0 border-purple-600 rounded-md focus:outline-none focus:shadow-outline-purple"' } >
						${i}
					</button>
				</li>
			`
		}

	}

	html += `
		<li class="elemento-navegacion-tabla_cables">
			<button onclick="if(pagina_cables<paginaMax_cables) getPaginaCables(pagina_cables+1);" class="px-3 py-1 rounded-md rounded-r-lg focus:outline-none focus:shadow-outline-purple" aria-label="Next">
				<svg class="w-4 h-4 fill-current" aria-hidden="true" viewBox="0 0 20 20">
					<path d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" fill-rule="evenodd"></path>
				</svg>
			</button>
		</li>
	`;
	
	$('#navegacion-tablas_cables').html(html);
}

function generarPieCables() {
	$('#pie-tabla_cables').remove();

	$("#main-tabla-cables").append(`
		<div id="pie-tabla_cables" class="grid px-4 py-3 text-xs font-semibold tracking-wide text-gray-500 uppercase border-t dark:border-gray-700 bg-gray-50 sm:grid-cols-9 dark:text-gray-400 dark:bg-gray-800">
			<span id="cantidad-pie_cables" class="flex items-center col-span-3">
				Mostrando ${numElementosActuales_cables} de ${cables.data.length}
			</span>
			<span class="col-span-2"></span>
			<!-- Pagination -->
			<span class="flex col-span-4 mt-2 sm:mt-auto sm:justify-end">
				<nav aria-label="Table navigation">
					<ul id="navegacion-tablas_cables" class="inline-flex items-center">
					</ul>
				</nav>
			</span>
		</div>
	  `);
	  
	  generarNavegadorTablaCables();
}

function eliminarCable(id, posicion){
	$.ajax({
		url: `/api/cable/id/${id}`,
		type: 'DELETE',
		success: function(){
			cables.cantidad--;
			
			if(cables.cantidad%10 == 0 && pagina_cables!=1){
				pagina_cables--;
			}

			cables.data.splice(posicion,1);
			crearCables();
			generarPieCables();

			// Actualiza la tarjeta superior
			$('#elementos-totales-tarjeta-cables').html(cables.data.length);
		},
		error: function(){
			$('#titulo-error').html('Error al eliminar')
			$('#mensaje-error').html('Ha ocurrido un error al eliminar el cable')
			$('.popup').removeClass('hidden');

			setTimeout(() => $('.popup').addClass('hidden'), 3000 )
		}
	});
}

function cargarFormularioCable(id, tipo, version, posicion){

	$('#body-modal').html(`
	
	<p
		class="mb-2 text-lg font-semibold text-gray-700 dark:text-gray-300"
	>
		Editar cable
	</p>
	<!-- Modal description -->
	<div class="text-sm mt-5">
		<label class="block text-sm my-3">
		<span class="text-gray-700 dark:text-gray-400">Tipo</span>
		<input id="editar-tipo"
			class="block w-full mt-1 text-sm dark:border-gray-600 dark:bg-gray-700 focus:border-purple-400 focus:outline-none focus:shadow-outline-purple dark:text-gray-300 dark:focus:shadow-outline-gray form-input"
			placeholder=""
		/>
		</label>

		<label class="block text-sm my-3">
		<span class="text-gray-700 dark:text-gray-400">Versión</span>
		<input id="editar-version"
			class="block w-full mt-1 text-sm dark:border-gray-600 dark:bg-gray-700 focus:border-purple-400 focus:outline-none focus:shadow-outline-purple dark:text-gray-300 dark:focus:shadow-outline-gray form-input"
			placeholder=""
		/>
		</label>
	</div>

	`)

	$('#editar-tipo').val(tipo);
	$('#editar-version').val(version);
	$('#confirmar-modal').attr('onclick', `editarCable(${id}, ${posicion})`);

}

function cargarFormularioVacioCable(){

	$('#body-modal').html(`
	
	<p
		class="mb-2 text-lg font-semibold text-gray-700 dark:text-gray-300"
	>
		Editar cable
	</p>
	<!-- Modal description -->
	<div class="text-sm mt-5">
		<label class="block text-sm my-3">
		<span class="text-gray-700 dark:text-gray-400">Tipo</span>
		<input id="editar-tipo"
			class="block w-full mt-1 text-sm dark:border-gray-600 dark:bg-gray-700 focus:border-purple-400 focus:outline-none focus:shadow-outline-purple dark:text-gray-300 dark:focus:shadow-outline-gray form-input"
			placeholder=""
		/>
		</label>

		<label class="block text-sm my-3">
		<span class="text-gray-700 dark:text-gray-400">Versión</span>
		<input id="editar-version"
			class="block w-full mt-1 text-sm dark:border-gray-600 dark:bg-gray-700 focus:border-purple-400 focus:outline-none focus:shadow-outline-purple dark:text-gray-300 dark:focus:shadow-outline-gray form-input"
			placeholder=""
		/>
		</label>
	</div>

	`)

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
			$(`#cable_tipo-${id}`).html(tipo);
			$(`#cable_version-${id}`).html(version);
			$(`#cable_editar-${id}`).attr('onclick', `cargarFormularioCable('${id}', '${tipo}', '${version}', ${posicion})`);

			cables.data[posicion].tipo = tipo;
			cables.data[posicion].version_tipo = version;
		},
		error: function(){
			$('#titulo-error').html('Error al editar el cable')
			$('#mensaje-error').html('Ha ocurrido un error al editar el cable')
			$('.popup').removeClass('hidden');

			setTimeout(() => $('.popup').addClass('hidden'), 3000 )
		}
	});

}

function crearCable(){

	let tipo 	= $('#editar-tipo').val();
	let version = $('#editar-version').val();
	
	$.ajax({
		url: `/api/recogida/${recogida.id}/cable/${tipo}/${version}`,
		type: 'POST',
		success: function(data){
			let id = data.id;
			cables.cantidad++;

			cables.data.push({
				id: id,
				tipo: tipo,
				version_tipo: version
			})

			$('#elementos-totales-tarjeta-cables').html(cables.cantidad);

			if(!$('#main-tabla-cables').length){
				crearTablaCables();
				generarPieCables();
			}
			else
				crearCables();
		},
		error: function(){
			$('#titulo-error').html('Error al crear el cable')
			$('#mensaje-error').html('Ha ocurrido un error al crear el cable')
			$('.popup').removeClass('hidden');

			setTimeout(() => $('.popup').addClass('hidden'), 3000 );
		}
	});

}

// ----------------------------------------------------------------------------------
// TRANSFORMADORES
// ----------------------------------------------------------------------------------

// Variable de estado para comprobar la página en la que se encuentra
let pagina_transformadores = 1;
let transformadores = null;
let numElementosActuales_transformadores = 0;
let paginaMax_transformadores = 0;

function fila_transformadores(id, voltaje, amperaje, posicion) {
	if (amperaje == null) amperaje = "";
	if (voltaje == null) voltaje = "";

	return `
		<tr id="transformador-${id}" class="transformador text-gray-700 dark:text-gray-400">
			<td class="px-4 py-3">
				<div class="flex items-center text-sm">
					<svg class="relative hidden w-6 h-6 mr-3 md:block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
					<div>
						<p class="font-semibold">${id}</p>
					</div>
				</div>
			</td>
			<td id="transformador_voltaje-${id}" class="px-4 py-3 text-sm">
				${voltaje}
			</td>
			<td id="transformador_amperaje-${id}" class="px-4 py-3 text-xs">
				${amperaje}
			</td>
			<td class="px-4 py-3">
				<div class="flex items-center space-x-4 text-sm">
					<button id="transformador_editar-${id}" @click="openModal" onclick="cargarFormularioTransformador('${id}', '${voltaje}', '${amperaje}', ${posicion})" class="flex items-center justify-between px-2 py-2 text-sm font-medium leading-5 text-purple-600 rounded-lg dark:text-gray-400 focus:outline-none focus:shadow-outline-gray" aria-label="Edit">
						<svg class="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
							<path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"></path>
						</svg>
					</button>
					<button onclick="eliminarTransformador(${id}, ${posicion});" class="flex items-center justify-between px-2 py-2 text-sm font-medium leading-5 text-purple-600 rounded-lg dark:text-gray-400 focus:outline-none focus:shadow-outline-gray" aria-label="Delete">
						<svg class="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
							<path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"></path>
						</svg>
					</button>
				</div>
			</td>
		</tr>
  `;
}


function crearTransformadores() {
	let filas = '';
	let elementos = transformadores.data.slice((pagina_transformadores - 1) * 10, (pagina_transformadores - 1) * 10 + 10);
	paginaMax_transformadores = Math.ceil(transformadores.cantidad/10);

	// Elimina la tabla de transformadores
	$('.transformador').remove();

	for (i = 0; i < elementos.length; i++)
		filas += fila_transformadores(elementos[i].id, elementos[i].voltaje, elementos[i].amperaje, (pagina_transformadores - 1)*10+i );

	$("#body-tabla-transformadores").append(filas);

	// Actualiza el pie de la tabla
	if(numElementosActuales_transformadores){
		numElementosActuales_transformadores = elementos.length;
		$('#cantidad-pie_transformadores').html(`Mostrando ${numElementosActuales_transformadores} de ${transformadores.cantidad}`);
	}
	else
		numElementosActuales_transformadores = elementos.length;

	generarNavegadorTablaTransformadores();
}

function crearTablaTransformadores() {

	$("#transformadores-contenido").append(`
		<div id="main-tabla-transformadores" class="w-full overflow-hidden rounded-lg shadow-xs">

			<div class="w-full overflow-x-auto">
				<table class="w-full whitespace-no-wrap">
					<thead>
						<tr class="text-xs font-semibold tracking-wide text-left text-gray-500 uppercase border-b dark:border-gray-700 bg-gray-50 dark:text-gray-400 dark:bg-gray-800">
							<th class="px-4 py-3">ID</th>
							<th class="px-4 py-3">Voltaje</th>
							<th class="px-4 py-3">Amperaje</th>
							<th class="px-4 py-3">Acciones</th>
						</tr>
					</thead>
					<tbody id="body-tabla-transformadores" class="bg-white divide-y dark:divide-gray-700 dark:bg-gray-800">
					</tbody>
				</table>
			</div>

		</div>
  `);

	crearTransformadores();
}

function crearInterfazTransformadores(data) {
	transformadores = data;
	paginaMax_transformadores = Math.ceil(data.cantidad/10);

	$('#cargando-transformadores').remove();
	$('#main-tarjetas').append(tarjeta('transformadores', 'Total de transformadores', transformadores.cantidad));
	$('#boton-aniadir-transformadores').attr("onclick","cargarFormularioVacioTransformador()"); 
	if (transformadores.cantidad) {
		crearTablaTransformadores();
		generarPieTransformadores();
	}
}

function getPaginaTransformadores(num) {
	pagina_transformadores = num;
	crearTransformadores();
}

function generarNavegadorTablaTransformadores(){
	let html = "";

	// Elimina los actuales al cambiar de tabla
	$('.elemento-navegacion-tabla_transformadores').remove();

	html += `
		<li class="elemento-navegacion-tabla_transformadores">
			<button onclick="if(pagina_transformadores>1) getPaginaTransformadores(pagina_transformadores-1);" class="px-3 py-1 rounded-md rounded-l-lg focus:outline-none focus:shadow-outline-purple" aria-label="Previous">
				<svg class="w-4 h-4 fill-current" aria-hidden="true" viewBox="0 0 20 20">
					<path d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" fill-rule="evenodd"></path>
				</svg>
			</button>
		</li>
	`;

	if(paginaMax_transformadores > 5){

		if(pagina_transformadores != 1){
			html += `<li class="elemento-navegacion-tabla_transformadores"> 
						<button onclick="getPaginaTransformadores(1);" class="px-3 py-1 rounded-md focus:outline-none focus:shadow-outline-purple">
							1 
						</button>
					</li>
					`
		}

		if(pagina_transformadores >= 3){
			html += `<li class="elemento-navegacion-tabla_transformadores">
						<span class="px-3 py-1">...</span>
					</li>
					`
		}

		html += `<li class="elemento-navegacion-tabla_transformadores">
					<button onclick="getPaginaTransformadores(${pagina_transformadores});" class="px-3 py-1 text-white transition-colors duration-150 bg-purple-600 border border-r-0 border-purple-600 rounded-md focus:outline-none focus:shadow-outline-purple">
						${pagina_transformadores}
					</button>
				</li>
				`

		if(pagina_transformadores != paginaMax_transformadores){
			if(pagina_transformadores<paginaMax_transformadores-1){
				html += `<li class="elemento-navegacion-tabla_transformadores">
							<span class="px-3 py-1">...</span> 
						</li>
						`
			}

			html += `
				<li class="elemento-navegacion-tabla_transformadores">
					<button onclick="getPaginaTransformadores(${paginaMax_transformadores});" class="px-3 py-1 rounded-md focus:outline-none focus:shadow-outline-purple">
						${paginaMax_transformadores}
					</button>
				</li>
			`
		}
	}
	else{

		for (i = 1; i <= paginaMax_transformadores; i++) {
			html += `
				<li class="elemento-navegacion-tabla_transformadores">
					<button onclick="getPaginaTransformadores(${i});" 
						${ pagina_transformadores!=i ? 'class="px-3 py-1 rounded-md focus:outline-none focus:shadow-outline-purple"' : 'class="px-3 py-1 text-white transition-colors duration-150 bg-purple-600 border border-r-0 border-purple-600 rounded-md focus:outline-none focus:shadow-outline-purple"' } >
						${i}
					</button>
				</li>
			`
		}

	}

	html += `
		<li class="elemento-navegacion-tabla_transformadores">
			<button onclick="if(pagina_transformadores<paginaMax_transformadores) getPaginaTransformadores(pagina_transformadores+1);" class="px-3 py-1 rounded-md rounded-r-lg focus:outline-none focus:shadow-outline-purple" aria-label="Next">
				<svg class="w-4 h-4 fill-current" aria-hidden="true" viewBox="0 0 20 20">
					<path d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" fill-rule="evenodd"></path>
				</svg>
			</button>
		</li>
	`;
	
	$('#navegacion-tablas_transformadores').html(html);
}

function generarPieTransformadores() {
	$('#pie-tabla_transformadores').remove();

	$("#main-tabla-transformadores").append(`
		<div id="pie-tabla_transformadores" class="grid px-4 py-3 text-xs font-semibold tracking-wide text-gray-500 uppercase border-t dark:border-gray-700 bg-gray-50 sm:grid-cols-9 dark:text-gray-400 dark:bg-gray-800">
			<span id="cantidad-pie_transformadores" class="flex items-center col-span-3">
				Mostrando ${numElementosActuales_transformadores} de ${transformadores.data.length}
			</span>
			<span class="col-span-2"></span>
			<!-- Pagination -->
			<span class="flex col-span-4 mt-2 sm:mt-auto sm:justify-end">
				<nav aria-label="Table navigation">
					<ul id="navegacion-tablas_transformadores" class="inline-flex items-center">
					</ul>
				</nav>
			</span>
		</div>
	  `);
	  
	  generarNavegadorTablaTransformadores();
}

function eliminarTransformador(id, posicion){
	$.ajax({
		url: `/api/transformador/${id}`,
		type: 'DELETE',
		success: function(){
			transformadores.cantidad--;
			
			if(transformadores.cantidad%10 == 0 && pagina_transformadores!=1){
				pagina_transformadores--;
			}

			transformadores.data.splice(posicion,1);
			crearTransformadores();
			generarPieTransformadores();

			// Actualiza la tarjeta superior
			$('#elementos-totales-tarjeta-transformadores').html(transformadores.data.length);
		},
		error: function(){
			$('#titulo-error').html('Error al eliminar')
			$('#mensaje-error').html('Ha ocurrido un error al eliminar el cable')
			$('.popup').removeClass('hidden');

			setTimeout(() => $('.popup').addClass('hidden'), 3000 )
		}
	});
}

function cargarFormularioTransformador(id, voltaje, amperaje, posicion){

	$('#body-modal').html(`
	
	<!-- Modal title -->
	<p
		class="mb-2 text-lg font-semibold text-gray-700 dark:text-gray-300"
	>
		Editar transformador
	</p>
	<!-- Modal description -->
	<div class="text-sm mt-5">
		<label class="block text-sm my-3">
		<span class="text-gray-700 dark:text-gray-400">Voltaje</span>
		<input id="editar-voltaje"
			class="block w-full mt-1 text-sm dark:border-gray-600 dark:bg-gray-700 focus:border-purple-400 focus:outline-none focus:shadow-outline-purple dark:text-gray-300 dark:focus:shadow-outline-gray form-input"
			placeholder=""
		/>
		</label>

		<label class="block text-sm my-3">
		<span class="text-gray-700 dark:text-gray-400">Amperaje</span>
		<input id="editar-amperaje"
			class="block w-full mt-1 text-sm dark:border-gray-600 dark:bg-gray-700 focus:border-purple-400 focus:outline-none focus:shadow-outline-purple dark:text-gray-300 dark:focus:shadow-outline-gray form-input"
			placeholder=""
		/>
		</label>
		<label class="block text-sm my-3">
		<div class="w-full overflow-x-auto">
			<table class="w-full whitespace-no-wrap">
			<thead>
				<tr class="text-xs font-semibold tracking-wide text-left text-gray-500 uppercase border-b dark:border-gray-700 bg-gray-50 dark:text-gray-400 dark:bg-gray-800">
				<th class="px-2 py-3">Corresponde a</th>
				<th class="px-2 py-3"></th>
				</tr>
			</thead>
			<tbody id="body-tabla-caracteristicas" class="bg-white divide-y dark:divide-gray-700 dark:bg-gray-800">
				<td class="px-2 py-3 text-sm">
				<select id="corresponde-tipo" class="block w-full mt-1 text-sm dark:text-gray-300 dark:border-gray-600 dark:bg-gray-700 form-select focus:border-purple-400 focus:outline-none focus:shadow-outline-purple dark:focus:shadow-outline-gray">
					<option>Portátil</option>
					<option>Componente</option>
				</select>
				</td>
				<td class="px-2 py-3 text-sm border-1">
				<input id="corresponde-id"
					class="block w-full mt-1 text-sm dark:border-gray-600 dark:bg-gray-700 focus:border-purple-400 focus:outline-none focus:shadow-outline-purple dark:text-gray-300 dark:focus:shadow-outline-gray form-input"
					placeholder="ID"
				/>  
				</td>
			</tbody>
			</table>
		</div>                  
		</label>
	</div>

	`)

	$('#editar-voltaje').val(voltaje);
	$('#editar-amperaje').val(amperaje);

	if(transformadores.data[posicion].corresponde){
		if(transformadores.data[posicion].corresponde.tipo == "Portatil")
			$('#corresponde-tipo').val("Portátil")
		else
			$('#corresponde-tipo').val("Componente")

		$('#corresponde-id').val(transformadores.data[posicion].corresponde.id)
	}
	else{
		$('#corresponde-id').val("")
	}
	
	$('#confirmar-modal').attr('onclick', `editarTransformador(${id}, ${posicion})`);

}

function cargarFormularioVacioTransformador(){

	$('#body-modal').html(`
	
	<!-- Modal title -->
	<p
		class="mb-2 text-lg font-semibold text-gray-700 dark:text-gray-300"
	>
		Editar transformador
	</p>
	<!-- Modal description -->
	<div class="text-sm mt-5">
		<label class="block text-sm my-3">
		<span class="text-gray-700 dark:text-gray-400">Voltaje</span>
		<input id="editar-voltaje"
			class="block w-full mt-1 text-sm dark:border-gray-600 dark:bg-gray-700 focus:border-purple-400 focus:outline-none focus:shadow-outline-purple dark:text-gray-300 dark:focus:shadow-outline-gray form-input"
			placeholder=""
		/>
		</label>

		<label class="block text-sm my-3">
		<span class="text-gray-700 dark:text-gray-400">Amperaje</span>
		<input id="editar-amperaje"
			class="block w-full mt-1 text-sm dark:border-gray-600 dark:bg-gray-700 focus:border-purple-400 focus:outline-none focus:shadow-outline-purple dark:text-gray-300 dark:focus:shadow-outline-gray form-input"
			placeholder=""
		/>
		</label>
		<label class="block text-sm my-3">
		<div class="w-full overflow-x-auto">
			<table class="w-full whitespace-no-wrap">
			<thead>
				<tr class="text-xs font-semibold tracking-wide text-left text-gray-500 uppercase border-b dark:border-gray-700 bg-gray-50 dark:text-gray-400 dark:bg-gray-800">
				<th class="px-2 py-3">Corresponde a</th>
				<th class="px-2 py-3"></th>
				</tr>
			</thead>
			<tbody id="body-tabla-caracteristicas" class="bg-white divide-y dark:divide-gray-700 dark:bg-gray-800">
				<td class="px-2 py-3 text-sm">
				<select id="corresponde-tipo" class="block w-full mt-1 text-sm dark:text-gray-300 dark:border-gray-600 dark:bg-gray-700 form-select focus:border-purple-400 focus:outline-none focus:shadow-outline-purple dark:focus:shadow-outline-gray">
					<option>Portátil</option>
					<option>Componente</option>
				</select>
				</td>
				<td class="px-2 py-3 text-sm border-1">
				<input id="corresponde-id"
					class="block w-full mt-1 text-sm dark:border-gray-600 dark:bg-gray-700 focus:border-purple-400 focus:outline-none focus:shadow-outline-purple dark:text-gray-300 dark:focus:shadow-outline-gray form-input"
					placeholder="ID"
				/>  
				</td>
			</tbody>
			</table>
		</div>                  
		</label>
	</div>

	`)

	$('#editar-voltaje').val('');
	$('#editar-amperaje').val('');
	$('#confirmar-modal').attr('onclick', `crearTransformador()`);
}

function editarTransformador(id, posicion){

	let voltaje  = $('#editar-voltaje').val();
	let amperaje = $('#editar-amperaje').val();
	let c_tipo 	 = $('#corresponde-tipo').val().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
	let c_id	 = $('#corresponde-id').val();	

	let json = {
		voltaje: voltaje, 
		amperaje: amperaje
	}

	if(c_id){
		json['corresponde'] = {
			tipo: c_tipo,
			id: c_id
		}
	}

	$.ajax({
		url: `/api/transformador/${id}`,
		type: 'PUT',
		data: JSON.stringify(json),
		contentType: "application/json; charset=utf-8",
		success: function(){
			$(`#transformador_voltaje-${id}`).html(voltaje);
			$(`#transformador_amperaje-${id}`).html(amperaje);
			$(`#transformador_editar-${id}`).attr('onclick', `cargarFormularioTransformador('${id}', '${voltaje}', '${amperaje}', ${posicion})`);

			transformadores.data[posicion].voltaje  = voltaje;
			transformadores.data[posicion].amperaje = amperaje;
			transformadores.data[posicion].corresponde = json.corresponde;

			crearTransformadores();
		},
		error: function(){
			$('#titulo-error').html('Error al editar el transformador')
			$('#mensaje-error').html('Ha ocurrido un error al editar el transformador')
			$('.popup').removeClass('hidden');

			setTimeout(() => $('.popup').addClass('hidden'), 3000 )
		}
	});


}

function crearTransformador(){

	let voltaje  = $('#editar-voltaje').val();
	let amperaje = $('#editar-amperaje').val();
	let c_tipo 	 = $('#corresponde-tipo').val().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
	let c_id	 = $('#corresponde-id').val();
	
	let json = {
		voltaje: voltaje, 
		amperaje: amperaje
	}

	if(c_id){
		json['corresponde'] = {
			tipo: c_tipo,
			id: c_id
		}
	}
	
	$.ajax({
		url: `/api/recogida/${recogida.id}/transformador/`,
		type: 'POST',
		data: JSON.stringify(json),
		contentType: "application/json; charset=utf-8",
		dataType: "json",
		success: function(data){
			let id = data.id;
			transformadores.cantidad++;

			let response_json = {
				id: id,
				voltaje: voltaje,
				amperaje: amperaje
			}

			if(json.corresponde)
				response_json.corresponde = json.corresponde;
			else
				response_json.corresponde = null

			transformadores.data.push(response_json);

			$('#elementos-totales-tarjeta-transformadores').html(transformadores.cantidad);

			if(!$('#main-tabla-transformadores').length){
				crearTablaTransformadores();
				generarPieTransformadores();
			}
			else
				crearTransformadores();
		},
		error: function(){
			$('#titulo-error').html('Error al crear el transformador')
			$('#mensaje-error').html('Ha ocurrido un error al crear el transformador')
			$('.popup').removeClass('hidden');

			setTimeout(() => $('.popup').addClass('hidden'), 3000 );
		}
	});

}

// ----------------------------------------------------------------------------------
// COMPONENTES
// ----------------------------------------------------------------------------------

// Variable de estado para comprobar la página en la que se encuentra
let pagina_componentes = 1;
let componentes = null;
let numElementosActuales_componentes = 0;
let paginaMax_componentes = 0;

function fila_componentes(id, estado, fecha, tipo, observaciones, posicion) {
	if (observaciones == null) observaciones = "";
	if (fecha == null) 		   fecha = "";

	return `
		<tr id="componente-${id}" class="componente text-gray-700 dark:text-gray-400">
			<td class="px-4 py-3">
				<div class="flex items-center text-sm">
					<svg class="relative hidden w-6 h-6 mr-3 md:block" aria-hidden="true" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" stroke="currentColor" ><path d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" ></path></svg>
					<div>
						<p class="font-semibold">${id}</p>
					</div>
				</div>
			</td>
			<td id="componente_tipo-${id}" class="px-4 py-3 text-sm">
				${tipo}
			</td>
			<td id="componente_estado-${id}" class="px-4 py-3 text-sm">
				${obtenerEstadoFormateado(estado)}
			</td>
			<td id="componente_fecha-${id}" class="px-4 py-3 text-sm">
				${fecha.split('T')[0]}
			</td>
			<td id="componente_observaciones-${id}" class="px-4 py-3 text-xs">
				${observaciones}
			</td>
			<td class="px-4 py-3">
				<div class="flex items-center space-x-4 text-sm">
					<button id="componente_editar-${id}" @click="openModal" onclick="cargarFormularioComponente('${id}', '${tipo}', '${estado}', '${fecha.split('T')[0]}', '${observaciones}', '${posicion}' )" class="flex items-center justify-between px-2 py-2 text-sm font-medium leading-5 text-purple-600 rounded-lg dark:text-gray-400 focus:outline-none focus:shadow-outline-gray" aria-label="Edit">
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


function crearComponentes() {
	let filas = '';
	let elementos = componentes.data.slice((componentes - 1) * 10, (pagina_componentes - 1) * 10 + 10);
	paginaMax_componentes = Math.ceil(componentes.cantidad/10);

	// Elimina la tabla de componentes
	$('.componente').remove();

	for (i = 0; i < elementos.length; i++)
		filas += fila_componentes(elementos[i].id, elementos[i].estado, elementos[i].fecha_entrada, elementos[i].tipo, elementos[i].observaciones, (pagina_componentes - 1)*10+i );

	$("#body-tabla-componentes").append(filas);

	// Actualiza el pie de la tabla
	if(numElementosActuales_componentes){
		numElementosActuales_componentes = elementos.length;
		$('#cantidad-pie_componentes').html(`Mostrando ${numElementosActuales_componentes} de ${componentes.cantidad}`);
	}
	else
		numElementosActuales_componentes = elementos.length;

	generarNavegadorTablaComponentes();
}

function crearTablaComponentes() {

	$("#componentes-contenido").append(`
		<div id="main-tabla-componentes" class="w-full overflow-hidden rounded-lg shadow-xs">

			<div class="w-full overflow-x-auto">
				<table class="w-full whitespace-no-wrap">
					<thead>
						<tr class="text-xs font-semibold tracking-wide text-left text-gray-500 uppercase border-b dark:border-gray-700 bg-gray-50 dark:text-gray-400 dark:bg-gray-800">
							<th class="px-4 py-3">ID</th>
							<th class="px-4 py-3">Tipo</th>
							<th class="px-4 py-3">Estado</th>
							<th class="px-4 py-3">Fecha</th>
							<th class="px-4 py-3">Observaciones</th>
							<th class="px-4 py-3">Acciones</th>
						</tr>
					</thead>
					<tbody id="body-tabla-componentes" class="bg-white divide-y dark:divide-gray-700 dark:bg-gray-800">
					</tbody>
				</table>
			</div>

		</div>
  `);

	crearComponentes();
}

function crearInterfazComponentes(data) {
	componentes = data;
	paginaMax_componentes = Math.ceil(data.cantidad/10);

	$('#cargando-componentes').remove();
	$('#main-tarjetas').append(tarjeta('componentes', 'Total de componentes', componentes.cantidad));
	$('#boton-aniadir-componentes').attr("onclick","cargarFormularioVacioComponentes()"); 
	if (componentes.cantidad) {
		crearTablaComponentes();
		generarPieComponentes();
	}
}

function getPaginaComponentes(num) {
	pagina_componentes = num;
	crearComponentes();
}

function generarNavegadorTablaComponentes(){
	let html = "";

	// Elimina los actuales al cambiar de tabla
	$('.elemento-navegacion-tabla_componentes').remove();

	html += `
		<li class="elemento-navegacion-tabla_componentes">
			<button onclick="if(pagina_componentes>1) getPaginaComponentes(pagina_componentes-1);" class="px-3 py-1 rounded-md rounded-l-lg focus:outline-none focus:shadow-outline-purple" aria-label="Previous">
				<svg class="w-4 h-4 fill-current" aria-hidden="true" viewBox="0 0 20 20">
					<path d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" fill-rule="evenodd"></path>
				</svg>
			</button>
		</li>
	`;

	if(paginaMax_componentes > 5){

		if(pagina_componentes != 1){
			html += `<li class="elemento-navegacion-tabla_componentes"> 
						<button onclick="getPaginaComponentes(1);" class="px-3 py-1 rounded-md focus:outline-none focus:shadow-outline-purple">
							1 
						</button>
					</li>
					`
		}

		if(pagina_componentes >= 3){
			html += `<li class="elemento-navegacion-tabla_componentes">
						<span class="px-3 py-1">...</span>
					</li>
					`
		}

		html += `<li class="elemento-navegacion-tabla_componentes">
					<button onclick="getPaginaComponentes(${pagina_componentes});" class="px-3 py-1 text-white transition-colors duration-150 bg-purple-600 border border-r-0 border-purple-600 rounded-md focus:outline-none focus:shadow-outline-purple">
						${pagina_componentes}
					</button>
				</li>
				`

		if(pagina_componentes != paginaMax_componentes){
			if(pagina_componentes<paginaMax_componentes-1){
				html += `<li class="elemento-navegacion-tabla_componentes">
							<span class="px-3 py-1">...</span> 
						</li>
						`
			}

			html += `
				<li class="elemento-navegacion-tabla_componentes">
					<button onclick="getPaginaComponentes(${paginaMax_componentes});" class="px-3 py-1 rounded-md focus:outline-none focus:shadow-outline-purple">
						${paginaMax_componentes}
					</button>
				</li>
			`
		}
	}
	else{

		for (i = 1; i <= paginaMax_componentes; i++) {
			html += `
				<li class="elemento-navegacion-tabla_componentes">
					<button onclick="getPaginaComponentes(${i});" 
						${ pagina_componentes!=i ? 'class="px-3 py-1 rounded-md focus:outline-none focus:shadow-outline-purple"' : 'class="px-3 py-1 text-white transition-colors duration-150 bg-purple-600 border border-r-0 border-purple-600 rounded-md focus:outline-none focus:shadow-outline-purple"' } >
						${i}
					</button>
				</li>
			`
		}

	}

	html += `
		<li class="elemento-navegacion-tabla_componentes">
			<button onclick="if(pagina_componentes<paginaMax_componentes) getPaginaComponentes(pagina_componentes+1);" class="px-3 py-1 rounded-md rounded-r-lg focus:outline-none focus:shadow-outline-purple" aria-label="Next">
				<svg class="w-4 h-4 fill-current" aria-hidden="true" viewBox="0 0 20 20">
					<path d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" fill-rule="evenodd"></path>
				</svg>
			</button>
		</li>
	`;
	
	$('#navegacion-tablas_componentes').html(html);
}

function generarPieComponentes() {
	$('#pie-tabla_componentes').remove();

	$("#main-tabla-componentes").append(`
		<div id="pie-tabla_componentes" class="grid px-4 py-3 text-xs font-semibold tracking-wide text-gray-500 uppercase border-t dark:border-gray-700 bg-gray-50 sm:grid-cols-9 dark:text-gray-400 dark:bg-gray-800">
			<span id="cantidad-pie_componentes" class="flex items-center col-span-3">
				Mostrando ${numElementosActuales_componentes} de ${componentes.data.length}
			</span>
			<span class="col-span-2"></span>
			<!-- Pagination -->
			<span class="flex col-span-4 mt-2 sm:mt-auto sm:justify-end">
				<nav aria-label="Table navigation">
					<ul id="navegacion-tablas_componentes" class="inline-flex items-center">
					</ul>
				</nav>
			</span>
		</div>
	  `);
	  
	  generarNavegadorTablaComponentes();
}

function eliminarComponente(id, posicion){
	$.ajax({
		url: `/api/componente/${id}`,
		type: 'DELETE',
		success: function(){
			componentes.cantidad--;

			if(componentes.cantidad%10 == 0 && pagina!=1){
				pagina_componentes--;
			}

			componentes.data.splice(posicion,1);
			crearComponentes();
			generarPieComponentes();

			// Actualiza la tarjeta superior
			$('#elementos-totales-tarjeta-componentes').html(componentes.data.length);
		},
		error: function(){
			$('#titulo-error').html('Error al eliminar componentes')
			$('#mensaje-error').html('Ha habido un error al eliminar la componentes')
			$('.popup').removeClass('hidden');

			setTimeout(() => $('.popup').addClass('hidden'), 3000 )
		}
	});
}

function cargarFormularioComponente(id, tipo, estado, fecha, observaciones, posicion){

	$('#body-modal').html(`
	
	<!-- Modal title -->
	<p
		class="mb-2 text-lg font-semibold text-gray-700 dark:text-gray-300"
	>
		Editar componente
	</p>
	<!-- Modal description -->
	<div class="text-sm mt-5">
		<label class="block text-sm my-3">
		<span class="text-gray-700 dark:text-gray-400">Tipo</span>
		<input id="editar-tipo"
			class="block w-full mt-1 text-sm dark:border-gray-600 dark:bg-gray-700 focus:border-purple-400 focus:outline-none focus:shadow-outline-purple dark:text-gray-300 dark:focus:shadow-outline-gray form-input"
			placeholder=""
		/>
		</label>

		<label class="block text-sm my-3">
		<span class="text-gray-700 dark:text-gray-400">Estado</span>
		<select id="editar-estado"
			class="block w-full mt-1 text-sm dark:text-gray-300 dark:border-gray-600 dark:bg-gray-700 form-select focus:border-purple-400 focus:outline-none focus:shadow-outline-purple dark:focus:shadow-outline-gray"
		>
			<option>Desconocido</option>
			<option>Bueno</option>
			<option>Regular</option>
			<option>Por revisar</option>
			<option>No aprovechable</option>
			<option>Roto</option>
		</select>
		</label>

		<label class="block text-sm my-3">
		<span class="text-gray-700 dark:text-gray-400">Fecha</span>
		<input id="editar-fecha"
			class="block w-full mt-1 text-sm dark:border-gray-600 dark:bg-gray-700 focus:border-purple-400 focus:outline-none focus:shadow-outline-purple dark:text-gray-300 dark:focus:shadow-outline-gray form-input"
			placeholder="Formato: 2000-01-31"
		/>
		</label>

		<label class="block text-sm my-3">
		<span class="text-gray-700 dark:text-gray-400">Observaciones</span>
		<input id="editar-observaciones"
			class="block w-full mt-1 text-sm dark:border-gray-600 dark:bg-gray-700 focus:border-purple-400 focus:outline-none focus:shadow-outline-purple dark:text-gray-300 dark:focus:shadow-outline-gray form-input"
			placeholder=""
		/>
		</label>
	</div>

	`)

	$('#editar-tipo').val(tipo);
	$(`#editar-estado`).val(estado);
	$('#editar-fecha').val(fecha);
	$('#editar-observaciones').val(observaciones);
	$('#confirmar-modal').attr('onclick', `editarComponente(${id}, ${posicion})`);

}

function cargarFormularioVacioComponentes(){

	$('#body-modal').html(`
	
	<!-- Modal title -->
	<p
		class="mb-2 text-lg font-semibold text-gray-700 dark:text-gray-300"
	>
		Editar componente
	</p>
	<!-- Modal description -->
	<div class="text-sm mt-5">
		<label class="block text-sm my-3">
		<span class="text-gray-700 dark:text-gray-400">Tipo</span>
		<input id="editar-tipo"
			class="block w-full mt-1 text-sm dark:border-gray-600 dark:bg-gray-700 focus:border-purple-400 focus:outline-none focus:shadow-outline-purple dark:text-gray-300 dark:focus:shadow-outline-gray form-input"
			placeholder=""
		/>
		</label>

		<label class="block text-sm my-3">
		<span class="text-gray-700 dark:text-gray-400">Estado</span>
		<select id="editar-estado"
			class="block w-full mt-1 text-sm dark:text-gray-300 dark:border-gray-600 dark:bg-gray-700 form-select focus:border-purple-400 focus:outline-none focus:shadow-outline-purple dark:focus:shadow-outline-gray"
		>
			<option>Desconocido</option>
			<option>Bueno</option>
			<option>Regular</option>
			<option>Por revisar</option>
			<option>No aprovechable</option>
			<option>Roto</option>
		</select>
		</label>

		<label class="block text-sm my-3">
		<span class="text-gray-700 dark:text-gray-400">Fecha</span>
		<input id="editar-fecha"
			class="block w-full mt-1 text-sm dark:border-gray-600 dark:bg-gray-700 focus:border-purple-400 focus:outline-none focus:shadow-outline-purple dark:text-gray-300 dark:focus:shadow-outline-gray form-input"
			placeholder="Formato: 2000-01-31"
		/>
		</label>

		<label class="block text-sm my-3">
		<span class="text-gray-700 dark:text-gray-400">Observaciones</span>
		<input id="editar-observaciones"
			class="block w-full mt-1 text-sm dark:border-gray-600 dark:bg-gray-700 focus:border-purple-400 focus:outline-none focus:shadow-outline-purple dark:text-gray-300 dark:focus:shadow-outline-gray form-input"
			placeholder=""
		/>
		</label>
	</div>

	`)

	$('#editar-tipo').val("");
	$(`#editar-estado`).val("Desconocido");
	$('#editar-fecha').val("");
	$('#editar-observaciones').val("");
	$('#confirmar-modal').attr('onclick', `crearComponente()`);
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
			$(`#componente_tipo-${id}`).html(tipo);
			$(`#componente_estado-${id}`).html(obtenerEstadoFormateado(estado));
			$(`#componente_fecha-${id}`).html(fecha);
			$(`#componente_observaciones-${id}`).html(observaciones);
			$(`#componente_editar-${id}`).attr('onclick', `cargarFormulario('${id}', '${tipo}', '${estado}', '${fecha}', '${observaciones}', ${posicion})`);

			componentes.data[posicion].estado = estado;
			componentes.data[posicion].observaciones = observaciones;
			componentes.data[posicion].fecha_entrada = fecha;
			componentes.data[posicion].tipo = tipo;
		},
		error: function(){
			$('#titulo-error').html('Error al editar la componente')
			$('#mensaje-error').html('Ha habido un error al editar la componente')
			$('.popup').removeClass('hidden');

			setTimeout(() => $('.popup').addClass('hidden'), 3000 )
		}
	});

}

function crearComponente(){
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
		url: `/api/recogida/${recogida.id}/componente/`,
		data: JSON.stringify(json),
		contentType: "application/json; charset=utf-8",
		dataType: "json",
		type: 'POST',
		success: function(data){

			let id = data.id;
			componentes.cantidad++;

			componentes.data.push({
				id: id,
				tipo: tipo, 
				estado: estado,
				fecha_entrada: fecha,
				observaciones: observaciones
			})

			$('#elementos-totales-tarjeta-componentes').html(componentes.cantidad);
			if(!$('#main-tabla-componentes').length){
				crearTablaComponentes();
				generarPieComponentes();
			}
			else
				crearComponentes();
		},
		error: function(){
			$('#titulo-error').html('Error al crear la componente')
			$('#mensaje-error').html('Ha habido un error al crear la componente')
			$('.popup').removeClass('hidden');

			setTimeout(() => $('.popup').addClass('hidden'), 3000 )
		}
	});
}


// ----------------------------------------------------------------------------------
// ORDENADORES
// ----------------------------------------------------------------------------------

// Variable de estado para comprobar la página en la que se encuentra
let pagina_ordenadores = 1;
let ordenadores = null;
let numElementosActuales_ordenadores = 0;
let paginaMax_ordenadores = 0;

function tarjetaOrdenador() {
	return `
    <div class="flex items-center p-4 bg-white rounded-lg shadow-xs dark:bg-gray-800">
			<div class="p-3 mr-4 text-orange-500 bg-orange-100 rounded-full dark:text-orange-100 dark:bg-orange-500">
				<svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
				</svg>
			</div>
			<div>
				<p class="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
				Total de ordenadores
				</p>
				<p id="elementos-totales-tarjeta-ordenadores" class="text-lg font-semibold text-gray-700 dark:text-gray-200">
				${ordenadores.cantidad}
				</p>
			</div>
    </div>
	<div id="boton-aniadir-ordenadores-portatiles" class="flex items-center p-4 bg-white rounded-lg shadow-xs dark:bg-gray-800 cursor-pointer" onclick="cargarFormularioVacioOrdenadores('Portátil')" @click="openModal">
			<div class="p-3 mr-4 text-orange-500 bg-orange-100 rounded-full dark:text-orange-100 dark:bg-orange-500">
				<svg class="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
				</svg>
			</div>
			<div>
				<p class="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
				Añadir Portátil
				</p>
			</div>
    </div>
	<div id="boton-aniadir-ordenadores-sobremesas" class="flex items-center p-4 bg-white rounded-lg shadow-xs dark:bg-gray-800 cursor-pointer" onclick="cargarFormularioVacioOrdenadores('Sobremesa')" @click="openModal">
			<div class="p-3 mr-4 text-orange-500 bg-orange-100 rounded-full dark:text-orange-100 dark:bg-orange-500">
				<svg class="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
				</svg>
			</div>
			<div>
				<p class="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
				Añadir sobremesa
				</p>
			</div>
    </div>
    `
}

function fila_ordenadores(id, tipo, localizacion, observaciones, otro, posicion) {
	if (observaciones == null) observaciones = "";
	if (localizacion  == null) localizacion = "";

	return `
		<tr id="ordenador-${id}" class="ordenador text-gray-700 dark:text-gray-400">
			<td class="cursor-pointer px-4 py-3" onclick="window.location.href='ordenador?id=${id}'">
				<div class="flex items-center text-sm">
					<svg class="relative hidden w-6 h-6 mr-3 md:block" aria-hidden="true" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" stroke="currentColor" >
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
					</svg>
					<div>
						<p class="font-semibold">${id}</p>
					</div>
				</div>
			</td>
			<td id="ordenador_tipo-${id}" class="cursor-pointer px-4 py-3 text-sm" onclick="window.location.href='ordenador?id=${id}'">
				${tipo}
			</td>
			<td id="ordenador_localizacion-${id}" class="cursor-pointer px-4 py-3 text-sm" onclick="window.location.href='ordenador?id=${id}'">
				${localizacion}
			</td>
			<td id="ordenador_observaciones-${id}" class="cursor-pointer px-4 py-3 text-sm" onclick="window.location.href='ordenador?id=${id}'">
				${observaciones}
			</td>
			<td class="px-4 py-3">
				<div class="flex items-center space-x-4 text-sm">
					<button id="ordenador_editar-${id}" @click="openModal" onclick="cargarFormularioOrdenador('${id}', '${tipo}', '${localizacion}', '${observaciones}', '${otro}', '${posicion}' )" class="flex items-center justify-between px-2 py-2 text-sm font-medium leading-5 text-purple-600 rounded-lg dark:text-gray-400 focus:outline-none focus:shadow-outline-gray" aria-label="Edit">
						<svg class="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
							<path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"></path>
						</svg>
					</button>
					<button onclick="eliminarOrdenador(${id}, ${posicion});" class="flex items-center justify-between px-2 py-2 text-sm font-medium leading-5 text-purple-600 rounded-lg dark:text-gray-400 focus:outline-none focus:shadow-outline-gray" aria-label="Delete">
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
	let elementos = ordenadores.data.slice((ordenadores - 1) * 10, (pagina_ordenadores - 1) * 10 + 10);
	paginaMax_ordenadores = Math.ceil(ordenadores.cantidad/10);

	// Elimina la tabla de ordenadores
	$('.ordenador').remove();

	for (i = 0; i < elementos.length; i++){
		if(elementos[i].tipo == "Portatil")
			filas += fila_ordenadores(elementos[i].id, elementos[i].tipo, elementos[i].localizacion_taller, elementos[i].observaciones, elementos[i].estado, (pagina_ordenadores - 1)*10+i );
		else
			filas += fila_ordenadores(elementos[i].id, elementos[i].tipo, elementos[i].localizacion_taller, elementos[i].observaciones, elementos[i].tamano, (pagina_ordenadores - 1)*10+i );
	}

	$("#body-tabla-ordenadores").append(filas);

	// Actualiza el pie de la tabla
	if(numElementosActuales_ordenadores){
		numElementosActuales_ordenadores = elementos.length;
		$('#cantidad-pie_ordenadores').html(`Mostrando ${numElementosActuales_ordenadores} de ${ordenadores.cantidad}`);
	}
	else
		numElementosActuales_ordenadores = elementos.length;

	generarNavegadorTablaOrdenadores();
}

function crearTablaOrdenadores() {

	$("#ordenadores-contenido").append(`
		<div id="main-tabla-ordenadores" class="w-full overflow-hidden rounded-lg shadow-xs">

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
					<tbody id="body-tabla-ordenadores" class="bg-white divide-y dark:divide-gray-700 dark:bg-gray-800">
					</tbody>
				</table>
			</div>

		</div>
  `);

	crearOrdenadores();
}

function crearInterfazOrdenadores(data) {
	ordenadores = data;
	paginaMax_ordenadores = Math.ceil(data.cantidad/10);

	$('#cargando-ordenadores').remove();
	$('#main-tarjetas').append(tarjetaOrdenador());
	// $('#boton-aniadir-ordenadores-portatiles').attr("onclick","cargarFormularioVacioOrdenadores('Portatil')"); 
	// $('#boton-aniadir-ordenadores-sobremesas').attr("onclick","cargarFormularioVacioOrdenadores('Sobremesa')"); 
	if (ordenadores.cantidad) {
		crearTablaOrdenadores();
		generarPieOrdenadores();
	}
}

function getPaginaOrdenadores(num) {
	pagina_ordenadores = num;
	crearOrdenadores();
}

function generarNavegadorTablaOrdenadores(){
	let html = "";

	// Elimina los actuales al cambiar de tabla
	$('.elemento-navegacion-tabla_ordenadores').remove();

	html += `
		<li class="elemento-navegacion-tabla_ordenadores">
			<button onclick="if(pagina_ordenadores>1) getPaginaOrdenadores(pagina_ordenadores-1);" class="px-3 py-1 rounded-md rounded-l-lg focus:outline-none focus:shadow-outline-purple" aria-label="Previous">
				<svg class="w-4 h-4 fill-current" aria-hidden="true" viewBox="0 0 20 20">
					<path d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" fill-rule="evenodd"></path>
				</svg>
			</button>
		</li>
	`;

	if(paginaMax_ordenadores > 5){

		if(pagina_ordenadores != 1){
			html += `<li class="elemento-navegacion-tabla_ordenadores"> 
						<button onclick="getPaginaOrdenadores(1);" class="px-3 py-1 rounded-md focus:outline-none focus:shadow-outline-purple">
							1 
						</button>
					</li>
					`
		}

		if(pagina_ordenadores >= 3){
			html += `<li class="elemento-navegacion-tabla_ordenadores">
						<span class="px-3 py-1">...</span>
					</li>
					`
		}

		html += `<li class="elemento-navegacion-tabla_ordenadores">
					<button onclick="getPaginaOrdenadores(${pagina_ordenadores});" class="px-3 py-1 text-white transition-colors duration-150 bg-purple-600 border border-r-0 border-purple-600 rounded-md focus:outline-none focus:shadow-outline-purple">
						${pagina_ordenadores}
					</button>
				</li>
				`

		if(pagina_ordenadores != paginaMax_ordenadores){
			if(pagina_ordenadores<paginaMax_ordenadores-1){
				html += `<li class="elemento-navegacion-tabla_ordenadores">
							<span class="px-3 py-1">...</span> 
						</li>
						`
			}

			html += `
				<li class="elemento-navegacion-tabla_ordenadores">
					<button onclick="getPaginaOrdenadores(${paginaMax_ordenadores});" class="px-3 py-1 rounded-md focus:outline-none focus:shadow-outline-purple">
						${paginaMax_ordenadores}
					</button>
				</li>
			`
		}
	}
	else{

		for (i = 1; i <= paginaMax_ordenadores; i++) {
			html += `
				<li class="elemento-navegacion-tabla_ordenadores">
					<button onclick="getPaginaOrdenadores(${i});" 
						${ pagina_ordenadores!=i ? 'class="px-3 py-1 rounded-md focus:outline-none focus:shadow-outline-purple"' : 'class="px-3 py-1 text-white transition-colors duration-150 bg-purple-600 border border-r-0 border-purple-600 rounded-md focus:outline-none focus:shadow-outline-purple"' } >
						${i}
					</button>
				</li>
			`
		}

	}

	html += `
		<li class="elemento-navegacion-tabla_ordenadores">
			<button onclick="if(pagina_ordenadores<paginaMax_ordenadores) getPaginaOrdenadores(pagina_ordenadores+1);" class="px-3 py-1 rounded-md rounded-r-lg focus:outline-none focus:shadow-outline-purple" aria-label="Next">
				<svg class="w-4 h-4 fill-current" aria-hidden="true" viewBox="0 0 20 20">
					<path d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" fill-rule="evenodd"></path>
				</svg>
			</button>
		</li>
	`;
	
	$('#navegacion-tablas_ordenadores').html(html);
}

function generarPieOrdenadores() {
	$('#pie-tabla_ordenadores').remove();

	$("#main-tabla-ordenadores").append(`
		<div id="pie-tabla_ordenadores" class="grid px-4 py-3 text-xs font-semibold tracking-wide text-gray-500 uppercase border-t dark:border-gray-700 bg-gray-50 sm:grid-cols-9 dark:text-gray-400 dark:bg-gray-800">
			<span id="cantidad-pie_ordenadores" class="flex items-center col-span-3">
				Mostrando ${numElementosActuales_ordenadores} de ${ordenadores.data.length}
			</span>
			<span class="col-span-2"></span>
			<!-- Pagination -->
			<span class="flex col-span-4 mt-2 sm:mt-auto sm:justify-end">
				<nav aria-label="Table navigation">
					<ul id="navegacion-tablas_ordenadores" class="inline-flex items-center">
					</ul>
				</nav>
			</span>
		</div>
	  `);
	  
	  generarNavegadorTablaOrdenadores();
}

function eliminarOrdenador(id, posicion){
	$.ajax({
		url: `/api/ordenador/${id}`,
		type: 'DELETE',
		success: function(){

			ordenadores.cantidad--;

			if(ordenadores.cantidad%10 == 0 && pagina_ordenadores!=1){
				pagina_ordenadores--;
			}

			ordenadores.data.splice(posicion,1);
			crearOrdenadores();
			generarPieOrdenadores();

			// Actualiza la tarjeta superior
			$('#elementos-totales-tarjeta-ordenadores').html(ordenadores.data.length);
		},
		error: function(){
			$('#titulo-error').html('Error al eliminar el ordenador')
			$('#mensaje-error').html('Ha habido un error al eliminar el ordenador')
			$('.popup').removeClass('hidden');

			setTimeout(() => $('.popup').addClass('hidden'), 3000 )
		}
	});
}

function cargarFormularioOrdenador(id, tipo, localizacion, observaciones, otro, posicion){

	$('#body-modal').html(`
	
	 <!-- Modal title -->
	<p
		class="mb-2 text-lg font-semibold text-gray-700 dark:text-gray-300"
	>
		Editar ordenador
	</p>
	<!-- Modal description -->
		<label class="block text-sm my-3">
		<span class="text-gray-700 dark:text-gray-400">Localizacion</span>
		<input id="editar-localizacion"
			class="block w-full mt-1 text-sm dark:border-gray-600 dark:bg-gray-700 focus:border-purple-400 focus:outline-none focus:shadow-outline-purple dark:text-gray-300 dark:focus:shadow-outline-gray form-input"
			placeholder=""
		/>
		</label>

		<label class="block text-sm my-3">
		<span class="text-gray-700 dark:text-gray-400">Observaciones</span>
		<input id="editar-observaciones"
			class="block w-full mt-1 text-sm dark:border-gray-600 dark:bg-gray-700 focus:border-purple-400 focus:outline-none focus:shadow-outline-purple dark:text-gray-300 dark:focus:shadow-outline-gray form-input"
			placeholder=""
		/>
		</label>

		<label id="estado-o-tamano" class="block text-sm my-3">
		</label>

	`)


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
			<select id="editar-estado-o-tamano"
				class="block w-full mt-1 text-sm dark:text-gray-300 dark:border-gray-600 dark:bg-gray-700 form-select focus:border-purple-400 focus:outline-none focus:shadow-outline-purple dark:focus:shadow-outline-gray"
			>
				<option>Desconocido</option>
				<option>Bueno</option>
				<option>Regular</option>
				<option>Por revisar</option>
				<option>No aprovechable</option>
				<option>Roto</option>
			</select>
		`);
		$('#editar-estado-o-tamano').val(otro);
	}

	$('#confirmar-modal').attr('onclick', `editarOrdenador(${id}, '${tipo}', ${posicion})`);

}

function cargarFormularioVacioOrdenadores(tipo){

	$('#body-modal').html(`
	
		<!-- Modal title -->
		<p
			class="mb-2 text-lg font-semibold text-gray-700 dark:text-gray-300"
		>
			Editar ordenador
		</p>
		<!-- Modal description -->
		<label class="block text-sm my-3">
		<span class="text-gray-700 dark:text-gray-400">Localizacion</span>
		<input id="editar-localizacion"
			class="block w-full mt-1 text-sm dark:border-gray-600 dark:bg-gray-700 focus:border-purple-400 focus:outline-none focus:shadow-outline-purple dark:text-gray-300 dark:focus:shadow-outline-gray form-input"
			placeholder=""
		/>
		</label>

		<label class="block text-sm my-3">
		<span class="text-gray-700 dark:text-gray-400">Observaciones</span>
		<input id="editar-observaciones"
			class="block w-full mt-1 text-sm dark:border-gray-600 dark:bg-gray-700 focus:border-purple-400 focus:outline-none focus:shadow-outline-purple dark:text-gray-300 dark:focus:shadow-outline-gray form-input"
			placeholder=""
		/>
		</label>

		<label id="estado-o-tamano" class="block text-sm my-3">
		</label>

	`)

	$('#editar-localizacion').val('');
	$('#editar-observaciones').val('');
	
	if(tipo == "Sobremesa"){
		$('#estado-o-tamano').html(`
			<span class="text-gray-700 dark:text-gray-400">Tamaño</span>
			<input id="editar-estado-o-tamano"
				class="block w-full mt-1 text-sm dark:border-gray-600 dark:bg-gray-700 focus:border-purple-400 focus:outline-none focus:shadow-outline-purple dark:text-gray-300 dark:focus:shadow-outline-gray form-input"
				placeholder="" value=""
			/>
		`);
	}
	else{
		$('#estado-o-tamano').html(`
			<span class="text-gray-700 dark:text-gray-400">Estado</span>
			<select id="editar-estado-o-tamano"
				class="block w-full mt-1 text-sm dark:text-gray-300 dark:border-gray-600 dark:bg-gray-700 form-select focus:border-purple-400 focus:outline-none focus:shadow-outline-purple dark:focus:shadow-outline-gray"
			>
				<option>Desconocido</option>
				<option>Bueno</option>
				<option>Regular</option>
				<option>Por revisar</option>
				<option>No aprovechable</option>
				<option>Roto</option>
			</select>
		`);
		$('#editar-estado-o-tamano').val('');
	}

	// cargarCaracteristicas(id, posicion);
	$('#confirmar-modal').attr('onclick', `crearOrdenador('${tipo}')`);
}


function editarOrdenador(id, tipo, posicion){

	const localizacion  = $('#editar-localizacion').val();
	const observaciones = $('#editar-observaciones').val();
	const otro 			= $('#editar-estado-o-tamano').val();
	
	const json = {
		"localizacion_taller": localizacion,
		"observaciones": observaciones,
	};

	if(tipo == "Portatil")
		json["estado"] = otro;
	else if(tipo == "Sobremesa")
		json["tamano"] = otro;

	$.ajax({
		url: `/api/ordenador/${id}`,
		data: JSON.stringify(json),
		contentType: "application/json; charset=utf-8",
		dataType: "json",
		type: 'PUT',
		success: function(){
			$(`#ordenador_localizacion-${id}`).html(localizacion);
			$(`#ordenador_observaciones-${id}`).html(observaciones);
			$(`#ordenador_editar-${id}`).attr('onclick', `cargarFormulario(${id}, '${tipo}', '${localizacion}', '${observaciones}', '${otro}', ${posicion})`);

			if(tipo == "Portatil")
				ordenadores.data[posicion].estado = otro;
			else if(tipo == "Sobremesa")
				ordenadores.data[posicion].tamano = otro;
			
			ordenadores.data[posicion].observaciones = observaciones;
			ordenadores.data[posicion].localizacion_taller = localizacion;
		},
		error: function(){
			$('#titulo-error').html('Error al modificar el ordenador')
			$('#mensaje-error').html('Ha habido un error al editar el ordenador')
			$('.popup').removeClass('hidden');

			setTimeout(() => $('.popup').addClass('hidden'), 3000 )
		}
	});


}

function crearOrdenador(tipo){
	const localizacion  = $('#editar-localizacion').val();
	const observaciones = $('#editar-observaciones').val();
	const otro 			= $('#editar-estado-o-tamano').val();
	
	const json = {
		"localizacion_taller": localizacion,
		"observaciones": observaciones
	};

	if(tipo == "Portátil"){
		json["estado"] = otro;
		var query = 'portatil';
	}
	else if(tipo == "Sobremesa"){
		json["tamano"] = otro;
		var query = 'sobremesa';
	}

	$.ajax({
		url: `/api/recogida/${recogida.id}/${query}/`,
		data: JSON.stringify(json),
		contentType: "application/json; charset=utf-8",
		dataType: "json",
		type: 'POST',
		success: function(data){
			ordenadores.cantidad++;

			let json = {
				id: data.id,
				localizacion_taller: localizacion,
				observaciones: observaciones, 
				tipo: tipo
			};

			if(tipo == "Portátil"){
				json["estado"] = otro;
				json["tamano"] = null;
			}
			else if(tipo == "Sobremesa"){
				json["estado"] = null;
				json["tamano"] = otro;
			}

			ordenadores.data.push(json)

			$('#elementos-totales-tarjeta-ordenadores').html(ordenadores.cantidad);
			if(!$('#main-tabla-ordenadores').length){
				crearTablaOrdenadores();
				generarPieOrdenadores();
			}
			else
				crearOrdenadores();
		},
		error: function(){
			$('#titulo-error').html('Error al crear el ordenador')
			$('#mensaje-error').html('Ha habido un error al crear el ordenador')
			$('.popup').removeClass('hidden');

			setTimeout(() => $('.popup').addClass('hidden'), 3000 )
		}
	});
}

// ----------------------------------------------------------------------------------
// EXPORTACIÓN DE DATOS
// ----------------------------------------------------------------------------------

function descargarArchivoDatos(){

	const texto = generarDatosExportacion();
	const archivo = `recogida_${recogida.id}.csv`;

	var element = document.createElement('a');
	element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(texto));
	element.setAttribute('download', archivo);

	element.style.display = 'none';
	document.body.appendChild(element);

	element.click();

	document.body.removeChild(element);

}

function generarDatosExportacion(){

	let salida = '';

	salida = `"id_recogida","fecha","tipo","localizacion","numero_cables","numero_componentes","numero_ordenadores","numero_transformadores"\n`;
	salida += `${recogida.id},"${recogida.fecha}","${recogida.tipo}","${recogida.localizacion}",${cables.cantidad},${componentes.cantidad},${ordenadores.cantidad},${transformadores.cantidad},`;

	return salida;

}