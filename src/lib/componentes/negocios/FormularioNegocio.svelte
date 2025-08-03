<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { z } from 'zod';
	import type { Negocio } from '$lib/tipos/app';
	import Boton from '$lib/componentes/ui/Boton.svelte';
	import Input from '$lib/componentes/ui/Input.svelte';
	import { Building2, DollarSign, Save, X } from 'lucide-svelte';

	// Props
	export let negocio: Negocio | null = null;
	export let guardando = false;

	// Event dispatcher
	const dispatch = createEventDispatcher<{
		guardar: { negocio: Partial<Negocio> };
		cancelar: void;
	}>();

	// Schema de validación
	const esquemaNegocio = z.object({
		nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').max(255, 'Máximo 255 caracteres'),
		tipo_negocio: z.enum(['servicio', 'producto', 'mixto', 'inversion', 'freelance', 'otro']),
		descripcion: z.string().max(1000, 'Máximo 1000 caracteres').optional(),
		moneda: z.enum(['USD', 'EUR', 'COP', 'MXN', 'ARG', 'PEN', 'CHL', 'BRL'])
	});

	// Estado del formulario
	let formulario = {
		nombre: negocio?.nombre || '',
		tipo_negocio: negocio?.tipo_negocio || 'servicio',
		descripcion: negocio?.descripcion || '',
		moneda: negocio?.moneda || 'USD'
	};

	// Estados de validación
	let errores: Record<string, string> = {};
	let tocado: Record<string, boolean> = {};

	// Opciones para el formulario
	const tiposNegocio = [
		{ valor: 'servicio', nombre: 'Servicio', icono: '🔧', descripcion: 'Prestación de servicios' },
		{ valor: 'producto', nombre: 'Producto', icono: '📦', descripcion: 'Venta de productos físicos/digitales' },
		{ valor: 'freelance', nombre: 'Freelance', icono: '💻', descripcion: 'Trabajo independiente' },
		{ valor: 'inversion', nombre: 'Inversión', icono: '📈', descripcion: 'Inversiones y trading' },
		{ valor: 'mixto', nombre: 'Mixto', icono: '🔄', descripcion: 'Servicios y productos' },
		{ valor: 'otro', nombre: 'Otro', icono: '🏢', descripcion: 'Otro tipo de negocio' }
	];

	const monedas = [
		{ codigo: 'USD', nombre: 'Dólar (USD)', simbolo: '$' },
		{ codigo: 'EUR', nombre: 'Euro (EUR)', simbolo: '€' },
		{ codigo: 'COP', nombre: 'Peso Colombiano (COP)', simbolo: '$' },
		{ codigo: 'MXN', nombre: 'Peso Mexicano (MXN)', simbolo: '$' },
		{ codigo: 'ARG', nombre: 'Peso Argentino (ARG)', simbolo: '$' },
		{ codigo: 'PEN', nombre: 'Sol Peruano (PEN)', simbolo: 'S/' },
		{ codigo: 'CHL', nombre: 'Peso Chileno (CHL)', simbolo: '$' },
		{ codigo: 'BRL', nombre: 'Real Brasileño (BRL)', simbolo: 'R$' }
	];

	// Validar campo individual
	const validarCampo = (campo: string, valor: any) => {
		try {
			const esquemaCampo = esquemaNegocio.pick({ [campo]: true } as any);
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
			esquemaNegocio.parse(formulario);
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

	// Guardar negocio
	const guardarNegocio = () => {
		if (validarFormulario()) {
			dispatch('guardar', { negocio: formulario });
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

	// Obtener icono del tipo de negocio
	const obtenerIconoTipo = (tipo: string) => {
		return tiposNegocio.find(t => t.valor === tipo)?.icono || '🏢';
	};
</script>

<div class="space-y-6">
	<!-- Header del formulario -->
	<div class="flex items-center space-x-4 pb-4 border-b border-gray-200 dark:border-gray-700">
		<div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
			<Building2 class="w-6 h-6 text-white" />
		</div>
		<div>
			<h3 class="text-lg font-semibold text-gray-900 dark:text-white">
				{negocio ? 'Editar Negocio' : 'Nuevo Negocio'}
			</h3>
			<p class="text-sm text-gray-600 dark:text-gray-400">
				{negocio ? 'Modifica la información del negocio' : 'Crea un nuevo negocio para gestionar tus finanzas'}
			</p>
		</div>
	</div>

	<!-- Formulario -->
	<div class="space-y-6">
		<!-- Nombre del negocio -->
		<div>
			<Input
				tipo="text"
				etiqueta="Nombre del Negocio"
				bind:valor={formulario.nombre}
				placeholder="Ej: Mi Consultoría Digital"
				obligatorio
				error={errores.nombre}
				ayuda="Un nombre claro y profesional para tu negocio"
				on:blur={() => {
					marcarTocado('nombre');
					validarCampo('nombre', formulario.nombre);
				}}
			/>
		</div>

		<!-- Tipo de negocio -->
		<div>
			<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
				Tipo de Negocio *
			</label>
			<div class="grid grid-cols-2 md:grid-cols-3 gap-3">
				{#each tiposNegocio as tipo}
					<label class="relative">
						<input
							type="radio"
							bind:group={formulario.tipo_negocio}
							value={tipo.valor}
							class="sr-only"
							on:change={() => {
								marcarTocado('tipo_negocio');
								validarCampo('tipo_negocio', formulario.tipo_negocio);
							}}
						/>
						<div class="cursor-pointer border-2 rounded-xl p-4 transition-all duration-200 hover:shadow-md {
							formulario.tipo_negocio === tipo.valor 
								? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
								: 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
						}">
							<div class="text-center">
								<div class="text-2xl mb-2">{tipo.icono}</div>
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
			{#if errores.tipo_negocio}
				<p class="text-sm text-red-600 dark:text-red-400 mt-2 flex items-center space-x-1">
					<span>{errores.tipo_negocio}</span>
				</p>
			{/if}
		</div>

		<!-- Descripción -->
		<div>
			<Input
				tipo="textarea"
				etiqueta="Descripción del Negocio"
				bind:valor={formulario.descripcion}
				placeholder="Describe brevemente tu negocio, servicios que ofreces, productos que vendes..."
				filas={4}
				error={errores.descripcion}
				ayuda="Opcional: Información adicional sobre tu negocio"
				on:blur={() => {
					marcarTocado('descripcion');
					validarCampo('descripcion', formulario.descripcion);
				}}
			/>
		</div>

		<!-- Moneda -->
		<div>
			<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
				Moneda Principal *
			</label>
			<div class="grid grid-cols-2 md:grid-cols-4 gap-3">
				{#each monedas as moneda}
					<label class="relative">
						<input
							type="radio"
							bind:group={formulario.moneda}
							value={moneda.codigo}
							class="sr-only"
							on:change={() => {
								marcarTocado('moneda');
								validarCampo('moneda', formulario.moneda);
							}}
						/>
						<div class="cursor-pointer border-2 rounded-lg p-3 transition-all duration-200 hover:shadow-md {
							formulario.moneda === moneda.codigo 
								? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
								: 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
						}">
							<div class="text-center">
								<div class="font-bold text-lg text-gray-900 dark:text-white">
									{moneda.simbolo}
								</div>
								<div class="text-sm font-medium text-gray-700 dark:text-gray-300">
									{moneda.codigo}
								</div>
								<div class="text-xs text-gray-500 dark:text-gray-400 truncate">
									{moneda.nombre.split('(')[0].trim()}
								</div>
							</div>
						</div>
					</label>
				{/each}
			</div>
			{#if errores.moneda}
				<p class="text-sm text-red-600 dark:text-red-400 mt-2 flex items-center space-x-1">
					<span>{errores.moneda}</span>
				</p>
			{/if}
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
			on:click={guardarNegocio}
			disabled={guardando}
			class="shadow-lg"
		>
			{#if guardando}
				<div class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
				Guardando...
			{:else}
				<Save class="w-4 h-4 mr-2" />
				{negocio ? 'Actualizar' : 'Crear'} Negocio
			{/if}
		</Boton>
	</div>
</div> 