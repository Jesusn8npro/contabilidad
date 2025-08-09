<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { 
		ChevronLeft, 
		ChevronRight, 
		Calendar, 
		Plus, 
		Clock, 
		Target,
		CheckCircle,
		AlertTriangle
	} from 'lucide-svelte';

	// Props
	export let tareas: any[] = [];
	export let campañas: any[] = [];
	export let tipoContexto: 'negocio' | 'proyecto' = 'negocio';
	export let contextoId: string = '';
	export let contextoNombre: string = '';

	const dispatch = createEventDispatcher();

	// Estado del calendario
	let fechaActual = new Date();
	let vistaActual: 'mes' | 'semana' = 'mes';
	let fechaSeleccionada: Date | null = new Date(); // Por defecto hoy
	let mostrarModalCreacion = false;
	let tipoCreacion: 'tarea' | 'campaña' = 'tarea';

	// Nombres en español
	const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
	const meses = [
		'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
		'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
	];

	// Calcular días del calendario
	$: primerDiaDelMes = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), 1);
	$: ultimoDiaDelMes = new Date(fechaActual.getFullYear(), fechaActual.getMonth() + 1, 0);
	$: primerDiaDeLaSemana = primerDiaDelMes.getDay();

	// Generar calendario completo
	$: diasDelCalendario = (() => {
		const dias = [];
		const totalDiasDelMes = ultimoDiaDelMes.getDate();

		// Días del mes anterior
		const diasDelMesAnterior = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), 0).getDate();
		for (let i = primerDiaDeLaSemana - 1; i >= 0; i--) {
			dias.push({
				numero: diasDelMesAnterior - i,
				esDelMesActual: false,
				fecha: new Date(fechaActual.getFullYear(), fechaActual.getMonth() - 1, diasDelMesAnterior - i)
			});
		}

		// Días del mes actual
		for (let dia = 1; dia <= totalDiasDelMes; dia++) {
			dias.push({
				numero: dia,
				esDelMesActual: true,
				fecha: new Date(fechaActual.getFullYear(), fechaActual.getMonth(), dia)
			});
		}

		// Días del siguiente mes
		const diasRestantes = 42 - dias.length; // 6 semanas × 7 días
		for (let dia = 1; dia <= diasRestantes; dia++) {
			dias.push({
				numero: dia,
				esDelMesActual: false,
				fecha: new Date(fechaActual.getFullYear(), fechaActual.getMonth() + 1, dia)
			});
		}

		return dias;
	})();

	// Obtener elementos para una fecha específica
	const obtenerElementosDelDia = (fecha: Date) => {
		const fechaStr = fecha.toDateString();
		
		const tareasDelDia = tareas.filter(tarea => {
			if (!tarea.fecha_limite) return false;
			return new Date(tarea.fecha_limite).toDateString() === fechaStr;
		});

		const campañasDelDia = campañas.filter(campaña => {
			if (!campaña.fecha_inicio) return false;
			return new Date(campaña.fecha_inicio).toDateString() === fechaStr;
		});

		return { tareasDelDia, campañasDelDia };
	};

	// Verificaciones de fecha
	const esHoy = (fecha: Date) => {
		return fecha.toDateString() === new Date().toDateString();
	};

	const esFinDeSemana = (fecha: Date) => {
		const dia = fecha.getDay();
		return dia === 0 || dia === 6;
	};

	const esFechaSeleccionada = (fecha: Date) => {
		return fechaSeleccionada?.toDateString() === fecha.toDateString();
	};

	// Navegación del calendario
	const navegarMes = (direccion: 'anterior' | 'siguiente') => {
		if (direccion === 'anterior') {
			fechaActual = new Date(fechaActual.getFullYear(), fechaActual.getMonth() - 1, 1);
		} else {
			fechaActual = new Date(fechaActual.getFullYear(), fechaActual.getMonth() + 1, 1);
		}
	};

	const irAHoy = () => {
		fechaActual = new Date();
		fechaSeleccionada = new Date();
	};

	// Manejar clic en día
	const manejarClicEnDia = (fecha: Date) => {
		fechaSeleccionada = fecha;
		const elementos = obtenerElementosDelDia(fecha);
		dispatch('diaSeleccionado', {
			fecha,
			tareas: elementos.tareasDelDia,
			campañas: elementos.campañasDelDia
		});
	};

	// Abrir modal de creación
	const abrirModalCreacion = (tipo: 'tarea' | 'campaña', fecha?: Date) => {
		tipoCreacion = tipo;
		if (fecha) {
			fechaSeleccionada = fecha;
		}
		mostrarModalCreacion = true;
	};

	// Crear nuevo elemento
	const crearElemento = (event: Event) => {
		const form = event.target as HTMLFormElement;
		const formData = new FormData(form);
		
		// Obtener todos los valores del formulario
		const titulo = formData.get('titulo') as string;
		const descripcion = formData.get('descripcion') as string;
		const prioridad = formData.get('prioridad') as string;
		const presupuesto = formData.get('presupuesto') as string;
		const plataforma = formData.get('plataforma') as string;

		// Crear objeto con todos los datos
		const datosElemento = {
			tipo: tipoCreacion,
			fecha: fechaSeleccionada,
			titulo,
			descripcion,
			...(tipoCreacion === 'tarea' && { prioridad }),
			...(tipoCreacion === 'campaña' && { 
				presupuesto_total: presupuesto ? parseInt(presupuesto) : 1000,
				plataforma 
			}),
			contexto: {
				tipo: tipoContexto,
				id: contextoId,
				nombre: contextoNombre
			}
		};

		dispatch('crearElemento', datosElemento);
		mostrarModalCreacion = false;
	};

	// Obtener fechas disponibles para el selector
	const obtenerFechaFormateada = (fecha: Date) => {
		return fecha.toISOString().split('T')[0];
	};

	// Manejar cambio de fecha en el modal
	const manejarCambioFecha = (event: Event) => {
		const target = event.target as HTMLInputElement;
		if (target.value) {
			fechaSeleccionada = new Date(target.value + 'T12:00:00');
		}
	};

	// Obtener color por prioridad
	const obtenerColorPrioridad = (prioridad: string) => {
		switch (prioridad) {
			case 'urgente': return 'bg-red-500';
			case 'alta': return 'bg-orange-500';
			case 'media': return 'bg-yellow-500';
			case 'baja': return 'bg-green-500';
			default: return 'bg-gray-500';
		}
	};

	// Obtener color por estado de campaña
	const obtenerColorCampaña = (estado: string) => {
		switch (estado) {
			case 'activa': return 'bg-blue-500';
			case 'pausada': return 'bg-yellow-500';
			case 'completada': return 'bg-green-500';
			default: return 'bg-purple-500';
		}
	};
</script>

<div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
	<!-- Encabezado del calendario -->
	<div class="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
		<div class="flex items-center justify-between mb-4">
			<div class="flex items-center space-x-4">
				<h3 class="text-xl font-bold text-gray-900 dark:text-white flex items-center">
					<Calendar class="w-6 h-6 mr-3 text-blue-500" />
					Calendario - {contextoNombre}
				</h3>

				<!-- Selector de vista -->
				<div class="flex bg-white dark:bg-gray-700 rounded-lg p-1 shadow-sm">
					<button 
						class="px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 {
							vistaActual === 'mes' 
								? 'bg-blue-500 text-white shadow-sm' 
								: 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
						}"
						on:click={() => vistaActual = 'mes'}
					>
						Vista Mensual
					</button>
					<button 
						class="px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 {
							vistaActual === 'semana' 
								? 'bg-blue-500 text-white shadow-sm' 
								: 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
						}"
						on:click={() => vistaActual = 'semana'}
					>
						Vista Semanal
					</button>
				</div>
			</div>

			<!-- Botones de acción rápida -->
			<div class="flex items-center space-x-3">
				<button 
					class="inline-flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
					on:click={() => abrirModalCreacion('tarea')}
				>
					<Plus class="w-4 h-4 mr-2" />
					Nueva Tarea
				</button>
				
				{#if tipoContexto === 'negocio'}
					<button 
						class="inline-flex items-center px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
						on:click={() => abrirModalCreacion('campaña')}
					>
						<Target class="w-4 h-4 mr-2" />
						Nueva Campaña
					</button>
				{/if}
			</div>
		</div>

		<!-- Navegación del calendario -->
		<div class="flex items-center justify-between">
			<div class="flex items-center space-x-3">
				<button 
					class="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
					on:click={() => navegarMes('anterior')}
				>
					<ChevronLeft class="w-5 h-5" />
				</button>

				<h4 class="text-lg font-semibold text-gray-900 dark:text-white min-w-[200px] text-center">
					{meses[fechaActual.getMonth()]} {fechaActual.getFullYear()}
				</h4>

				<button 
					class="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
					on:click={() => navegarMes('siguiente')}
				>
					<ChevronRight class="w-5 h-5" />
				</button>
			</div>

			<button 
				class="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors duration-200"
				on:click={irAHoy}
			>
				Ir a Hoy
			</button>
		</div>
	</div>

	<!-- Vista del calendario -->
	{#if vistaActual === 'mes'}
		<div class="p-6">
			<!-- Días de la semana -->
			<div class="grid grid-cols-7 gap-1 mb-4">
				{#each diasSemana as dia}
					<div class="text-center py-3 text-sm font-semibold text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 rounded-lg">
						{dia}
					</div>
				{/each}
			</div>

			<!-- Días del mes -->
			<div class="grid grid-cols-7 gap-1">
				{#each diasDelCalendario as diaData}
					{@const elementos = obtenerElementosDelDia(diaData.fecha)}
					{@const totalElementos = elementos.tareasDelDia.length + elementos.campañasDelDia.length}
					
					<div 
						class="min-h-[120px] p-3 border border-gray-100 dark:border-gray-600 rounded-lg cursor-pointer transition-all duration-200 group {
							!diaData.esDelMesActual ? 'opacity-40 bg-gray-50 dark:bg-gray-800' : 'hover:bg-blue-50 dark:hover:bg-blue-900/20'
						} {
							esHoy(diaData.fecha) ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700' : ''
						} {
							esFechaSeleccionada(diaData.fecha) ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''
						} {
							esFinDeSemana(diaData.fecha) ? 'bg-gray-50/50 dark:bg-gray-700/50' : ''
						}"
						on:click={() => manejarClicEnDia(diaData.fecha)}
					>
						<!-- Número del día -->
						<div class="flex items-center justify-between mb-2">
							<span class="text-sm font-semibold {
								diaData.esDelMesActual ? 'text-gray-900 dark:text-white' : 'text-gray-400'
							} {
								esHoy(diaData.fecha) ? 'bg-blue-600 text-white w-7 h-7 rounded-full flex items-center justify-center text-xs' : ''
							}">
								{diaData.numero}
							</span>

							{#if totalElementos > 0}
								<span class="text-xs bg-red-500 text-white px-2 py-1 rounded-full font-medium">
									{totalElementos}
								</span>
							{/if}

							<!-- Botón para agregar (visible en hover) -->
							<button 
								class="opacity-0 group-hover:opacity-100 p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-100 dark:hover:bg-blue-800 rounded transition-all duration-200"
								on:click|stopPropagation={() => abrirModalCreacion('tarea', diaData.fecha)}
							>
								<Plus class="w-4 h-4" />
							</button>
						</div>

						<!-- Elementos del día -->
						<div class="space-y-1">
							<!-- Tareas -->
							{#each elementos.tareasDelDia.slice(0, 2) as tarea}
								<div 
									class="text-xs px-2 py-1 rounded-md truncate text-white font-medium {obtenerColorPrioridad(tarea.prioridad || 'media')}"
									title="Tarea: {tarea.titulo}"
								>
									<Clock class="w-3 h-3 inline mr-1" />
									{tarea.titulo}
								</div>
							{/each}

							<!-- Campañas -->
							{#each elementos.campañasDelDia.slice(0, 1) as campaña}
								<div 
									class="text-xs px-2 py-1 rounded-md truncate text-white font-medium {obtenerColorCampaña(campaña.estado || 'planificada')}"
									title="Campaña: {campaña.nombre}"
								>
									<Target class="w-3 h-3 inline mr-1" />
									{campaña.nombre}
								</div>
							{/each}

							<!-- Indicador de más elementos -->
							{#if totalElementos > 3}
								<div class="text-xs text-gray-500 px-2 font-medium">
									+{totalElementos - 3} más
								</div>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		</div>
	{:else}
		<!-- Vista semanal (placeholder) -->
		<div class="p-6">
			<div class="text-center py-16">
				<Clock class="w-16 h-16 text-gray-400 mx-auto mb-4" />
				<h3 class="text-lg font-semibold text-gray-500 dark:text-gray-400 mb-2">Vista Semanal</h3>
				<p class="text-gray-400">Próximamente disponible</p>
				<button 
					class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
					on:click={() => vistaActual = 'mes'}
				>
					Volver a Vista Mensual
				</button>
			</div>
		</div>
	{/if}

	<!-- Resumen en el pie -->
	<div class="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-600">
		<div class="flex items-center justify-between text-sm">
			<div class="flex items-center space-x-6">
				<span class="text-gray-600 dark:text-gray-400">
					<strong>{tareas.length}</strong> tareas totales
				</span>
				{#if tipoContexto === 'negocio'}
					<span class="text-gray-600 dark:text-gray-400">
						<strong>{campañas.length}</strong> campañas
					</span>
				{/if}
				<span class="text-orange-600 dark:text-orange-400">
					<strong>{tareas.filter(t => t.prioridad === 'urgente').length}</strong> urgentes
				</span>
			</div>

			{#if fechaSeleccionada}
				<span class="text-blue-600 dark:text-blue-400 font-medium">
					Seleccionado: {fechaSeleccionada.toLocaleDateString('es-ES')}
				</span>
			{/if}
		</div>
	</div>
</div>

<!-- Modal de creación -->
{#if mostrarModalCreacion}
	<div class="fixed inset-0 z-50 overflow-y-auto">
		<!-- Backdrop -->
		<div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity" on:click={() => mostrarModalCreacion = false}></div>
		
		<!-- Modal -->
		<div class="flex min-h-screen items-center justify-center p-4">
			<div class="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-lg w-full p-6">
				<div class="flex items-center justify-between mb-6">
					<h3 class="text-xl font-bold text-gray-900 dark:text-white flex items-center">
						{#if tipoCreacion === 'tarea'}
							<Clock class="w-6 h-6 mr-3 text-blue-500" />
							📋 Nueva Tarea
						{:else}
							<Target class="w-6 h-6 mr-3 text-purple-500" />
							🎯 Nueva Campaña
						{/if}
					</h3>
					<button 
						class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
						on:click={() => mostrarModalCreacion = false}
					>
						<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
						</svg>
					</button>
				</div>
				
				<form on:submit|preventDefault={crearElemento} class="space-y-4">
					<!-- Tipo de elemento (solo mostrar si es negocio) -->
					{#if tipoContexto === 'negocio'}
						<div class="flex space-x-3 p-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
							<button 
								type="button"
								class="flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 {
									tipoCreacion === 'tarea' 
										? 'bg-blue-500 text-white shadow-sm' 
										: 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
								}"
								on:click={() => tipoCreacion = 'tarea'}
							>
								<Clock class="w-4 h-4 mr-2 inline" />
								Tarea
							</button>
							<button 
								type="button"
								class="flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 {
									tipoCreacion === 'campaña' 
										? 'bg-purple-500 text-white shadow-sm' 
										: 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
								}"
								on:click={() => tipoCreacion = 'campaña'}
							>
								<Target class="w-4 h-4 mr-2 inline" />
								Campaña
							</button>
						</div>
					{/if}

					<!-- Nombre/Título -->
					<div>
						<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
							{tipoCreacion === 'tarea' ? 'Título de la Tarea' : 'Nombre de la Campaña'}
						</label>
						<input 
							type="text" 
							name="titulo"
							class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
							placeholder={tipoCreacion === 'tarea' ? 'Ej: Revisar documentos...' : 'Ej: Campaña de Facebook Ads...'}
							required
						/>
					</div>

					<!-- Descripción -->
					<div>
						<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
							Descripción (Opcional)
						</label>
						<textarea 
							name="descripcion"
							class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200 resize-none"
							rows="3"
							placeholder={tipoCreacion === 'tarea' ? 'Describe qué hay que hacer...' : 'Describe los objetivos de la campaña...'}
						></textarea>
					</div>

					<!-- Fecha -->
					<div>
						<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
							📅 {tipoCreacion === 'tarea' ? 'Fecha Límite' : 'Fecha de Inicio'}
						</label>
						<input 
							type="date"
							name="fecha"
							value={fechaSeleccionada ? obtenerFechaFormateada(fechaSeleccionada) : ''}
							on:change={manejarCambioFecha}
							class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
							required
						/>
						{#if fechaSeleccionada}
							<p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
								📆 Fecha seleccionada: <strong>{fechaSeleccionada.toLocaleDateString('es-ES', { 
									weekday: 'long', 
									year: 'numeric', 
									month: 'long', 
									day: 'numeric' 
								})}</strong>
							</p>
						{/if}
					</div>

					<!-- Campos específicos por tipo -->
					{#if tipoCreacion === 'tarea'}
						<!-- Prioridad para tareas -->
						<div>
							<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
								🎯 Prioridad
							</label>
							<select 
								name="prioridad"
								class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
							>
								<option value="baja">🟢 Baja</option>
								<option value="media" selected>🟡 Media</option>
								<option value="alta">🟠 Alta</option>
								<option value="urgente">🔴 Urgente</option>
							</select>
						</div>
					{:else}
						<!-- Presupuesto para campañas -->
						<div>
							<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
								💰 Presupuesto Estimado
							</label>
							<div class="relative">
								<span class="absolute left-3 top-3 text-gray-500 dark:text-gray-400">$</span>
								<input 
									type="number"
									name="presupuesto"
									min="0"
									step="1000"
									placeholder="5000"
									class="w-full pl-8 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
								/>
							</div>
						</div>

						<!-- Plataforma para campañas -->
						<div>
							<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
								📱 Plataforma
							</label>
							<select 
								name="plataforma"
								class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
							>
								<option value="google-ads">🔍 Google Ads</option>
								<option value="facebook-ads">📘 Facebook Ads</option>
								<option value="instagram-ads">📷 Instagram Ads</option>
								<option value="linkedin-ads">💼 LinkedIn Ads</option>
								<option value="email">📧 Email Marketing</option>
								<option value="seo">🔍 SEO</option>
								<option value="contenido">📝 Marketing de Contenido</option>
								<option value="influencers">👥 Influencers</option>
								<option value="radio">📻 Radio</option>
								<option value="television">📺 Televisión</option>
								<option value="otro">🔧 Otro</option>
							</select>
						</div>
					{/if}

					<!-- Botones de acción -->
					<div class="flex space-x-3 pt-6">
						<button 
							type="submit"
							class="flex-1 px-6 py-3 bg-gradient-to-r {
								tipoCreacion === 'tarea' 
									? 'from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800' 
									: 'from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800'
							} text-white font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
							disabled={!fechaSeleccionada}
						>
							{#if tipoCreacion === 'tarea'}
								<Clock class="w-5 h-5 mr-2 inline" />
								Crear Tarea
							{:else}
								<Target class="w-5 h-5 mr-2 inline" />
								Crear Campaña
							{/if}
						</button>
						<button 
							type="button"
							class="px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200 font-medium rounded-lg transition-colors duration-200"
							on:click={() => mostrarModalCreacion = false}
						>
							Cancelar
						</button>
					</div>
				</form>

				<!-- Información adicional -->
				<div class="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
					<div class="flex items-center">
						<div class="flex-shrink-0">
							<svg class="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
								<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
							</svg>
						</div>
						<div class="ml-3">
							<p class="text-sm text-blue-700 dark:text-blue-300">
								<strong>💡 Consejo:</strong> Puedes cambiar la fecha en cualquier momento. 
								{#if tipoCreacion === 'tarea'}
									Las tareas aparecerán en el calendario según su fecha límite.
								{:else}
									Las campañas se mostrarán según su fecha de inicio.
								{/if}
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
{/if} 