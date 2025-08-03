<script lang="ts">
	// Props del componente
	export let tamaño: 'sm' | 'md' | 'lg' = 'md';
	export let texto: string = 'Cargando...';
	export let centrado: boolean = true;
	export let mostrarTexto: boolean = true;
	export let color: 'primary' | 'white' | 'gray' = 'primary';
	
	// Clases para diferentes tamaños
	const tamañosSpinner = {
		sm: 'w-4 h-4',
		md: 'w-6 h-6',
		lg: 'w-8 h-8'
	};
	
	const tamañosTexto = {
		sm: 'text-sm',
		md: 'text-base',
		lg: 'text-lg'
	};
	
	// Colores del spinner
	const coloresSpinner = {
		primary: 'text-primary-600',
		white: 'text-white',
		gray: 'text-gray-600'
	};
	
	$: claseSpinner = `${tamañosSpinner[tamaño]} ${coloresSpinner[color]}`;
	$: claseTexto = `${tamañosTexto[tamaño]} ${coloresSpinner[color]}`;
</script>

<div class={centrado ? 'flex flex-col items-center justify-center' : 'flex items-center'}>
	<!-- Spinner animado -->
	<svg 
		class="animate-spin {claseSpinner}" 
		fill="none" 
		viewBox="0 0 24 24"
		aria-hidden="true"
	>
		<circle 
			class="opacity-25" 
			cx="12" 
			cy="12" 
			r="10" 
			stroke="currentColor" 
			stroke-width="4"
		></circle>
		<path 
			class="opacity-75" 
			fill="currentColor" 
			d="M4 12a8 8 0 018-8v8H4z"
		></path>
	</svg>
	
	{#if mostrarTexto && texto}
		<span class="mt-2 {claseTexto} font-medium">
			{texto}
		</span>
	{/if}
</div> 