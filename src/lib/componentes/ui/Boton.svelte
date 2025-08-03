<script lang="ts">
	// Props del componente
	export let tipo: 'button' | 'submit' | 'reset' = 'button';
	export let variante: 'primary' | 'secondary' | 'danger' | 'ghost' | 'link' = 'primary';
	export let tamaño: 'sm' | 'md' | 'lg' = 'md';
	export let deshabilitado: boolean = false;
	export let cargando: boolean = false;
	export let ancho: 'auto' | 'full' = 'auto';
	export let icono: string | undefined = undefined;
	export let iconoDerecha: boolean = false;
	
	// Clases CSS reactivas
	$: clases = [
		'btn',
		`btn-${variante}`,
		`btn-${tamaño}`,
		ancho === 'full' ? 'w-full' : '',
		deshabilitado || cargando ? 'opacity-50 cursor-not-allowed' : '',
		$$props.class || ''
	].join(' ').trim();
	
	// Función para manejar click
	const manejarClick = (evento: MouseEvent) => {
		if (deshabilitado || cargando) {
			evento.preventDefault();
			return;
		}
	};
</script>

<button
	{tipo}
	class={clases}
	disabled={deshabilitado || cargando}
	on:click={manejarClick}
	on:click
	{...$$restProps}
>
	{#if cargando}
		<svg class="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
			<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
			<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
		</svg>
		Cargando...
	{:else}
		{#if icono && !iconoDerecha}
			<i class="lucide lucide-{icono} w-4 h-4 mr-2"></i>
		{/if}
		
		<slot />
		
		{#if icono && iconoDerecha}
			<i class="lucide lucide-{icono} w-4 h-4 ml-2"></i>
		{/if}
	{/if}
</button>

<style>
	/* Estilos adicionales específicos del componente */
	button.btn-ghost {
		@apply bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800;
	}
	
	button.btn-link {
		@apply bg-transparent border-none text-primary-600 hover:text-primary-700 underline p-0 font-normal;
	}
	
	button:focus {
		@apply outline-none ring-2 ring-offset-2;
	}
	
	button.btn-primary:focus {
		@apply ring-primary-500;
	}
	
	button.btn-secondary:focus {
		@apply ring-gray-500;
	}
	
	button.btn-danger:focus {
		@apply ring-danger-500;
	}
</style> 