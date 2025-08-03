<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { z } from 'zod';
	import type { MovimientoFinanciero, Categoria, Negocio } from '$lib/tipos/app';
	import { DollarSign, TrendingUp, TrendingDown, Save, X, Receipt } from 'lucide-svelte';

	// Props
	export let movimiento: MovimientoFinanciero | null = null;
	export let negocios: Negocio[] = [];
	export let categorias: Categoria[] = [];
	export let negocioSeleccionado: string = '';
	export let guardando = false;

	// Event dispatcher
	const dispatch = createEventDispatcher<{
		guardar: { movimiento: Partial<MovimientoFinanciero> };
		cancelar: void;
	}>();

	// Schema de validación
	const esquemaMovimiento = z.object({
		negocio_id: z.string().min(1, 'Selecciona un negocio'),
		tipo_movimiento: z.enum(['ingreso', 'gasto']),
		categoria_id: z.string().optional(),
		monto: z.number().min(0.01, 'El monto debe ser mayor a 0'),
		descripcion: z.string().min(3, 'La descripción debe tener al menos 3 caracteres').max(500, 'Máximo 500 caracteres'),
		fecha_movimiento: z.string().min(1, 'La fecha es requerida'),
		metodo_pago: z.enum(['efectivo', 'transferencia', 'tarjeta', 'cheque', 'digital']).optional(),
		notas: z.string().max(1000, 'Máximo 1000 caracteres').optional()
	});

	// Estado del formulario
	let formulario = {
		negocio_id: movimiento?.negocio_id || negocioSeleccionado || '',
		tipo_movimiento: movimiento?.tipo_movimiento || 'ingreso',
		categoria_id: movimiento?.categoria_id || '',
		monto: movimiento?.monto || 0,
		descripcion: movimiento?.descripcion || '',
		fecha_movimiento: movimiento?.fecha_movimiento || new Date().toISOString().split('T')[0],
		metodo_pago: movimiento?.metodo_pago || 'transferencia',
		notas: movimiento?.notas || ''
	};

	// Estados de validación
	let errores: Record<string, string> = {};
	let tocado: Record<string, boolean> = {};

	// Opciones para el formulario
	const tiposMovimiento = [
		{
			valor: 'ingreso',
			nombre: 'Ingreso',
			descripcion: 'Dinero que entra al negocio',
			icono: TrendingUp,
			color: 'text-green-600 dark:text-green-400',
			bgColor: 'border-green-500 bg-green-50 dark:bg-green-900/20'
		},
		{
			valor: 'gasto',
			nombre: 'Gasto',
			descripcion: 'Dinero que sale del negocio',
			icono: TrendingDown,
			color: 'text-red-600 dark:text-red-400',
			bgColor: 'border-red-500 bg-red-50 dark:bg-red-900/20'
		}
	];

	const metodosPago = [
		{ valor: 'efectivo', nombre: 'Efectivo' },
		{ valor: 'transferencia', nombre: 'Transferencia Bancaria' },
		{ valor: 'tarjeta', nombre: 'Tarjeta (Débito/Crédito)' },
		{ valor: 'cheque', nombre: 'Cheque' },
		{ valor: 'digital', nombre: 'Billetera Digital' }
	];

	// Categorías filtradas por tipo
	$: categoriasFiltradas = categorias.filter(c => 
		c.tipo_categoria === formulario.tipo_movimiento
	);

	// Validación reactiva
	const validarCampo = (campo: string, valor: any) => {
		try {
			const esquemaCampo = esquemaMovimiento.pick({ [campo]: true } as any);
			esquemaCampo.parse({ [campo]: valor });
			delete errores[campo];
			errores = { ...errores };
		} catch (error) {
			if (error instanceof z.ZodError) {
				errores[campo] = error.errors[0]?.message || 'Error de validación';
				errores = { ...errores };
			}
		}
	};

	// Handlers
	const handleTipoChange = () => {
		formulario.categoria_id = ''; // Reset categoría al cambiar tipo
		validarCampo('tipo_movimiento', formulario.tipo_movimiento);
	};

	const handleSubmit = (e: Event) => {
		e.preventDefault();
		
		// Validar todo el formulario
		try {
			const datosValidados = esquemaMovimiento.parse({
				...formulario,
				monto: parseFloat(formulario.monto.toString())
			});
			
			dispatch('guardar', { 
				movimiento: {
					...datosValidados,
					id: movimiento?.id
				}
			});
		} catch (error) {
			if (error instanceof z.ZodError) {
				const nuevosErrores: Record<string, string> = {};
				error.errors.forEach(err => {
					if (err.path[0]) {
						nuevosErrores[err.path[0].toString()] = err.message;
					}
				});
				errores = nuevosErrores;
			}
		}
	};

	const handleCancelar = () => {
		dispatch('cancelar');
	};
</script>

<!-- Formulario de Movimiento Responsivo -->
<div class="w-full max-w-full">
	<form on:submit={handleSubmit} class="space-y-4 sm:space-y-6">
		
		<!-- Header del formulario -->
		<div class="flex items-center space-x-3 pb-3 sm:pb-4 border-b border-gray-200 dark:border-gray-700">
			<div class="p-2 sm:p-3 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg">
				<DollarSign class="w-5 h-5 sm:w-6 sm:h-6 text-white" />
			</div>
			<div>
				<h3 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
					Nuevo Movimiento
				</h3>
				<p class="text-sm text-gray-600 dark:text-gray-400">
					Registra un ingreso o gasto del negocio
				</p>
			</div>
		</div>

		<!-- Grid responsivo principal -->
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
			
			<!-- Negocio -->
			<div class="lg:col-span-2">
				<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
					Negocio *
				</label>
				<select
					bind:value={formulario.negocio_id}
					on:blur={() => { tocado.negocio_id = true; validarCampo('negocio_id', formulario.negocio_id); }}
					class="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base"
					class:border-red-500={errores.negocio_id && tocado.negocio_id}
				>
					<option value="">Selecciona un negocio</option>
					{#each negocios as negocio}
						<option value={negocio.id}>{negocio.nombre}</option>
					{/each}
				</select>
				{#if errores.negocio_id && tocado.negocio_id}
					<p class="text-sm text-red-600 dark:text-red-400 mt-1">{errores.negocio_id}</p>
				{/if}
			</div>

			<!-- Tipo de movimiento - Version móvil mejorada -->
			<div class="lg:col-span-2">
				<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
					Tipo de Movimiento *
				</label>
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
					{#each tiposMovimiento as tipo}
						<label class="relative cursor-pointer">
							<input
								type="radio"
								bind:group={formulario.tipo_movimiento}
								value={tipo.valor}
								class="sr-only"
								on:change={handleTipoChange}
							/>
							<div class="border-2 rounded-xl p-3 sm:p-4 transition-all duration-200 hover:shadow-md {
								formulario.tipo_movimiento === tipo.valor 
									? tipo.bgColor
									: 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
							}">
								<div class="flex flex-col items-center text-center">
									<svelte:component this={tipo.icono} class="w-5 h-5 sm:w-6 sm:h-6 mb-2 {tipo.color}" />
									<div class="font-medium text-gray-900 dark:text-white text-sm sm:text-base">
										{tipo.nombre}
									</div>
									<div class="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
										{tipo.descripcion}
									</div>
								</div>
							</div>
						</label>
					{/each}
				</div>
				{#if errores.tipo_movimiento}
					<p class="text-sm text-red-600 dark:text-red-400 mt-2">{errores.tipo_movimiento}</p>
				{/if}
			</div>

			<!-- Monto -->
			<div>
				<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
					Monto *
				</label>
				<div class="relative">
					<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
						<span class="text-gray-500 dark:text-gray-400 text-sm sm:text-base">$</span>
					</div>
					<input
						type="number"
						step="0.01"
						min="0.01"
						bind:value={formulario.monto}
						on:blur={() => { tocado.monto = true; validarCampo('monto', parseFloat(formulario.monto.toString())); }}
						class="w-full pl-8 pr-3 sm:pr-4 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base"
						class:border-red-500={errores.monto && tocado.monto}
						placeholder="0.00"
					/>
				</div>
				{#if errores.monto && tocado.monto}
					<p class="text-sm text-red-600 dark:text-red-400 mt-1">{errores.monto}</p>
				{/if}
			</div>

			<!-- Fecha -->
			<div>
				<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
					Fecha del Movimiento *
				</label>
				<input
					type="date"
					bind:value={formulario.fecha_movimiento}
					on:blur={() => { tocado.fecha_movimiento = true; validarCampo('fecha_movimiento', formulario.fecha_movimiento); }}
					class="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base"
					class:border-red-500={errores.fecha_movimiento && tocado.fecha_movimiento}
				/>
				{#if errores.fecha_movimiento && tocado.fecha_movimiento}
					<p class="text-sm text-red-600 dark:text-red-400 mt-1">{errores.fecha_movimiento}</p>
				{/if}
			</div>

			<!-- Descripción -->
			<div class="lg:col-span-2">
				<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
					Descripción *
				</label>
				<input
					type="text"
					bind:value={formulario.descripcion}
					on:blur={() => { tocado.descripcion = true; validarCampo('descripcion', formulario.descripcion); }}
					class="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base"
					class:border-red-500={errores.descripcion && tocado.descripcion}
					placeholder="Describe el motivo de este {formulario.tipo_movimiento}..."
				/>
				{#if errores.descripcion && tocado.descripcion}
					<p class="text-sm text-red-600 dark:text-red-400 mt-1">{errores.descripcion}</p>
				{/if}
			</div>
		</div>

		<!-- Información adicional - Colapsable en móvil -->
		<div class="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 sm:p-6 space-y-4 sm:space-y-6">
			<h4 class="text-sm sm:text-base font-medium text-gray-900 dark:text-white">
				Información adicional sobre este movimiento
			</h4>

			<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<!-- Método de pago -->
				<div>
					<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
						Método de Pago
					</label>
					<select
						bind:value={formulario.metodo_pago}
						class="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base"
					>
						{#each metodosPago as metodo}
							<option value={metodo.valor}>{metodo.nombre}</option>
						{/each}
					</select>
				</div>

				<!-- Categoría -->
				<div>
					<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
						Categoría
					</label>
					<select
						bind:value={formulario.categoria_id}
						class="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base"
					>
						<option value="">Sin categoría</option>
						{#each categoriasFiltradas as categoria}
							<option value={categoria.id}>{categoria.nombre}</option>
						{/each}
					</select>
				</div>
			</div>

			<!-- Notas adicionales -->
			<div>
				<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
					Notas Adicionales
				</label>
				<textarea
					bind:value={formulario.notas}
					rows="3"
					class="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none text-sm sm:text-base"
					placeholder="Notas, observaciones o información adicional..."
				></textarea>
				<p class="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
					Opcional: Información adicional para referencia futura
				</p>
			</div>
		</div>

		<!-- Botones de acción -->
		<div class="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-700">
			<button
				type="button"
				on:click={handleCancelar}
				disabled={guardando}
				class="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-4 focus:ring-gray-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
			>
				<X class="w-4 h-4 mr-2 inline" />
				Cancelar
			</button>
			
			<button
				type="submit"
				disabled={guardando}
				class="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 text-sm font-medium text-white bg-gradient-to-r from-green-600 to-blue-600 rounded-lg hover:from-green-700 hover:to-blue-700 focus:outline-none focus:ring-4 focus:ring-green-500/50 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
			>
				{#if guardando}
					<svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
						<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
						<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
					</svg>
					Guardando...
				{:else}
					<Save class="w-4 h-4 mr-2 inline" />
					{movimiento ? 'Actualizar' : 'Crear'} Movimiento
				{/if}
			</button>
		</div>
	</form>
</div> 