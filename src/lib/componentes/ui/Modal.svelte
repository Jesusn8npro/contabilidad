<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { X } from 'lucide-svelte';
	
	// Props del componente
	export let abierto: boolean = false;
	export let titulo: string = '';
	export let tamaño: 'sm' | 'md' | 'lg' | 'xl' | 'full' = 'md';
	export let size: 'sm' | 'md' | 'lg' | 'xl' | 'full' | undefined = undefined;
	
	// Permitir tanto 'tamaño' como 'size' para compatibilidad
	$: tamañoFinal = size || tamaño;
	export let cerrarAlClickFuera: boolean = true;
	export let mostrarBotonCerrar: boolean = true;
	export let mostrarHeader: boolean = true;
	export let mostrarFooter: boolean = false;
	
	const dispatch = createEventDispatcher();
	
	// Clases para diferentes tamaños - MEJORADAS PARA RESPONSIVIDAD
	const tamañosModal = {
		sm: 'w-full max-w-sm mx-4 sm:mx-auto',
		md: 'w-full max-w-md mx-4 sm:max-w-lg sm:mx-auto',
		lg: 'w-full max-w-lg mx-4 sm:max-w-xl md:max-w-2xl lg:max-w-3xl xl:max-w-4xl sm:mx-auto',
		xl: 'w-full max-w-2xl mx-4 sm:max-w-3xl md:max-w-4xl lg:max-w-5xl xl:max-w-6xl sm:mx-auto',
		full: 'w-full max-w-full mx-4 sm:max-w-7xl sm:mx-auto'
	};
	
	// Manejar cierre del modal
	const cerrarModal = () => {
		abierto = false;
		dispatch('cerrar');
	};
	
	// Manejar click en el backdrop
	const manejarClickBackdrop = (evento: MouseEvent) => {
		if (cerrarAlClickFuera && evento.target === evento.currentTarget) {
			cerrarModal();
		}
	};

	// Manejar Enter en el backdrop
	const manejarEnterBackdrop = (evento: KeyboardEvent) => {
		if (cerrarAlClickFuera && evento.key === 'Enter' && evento.target === evento.currentTarget) {
			cerrarModal();
		}
	};
	
	// Manejar tecla Escape
	const manejarTecla = (evento: KeyboardEvent) => {
		if (evento.key === 'Escape' && abierto) {
			cerrarModal();
		}
	};
</script>

<svelte:window on:keydown={manejarTecla} />

{#if abierto}
	<!-- Backdrop mejorado -->
	<div 
		class="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-start justify-center p-4 sm:p-6 lg:p-8"
		on:click={manejarClickBackdrop}
		on:keydown={manejarEnterBackdrop}
		role="dialog"
		aria-modal="true"
		tabindex="-1"
	>
		<!-- Contenedor del modal - RESPONSIVO -->
		<div class="relative {tamañosModal[tamañoFinal]} bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 my-8 animate-scale-up overflow-hidden">
			
			{#if mostrarHeader}
				<!-- Header mejorado -->
				<div class="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
					<h3 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white truncate pr-4">
						{titulo}
					</h3>
					
					{#if mostrarBotonCerrar}
						<button
							class="flex-shrink-0 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
							on:click={cerrarModal}
							aria-label="Cerrar modal"
						>
							<X class="w-5 h-5" />
						</button>
					{/if}
				</div>
			{/if}
			
			<!-- Contenido con scroll independiente -->
			<div class="p-4 sm:p-6 max-h-[calc(100vh-12rem)] overflow-y-auto">
				<slot />
			</div>
			
			{#if mostrarFooter}
				<!-- Footer mejorado -->
				<div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 sm:gap-4 p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
					<slot name="footer">
						<button 
							type="button"
							class="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
							on:click={cerrarModal}
						>
							Cancelar
						</button>
						<button 
							type="button"
							class="px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
							on:click={() => dispatch('confirmar')}
						>
							Confirmar
						</button>
					</slot>
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	/* Animaciones mejoradas */
	@keyframes scale-up {
		from {
			opacity: 0;
			transform: scale(0.95) translateY(-10px);
		}
		to {
			opacity: 1;
			transform: scale(1) translateY(0);
		}
	}
	
	.animate-scale-up {
		animation: scale-up 0.2s ease-out;
	}
	
	/* Prevenir scroll del body cuando el modal está abierto */
	:global(body.modal-abierto) {
		overflow: hidden;
	}
</style> 