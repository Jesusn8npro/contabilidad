<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { 
		cargarProyecto, 
		cargarTareasProyecto, 
		proyectoActual, 
		tareasProyectoActual,
		cargandoProyecto,
		cargandoTareas,
		moverTarea,
		crearTarea,
		eliminarTarea,
		reordenarTareas
	} from '$lib/stores/proyectos';
	import type { Proyecto, Tarea, EstadoTarea } from '$lib/tipos/app';
	import KanbanTablero from '$lib/componentes/proyectos/KanbanTablero.svelte';
	import FormularioProyecto from '$lib/componentes/proyectos/FormularioProyecto.svelte';
	import Boton from '$lib/componentes/ui/Boton.svelte';
	import Cargando from '$lib/componentes/ui/Cargando.svelte';

	// Parámetros de la URL
	$: proyectoId = $page.params.id;

	// Estados locales
	let mostrarEditarProyecto = false;
	let mostrarFormularioTarea = false;
	let estadoTareaNueva: EstadoTarea = 'por-hacer';
	let tareaEditando: Tarea | null = null;

	// Cargar datos al montar o cambiar ID
	$: if (proyectoId) {
		cargarDatosProyecto(proyectoId);
	}

	const cargarDatosProyecto = async (id: string) => {
		try {
			await Promise.all([
				cargarProyecto(id),
				cargarTareasProyecto(id)
			]);
		} catch (error) {
			console.error('Error al cargar proyecto:', error);
			// Redirigir a proyectos si no se encuentra
			goto('/panel/proyectos');
		}
	};

	// Handlers del Kanban
	const handleMoverTarea = async (event: CustomEvent<{ tareaId: string; nuevoEstado: EstadoTarea; nuevoOrden: number }>) => {
		const { tareaId, nuevoEstado, nuevoOrden } = event.detail;
		try {
			await moverTarea(tareaId, nuevoEstado, nuevoOrden);
		} catch (error) {
			console.error('Error al mover tarea:', error);
			// Recargar tareas en caso de error
			cargarTareasProyecto(proyectoId);
		}
	};

	const handleReordenarTareas = async (event: CustomEvent<{ tareas: { id: string; orden: number }[] }>) => {
		const { tareas } = event.detail;
		try {
			await reordenarTareas(tareas);
		} catch (error) {
			console.error('Error al reordenar tareas:', error);
			// Recargar tareas en caso de error
			cargarTareasProyecto(proyectoId);
		}
	};

	const handleCrearTarea = (event: CustomEvent<{ estado: EstadoTarea }>) => {
		estadoTareaNueva = event.detail.estado;
		tareaEditando = null;
		mostrarFormularioTarea = true;
	};

	const handleEditarTarea = (event: CustomEvent<{ tarea: Tarea }>) => {
		tareaEditando = event.detail.tarea;
		mostrarFormularioTarea = true;
	};

	const handleEliminarTarea = async (event: CustomEvent<{ tarea: Tarea }>) => {
		const { tarea } = event.detail;
		if (confirm(`¿Estás seguro de que quieres eliminar la tarea "${tarea.titulo}"?`)) {
			try {
				await eliminarTarea(tarea.id);
			} catch (error) {
				console.error('Error al eliminar tarea:', error);
			}
		}
	};

	// Handlers de formularios
	const handleGuardarTarea = async (datosFormulario: any) => {
		try {
			const datosTarea = {
				...datosFormulario,
				proyecto_id: proyectoId,
				estado: tareaEditando?.estado || estadoTareaNueva,
				orden: tareaEditando?.orden || 0
			};

			if (tareaEditando) {
				// Actualizar tarea existente
				// await actualizarTarea(tareaEditando.id, datosTarea);
			} else {
				// Crear nueva tarea
				await crearTarea(datosTarea);
			}

			mostrarFormularioTarea = false;
			tareaEditando = null;
		} catch (error) {
			console.error('Error al guardar tarea:', error);
		}
	};

	const handleCancelarFormularioTarea = () => {
		mostrarFormularioTarea = false;
		tareaEditando = null;
	};

	// Handlers del proyecto
	const handleEditarProyecto = () => {
		mostrarEditarProyecto = true;
	};

	const handleGuardarProyecto = async (event: CustomEvent<{ proyecto: Partial<Proyecto> }>) => {
		// Implementar actualización de proyecto
		mostrarEditarProyecto = false;
	};

	const handleCancelarEditarProyecto = () => {
		mostrarEditarProyecto = false;
	};
</script>

<svelte:head>
	<title>{$proyectoActual?.nombre || 'Proyecto'} - App Contabilidad</title>
	<meta name="description" content="Gestiona las tareas de tu proyecto con el tablero Kanban">
</svelte:head>

<!-- Container principal -->
<div class="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">

	<!-- Loading state -->
	{#if $cargandoProyecto}
		<div class="flex items-center justify-center min-h-screen">
			<Cargando size="lg" texto="Cargando proyecto..." />
		</div>
	{:else if !$proyectoActual}
		<!-- Proyecto no encontrado -->
		<div class="flex items-center justify-center min-h-screen">
			<div class="text-center">
				<div class="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
					<svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
					</svg>
				</div>
				<h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
					Proyecto no encontrado
				</h2>
				<p class="text-gray-600 dark:text-gray-400 mb-6">
					El proyecto que buscas no existe o no tienes permisos para verlo.
				</p>
				<Boton
					variante="primary"
					href="/panel/proyectos"
					icono="arrow-left"
				>
					Volver a Proyectos
				</Boton>
			</div>
		</div>
	{:else}
		<!-- Header del proyecto -->
		<div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50 p-6">
			<!-- Breadcrumb -->
			<nav class="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
				<a href="/panel" class="hover:text-gray-900 dark:hover:text-white transition-colors">
					Dashboard
				</a>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
				</svg>
				<a href="/panel/proyectos" class="hover:text-gray-900 dark:hover:text-white transition-colors">
					Proyectos
				</a>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
				</svg>
				<span class="text-gray-900 dark:text-white font-medium">{$proyectoActual.nombre}</span>
			</nav>

			<!-- Información del proyecto -->
			<div class="flex items-center justify-between">
				<div class="flex items-center space-x-4">
					<!-- Indicador de color del proyecto -->
					<div 
						class="w-4 h-4 rounded-full ring-2 ring-white dark:ring-gray-800"
						style="background-color: {$proyectoActual.color}"
					></div>
					
					<div>
						<h1 class="text-2xl font-bold text-gray-900 dark:text-white">
							{$proyectoActual.nombre}
						</h1>
						{#if $proyectoActual.descripcion}
							<p class="text-gray-600 dark:text-gray-400 mt-1">
								{$proyectoActual.descripcion}
							</p>
						{/if}
						
						<!-- Metadata del proyecto -->
						<div class="flex items-center space-x-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
							<span>
								Inicio: {new Date($proyectoActual.fecha_inicio).toLocaleDateString('es-ES')}
							</span>
							{#if $proyectoActual.fecha_limite}
								<span>
									Límite: {new Date($proyectoActual.fecha_limite).toLocaleDateString('es-ES')}
								</span>
							{/if}
							<span class="capitalize">
								Estado: {$proyectoActual.estado}
							</span>
						</div>
					</div>
				</div>

				<!-- Acciones del proyecto -->
				<div class="flex items-center space-x-3">
					<Boton
						variante="ghost"
						size="sm"
						icono="settings"
						on:click={handleEditarProyecto}
					>
						Configurar
					</Boton>
					<Boton
						variante="ghost"
						size="sm"
						icono="arrow-left"
						href="/panel/proyectos"
					>
						Volver
					</Boton>
				</div>
			</div>
		</div>

		<!-- Tablero Kanban -->
		<div class="flex-1 h-[calc(100vh-200px)]">
			<KanbanTablero
				proyecto={$proyectoActual}
				tareas={$tareasProyectoActual}
				cargandoTareas={$cargandoTareas}
				on:moverTarea={handleMoverTarea}
				on:reordenarTareas={handleReordenarTareas}
				on:crearTarea={handleCrearTarea}
				on:editarTarea={handleEditarTarea}
				on:eliminarTarea={handleEliminarTarea}
			/>
		</div>

		<!-- Modal para editar proyecto -->
		{#if mostrarEditarProyecto}
			<FormularioProyecto
				modal={true}
				bind:abierto={mostrarEditarProyecto}
				proyecto={$proyectoActual}
				on:guardar={handleGuardarProyecto}
				on:cancelar={handleCancelarEditarProyecto}
			/>
		{/if}

		<!-- Modal para crear/editar tarea -->
		{#if mostrarFormularioTarea}
			<!-- Aquí iría el formulario de tarea, se puede implementar después -->
			<div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
				<div class="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md">
					<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
						{tareaEditando ? 'Editar Tarea' : 'Nueva Tarea'}
					</h3>
					<p class="text-gray-600 dark:text-gray-400 mb-6">
						Formulario de tarea - Por implementar
					</p>
					<div class="flex items-center justify-end space-x-3">
						<Boton
							variante="ghost"
							on:click={handleCancelarFormularioTarea}
						>
							Cancelar
						</Boton>
						<Boton
							variante="primary"
							on:click={() => {
								// Simulación de guardado
								handleGuardarTarea({
									titulo: 'Tarea de ejemplo',
									descripcion: 'Descripción de ejemplo',
									prioridad: 'media'
								});
							}}
						>
							Guardar
						</Boton>
					</div>
				</div>
			</div>
		{/if}
	{/if}
</div> 