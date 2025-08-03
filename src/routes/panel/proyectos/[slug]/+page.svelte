<script lang="ts">
	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { derived } from 'svelte/store';
	import type { EstadoTarea, Tarea } from '$lib/tipos/app';
	import { 
		proyectoActual, 
		tareas,
		cargarProyectoPorSlug, 
		cargarTareasProyecto,
		crearTarea,
		moverTarea,
		eliminarTarea,
		reordenarTareas,
		cargandoProyecto,
		cargandoTareas
	} from '$lib/stores/proyectos';
	import KanbanTablero from '$lib/componentes/proyectos/KanbanTablero.svelte';
	import FormularioTarea from '$lib/componentes/tareas/FormularioTarea.svelte';
	import FormularioProyecto from '$lib/componentes/proyectos/FormularioProyecto.svelte';
	import Modal from '$lib/componentes/ui/Modal.svelte';
	import Boton from '$lib/componentes/ui/Boton.svelte';
	import Cargando from '$lib/componentes/ui/Cargando.svelte';
	import { ArrowLeft, Settings, Plus } from 'lucide-svelte';

	// Parámetros de la URL - ahora usa slug
	$: proyectoSlug = $page.params.slug;

	// Estados de la página
	let mostrarFormularioTarea = false;
	let mostrarEditarProyecto = false;
	let tareaEditando: Tarea | null = null;
	let estadoTareaNueva: EstadoTarea = 'por-hacer';
	let guardandoTarea = false;
	let moviendoTarea = false; // Nueva variable para controlar drag & drop

	// Store derivado para tareas del proyecto actual
	const tareasProyectoActual = derived(
		[tareas, proyectoActual],
		([$tareas, $proyectoActual]) => {
			if (!$proyectoActual) return [];
			return $tareas.filter((tarea: Tarea) => tarea.proyecto_id === $proyectoActual.id);
		}
	);

	// Cargar datos cuando cambia el slug
	$: if (proyectoSlug && browser) {
		cargarDatosProyecto(proyectoSlug);
	}

	// Función para cargar proyecto y tareas
	const cargarDatosProyecto = async (slug: string) => {
		try {
			await cargarProyectoPorSlug(slug);
			if ($proyectoActual) {
				await cargarTareasProyecto($proyectoActual.id);
			}
		} catch (error) {
			console.error('Error cargando datos del proyecto:', error);
		}
	};

	// Handler SÚPER SIMPLE para mover tareas
	const handleMoverTarea = async (event: CustomEvent<{ tarea: Tarea; nuevoEstado: EstadoTarea; nuevoOrden: number }>) => {
		const { tarea, nuevoEstado, nuevoOrden } = event.detail;
		
		console.log('🎯🎯🎯 HANDLER PÁGINA PRINCIPAL');
		console.log(`📤 Moviendo: "${tarea.titulo}" → ${nuevoEstado}`);
		
		// Llamar al store
		const exito = await moverTarea(tarea.id, nuevoEstado, nuevoOrden);
		
		if (exito) {
			console.log('🎉 ¡ÉXITO TOTAL! Tarea movida');
		} else {
			console.error('❌ Error al mover tarea');
		}
	};

	// Función de debug para verificar elementos DOM
	const verificarElementos = () => {
		console.log('🔍 VERIFICANDO ELEMENTOS DOM...');
		
		const columnas = document.querySelectorAll('[data-estado]');
		console.log(`📊 Columnas encontradas: ${columnas.length}`);
		
		columnas.forEach(columna => {
			const estado = columna.getAttribute('data-estado');
			const tareas = columna.querySelectorAll('[data-id]');
			console.log(`📋 ${estado}: ${tareas.length} tareas`);
			
			tareas.forEach((tarea, index) => {
				const id = tarea.getAttribute('data-id');
				console.log(`  ${index + 1}. ID: ${id}`);
			});
		});
	};

	// Función de debug para forzar recarga
	const forzarRecarga = async () => {
		console.log('🔄 FORZANDO RECARGA...');
		if (proyectoSlug && $proyectoActual) {
			await cargarDatosProyecto(proyectoSlug);
			console.log('✅ Recarga completada');
		}
	};

	// Función para testear movimiento manual
	const testearMovimiento = () => {
		console.log('🧪 TESTEANDO MOVIMIENTO...');
		if ($tareasProyectoActual.length > 0) {
			const tarea = $tareasProyectoActual[0];
			console.log(`🎯 Testeando con: "${tarea.titulo}"`);
			
			// Simular movimiento
			const nuevoEstado = tarea.estado === 'por-hacer' ? 'en-progreso' : 'por-hacer';
			moverTarea(tarea.id, nuevoEstado as EstadoTarea, 0);
		}
	};

	// Exponer funciones para debug desde consola
	if (browser) {
		(window as any).verificarElementos = verificarElementos;
		(window as any).forzarRecarga = forzarRecarga;
		(window as any).testearMovimiento = testearMovimiento;
		(window as any).debugTareas = () => {
			console.log('📊 ESTADO ACTUAL:', {
				proyecto: $proyectoActual,
				tareas: $tareasProyectoActual.map(t => ({
					id: t.id,
					titulo: t.titulo,
					estado: t.estado
				})),
				cargando: $cargandoTareas
			});
		};
	}

	const handleEliminarTarea = async (event: CustomEvent<{ tarea: Tarea }>) => {
		const { tarea } = event.detail;
		await eliminarTarea(tarea.id);
	};

	const handleReordenarTareas = async (event: CustomEvent<{ tareas: { id: string; orden: number }[] }>) => {
		const { tareas } = event.detail;
		await reordenarTareas(tareas);
	};

	// Navegación
	const handleVolver = () => {
		goto('/panel/proyectos');
	};

	const handleEditarProyecto = () => {
		mostrarEditarProyecto = true;
	};

	const handleNuevaTarea = (estado: EstadoTarea = 'por-hacer') => {
		estadoTareaNueva = estado;
		tareaEditando = null;
		mostrarFormularioTarea = true;
	};

	const handleCancelarTarea = () => {
		mostrarFormularioTarea = false;
		tareaEditando = null;
		guardandoTarea = false;
	};

	// 🔥 NUEVA FUNCIÓN PARA EDITAR TAREA CON DOBLE CLIC
	const handleEditarTarea = (event: CustomEvent<{ tarea: Tarea }>) => {
		console.log('✏️ EDITANDO TAREA:', event.detail.tarea);
		tareaEditando = event.detail.tarea;
		estadoTareaNueva = event.detail.tarea.estado;
		mostrarFormularioTarea = true;
	};

	// Handler para crear/editar tarea
	const handleCrearTarea = async (event: CustomEvent<{ tarea: Partial<Tarea> }>) => {
		if (guardandoTarea) return;
		
		try {
			guardandoTarea = true;
			const { tarea } = event.detail;
			
			if (!$proyectoActual) {
				throw new Error('No hay proyecto seleccionado');
			}

			// Asegurar que la tarea tenga el proyecto_id
			const tareaConProyecto = {
				...tarea,
				proyecto_id: $proyectoActual.id,
				negocio_id: null // Las tareas de proyecto no tienen negocio_id
			};

			const nuevaTarea = await crearTarea(tareaConProyecto);
			
			if (nuevaTarea) {
				mostrarFormularioTarea = false;
				tareaEditando = null;
				// Recargar tareas del proyecto
				await cargarTareasProyecto($proyectoActual.id);
			}
		} catch (error) {
			console.error('Error creando tarea:', error);
		} finally {
			guardandoTarea = false;
		}
	};
</script>

<svelte:head>
	<title>{$proyectoActual?.nombre || 'Proyecto'} - App Contabilidad</title>
	<script>
		// Debug temporal
		console.log('🟢 PÁGINA CARGADA - Debug activo');
		
		// Interceptar todos los eventos personalizados
		window.addEventListener('*', function(e) {
			if (e.type.includes('tarea')) {
				console.log('📢 EVENTO DETECTADO:', e.type, e);
			}
		});
		
		// Debug para ver si los elementos están correctos
		setTimeout(() => {
			const kanbanColumns = document.querySelectorAll('[data-estado]');
			console.log('🏛️ COLUMNAS ENCONTRADAS:', kanbanColumns.length);
			kanbanColumns.forEach((col, i) => {
				const estado = col.getAttribute('data-estado');
				const tareas = col.querySelectorAll('[data-tarea-id]');
				console.log(`📋 Columna ${i+1} (${estado}):`, tareas.length, 'tareas');
			});
		}, 1000);
	</script>
</svelte:head>

{#if $cargandoProyecto}
	<div class="flex items-center justify-center min-h-96">
		<Cargando texto="Cargando proyecto..." />
	</div>
{:else if !$proyectoActual}
	<div class="text-center py-12 px-4">
		<h2 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4">
			Proyecto no encontrado
		</h2>
		<p class="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
			El proyecto que buscas no existe o no tienes acceso a él.
		</p>
		<Boton on:click={handleVolver}>
			<ArrowLeft class="w-4 h-4 mr-2" />
			Volver a Proyectos
		</Boton>
	</div>
{:else}
	<!-- Contenedor principal responsivo -->
	<div class="w-full max-w-full overflow-hidden space-y-4 sm:space-y-6">
		
		<!-- Header del proyecto optimizado para móvil -->
		<div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 border border-gray-200/50 dark:border-gray-700/50">
			<div class="flex flex-col gap-4">
				<!-- Fila superior: navegación y acciones -->
				<div class="flex items-start justify-between gap-3">
					<div class="flex items-center gap-3 min-w-0 flex-1">
						<Boton 
							variante="ghost" 
							tamaño="sm"
							on:click={handleVolver}
							class="hover:bg-gray-100 dark:hover:bg-gray-700 flex-shrink-0"
						>
							<ArrowLeft class="w-4 h-4" />
							<span class="hidden sm:inline ml-1">Volver</span>
						</Boton>
						
						<div class="min-w-0 flex-1">
							<h1 class="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white truncate">
								{$proyectoActual.nombre}
							</h1>
							{#if $proyectoActual.descripcion}
								<p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
									{$proyectoActual.descripcion}
								</p>
							{/if}
						</div>
					</div>
					
					<div class="flex items-center gap-2 flex-shrink-0">
						<Boton 
							variante="secondary" 
							tamaño="sm"
							on:click={handleEditarProyecto}
							class="hidden sm:flex"
						>
							<Settings class="w-4 h-4 mr-1" />
							Editar
						</Boton>
						<Boton 
							variante="primary"
							tamaño="sm"
							on:click={() => handleNuevaTarea()}
						>
							<Plus class="w-4 h-4" />
							<span class="hidden sm:inline ml-1">Nueva Tarea</span>
						</Boton>
						
						<!-- Botón de editar para móvil -->
						<Boton 
							variante="ghost" 
							tamaño="sm"
							on:click={handleEditarProyecto}
							class="sm:hidden"
						>
							<Settings class="w-4 h-4" />
						</Boton>
					</div>
				</div>

				<!-- Información del proyecto en grid responsivo -->
				<div class="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
					<div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2 sm:p-3 min-w-0">
						<div class="text-xs text-gray-600 dark:text-gray-400 truncate">Estado</div>
						<div class="font-medium text-gray-900 dark:text-white capitalize text-sm truncate">
							{$proyectoActual.estado}
						</div>
					</div>
					<div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2 sm:p-3 min-w-0">
						<div class="text-xs text-gray-600 dark:text-gray-400 truncate">Progreso</div>
						<div class="font-medium text-gray-900 dark:text-white text-sm">
							{$proyectoActual.progreso}%
						</div>
					</div>
					<div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2 sm:p-3 min-w-0">
						<div class="text-xs text-gray-600 dark:text-gray-400 truncate">Inicio</div>
						<div class="font-medium text-gray-900 dark:text-white text-xs sm:text-sm truncate">
							{new Date($proyectoActual.fecha_inicio).toLocaleDateString('es-ES', { 
								day: '2-digit', 
								month: 'short' 
							})}
						</div>
					</div>
					<div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2 sm:p-3 min-w-0">
						<div class="text-xs text-gray-600 dark:text-gray-400 truncate">Límite</div>
						<div class="font-medium text-gray-900 dark:text-white text-xs sm:text-sm truncate">
							{$proyectoActual.fecha_limite 
								? new Date($proyectoActual.fecha_limite).toLocaleDateString('es-ES', { 
									day: '2-digit', 
									month: 'short' 
								})
								: 'Sin límite'
							}
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Tablero Kanban responsivo -->
		<div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
			<!-- Header del tablero -->
			<div class="p-3 sm:p-4 lg:p-6 border-b border-gray-200/50 dark:border-gray-700/50">
				<div class="flex items-center justify-between">
					<h2 class="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 dark:text-white">
						Tareas del Proyecto
					</h2>
					<div class="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
						{$tareasProyectoActual.length} tareas
					</div>
				</div>
			</div>

			<!-- Contenido del tablero -->
			<div class="min-h-0 flex-1">
				{#if $cargandoTareas}
					<div class="flex items-center justify-center py-12">
						<Cargando texto="Cargando tareas..." />
					</div>
				{:else}
					<KanbanTablero
						tareas={$tareasProyectoActual}
						proyecto={$proyectoActual}
						cargandoTareas={$cargandoTareas}
						on:tarea-movida={handleMoverTarea}
						on:eliminar-tarea={handleEliminarTarea}
						on:tareas-reordenadas={handleReordenarTareas}
						on:crear-tarea={(e) => handleNuevaTarea(e.detail.estado)}
						on:editar-tarea={handleEditarTarea}
					/>
				{/if}
			</div>
		</div>
	</div>
{/if}

<!-- Modal para editar proyecto -->
<Modal bind:abierto={mostrarEditarProyecto} titulo="Editar Proyecto" tamaño="lg">
	{#if $proyectoActual}
		<FormularioProyecto
			proyecto={$proyectoActual}
			on:proyecto-guardado={() => {
				mostrarEditarProyecto = false;
				// Recargar datos del proyecto
				if (proyectoSlug) {
					cargarDatosProyecto(proyectoSlug);
				}
			}}
			on:cancelar={() => mostrarEditarProyecto = false}
		/>
	{/if}
</Modal>

<!-- Modal para nueva/editar tarea -->
<Modal bind:abierto={mostrarFormularioTarea} titulo={tareaEditando ? 'Editar Tarea' : 'Nueva Tarea'} tamaño="lg">
	<FormularioTarea
		tarea={tareaEditando}
		proyecto={$proyectoActual}
		estadoInicial={estadoTareaNueva}
		guardando={guardandoTarea}
		on:tarea-guardada={handleCrearTarea}
		on:cancelar={handleCancelarTarea}
	/>
</Modal> 