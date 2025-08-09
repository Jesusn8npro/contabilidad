<script lang="ts">
	import { createEventDispatcher, onMount, onDestroy } from 'svelte';
	import type { Tarea, EstadoTarea } from '$lib/tipos/app';
	import { ESTADOS_TAREA } from '$lib/tipos/app';
	import TarjetaTarea from './TarjetaTarea.svelte';
	import Sortable from 'sortablejs';

	// Props
	export let estado: EstadoTarea;
	export let tareas: Tarea[] = [];
	export let titulo: string = '';
	export let color: string = '';

	// Event dispatcher
	const dispatch = createEventDispatcher<{
		'tarea-movida': { tarea: Tarea; nuevoEstado: EstadoTarea; nuevoOrden: number };
		'crear-tarea': { estado: EstadoTarea };
		'editar-tarea': { tarea: Tarea };
		'eliminar-tarea': { tarea: Tarea };
	}>();

	// Datos derivados
	$: estadoInfo = ESTADOS_TAREA[estado];
	$: tituloFinal = titulo || estadoInfo.label;
	$: cantidadTareas = tareas.length;

	// Clases de color por estado
	$: clasesColor = {
		'por-hacer': 'bg-gray-50 dark:bg-gray-800',
		'en-progreso': 'bg-blue-50 dark:bg-blue-900/20',
		'en-revision': 'bg-yellow-50 dark:bg-yellow-900/20',
		'completada': 'bg-green-50 dark:bg-green-900/20',
		'pausada': 'bg-red-50 dark:bg-red-900/20'
	}[estado];

	// Clases para header
	$: clasesHeader = {
		'por-hacer': 'text-gray-700 dark:text-gray-300',
		'en-progreso': 'text-blue-700 dark:text-blue-300',
		'en-revision': 'text-yellow-700 dark:text-yellow-300',
		'completada': 'text-green-700 dark:text-green-300',
		'pausada': 'text-red-700 dark:text-red-300'
	}[estado];

	// Elemento del contenedor de tareas
	let contenedorTareas: HTMLElement;
	let sortableInstance: Sortable | null = null;

	// Función para reproducir sonido de éxito
	const reproducirSonidoExito = () => {
		try {
			// Crear sonido usando Web Audio API
			const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
			const oscillator = audioContext.createOscillator();
			const gainNode = audioContext.createGain();
			
			oscillator.connect(gainNode);
			gainNode.connect(audioContext.destination);
			
			oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
			oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1);
			oscillator.frequency.setValueAtTime(1200, audioContext.currentTime + 0.2);
			
			gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
			gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
			
			oscillator.start(audioContext.currentTime);
			oscillator.stop(audioContext.currentTime + 0.3);
		} catch (error) {
			console.log('🔇 Audio no disponible');
		}
	};

	// Inicializar SortableJS
	onMount(() => {
		if (contenedorTareas) {
			console.log(`🚀 INICIALIZANDO SORTABLE PARA: ${estado}`);
			
			sortableInstance = new Sortable(contenedorTareas, {
				group: 'kanban-tareas',
				animation: 200,
				ghostClass: 'sortable-ghost',
				chosenClass: 'sortable-chosen',
				dragClass: 'sortable-drag',
				forceFallback: true,
				
				onEnd: (evt) => {
					console.log('🎯🎯🎯 SORTABLE onEnd - VERSIÓN BRUTAL');
					console.log('📋 evt:', evt);
					
					const elementoArrastrado = evt.item;
					const tareaId = elementoArrastrado.getAttribute('data-id');
					const contenedorDestino = evt.to;
					const estadoDestino = contenedorDestino.getAttribute('data-estado') as EstadoTarea;
					const nuevoIndex = evt.newIndex || 0;
					
					console.log('🎯 DATOS:', {
						tareaId,
						estadoDestino,
						nuevoIndex,
						from: evt.from.getAttribute('data-estado'),
						to: estadoDestino
					});
					
					if (!tareaId) {
						console.error('❌ NO HAY TAREA ID');
						return;
					}
					
					if (!estadoDestino) {
						console.error('❌ NO HAY ESTADO DESTINO');
						return;
					}
					
					// Buscar la tarea
					const tarea = tareas.find(t => t.id === tareaId);
					if (!tarea) {
						console.error('❌ TAREA NO ENCONTRADA');
						return;
					}
					
					console.log(`🚀 MOVIENDO: "${tarea.titulo}" → ${estadoDestino}`);
					
					// Reproducir sonido de éxito
					reproducirSonidoExito();
					
					// Disparar evento
					dispatch('tarea-movida', {
						tarea,
						nuevoEstado: estadoDestino,
						nuevoOrden: nuevoIndex
					});
				}
			});
		}
	});

	// Cleanup
	onDestroy(() => {
		if (sortableInstance) {
			sortableInstance.destroy();
		}
	});

	// Handlers
	const handleCrearTarea = () => {
		dispatch('crear-tarea', { estado });
	};

	const handleEditarTarea = (event: any) => {
		dispatch('editar-tarea', event.detail);
	};

	const handleEliminarTarea = (event: any) => {
		dispatch('eliminar-tarea', event.detail);
	};

	// NUEVO: Handler para cambiar estado
	const handleCambiarEstado = (event: any) => {
		dispatch('tarea-movida', {
			tarea: event.detail.tarea,
			nuevoEstado: event.detail.estado,
			nuevoOrden: event.detail.tarea.orden || 0
		});
	};
</script>

<!-- Columna Kanban -->
<div class="flex flex-col h-full w-full min-w-0 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
	<!-- Header -->
	<div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
		<div class="flex items-center space-x-3 min-w-0">
			{#if color}
				<div class="w-3 h-3 rounded-full flex-shrink-0" style="background-color: {color}"></div>
			{/if}
			<div class="min-w-0">
				<h3 class="font-semibold {clasesHeader} truncate">{tituloFinal}</h3>
				<p class="text-xs text-gray-500 dark:text-gray-400">
					{cantidadTareas} {cantidadTareas === 1 ? 'tarea' : 'tareas'}
				</p>
			</div>
		</div>
		<button
			class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
			on:click={handleCrearTarea}
		>
			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
			</svg>
		</button>
	</div>

	<!-- Contenedor de tareas sortable -->
	<div 
		class="flex-1 p-4 {clasesColor} min-h-32 overflow-y-auto min-w-0"
		bind:this={contenedorTareas}
		data-estado={estado}
	>
		{#if tareas.length === 0}
			<!-- Empty state -->
			<div class="text-center py-8">
				<p class="text-sm text-gray-500 dark:text-gray-400 mb-3">
					No hay tareas {estadoInfo.label.toLowerCase()}
				</p>
				<button
					class="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
					on:click={handleCrearTarea}
				>
					<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
					</svg>
					Agregar tarea
				</button>
			</div>
		{:else}
			<!-- Lista de tareas - VERSIÓN SIMPLE Y DIRECTA -->
			{#each tareas as tarea (tarea.id)}
				<div
					class="task-item p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm cursor-move hover:shadow-md transition-shadow"
					data-id={tarea.id}
				>
					<TarjetaTarea
						{tarea}
						draggable={false}
						on:editar={handleEditarTarea}
						on:eliminar={handleEliminarTarea}
						on:cambiarEstado={handleCambiarEstado}
					/>
				</div>
			{/each}
		{/if}
	</div>
</div>

<style>
	:global(.sortable-ghost) {
		opacity: 0.3 !important;
		background: #e5e7eb !important;
		border-radius: 8px !important;
		transform: rotate(2deg) !important;
	}

	:global(.sortable-chosen) {
		opacity: 0.9 !important;
		transform: scale(1.02) !important;
		box-shadow: 0 15px 35px -5px rgba(0, 0, 0, 0.4) !important;
		z-index: 1000 !important;
		cursor: grabbing !important;
	}

	:global(.sortable-drag) {
		opacity: 0.8 !important;
		transform: rotate(3deg) scale(1.05) !important;
		transition: none !important;
		cursor: grabbing !important;
	}

	.tarea-item {
		transition: all 0.2s ease;
	}

	.tarea-item:hover {
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}

	/* Asegurar ancho uniforme y prevenir overflow */
	div {
		word-wrap: break-word;
		overflow-wrap: break-word;
	}

	/* Títulos truncados si son muy largos */
	h3 {
		max-width: 100%;
	}
</style> 