<script lang="ts">
	// Props del componente
	export let titulo: string = '';
	export let subtitulo: string = '';
	export let clickeable: boolean = false;
	export let hover: boolean = false;
	export let padding: 'sm' | 'md' | 'lg' = 'md';
	export let sombra: 'sm' | 'md' | 'lg' = 'md';
	
	// Clases para diferentes paddings
	const paddingClases = {
		sm: 'p-4',
		md: 'p-6',
		lg: 'p-8'
	};
	
	// Clases para diferentes sombras
	const sombraClases = {
		sm: 'shadow-sm',
		md: 'shadow-card',
		lg: 'shadow-lg'
	};
	
	// Clases CSS reactivas
	$: clases = [
		'card',
		paddingClases[padding],
		sombraClases[sombra],
		clickeable ? 'cursor-pointer' : '',
		hover || clickeable ? 'hover:shadow-card-hover transition-shadow duration-200' : '',
		$$props.class || ''
	].join(' ').trim();
</script>

<div 
	class={clases}
	on:click
	on:keydown
	role={clickeable ? 'button' : undefined}
	tabindex={clickeable ? 0 : undefined}
>
	{#if titulo || $$slots.header}
		<div class="flex items-center justify-between mb-4">
			<div>
				{#if titulo}
					<h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
						{titulo}
					</h3>
				{/if}
				{#if subtitulo}
					<p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
						{subtitulo}
					</p>
				{/if}
			</div>
			
			<slot name="header" />
		</div>
	{/if}
	
	<!-- Contenido principal -->
	<div class="flex-1">
		<slot />
	</div>
	
	{#if $$slots.footer}
		<div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
			<slot name="footer" />
		</div>
	{/if}
</div> 