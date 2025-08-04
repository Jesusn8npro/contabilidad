<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { derived } from 'svelte/store';
	import { 
		TrendingUp, 
		TrendingDown, 
		DollarSign, 
		CreditCard, 
		PieChart, 
		BarChart3,
		Calendar,
		Download,
		Filter,
		Plus,
		ArrowUpRight,
		ArrowDownRight,
		Building2,
		Wallet,
		Target,
		Activity
	} from 'lucide-svelte';
	import Boton from '$lib/componentes/ui/Boton.svelte';
	import Input from '$lib/componentes/ui/Input.svelte';
	import Modal from '$lib/componentes/ui/Modal.svelte';
	import FormularioMovimiento from '$lib/componentes/movimientos/FormularioMovimiento.svelte';
	import TarjetaMovimiento from '$lib/componentes/movimientos/TarjetaMovimiento.svelte';
	import { movimientos, cargarMovimientos, cargandoMovimientos, crearMovimiento } from '$lib/stores/movimientos';
	import { negocios, cargarNegocios, cargandoNegocios } from '$lib/stores/negocios';
	import { categorias, cargarCategorias } from '$lib/stores/movimientos';
	import { abrirModal, cerrarModal } from '$lib/stores/ui';

	// Estado local
	let periodoSeleccionado = 'este-mes';
	let tipoGrafico = 'barras';
	let modalMovimiento = false;
	let guardandoMovimiento = false;

	// Métricas calculadas en tiempo real
	$: metricasFinancieras = {
		ingresosTotales: $movimientos
			.filter(m => m.tipo_movimiento === 'ingreso')
			.reduce((sum, m) => sum + m.monto, 0),
		gastosTotales: $movimientos
			.filter(m => m.tipo_movimiento === 'gasto')
			.reduce((sum, m) => sum + m.monto, 0),
		beneficioNeto: 0,
		transaccionesTotal: $movimientos.length,
		promedioTransaccion: $movimientos.length > 0 
			? $movimientos.reduce((sum, m) => sum + m.monto, 0) / $movimientos.length 
			: 0,
		negociosActivos: $negocios.filter(n => n.activo !== false).length
	};

	// Calcular beneficio neto
	$: metricasFinancieras.beneficioNeto = metricasFinancieras.ingresosTotales - metricasFinancieras.gastosTotales;

	// Movimientos recientes (últimos 10)
	$: movimientosRecientes = $movimientos
		.sort((a, b) => new Date(b.fecha_movimiento).getTime() - new Date(a.fecha_movimiento).getTime())
		.slice(0, 10);

	// Ingresos por categoría (agrupados)
	$: ingresosPorCategoria = $movimientos
		.filter(m => m.tipo_movimiento === 'ingreso')
		.reduce((acc, m) => {
			const key = m.categoria_id || 'Sin categoría';
			if (!acc[key]) {
				acc[key] = { total: 0, count: 0 };
			}
			acc[key].total += m.monto;
			acc[key].count += 1;
			return acc;
		}, {} as Record<string, { total: number; count: number }>);

	// Gastos por categoría (agrupados)  
	$: gastosPorCategoria = $movimientos
		.filter(m => m.tipo_movimiento === 'gasto')
		.reduce((acc, m) => {
			const key = m.categoria_id || 'Sin categoría';
			if (!acc[key]) {
				acc[key] = { total: 0, count: 0 };
			}
			acc[key].total += m.monto;
			acc[key].count += 1;
			return acc;
		}, {} as Record<string, { total: number; count: number }>);

	// Formatear moneda
	const formatearMoneda = (monto: number) => {
		return `$${monto.toLocaleString()}`;
	};

	// Cargar datos al montar
	onMount(async () => {
		if (!browser) return;
		
		try {
			await Promise.all([
				cargarMovimientos(),
				cargarNegocios()
			]);
		} catch (error) {
			console.error('Error cargando datos financieros:', error);
		}
	});
</script>

<svelte:head>
	<title>Finanzas - Panel de Control</title>
</svelte:head>

<!-- Header mejorado -->
<div class="bg-gradient-to-r from-blue-600 to-purple-700 text-white">
	<div class="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
		<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
			<div class="mb-4 sm:mb-0">
				<h1 class="text-2xl sm:text-3xl font-bold flex items-center">
					<DollarSign class="w-6 h-6 sm:w-8 sm:h-8 mr-3" />
					Finanzas
				</h1>
				<p class="text-blue-100 mt-1 text-sm sm:text-base">Dashboard financiero completo con métricas y análisis</p>
			</div>
			
			<!-- Botones de acción épicos -->
			<div class="flex flex-col sm:flex-row gap-3 sm:gap-4">
				<!-- Botón Exportar -->
				<button
					class="group relative flex items-center justify-center px-6 py-3 overflow-hidden text-sm font-semibold text-white transition-all duration-300 ease-out bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl hover:bg-white/30 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-white/25 transform hover:shadow-2xl hover:shadow-white/20 w-full sm:w-auto"
				>
					<span class="absolute inset-0 w-full h-full bg-gradient-to-r from-white/10 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
					<Download class="relative w-4 h-4 mr-2 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
					<span class="relative font-bold">Exportar</span>
					<div class="absolute inset-0 rounded-xl bg-white/10 opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-all duration-300"></div>
				</button>
					
				<!-- Botón Nuevo Movimiento -->
				<button
					on:click={abrirModalMovimiento}
					class="group relative flex items-center justify-center px-8 py-3 overflow-hidden text-sm font-bold text-blue-600 transition-all duration-300 ease-out bg-white rounded-xl shadow-lg hover:shadow-2xl hover:shadow-white/50 focus:outline-none focus:ring-4 focus:ring-white/50 transform hover:scale-110 hover:-translate-y-1 active:translate-y-0 w-full sm:w-auto"
				>
					<!-- Efecto shimmer -->
					<span class="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-blue-200/30 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-shimmer transition-opacity duration-300"></span>
					
					<!-- Contenido del botón -->
					<div class="relative flex items-center">
						<div class="relative">
							<Plus class="w-5 h-5 mr-3 transition-all duration-300 group-hover:scale-125 group-hover:rotate-180" />
							<!-- Efecto de brillo en el ícono -->
							<div class="absolute inset-0 w-5 h-5 bg-blue-300/40 rounded-full opacity-0 group-hover:opacity-100 animate-ping"></div>
						</div>
						<span class="font-black text-lg">Nuevo Movimiento</span>
						<div class="w-2 h-2 bg-blue-400 rounded-full ml-3 animate-pulse group-hover:animate-bounce"></div>
					</div>
					
					<!-- Partículas mágicas -->
					<div class="absolute inset-0 pointer-events-none">
						<div class="absolute top-2 left-4 w-1 h-1 bg-blue-300 rounded-full opacity-0 group-hover:opacity-100 animate-ping animation-delay-300"></div>
						<div class="absolute top-4 right-6 w-1 h-1 bg-purple-300 rounded-full opacity-0 group-hover:opacity-100 animate-ping animation-delay-500"></div>
						<div class="absolute bottom-3 left-6 w-1 h-1 bg-green-300 rounded-full opacity-0 group-hover:opacity-100 animate-ping animation-delay-700"></div>
					</div>
					
					<!-- Efecto de onda -->
					<div class="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400/20 to-purple-400/20 opacity-0 group-hover:opacity-100 scale-0 group-hover:scale-150 transition-all duration-700"></div>
				</button>
			</div>
		</div>
	</div>
</div>

<!-- Contenido principal -->
<div class="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">

	<!-- Métricas principales -->
	<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
		<!-- Ingresos Totales -->
		<div class="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
			<div class="flex items-center justify-between">
				<div class="flex-1">
					<p class="text-sm font-medium text-gray-600 dark:text-gray-400">Ingresos Totales</p>
					<p class="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
						{formatearMoneda(metricasFinancieras.ingresosTotales)}
					</p>
					<p class="text-sm text-green-600 dark:text-green-400 mt-1 flex items-center">
						<ArrowUpRight class="w-4 h-4 mr-1" />
						Ingresos
					</p>
				</div>
				<div class="flex-shrink-0 p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
					<TrendingUp class="w-6 h-6 text-green-600 dark:text-green-400" />
				</div>
			</div>
		</div>

		<!-- Gastos Totales -->
		<div class="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
			<div class="flex items-center justify-between">
				<div class="flex-1">
					<p class="text-sm font-medium text-gray-600 dark:text-gray-400">Gastos Totales</p>
					<p class="text-2xl sm:text-3xl font-bold text-red-600 dark:text-red-400 mt-2">
						{formatearMoneda(metricasFinancieras.gastosTotales)}
					</p>
					<p class="text-sm text-red-600 dark:text-red-400 mt-1 flex items-center">
						<ArrowDownRight class="w-4 h-4 mr-1" />
						Gastos
					</p>
				</div>
				<div class="flex-shrink-0 p-3 bg-red-100 dark:bg-red-900/20 rounded-lg">
					<TrendingDown class="w-6 h-6 text-red-600 dark:text-red-400" />
				</div>
			</div>
		</div>

		<!-- Beneficio Neto -->
		<div class="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
			<div class="flex items-center justify-between">
				<div class="flex-1">
					<p class="text-sm font-medium text-gray-600 dark:text-gray-400">Beneficio Neto</p>
					<p class="text-2xl sm:text-3xl font-bold {metricasFinancieras.beneficioNeto >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'} mt-2">
						{formatearMoneda(metricasFinancieras.beneficioNeto)}
					</p>
					<p class="text-sm {metricasFinancieras.beneficioNeto >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'} mt-1 flex items-center">
						<Activity class="w-4 h-4 mr-1" />
						Balance
					</p>
				</div>
				<div class="flex-shrink-0 p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
					<DollarSign class="w-6 h-6 text-blue-600 dark:text-blue-400" />
				</div>
			</div>
		</div>

		<!-- Transacciones -->
		<div class="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
			<div class="flex items-center justify-between">
				<div class="flex-1">
					<p class="text-sm font-medium text-gray-600 dark:text-gray-400">Transacciones</p>
					<p class="text-2xl sm:text-3xl font-bold text-purple-600 dark:text-purple-400 mt-2">
						{metricasFinancieras.transaccionesTotal}
					</p>
					<p class="text-sm text-purple-600 dark:text-purple-400 mt-1 flex items-center">
						<CreditCard class="w-4 h-4 mr-1" />
						Total
					</p>
				</div>
				<div class="flex-shrink-0 p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
					<Wallet class="w-6 h-6 text-purple-600 dark:text-purple-400" />
				</div>
			</div>
		</div>
	</div>

	<!-- Movimientos Recientes -->
	<div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
		<div class="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
			<div class="flex items-center justify-between">
				<h3 class="text-lg font-semibold text-gray-900 dark:text-white">Transacciones Recientes</h3>
				<Boton variante="ghost" clase="text-sm">
					Ver todas
				</Boton>
			</div>
		</div>
		<div class="p-4 sm:p-6">
			{#if $cargandoMovimientos}
				<div class="flex items-center justify-center py-8">
					<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
				</div>
			{:else if movimientosRecientes.length === 0}
				<div class="text-center py-8">
					<DollarSign class="w-12 h-12 mx-auto text-gray-400 mb-4" />
					<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
						No hay movimientos
					</h3>
					<p class="text-gray-600 dark:text-gray-400 mb-6">
						Empieza creando tu primer ingreso o gasto.
					</p>
					<Boton>
						<Plus class="w-4 h-4 mr-2" />
						Crear Movimiento
					</Boton>
				</div>
			{:else}
				<div class="space-y-3">
					{#each movimientosRecientes as movimiento (movimiento.id)}
						<TarjetaMovimiento {movimiento} mostrarNegocio={true} />
					{/each}
				</div>
			{/if}
		</div>
	</div>

	<!-- Métricas Adicionales -->
	<div class="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
		<!-- Negocios Activos -->
		<div class="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
			<div class="flex items-center justify-between mb-4">
				<h3 class="text-lg font-semibold text-gray-900 dark:text-white">Negocios</h3>
				<Building2 class="w-5 h-5 text-gray-400" />
			</div>
			<div class="space-y-3">
				<div class="flex items-center justify-between">
					<span class="text-sm text-gray-600 dark:text-gray-400">Negocios Activos</span>
					<span class="font-bold text-gray-900 dark:text-white">{metricasFinancieras.negociosActivos}</span>
				</div>
				<div class="flex items-center justify-between">
					<span class="text-sm text-gray-600 dark:text-gray-400">Promedio por Transacción</span>
					<span class="font-bold text-gray-900 dark:text-white">{formatearMoneda(metricasFinancieras.promedioTransaccion)}</span>
				</div>
			</div>
		</div>

		<!-- Resumen por Categorías -->
		<div class="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
			<div class="flex items-center justify-between mb-4">
				<h3 class="text-lg font-semibold text-gray-900 dark:text-white">Categorías</h3>
				<PieChart class="w-5 h-5 text-gray-400" />
			</div>
			<div class="space-y-2">
				{#each Object.entries(ingresosPorCategoria).slice(0, 3) as [categoria, datos]}
					<div class="flex items-center justify-between">
						<span class="text-sm text-gray-600 dark:text-gray-400 truncate">{categoria}</span>
						<span class="font-bold text-green-600 dark:text-green-400">{formatearMoneda(datos.total)}</span>
					</div>
				{/each}
				{#if Object.keys(ingresosPorCategoria).length === 0}
					<p class="text-sm text-gray-500 dark:text-gray-400">No hay datos de categorías</p>
				{/if}
			</div>
		</div>
	</div>

</div> 