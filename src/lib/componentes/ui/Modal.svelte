<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import Boton from './Boton.svelte';
	
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
	
	// Clases para diferentes tamaños
	const tamañosModal = {
		sm: 'max-w-md',
		md: 'max-w-lg',
		lg: 'max-w-2xl',
		xl: 'max-w-4xl',
		full: 'max-w-7xl mx-4'
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
	
	// Manejar tecla Escape
	const manejarTecla = (evento: KeyboardEvent) => {
		if (evento.key === 'Escape' && abierto) {
			cerrarModal();
		}
	};
</script>

<svelte:window on:keydown={manejarTecla} />

{#if abierto}
	<!-- Backdrop -->
	<div 
		class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 animate-fade-in"
		on:click={manejarClickBackdrop}
		on:keydown={(e) => e.key === 'Enter' && manejarClickBackdrop(e)}
		role="dialog"
		aria-modal="true"
		tabindex="-1"
	>
		<!-- Contenedor del modal -->
		<div class="relative top-20 mx-auto p-5 border w-11/12 {tamañosModal[tamaño]} shadow-modal bg-white rounded-lg dark:bg-gray-800 dark:border-gray-700 animate-slide-up">
			
			{#if mostrarHeader}
				<!-- Header -->
				<div class="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-600">
					<h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
						{titulo}
					</h3>
					
					{#if mostrarBotonCerrar}
						<button
							class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
							on:click={cerrarModal}
							aria-label="Cerrar modal"
						>
							<i class="lucide lucide-x w-5 h-5"></i>
						</button>
					{/if}
				</div>
			{/if}
			
			<!-- Contenido -->
			<div class="py-4">
				<slot />
			</div>
			
			{#if mostrarFooter}
				<!-- Footer -->
				<div class="flex items-center justify-end pt-4 border-t border-gray-200 dark:border-gray-600 space-x-2">
					<slot name="footer">
						<Boton variante="secondary" on:click={cerrarModal}>
							Cancelar
						</Boton>
						<Boton variante="primary" on:click={() => dispatch('confirmar')}>
							Confirmar
						</Boton>
					</slot>
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	/* Prevenir scroll del body cuando el modal está abierto */
	:global(body.modal-abierto) {
		overflow: hidden;
	}
</style> 