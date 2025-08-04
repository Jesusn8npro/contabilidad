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

<!-- Header del formulario épico -->
<div class="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-3xl p-8 text-white mb-8 -mx-6 -mt-6">
	<!-- Elementos decorativos de fondo -->
	<div class="absolute inset-0">
		<div class="absolute top-4 right-8 w-20 h-20 bg-white/10 rounded-full blur-xl animate-pulse"></div>
		<div class="absolute bottom-6 left-6 w-16 h-16 bg-blue-300/20 rounded-full blur-lg animate-pulse delay-500"></div>
		<div class="absolute top-1/2 right-1/4 w-12 h-12 bg-purple-300/20 rounded-full blur-md animate-bounce"></div>
	</div>
	
	<div class="relative z-10 flex items-center space-x-6">
		<!-- Ícono épico -->
		<div class="relative">
			<div class="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30 shadow-2xl transform hover:scale-110 hover:rotate-12 transition-all duration-300">
				<Building2 class="w-10 h-10 text-white" />
			</div>
			<!-- Efecto de brillo -->
			<div class="absolute inset-0 w-20 h-20 bg-yellow-300/20 rounded-2xl opacity-0 hover:opacity-100 animate-ping transition-opacity"></div>
		</div>
		
		<!-- Contenido del header -->
		<div class="flex-1">
			<div class="flex items-center space-x-3 mb-2">
				<h3 class="text-3xl font-black bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
					{negocio ? 'Editar Negocio' : 'Nuevo Negocio'}
				</h3>
				{#if negocio}
					<span class="px-3 py-1 bg-green-500/20 text-green-100 rounded-full text-sm font-semibold border border-green-400/30">
						Editando: {negocio.nombre}
					</span>
				{:else}
					<span class="px-3 py-1 bg-yellow-500/20 text-yellow-100 rounded-full text-sm font-semibold border border-yellow-400/30 animate-pulse">
						✨ Nuevo
					</span>
				{/if}
			</div>
			<p class="text-blue-100 text-lg leading-relaxed max-w-2xl">
				{negocio 
					? 'Modifica la información del negocio y mantén actualizada tu gestión financiera' 
					: 'Crea un nuevo negocio para organizar y gestionar tus finanzas de manera profesional'}
			</p>
			
			<!-- Indicadores de progreso -->
			<div class="flex items-center space-x-4 mt-4">
				<div class="flex items-center space-x-2">
					<div class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
					<span class="text-green-200 text-sm font-medium">Formulario Inteligente</span>
				</div>
				<div class="flex items-center space-x-2">
					<div class="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-300"></div>
					<span class="text-blue-200 text-sm font-medium">Validación Automática</span>
				</div>
				<div class="flex items-center space-x-2">
					<div class="w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-500"></div>
					<span class="text-purple-200 text-sm font-medium">Guardado Seguro</span>
				</div>
			</div>
		</div>
	</div>
</div>

<div class="space-y-6">
	<!-- Formulario -->
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

<!-- Acciones Premium con botones épicos -->
<div class="sticky bottom-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-t border-gray-200/50 dark:border-gray-700/50 p-6 -mx-6 -mb-6 mt-8">
	<div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-end space-y-3 sm:space-y-0 sm:space-x-4">
		<!-- Botón Cancelar -->
		<button
			type="button"
			on:click={cancelar}
			disabled={guardando}
			class="group relative px-8 py-4 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none focus:outline-none focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-600 active:scale-95 overflow-hidden"
		>
			<!-- Efecto de fondo en hover -->
			<div class="absolute inset-0 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-600 dark:to-gray-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
			
			<!-- Contenido del botón -->
			<div class="relative flex items-center justify-center space-x-3">
				<X class="w-5 h-5 transition-transform duration-300 group-hover:rotate-90" />
				<span class="text-lg sm:text-base font-bold">Cancelar</span>
			</div>
			
			<!-- Ripple effect -->
			<div class="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-active:opacity-100 transition-opacity duration-150"></div>
		</button>
		
		<!-- Botón Guardar/Crear -->
		<button
			type="button"
			on:click={guardarNegocio}
			disabled={guardando}
			class="group relative px-10 py-4 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 hover:from-blue-600 hover:via-purple-600 hover:to-indigo-700 text-white font-bold rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none focus:outline-none focus:ring-4 focus:ring-purple-200 dark:focus:ring-purple-600 active:scale-95 overflow-hidden min-w-[180px] sm:min-w-[200px]"
		>
			<!-- Efecto shimmer -->
			<div class="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-shimmer"></div>
			
			<!-- Contenido del botón -->
			<div class="relative flex items-center justify-center space-x-3">
				{#if guardando}
					<!-- Spinner épico -->
					<div class="relative">
						<div class="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
						<div class="absolute inset-0 w-6 h-6 border-3 border-transparent border-t-yellow-300 rounded-full animate-spin animation-delay-150"></div>
					</div>
					<span class="text-lg sm:text-base font-black animate-pulse">
						Guardando...
					</span>
				{:else}
					<div class="relative">
						<Save class="w-6 h-6 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12" />
						<!-- Efecto de brillo en el ícono -->
						<div class="absolute inset-0 w-6 h-6 bg-yellow-300/30 rounded-full opacity-0 group-hover:opacity-100 animate-ping"></div>
					</div>
					<span class="text-lg sm:text-base font-black">
						{negocio ? 'Actualizar' : 'Crear'} Negocio
					</span>
				{/if}
			</div>
			
			<!-- Efecto de particles -->
			<div class="absolute inset-0 pointer-events-none">
				<div class="absolute top-2 left-4 w-1 h-1 bg-yellow-300 rounded-full opacity-0 group-hover:opacity-100 animate-ping animation-delay-300"></div>
				<div class="absolute top-4 right-6 w-1 h-1 bg-blue-200 rounded-full opacity-0 group-hover:opacity-100 animate-ping animation-delay-500"></div>
				<div class="absolute bottom-3 left-8 w-1 h-1 bg-pink-200 rounded-full opacity-0 group-hover:opacity-100 animate-ping animation-delay-700"></div>
			</div>
		</button>
	</div>
	
	<!-- Indicador de progreso cuando está guardando -->
	{#if guardando}
		<div class="mt-4 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
			<div class="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 rounded-full animate-loading-bar"></div>
		</div>
	{/if}
</div> 