<script lang="ts">
	import { ChevronLeft, ChevronRight, Calendar, Clock, Plus, AlertTriangle } from 'lucide-svelte';
	import { createEventDispatcher } from 'svelte';
	
	export let tareas: any[] = [];
	
	const dispatch = createEventDispatcher();
	
	// Estado del calendario
	let fechaActual = new Date();
	let vistaActual: 'mes' | 'semana' | 'dia' = 'mes';
	
	// Nombres de días y meses en español
	const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
	const meses = [
		'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
		'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
	];
	
	// Obtener el primer día del mes
	$: primerDiaMes = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), 1);
	$: ultimoDiaMes = new Date(fechaActual.getFullYear(), fechaActual.getMonth() + 1, 0);
	$: primerDiaSemana = primerDiaMes.getDay();
	
	// Generar días del calendario
	$: diasCalendario = (() => {
		const dias = [];
		const totalDias = ultimoDiaMes.getDate();
		
		// Días del mes anterior
		const diasMesAnterior = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), 0).getDate();
		for (let i = primerDiaSemana - 1; i >= 0; i--) {
			dias.push({
				dia: diasMesAnterior - i,
				esMesActual: false,
				fecha: new Date(fechaActual.getFullYear(), fechaActual.getMonth() - 1, diasMesAnterior - i)
			});
		}
		
		// Días del mes actual
		for (let dia = 1; dia <= totalDias; dia++) {
			dias.push({
				dia,
				esMesActual: true,
				fecha: new Date(fechaActual.getFullYear(), fechaActual.getMonth(), dia)
			});
		}
		
		// Días del siguiente mes para completar la cuadrícula
		const diasRestantes = 42 - dias.length; // 6 semanas × 7 días = 42
		for (let dia = 1; dia <= diasRestantes; dia++) {
			dias.push({
				dia,
				esMesActual: false,
				fecha: new Date(fechaActual.getFullYear(), fechaActual.getMonth() + 1, dia)
			});
		}
		
		return dias;
	})();
	
	// Obtener tareas para una fecha específica
	const obtenerTareasPorFecha = (fecha: Date) => {
		return tareas.filter(tarea => {
			if (!tarea.fecha_limite) return false;
			const fechaTarea = new Date(tarea.fecha_limite);
			return fechaTarea.toDateString() === fecha.toDateString();
		});
	};
	
	// Verificar si es hoy
	const esHoy = (fecha: Date) => {
		const hoy = new Date();
		return fecha.toDateString() === hoy.toDateString();
	};
	
	// Verificar si es fin de semana
	const esFinDeSemana = (fecha: Date) => {
		const dia = fecha.getDay();
		return dia === 0 || dia === 6;
	};
	
	// Navegación
	const navegarMes = (direccion: 'anterior' | 'siguiente') => {
		if (direccion === 'anterior') {
			fechaActual = new Date(fechaActual.getFullYear(), fechaActual.getMonth() - 1, 1);
		} else {
			fechaActual = new Date(fechaActual.getFullYear(), fechaActual.getMonth() + 1, 1);
		}
	};
	
	const irAHoy = () => {
		fechaActual = new Date();
	};
	
	// Obtener color de prioridad
	const obtenerColorPrioridad = (prioridad: string) => {
		switch (prioridad) {
			case 'urgente': return 'bg-red-500 text-white';
			case 'alta': return 'bg-orange-500 text-white';
			case 'media': return 'bg-yellow-500 text-white';
			case 'baja': return 'bg-green-500 text-white';
			default: return 'bg-gray-500 text-white';
		}
	};
</script>

<div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
	<!-- Header del calendario -->
	<div class="p-6 border-b border-gray-200 dark:border-gray-700">
		<div class="flex items-center justify-between mb-4">
			<div class="flex items-center space-x-4">
				<h3 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
					<Calendar class="w-5 h-5 mr-2 text-blue-500" />
					Calendario de Tareas
				</h3>
				
				<!-- Selector de vista -->
				<div class="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
					<button 
						class="px-3 py-1 text-sm rounded-md transition-colors {vistaActual === 'mes' ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' : 'text-gray-600 dark:text-gray-400'}"
						on:click={() => vistaActual = 'mes'}
					>
						Mes
					</button>
					<button 
						class="px-3 py-1 text-sm rounded-md transition-colors {vistaActual === 'semana' ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' : 'text-gray-600 dark:text-gray-400'}"
						on:click={() => vistaActual = 'semana'}
					>
						Semana
					</button>
				</div>
			</div>
			
			<!-- Controles de navegación -->
			<div class="flex items-center space-x-3">
				<button 
					class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
					on:click={() => navegarMes('anterior')}
				>
					<ChevronLeft class="w-5 h-5" />
				</button>
				
				<button 
					class="px-4 py-2 text-sm font-medium text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
					on:click={irAHoy}
				>
					{meses[fechaActual.getMonth()]} {fechaActual.getFullYear()}
				</button>
				
				<button 
					class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
					on:click={() => navegarMes('siguiente')}
				>
					<ChevronRight class="w-5 h-5" />
				</button>
			</div>
		</div>
		
		<!-- Botón de nueva tarea -->
		<button 
			class="inline-flex items-center px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
			on:click={() => dispatch('nueva-tarea')}
		>
			<Plus class="w-4 h-4 mr-1" />
			Nueva Tarea
		</button>
	</div>
	
	<!-- Vista del calendario -->
	{#if vistaActual === 'mes'}
		<div class="p-6">
			<!-- Días de la semana -->
			<div class="grid grid-cols-7 gap-1 mb-2">
				{#each diasSemana as dia}
					<div class="text-center text-sm font-medium text-gray-500 dark:text-gray-400 py-2">
						{dia}
					</div>
				{/each}
			</div>
			
			<!-- Días del mes -->
			<div class="grid grid-cols-7 gap-1">
				{#each diasCalendario as diaData}
					{@const tareasDia = obtenerTareasPorFecha(diaData.fecha)}
					<div 
						class="min-h-[100px] p-2 border border-gray-100 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer {
							!diaData.esMesActual ? 'opacity-50' : ''
						} {
							esHoy(diaData.fecha) ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' : ''
						} {
							esFinDeSemana(diaData.fecha) ? 'bg-gray-50/50 dark:bg-gray-800/50' : ''
						}"
						on:click={() => dispatch('click-dia', { fecha: diaData.fecha, tareas: tareasDia })}
					>
						<!-- Número del día -->
						<div class="flex items-center justify-between mb-1">
							<span class="text-sm font-medium {
								diaData.esMesActual ? 'text-gray-900 dark:text-white' : 'text-gray-400'
							} {
								esHoy(diaData.fecha) ? 'bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs' : ''
							}">
								{diaData.dia}
							</span>
							
							{#if tareasDia.length > 0}
								<span class="text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full">
									{tareasDia.length}
								</span>
							{/if}
						</div>
						
						<!-- Tareas del día -->
						<div class="space-y-1">
							{#each tareasDia.slice(0, 2) as tarea}
								<div 
									class="text-xs px-2 py-1 rounded-md truncate {obtenerColorPrioridad(tarea.prioridad)}"
									title={tarea.titulo}
								>
									{tarea.titulo}
								</div>
							{/each}
							
							{#if tareasDia.length > 2}
								<div class="text-xs text-gray-500 px-2">
									+{tareasDia.length - 2} más
								</div>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		</div>
	{:else if vistaActual === 'semana'}
		<!-- Vista semanal simplificada -->
		<div class="p-6">
			<div class="text-center text-gray-500 dark:text-gray-400 py-8">
				<Clock class="w-12 h-12 mx-auto mb-3 text-gray-400" />
				<p>Vista semanal próximamente</p>
				<p class="text-sm">Por ahora usa la vista mensual</p>
			</div>
		</div>
	{/if}
	
	<!-- Resumen rápido -->
	<div class="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
		<div class="flex items-center justify-between text-sm">
			<div class="flex items-center space-x-4">
				<span class="text-gray-600 dark:text-gray-400">
					<strong>{tareas.length}</strong> tareas total
				</span>
				<span class="text-orange-600 dark:text-orange-400">
					<strong>{tareas.filter(t => t.prioridad === 'urgente').length}</strong> urgentes
				</span>
			</div>
			
			<button 
				class="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium"
				on:click={() => dispatch('ver-todas-tareas')}
			>
				Ver todas las tareas →
			</button>
		</div>
	</div>
</div> 