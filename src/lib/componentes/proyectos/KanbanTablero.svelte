<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { Proyecto, Tarea, EstadoTarea } from '$lib/tipos/app';
	import { ESTADOS_TAREA } from '$lib/tipos/app';
	import KanbanColumnaSortable from './KanbanColumnaSortable.svelte';
	import Boton from '$lib/componentes/ui/Boton.svelte';
	import Input from '$lib/componentes/ui/Input.svelte';
	import { Filter, Search, Plus, ChevronDown, Users, Flag } from 'lucide-svelte';

	// Props
	export let proyecto: Proyecto;
	export let tareas: Tarea[] = [];
	export let cargandoTareas = false;

	// Event dispatcher
	const dispatch = createEventDispatcher<{
		'tarea-movida': { tarea: Tarea; nuevoEstado: EstadoTarea; nuevoOrden: number };
		'crear-tarea': { estado: EstadoTarea };
		'editar-tarea': { tarea: Tarea };
		'eliminar-tarea': { tarea: Tarea };
		'tareas-reordenadas': { tareas: { id: string; orden: number }[] };
	}>();

	// Estados del tablero
	const estadosTablero: EstadoTarea[] = ['por-hacer', 'en-progreso', 'en-revision', 'completada'];
	
	// Estado para vista móvil
	let vistaMovil = false;
	let estadoActivoMovil: EstadoTarea = 'por-hacer';
	let mostrarFiltros = false;
	
	// Filtros
	let filtroTexto = '';
	let filtroPrioridad = 'todas';
	let filtroAsignado = 'todos';

	// Detectar si es móvil
	let pantallaAncho = 0;
	$: vistaMovil = pantallaAncho < 768; // md breakpoint

	// Datos derivados
	$: asignadosUnicos = [...new Set(tareas.map(t => t.asignado_a).filter(Boolean))];

	// Tareas filtradas
	$: tareasFiltradas = tareas.filter(tarea => {
		// Filtro por texto
		const coincideTexto = tarea.titulo.toLowerCase().includes(filtroTexto.toLowerCase()) ||
			tarea.descripcion?.toLowerCase().includes(filtroTexto.toLowerCase());

		// Filtro por prioridad
		const coincidePrioridad = filtroPrioridad === 'todas' || tarea.prioridad === filtroPrioridad;

		// Filtro por asignado
		const coincideAsignado = filtroAsignado === 'todos' || tarea.asignado_a === filtroAsignado;

		return coincideTexto && coincidePrioridad && coincideAsignado;
	});

	// Variable para tareas agrupadas
	let tareasAgrupadas: Record<EstadoTarea, Tarea[]> = {
		'por-hacer': [],
		'en-progreso': [],
		'en-revision': [],
		'completada': [],
		'pausada': []
	};

	// Agrupar tareas por estado - CON LOGS PARA DEBUG
	$: {
		tareasAgrupadas = estadosTablero.reduce((acc, estado) => {
			acc[estado] = tareasFiltradas.filter(tarea => tarea.estado === estado);
			console.log(`📊 AGRUPANDO ${estado}:`, acc[estado].length, 'tareas');
			return acc;
		}, {} as Record<EstadoTarea, Tarea[]>);
		
		console.log('🔄 TAREAS REAGRUPADAS:', {
			total: tareasFiltradas.length,
			porHacer: tareasAgrupadas['por-hacer']?.length || 0,
			enProgreso: tareasAgrupadas['en-progreso']?.length || 0,
			enRevision: tareasAgrupadas['en-revision']?.length || 0,
			completadas: tareasAgrupadas['completada']?.length || 0
		});
	}

	// Estadísticas
	$: estadisticas = {
		total: tareasFiltradas.length,
		porHacer: tareasAgrupadas['por-hacer']?.length || 0,
		enProgreso: tareasAgrupadas['en-progreso']?.length || 0,
		enRevision: tareasAgrupadas['en-revision']?.length || 0,
		completadas: tareasAgrupadas['completada']?.length || 0,
		porcentajeCompleto: tareasFiltradas.length > 0 
			? Math.round(((tareasAgrupadas['completada']?.length || 0) / tareasFiltradas.length) * 100)
			: 0
	};

	// Mapeo de estados para UI
	const estadosConfig = {
		'por-hacer': { 
			label: 'Por Hacer', 
			color: 'bg-gray-100 text-gray-700 border-gray-200',
			colorAccent: 'text-gray-600',
			icon: '📋'
		},
		'en-progreso': { 
			label: 'En Progreso', 
			color: 'bg-blue-100 text-blue-700 border-blue-200',
			colorAccent: 'text-blue-600',
			icon: '🔄'
		},
		'en-revision': { 
			label: 'En Revisión', 
			color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
			colorAccent: 'text-yellow-600',
			icon: '👀'
		},
		'completada': { 
			label: 'Completadas', 
			color: 'bg-green-100 text-green-700 border-green-200',
			colorAccent: 'text-green-600',
			icon: '✅'
		},
		'pausada': { 
			label: 'Pausadas', 
			color: 'bg-red-100 text-red-700 border-red-200',
			colorAccent: 'text-red-600',
			icon: '⏸️'
		}
	} as const;

	// Handler SUPER SIMPLE para mover tareas
	const handleMoverTarea = (event: CustomEvent) => {
		console.log('🚨🚨🚨 ===== KANBAN TABLERO - EVENTO RECIBIDO =====');
		console.log('📋 Event detail:', event.detail);
		
		// Pasar directamente el evento al padre
		console.log('📤 ENVIANDO EVENTO AL PADRE (+page.svelte)...');
		dispatch('tarea-movida', event.detail);
		
		console.log('🚨🚨🚨 ===== FIN KANBAN TABLERO =====');
	};

	const handleCrearTarea = (estado: EstadoTarea) => {
		console.log('🎯 KANBAN TABLERO - Crear tarea en estado:', estado);
		dispatch('crear-tarea', { estado });
	};

	const handleEditarTarea = (event: CustomEvent) => {
		console.log('🎯 KANBAN TABLERO - Editar tarea:', event.detail);
		dispatch('editar-tarea', event.detail);
	};

	const handleEliminarTarea = (event: CustomEvent) => {
		console.log('🎯 KANBAN TABLERO - Eliminar tarea:', event.detail);
		dispatch('eliminar-tarea', event.detail);
	};

	// Función para encontrar tarea por ID en todas las columnas
	const encontrarTareaPorId = (tareaId: string): Tarea | null => {
		for (const estado of estadosTablero) {
			const tarea = tareasAgrupadas[estado]?.find(t => t.id === tareaId);
			if (tarea) return tarea;
		}
		return null;
	};

	// Handler personalizado para manejar drag & drop entre columnas
	const handleDragDropGlobal = (tareaId: string, nuevoEstado: EstadoTarea, nuevoOrden: number) => {
		console.log('🌟 DRAG DROP GLOBAL:', { tareaId, nuevoEstado, nuevoOrden });
		
		const tarea = encontrarTareaPorId(tareaId);
		if (tarea) {
			console.log(`📤 ENVIANDO EVENTO tarea-movida desde KanbanTablero`);
			dispatch('tarea-movida', {
				tarea,
				nuevoEstado,
				nuevoOrden
			});
		} else {
			console.error(`❌ No se encontró tarea con ID: ${tareaId}`);
		}
	};

	// Limpiar filtros
	const limpiarFiltros = () => {
		filtroTexto = '';
		filtroPrioridad = 'todas';
		filtroAsignado = 'todos';
	};
</script>

<svelte:window bind:innerWidth={pantallaAncho} />

<!-- Kanban Board Container -->
<div 
	class="flex flex-col h-full bg-gray-50 dark:bg-gray-900 rounded-xl overflow-hidden"
	data-testid="kanban-tablero"
	bind:clientWidth={pantallaAncho}
>
	
	<!-- Header responsivo -->
	<div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50 p-3 sm:p-6">
		<!-- Título y estadísticas -->
		<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 sm:mb-6">
			<div class="min-w-0 flex-1">
				<h2 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate">
					{proyecto.nombre}
				</h2>
				<div class="flex flex-wrap items-center gap-3 sm:gap-6 mt-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
					<span>{estadisticas.total} tareas</span>
					<span>{estadisticas.completadas} completadas</span>
					<span class="text-primary-600 dark:text-primary-400 font-medium">
						{estadisticas.porcentajeCompleto}% completo
					</span>
				</div>
			</div>
			
			<div class="flex items-center gap-2">
				<Boton
					variante="ghost"
					tamaño="sm"
					on:click={() => mostrarFiltros = !mostrarFiltros}
					class="flex-shrink-0"
				>
					<Filter class="w-4 h-4 mr-1" />
					<span class="hidden sm:inline">Filtros</span>
				</Boton>
				{#if filtroTexto || filtroPrioridad !== 'todas' || filtroAsignado !== 'todos'}
					<Boton
						variante="ghost"
						tamaño="sm"
						on:click={limpiarFiltros}
						class="text-red-600 hover:text-red-700"
					>
						Limpiar
					</Boton>
				{/if}
			</div>
		</div>

		<!-- Panel de filtros colapsable -->
		{#if mostrarFiltros}
			<div class="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 sm:p-4 space-y-3 sm:space-y-0 sm:grid sm:grid-cols-3 sm:gap-4">
				<!-- Búsqueda -->
				<div>
					<label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
						<Search class="w-3 h-3 inline mr-1" />
						Buscar
					</label>
					<input
						type="text"
						bind:value={filtroTexto}
						placeholder="Buscar tareas..."
						class="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
					>
				</div>

				<!-- Prioridad -->
				<div>
					<label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
						<Flag class="w-3 h-3 inline mr-1" />
						Prioridad
					</label>
					<select
						bind:value={filtroPrioridad}
						class="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
					>
						<option value="todas">Todas</option>
						<option value="baja">Baja</option>
						<option value="media">Media</option>
						<option value="alta">Alta</option>
						<option value="urgente">Urgente</option>
					</select>
				</div>

				<!-- Asignado -->
				<div>
					<label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
						<Users class="w-3 h-3 inline mr-1" />
						Asignado
					</label>
					<select
						bind:value={filtroAsignado}
						class="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
					>
						<option value="todos">Todos</option>
						<option value="">Sin asignar</option>
						{#each asignadosUnicos as asignado}
							<option value={asignado}>{asignado}</option>
						{/each}
					</select>
				</div>
			</div>
		{/if}
	</div>

	<!-- Contenido del tablero -->
	{#if cargandoTareas}
		<div class="flex-1 flex items-center justify-center p-6">
			<div class="text-center">
				<div class="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
				<p class="text-sm sm:text-base text-gray-600 dark:text-gray-400">Cargando tareas...</p>
			</div>
		</div>
	{:else if vistaMovil}
		<!-- Vista móvil con pestañas -->
		<div class="flex-1 flex flex-col min-h-0">
			<!-- Navegación de pestañas -->
			<div class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
				<div class="flex overflow-x-auto scrollbar-hide">
					{#each estadosTablero as estado}
						<button
							class="flex-shrink-0 px-4 py-3 text-sm font-medium border-b-2 transition-colors {
								estadoActivoMovil === estado 
									? `border-primary-500 ${estadosConfig[estado].colorAccent}` 
									: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
							}"
							on:click={() => estadoActivoMovil = estado}
						>
							<span class="mr-1">{estadosConfig[estado].icon}</span>
							{estadosConfig[estado].label}
							<span class="ml-2 px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full text-xs">
								{tareasAgrupadas[estado]?.length || 0}
							</span>
						</button>
					{/each}
				</div>
			</div>

			<!-- Contenido de la pestaña activa -->
			<div class="flex-1 overflow-y-auto p-4">
				<div class="space-y-3">
					<!-- Header de la columna activa -->
					<div class="flex items-center justify-between">
						<h3 class="text-lg font-semibold text-gray-900 dark:text-white">
							{estadosConfig[estadoActivoMovil].icon} {estadosConfig[estadoActivoMovil].label}
						</h3>
						<Boton
							variante="primary"
							tamaño="sm"
							on:click={() => handleCrearTarea(estadoActivoMovil)}
						>
							<Plus class="w-4 h-4 mr-1" />
							Agregar
						</Boton>
					</div>

					<!-- Tareas de la columna activa -->
					{#if tareasAgrupadas[estadoActivoMovil]?.length > 0}
						{#each tareasAgrupadas[estadoActivoMovil] as tarea (tarea.id)}
							<div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
								<div class="flex items-start justify-between mb-2">
									<h4 class="font-medium text-gray-900 dark:text-white line-clamp-2">
										{tarea.titulo}
									</h4>
									<div class="flex items-center space-x-1 ml-2 flex-shrink-0">
										<!-- Prioridad -->
										<div class="w-2 h-2 rounded-full {
											tarea.prioridad === 'urgente' ? 'bg-red-500' :
											tarea.prioridad === 'alta' ? 'bg-orange-500' :
											tarea.prioridad === 'media' ? 'bg-yellow-500' : 'bg-green-500'
										}"></div>
									</div>
								</div>
								
								{#if tarea.descripcion}
									<p class="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
										{tarea.descripcion}
									</p>
								{/if}

								<div class="flex items-center justify-between text-xs text-gray-500">
									{#if tarea.fecha_limite}
										<span>📅 {new Date(tarea.fecha_limite).toLocaleDateString('es-ES')}</span>
									{:else}
										<span></span>
									{/if}
									{#if tarea.etiquetas && tarea.etiquetas.length > 0}
										<div class="flex gap-1">
											{#each tarea.etiquetas.slice(0, 2) as etiqueta}
												<span class="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">
													{etiqueta}
												</span>
											{/each}
											{#if tarea.etiquetas.length > 2}
												<span class="text-gray-400">+{tarea.etiquetas.length - 2}</span>
											{/if}
										</div>
									{/if}
								</div>
							</div>
						{/each}
					{:else}
						<div class="text-center py-8">
							<div class="text-4xl mb-2">{estadosConfig[estadoActivoMovil].icon}</div>
							<p class="text-gray-500 dark:text-gray-400 mb-4">
								No hay tareas {estadosConfig[estadoActivoMovil].label.toLowerCase()}
							</p>
							<Boton
								variante="secondary"
								on:click={() => handleCrearTarea(estadoActivoMovil)}
							>
								<Plus class="w-4 h-4 mr-2" />
								Agregar tarea
							</Boton>
						</div>
					{/if}
				</div>
			</div>
		</div>
	{:else}
		<!-- Vista desktop con columnas - GRID CON ANCHO UNIFORME -->
		<div class="flex-1 grid gap-4 lg:gap-6 p-4 lg:p-6 min-h-0 overflow-hidden
			        grid-cols-2 md:grid-cols-4">
			{#each estadosTablero as estado}
				<div class="min-w-0 h-full">
					<KanbanColumnaSortable
						{estado}
						tareas={tareasAgrupadas[estado] || []}
						color={ESTADOS_TAREA[estado]?.color}
						on:tarea-movida={handleMoverTarea}
						on:crear-tarea={() => handleCrearTarea(estado)}
						on:editar-tarea={handleEditarTarea}
						on:eliminar-tarea={handleEliminarTarea}
					/>
				</div>
			{/each}
		</div>
	{/if}

	<!-- Footer con estadísticas -->
	<div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-t border-gray-200/50 dark:border-gray-700/50 p-3 sm:p-4">
		<div class="flex items-center justify-center gap-4 sm:gap-8 text-xs sm:text-sm overflow-x-auto scrollbar-hide">
			<div class="flex items-center gap-2 flex-shrink-0">
				<div class="w-2 h-2 sm:w-3 sm:h-3 bg-gray-400 rounded-full"></div>
				<span class="text-gray-600 dark:text-gray-400">Por hacer: {estadisticas.porHacer}</span>
			</div>
			<div class="flex items-center gap-2 flex-shrink-0">
				<div class="w-2 h-2 sm:w-3 sm:h-3 bg-blue-400 rounded-full"></div>
				<span class="text-gray-600 dark:text-gray-400">En progreso: {estadisticas.enProgreso}</span>
			</div>
			<div class="flex items-center gap-2 flex-shrink-0">
				<div class="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-400 rounded-full"></div>
				<span class="text-gray-600 dark:text-gray-400">En revisión: {estadisticas.enRevision}</span>
			</div>
			<div class="flex items-center gap-2 flex-shrink-0">
				<div class="w-2 h-2 sm:w-3 sm:h-3 bg-green-400 rounded-full"></div>
				<span class="text-gray-600 dark:text-gray-400">Completadas: {estadisticas.completadas}</span>
			</div>
		</div>
	</div>
</div>

<style>
	.scrollbar-hide {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}
	.scrollbar-hide::-webkit-scrollbar {
		display: none;
	}
	
	.line-clamp-2 {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	/* Grid uniforme para columnas Kanban */
	.grid {
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
	}

	/* Responsive breakpoints */
	@media (min-width: 640px) {
		.md\:grid-cols-4 {
			grid-template-columns: repeat(4, 1fr);
		}
	}

	@media (max-width: 767px) {
		.grid-cols-2 {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	/* Asegurar que las columnas mantengan su ancho */
	.grid > div {
		min-width: 250px;
		max-width: 100%;
	}

	@media (min-width: 768px) {
		.grid > div {
			min-width: 280px;
		}
	}
	
	@media (min-width: 1024px) {
		.grid > div {
			min-width: 320px;
		}
	}
	
	@media (min-width: 1280px) {
		.grid > div {
			min-width: 350px;
		}
	}
</style> 