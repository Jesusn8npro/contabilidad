<script lang="ts">
	import { onMount } from 'svelte';
	import { finanzasPersonales, finanzasPersonalesStore, cargandoFinanzas } from '$lib/stores/finanzas-personales';
	import { user } from '$lib/stores/auth';
	import { Plus, TrendingDown, DollarSign, Calendar } from 'lucide-svelte';
	import TarjetaEstadistica from '$lib/componentes/ui/TarjetaEstadistica.svelte';
	import Boton from '$lib/componentes/ui/Boton.svelte';

	// Cargar datos al montar el componente
	onMount(async () => {
		if ($user) {
			await finanzasPersonalesStore.cargar($user);
		}
	});

	// Métricas calculadas
	$: totalGastos = $finanzasPersonales
		.filter(m => m.tipo === 'gasto')
		.reduce((sum, m) => sum + m.monto, 0);

	$: gastosEsteMes = $finanzasPersonales
		.filter(m => {
			if (!m.fecha_gasto) return false;
			const fecha = new Date(m.fecha_gasto);
			const ahora = new Date();
			return fecha.getMonth() === ahora.getMonth() && 
				   fecha.getFullYear() === ahora.getFullYear() &&
				   m.tipo === 'gasto';
		})
		.reduce((sum, m) => sum + m.monto, 0);

	$: gastoPromedioDiario = gastosEsteMes / new Date().getDate();

	const irAFinanzas = () => {
		window.location.href = '/panel/finanzas';
	};
</script>

<svelte:head>
	<title>Gastos Personales - App Contabilidad</title>
</svelte:head>

<div class="space-y-8 p-6">
	<!-- Header -->
	<div class="relative overflow-hidden bg-gradient-to-br from-red-600 via-purple-600 to-pink-600 p-12 text-white shadow-2xl">
		<div class="relative z-10">
			<h1 class="text-4xl font-extrabold mb-4">Gastos Personales</h1>
			<p class="text-red-100 text-xl leading-relaxed max-w-2xl">
				Administra y controla todos tus gastos personales de manera inteligente
			</p>
		</div>
	</div>

	<!-- Estadísticas -->
	<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
		<TarjetaEstadistica
			titulo="Total Gastos"
			valor="${totalGastos.toLocaleString()}"
			icono={TrendingDown}
			color="rojo"
		/>
		
		<TarjetaEstadistica
			titulo="Este Mes"
			valor="${gastosEsteMes.toLocaleString()}"
			icono={DollarSign}
			color="morado"
		/>
		
		<TarjetaEstadistica
			titulo="Promedio Diario"
			valor="${Math.round(gastoPromedioDiario).toLocaleString()}"
			icono={Calendar}
			color="naranja"
		/>
	</div>

	<!-- Nota de migración -->
	<div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
		<div class="flex items-start space-x-4">
			<div class="flex-shrink-0">
				<div class="w-8 h-8 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
					<DollarSign class="w-4 h-4 text-blue-600 dark:text-blue-400" />
				</div>
			</div>
			<div class="flex-1">
				<h3 class="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
					Funcionalidad Migrada
				</h3>
				<p class="text-blue-800 dark:text-blue-200 mb-4">
					Los gastos personales ahora forman parte de la sección de Finanzas para una mejor organización y control integral.
				</p>
				<Boton
					on:click={irAFinanzas}
					class="!bg-blue-600 hover:!bg-blue-700 text-white"
				>
					<DollarSign class="w-4 h-4 mr-2" />
					Ir a Finanzas Completas
				</Boton>
			</div>
		</div>
	</div>

	<!-- Lista de gastos recientes (si existen) -->
	{#if $finanzasPersonales.length > 0}
		<div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
			<h2 class="text-xl font-semibold mb-4">Gastos Recientes</h2>
			<div class="space-y-3">
				{#each $finanzasPersonales.filter(m => m.tipo === 'gasto').slice(0, 5) as gasto}
					<div class="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
						<div class="flex-1">
							<h4 class="font-medium text-gray-900 dark:text-white">{gasto.descripcion}</h4>
							<p class="text-sm text-gray-600 dark:text-gray-400">
								{gasto.fecha_gasto ? new Date(gasto.fecha_gasto).toLocaleDateString('es-ES') : 'Fecha no disponible'}
							</p>
						</div>
						<div class="text-right">
							<p class="text-lg font-semibold text-red-600">-${gasto.monto.toLocaleString()}</p>
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div> 