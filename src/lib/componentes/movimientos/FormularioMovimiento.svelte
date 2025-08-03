<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { z } from 'zod';
	import type { MovimientoFinanciero, Categoria, Negocio } from '$lib/tipos/app';
	import Boton from '$lib/componentes/ui/Boton.svelte';
	import Input from '$lib/componentes/ui/Input.svelte';
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
		metodo_pago: z.enum(['efectivo', 'transferencia', 'tarjeta', 'cheque', 'digital', 'crypto', 'otro']).optional(),
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
			icono: TrendingUp, 
			color: 'text-green-600 dark:text-green-400',
			bgColor: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
			descripcion: 'Dinero que entra al negocio'
		},
		{ 
			valor: 'gasto', 
			nombre: 'Gasto', 
			icono: TrendingDown, 
			color: 'text-red-600 dark:text-red-400',
			bgColor: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
			descripcion: 'Dinero que sale del negocio'
		}
	];

	const metodosPago = [
		{ codigo: 'efectivo', nombre: 'Efectivo', icono: '💵' },
		{ codigo: 'transferencia', nombre: 'Transferencia Bancaria', icono: '🏦' },
		{ codigo: 'tarjeta', nombre: 'Tarjeta (Débito/Crédito)', icono: '💳' },
		{ codigo: 'cheque', nombre: 'Cheque', icono: '📝' },
		{ codigo: 'digital', nombre: 'Billetera Digital', icono: '📱' },
		{ codigo: 'crypto', nombre: 'Criptomoneda', icono: '₿' },
		{ codigo: 'otro', nombre: 'Otro', icono: '🔄' }
	];

	// Filtrar categorías por tipo
	$: categoriasFiltradas = categorias.filter(cat => 
		cat.tipo_categoria === formulario.tipo_movimiento
	);

	// Validar campo individual
	const validarCampo = (campo: string, valor: any) => {
		try {
			// Convertir monto a número si es string
			if (campo === 'monto' && typeof valor === 'string') {
				valor = parseFloat(valor) || 0;
			}
			
			const esquemaCampo = esquemaMovimiento.pick({ [campo]: true } as any);
			esquemaCampo.parse({ [campo]: valor });
			errores[campo] = '';
		} catch (error) {
			if (error instanceof z.ZodError) {
				errores[campo] = error.errors[0].message;
			}
		}
		errores = { ...errores };
	};

	// Validar todo el formulario
	const validarFormulario = () => {
		try {
			// Convertir monto a número
			const formularioValidado = {
				...formulario,
				monto: typeof formulario.monto === 'string' ? parseFloat(formulario.monto) || 0 : formulario.monto
			};
			
			esquemaMovimiento.parse(formularioValidado);
			errores = {};
			return true;
		} catch (error) {
			if (error instanceof z.ZodError) {
				errores = {};
				error.errors.forEach((err) => {
					if (err.path.length > 0) {
						errores[err.path[0]] = err.message;
					}
				});
			}
			return false;
		}
	};

	// Guardar movimiento
	const guardarMovimiento = () => {
		if (validarFormulario()) {
			const movimientoData = {
				...formulario,
				monto: typeof formulario.monto === 'string' ? parseFloat(formulario.monto) || 0 : formulario.monto
			};
			dispatch('guardar', { movimiento: movimientoData });
		}
	};

	// Cancelar
	const cancelar = () => {
		dispatch('cancelar');
	};

	// Marcar campo como tocado
	const marcarTocado = (campo: string) => {
		tocado[campo] = true;
		tocado = { ...tocado };
	};

	// Manejar cambio de tipo de movimiento
	const handleTipoChange = () => {
		// Limpiar categoría cuando cambia el tipo
		formulario.categoria_id = '';
		marcarTocado('tipo_movimiento');
		validarCampo('tipo_movimiento', formulario.tipo_movimiento);
	};

	// Obtener símbolo de moneda del negocio seleccionado
	const getSimboloMoneda = () => {
		const negocio = negocios.find(n => n.id === formulario.negocio_id);
		const simbolos: Record<string, string> = {
			USD: '$', EUR: '€', COP: '$', MXN: '$', ARG: '$', PEN: 'S/', CHL: '$', BRL: 'R$'
		};
		return simbolos[negocio?.moneda || 'USD'] || '$';
	};
</script>

<div class="space-y-6">
	<!-- Header del formulario -->
	<div class="flex items-center space-x-4 pb-4 border-b border-gray-200 dark:border-gray-700">
		<div class="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
			<DollarSign class="w-6 h-6 text-white" />
		</div>
		<div>
			<h3 class="text-lg font-semibold text-gray-900 dark:text-white">
				{movimiento ? 'Editar Movimiento' : 'Nuevo Movimiento'}
			</h3>
			<p class="text-sm text-gray-600 dark:text-gray-400">
				{movimiento ? 'Modifica la información del movimiento' : 'Registra un ingreso o gasto del negocio'}
			</p>
		</div>
	</div>

	<!-- Formulario -->
	<div class="space-y-6">
		<!-- Negocio y Tipo de movimiento -->
		<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
			<!-- Negocio -->
			<div>
				<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
					Negocio *
				</label>
				<select
					bind:value={formulario.negocio_id}
					class="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
					on:blur={() => {
						marcarTocado('negocio_id');
						validarCampo('negocio_id', formulario.negocio_id);
					}}
				>
					<option value="">Selecciona un negocio</option>
					{#each negocios as negocio}
						<option value={negocio.id}>{negocio.nombre}</option>
					{/each}
				</select>
				{#if errores.negocio_id}
					<p class="text-sm text-red-600 dark:text-red-400 mt-1">{errores.negocio_id}</p>
				{/if}
			</div>

			<!-- Tipo de movimiento -->
			<div>
				<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
					Tipo de Movimiento *
				</label>
				<div class="grid grid-cols-2 gap-3">
					{#each tiposMovimiento as tipo}
						<label class="relative">
							<input
								type="radio"
								bind:group={formulario.tipo_movimiento}
								value={tipo.valor}
								class="sr-only"
								on:change={handleTipoChange}
							/>
							<div class="cursor-pointer border-2 rounded-xl p-4 transition-all duration-200 hover:shadow-md {
								formulario.tipo_movimiento === tipo.valor 
									? tipo.bgColor
									: 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
							}">
								<div class="flex flex-col items-center text-center">
									<svelte:component this={tipo.icono} class="w-6 h-6 mb-2 {tipo.color}" />
									<div class="font-medium text-gray-900 dark:text-white text-sm">
										{tipo.nombre}
									</div>
									<div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
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
		</div>

		<!-- Monto y Fecha -->
		<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
			<!-- Monto -->
			<div>
				<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
					Monto *
				</label>
				<div class="relative">
					<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
						<span class="text-gray-500 dark:text-gray-400 font-medium">{getSimboloMoneda()}</span>
					</div>
					<input
						type="number"
						bind:value={formulario.monto}
						placeholder="0.00"
						step="0.01"
						min="0.01"
						class="w-full pl-8 pr-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
						on:blur={() => {
							marcarTocado('monto');
							validarCampo('monto', formulario.monto);
						}}
					/>
				</div>
				{#if errores.monto}
					<p class="text-sm text-red-600 dark:text-red-400 mt-1">{errores.monto}</p>
				{/if}
			</div>

			<!-- Fecha -->
			<div>
				<Input
					tipo="date"
					etiqueta="Fecha del Movimiento"
					bind:valor={formulario.fecha_movimiento}
					obligatorio
					error={errores.fecha_movimiento}
					on:blur={() => {
						marcarTocado('fecha_movimiento');
						validarCampo('fecha_movimiento', formulario.fecha_movimiento);
					}}
				/>
			</div>
		</div>

		<!-- Categoría -->
		{#if categoriasFiltradas.length > 0}
			<div>
				<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
					Categoría
				</label>
				<select
					bind:value={formulario.categoria_id}
					class="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
					on:blur={() => {
						marcarTocado('categoria_id');
						validarCampo('categoria_id', formulario.categoria_id);
					}}
				>
					<option value="">Sin categoría</option>
					{#each categoriasFiltradas as categoria}
						<option value={categoria.id}>{categoria.nombre}</option>
					{/each}
				</select>
				{#if errores.categoria_id}
					<p class="text-sm text-red-600 dark:text-red-400 mt-1">{errores.categoria_id}</p>
				{/if}
			</div>
		{/if}

		<!-- Descripción -->
		<div>
			<Input
				tipo="textarea"
				etiqueta="Descripción"
				bind:valor={formulario.descripcion}
				placeholder="Describe el motivo de este {formulario.tipo_movimiento}..."
				obligatorio
				filas={3}
				error={errores.descripcion}
				ayuda="Información adicional sobre este movimiento"
				on:blur={() => {
					marcarTocado('descripcion');
					validarCampo('descripcion', formulario.descripcion);
				}}
			/>
		</div>

		<!-- Método de pago -->
		<div>
			<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
				Método de Pago
			</label>
			<div class="grid grid-cols-2 md:grid-cols-4 gap-3">
				{#each metodosPago as metodo}
					<label class="relative">
						<input
							type="radio"
							bind:group={formulario.metodo_pago}
							value={metodo.codigo}
							class="sr-only"
							on:change={() => {
								marcarTocado('metodo_pago');
								validarCampo('metodo_pago', formulario.metodo_pago);
							}}
						/>
						<div class="cursor-pointer border-2 rounded-lg p-3 transition-all duration-200 hover:shadow-md {
							formulario.metodo_pago === metodo.codigo 
								? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
								: 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
						}">
							<div class="text-center">
								<div class="text-lg mb-1">{metodo.icono}</div>
								<div class="text-xs font-medium text-gray-700 dark:text-gray-300">
									{metodo.nombre}
								</div>
							</div>
						</div>
					</label>
				{/each}
			</div>
		</div>

		<!-- Notas adicionales -->
		<div>
			<Input
				tipo="textarea"
				etiqueta="Notas Adicionales"
				bind:valor={formulario.notas}
				placeholder="Notas, observaciones o información adicional..."
				filas={2}
				error={errores.notas}
				ayuda="Opcional: Información adicional para referencia futura"
				on:blur={() => {
					marcarTocado('notas');
					validarCampo('notas', formulario.notas);
				}}
			/>
		</div>
	</div>

	<!-- Acciones -->
	<div class="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
		<Boton
			variante="secondary"
			on:click={cancelar}
			disabled={guardando}
		>
			<X class="w-4 h-4 mr-2" />
			Cancelar
		</Boton>
		<Boton
			on:click={guardarMovimiento}
			disabled={guardando}
			class="shadow-lg"
		>
			{#if guardando}
				<div class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
				Guardando...
			{:else}
				<Save class="w-4 h-4 mr-2" />
				{movimiento ? 'Actualizar' : 'Registrar'} Movimiento
			{/if}
		</Boton>
	</div>
</div> 