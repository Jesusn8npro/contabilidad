<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { Proyecto } from '$lib/tipos/app';
	import { formatearFechaRelativa } from '$lib/utils/formato-fecha';
	import { COLORES_PROYECTO } from '$lib/tipos/app';

	// Props
	export let proyecto: Proyecto;
	export let compacta = false;
	export let clickeable = true;

	// Event dispatcher
	const dispatch = createEventDispatcher<{
		click: { proyecto: Proyecto };
		editar: { proyecto: Proyecto };
		eliminar: { proyecto: Proyecto };
		archivar: { proyecto: Proyecto };
	}>();

	// Calcular progreso de tareas (simulado por ahora)
	$: progreso = proyecto.progreso || Math.floor(Math.random() * 100);
	$: tareasTotal = Math.floor(Math.random() * 20) + 5;
	$: tareasCompletadas = Math.floor((tareasTotal * progreso) / 100);

	// Color del proyecto - buscar en COLORES_PROYECTO o usar un color por defecto
	$: colorProyecto = COLORES_PROYECTO.find(c => c.valor === proyecto.color) || COLORES_PROYECTO[0];
	$: colorHex = colorProyecto.color;

	// Handlers
	const handleClick = () => {
		if (clickeable) {
			dispatch('click', { proyecto });
		}
	};

	const handleEditar = (e: Event) => {
		e.stopPropagation();
		dispatch('editar', { proyecto });
	};

	const handleEliminar = (e: Event) => {
		e.stopPropagation();
		dispatch('eliminar', { proyecto });
	};

	const handleArchivar = (e: Event) => {
		e.stopPropagation();
		dispatch('archivar', { proyecto });
	};
</script>

<!-- Tarjeta del proyecto -->
<div
	class="group relative w-full max-w-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 hover:shadow-lg hover:shadow-gray-200/50 dark:hover:shadow-gray-900/50 transition-all duration-300 overflow-hidden {
		clickeable ? 'cursor-pointer hover:scale-[1.02]' : ''
	} {
		compacta ? 'p-3 sm:p-4' : 'p-4 sm:p-6'
	}"
	on:click={handleClick}
	on:keydown={(e) => e.key === 'Enter' && handleClick()}
	role={clickeable ? 'button' : 'article'}
	tabindex={clickeable ? 0 : -1}
>
	<!-- Header del proyecto -->
	<div class="flex items-start justify-between mb-3 sm:mb-4">
		<div class="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
			<!-- Indicador de color -->
			<div 
				class="w-3 h-3 sm:w-4 sm:h-4 rounded-full ring-2 ring-white dark:ring-gray-800 shadow-sm flex-shrink-0"
				style="background-color: {colorHex}"
			></div>
			
			<div class="flex-1 min-w-0">
				<h3 class="font-semibold text-gray-900 dark:text-white truncate {
					compacta ? 'text-sm sm:text-base' : 'text-base sm:text-lg'
				}">
					{proyecto.nombre}
				</h3>
				{#if !compacta && proyecto.descripcion}
					<p class="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
						{proyecto.descripcion}
					</p>
				{/if}
			</div>
		</div>

		<!-- Menú de acciones -->
		<div class="relative opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
			<button
				class="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
				on:click={(e) => e.stopPropagation()}
			>
				<svg class="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
				</svg>
			</button>
			
			<!-- Dropdown de acciones (se puede implementar después) -->
			<div class="absolute right-0 top-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10 hidden">
				<button
					class="w-full px-3 sm:px-4 py-2 text-left text-xs sm:text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
					on:click={handleEditar}
				>
					Editar
				</button>
				<button
					class="w-full px-3 sm:px-4 py-2 text-left text-xs sm:text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
					on:click={handleArchivar}
				>
					Archivar
				</button>
				<button
					class="w-full px-3 sm:px-4 py-2 text-left text-xs sm:text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
					on:click={handleEliminar}
				>
					Eliminar
				</button>
			</div>
		</div>
	</div>

	<!-- Badge de estado -->
	<div class="flex items-center justify-between mb-3 sm:mb-4">
		<span class="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-medium {
			proyecto.estado === 'activo' 
				? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
				: proyecto.estado === 'pausado'
				? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
				: proyecto.estado === 'completado'
				? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
				: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
		}">
			{proyecto.estado.charAt(0).toUpperCase() + proyecto.estado.slice(1)}
		</span>

		<div class="text-xs text-gray-500 dark:text-gray-400 truncate ml-2">
			{formatearFechaRelativa(proyecto.fecha_actualizacion)}
		</div>
	</div>

	{#if !compacta}
		<!-- Progreso de tareas -->
		<div class="mb-3 sm:mb-4">
			<div class="flex items-center justify-between text-xs sm:text-sm mb-2">
				<span class="text-gray-600 dark:text-gray-400">Progreso</span>
				<span class="font-medium text-gray-900 dark:text-white">
					{tareasCompletadas}/{tareasTotal} tareas
				</span>
			</div>
			<div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 sm:h-2">
				<div 
					class="h-1.5 sm:h-2 rounded-full transition-all duration-500"
					style="width: {progreso}%; background-color: {colorHex}"
				></div>
			</div>
			<div class="text-right text-xs text-gray-500 dark:text-gray-400 mt-1">
				{progreso}% completado
			</div>
		</div>

		<!-- Fechas del proyecto -->
		<div class="grid grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm">
			<div class="min-w-0">
				<span class="text-gray-500 dark:text-gray-400 block">Inicio:</span>
				<span class="text-gray-900 dark:text-white font-medium truncate block">
					{new Date(proyecto.fecha_inicio).toLocaleDateString('es-ES', { 
						day: '2-digit', 
						month: 'short' 
					})}
				</span>
			</div>
			{#if proyecto.fecha_limite}
				<div class="min-w-0">
					<span class="text-gray-500 dark:text-gray-400 block">Límite:</span>
					<span class="text-gray-900 dark:text-white font-medium truncate block">
						{new Date(proyecto.fecha_limite).toLocaleDateString('es-ES', { 
							day: '2-digit', 
							month: 'short' 
						})}
					</span>
				</div>
			{/if}
		</div>
	{:else}
		<!-- Vista compacta -->
		<div class="flex items-center justify-between">
			<div class="flex items-center space-x-2 sm:space-x-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
				<span>{tareasCompletadas}/{tareasTotal} tareas</span>
				<span>{progreso}%</span>
			</div>
			<div class="w-12 sm:w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-1 sm:h-1.5 flex-shrink-0">
				<div 
					class="h-1 sm:h-1.5 rounded-full"
					style="width: {progreso}%; background-color: {colorHex}"
				></div>
			</div>
		</div>
	{/if}

	<!-- Hover effect -->
	<div class="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style="background: linear-gradient(135deg, {colorHex}0D, {colorHex}1A)"></div>
</div> 