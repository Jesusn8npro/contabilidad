<script lang="ts">
	import { onMount } from 'svelte';
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
		ArrowDownRight
	} from 'lucide-svelte';
	import Boton from '$lib/componentes/ui/Boton.svelte';
	import Input from '$lib/componentes/ui/Input.svelte';

	// Estado local
	let periodoSeleccionado = 'este-mes';
	let tipoGrafico = 'barras';
	let cargando = false;

	// Datos simulados para mostrar la funcionalidad
	const metricasFinancieras = {
		ingresosTotales: 45750.00,
		gastosTotales: 18420.50,
		beneficioNeto: 27329.50,
		roi: 148.5,
		crecimientoIngresos: 12.3,
		crecimientoGastos: -5.8,
		transaccionesTotal: 156,
		promedioTransaccion: 293.27
	};

	// Datos para gráficos (simulados)
	const datosIngresosPorMes = [
		{ mes: 'Ene', ingresos: 3200, gastos: 1400 },
		{ mes: 'Feb', ingresos: 3800, gastos: 1600 },
		{ mes: 'Mar', ingresos: 4200, gastos: 1550 },
		{ mes: 'Abr', ingresos: 3900, gastos: 1700 },
		{ mes: 'May', ingresos: 4500, gastos: 1800 },
		{ mes: 'Jun', ingresos: 5100, gastos: 1920 }
	];

	const categoriesIngresos = [
		{ categoria: 'Freelance', monto: 18500, porcentaje: 40.4, color: '#3b82f6' },
		{ categoria: 'Productos', monto: 12200, porcentaje: 26.7, color: '#10b981' },
		{ categoria: 'Servicios', monto: 8750, porcentaje: 19.1, color: '#f59e0b' },
		{ categoria: 'Inversiones', monto: 6300, porcentaje: 13.8, color: '#8b5cf6' }
	];

	const categoriesGastos = [
		{ categoria: 'Software', monto: 4200, porcentaje: 22.8, color: '#ef4444' },
		{ categoria: 'Marketing', monto: 3800, porcentaje: 20.6, color: '#f97316' },
		{ categoria: 'Oficina', monto: 3200, porcentaje: 17.4, color: '#84cc16' },
		{ categoria: 'Viajes', monto: 2900, porcentaje: 15.7, color: '#06b6d4' },
		{ categoria: 'Otros', monto: 4320.5, porcentaje: 23.5, color: '#6b7280' }
	];

	// Transacciones recientes (simuladas)
	const transaccionesRecientes = [
		{
			id: '1',
			descripcion: 'Desarrollo web - Cliente ABC',
			monto: 2500,
			tipo: 'ingreso',
			categoria: 'Freelance',
			fecha: '2024-01-18T10:30:00Z',
			metodo: 'transferencia'
		},
		{
			id: '2',
			descripcion: 'Suscripción Adobe Creative Suite',
			monto: -52.99,
			tipo: 'gasto',
			categoria: 'Software',
			fecha: '2024-01-17T14:20:00Z',
			metodo: 'tarjeta'
		},
		{
			id: '3',
			descripcion: 'Venta productos premium',
			monto: 850,
			tipo: 'ingreso',
			categoria: 'Productos',
			fecha: '2024-01-16T09:15:00Z',
			metodo: 'tarjeta'
		},
		{
			id: '4',
			descripcion: 'Campaña Google Ads',
			monto: -320,
			tipo: 'gasto',
			categoria: 'Marketing',
			fecha: '2024-01-15T16:45:00Z',
			metodo: 'tarjeta'
		},
		{
			id: '5',
			descripcion: 'Consultoría estratégica',
			monto: 1200,
			tipo: 'ingreso',
			categoria: 'Servicios',
			fecha: '2024-01-14T11:20:00Z',
			metodo: 'transferencia'
		}
	];

	onMount(() => {
		cargarDatosFinancieros();
	});

	const cargarDatosFinancieros = async () => {
		cargando = true;
		// Simular carga de datos
		await new Promise(resolve => setTimeout(resolve, 1000));
		cargando = false;
	};

	const formatearMoneda = (monto: number) => {
		return new Intl.NumberFormat('es-US', {
			style: 'currency',
			currency: 'USD',
			minimumFractionDigits: 2
		}).format(Math.abs(monto));
	};

	const formatearFecha = (fecha: string) => {
		return new Date(fecha).toLocaleDateString('es-ES', {
			day: '2-digit',
			month: 'short',
			hour: '2-digit',
			minute: '2-digit'
		});
	};

	// Generar datos para el gráfico de barras (simulado)
	const generarGraficoBarras = () => {
		const maxValor = Math.max(...datosIngresosPorMes.map(d => Math.max(d.ingresos, d.gastos)));
		return datosIngresosPorMes.map(datos => ({
			...datos,
			alturaIngresos: (datos.ingresos / maxValor) * 200,
			alturaGastos: (datos.gastos / maxValor) * 200
		}));
	};

	$: datosGrafico = generarGraficoBarras();
</script>

<svelte:head>
	<title>Finanzas - App Contabilidad</title>
</svelte:head>

<!-- Header de la página -->
<div class="flex flex-col space-y-6">
	<!-- Header superior -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold text-gray-900 dark:text-white">Finanzas</h1>
			<p class="text-gray-600 dark:text-gray-400 mt-1">
				Dashboard financiero completo con métricas y análisis
			</p>
		</div>
		
		<div class="flex items-center space-x-3">
			<select 
				bind:value={periodoSeleccionado}
				class="bg-white/80 dark:bg-gray-700/80 border border-gray-200/50 dark:border-gray-600/50 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
			>
				<option value="esta-semana">Esta Semana</option>
				<option value="este-mes">Este Mes</option>
				<option value="ultimo-trimestre">Último Trimestre</option>
				<option value="este-año">Este Año</option>
			</select>
			
			<Boton variante="secundario" tamaño="sm">
				<Download class="w-4 h-4 mr-2" />
				Exportar
			</Boton>
			
			<Boton>
				<Plus class="w-4 h-4 mr-2" />
				Nuevo Movimiento
			</Boton>
		</div>
	</div>

	<!-- Métricas principales -->
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
		<!-- Ingresos Totales -->
		<div class="relative overflow-hidden bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-green-100 text-sm font-medium">Ingresos Totales</p>
					<p class="text-3xl font-bold mt-1">{formatearMoneda(metricasFinancieras.ingresosTotales)}</p>
					<div class="flex items-center mt-2">
						<ArrowUpRight class="w-4 h-4 mr-1" />
						<span class="text-green-100 text-sm">+{metricasFinancieras.crecimientoIngresos}%</span>
					</div>
				</div>
				<div class="p-3 bg-white/20 rounded-xl">
					<TrendingUp class="w-6 h-6" />
				</div>
			</div>
			<div class="absolute -bottom-2 -right-2 w-20 h-20 bg-white/10 rounded-full"></div>
		</div>

		<!-- Gastos Totales -->
		<div class="relative overflow-hidden bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6 text-white">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-red-100 text-sm font-medium">Gastos Totales</p>
					<p class="text-3xl font-bold mt-1">{formatearMoneda(metricasFinancieras.gastosTotales)}</p>
					<div class="flex items-center mt-2">
						<ArrowDownRight class="w-4 h-4 mr-1" />
						<span class="text-red-100 text-sm">{metricasFinancieras.crecimientoGastos}%</span>
					</div>
				</div>
				<div class="p-3 bg-white/20 rounded-xl">
					<TrendingDown class="w-6 h-6" />
				</div>
			</div>
			<div class="absolute -bottom-2 -right-2 w-20 h-20 bg-white/10 rounded-full"></div>
		</div>

		<!-- Beneficio Neto -->
		<div class="relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-blue-100 text-sm font-medium">Beneficio Neto</p>
					<p class="text-3xl font-bold mt-1">{formatearMoneda(metricasFinancieras.beneficioNeto)}</p>
					<div class="flex items-center mt-2">
						<DollarSign class="w-4 h-4 mr-1" />
						<span class="text-blue-100 text-sm">ROI {metricasFinancieras.roi}%</span>
					</div>
				</div>
				<div class="p-3 bg-white/20 rounded-xl">
					<DollarSign class="w-6 h-6" />
				</div>
			</div>
			<div class="absolute -bottom-2 -right-2 w-20 h-20 bg-white/10 rounded-full"></div>
		</div>

		<!-- Transacciones -->
		<div class="relative overflow-hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-gray-600 dark:text-gray-400 text-sm font-medium">Transacciones</p>
					<p class="text-3xl font-bold text-gray-900 dark:text-white mt-1">{metricasFinancieras.transaccionesTotal}</p>
					<p class="text-gray-600 dark:text-gray-400 text-sm mt-2">
						Promedio: {formatearMoneda(metricasFinancieras.promedioTransaccion)}
					</p>
				</div>
				<div class="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
					<CreditCard class="w-6 h-6 text-purple-600 dark:text-purple-400" />
				</div>
			</div>
			<div class="absolute -bottom-2 -right-2 w-20 h-20 bg-gradient-to-br from-purple-500/10 to-purple-600/20 rounded-full"></div>
		</div>
	</div>

	<!-- Gráficos y análisis -->
	<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
		<!-- Gráfico principal -->
		<div class="lg:col-span-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6">
			<div class="flex items-center justify-between mb-6">
				<h3 class="text-lg font-semibold text-gray-900 dark:text-white">Tendencia Financiera</h3>
				<div class="flex items-center space-x-2">
					<button 
						class="p-2 rounded-lg {tipoGrafico === 'barras' ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}"
						on:click={() => tipoGrafico = 'barras'}
					>
						<BarChart3 class="w-4 h-4" />
					</button>
					<button 
						class="p-2 rounded-lg {tipoGrafico === 'linea' ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}"
						on:click={() => tipoGrafico = 'linea'}
					>
						<TrendingUp class="w-4 h-4" />
					</button>
				</div>
			</div>
			
			<!-- Gráfico de barras SVG personalizado -->
			<div class="relative h-64 w-full">
				<svg class="w-full h-full" viewBox="0 0 600 250">
					<!-- Líneas de guía -->
					<defs>
						<linearGradient id="ingresoGradient" x1="0%" y1="0%" x2="0%" y2="100%">
							<stop offset="0%" style="stop-color:#10b981;stop-opacity:0.8" />
							<stop offset="100%" style="stop-color:#10b981;stop-opacity:0.2" />
						</linearGradient>
						<linearGradient id="gastoGradient" x1="0%" y1="0%" x2="0%" y2="100%">
							<stop offset="0%" style="stop-color:#ef4444;stop-opacity:0.8" />
							<stop offset="100%" style="stop-color:#ef4444;stop-opacity:0.2" />
						</linearGradient>
					</defs>
					
					<!-- Líneas de grilla -->
					{#each [0, 50, 100, 150, 200] as y}
						<line x1="40" y1={y + 30} x2="580" y2={y + 30} stroke="#e5e7eb" stroke-width="1" opacity="0.5"/>
					{/each}
					
					<!-- Barras -->
					{#each datosGrafico as dato, i}
						<g transform="translate({70 + i * 80}, 30)">
							<!-- Barra de ingresos -->
							<rect 
								x="0" 
								y={200 - dato.alturaIngresos} 
								width="25" 
								height={dato.alturaIngresos}
								fill="url(#ingresoGradient)"
								rx="3"
							/>
							
							<!-- Barra de gastos -->
							<rect 
								x="30" 
								y={200 - dato.alturaGastos} 
								width="25" 
								height={dato.alturaGastos}
								fill="url(#gastoGradient)"
								rx="3"
							/>
							
							<!-- Etiqueta del mes -->
							<text x="27" y="220" text-anchor="middle" class="text-xs fill-gray-600 dark:fill-gray-400">
								{dato.mes}
							</text>
						</g>
					{/each}
				</svg>
				
				<!-- Leyenda -->
				<div class="absolute bottom-0 left-0 flex items-center space-x-6 text-sm">
					<div class="flex items-center space-x-2">
						<div class="w-3 h-3 bg-green-500 rounded"></div>
						<span class="text-gray-600 dark:text-gray-400">Ingresos</span>
					</div>
					<div class="flex items-center space-x-2">
						<div class="w-3 h-3 bg-red-500 rounded"></div>
						<span class="text-gray-600 dark:text-gray-400">Gastos</span>
					</div>
				</div>
			</div>
		</div>

		<!-- Distribución por categorías -->
		<div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6">
			<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-6">Ingresos por Categoría</h3>
			
			<div class="space-y-4">
				{#each categoriesIngresos as categoria}
					<div class="flex items-center justify-between">
						<div class="flex items-center space-x-3">
							<div class="w-3 h-3 rounded-full" style="background-color: {categoria.color}"></div>
							<span class="text-sm font-medium text-gray-900 dark:text-white">{categoria.categoria}</span>
						</div>
						<div class="text-right">
							<div class="text-sm font-semibold text-gray-900 dark:text-white">
								{formatearMoneda(categoria.monto)}
							</div>
							<div class="text-xs text-gray-500 dark:text-gray-400">
								{categoria.porcentaje}%
							</div>
						</div>
					</div>
					<div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
						<div 
							class="h-2 rounded-full transition-all duration-500"
							style="width: {categoria.porcentaje}%; background-color: {categoria.color}"
						></div>
					</div>
				{/each}
			</div>
		</div>
	</div>

	<!-- Transacciones recientes -->
	<div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
		<div class="flex items-center justify-between p-6 border-b border-gray-200/50 dark:border-gray-700/50">
			<h3 class="text-lg font-semibold text-gray-900 dark:text-white">Transacciones Recientes</h3>
			<Boton variante="fantasma" tamaño="sm">
				Ver todas
			</Boton>
		</div>
		
		<div class="divide-y divide-gray-200/50 dark:divide-gray-700/50">
			{#each transaccionesRecientes as transaccion (transaccion.id)}
				<div class="flex items-center justify-between p-6 hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors">
					<div class="flex items-center space-x-4">
						<div class="p-3 rounded-xl {transaccion.tipo === 'ingreso' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}">
							{#if transaccion.tipo === 'ingreso'}
								<ArrowUpRight class="w-5 h-5 text-green-600 dark:text-green-400" />
							{:else}
								<ArrowDownRight class="w-5 h-5 text-red-600 dark:text-red-400" />
							{/if}
						</div>
						
						<div>
							<h4 class="font-medium text-gray-900 dark:text-white">{transaccion.descripcion}</h4>
							<div class="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
								<span>{transaccion.categoria}</span>
								<span>•</span>
								<span>{formatearFecha(transaccion.fecha)}</span>
								<span>•</span>
								<span class="capitalize">{transaccion.metodo}</span>
							</div>
						</div>
					</div>
					
					<div class="text-right">
						<div class="font-semibold {transaccion.tipo === 'ingreso' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}">
							{transaccion.tipo === 'ingreso' ? '+' : ''}{formatearMoneda(transaccion.monto)}
						</div>
					</div>
				</div>
			{/each}
		</div>
	</div>
</div> 