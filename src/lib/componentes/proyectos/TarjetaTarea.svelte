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
	}>();

	// Datos derivados
	$: estadoInfo = ESTADOS_TAREA[tarea.estado];
	$: prioridadInfo = PRIORIDADES_TAREA[tarea.prioridad];
	$: esFechaLimiteProxima = tarea.fecha_limite ? 
		new Date(tarea.fecha_limite).getTime() - Date.now() < 3 * 24 * 60 * 60 * 1000 : false;
	$: esFechaLimiteVencida = tarea.fecha_limite ? 
		new Date(tarea.fecha_limite).getTime() < Date.now() : false;

	// Handlers
	const handleClick = () => {
		if (!isDragging) {
			dispatch('click', { tarea });
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

	// Clases dinámicas para prioridad
	$: clasesPrioridad = {
		'baja': 'border-l-gray-400',
		'media': 'border-l-blue-400', 
		'alta': 'border-l-orange-400',
		'urgente': 'border-l-red-400'
	}[tarea.prioridad];

	// Clases para fecha límite
	$: clasesFechaLimite = esFechaLimiteVencida 
		? 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20' 
		: esFechaLimiteProxima 
		? 'text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-900/20'
		: 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-800';
</script>

<!-- Tarjeta de tarea -->
<div
	class="group relative bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200 {
		isDragging ? 'opacity-50 shadow-lg scale-105 rotate-3' : ''
	} {
		compacta ? 'p-3' : 'p-4'
	} {
		draggable ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'
	} border-l-4 {clasesPrioridad}"
	on:click={handleClick}
	on:keydown={(e) => e.key === 'Enter' && handleClick()}
	role="button"
	tabindex="0"
>
	<!-- Header de la tarea -->
	<div class="flex items-start justify-between mb-3">
		<div class="flex-1 min-w-0">
			<h4 class="font-medium text-gray-900 dark:text-white {
				compacta ? 'text-sm' : 'text-base'
			} line-clamp-2 mb-1">
				{tarea.titulo}
			</h4>
			
			{#if !compacta && tarea.descripcion}
				<p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
					{tarea.descripcion}
				</p>
			{/if}
		</div>

		<!-- Menú de acciones -->
		<div class="opacity-0 group-hover:opacity-100 transition-opacity ml-2">
			<button
				class="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
				on:click={handleEditar}
				title="Editar tarea"
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
				</svg>
			</button>
			<button
				class="p-1 text-gray-400 hover:text-red-500 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors ml-1"
				on:click={handleEliminar}
				title="Eliminar tarea"
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
				</svg>
			</button>
		</div>
	</div>

	<!-- Badges y metadata -->
	<div class="flex flex-wrap items-center gap-2 mb-3">
		<!-- Badge de prioridad -->
		<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium {
			tarea.prioridad === 'urgente' 
				? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
				: tarea.prioridad === 'alta'
				? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
				: tarea.prioridad === 'media'
				? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
				: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
		}">
			{prioridadInfo.label}
		</span>

		<!-- Badge de fecha límite -->
		{#if tarea.fecha_limite}
			<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium {clasesFechaLimite}">
				<svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
				</svg>
				{new Date(tarea.fecha_limite).toLocaleDateString('es-ES', { 
					day: '2-digit', 
					month: 'short' 
				})}
			</span>
		{/if}
	</div>

	<!-- Footer con metadata adicional -->
	{#if !compacta}
		<div class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-700">
			<div class="flex items-center space-x-3">
				<!-- Asignado a (si existe) -->
				{#if tarea.asignado_a}
					<div class="flex items-center space-x-1">
						<div class="w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
							{tarea.asignado_a.charAt(0).toUpperCase()}
						</div>
						<span class="truncate max-w-20">{tarea.asignado_a}</span>
					</div>
				{/if}

				<!-- Comentarios/adjuntos (placeholder) -->
				<div class="flex items-center space-x-2">
					<div class="flex items-center space-x-1">
						<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.959 8.959 0 01-4.906-1.44L3 21l2.44-5.094A8.959 8.959 0 013 12a8 8 0 018-8c4.418 0 8 3.582 8 8z" />
						</svg>
						<span>0</span>
					</div>
					<div class="flex items-center space-x-1">
						<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
						</svg>
						<span>0</span>
					</div>
				</div>
			</div>

			<!-- Fecha de creación -->
			<span class="text-right">
				{formatearFechaRelativa(tarea.fecha_creacion)}
			</span>
		</div>
	{/if}

	<!-- Indicador de estado para drag & drop -->
	{#if isDragging}
		<div class="absolute inset-0 bg-primary-500/10 rounded-xl pointer-events-none"></div>
	{/if}
</div> 