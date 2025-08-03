<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import type { Proyecto } from '$lib/tipos/app';
	import TarjetaProyecto from './TarjetaProyecto.svelte';
	import Boton from '$lib/componentes/ui/Boton.svelte';
	import Input from '$lib/componentes/ui/Input.svelte';
	import Cargando from '$lib/componentes/ui/Cargando.svelte';

	// Props
	export let proyectos: Proyecto[] = [];
	export let cargando = false;
	export let filtro = '';
	export let vista: 'grid' | 'lista' = 'grid';

	// Event dispatcher
	const dispatch = createEventDispatcher<{
		crear: void;
		filtrar: { filtro: string };
		cambiarVista: { vista: 'grid' | 'lista' };
		seleccionar: { proyecto: Proyecto };
	}>();

	// Estado local
	let filtroEstado: string = 'todos';
	let ordenamiento: 'nombre' | 'fecha' | 'progreso' = 'fecha';

	// Proyectos filtrados
	$: proyectosFiltrados = proyectos.filter(proyecto => {
		// Filtro por texto
		const coincideTexto = proyecto.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
			proyecto.descripcion?.toLowerCase().includes(filtro.toLowerCase());

		// Filtro por estado
		const coincideEstado = filtroEstado === 'todos' || proyecto.estado === filtroEstado;

		return coincideTexto && coincideEstado;
	}).sort((a, b) => {
		switch (ordenamiento) {
			case 'nombre':
				return a.nombre.localeCompare(b.nombre);
			case 'progreso':
				return (b.progreso || 0) - (a.progreso || 0);
			case 'fecha':
			default:
				return new Date(b.fecha_actualizacion).getTime() - new Date(a.fecha_actualizacion).getTime();
		}
	});

	// Handlers
	const handleFiltroChange = (valor: string) => {
		filtro = valor;
		dispatch('filtrar', { filtro });
	};

	const handleVistaChange = (nuevaVista: 'grid' | 'lista') => {
		vista = nuevaVista;
		dispatch('cambiarVista', { vista: nuevaVista });
	};

	const handleProyectoClick = (proyecto: Proyecto) => {
		dispatch('seleccionar', { proyecto });
	};
</script>

<!-- Header con filtros y acciones -->
<div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 mb-6">
	<!-- Título y botón crear -->
	<div class="flex items-center justify-between mb-6">
		<div>
			<h2 class="text-2xl font-bold text-gray-900 dark:text-white">
				Proyectos
			</h2>
			<p class="text-gray-600 dark:text-gray-400 mt-1">
				Gestiona todos tus proyectos activos
			</p>
		</div>
		<Boton
			variante="primary"
			class="bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 shadow-lg shadow-primary-500/25"
			icono="plus"
			on:click={() => dispatch('crear')}
		>
			Nuevo Proyecto
		</Boton>
	</div>

	<!-- Barra de filtros -->
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
		<!-- Búsqueda -->
		<div class="lg:col-span-2">
			<Input
				tipo="text"
				placeholder="Buscar proyectos..."
				valor={filtro}
				icono="search"
				on:cambio={(e) => handleFiltroChange(e.detail.valor)}
			/>
		</div>

		<!-- Filtro por estado -->
		<select
			bind:value={filtroEstado}
			class="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
		>
			<option value="todos">Todos los estados</option>
			<option value="activo">Activos</option>
			<option value="pausado">Pausados</option>
			<option value="completado">Completados</option>
			<option value="archivado">Archivados</option>
		</select>

		<!-- Ordenamiento -->
		<select
			bind:value={ordenamiento}
			class="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
		>
			<option value="fecha">Más recientes</option>
			<option value="nombre">Por nombre</option>
			<option value="progreso">Por progreso</option>
		</select>
	</div>

	<!-- Controles de vista y estadísticas -->
	<div class="flex items-center justify-between mt-6 pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
		<div class="text-sm text-gray-600 dark:text-gray-400">
			{proyectosFiltrados.length} de {proyectos.length} proyectos
		</div>

		<!-- Toggle de vista -->
		<div class="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
			<button
				on:click={() => handleVistaChange('grid')}
				class="px-3 py-1.5 rounded-md text-sm transition-colors {
					vista === 'grid'
						? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
						: 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
				}"
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
				</svg>
			</button>
			<button
				on:click={() => handleVistaChange('lista')}
				class="px-3 py-1.5 rounded-md text-sm transition-colors {
					vista === 'lista'
						? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
						: 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
				}"
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
				</svg>
			</button>
		</div>
	</div>
</div>

<!-- Contenido de proyectos -->
<div class="space-y-6">
	{#if cargando}
		<div class="flex justify-center py-12">
			<Cargando size="lg" texto="Cargando proyectos..." />
		</div>
	{:else if proyectosFiltrados.length === 0}
		<!-- Estado vacío -->
		<div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-12 border border-gray-200/50 dark:border-gray-700/50 text-center">
			<div class="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
				<svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
				</svg>
			</div>
			<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
				{filtro || filtroEstado !== 'todos' ? 'No se encontraron proyectos' : 'No tienes proyectos aún'}
			</h3>
			<p class="text-gray-600 dark:text-gray-400 mb-6">
				{filtro || filtroEstado !== 'todos' 
					? 'Prueba con diferentes filtros o términos de búsqueda'
					: 'Crea tu primer proyecto para comenzar a organizar tus tareas'
				}
			</p>
			{#if !filtro && filtroEstado === 'todos'}
				<Boton
					variante="primary"
					icono="plus"
					on:click={() => dispatch('crear')}
				>
					Crear Primer Proyecto
				</Boton>
			{/if}
		</div>
	{:else}
		<!-- Lista/Grid de proyectos -->
		<div class="{vista === 'grid' 
			? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
			: 'space-y-4'
		}">
			{#each proyectosFiltrados as proyecto (proyecto.id)}
				<TarjetaProyecto
					{proyecto}
					compacta={vista === 'lista'}
					on:click={() => handleProyectoClick(proyecto)}
				/>
			{/each}
		</div>
	{/if}
</div> 