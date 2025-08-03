<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { flip } from 'svelte/animate';
	import { dndzone } from 'svelte-dnd-action';
	import type { Tarea, EstadoTarea } from '$lib/tipos/app';
	import { ESTADOS_TAREA } from '$lib/tipos/app';
	import TarjetaTarea from './TarjetaTarea.svelte';
	import Boton from '$lib/componentes/ui/Boton.svelte';

	// Props
	export let estado: EstadoTarea;
	export let tareas: Tarea[] = [];
	export let titulo: string = '';
	export let color: string = '';
	export let maxItems: number | null = null;

	// Event dispatcher
	const dispatch = createEventDispatcher<{
		consider: { items: Tarea[]; info: any };
		finalize: { items: Tarea[]; info: any };
		crearTarea: { estado: EstadoTarea };
		editarTarea: { tarea: Tarea };
		eliminarTarea: { tarea: Tarea };
	}>();

	// Configuración DND
	const flipDurationMs = 300;
	let dragDisabled = false;

	// Datos derivados
	$: estadoInfo = ESTADOS_TAREA[estado];
	$: tituloFinal = titulo || estadoInfo.label;
	$: cantidadTareas = tareas.length;
	$: estaLlena = maxItems !== null && cantidadTareas >= maxItems;

	// Clases de color por estado
	$: clasesColor = {
		'por-hacer': 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700',
		'en-progreso': 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
		'en-revision': 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
		'completada': 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
		'pausada': 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
	}[estado];

	// Clases para header
	$: clasesHeader = {
		'por-hacer': 'text-gray-700 dark:text-gray-300',
		'en-progreso': 'text-blue-700 dark:text-blue-300',
		'en-revision': 'text-yellow-700 dark:text-yellow-300',
		'completada': 'text-green-700 dark:text-green-300',
		'pausada': 'text-red-700 dark:text-red-300'
	}[estado];

	// Handlers de DND
	const handleDndConsider = (e: CustomEvent) => {
		const { items, info } = e.detail;
		dispatch('consider', { items, info });
	};

	const handleDndFinalize = (e: CustomEvent) => {
		const { items, info } = e.detail;
		dragDisabled = false;
		dispatch('finalize', { items, info });
	};

	// Handlers de tareas
	const handleCrearTarea = () => {
		dispatch('crearTarea', { estado });
	};

	const handleEditarTarea = (event: CustomEvent<{ tarea: Tarea }>) => {
		dispatch('editarTarea', event.detail);
	};

	const handleEliminarTarea = (event: CustomEvent<{ tarea: Tarea }>) => {
		dispatch('eliminarTarea', event.detail);
	};

	// Transformar tareas para DND (agregar id único si no existe)
	$: tareasConId = tareas.map(tarea => ({
		...tarea,
		id: tarea.id || `temp-${Math.random()}` // Fallback por si acaso
	}));
</script>

<!-- Columna Kanban -->
<div class="flex flex-col h-full min-w-80 max-w-80">
	<!-- Header de la columna -->
	<div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-t-xl">
		<div class="flex items-center space-x-3">
			<!-- Indicador de color -->
			{#if color}
				<div class="w-3 h-3 rounded-full" style="background-color: {color}"></div>
			{/if}
			
			<div>
				<h3 class="font-semibold {clasesHeader}">
					{tituloFinal}
				</h3>
				<p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
					{cantidadTareas} {cantidadTareas === 1 ? 'tarea' : 'tareas'}
					{#if maxItems !== null}
						/ {maxItems} máx
					{/if}
				</p>
			</div>
		</div>

		<!-- Botón agregar tarea -->
		<button
			class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors {
				estaLlena ? 'opacity-50 cursor-not-allowed' : ''
			}"
			on:click={handleCrearTarea}
			disabled={estaLlena}
			title="Agregar nueva tarea"
		>
			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
			</svg>
		</button>
	</div>

	<!-- Área de drop para tareas -->
	<div 
		class="flex-1 p-4 overflow-y-auto custom-scrollbar {clasesColor} rounded-b-xl"
		use:dndzone={{ 
			items: tareasConId, 
			flipDurationMs,
			dragDisabled,
			dropTargetStyle: {},
			morphDisabled: true,
			type: 'tarea'
		}}
		on:consider={handleDndConsider}
		on:finalize={handleDndFinalize}
	>
		{#if tareasConId.length === 0}
			<!-- Estado vacío -->
			<div class="text-center py-8">
				<div class="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3 opacity-50">
					<svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
					</svg>
				</div>
				<p class="text-sm text-gray-500 dark:text-gray-400 mb-3">
					No hay tareas {estadoInfo.label.toLowerCase()}
				</p>
				<Boton
					variante="ghost"
					size="sm"
					icono="plus"
					on:click={handleCrearTarea}
					disabled={estaLlena}
				>
					Agregar tarea
				</Boton>
			</div>
		{:else}
			<!-- Lista de tareas -->
			<div class="space-y-3">
				{#each tareasConId as tarea (tarea.id)}
					<div animate:flip={{ duration: flipDurationMs }}>
						<TarjetaTarea
							{tarea}
							draggable={true}
							isDragging={dragDisabled}
							on:editar={handleEditarTarea}
							on:eliminar={handleEliminarTarea}
						/>
					</div>
				{/each}
			</div>
		{/if}

		<!-- Indicador visual de drop zone activa -->
		<div class="mt-4 border-2 border-dashed border-transparent rounded-lg p-4 transition-colors drop-target-highlight">
			<div class="text-center text-sm text-gray-400 dark:text-gray-500">
				Arrastra tareas aquí
			</div>
		</div>
	</div>
</div>

<style>
	/* Scrollbar personalizado */
	.custom-scrollbar {
		scrollbar-width: thin;
		scrollbar-color: rgb(156 163 175) transparent;
	}

	.custom-scrollbar::-webkit-scrollbar {
		width: 6px;
	}

	.custom-scrollbar::-webkit-scrollbar-track {
		background: transparent;
	}

	.custom-scrollbar::-webkit-scrollbar-thumb {
		background-color: rgb(156 163 175);
		border-radius: 3px;
	}

	.custom-scrollbar::-webkit-scrollbar-thumb:hover {
		background-color: rgb(107 114 128);
	}

	/* Estilos para DND */
	:global(.drop-target-highlight) {
		border-color: rgb(59 130 246) !important;
		background-color: rgb(59 130 246 / 0.05) !important;
	}

	/* Estilo para elementos siendo arrastrados */
	:global(.dnd-dragging) {
		opacity: 0.8;
		transform: rotate(3deg) scale(1.02);
		box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.2);
		z-index: 1000;
	}
</style> 