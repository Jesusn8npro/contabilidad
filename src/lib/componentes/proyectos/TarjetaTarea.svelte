<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { Tarea } from '$lib/tipos/app';
	import { ESTADOS_TAREA, PRIORIDADES_TAREA } from '$lib/tipos/app';
	import { formatearFechaRelativa } from '$lib/utils/formato-fecha';

	// Props
	export let tarea: Tarea;
	export let draggable = true;
	export let compacta = false;
	export let isDragging = false;

	// Event dispatcher
	const dispatch = createEventDispatcher<{
		click: { tarea: Tarea };
		editar: { tarea: Tarea };
		eliminar: { tarea: Tarea };
		cambiarPrioridad: { tarea: Tarea; prioridad: string };
		dobleClic: { tarea: Tarea }; // 🔥 NUEVO EVENTO DE DOBLE CLIC
	}>();

	// Variables para doble clic
	let clicTimeout: NodeJS.Timeout;
	let clicCount = 0;

	// Datos derivados
	$: estadoInfo = ESTADOS_TAREA[tarea.estado];
	$: prioridadInfo = PRIORIDADES_TAREA[tarea.prioridad];
	$: esFechaLimiteProxima = tarea.fecha_limite ? 
		new Date(tarea.fecha_limite).getTime() - Date.now() < 3 * 24 * 60 * 60 * 1000 : false;
	$: esFechaLimiteVencida = tarea.fecha_limite ? 
		new Date(tarea.fecha_limite).getTime() < Date.now() : false;

	// Clases dinámicas para prioridad
	$: clasesPrioridad = {
		'baja': 'border-l-gray-400',
		'media': 'border-l-blue-400', 
		'alta': 'border-l-orange-400',
		'urgente': 'border-l-red-400'
	};
	
	$: claseActualPrioridad = clasesPrioridad[tarea.prioridad as keyof typeof clasesPrioridad] || 'border-l-gray-400';

	// Handlers
	const handleClick = () => {
		if (!isDragging) {
			clicCount++;
			
			// Si es el primer clic, esperar por un segundo clic
			if (clicCount === 1) {
				clicTimeout = setTimeout(() => {
					// Solo fue un clic simple
					dispatch('click', { tarea });
					clicCount = 0;
				}, 300); // Esperar 300ms para detectar doble clic
			} else if (clicCount === 2) {
				// Es doble clic
				clearTimeout(clicTimeout);
				dispatch('dobleClic', { tarea });
				dispatch('editar', { tarea }); // 🔥 ABRIR EDITOR EN DOBLE CLIC
				clicCount = 0;
			}
		}
	};

	const handleEditar = (e: Event) => {
		e.stopPropagation();
		dispatch('editar', { tarea });
	};

	const handleEliminar = (e: Event) => {
		e.stopPropagation();
		dispatch('eliminar', { tarea });
	};
</script>

<!-- Tarjeta de Tarea Draggable -->
<div
	class="relative bg-white dark:bg-gray-800 rounded-lg border-l-4 {claseActualPrioridad} shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer {isDragging ? 'opacity-50 scale-105 rotate-2 z-50' : ''} {draggable ? 'hover:scale-[1.02]' : ''}"
	class:border-red-500={esFechaLimiteVencida}
	class:border-orange-400={esFechaLimiteProxima && !esFechaLimiteVencida}
	{draggable}
	on:click={handleClick}
	on:keydown={(e) => e.key === 'Enter' && handleClick()}
	role="button"
	tabindex="0"
	data-tarea-id={tarea.id}
>
	<!-- Contenido de la tarjeta -->
	<div class="p-4">
		<!-- Header con título y acciones -->
		<div class="flex items-start justify-between mb-3">
			<h4 class="font-medium text-gray-900 dark:text-white text-sm leading-tight {compacta ? 'line-clamp-1' : 'line-clamp-2'}">
				{tarea.titulo}
			</h4>
			
			<!-- Menú de acciones -->
			<div class="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2 flex-shrink-0">
				<button
					class="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded transition-colors"
					on:click={handleEditar}
					title="Editar tarea"
					type="button"
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
					</svg>
				</button>
				<button
					class="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded transition-colors"
					on:click={handleEliminar}
					title="Eliminar tarea"
					type="button"
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
					</svg>
				</button>
			</div>
		</div>

		<!-- Descripción -->
		{#if tarea.descripcion && !compacta}
			<p class="text-gray-600 dark:text-gray-400 text-xs mb-3 line-clamp-2">
				{tarea.descripcion}
			</p>
		{/if}

		<!-- Etiquetas -->
		{#if tarea.etiquetas && tarea.etiquetas.length > 0 && !compacta}
			<div class="flex flex-wrap gap-1 mb-3">
				{#each tarea.etiquetas.slice(0, 3) as etiqueta}
					<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
						{etiqueta}
					</span>
				{/each}
				{#if tarea.etiquetas.length > 3}
					<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-600 dark:bg-gray-600 dark:text-gray-400">
						+{tarea.etiquetas.length - 3}
					</span>
				{/if}
			</div>
		{/if}

		<!-- Footer con metadata -->
		<div class="flex items-center justify-between text-xs">
			<!-- Información de tiempo -->
			<div class="flex items-center space-x-3">
				<!-- Prioridad -->
				<div class="flex items-center space-x-1">
					<div class="w-2 h-2 rounded-full {prioridadInfo.color}"></div>
					<span class="text-gray-500 dark:text-gray-400 capitalize">{prioridadInfo.label}</span>
				</div>

				<!-- Fecha límite -->
				{#if tarea.fecha_limite}
					<div class="flex items-center space-x-1" class:text-red-600={esFechaLimiteVencida} class:text-orange-600={esFechaLimiteProxima && !esFechaLimiteVencida}>
						<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
						</svg>
						<span>{formatearFechaRelativa(tarea.fecha_limite)}</span>
					</div>
				{/if}
			</div>

			<!-- Estado -->
			<div class="flex items-center space-x-1">
				<div class="w-2 h-2 rounded-full {estadoInfo.color}"></div>
				<span class="text-gray-500 dark:text-gray-400">{estadoInfo.label}</span>
			</div>
		</div>
	</div>

	<!-- Indicador de drag & drop -->
	{#if isDragging}
		<div class="absolute inset-0 bg-blue-500 bg-opacity-20 rounded-lg border-2 border-blue-500 border-dashed"></div>
	{/if}
</div>

<style>
	/* Mejorar el comportamiento de drag & drop */
	[draggable="true"] {
		user-select: none;
		-webkit-user-select: none;
		-moz-user-select: none;
		-ms-user-select: none;
	}
	
	[draggable="true"]:hover {
		cursor: grab;
	}
	
	[draggable="true"]:active {
		cursor: grabbing;
	}
	
	/* Animación durante el drag */
	.is-dragging {
		opacity: 0.8;
		transform: rotate(3deg) scale(1.05);
		box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
		z-index: 1000;
	}
</style> 