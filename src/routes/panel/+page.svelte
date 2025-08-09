<script lang="ts">
	import { onMount } from 'svelte';
	import { user } from '$lib/stores/auth';
	import { negocios, cargarNegocios } from '$lib/stores/negocios';
	import { proyectos, cargarProyectos, tareas, cargarTareasProyecto } from '$lib/stores/proyectos';
	import { movimientos, cargarMovimientos } from '$lib/stores/movimientos';
	import { campañas, cargarCampañas } from '$lib/stores/marketing';
	import { clientes, cargarClientes } from '$lib/stores/clientes';
	import { 
		Calendar,
		TrendingUp, 
		DollarSign, 
		FolderOpen, 
		Building2, 
		Users, 
		CheckCircle,
		Clock,
		AlertTriangle,
		Target,
		BarChart3,
		Plus,
		ArrowRight,
		Zap,
		Crown,
		Sparkles
	} from 'lucide-svelte';
	import TarjetaKPI from '$lib/componentes/dashboard/TarjetaKPI.svelte';
	import GraficoVentas from '$lib/componentes/dashboard/GraficoVentas.svelte';
	import ResumenFinanciero from '$lib/componentes/dashboard/ResumenFinanciero.svelte';
	import TopClientes from '$lib/componentes/dashboard/TopClientes.svelte';
	import TopProductos from '$lib/componentes/dashboard/TopProductos.svelte';
	import AlertasDashboard from '$lib/componentes/dashboard/AlertasDashboard.svelte';
	import CalendarioTareas from '$lib/componentes/dashboard/CalendarioTareas.svelte';

	// Variables reactivas para estadísticas
	$: totalNegocios = $negocios?.length || 0;
	$: totalProyectos = $proyectos?.length || 0;
	$: totalTareas = $tareas?.length || 0;
	$: totalClientes = $clientes?.length || 0;
	$: totalCampañas = $campañas?.length || 0;

	// Estadísticas de tareas
	$: tareasCompletadas = $tareas?.filter(t => t.estado === 'completada')?.length || 0;
	$: tareasPendientes = $tareas?.filter(t => t.estado !== 'completada')?.length || 0;
	$: tareasUrgentes = $tareas?.filter(t => t.prioridad === 'urgente' && t.estado !== 'completada')?.length || 0;

	// Estadísticas financieras
	$: ingresosTotales = $movimientos?.filter(m => m.tipo_movimiento === 'ingreso')?.reduce((sum, m) => sum + m.monto, 0) || 0;
	$: gastosTotales = $movimientos?.filter(m => m.tipo_movimiento === 'gasto')?.reduce((sum, m) => sum + m.monto, 0) || 0;
	$: balanceActual = ingresosTotales - gastosTotales;

	// Estadísticas de marketing
	$: campañasActivas = $campañas?.filter(c => c.estado === 'activa')?.length || 0;
	$: presupuestoMarketing = $campañas?.reduce((sum, c) => sum + (c.presupuesto_total || 0), 0) || 0;

	// Proyectos por estado
	$: proyectosActivos = $proyectos?.filter(p => p.estado === 'activo')?.length || 0;
	$: proyectosCompletados = $proyectos?.filter(p => p.estado === 'completado')?.length || 0;

	// Tareas próximas (próximos 7 días)
	$: tareasProximas = $tareas?.filter(t => {
		if (!t.fecha_limite || t.estado === 'completada') return false;
		const fechaLimite = new Date(t.fecha_limite);
		const ahora = new Date();
		const diasRestantes = (fechaLimite.getTime() - ahora.getTime()) / (1000 * 60 * 60 * 24);
		return diasRestantes >= 0 && diasRestantes <= 7;
	}) || [];

	// Cargar datos al inicializar
	onMount(() => {
		if ($user) {
			cargarTodosLosDatos();
		}
	});

	const cargarTodosLosDatos = async () => {
		try {
			console.log('📊 Cargando datos del dashboard...');
			
			// Cargar datos en paralelo para mejor performance
			await Promise.all([
				cargarNegocios(),
				cargarProyectos(),
				cargarMovimientos(),
				cargarCampañas(),
				cargarClientes()
			]);

			// Cargar tareas de todos los proyectos
			if ($proyectos?.length > 0) {
				const promesasTareas = $proyectos.map(proyecto => 
					cargarTareasProyecto(proyecto.id)
				);
				await Promise.all(promesasTareas);
			}

			console.log('✅ Datos del dashboard cargados');
		} catch (error) {
			console.error('❌ Error cargando datos del dashboard:', error);
		}
	};

	// Función para obtener saludo personalizado
	const obtenerSaludo = () => {
		const hora = new Date().getHours();
		const nombre = $user?.email?.split('@')[0] || 'Usuario';
		
		if (hora < 12) return `¡Buenos días, ${nombre}!`;
		if (hora < 18) return `¡Buenas tardes, ${nombre}!`;
		return `¡Buenas noches, ${nombre}!`;
	};

	// Función para calcular progreso general
	$: progresoGeneral = (() => {
		if (totalTareas === 0) return 0;
		return Math.round((tareasCompletadas / totalTareas) * 100);
	})();
</script>

<svelte:head>
	<title>Dashboard - App Contabilidad</title>
</svelte:head>

<div class="p-6 max-w-7xl mx-auto space-y-8">
	<!-- Header del Dashboard -->
	<div class="flex flex-col lg:flex-row lg:items-center lg:justify-between">
		<div class="mb-6 lg:mb-0">
			<h1 class="text-3xl lg:text-4xl font-extrabold text-gray-900 dark:text-white mb-2">
				{obtenerSaludo()}
			</h1>
			<p class="text-lg text-gray-600 dark:text-gray-400">
				Aquí tienes un resumen de todo tu negocio en tiempo real
			</p>
		</div>
		
		<!-- Acciones rápidas -->
		<div class="flex flex-wrap gap-3">
			<button 
				class="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
				on:click={() => window.location.href = '/panel/proyectos/nuevo'}
			>
				<Plus class="w-4 h-4 mr-2" />
				Nuevo Proyecto
			</button>
			<button 
				class="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
				on:click={() => window.location.href = '/panel/negocios'}
			>
				<Building2 class="w-4 h-4 mr-2" />
				Nuevo Negocio
			</button>
		</div>
	</div>

	<!-- KPIs Principales -->
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
		<TarjetaKPI
			titulo="Balance Total"
			valor="${balanceActual.toLocaleString()}"
			cambio={balanceActual >= 0 ? '+' : ''}
			tendencia={balanceActual >= 0 ? 'up' : 'down'}
			icono={DollarSign}
			color="blue"
		/>
		
		<TarjetaKPI
			titulo="Proyectos Activos"
			valor={proyectosActivos.toString()}
			subtitulo="{totalProyectos} total"
			icono={FolderOpen}
			color="green"
		/>
		
		<TarjetaKPI
			titulo="Tareas Completadas"
			valor="{tareasCompletadas}/{totalTareas}"
			cambio="{progresoGeneral}%"
			tendencia="up"
			icono={CheckCircle}
			color="purple"
		/>
		
		<TarjetaKPI
			titulo="Clientes Activos"
			valor={totalClientes.toString()}
			subtitulo="{campañasActivas} campañas activas"
			icono={Users}
			color="orange"
		/>
	</div>

	<!-- Alertas y Notificaciones -->
	{#if tareasUrgentes > 0 || tareasProximas.length > 0}
		<AlertasDashboard 
			{tareasUrgentes}
			{tareasProximas}
		/>
	{/if}

	<!-- Contenido Principal -->
	<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
		<!-- Columna Principal -->
		<div class="lg:col-span-2 space-y-8">
			<!-- Gráfico de Ventas -->
			<GraficoVentas movimientos={$movimientos || []} />
		</div>
		
		<!-- Columna Lateral -->
		<div class="space-y-8">
			<!-- Top Clientes -->
			<TopClientes clientes={$clientes || []} />
			
			<!-- Proyectos Recientes -->
			<div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
				<div class="flex items-center justify-between mb-6">
					<h3 class="text-lg font-semibold text-gray-900 dark:text-white">
						Proyectos Recientes
					</h3>
					<a 
						href="/panel/proyectos"
						class="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium"
					>
						Ver todos →
					</a>
				</div>
				
				<div class="space-y-4">
					{#each ($proyectos || []).slice(0, 5) as proyecto}
						<div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
							<div>
								<h4 class="font-medium text-gray-900 dark:text-white text-sm">
									{proyecto.nombre}
								</h4>
								<p class="text-xs text-gray-500 dark:text-gray-400">
									{proyecto.estado === 'activo' ? '🟢 Activo' : 
									 proyecto.estado === 'completado' ? '✅ Completado' : 
									 '⏸️ Pausado'}
								</p>
							</div>
							<div class="text-xs text-gray-500">
								{proyecto.progreso || 0}%
							</div>
						</div>
					{:else}
						<div class="text-center py-8">
							<FolderOpen class="w-12 h-12 text-gray-400 mx-auto mb-3" />
							<p class="text-gray-500 dark:text-gray-400">No hay proyectos aún</p>
							<button 
								class="mt-3 text-blue-600 hover:text-blue-700 text-sm font-medium"
								on:click={() => window.location.href = '/panel/proyectos/nuevo'}
							>
								Crear el primero →
							</button>
						</div>
					{/each}
				</div>
			</div>

			<!-- Campañas de Marketing -->
			<div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
				<div class="flex items-center justify-between mb-6">
					<h3 class="text-lg font-semibold text-gray-900 dark:text-white">
						Marketing
					</h3>
					<a 
						href="/panel/marketing"
						class="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium"
					>
						Ver todas →
					</a>
				</div>
				
				<div class="space-y-4">
					{#if totalCampañas > 0}
						<div class="grid grid-cols-2 gap-4">
							<div class="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
								<div class="text-2xl font-bold text-green-600 dark:text-green-400">
									{campañasActivas}
								</div>
								<div class="text-xs text-green-600 dark:text-green-400">
									Activas
								</div>
							</div>
							<div class="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
								<div class="text-2xl font-bold text-blue-600 dark:text-blue-400">
									${presupuestoMarketing.toLocaleString()}
								</div>
								<div class="text-xs text-blue-600 dark:text-blue-400">
									Presupuesto
								</div>
							</div>
						</div>
						
						<div class="space-y-2">
							{#each ($campañas || []).slice(0, 3) as campaña}
								<div class="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
									<div class="flex items-center justify-between">
										<h4 class="font-medium text-gray-900 dark:text-white text-sm">
											{campaña.nombre}
										</h4>
										<span class="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded">
											{campaña.plataforma}
										</span>
									</div>
									<p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
										${campaña.presupuesto_total} presupuesto
									</p>
								</div>
							{/each}
						</div>
					{:else}
						<div class="text-center py-8">
							<Target class="w-12 h-12 text-gray-400 mx-auto mb-3" />
							<p class="text-gray-500 dark:text-gray-400">No hay campañas aún</p>
							<button 
								class="mt-3 text-blue-600 hover:text-blue-700 text-sm font-medium"
								on:click={() => window.location.href = '/panel/marketing'}
							>
								Crear la primera →
							</button>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>

	<!-- Sección de Tareas y Calendario -->
	<div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
		<!-- Tareas Próximas -->
		<div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
			<div class="flex items-center justify-between mb-6">
				<h3 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
					<Clock class="w-5 h-5 mr-2 text-orange-500" />
					Tareas Próximas (7 días)
				</h3>
				<span class="text-sm text-gray-500">
					{tareasProximas.length} tareas
				</span>
			</div>
			
			<div class="space-y-3">
				{#each tareasProximas.slice(0, 5) as tarea}
					<div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
						<div class="flex-1">
							<h4 class="font-medium text-gray-900 dark:text-white text-sm">
								{tarea.titulo}
							</h4>
							<div class="flex items-center mt-1 space-x-2">
								<span class="text-xs px-2 py-1 rounded {
									tarea.prioridad === 'urgente' ? 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300' :
									tarea.prioridad === 'alta' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300' :
									tarea.prioridad === 'media' ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300' :
									'bg-gray-100 text-gray-600 dark:bg-gray-600 dark:text-gray-300'
								}">
									{tarea.prioridad === 'urgente' ? '🔴 Urgente' :
									 tarea.prioridad === 'alta' ? '🟠 Alta' :
									 tarea.prioridad === 'media' ? '🟡 Media' : '🟢 Baja'}
								</span>
								{#if tarea.fecha_limite}
									<span class="text-xs text-gray-500">
										{new Date(tarea.fecha_limite).toLocaleDateString('es-ES')}
									</span>
								{/if}
							</div>
						</div>
					</div>
				{:else}
					<div class="text-center py-8">
						<CheckCircle class="w-12 h-12 text-green-400 mx-auto mb-3" />
						<p class="text-gray-500 dark:text-gray-400">
							¡Genial! No tienes tareas próximas por vencer
						</p>
					</div>
				{/each}
			</div>
		</div>

		<!-- Calendario Simplificado -->
		<div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
			<div class="flex items-center justify-between mb-6">
				<h3 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
					<Calendar class="w-5 h-5 mr-2 text-blue-500" />
					Calendario
				</h3>
				<button class="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium">
					Ver completo →
				</button>
			</div>
			
			<!-- Mini calendario con tareas -->
			<div class="space-y-4">
				<div class="text-center">
					<h4 class="text-2xl font-bold text-gray-900 dark:text-white">
						{new Date().toLocaleDateString('es-ES', { 
							weekday: 'long', 
							year: 'numeric', 
							month: 'long', 
							day: 'numeric' 
						})}
					</h4>
				</div>
				
				<!-- Progreso del día -->
				<div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
					<div class="flex items-center justify-between mb-2">
						<span class="text-sm font-medium text-gray-700 dark:text-gray-300">
							Progreso del día
						</span>
						<span class="text-sm text-gray-500">
							{progresoGeneral}%
						</span>
					</div>
					<div class="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
						<div 
							class="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
							style="width: {progresoGeneral}%"
						></div>
					</div>
				</div>

				<!-- Resumen rápido -->
				<div class="grid grid-cols-2 gap-4">
					<div class="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
						<div class="text-xl font-bold text-blue-600 dark:text-blue-400">
							{totalNegocios}
						</div>
						<div class="text-xs text-blue-600 dark:text-blue-400">
							Negocios
						</div>
					</div>
					<div class="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
						<div class="text-xl font-bold text-purple-600 dark:text-purple-400">
							{totalProyectos}
						</div>
						<div class="text-xs text-purple-600 dark:text-purple-400">
							Proyectos
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Calendario Completo -->
	<div class="mt-8">
		<CalendarioTareas 
			tareas={$tareas || []}
			on:nueva-tarea={() => window.location.href = '/panel/proyectos'}
			on:click-dia={(event) => console.log('Día clickeado:', event.detail)}
			on:ver-todas-tareas={() => window.location.href = '/panel/tareas'}
		/>
	</div>

	<!-- Footer con estadísticas adicionales -->
	<div class="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-xl p-6 text-white">
		<div class="grid grid-cols-2 md:grid-cols-4 gap-6">
			<div class="text-center">
				<div class="text-2xl font-bold mb-1">{totalTareas}</div>
				<div class="text-sm opacity-80">Total Tareas</div>
			</div>
			<div class="text-center">
				<div class="text-2xl font-bold mb-1">{totalClientes}</div>
				<div class="text-sm opacity-80">Clientes</div>
			</div>
			<div class="text-center">
				<div class="text-2xl font-bold mb-1">{totalCampañas}</div>
				<div class="text-sm opacity-80">Campañas</div>
			</div>
			<div class="text-center">
				<div class="text-2xl font-bold mb-1">{progresoGeneral}%</div>
				<div class="text-sm opacity-80">Completado</div>
			</div>
		</div>
	</div>
</div> 