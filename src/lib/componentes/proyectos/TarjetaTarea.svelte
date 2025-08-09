<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { Tarea } from '$lib/tipos/app';
	import { ChevronDown, Edit, Trash2 } from 'lucide-svelte';

	// Props
	export let tarea: Tarea;
	export let draggable = true;
	export let mostrarSelectorEstado = true;

	// Dispatcher
	const dispatch = createEventDispatcher();

	// Variables para el drag & drop
	let isDragging = false;

	// Variables para control del dropdown
	let mostrarDropdown = false;
	let dropdownButton: HTMLElement;
	let abrirHaciaArriba = false;

	// Estados disponibles para el dropdown
	const estadosDisponibles = [
		{ id: 'por-hacer', label: 'Por Hacer', icon: '📋', color: 'text-gray-600' },
		{ id: 'en-progreso', label: 'En Progreso', icon: '🔄', color: 'text-blue-600' },
		{ id: 'en-revision', label: 'En Revisión', icon: '👀', color: 'text-yellow-600' },
		{ id: 'completada', label: 'Completada', icon: '✅', color: 'text-green-600' }
	];

	// Estado actual
	$: estadoActual = estadosDisponibles.find(e => e.id === tarea.estado) || estadosDisponibles[0];

	// Función para calcular si debe abrir hacia arriba
	const calcularDireccionDropdown = () => {
		if (!dropdownButton) return;
		
		const rect = dropdownButton.getBoundingClientRect();
		const windowHeight = window.innerHeight;
		const dropdownHeight = 200; // altura estimada del dropdown
		const espacioAbajo = windowHeight - rect.bottom;
		const espacioArriba = rect.top;
		
		// Si no hay espacio suficiente abajo, abrir hacia arriba
		abrirHaciaArriba = espacioAbajo < dropdownHeight && espacioArriba > dropdownHeight;
		
		console.log('🔍 POSICIONAMIENTO:', {
			espacioAbajo,
			espacioArriba,
			dropdownHeight,
			abrirHaciaArriba,
			rectBottom: rect.bottom,
			rectTop: rect.top,
			windowHeight
		});
	};

	// Handlers básicos
	const handleEditar = (e: Event) => {
		e.stopPropagation();
		dispatch('editar', { tarea });
	};

	const handleEliminar = (e: Event) => {
		e.stopPropagation();
		dispatch('eliminar', { tarea });
	};

	const handleCambiarEstado = (nuevoEstado: string, e: Event) => {
		e.stopPropagation();
		mostrarDropdown = false;
		dispatch('cambiarEstado', { tarea, estado: nuevoEstado });
	};

	const handleToggleDropdown = (event: Event) => {
		event.stopPropagation();
		
		if (!mostrarDropdown) {
			// Calcular dirección antes de mostrar
			calcularDireccionDropdown();
		}
		
		console.log('🔍 DEBUG DROPDOWN:', { 
			mostrarDropdown, 
			willBe: !mostrarDropdown,
			abrirHaciaArriba 
		});
		
		mostrarDropdown = !mostrarDropdown;
	};
</script>

<!-- Tarjeta de Tarea -->
<div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm hover:shadow-md transition-all duration-200 relative">
	<!-- Header con título y acciones -->
	<div class="flex items-start justify-between mb-2">
		<h4 class="font-medium text-gray-900 dark:text-white line-clamp-2 flex-1 pr-2">
			{tarea.titulo}
		</h4>
		
		<!-- Acciones -->
		<div class="flex items-center space-x-1 flex-shrink-0">
			<!-- Botón editar -->
			<button
				class="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded transition-colors opacity-0 group-hover:opacity-100 md:opacity-0 md:group-hover:opacity-100"
				on:click={handleEditar}
				title="Editar tarea"
			>
				<Edit class="w-4 h-4" />
			</button>
			
			<!-- Botón eliminar -->
			<button
				class="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded transition-colors opacity-0 group-hover:opacity-100 md:opacity-0 md:group-hover:opacity-100"
				on:click={handleEliminar}
				title="Eliminar tarea"
			>
				<Trash2 class="w-4 h-4" />
			</button>
		</div>
	</div>
	
	<!-- Descripción -->
	{#if tarea.descripcion}
		<p class="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
			{tarea.descripcion}
		</p>
	{/if}

	<!-- Footer con estado y metadatos -->
	<div class="flex items-center justify-between">
		<!-- Estado con selector -->
		{#if mostrarSelectorEstado}
			<div class="relative">
				<div class="flex items-center space-x-1">
					<div class="w-2 h-2 rounded-full {estadoActual.color}"></div>
					<span class="text-gray-500 dark:text-gray-400">{estadoActual.label}</span>
					<button
						class="p-1 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200"
						on:click={handleToggleDropdown}
						bind:this={dropdownButton}
						title="Cambiar estado"
						type="button"
					>
						<ChevronDown class="w-3 h-3 transition-transform duration-200 {mostrarDropdown ? 'rotate-180' : ''}" />
					</button>
					
					<!-- Dropdown de estados - POSICIONAMIENTO DINÁMICO -->
					{#if mostrarDropdown}
						<!-- Backdrop -->
						<div class="fixed inset-0 z-40" on:click={() => mostrarDropdown = false}></div>
						
						<!-- Dropdown -->
						<div class="absolute {abrirHaciaArriba ? 'bottom-full mb-1' : 'top-full mt-1'} left-0 w-48 bg-white dark:bg-gray-800 rounded-md shadow-xl border border-gray-200 dark:border-gray-600 z-50">
							{#each estadosDisponibles as estado}
								<button
									class="flex items-center w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 first:rounded-t-md last:rounded-b-md {tarea.estado === estado.id ? 'bg-blue-50 dark:bg-blue-900' : ''}"
									on:click={(e) => handleCambiarEstado(estado.id, e)}
								>
									<span class="mr-2 text-base">{estado.icon}</span>
									<span class="truncate font-medium">{estado.label}</span>
									{#if tarea.estado === estado.id}
										<span class="ml-auto text-xs text-blue-600">✓</span>
									{/if}
								</button>
							{/each}
						</div>
					{/if}
				</div>
			</div>
		{:else}
			<div class="flex items-center space-x-1">
				<div class="w-2 h-2 rounded-full {estadoActual.color}"></div>
				<span class="text-gray-500 dark:text-gray-400">{estadoActual.label}</span>
			</div>
		{/if}
		
		<!-- Metadatos -->
		<div class="flex items-center text-xs text-gray-500 space-x-2">
			{#if tarea.fecha_limite}
				<span>📅 {new Date(tarea.fecha_limite).toLocaleDateString('es-ES')}</span>
			{/if}
			{#if tarea.prioridad}
				<span class="px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700">
					{tarea.prioridad === 'urgente' ? '🔴' : 
					 tarea.prioridad === 'alta' ? '🟠' : 
					 tarea.prioridad === 'media' ? '🟡' : '🟢'}
				</span>
			{/if}
		</div>
	</div>
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