<script lang="ts">
	import type { ComponentType } from 'svelte';
	
	// Props del componente
	export let type: 'button' | 'submit' | 'reset' = 'button';
	export let variant: 'primary' | 'secondary' | 'danger' | 'success' | 'outline' | 'ghost' | 'gradient' | 'minimal' = 'primary';
	export let size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'md';
	export let disabled: boolean = false;
	export let loading: boolean = false;
	export let fullWidth: boolean = false;
	export let icon: ComponentType | undefined = undefined;
	export let iconRight: boolean = false;
	export let rounded: 'none' | 'sm' | 'md' | 'lg' | 'full' = 'md';
	export let shadow: boolean = true;
	export let pulse: boolean = false;
	
	// Mapeo de variantes
	const variants = {
		primary: 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-transparent shadow-blue-500/25',
		secondary: 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white border-transparent shadow-gray-500/25',
		danger: 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white border-transparent shadow-red-500/25',
		success: 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white border-transparent shadow-green-500/25',
		outline: 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 shadow-gray-200/50 dark:shadow-gray-700/50',
		ghost: 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 border-transparent shadow-none',
		gradient: 'bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:from-purple-700 hover:via-pink-700 hover:to-blue-700 text-white border-transparent shadow-purple-500/25',
		minimal: 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 border-transparent shadow-none'
	};
	
	// Mapeo de tamaños
	const sizes = {
		xs: 'px-2.5 py-1.5 text-xs',
		sm: 'px-3 py-2 text-sm',
		md: 'px-4 py-2.5 text-sm',
		lg: 'px-6 py-3 text-base',
		xl: 'px-8 py-4 text-lg'
	};
	
	// Mapeo de bordes redondeados
	const roundings = {
		none: 'rounded-none',
		sm: 'rounded-sm',
		md: 'rounded-lg',
		lg: 'rounded-xl',
		full: 'rounded-full'
	};
	
	// Clases CSS reactivas
	$: classes = [
		'btn-modern',
		'relative inline-flex items-center justify-center',
		'font-medium transition-all duration-200 ease-in-out',
		'transform hover:scale-105 active:scale-95',
		'focus:outline-none focus:ring-4 focus:ring-offset-2',
		'border border-solid',
		variants[variant],
		sizes[size],
		roundings[rounded],
		fullWidth ? 'w-full' : '',
		shadow ? 'shadow-lg hover:shadow-xl' : '',
		pulse ? 'animate-pulse' : '',
		disabled || loading ? 'opacity-50 cursor-not-allowed transform-none hover:scale-100' : '',
		$$props.class || ''
	].filter(Boolean).join(' ');
	
	// Función para manejar click
	const handleClick = (event: MouseEvent) => {
		if (disabled || loading) {
			event.preventDefault();
			return;
		}
	};
</script>

<button
	{type}
	class={classes}
	disabled={disabled || loading}
	on:click={handleClick}
	on:click
	{...$$restProps}
>
	{#if loading}
		<svg class="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24">
			<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
			<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
		</svg>
		Cargando...
	{:else}
		{#if icon && !iconRight}
			<svelte:component this={icon} class="w-4 h-4 mr-2" />
		{/if}
		
		<slot />
		
		{#if icon && iconRight}
			<svelte:component this={icon} class="w-4 h-4 ml-2" />
		{/if}
	{/if}
</button>

<style>
	/* Estilos modernos para botones */
	.btn-modern {
		backdrop-filter: blur(10px);
		-webkit-backdrop-filter: blur(10px);
	}
	
	/* Efectos de hover especiales */
	.btn-modern:hover {
		background-image: linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.2) 50%, transparent 70%);
		background-size: 200% 200%;
		animation: shimmer 1.5s ease-in-out;
	}
	
	/* Animación shimmer */
	@keyframes shimmer {
		0% { background-position: -200% 0; }
		100% { background-position: 200% 0; }
	}
	
	/* Efecto de pulso para botones de acción */
	.btn-modern.animate-pulse {
		animation: pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
	}
	
	@keyframes pulse-glow {
		0%, 100% {
			opacity: 1;
			box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
		}
		50% {
			opacity: 0.9;
			box-shadow: 0 0 0 10px rgba(59, 130, 246, 0);
		}
	}
	
	/* Mejoras para modo oscuro */
	:global(.dark) .btn-modern {
		box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.1);
	}
	
	/* Estados de focus mejorados */
	.btn-modern:focus-visible {
		ring-opacity: 0.75;
		ring-offset-color: rgba(255, 255, 255, 0.8);
	}
	
	:global(.dark) .btn-modern:focus-visible {
		ring-offset-color: rgba(17, 24, 39, 0.8);
	}
</style> 