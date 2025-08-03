<script lang="ts">
	import { onMount } from 'svelte';
	import { AlertTriangle, RefreshCw, Home } from 'lucide-svelte';
	import Boton from '$lib/componentes/ui/Boton.svelte';
	import { goto } from '$app/navigation';

	// Props
	export let titulo: string = 'Algo salió mal';
	export let mensaje: string = 'Ha ocurrido un error inesperado. Por favor, intenta nuevamente.';
	export let mostrarBotonInicio: boolean = true;
	export let mostrarBotonRecargar: boolean = true;

	// Estado
	let errorDetallado: string = '';

	// Función para recargar la página
	const recargarPagina = () => {
		window.location.reload();
	};

	// Función para ir al inicio
	const irAlInicio = () => {
		goto('/panel');
	};

	// Capturar errores globales
	onMount(() => {
		const manejarError = (event: ErrorEvent) => {
			console.error('Error capturado:', event.error);
			errorDetallado = event.error?.message || 'Error desconocido';
		};

		const manejarPromiseRejection = (event: PromiseRejectionEvent) => {
			console.error('Promise rechazada:', event.reason);
			errorDetallado = event.reason?.message || 'Promise rechazada';
		};

		window.addEventListener('error', manejarError);
		window.addEventListener('unhandledrejection', manejarPromiseRejection);

		return () => {
			window.removeEventListener('error', manejarError);
			window.removeEventListener('unhandledrejection', manejarPromiseRejection);
		};
	});
</script>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
	<div class="max-w-md w-full">
		<!-- Icono de error -->
		<div class="text-center mb-8">
			<div class="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full mb-4">
				<AlertTriangle class="w-8 h-8 text-red-600 dark:text-red-400" />
			</div>
		</div>

		<!-- Contenido del error -->
		<div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 text-center">
			<h2 class="text-xl font-bold text-gray-900 dark:text-white mb-3">
				{titulo}
			</h2>
			
			<p class="text-gray-600 dark:text-gray-400 mb-6">
				{mensaje}
			</p>

			{#if errorDetallado}
				<details class="mb-6 text-left">
					<summary class="text-sm text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300">
						Ver detalles del error
					</summary>
					<div class="mt-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-xs font-mono text-gray-700 dark:text-gray-300 overflow-auto max-h-32">
						{errorDetallado}
					</div>
				</details>
			{/if}

			<!-- Acciones -->
			<div class="flex flex-col sm:flex-row gap-3">
				{#if mostrarBotonRecargar}
					<Boton 
						on:click={recargarPagina}
						class="flex-1"
					>
						<RefreshCw class="w-4 h-4 mr-2" />
						Recargar Página
					</Boton>
				{/if}

				{#if mostrarBotonInicio}
					<Boton 
						variante="secundario"
						on:click={irAlInicio}
						class="flex-1"
					>
						<Home class="w-4 h-4 mr-2" />
						Ir al Inicio
					</Boton>
				{/if}
			</div>
		</div>

		<!-- Información adicional -->
		<div class="mt-6 text-center">
			<p class="text-sm text-gray-500 dark:text-gray-400">
				Si el problema persiste, por favor contacta al soporte técnico.
			</p>
		</div>
	</div>
</div> 