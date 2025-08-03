<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { flip } from 'svelte/animate';
	import { dndzone, TRIGGERS } from 'svelte-dnd-action';
	import type { Tarea, EstadoTarea } from '$lib/tipos/app';
	import { ESTADOS_TAREA } from '$lib/tipos/app';
	import TarjetaTarea from './TarjetaTarea.svelte';

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

	// CLAVE: Crear copias completamente independientes para cada columna
	$: itemsLocales = tareas.map((tarea, index) => ({
		id: tarea.id, // ID real de la tarea
		tareaOriginal: tarea, // Referencia a la tarea original
		orden: index
	}));

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

	// Variable para manejar el estado durante drag
	let items = itemsLocales;
	
	// Actualizar items cuando cambien las tareas
	$: {
		items = itemsLocales;
	}

	// Handlers de DND - SIMPLIFICADOS
	function handleConsider(e: CustomEvent) {
		const { items: newItems } = e.detail;
		items = newItems;
	}

	function handleFinalize(e: CustomEvent) {
		const { items: finalItems, info } = e.detail;
		
		console.log(`🎯 Finalize en ${estado}:`, {
			trigger: info.trigger,
			id: info.id,
			source: info.source
		});

		// Solo procesar si es un drop real de usuario
		if (info.trigger === TRIGGERS.DROPPED_INTO_ZONE) {
			const itemDropeado = finalItems.find((item: any) => item.id === info.id);
			
			if (itemDropeado && itemDropeado.tareaOriginal) {
				const nuevoOrden = finalItems.findIndex((item: any) => item.id === info.id);
				
				console.log(`🚀 Moviendo tarea "${itemDropeado.tareaOriginal.titulo}" a ${estado}`);
				
				// Disparar evento
				dispatch('tarea-movida', {
					tarea: itemDropeado.tareaOriginal,
					nuevoEstado: estado,
					nuevoOrden
				});
			}
		}
		
		// Actualizar items locales
		items = finalItems;
	}

	// Handlers de tareas
	function handleCrearTarea() {
		dispatch('crear-tarea', { estado });
	}

	function handleEditarTarea(event: CustomEvent) {
		dispatch('editar-tarea', event.detail);
	}

	function handleEliminarTarea(event: CustomEvent) {
		dispatch('eliminar-tarea', event.detail);
	}
</script>

<!-- Columna Kanban SIMPLE -->
<div 
	class="flex flex-col h-full min-w-80 max-w-80 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700"
	data-estado={estado}
>
	<!-- Header -->
	<div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
		<div class="flex items-center space-x-3">
			{#if color}
				<div class="w-3 h-3 rounded-full" style="background-color: {color}"></div>
			{/if}
			<div>
				<h3 class="font-semibold {clasesHeader}">{tituloFinal}</h3>
				<p class="text-xs text-gray-500 dark:text-gray-400">
					{cantidadTareas} {cantidadTareas === 1 ? 'tarea' : 'tareas'}
				</p>
			</div>
		</div>
		<button
			class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
			on:click={handleCrearTarea}
		>
			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
			</svg>
		</button>
	</div>

	<!-- Drop Zone -->
	<div 
		class="flex-1 p-4 {clasesColor} min-h-32 overflow-y-auto"
		data-drop-zone={estado}
		use:dndzone={{
			items,
			flipDurationMs: 300,
			type: 'tarea',
			dragDisabled: false,
			morphDisabled: false
		}}
		on:consider={handleConsider}
		on:finalize={handleFinalize}
	>
		{#if items.length === 0}
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
			<!-- Task list -->
			<div class="space-y-3">
				{#each items as item (item.id)}
					<div animate:flip={{ duration: 300 }}>
						<TarjetaTarea
							tarea={item.tareaOriginal}
							draggable={true}
							on:editar={handleEditarTarea}
							on:eliminar={handleEliminarTarea}
						/>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div> 