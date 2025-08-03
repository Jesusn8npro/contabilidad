<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { Tarea, EstadoTarea, PrioridadTarea, Proyecto, Negocio } from '$lib/tipos/app';
	import Boton from '$lib/componentes/ui/Boton.svelte';
	import Input from '$lib/componentes/ui/Input.svelte';
	import { Plus, Calendar, Clock, Flag, Tag } from 'lucide-svelte';

	// Props
	export let tarea: Partial<Tarea> | null = null;
	export let proyecto: Proyecto | null = null;
	export let negocio: Negocio | null = null;
	export let estadoInicial: EstadoTarea = 'por-hacer';
	export let guardando = false;

	// Event dispatcher
	const dispatch = createEventDispatcher<{
		'tarea-guardada': { tarea: Partial<Tarea> };
		cancelar: void;
	}>();

	// Estados del formulario
	let titulo = tarea?.titulo || '';
	let descripcion = tarea?.descripcion || '';
	let estado: EstadoTarea = tarea?.estado || estadoInicial;
	let prioridad: PrioridadTarea = tarea?.prioridad || 'media';
	let fechaLimite = tarea?.fecha_limite ? tarea.fecha_limite.split('T')[0] : '';
	let fechaInicio = tarea?.fecha_inicio ? tarea.fecha_inicio.split('T')[0] : '';
	let tiempoEstimado = tarea?.tiempo_estimado_horas || 0;
	let etiquetasTexto = tarea?.etiquetas?.join(', ') || '';

	// Opciones
	const opcionesEstado: { valor: EstadoTarea; etiqueta: string; color: string }[] = [
		{ valor: 'por-hacer', etiqueta: 'Por Hacer', color: 'bg-gray-100 text-gray-700' },
		{ valor: 'en-progreso', etiqueta: 'En Progreso', color: 'bg-blue-100 text-blue-700' },
		{ valor: 'en-revision', etiqueta: 'En Revisión', color: 'bg-yellow-100 text-yellow-700' },
		{ valor: 'completada', etiqueta: 'Completada', color: 'bg-green-100 text-green-700' },
		{ valor: 'pausada', etiqueta: 'Pausada', color: 'bg-red-100 text-red-700' }
	];

	const opcionesPrioridad: { valor: PrioridadTarea; etiqueta: string; color: string }[] = [
		{ valor: 'baja', etiqueta: 'Baja', color: 'text-green-600' },
		{ valor: 'media', etiqueta: 'Media', color: 'text-yellow-600' },
		{ valor: 'alta', etiqueta: 'Alta', color: 'text-orange-600' },
		{ valor: 'urgente', etiqueta: 'Urgente', color: 'text-red-600' }
	];

	// Validación
	$: esValido = titulo.trim().length >= 3;

	// Handlers
	const handleSubmit = async () => {
		if (!esValido || guardando) return;

		const etiquetas = etiquetasTexto
			.split(',')
			.map(tag => tag.trim())
			.filter(tag => tag.length > 0);

		const tareaData: Partial<Tarea> = {
			...tarea,
			titulo: titulo.trim(),
			descripcion: descripcion.trim() || undefined,
			estado,
			prioridad,
			fecha_limite: fechaLimite ? `${fechaLimite}T23:59:59` : undefined,
			fecha_inicio: fechaInicio ? `${fechaInicio}T00:00:00` : undefined,
			tiempo_estimado_horas: tiempoEstimado > 0 ? tiempoEstimado : undefined,
			etiquetas: etiquetas.length > 0 ? etiquetas : undefined,
			proyecto_id: proyecto?.id || null,
			negocio_id: negocio?.id || null
		};

		dispatch('tarea-guardada', { tarea: tareaData });
	};

	const handleCancelar = () => {
		dispatch('cancelar');
	};

	// Contexto de la tarea
	$: contexto = proyecto ? `Proyecto: ${proyecto.nombre}` : 
	             negocio ? `Negocio: ${negocio.nombre}` : 
	             'Tarea Personal';
</script>

<div class="w-full max-w-full overflow-hidden">
	<div class="space-y-4 sm:space-y-6">
		<!-- Header del formulario -->
		<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
			<div class="min-w-0 flex-1">
				<h3 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white truncate">
					{tarea ? 'Editar Tarea' : 'Nueva Tarea'}
				</h3>
				<p class="text-sm text-gray-600 dark:text-gray-400 truncate">
					{contexto}
				</p>
			</div>
			<div class="flex items-center space-x-2 flex-shrink-0">
				<!-- Indicador de prioridad -->
				<div class="flex items-center space-x-1">
					<Flag class="w-4 h-4 {opcionesPrioridad.find(p => p.valor === prioridad)?.color}" />
					<span class="text-xs {opcionesPrioridad.find(p => p.valor === prioridad)?.color} font-medium">
						{opcionesPrioridad.find(p => p.valor === prioridad)?.etiqueta}
					</span>
				</div>
			</div>
		</div>

		<!-- Formulario -->
		<form on:submit|preventDefault={handleSubmit} class="space-y-4">
			<!-- Título -->
			<div>
				<Input
					tipo="text"
					label="Título de la tarea"
					placeholder="Ej: Implementar sistema de autenticación"
					bind:valor={titulo}
					required
					maxlength={255}
				/>
			</div>

			<!-- Descripción -->
			<div>
				<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
					Descripción (opcional)
				</label>
				<textarea
					bind:value={descripcion}
					placeholder="Detalles adicionales sobre la tarea..."
					rows="3"
					class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none text-sm"
				></textarea>
			</div>

			<!-- Estado y Prioridad -->
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<!-- Estado -->
				<div>
					<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
						Estado
					</label>
					<select
						bind:value={estado}
						class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
					>
						{#each opcionesEstado as opcion}
							<option value={opcion.valor}>{opcion.etiqueta}</option>
						{/each}
					</select>
				</div>

				<!-- Prioridad -->
				<div>
					<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
						Prioridad
					</label>
					<select
						bind:value={prioridad}
						class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
					>
						{#each opcionesPrioridad as opcion}
							<option value={opcion.valor}>{opcion.etiqueta}</option>
						{/each}
					</select>
				</div>
			</div>

			<!-- Fechas -->
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<!-- Fecha de inicio -->
				<div>
					<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
						<Calendar class="w-4 h-4 inline mr-1" />
						Fecha de inicio
					</label>
					<input
						type="date"
						bind:value={fechaInicio}
						class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
					/>
				</div>

				<!-- Fecha límite -->
				<div>
					<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
						<Calendar class="w-4 h-4 inline mr-1" />
						Fecha límite
					</label>
					<input
						type="date"
						bind:value={fechaLimite}
						class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
					/>
				</div>
			</div>

			<!-- Tiempo estimado y Etiquetas -->
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<div>
					<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
						<Clock class="w-4 h-4 inline mr-1" />
						Tiempo estimado (horas)
					</label>
					<input
						type="number"
						bind:value={tiempoEstimado}
						min="0"
						max="1000"
						step="0.5"
						placeholder="0"
						class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
					/>
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
						<Tag class="w-4 h-4 inline mr-1" />
						Etiquetas
					</label>
					<input
						type="text"
						bind:value={etiquetasTexto}
						placeholder="frontend, urgente, cliente-x"
						class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
					/>
				</div>
			</div>

			<!-- Preview de etiquetas -->
			{#if etiquetasTexto.trim()}
				<div class="flex flex-wrap gap-1">
					{#each etiquetasTexto.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) as etiqueta}
						<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-400">
							{etiqueta}
						</span>
					{/each}
				</div>
			{/if}

			<!-- Botones -->
			<div class="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
				<Boton
					variante="secondary"
					on:click={handleCancelar}
					disabled={guardando}
					class="w-full sm:w-auto"
				>
					Cancelar
				</Boton>
				<Boton
					tipo="submit"
					variante="primary"
					disabled={!esValido || guardando}
					{guardando}
					class="w-full sm:w-auto"
				>
					<Plus class="w-4 h-4 mr-2" />
					{guardando ? 'Guardando...' : (tarea ? 'Actualizar' : 'Crear')} Tarea
				</Boton>
			</div>
		</form>
	</div>
</div> 