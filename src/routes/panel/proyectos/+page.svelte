<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { cargarProyectos, proyectos, cargandoProyectos, crearProyecto } from '$lib/stores/proyectos';
	import type { Proyecto } from '$lib/tipos/app';
	import ListaProyectos from '$lib/componentes/proyectos/ListaProyectos.svelte';
	import FormularioProyecto from '$lib/componentes/proyectos/FormularioProyecto.svelte';
	import { mostrarExito, mostrarError } from '$lib/stores/toast';
	import { 
		Plus, 
		Search, 
		Filter, 
		Grid3X3, 
		List, 
		TrendingUp, 
		Clock, 
		CheckCircle, 
		Pause,
		Calendar,
		Target,
		BarChart3,
		Zap,
		Star,
		ArrowUpRight,
		Users,
		Timer,
		Award,
		Rocket,
		Sparkles,
		Activity,
		ChevronDown,
		SortAsc
	} from 'lucide-svelte';
	import Boton from '$lib/componentes/ui/Boton.svelte';
	import Input from '$lib/componentes/ui/Input.svelte';
	import Modal from '$lib/componentes/ui/Modal.svelte';
	import { fly, scale, fade } from 'svelte/transition';

	// Estado local
	let filtro = '';
	let filtroEstado = 'todos';
	let filtroFechaInicio = '';
	let filtroFechaLimite = '';
	let filtroColor = '';
	let vista: 'grid' | 'lista' = 'grid';
	let modalNuevo = false;
	let guardandoProyecto = false;
	let mostrarFiltros = false;
	let mostrarFiltrosAvanzados = false;
	let ordenarPor: 'nombre' | 'fecha' | 'progreso' | 'prioridad' = 'fecha';

	// Estadísticas computadas mejoradas
	$: estadisticas = {
		total: $proyectos.length,
		activos: $proyectos.filter(p => p.estado === 'activo').length,
		completados: $proyectos.filter(p => p.estado === 'completado').length,
		pausados: $proyectos.filter(p => p.estado === 'pausado').length,
		progreso: $proyectos.length > 0 ? Math.round(($proyectos.filter(p => p.estado === 'completado').length / $proyectos.length) * 100) : 0,
		// Nuevas estadísticas de valor
		vencenEstaSemana: $proyectos.filter(p => {
			if (!p.fecha_limite) return false;
			const hoy = new Date();
			const fechaLimite = new Date(p.fecha_limite);
			const diferenciaDias = Math.ceil((fechaLimite.getTime() - hoy.getTime()) / (1000 * 3600 * 24));
			return diferenciaDias <= 7 && diferenciaDias >= 0 && p.estado !== 'completado';
		}).length,
		promedioCompletacion: $proyectos.length > 0 ? 
			Math.round($proyectos.reduce((acc, p) => acc + (p.progreso || 0), 0) / $proyectos.length) : 0,
		tendencia: '+12%', // Esto podría calcularse comparando con mes anterior
		productividad: Math.min(100, Math.round((($proyectos.filter(p => p.estado === 'completado').length || 0) * 20))) // Score de productividad
	};

	// Proyectos recientes (últimos 3)
	$: proyectosRecientes = $proyectos
		.sort((a, b) => new Date(b.fecha_creacion).getTime() - new Date(a.fecha_creacion).getTime())
		.slice(0, 3);

	// Filtros avanzados mejorados
	$: proyectosFiltrados = $proyectos
		.filter(proyecto => {
			const coincideTexto = !filtro || 
				proyecto.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
				(proyecto.descripcion && proyecto.descripcion.toLowerCase().includes(filtro.toLowerCase()));
			
			const coincideEstado = filtroEstado === 'todos' || proyecto.estado === filtroEstado;
			
			const coincideFechaInicio = !filtroFechaInicio || 
				(proyecto.fecha_inicio && proyecto.fecha_inicio >= filtroFechaInicio);
			
			const coincideFechaLimite = !filtroFechaLimite || 
				(proyecto.fecha_limite && proyecto.fecha_limite <= filtroFechaLimite);
			
			const coincideColor = !filtroColor || proyecto.color === filtroColor;
			
			return coincideTexto && coincideEstado && coincideFechaInicio && coincideFechaLimite && coincideColor;
		})
		.sort((a, b) => {
			switch (ordenarPor) {
				case 'nombre':
					return a.nombre.localeCompare(b.nombre);
				case 'fecha':
					return new Date(b.fecha_creacion).getTime() - new Date(a.fecha_creacion).getTime();
				case 'progreso':
					return (b.progreso || 0) - (a.progreso || 0);
				case 'prioridad':
					// Removido temporalmente hasta que se añada prioridad al tipo Proyecto
					return 0;
				default:
					return 0;
			}
		});

	// Datos para elementos visuales del hero
	$: heroData = {
		horaActual: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
		fechaActual: new Date().toLocaleDateString('es-ES', { 
			weekday: 'long', 
			year: 'numeric', 
			month: 'long', 
			day: 'numeric' 
		}),
		temperaturaProductividad: estadisticas.productividad > 80 ? '🔥' : 
								  estadisticas.productividad > 60 ? '⚡' : 
								  estadisticas.productividad > 40 ? '📈' : '📊'
	};

	// Cargar proyectos al montar
	onMount(async () => {
		try {
			await cargarProyectos();
		} catch (error) {
			console.error('Error al cargar proyectos en página:', error);
			mostrarError('Error al cargar proyectos', 'Intenta recargar la página');
		}
	});

	// Handlers mejorados
	const handleCrearProyecto = () => {
		modalNuevo = true;
	};

	const handleSeleccionarProyecto = (event: CustomEvent<{ proyecto: Proyecto }>) => {
		const { proyecto } = event.detail;
		console.log('🎯 Navegando a proyecto:', proyecto.slug);
		goto(`/panel/proyectos/${proyecto.slug}`, {
			invalidateAll: true,
			replaceState: false,
			noScroll: false
		});
	};

	const handleGuardarProyecto = async (event: CustomEvent<{ proyecto: Partial<Proyecto> }>) => {
		guardandoProyecto = true;
		try {
			const { proyecto } = event.detail;
			await crearProyecto(proyecto);
			modalNuevo = false;
			mostrarExito('¡Proyecto creado exitosamente! 🎉');
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

	const toggleFiltrosAvanzados = () => {
		mostrarFiltrosAvanzados = !mostrarFiltrosAvanzados;
	};

	const limpiarFiltros = () => {
		filtro = '';
		filtroEstado = 'todos';
		filtroFechaInicio = '';
		filtroFechaLimite = '';
		filtroColor = '';
		ordenarPor = 'fecha';
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
	<title>Proyectos - App Contabilidad Pro</title>
	<meta name="description" content="Gestiona y da seguimiento a todos tus proyectos de manera eficiente" />
</svelte:head>

<div class="w-full max-w-full overflow-hidden space-y-6 sm:space-y-8">
	<!-- 🚀 HERO PREMIUM MEJORADO -->
	<div class="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl shadow-2xl">
		<!-- Efectos visuales de fondo mejorados -->
		<div class="absolute inset-0 bg-black/20"></div>
		<div class="absolute -top-6 -right-6 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
		<div class="absolute -bottom-8 -left-8 w-64 h-64 bg-purple-300/20 rounded-full blur-2xl"></div>
		<div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-400/10 to-pink-400/10 rounded-full blur-3xl"></div>
		
		<!-- Grid de fondo sutil -->
		<div class="absolute inset-0 opacity-10" 
			 style="background-image: radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0); background-size: 20px 20px;">
		</div>
		
		<div class="relative z-10 p-4 sm:p-6 lg:p-8 xl:p-12">
			<!-- Header principal responsivo -->
			<div class="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8 space-y-6 lg:space-y-0">
				<div class="flex-1">
					<div class="flex items-center mb-4">
						<div class="p-3 bg-white/20 rounded-xl backdrop-blur-sm mr-4 hidden sm:block">
							<Rocket class="w-8 h-8 text-white" />
						</div>
						<div>
							<h1 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-2 flex items-center">
								Proyectos
								<Sparkles class="w-6 h-6 ml-2 text-yellow-300 animate-pulse" />
							</h1>
							<p class="text-lg sm:text-xl text-blue-100 flex items-center">
								<span class="mr-2">{heroData.temperaturaProductividad}</span>
								Gestiona y potencia todos tus proyectos
							</p>
						</div>
					</div>
					
					<!-- Información contextual responsiva -->
					<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
						<div class="flex items-center text-white/90">
							<Calendar class="w-5 h-5 mr-2 text-blue-200" />
							<span class="text-sm font-medium">{heroData.fechaActual}</span>
						</div>
						<div class="flex items-center text-white/90">
							<Timer class="w-5 h-5 mr-2 text-green-200" />
							<span class="text-sm font-medium">Productividad: {estadisticas.productividad}%</span>
						</div>
						<div class="flex items-center text-white/90">
							<Activity class="w-5 h-5 mr-2 text-purple-200" />
							<span class="text-sm font-medium">Tendencia: {estadisticas.tendencia}</span>
						</div>
					</div>
				</div>
				
				<!-- Acciones principales responsivas -->
				<div class="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
					<!-- Toggle de vista -->
					<button
						on:click={toggleVista}
						class="group flex items-center justify-center px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/30 rounded-xl text-white font-semibold backdrop-blur-sm transition-all duration-300 hover:scale-105 active:scale-95"
					>
						{#if vista === 'grid'}
							<List class="w-5 h-5 mr-2 group-hover:rotate-6 transition-transform" />
							<span class="hidden sm:inline">Lista</span>
						{:else}
							<Grid3X3 class="w-5 h-5 mr-2 group-hover:rotate-6 transition-transform" />
							<span class="hidden sm:inline">Grid</span>
						{/if}
					</button>
					
					<!-- Filtros rápidos -->
					<button
						on:click={toggleFiltros}
						class="group flex items-center justify-center px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/30 rounded-xl text-white font-semibold backdrop-blur-sm transition-all duration-300 hover:scale-105 active:scale-95"
					>
						<Filter class="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
						<span class="hidden sm:inline">Filtros</span>
						{#if filtro || filtroEstado !== 'todos'}
							<div class="w-2 h-2 bg-yellow-400 rounded-full ml-2 animate-pulse"></div>
						{/if}
					</button>
					
					<!-- Botón principal PREMIUM -->
					<button 
						on:click={handleCrearProyecto}
						class="group relative overflow-hidden px-6 py-3 bg-gradient-to-r from-white via-blue-50 to-white text-purple-700 font-bold rounded-xl shadow-2xl hover:shadow-white/25 transition-all duration-300 hover:scale-105 active:scale-95 border border-white/50"
					>
						<!-- Efecto de brillo animado -->
						<div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
						
						<div class="relative flex items-center">
							<div class="p-1 bg-purple-100 rounded-lg mr-3 group-hover:bg-purple-200 transition-colors">
								<Plus class="w-5 h-5 text-purple-600 group-hover:rotate-90 transition-transform duration-300" />
							</div>
							<span class="hidden sm:inline">Nuevo Proyecto</span>
							<span class="sm:hidden">Nuevo</span>
							<ArrowUpRight class="w-4 h-4 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
						</div>
					</button>
				</div>
			</div>
			
			<!-- Métricas rápidas en el hero -->
			<div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
				<div class="text-center p-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
					<div class="text-2xl sm:text-3xl font-bold text-white">{estadisticas.total}</div>
					<div class="text-xs sm:text-sm text-blue-100">Total</div>
				</div>
				<div class="text-center p-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
					<div class="text-2xl sm:text-3xl font-bold text-green-300">{estadisticas.activos}</div>
					<div class="text-xs sm:text-sm text-blue-100">Activos</div>
				</div>
				<div class="text-center p-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
					<div class="text-2xl sm:text-3xl font-bold text-yellow-300">{estadisticas.promedioCompletacion}%</div>
					<div class="text-xs sm:text-sm text-blue-100">Promedio</div>
				</div>
				<div class="text-center p-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
					<div class="text-2xl sm:text-3xl font-bold text-orange-300">{estadisticas.vencenEstaSemana}</div>
					<div class="text-xs sm:text-sm text-blue-100">Esta semana</div>
				</div>
			</div>
		</div>
	</div>

	<!-- 🎯 PANEL DE FILTROS MEJORADO -->
	{#if mostrarFiltros}
		<div 
			class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 shadow-xl"
			in:fly={{ y: -20, duration: 300 }}
			out:fly={{ y: -20, duration: 200 }}
		>
			<!-- Filtros básicos -->
			<div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
				<div>
					<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
						Buscar proyectos
					</label>
					<div class="relative">
						<Search class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
						<Input
							bind:value={filtro}
							tipo="text"
							placeholder="Buscar por nombre o descripción..."
							class="pl-10"
						/>
					</div>
				</div>
				
				<div>
					<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
						Estado
					</label>
					<select 
						bind:value={filtroEstado}
						class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
					>
						<option value="todos">Todos los estados</option>
						<option value="activo">Activos</option>
						<option value="completado">Completados</option>
						<option value="pausado">Pausados</option>
					</select>
				</div>
				
				<div>
					<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
						Ordenar por
					</label>
					<select 
						bind:value={ordenarPor}
						class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
					>
						<option value="fecha">Fecha de creación</option>
						<option value="nombre">Nombre</option>
						<option value="progreso">Progreso</option>
						<option value="prioridad">Prioridad</option>
					</select>
				</div>
				
				<div class="flex items-end space-x-2">
					<button
						on:click={toggleFiltrosAvanzados}
						class="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center"
					>
						<Filter class="w-4 h-4 mr-2" />
						Avanzados
						<ChevronDown class="w-4 h-4 ml-2 transition-transform {mostrarFiltrosAvanzados ? 'rotate-180' : ''}" />
					</button>
					<button
						on:click={limpiarFiltros}
						class="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 rounded-lg font-medium transition-colors"
					>
						Limpiar
					</button>
				</div>
			</div>
			
			<!-- Filtros avanzados -->
			{#if mostrarFiltrosAvanzados}
				<div 
					class="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200/50 dark:border-gray-700/50"
					in:fly={{ y: -10, duration: 200 }}
				>
					<div>
						<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
							Fecha de inicio
						</label>
						<Input
							bind:value={filtroFechaInicio}
							tipo="date"
						/>
					</div>
					<div>
						<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
							Fecha límite
						</label>
						<Input
							bind:value={filtroFechaLimite}
							tipo="date"
						/>
					</div>
					<div>
						<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
							Color
						</label>
						<select 
							bind:value={filtroColor}
							class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
						>
							<option value="">Todos los colores</option>
							<option value="bg-blue-500">Azul</option>
							<option value="bg-green-500">Verde</option>
							<option value="bg-purple-500">Morado</option>
							<option value="bg-red-500">Rojo</option>
							<option value="bg-yellow-500">Amarillo</option>
							<option value="bg-pink-500">Rosa</option>
						</select>
					</div>
				</div>
			{/if}
		</div>
	{/if}

	<!-- 📊 ESTADÍSTICAS PREMIUM MEJORADAS -->
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
		<!-- Total Proyectos -->
		<div class="group relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
			<div class="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
			<div class="relative z-10">
				<div class="flex items-center justify-between mb-4">
					<TrendingUp class="w-8 h-8 text-white" />
					<div class="px-2 py-1 bg-white/20 rounded-full">
						<span class="text-xs font-semibold">+{estadisticas.tendencia}</span>
					</div>
				</div>
				<div>
					<p class="text-sm opacity-90 mb-1">Total Proyectos</p>
					<p class="text-3xl font-bold" in:scale={{ delay: 100 }}>
						{estadisticas.total}
					</p>
					<p class="text-xs opacity-75 mt-2">Gestión completa</p>
				</div>
			</div>
			<div class="absolute -bottom-2 -right-2 w-20 h-20 bg-white/10 rounded-full"></div>
		</div>

		<!-- Proyectos Activos -->
		<div class="group relative overflow-hidden bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
			<div class="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
			<div class="relative z-10">
				<div class="flex items-center justify-between mb-4">
					<Clock class="w-8 h-8 text-white" />
					<div class="px-2 py-1 bg-white/20 rounded-full">
						<Activity class="w-4 h-4" />
					</div>
				</div>
				<div>
					<p class="text-sm opacity-90 mb-1">Proyectos Activos</p>
					<p class="text-3xl font-bold" in:scale={{ delay: 200 }}>
						{estadisticas.activos}
					</p>
					<p class="text-xs opacity-75 mt-2">En desarrollo</p>
				</div>
			</div>
			<div class="absolute -bottom-2 -right-2 w-20 h-20 bg-white/10 rounded-full"></div>
		</div>

		<!-- Completados -->
		<div class="group relative overflow-hidden bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
			<div class="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
			<div class="relative z-10">
				<div class="flex items-center justify-between mb-4">
					<CheckCircle class="w-8 h-8 text-white" />
					<div class="px-2 py-1 bg-white/20 rounded-full">
						<Award class="w-4 h-4" />
					</div>
				</div>
				<div>
					<p class="text-sm opacity-90 mb-1">Completados</p>
					<p class="text-3xl font-bold" in:scale={{ delay: 300 }}>
						{estadisticas.completados}
					</p>
					<p class="text-xs opacity-75 mt-2">Éxitos logrados</p>
				</div>
			</div>
			<div class="absolute -bottom-2 -right-2 w-20 h-20 bg-white/10 rounded-full"></div>
		</div>

		<!-- Productividad Score -->
		<div class="group relative overflow-hidden bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
			<div class="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
			<div class="relative z-10">
				<div class="flex items-center justify-between mb-4">
					<Target class="w-8 h-8 text-white" />
					<div class="px-2 py-1 bg-white/20 rounded-full">
						<Star class="w-4 h-4" />
					</div>
				</div>
				<div>
					<p class="text-sm opacity-90 mb-1">Score Productividad</p>
					<p class="text-3xl font-bold" in:scale={{ delay: 400 }}>
						{estadisticas.productividad}%
					</p>
					<p class="text-xs opacity-75 mt-2">Rendimiento</p>
				</div>
			</div>
			<div class="absolute -bottom-2 -right-2 w-20 h-20 bg-white/10 rounded-full"></div>
		</div>
	</div>

	<!-- 📋 LISTA DE PROYECTOS MEJORADA -->
	<div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
		{#if $cargandoProyectos}
			<div class="flex items-center justify-center py-16">
				<div class="text-center">
					<div class="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
					<p class="text-gray-600 dark:text-gray-400">Cargando proyectos...</p>
				</div>
			</div>
		{:else if proyectosFiltrados.length === 0}
			<div class="text-center py-16">
				<div class="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
					<Rocket class="w-12 h-12 text-gray-400" />
				</div>
				<h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
					{filtro || filtroEstado !== 'todos' ? 'No hay proyectos que coincidan' : '¡Hora de crear tu primer proyecto!'}
				</h3>
				<p class="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
					{filtro || filtroEstado !== 'todos' 
						? 'Intenta ajustar los filtros para encontrar proyectos.'
						: 'Los proyectos te ayudan a organizar y dar seguimiento a tu trabajo de manera eficiente.'
					}
				</p>
				{#if !filtro && filtroEstado === 'todos'}
					<Boton 
						variante="primary" 
						on:click={handleCrearProyecto}
						class="shadow-lg hover:shadow-xl transition-shadow"
					>
						<Plus class="w-5 h-5 mr-2" />
						Crear mi primer proyecto
					</Boton>
				{:else}
					<Boton 
						variante="secondary" 
						on:click={limpiarFiltros}
						class="shadow-lg hover:shadow-xl transition-shadow"
					>
						<Filter class="w-5 h-5 mr-2" />
						Limpiar filtros
					</Boton>
				{/if}
			</div>
		{:else}
			<div class="p-3 sm:p-6">
				<!-- Header de la lista -->
				<div class="flex items-center justify-between mb-4 sm:mb-6">
					<div class="min-w-0 flex-1">
						<h2 class="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center">
							<BarChart3 class="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-blue-500 flex-shrink-0" />
							<span class="truncate">Mis Proyectos</span>
						</h2>
						<p class="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
							{proyectosFiltrados.length} de {$proyectos.length} proyectos
						</p>
					</div>
					<div class="text-right flex-shrink-0 ml-4">
						<div class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
							{estadisticas.promedioCompletacion}%
						</div>
						<div class="text-xs text-gray-500">Completación promedio</div>
					</div>
				</div>

				<!-- Lista de proyectos -->
				<ListaProyectos 
					proyectos={proyectosFiltrados}
					{vista}
					on:seleccionar={handleSeleccionarProyecto}
				/>
			</div>
		{/if}
	</div>
</div>

<!-- 🎯 MODAL PARA NUEVO PROYECTO -->
<Modal bind:abierto={modalNuevo} titulo="Crear Nuevo Proyecto" tamaño="lg">
	<FormularioProyecto 
		on:proyecto-guardado={handleGuardarProyecto}
		on:cancelar={handleCancelarFormulario}
		guardando={guardandoProyecto}
	/>
</Modal> 