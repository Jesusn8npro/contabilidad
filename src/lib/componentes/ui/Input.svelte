<script lang="ts">
	// Props del componente
	export let tipo: 'text' | 'email' | 'password' | 'number' | 'date' | 'textarea' = 'text';
	export let valor: string | number = '';
	export let placeholder: string = '';
	export let etiqueta: string = '';
	export let obligatorio: boolean = false;
	export let deshabilitado: boolean = false;
	export let disabled: boolean = false; // Alias para deshabilitado
	export let error: string = '';
	export let ayuda: string = '';
	export let icono: string | undefined = undefined;
	export let min: number | undefined = undefined;
	export let max: number | undefined = undefined;
	export let filas: number = 3; // Solo para textarea
	
	// ID único para el input
	const id = `input-${Math.random().toString(36).substring(2)}`;
	
	// Unificar deshabilitado y disabled
	$: estaDeshabilitado = deshabilitado || disabled;
	
	// Clases CSS reactivas
	$: clasesInput = [
		'w-full px-3 py-2 border rounded-lg transition-all duration-200',
		'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100',
		'border-gray-300 dark:border-gray-600',
		'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
		'placeholder-gray-400 dark:placeholder-gray-400',
		error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : '',
		icono ? 'pl-10' : '',
		estaDeshabilitado ? 'opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-800' : '',
		$$props.class || ''
	].filter(Boolean).join(' ');
</script>

<!-- Contenedor del campo -->
<div class="space-y-2">
	<!-- Etiqueta -->
	{#if etiqueta}
		<label for={id} class="block text-sm font-medium text-gray-700 dark:text-gray-300">
			{etiqueta}
			{#if obligatorio}
				<span class="text-red-500 ml-1">*</span>
			{/if}
		</label>
	{/if}

	<!-- Campo de entrada -->
	<div class="relative">
		<!-- Icono -->
		{#if icono}
			<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
				<i class="lucide lucide-{icono} w-5 h-5 text-gray-400"></i>
			</div>
		{/if}

		<!-- Renderizado condicional por tipo para evitar two-way binding dinámico -->
		{#if tipo === 'textarea'}
			<textarea
				{id}
				bind:value={valor}
				{placeholder}
				required={obligatorio}
				disabled={estaDeshabilitado}
				rows={filas}
				class={clasesInput}
				on:focus
				on:blur
				on:input
				{...$$restProps}
			></textarea>
		{:else if tipo === 'text'}
			<input
				{id}
				type="text"
				bind:value={valor}
				{placeholder}
				required={obligatorio}
				disabled={estaDeshabilitado}
				class={clasesInput}
				on:focus
				on:blur
				on:input
				{...$$restProps}
			/>
		{:else if tipo === 'email'}
			<input
				{id}
				type="email"
				bind:value={valor}
				{placeholder}
				required={obligatorio}
				disabled={estaDeshabilitado}
				class={clasesInput}
				on:focus
				on:blur
				on:input
				{...$$restProps}
			/>
		{:else if tipo === 'password'}
			<input
				{id}
				type="password"
				bind:value={valor}
				{placeholder}
				required={obligatorio}
				disabled={estaDeshabilitado}
				class={clasesInput}
				on:focus
				on:blur
				on:input
				{...$$restProps}
			/>
		{:else if tipo === 'number'}
			<input
				{id}
				type="number"
				bind:value={valor}
				{placeholder}
				required={obligatorio}
				disabled={estaDeshabilitado}
				{min}
				{max}
				class={clasesInput}
				on:focus
				on:blur
				on:input
				{...$$restProps}
			/>
		{:else if tipo === 'date'}
			<input
				{id}
				type="date"
				bind:value={valor}
				{placeholder}
				required={obligatorio}
				disabled={estaDeshabilitado}
				{min}
				{max}
				class={clasesInput}
				on:focus
				on:blur
				on:input
				{...$$restProps}
			/>
		{/if}
	</div>

	<!-- Mensaje de error -->
	{#if error}
		<p class="text-sm text-red-600 dark:text-red-400 flex items-center space-x-1">
			<i class="lucide lucide-alert-circle w-4 h-4"></i>
			<span>{error}</span>
		</p>
	{/if}

	<!-- Mensaje de ayuda -->
	{#if ayuda && !error}
		<p class="text-sm text-gray-500 dark:text-gray-400">
			{ayuda}
		</p>
	{/if}
</div> 