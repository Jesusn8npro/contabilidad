<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { cargarProyectos, proyectos, cargandoProyectos, crearProyecto } from '$lib/stores/proyectos';
	import type { Proyecto } from '$lib/tipos/app';
	import ListaProyectos from '$lib/componentes/proyectos/ListaProyectos.svelte';
	import FormularioProyecto from '$lib/componentes/proyectos/FormularioProyecto.svelte';
	import { mostrarExito, mostrarError } from '$lib/stores/toast';
	import { Plus, Search, Filter, Grid3X3, List, TrendingUp, Clock, CheckCircle, Pause } from 'lucide-svelte';
	import Boton from '$lib/componentes/ui/Boton.svelte';
	import Input from '$lib/componentes/ui/Input.svelte';
	import { fly, scale } from 'svelte/transition';

	// Estado local
	let filtro = '';
	let filtroEstado = 'todos';
	let vista: 'grid' | 'lista' = 'grid';
	let modalNuevo = false;
	let guardandoProyecto = false;
	let mostrarFiltros = false;

	// Estadísticas computadas
	$: estadisticas = {
		total: $proyectos.length,
		activos: $proyectos.filter(p => p.estado === 'activo').length,
		completados: $proyectos.filter(p => p.estado === 'completado').length,
		pausados: $proyectos.filter(p => p.estado === 'pausado').length,
		progreso: $proyectos.length > 0 ? Math.round(($proyectos.filter(p => p.estado === 'completado').length / $proyectos.length) * 100) : 0
	};

	// Filtros avanzados
	$: proyectosFiltrados = $proyectos.filter(proyecto => {
		const coincideTexto = !filtro || 
			proyecto.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
			(proyecto.descripcion && proyecto.descripcion.toLowerCase().includes(filtro.toLowerCase()));
		
		const coincideEstado = filtroEstado === 'todos' || proyecto.estado === filtroEstado;
		
		return coincideTexto && coincideEstado;
	});

	// Cargar proyectos al montar
	onMount(async () => {
		try {
			await cargarProyectos();
		} catch (error) {
			console.error('Error al cargar proyectos en página:', error);
			mostrarError('Error al cargar proyectos', 'Intenta recargar la página');
		}
	});

	// Handlers
	const handleCrearProyecto = () => {
		modalNuevo = true;
	};

	const handleSeleccionarProyecto = (event: CustomEvent<{ proyecto: Proyecto }>) => {
		const { proyecto } = event.detail;
		goto(`/panel/proyectos/${proyecto.id}`);
	};

	const handleGuardarProyecto = async (event: CustomEvent<{ proyecto: Partial<Proyecto> }>) => {
		guardandoProyecto = true;
		try {
			const { proyecto } = event.detail;
			await crearProyecto(proyecto);
			modalNuevo = false;
			mostrarExito('Proyecto creado exitosamente');
			await cargarProyectos();
		} catch (error) {
			console.error('Error al crear proyecto:', error);
			mostrarError('Error al crear proyecto', 'Intenta nuevamente');
		} finally {
			guardandoProyecto = false;
		}
	};

	const handleCancelarFormulario = () => {
		modalNuevo = false;
	};

	const toggleVista = () => {
		vista = vista === 'grid' ? 'lista' : 'grid';
		if (typeof localStorage !== 'undefined') {
			localStorage.setItem('vista-proyectos', vista);
		}
	};

	const toggleFiltros = () => {
		mostrarFiltros = !mostrarFiltros;
	};

	// Cargar vista preferida
	onMount(() => {
		if (typeof localStorage !== 'undefined') {
			const vistaGuardada = localStorage.getItem('vista-proyectos') as 'grid' | 'lista';
			if (vistaGuardada) {
				vista = vistaGuardada;
			}
		}
	});
</script>

<svelte:head>
	<title>Proyectos - App Contabilidad</title>
</svelte:head>

<div class="space-y-8">
	<!-- Header Premium con Gradiente -->
	<div class="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-8 text-white">
		<div class="relative z-10">
			<div class="flex items-center justify-between">
				<div>
					<h1 class="text-4xl font-bold mb-2">Proyectos</h1>
					<p class="text-blue-100 text-lg">
						Gestiona y da seguimiento a todos tus proyectos
					</p>
				</div>
				<div class="flex items-center space-x-4">
					<Boton
						variante="ghost"
						on:click={toggleVista}
						class="!text-white !border-white/30 hover:!bg-white/20"
					>
						{#if vista === 'grid'}
							<List class="w-5 h-5" />
						{:else}
							<Grid3X3 class="w-5 h-5" />
						{/if}
					</Boton>
					<Boton 
						on:click={handleCrearProyecto}
						class="!bg-white !text-purple-600 hover:!bg-gray-100 shadow-lg"
					>
						<Plus class="w-5 h-5 mr-2" />
						Nuevo Proyecto
					</Boton>
				</div>
			</div>
		</div>
		
		<!-- Elementos decorativos -->
		<div class="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
		<div class="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
	</div>

	<!-- Estadísticas Premium -->
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
		<!-- Total Proyectos -->
		<div class="relative overflow-hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 hover:shadow-lg transition-all duration-300 group">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Proyectos</p>
					<p class="text-3xl font-bold text-gray-900 dark:text-white mt-1" in:scale={{ delay: 100 }}>
						{estadisticas.total}
					</p>
				</div>
				<div class="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl group-hover:scale-110 transition-transform">
					<TrendingUp class="w-6 h-6 text-blue-600 dark:text-blue-400" />
				</div>
			</div>
			<div class="absolute -bottom-2 -right-2 w-20 h-20 bg-gradient-to-br from-blue-500/10 to-blue-600/20 rounded-full"></div>
		</div>

		<!-- Proyectos Activos -->
		<div class="relative overflow-hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 hover:shadow-lg transition-all duration-300 group">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-sm font-medium text-gray-600 dark:text-gray-400">Activos</p>
					<p class="text-3xl font-bold text-green-600 dark:text-green-400 mt-1" in:scale={{ delay: 200 }}>
						{estadisticas.activos}
					</p>
				</div>
				<div class="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl group-hover:scale-110 transition-transform">
					<Clock class="w-6 h-6 text-green-600 dark:text-green-400" />
				</div>
			</div>
			<div class="absolute -bottom-2 -right-2 w-20 h-20 bg-gradient-to-br from-green-500/10 to-green-600/20 rounded-full"></div>
		</div>

		<!-- Completados -->
		<div class="relative overflow-hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 hover:shadow-lg transition-all duration-300 group">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-sm font-medium text-gray-600 dark:text-gray-400">Completados</p>
					<p class="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-1" in:scale={{ delay: 300 }}>
						{estadisticas.completados}
					</p>
				</div>
				<div class="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl group-hover:scale-110 transition-transform">
					<CheckCircle class="w-6 h-6 text-purple-600 dark:text-purple-400" />
				</div>
			</div>
			<div class="absolute -bottom-2 -right-2 w-20 h-20 bg-gradient-to-br from-purple-500/10 to-purple-600/20 rounded-full"></div>
		</div>

		<!-- Progreso General -->
		<div class="relative overflow-hidden bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-6 text-white hover:shadow-lg transition-all duration-300 group">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-orange-100 text-sm font-medium">Progreso General</p>
					<p class="text-3xl font-bold mt-1" in:scale={{ delay: 400 }}>
						{estadisticas.progreso}%
					</p>
					<div class="w-full bg-white/20 rounded-full h-2 mt-3">
						<div 
							class="bg-white rounded-full h-2 transition-all duration-1000 ease-out"
							style="width: {estadisticas.progreso}%"
						></div>
					</div>
				</div>
				<div class="p-3 bg-white/20 rounded-xl group-hover:scale-110 transition-transform">
					<TrendingUp class="w-6 h-6" />
				</div>
			</div>
			<div class="absolute -bottom-2 -right-2 w-20 h-20 bg-white/10 rounded-full"></div>
		</div>
	</div>

	<!-- Barra de Búsqueda y Filtros Avanzados -->
	<div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 shadow-lg">
		<div class="flex flex-col lg:flex-row gap-4">
			<!-- Búsqueda -->
			<div class="flex-1 relative">
				<Search class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
				<Input
					tipo="text"
					bind:valor={filtro}
					placeholder="Buscar proyectos por nombre o descripción..."
					class="pl-10 !bg-white/90 dark:!bg-gray-700/90 !border-gray-200/50 dark:!border-gray-600/50"
				/>
			</div>

			<!-- Filtros -->
			<div class="flex items-center space-x-3">
				<select 
					bind:value={filtroEstado}
					class="px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white/90 dark:bg-gray-700/90 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
				>
					<option value="todos">Todos los estados</option>
					<option value="activo">Activos</option>
					<option value="pausado">Pausados</option>
					<option value="completado">Completados</option>
					<option value="archivado">Archivados</option>
				</select>

				<Boton variante="secondary" on:click={toggleFiltros}>
					<Filter class="w-4 h-4 mr-2" />
					Filtros
				</Boton>

				<div class="text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg">
					{proyectosFiltrados.length} de {$proyectos.length}
				</div>
			</div>
		</div>

		<!-- Filtros Expandidos -->
		{#if mostrarFiltros}
			<div class="mt-6 pt-6 border-t border-gray-200/50 dark:border-gray-700/50" in:fly={{ y: -20, duration: 300 }}>
				<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
					<div>
						<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
							Fecha de inicio
						</label>
						<Input tipo="date" />
					</div>
					<div>
						<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
							Fecha límite
						</label>
						<Input tipo="date" />
					</div>
					<div>
						<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
							Color
						</label>
						<select class="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
							<option>Todos los colores</option>
							<option>Azul</option>
							<option>Verde</option>
							<option>Rojo</option>
							<option>Amarillo</option>
						</select>
					</div>
				</div>
			</div>
		{/if}
	</div>

	<!-- Lista de proyectos con animaciones -->
	{#if $cargandoProyectos}
		<div class="flex items-center justify-center py-12">
			<div class="relative">
				<div class="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
				<div class="absolute inset-0 rounded-full h-12 w-12 border-4 border-purple-500/30"></div>
			</div>
			<span class="ml-4 text-gray-600 dark:text-gray-400 font-medium">Cargando proyectos...</span>
		</div>
	{:else if proyectosFiltrados.length === 0}
		<div class="text-center py-16 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50" in:scale>
			<div class="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl mx-auto mb-6 flex items-center justify-center">
				<TrendingUp class="w-12 h-12 text-white" />
			</div>
			<h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
				{filtro || filtroEstado !== 'todos' ? 'No se encontraron proyectos' : 'Comienza tu primer proyecto'}
			</h3>
			<p class="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
				{filtro || filtroEstado !== 'todos' 
					? 'Intenta ajustar los filtros de búsqueda' 
					: 'Crea tu primer proyecto y comienza a organizar tus tareas de manera eficiente'
				}
			</p>
			{#if !filtro && filtroEstado === 'todos'}
				<Boton on:click={handleCrearProyecto} class="shadow-lg">
					<Plus class="w-5 h-5 mr-2" />
					Crear Primer Proyecto
				</Boton>
			{/if}
		</div>
	{:else}
		<div in:fly={{ y: 20, duration: 300 }}>
			<ListaProyectos
				proyectos={proyectosFiltrados}
				filtro=""
				{vista}
				on:seleccionar={handleSeleccionarProyecto}
				on:crear={handleCrearProyecto}
				on:filtrar={() => {}}
				on:cambiarVista={() => {}}
			/>
		</div>
	{/if}
</div>

<!-- Modal Premium para crear proyecto -->
{#if modalNuevo}
	<div 
		class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
		in:fly={{ y: 50, duration: 300, opacity: 0 }}
		out:fly={{ y: -50, duration: 200, opacity: 0 }}
	>
		<div 
			class="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200/50 dark:border-gray-700/50"
			in:scale={{ duration: 300, delay: 100 }}
		>
			<div class="p-8">
				<div class="flex items-center justify-between mb-8">
					<div>
						<h2 class="text-2xl font-bold text-gray-900 dark:text-white">Nuevo Proyecto</h2>
						<p class="text-gray-600 dark:text-gray-400 mt-1">Crea un proyecto para organizar tus tareas</p>
					</div>
					<div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
						<Plus class="w-6 h-6 text-white" />
					</div>
				</div>
				
				<FormularioProyecto
					modal={false}
					guardando={guardandoProyecto}
					on:guardar={handleGuardarProyecto}
					on:cancelar={handleCancelarFormulario}
				/>
			</div>
		</div>
	</div>
{/if} 