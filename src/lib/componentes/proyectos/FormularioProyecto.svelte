<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { z } from 'zod';
	import type { Proyecto } from '$lib/tipos/app';
	import { COLORES_PROYECTO, ESTADOS_PROYECTO } from '$lib/tipos/app';
	import Boton from '$lib/componentes/ui/Boton.svelte';
	import Input from '$lib/componentes/ui/Input.svelte';
	import Modal from '$lib/componentes/ui/Modal.svelte';

	// Props
	export let proyecto: Proyecto | null = null;
	export let modal = false;
	export let guardando = false;
	export let abierto = false;

	// Event dispatcher
	const dispatch = createEventDispatcher<{
		guardar: { proyecto: Partial<Proyecto> };
		cancelar: void;
		eliminar: { proyecto: Proyecto };
	}>();

	// Schema de validación
	const esquemaProyecto = z.object({
		nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').max(100, 'Máximo 100 caracteres'),
		descripcion: z.string().max(500, 'Máximo 500 caracteres').optional(),
		fecha_inicio: z.string().min(1, 'La fecha de inicio es requerida'),
		fecha_limite: z.string().optional(),
		color: z.string().min(1, 'Selecciona un color'),
		estado: z.enum(['activo', 'pausado', 'completado', 'archivado'])
	});

	// Estado del formulario
	let formulario = {
		nombre: proyecto?.nombre || '',
		descripcion: proyecto?.descripcion || '',
		fecha_inicio: proyecto?.fecha_inicio ? new Date(proyecto.fecha_inicio).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
		fecha_limite: proyecto?.fecha_limite ? new Date(proyecto.fecha_limite).toISOString().split('T')[0] : '',
		color: proyecto?.color || COLORES_PROYECTO[0].valor,
		estado: proyecto?.estado || 'activo'
	};

	// Estados de validación
	let errores: Record<string, string> = {};
	let tocado: Record<string, boolean> = {};

	// Validar campo individual
	const validarCampo = (campo: string, valor: any) => {
		try {
			const esquemaCampo = esquemaProyecto.pick({ [campo]: true } as any);
			esquemaCampo.parse({ [campo]: valor });
			errores[campo] = '';
		} catch (error) {
			if (error instanceof z.ZodError) {
				errores[campo] = error.errors[0]?.message || '';
			}
		}
		errores = { ...errores };
	};

	// Validar formulario completo
	const validarFormulario = () => {
		try {
			// Validar fechas
			if (formulario.fecha_limite && formulario.fecha_inicio) {
				const fechaInicio = new Date(formulario.fecha_inicio);
				const fechaLimite = new Date(formulario.fecha_limite);
				if (fechaLimite <= fechaInicio) {
					errores.fecha_limite = 'La fecha límite debe ser posterior a la fecha de inicio';
					return false;
				}
			}

			esquemaProyecto.parse(formulario);
			errores = {};
			return true;
		} catch (error) {
			if (error instanceof z.ZodError) {
				error.errors.forEach(err => {
					if (err.path[0]) {
						errores[err.path[0] as string] = err.message;
					}
				});
			}
			errores = { ...errores };
			return false;
		}
	};

	// Handlers
	const handleSubmit = () => {
		// Marcar todos los campos como tocados
		Object.keys(formulario).forEach(campo => {
			tocado[campo] = true;
		});
		tocado = { ...tocado };

		if (validarFormulario()) {
			const fechaInicio = new Date(formulario.fecha_inicio).toISOString();
			const fechaLimite = formulario.fecha_limite ? new Date(formulario.fecha_limite).toISOString() : null;

			dispatch('guardar', {
				proyecto: {
					...formulario,
					fecha_inicio: fechaInicio,
					fecha_limite: fechaLimite
				}
			});
		}
	};

	const handleCancelar = () => {
		// Resetear formulario si es nuevo proyecto
		if (!proyecto) {
			formulario = {
				nombre: '',
				descripcion: '',
				fecha_inicio: new Date().toISOString().split('T')[0],
				fecha_limite: '',
				color: COLORES_PROYECTO[0].valor,
				estado: 'activo'
			};
			errores = {};
			tocado = {};
		}
		dispatch('cancelar');
	};

	const handleEliminar = () => {
		if (proyecto && confirm('¿Estás seguro de que quieres eliminar este proyecto? Esta acción no se puede deshacer.')) {
			dispatch('eliminar', { proyecto });
		}
	};

	// Reactive statements para validación en tiempo real
	$: if (tocado.nombre) validarCampo('nombre', formulario.nombre);
	$: if (tocado.descripcion) validarCampo('descripcion', formulario.descripcion);
	$: if (tocado.fecha_inicio) validarCampo('fecha_inicio', formulario.fecha_inicio);
	$: if (tocado.color) validarCampo('color', formulario.color);
	$: if (tocado.estado) validarCampo('estado', formulario.estado);

	// Validar fechas cuando cambien
	$: if (tocado.fecha_limite && formulario.fecha_limite && formulario.fecha_inicio) {
		const fechaInicio = new Date(formulario.fecha_inicio);
		const fechaLimite = new Date(formulario.fecha_limite);
		if (fechaLimite <= fechaInicio) {
			errores.fecha_limite = 'La fecha límite debe ser posterior a la fecha de inicio';
		} else {
			errores.fecha_limite = '';
		}
		errores = { ...errores };
	}

	// Título del formulario
	$: titulo = proyecto ? 'Editar Proyecto' : 'Nuevo Proyecto';
</script>

{#if modal}
	<Modal bind:abierto titulo={titulo} size="lg">
		<div class="space-y-6">
			<!-- Contenido del formulario -->
			<div class="grid grid-cols-1 gap-6">
				<!-- Nombre del proyecto -->
				<div class="mb-6">
					<Input
						tipo="text"
						etiqueta="Nombre del Proyecto"
						bind:valor={formulario.nombre}
						placeholder="Ej: Desarrollo de App Móvil"
						obligatorio
						error={errores.nombre}
						ayuda="Un nombre claro y descriptivo para tu proyecto"
						on:blur={() => validarCampo('nombre', formulario.nombre)}
					/>
				</div>

				<!-- Descripción -->
				<div class="mb-6">
					<Input
						tipo="textarea"
						etiqueta="Descripción"
						bind:valor={formulario.descripcion}
						placeholder="Describe brevemente el objetivo y alcance del proyecto..."
						filas={3}
						error={errores.descripcion}
						ayuda="Opcional: Añade detalles que te ayuden a recordar el contexto"
						on:blur={() => validarCampo('descripcion', formulario.descripcion)}
					/>
				</div>

				<!-- Fechas -->
				<div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
					<Input
						tipo="date"
						etiqueta="Fecha de Inicio"
						bind:valor={formulario.fecha_inicio}
						obligatorio
						error={errores.fecha_inicio}
						on:blur={() => validarCampo('fecha_inicio', formulario.fecha_inicio)}
					/>
						
					<Input
						tipo="date"
						etiqueta="Fecha Límite"
						bind:valor={formulario.fecha_limite}
						error={errores.fecha_limite}
						ayuda="Opcional"
						on:blur={() => validarCampo('fecha_limite', formulario.fecha_limite)}
					/>
				</div>

				<!-- Color y Estado -->
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<!-- Selector de color -->
					<div>
						<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
							Color del proyecto
						</label>
						<div class="grid grid-cols-4 gap-3">
							{#each COLORES_PROYECTO as color}
								<button
									type="button"
									class="group relative w-12 h-12 rounded-xl transition-all duration-200 hover:scale-110 {
										formulario.color === color.valor 
											? 'ring-2 ring-primary-500 ring-offset-2 dark:ring-offset-gray-800' 
											: 'hover:ring-2 hover:ring-gray-300 dark:hover:ring-gray-600'
									}"
									style="background-color: {color.color}"
									on:click={() => {
										formulario.color = color.valor;
										tocado.color = true;
									}}
									title={color.nombre}
								>
									{#if formulario.color === color.valor}
										<div class="absolute inset-0 flex items-center justify-center">
											<svg class="w-6 h-6 text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
											</svg>
										</div>
									{/if}
								</button>
							{/each}
						</div>
						{#if errores.color}
							<p class="mt-1 text-sm text-red-600 dark:text-red-400">{errores.color}</p>
						{/if}
					</div>

					<!-- Estado -->
					<div>
						<label for="estado" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
							Estado
						</label>
						<select
							id="estado"
							bind:value={formulario.estado}
							on:change={() => tocado.estado = true}
							class="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
						>
							{#each ESTADOS_PROYECTO as estado}
								<option value={estado.valor}>
									{estado.etiqueta}
								</option>
							{/each}
						</select>
						{#if errores.estado}
							<p class="mt-1 text-sm text-red-600 dark:text-red-400">{errores.estado}</p>
						{/if}
					</div>
				</div>
			</div>
		</div>

		<!-- Botones del modal -->
		<div slot="footer" class="flex items-center justify-between">
			<div>
				{#if proyecto}
					<Boton
						variante="danger"
						size="sm"
						icono="trash-2"
						on:click={handleEliminar}
						disabled={guardando}
					>
						Eliminar
					</Boton>
				{/if}
			</div>
			
			<div class="flex items-center space-x-3">
				<Boton
					variante="ghost"
					on:click={handleCancelar}
					disabled={guardando}
				>
					Cancelar
				</Boton>
				<Boton
					variante="primary"
					icono="save"
					loading={guardando}
					on:click={handleSubmit}
				>
					{proyecto ? 'Actualizar' : 'Crear'} Proyecto
				</Boton>
			</div>
		</div>
	</Modal>
{:else}
	<!-- Formulario directo (sin modal) -->
	<div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50">
		<div class="flex items-center justify-between mb-6">
			<h2 class="text-xl font-semibold text-gray-900 dark:text-white">
				{titulo}
			</h2>
			{#if proyecto}
				<Boton
					variante="danger"
					size="sm"
					icono="trash-2"
					on:click={handleEliminar}
					disabled={guardando}
				>
					Eliminar
				</Boton>
			{/if}
		</div>

		<div class="space-y-6">
			<!-- Misma estructura que en el modal pero sin el wrapper Modal -->
			<div class="grid grid-cols-1 gap-6">
				<!-- Nombre del proyecto -->
				<div class="mb-6">
					<Input
						tipo="text"
						etiqueta="Nombre del Proyecto"
						bind:valor={formulario.nombre}
						placeholder="Ej: Desarrollo de App Móvil"
						obligatorio
						error={errores.nombre}
						ayuda="Un nombre claro y descriptivo para tu proyecto"
						on:blur={() => validarCampo('nombre', formulario.nombre)}
					/>
				</div>

				<!-- Descripción -->
				<div class="mb-6">
					<Input
						tipo="textarea"
						etiqueta="Descripción"
						bind:valor={formulario.descripcion}
						placeholder="Describe brevemente el objetivo y alcance del proyecto..."
						filas={3}
						error={errores.descripcion}
						ayuda="Opcional: Añade detalles que te ayuden a recordar el contexto"
						on:blur={() => validarCampo('descripcion', formulario.descripcion)}
					/>
				</div>

				<!-- Fechas -->
				<div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
					<Input
						tipo="date"
						etiqueta="Fecha de Inicio"
						bind:valor={formulario.fecha_inicio}
						obligatorio
						error={errores.fecha_inicio}
						on:blur={() => validarCampo('fecha_inicio', formulario.fecha_inicio)}
					/>
						
					<Input
						tipo="date"
						etiqueta="Fecha Límite"
						bind:valor={formulario.fecha_limite}
						error={errores.fecha_limite}
						ayuda="Opcional"
						on:blur={() => validarCampo('fecha_limite', formulario.fecha_limite)}
					/>
				</div>

				<!-- Color y Estado -->
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<!-- Selector de color -->
					<div>
						<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
							Color del proyecto
						</label>
						<div class="grid grid-cols-4 gap-3">
							{#each COLORES_PROYECTO as color}
								<button
									type="button"
									class="group relative w-12 h-12 rounded-xl transition-all duration-200 hover:scale-110 {
										formulario.color === color.valor 
											? 'ring-2 ring-primary-500 ring-offset-2 dark:ring-offset-gray-800' 
											: 'hover:ring-2 hover:ring-gray-300 dark:hover:ring-gray-600'
									}"
									style="background-color: {color.color}"
									on:click={() => {
										formulario.color = color.valor;
										tocado.color = true;
									}}
									title={color.nombre}
								>
									{#if formulario.color === color.valor}
										<div class="absolute inset-0 flex items-center justify-center">
											<svg class="w-6 h-6 text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
											</svg>
										</div>
									{/if}
								</button>
							{/each}
						</div>
						{#if errores.color}
							<p class="mt-1 text-sm text-red-600 dark:text-red-400">{errores.color}</p>
						{/if}
					</div>

					<!-- Estado -->
					<div>
						<label for="estado-form" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
							Estado
						</label>
						<select
							id="estado-form"
							bind:value={formulario.estado}
							on:change={() => tocado.estado = true}
							class="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
						>
							{#each ESTADOS_PROYECTO as estado}
								<option value={estado.valor}>
									{estado.etiqueta}
								</option>
							{/each}
						</select>
						{#if errores.estado}
							<p class="mt-1 text-sm text-red-600 dark:text-red-400">{errores.estado}</p>
						{/if}
					</div>
				</div>
			</div>

			<!-- Botones -->
			<div class="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
				<Boton
					variante="ghost"
					on:click={handleCancelar}
					disabled={guardando}
				>
					Cancelar
				</Boton>
				<Boton
					variante="primary"
					icono="save"
					loading={guardando}
					on:click={handleSubmit}
				>
					{proyecto ? 'Actualizar' : 'Crear'} Proyecto
				</Boton>
			</div>
		</div>
	</div>
{/if} 