<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-svelte';

	// Props
	export let tipo: 'exito' | 'error' | 'advertencia' | 'info' = 'info';
	export let titulo: string = '';
	export let mensaje: string = '';
	export let duracion: number = 5000; // ms
	export let mostrarBotonCerrar: boolean = true;
	export let icono: boolean = true;

	// Event dispatcher
	const dispatch = createEventDispatcher<{
		cerrar: void;
	}>();

	// Auto cerrar después de la duración especificada
	let timeout: NodeJS.Timeout;
	if (duracion > 0) {
		timeout = setTimeout(() => {
			dispatch('cerrar');
		}, duracion);
	}

	// Función para cerrar manualmente
	const cerrar = () => {
		if (timeout) clearTimeout(timeout);
		dispatch('cerrar');
	};

	// Configuración de iconos y colores por tipo
	const configuraciones = {
		exito: {
			icono: CheckCircle2,
			colores: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-700 dark:text-green-200',
			iconoColores: 'text-green-500 dark:text-green-400'
		},
		error: {
			icono: XCircle,
			colores: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-700 dark:text-red-200',
			iconoColores: 'text-red-500 dark:text-red-400'
		},
		advertencia: {
			icono: AlertTriangle,
			colores: 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-700 dark:text-yellow-200',
			iconoColores: 'text-yellow-500 dark:text-yellow-400'
		},
		info: {
			icono: Info,
			colores: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-200',
			iconoColores: 'text-blue-500 dark:text-blue-400'
		}
	};

	$: config = configuraciones[tipo];
</script>

<div
	class="relative flex items-start p-4 border rounded-xl shadow-lg backdrop-blur-sm {config.colores}"
	transition:fly={{ x: 300, duration: 300 }}
	role="alert"
>
	<!-- Icono -->
	{#if icono}
		<div class="flex-shrink-0 mr-3">
			<svelte:component this={config.icono} class="w-5 h-5 {config.iconoColores}" />
		</div>
	{/if}

	<!-- Contenido -->
	<div class="flex-1 min-w-0">
		{#if titulo}
			<h4 class="font-semibold text-sm mb-1">
				{titulo}
			</h4>
		{/if}
		
		{#if mensaje}
			<p class="text-sm">
				{mensaje}
			</p>
		{:else}
			<slot />
		{/if}
	</div>

	<!-- Botón cerrar -->
	{#if mostrarBotonCerrar}
		<button
			type="button"
			class="flex-shrink-0 ml-3 p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors {config.iconoColores}"
			on:click={cerrar}
		>
			<X class="w-4 h-4" />
		</button>
	{/if}

	<!-- Barra de progreso -->
	{#if duracion > 0}
		<div class="absolute bottom-0 left-0 h-1 bg-current opacity-30 rounded-b-xl animate-toast-progress"></div>
	{/if}
</div>

<style>
	@keyframes toast-progress {
		from {
			width: 100%;
		}
		to {
			width: 0%;
		}
	}

	.animate-toast-progress {
		animation: toast-progress var(--duracion, 5s) linear forwards;
	}
</style> 