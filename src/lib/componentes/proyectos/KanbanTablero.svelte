<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { Proyecto, Tarea, EstadoTarea } from '$lib/tipos/app';
	import { ESTADOS_TAREA } from '$lib/tipos/app';
	import KanbanColumna from './KanbanColumna.svelte';
	import Boton from '$lib/componentes/ui/Boton.svelte';
	import Input from '$lib/componentes/ui/Input.svelte';

	// Props
	export let proyecto: Proyecto;
	export let tareas: Tarea[] = [];
	export let cargandoTareas = false;

	// Event dispatcher
	const dispatch = createEventDispatcher<{
		moverTarea: { tareaId: string; nuevoEstado: EstadoTarea; nuevoOrden: number };
		crearTarea: { estado: EstadoTarea };
		editarTarea: { tarea: Tarea };
		eliminarTarea: { tarea: Tarea };
		reordenarTareas: { tareas: { id: string; orden: number }[] };
	}>();

	// Estados del tablero
	const estadosTablero: EstadoTarea[] = ['por-hacer', 'en-progreso', 'en-revision', 'completada'];
	
	// Filtros
	let filtroTexto = '';
	let filtroPrioridad = 'todas';
	let filtroAsignado = 'todos';

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

	// Agrupar tareas por estado
	$: tareasAgrupadas = estadosTablero.reduce((acc, estado) => {
		acc[estado] = tareasFiltradas
			.filter(tarea => tarea.estado === estado)
			.sort((a, b) => a.orden - b.orden);
		return acc;
	}, {} as Record<EstadoTarea, Tarea[]>);

	// Estadísticas del tablero
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

	// Handlers
	const handleConsider = (estado: EstadoTarea, event: CustomEvent) => {
		const { items } = event.detail;
		tareasAgrupadas[estado] = items;
		tareasAgrupadas = { ...tareasAgrupadas };
	};

	const handleFinalize = (estado: EstadoTarea, event: CustomEvent) => {
		const { items, info } = event.detail;
		
		// Actualizar orden local
		tareasAgrupadas[estado] = items;
		tareasAgrupadas = { ...tareasAgrupadas };

		// Si se movió de una columna a otra
		if (info.source !== info.target) {
			const tareaMovida = items.find((item: Tarea) => item.id === info.id);
			if (tareaMovida) {
				const nuevoOrden = items.indexOf(tareaMovida);
				dispatch('moverTarea', {
					tareaId: tareaMovida.id,
					nuevoEstado: estado,
					nuevoOrden
				});
			}
		} else {
			// Solo reordenamiento dentro de la misma columna
			const tareasReordenadas = items.map((tarea: Tarea, index: number) => ({
				id: tarea.id,
				orden: index
			}));
			dispatch('reordenarTareas', { tareas: tareasReordenadas });
		}
	};

	const handleCrearTarea = (event: CustomEvent<{ estado: EstadoTarea }>) => {
		dispatch('crearTarea', event.detail);
	};

	const handleEditarTarea = (event: CustomEvent<{ tarea: Tarea }>) => {
		dispatch('editarTarea', event.detail);
	};

	const handleEliminarTarea = (event: CustomEvent<{ tarea: Tarea }>) => {
		dispatch('eliminarTarea', event.detail);
	};

	// Limpiar filtros
	const limpiarFiltros = () => {
		filtroTexto = '';
		filtroPrioridad = 'todas';
		filtroAsignado = 'todos';
	};
</script>

<!-- Tablero Kanban Principal -->
<div class="flex flex-col h-full bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
	
	<!-- Header del tablero -->
	<div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50 p-6">
		<!-- Título y estadísticas -->
		<div class="flex items-center justify-between mb-6">
			<div>
				<h2 class="text-2xl font-bold text-gray-900 dark:text-white">
					{proyecto.nombre}
				</h2>
				<div class="flex items-center space-x-6 mt-2 text-sm text-gray-600 dark:text-gray-400">
					<span>{estadisticas.total} tareas totales</span>
					<span>{estadisticas.completadas} completadas</span>
					<span class="text-primary-600 dark:text-primary-400 font-medium">
						{estadisticas.porcentajeCompleto}% completo
					</span>
				</div>
			</div>
			
			<div class="flex items-center space-x-3">
				<Boton
					variante="ghost"
					size="sm"
					icono="filter"
					on:click={limpiarFiltros}
				>
					Limpiar filtros
				</Boton>
				<Boton
					variante="primary"
					icono="plus"
					on:click={() => dispatch('crearTarea', { estado: 'por-hacer' })}
				>
					Nueva Tarea
				</Boton>
			</div>
		</div>

		<!-- Barra de progreso del proyecto -->
		<div class="mb-6">
			<div class="flex items-center justify-between text-sm mb-2">
				<span class="font-medium text-gray-700 dark:text-gray-300">Progreso del proyecto</span>
				<span class="text-gray-600 dark:text-gray-400">{estadisticas.porcentajeCompleto}%</span>
			</div>
			<div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
				<div 
					class="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all duration-500"
					style="width: {estadisticas.porcentajeCompleto}%"
				></div>
			</div>
		</div>

		<!-- Filtros del tablero -->
		<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
			<!-- Búsqueda por texto -->
			<Input
				tipo="text"
				placeholder="Buscar tareas..."
				bind:valor={filtroTexto}
				icono="search"
			/>

			<!-- Filtro por prioridad -->
			<select
				bind:value={filtroPrioridad}
				class="px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
			>
				<option value="todas">Todas las prioridades</option>
				<option value="urgente">Urgente</option>
				<option value="alta">Alta</option>
				<option value="media">Media</option>
				<option value="baja">Baja</option>
			</select>

			<!-- Filtro por asignado -->
			<select
				bind:value={filtroAsignado}
				class="px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
			>
				<option value="todos">Todos los asignados</option>
				<option value="">Sin asignar</option>
				{#each asignadosUnicos as asignado}
					<option value={asignado}>{asignado}</option>
				{/each}
			</select>
		</div>
	</div>

	<!-- Contenido del tablero -->
	{#if cargandoTareas}
		<div class="flex-1 flex items-center justify-center">
			<div class="text-center">
				<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
				<p class="text-gray-600 dark:text-gray-400">Cargando tareas...</p>
			</div>
		</div>
	{:else}
		<!-- Columnas del Kanban -->
		<div class="flex-1 flex overflow-x-auto overflow-y-hidden p-6 space-x-6 min-h-0">
			{#each estadosTablero as estado}
				<KanbanColumna
					{estado}
					tareas={tareasAgrupadas[estado] || []}
					color={ESTADOS_TAREA[estado]?.color}
					on:consider={(e) => handleConsider(estado, e)}
					on:finalize={(e) => handleFinalize(estado, e)}
					on:crearTarea={handleCrearTarea}
					on:editarTarea={handleEditarTarea}
					on:eliminarTarea={handleEliminarTarea}
				/>
			{/each}
		</div>
	{/if}

	<!-- Estadísticas rápidas en footer -->
	<div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-t border-gray-200/50 dark:border-gray-700/50 p-4">
		<div class="flex items-center justify-center space-x-8 text-sm">
			<div class="flex items-center space-x-2">
				<div class="w-3 h-3 bg-gray-400 rounded-full"></div>
				<span class="text-gray-600 dark:text-gray-400">Por hacer: {estadisticas.porHacer}</span>
			</div>
			<div class="flex items-center space-x-2">
				<div class="w-3 h-3 bg-blue-400 rounded-full"></div>
				<span class="text-gray-600 dark:text-gray-400">En progreso: {estadisticas.enProgreso}</span>
			</div>
			<div class="flex items-center space-x-2">
				<div class="w-3 h-3 bg-yellow-400 rounded-full"></div>
				<span class="text-gray-600 dark:text-gray-400">En revisión: {estadisticas.enRevision}</span>
			</div>
			<div class="flex items-center space-x-2">
				<div class="w-3 h-3 bg-green-400 rounded-full"></div>
				<span class="text-gray-600 dark:text-gray-400">Completadas: {estadisticas.completadas}</span>
			</div>
		</div>
	</div>
</div> 