<script lang="ts">
	import type { MovimientoFinanciero } from '$lib/tipos/app';
	import { TrendingUp, TrendingDown, Calendar, CreditCard, FileText, Tag } from 'lucide-svelte';

	// Props
	export let movimiento: MovimientoFinanciero;
	export let mostrarNegocio = true;

	// Formatear moneda
	const formatearMoneda = (monto: number) => {
		return `$${monto.toLocaleString()}`;
	};

	// Formatear fecha
	const formatearFecha = (fecha: string) => {
		return new Date(fecha).toLocaleDateString('es-ES', {
			day: '2-digit',
			month: 'short',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	};

	// Color según tipo
	$: colorTipo = movimiento.tipo_movimiento === 'ingreso' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
	$: iconoTipo = movimiento.tipo_movimiento === 'ingreso' ? TrendingUp : TrendingDown;
	$: bgTipo = movimiento.tipo_movimiento === 'ingreso' ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20';
	$: borderTipo = movimiento.tipo_movimiento === 'ingreso' ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-red-500';
</script>

<div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 {borderTipo} p-4 sm:p-6 hover:shadow-lg transition-all duration-200 w-full overflow-hidden">
	<!-- Header con tipo y monto -->
	<div class="flex items-start justify-between mb-3 sm:mb-4">
		<div class="flex items-center space-x-3 min-w-0 flex-1">
			<!-- Icono del tipo -->
			<div class="p-2 sm:p-2.5 {bgTipo} rounded-lg flex-shrink-0">
				<svelte:component this={iconoTipo} class="w-4 h-4 sm:w-5 sm:h-5 {colorTipo}" />
			</div>

			<!-- Descripción -->
			<div class="min-w-0 flex-1">
				<h4 class="font-semibold text-gray-900 dark:text-white text-sm sm:text-base line-clamp-2">
					{movimiento.descripcion}
				</h4>
			</div>
		</div>

		<!-- Monto -->
		<div class="text-right flex-shrink-0 ml-3">
			<span class="font-bold {colorTipo} text-lg sm:text-xl">
				{movimiento.tipo_movimiento === 'ingreso' ? '+' : '-'}{formatearMoneda(movimiento.monto)}
			</span>
		</div>
	</div>

	<!-- Información secundaria -->
	<div class="space-y-2">
		<!-- Primera fila: Fecha y Método de pago -->
		<div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
			<!-- Fecha -->
			<div class="flex items-center space-x-1.5">
				<Calendar class="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
				<span class="whitespace-nowrap">{formatearFecha(movimiento.fecha_movimiento)}</span>
			</div>

			<!-- Método de pago -->
			{#if movimiento.metodo_pago}
				<div class="flex items-center space-x-1.5">
					<CreditCard class="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
					<span class="capitalize whitespace-nowrap">{movimiento.metodo_pago.replace('_', ' ')}</span>
				</div>
			{/if}
		</div>

		<!-- Segunda fila: Categoría y Negocio -->
		<div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
			<!-- Categoría -->
			{#if movimiento.categoria_id}
				<div class="flex items-center space-x-1.5">
					<Tag class="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
					<span class="whitespace-nowrap">Categoría</span>
				</div>
			{/if}

			<!-- Negocio - Solo mostrar si se debe mostrar -->
			{#if mostrarNegocio}
				<div class="flex items-center space-x-1.5">
					<FileText class="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
					<span class="whitespace-nowrap">Negocio</span>
				</div>
			{/if}
		</div>

		<!-- Notas adicionales -->
		{#if movimiento.notas}
			<div class="pt-2 border-t border-gray-100 dark:border-gray-700">
				<p class="text-xs sm:text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
					{movimiento.notas}
				</p>
			</div>
		{/if}
	</div>
</div>

<style>
	.line-clamp-1 {
		display: -webkit-box;
		-webkit-line-clamp: 1;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	
	.line-clamp-2 {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style> 