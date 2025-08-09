<script lang="ts">
	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { derived } from 'svelte/store';
	import type { EstadoTarea, Tarea } from '$lib/tipos/app';
	import type { Cliente, Producto, CategoriaCliente } from '$lib/tipos/clientes-inventario';
	import { 
		proyectoActual, 
		tareas,
		cargarProyectoPorSlug, 
		cargarTareasProyecto,
		crearTarea,
		moverTarea,
		eliminarTarea,
		reordenarTareas,
		cargandoProyecto,
		cargandoTareas,
		actualizarProyecto
	} from '$lib/stores/proyectos';
	import { clientes, cargarClientes, crearCliente, cargandoClientes } from '$lib/stores/clientes';
	import { productos, cargarProductos, crearProducto, cargandoProductos } from '$lib/stores/inventario';
	import { movimientos, cargarMovimientos, crearMovimiento } from '$lib/stores/movimientos';
	import { formatearMoneda } from '$lib/utils/formato-moneda';
	import KanbanTablero from '$lib/componentes/proyectos/KanbanTablero.svelte';
	import FormularioTarea from '$lib/componentes/tareas/FormularioTarea.svelte';
	import FormularioProyecto from '$lib/componentes/proyectos/FormularioProyecto.svelte';
	import Modal from '$lib/componentes/ui/Modal.svelte';
	import Boton from '$lib/componentes/ui/Boton.svelte';
	import Cargando from '$lib/componentes/ui/Cargando.svelte';
	import CalendarioInteractivo from '$lib/componentes/calendario/CalendarioInteractivo.svelte';
	import TarjetaEstadistica from '$lib/componentes/ui/TarjetaEstadistica.svelte';
	import { 
		ArrowLeft, 
		Settings, 
		Plus, 
		Calendar, 
		FolderKanban, 
		BarChart3,
		Users,
		Package,
		DollarSign,
		TrendingUp,
		TrendingDown,
		FileText,
		PieChart,
		Target,
		Clock,
		CheckCircle,
		AlertTriangle,
		Upload,
		Download,
		Eye,
		Edit3,
		Trash2
	} from 'lucide-svelte';

	// Parámetros de la URL - ahora usa slug
	$: proyectoSlug = $page.params.slug;

	// Estados de la página
	let mostrarFormularioTarea = false;
	let mostrarEditarProyecto = false;
	let tareaEditando: Tarea | null = null;
	let estadoTareaNueva: EstadoTarea = 'por-hacer';
	let guardandoTarea = false;
	let moviendoTarea = false; // Nueva variable para controlar drag & drop
	let pestanaActiva: 'resumen' | 'tablero' | 'recursos' | 'equipo' | 'presupuesto' | 'progreso' | 'archivos' | 'calendario' | 'configuracion' = 'resumen';

	// Estados para nuevas funcionalidades
	let modalCliente = false;
	let modalProducto = false;
	let modalMovimiento = false;
	let formCliente = {
		nombre: '',
		email: '',
		telefono: '',
		categoria_cliente: 'regular' as CategoriaCliente
	};
	let formProducto = {
		nombre: '',
		descripcion: '',
		precio: 0,
		categoria: ''
	};
	let tipoMovimiento: 'ingreso' | 'gasto' = 'ingreso';
	let guardandoConfiguracion = false;

	// Store derivado para tareas del proyecto actual
	const tareasProyectoActual = derived(
		[tareas, proyectoActual],
		([$tareas, $proyectoActual]) => {
			if (!$proyectoActual) return [];
			return $tareas.filter((tarea: Tarea) => tarea.proyecto_id === $proyectoActual.id);
		}
	);

	// Cargar datos cuando cambia el slug
	$: if (proyectoSlug && browser) {
		console.log('🎯 Slug cambió a:', proyectoSlug);
		cargarDatosProyecto(proyectoSlug);
	}

	// Función para cargar proyecto y tareas
	const cargarDatosProyecto = async (slug: string) => {
		try {
			console.log('📡 Iniciando carga para proyecto:', slug);
			
			// Cargar proyecto primero
			await cargarProyectoPorSlug(slug);
			
			if ($proyectoActual) {
				console.log('✅ Proyecto cargado:', $proyectoActual.nombre);
				
				// Cargar datos en paralelo pero no esperar a todos
				Promise.all([
					cargarTareasProyecto($proyectoActual.id),
					cargarClientes().catch(e => console.warn('Clientes no cargados:', e)),
					cargarProductos().catch(e => console.warn('Productos no cargados:', e)),
					cargarMovimientos().catch(e => console.warn('Movimientos no cargados:', e))
				]).catch(e => console.warn('Algunos datos no se cargaron:', e));
			} else {
				console.error('❌ No se pudo cargar el proyecto');
			}
		} catch (error) {
			console.error('💥 Error cargando datos del proyecto:', error);
		}
	};

	// Funciones para modales y creación
	const abrirModalCliente = () => {
		modalCliente = true;
		formCliente = {
			nombre: '',
			email: '',
			telefono: '',
			categoria_cliente: 'regular' as CategoriaCliente
		};
	};

	const handleCrearCliente = async () => {
		try {
			const nuevoCliente = await crearCliente(formCliente);
			if (nuevoCliente) {
				modalCliente = false;
				await cargarClientes();
			}
		} catch (error) {
			console.error('Error creando cliente:', error);
		}
	};

	const abrirModalProducto = () => {
		modalProducto = true;
		formProducto = {
			nombre: '',
			descripcion: '',
			precio: 0,
			categoria: ''
		};
	};

	const handleCrearProducto = async () => {
		try {
			const nuevoProducto = await crearProducto(formProducto);
			if (nuevoProducto) {
				modalProducto = false;
				await cargarProductos();
			}
		} catch (error) {
			console.error('Error creando producto:', error);
		}
	};

	// Handler SÚPER SIMPLE para mover tareas
	const handleMoverTarea = async (event: CustomEvent<{ tarea: Tarea; nuevoEstado: EstadoTarea; nuevoOrden: number }>) => {
		const { tarea, nuevoEstado, nuevoOrden } = event.detail;
		
		console.log('��🎯🎯 HANDLER PÁGINA PROYECTO INDIVIDUAL');
		console.log(`📤 Moviendo: "${tarea.titulo}" → ${nuevoEstado}`);
		console.log('📋 Evento completo:', event.detail);
		
		// Llamar al store
		const exito = await moverTarea(tarea.id, nuevoEstado, nuevoOrden);
		
		if (exito) {
			console.log('🎉 ¡ÉXITO TOTAL! Tarea movida en proyecto individual');
			// Recargar las tareas para asegurar que se vean los cambios
			if ($proyectoActual) {
				await cargarTareasProyecto($proyectoActual.id);
			}
		} else {
			console.error('❌ Error al mover tarea en proyecto individual');
		}
	};

	// Función de debug para verificar elementos DOM
	const verificarElementos = () => {
		console.log('🔍 VERIFICANDO ELEMENTOS DOM...');
		
		const columnas = document.querySelectorAll('[data-estado]');
		console.log(`📊 Columnas encontradas: ${columnas.length}`);
		
		columnas.forEach(columna => {
			const estado = columna.getAttribute('data-estado');
			const tareas = columna.querySelectorAll('[data-id]');
			console.log(`📋 ${estado}: ${tareas.length} tareas`);
			
			tareas.forEach((tarea, index) => {
				const id = tarea.getAttribute('data-id');
				console.log(`  ${index + 1}. ID: ${id}`);
			});
		});
	};

	// Función de debug para forzar recarga
	const forzarRecarga = async () => {
		console.log('🔄 FORZANDO RECARGA...');
		if (proyectoSlug && $proyectoActual) {
			await cargarDatosProyecto(proyectoSlug);
			console.log('✅ Recarga completada');
		}
	};

	// Función para testear movimiento manual
	const testearMovimiento = () => {
		console.log('🧪 TESTEANDO MOVIMIENTO...');
		if ($tareasProyectoActual.length > 0) {
			const tarea = $tareasProyectoActual[0];
			console.log(`🎯 Testeando con: "${tarea.titulo}"`);
			
			// Simular movimiento
			const nuevoEstado = tarea.estado === 'por-hacer' ? 'en-progreso' : 'por-hacer';
			moverTarea(tarea.id, nuevoEstado as EstadoTarea, 0);
		}
	};

	// Exponer funciones para debug desde consola
	if (browser) {
		(window as any).verificarElementos = verificarElementos;
		(window as any).forzarRecarga = forzarRecarga;
		(window as any).testearMovimiento = testearMovimiento;
		(window as any).debugTareas = () => {
			console.log('📊 ESTADO ACTUAL:', {
				proyecto: $proyectoActual,
				tareas: $tareasProyectoActual.map(t => ({
					id: t.id,
					titulo: t.titulo,
					estado: t.estado
				})),
				cargando: $cargandoTareas
			});
		};
	}

	const handleEliminarTarea = async (event: CustomEvent<{ tarea: Tarea }>) => {
		const { tarea } = event.detail;
		await eliminarTarea(tarea.id);
	};

	const handleReordenarTareas = async (event: CustomEvent<{ tareas: { id: string; orden: number }[] }>) => {
		const { tareas } = event.detail;
		await reordenarTareas(tareas);
	};

	// Navegación
	const handleVolver = () => {
		goto('/panel/proyectos');
	};

	const handleEditarProyecto = () => {
		mostrarEditarProyecto = true;
	};

	const handleNuevaTarea = (estado: EstadoTarea = 'por-hacer') => {
		estadoTareaNueva = estado;
		tareaEditando = null;
		mostrarFormularioTarea = true;
	};

	const handleCancelarTarea = () => {
		mostrarFormularioTarea = false;
		tareaEditando = null;
		guardandoTarea = false;
	};

	// 🔥 NUEVA FUNCIÓN PARA EDITAR TAREA CON DOBLE CLIC
	const handleEditarTarea = (event: CustomEvent<{ tarea: Tarea }>) => {
		console.log('✏️ EDITANDO TAREA:', event.detail.tarea);
		tareaEditando = event.detail.tarea;
		estadoTareaNueva = event.detail.tarea.estado;
		mostrarFormularioTarea = true;
	};

	// Handler para crear/editar tarea
	const handleCrearTarea = async (event: CustomEvent<{ tarea: Partial<Tarea> }>) => {
		if (guardandoTarea) return;
		
		try {
			guardandoTarea = true;
			const { tarea } = event.detail;
			
			if (!$proyectoActual) {
				throw new Error('No hay proyecto seleccionado');
			}

			// Asegurar que la tarea tenga el proyecto_id
			const tareaConProyecto = {
				...tarea,
				proyecto_id: $proyectoActual.id,
				negocio_id: null // Las tareas de proyecto no tienen negocio_id
			};

			const nuevaTarea = await crearTarea(tareaConProyecto);
			
			if (nuevaTarea) {
				mostrarFormularioTarea = false;
				tareaEditando = null;
				// Recargar tareas del proyecto
				await cargarTareasProyecto($proyectoActual.id);
			}
		} catch (error) {
			console.error('Error creando tarea:', error);
		} finally {
			guardandoTarea = false;
		}
	};
</script>

<svelte:head>
	<title>{$proyectoActual?.nombre || 'Proyecto'} - App Contabilidad</title>
	<script>
		// Debug temporal
		console.log('🟢 PÁGINA CARGADA - Debug activo');
		
		// Interceptar todos los eventos personalizados
		window.addEventListener('*', function(e) {
			if (e.type.includes('tarea')) {
				console.log('📢 EVENTO DETECTADO:', e.type, e);
			}
		});
		
		// Debug para ver si los elementos están correctos
		setTimeout(() => {
			const kanbanColumns = document.querySelectorAll('[data-estado]');
			console.log('🏛️ COLUMNAS ENCONTRADAS:', kanbanColumns.length);
			kanbanColumns.forEach((col, i) => {
				const estado = col.getAttribute('data-estado');
				const tareas = col.querySelectorAll('[data-tarea-id]');
				console.log(`📋 Columna ${i+1} (${estado}):`, tareas.length, 'tareas');
			});
		}, 1000);
	</script>
</svelte:head>

{#if $cargandoProyecto}
	<div class="flex items-center justify-center min-h-96">
		<div class="text-center">
			<Cargando texto="Cargando proyecto..." />
			<p class="text-sm text-gray-500 dark:text-gray-400 mt-4">
				Si esto tarda mucho, recarga la página
			</p>
		</div>
	</div>
{:else if !$proyectoActual}
	<div class="text-center py-12 px-4">
		<div class="mb-6">
			<div class="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
				<AlertTriangle class="w-8 h-8 text-red-600 dark:text-red-400" />
			</div>
		</div>
		<h2 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4">
			Proyecto no encontrado
		</h2>
		<p class="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
			El proyecto que buscas no existe, no tienes acceso a él, o hubo un error de carga.
		</p>
		<div class="flex flex-col sm:flex-row items-center justify-center gap-4">
			<Boton on:click={handleVolver}>
				<ArrowLeft class="w-4 h-4 mr-2" />
				Volver a Proyectos
			</Boton>
			<Boton variante="ghost" on:click={() => window.location.reload()}>
				<ArrowLeft class="w-4 h-4 mr-2" />
				Recargar Página
			</Boton>
		</div>
	</div>
{:else}
	<!-- Contenedor principal responsivo OPTIMIZADO -->
	<div class="w-full max-w-full overflow-hidden space-y-3 p-2 sm:p-4">
		
		<!-- Header del proyecto ÉPICO Y MEJORADO -->
		<div class="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 rounded-xl p-4 sm:p-5 border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
			<!-- Fila superior: navegación mejorada -->
			<div class="flex items-center justify-between mb-4">
				<div class="flex items-center space-x-3">
					<!-- Botón Volver ÉPICO -->
					<button 
						on:click={handleVolver}
						class="group flex items-center space-x-2 px-3 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-white dark:hover:bg-gray-700 hover:shadow-lg transition-all duration-300 transform hover:scale-105"
					>
						<ArrowLeft class="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
						<span class="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-700 dark:group-hover:text-blue-300">
							Volver
						</span>
					</button>

					<!-- Estado del proyecto con mejor diseño -->
					<div class="flex items-center space-x-2">
						<div class="px-2 py-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg text-xs font-medium shadow-lg">
							{$proyectoActual.estado.charAt(0).toUpperCase() + $proyectoActual.estado.slice(1)}
						</div>
						<div class="px-2 py-1 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-600 rounded-lg">
							<span class="text-xs font-medium text-gray-700 dark:text-gray-300">
								{$proyectoActual.progreso}%
							</span>
						</div>
					</div>
				</div>
				
				<!-- Acciones principales -->
				<div class="flex items-center space-x-2">
					<!-- Botón Editar Proyecto - MEJORADO -->
					<button 
						on:click={handleEditarProyecto}
						class="group flex items-center space-x-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-all duration-300 transform hover:scale-105"
					>
						<Settings class="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover:rotate-90 transition-transform duration-300" />
						<span class="hidden sm:inline text-xs font-medium text-gray-700 dark:text-gray-300">Editar</span>
					</button>

					<!-- Botón Nueva Tarea - COMPACTO -->
					<button 
						on:click={() => handleNuevaTarea()}
						class="group relative flex items-center space-x-1 px-4 py-2 overflow-hidden text-xs font-bold text-white transition-all duration-300 ease-out bg-gradient-to-r from-purple-600 via-blue-600 to-purple-700 rounded-lg hover:shadow-xl transform hover:scale-105"
					>
						<Plus class="relative w-4 h-4 transition-transform duration-300 group-hover:rotate-180" />
						<span class="relative">Nueva Tarea</span>
					</button>
				</div>
			</div>

			<!-- Información del proyecto COMPACTA -->
			<div class="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg p-3 border border-white/50 dark:border-gray-700/50">
				<!-- Título compacto -->
				<h1 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
					{$proyectoActual.nombre}
				</h1>
				{#if $proyectoActual.descripcion}
					<p class="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
						{$proyectoActual.descripcion}
					</p>
				{/if}

				<!-- Métricas importantes en grid COMPACTO -->
				<div class="grid grid-cols-4 gap-2">
					<!-- Fecha de inicio -->
					<div class="text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
						<div class="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1">📅 Inicio</div>
						<div class="text-xs font-bold text-blue-700 dark:text-blue-300">
							{new Date($proyectoActual.fecha_inicio).toLocaleDateString('es-ES', { 
								day: '2-digit', 
								month: 'short'
							})}
						</div>
					</div>

					<!-- Fecha límite -->
					<div class="text-center p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-100 dark:border-orange-800">
						<div class="text-xs font-medium text-orange-600 dark:text-orange-400 mb-1">🎯 Límite</div>
						<div class="text-xs font-bold text-orange-700 dark:text-orange-300">
							{$proyectoActual.fecha_limite 
								? new Date($proyectoActual.fecha_limite).toLocaleDateString('es-ES', { 
									day: '2-digit', 
									month: 'short'
								})
								: 'Sin límite'
							}
						</div>
					</div>

					<!-- Progreso visual -->
					<div class="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
						<div class="text-xs font-medium text-green-600 dark:text-green-400 mb-1">📈 Progreso</div>
						<div class="text-xs font-bold text-green-700 dark:text-green-300">
							{$proyectoActual.progreso}%
						</div>
						<!-- Mini barra de progreso -->
						<div class="w-full bg-green-200 dark:bg-green-800 rounded-full h-1 mt-1">
							<div 
								class="bg-green-500 h-1 rounded-full transition-all duration-500"
								style="width: {$proyectoActual.progreso}%"
							></div>
						</div>
					</div>

					<!-- Total de tareas -->
					<div class="text-center p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-800">
						<div class="text-xs font-medium text-purple-600 dark:text-purple-400 mb-1">📋 Tareas</div>
						<div class="text-xs font-bold text-purple-700 dark:text-purple-300">
							{$tareasProyectoActual.length}
						</div>
						<div class="text-xs text-purple-600 dark:text-purple-400 mt-1">
							{$tareasProyectoActual.filter(t => t.estado === 'completada').length} ✓
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Navegación por pestañas COMPACTA -->
		<div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
			<nav class="flex overflow-x-auto scrollbar-hide bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-1">
				<button
					class="flex items-center space-x-2 py-2 px-3 rounded-lg font-medium text-xs transition-all duration-300 whitespace-nowrap mr-1 {pestanaActiva === 'resumen' 
						? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md transform scale-105' 
						: 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white dark:hover:bg-gray-700 hover:shadow-sm'}"
					on:click={() => pestanaActiva = 'resumen'}
				>
					<BarChart3 class="w-3 h-3" />
					<span class="font-semibold">📊 Resumen</span>
				</button>
				
				<button
					class="flex items-center space-x-2 py-2 px-3 rounded-lg font-medium text-xs transition-all duration-300 whitespace-nowrap mr-1 {pestanaActiva === 'tablero' 
						? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md transform scale-105' 
						: 'text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-white dark:hover:bg-gray-700 hover:shadow-sm'}"
					on:click={() => pestanaActiva = 'tablero'}
				>
					<FolderKanban class="w-3 h-3" />
					<span class="font-semibold">📋 Tablero</span>
					<span class="bg-white/20 px-1.5 py-0.5 rounded text-xs">
						{$tareasProyectoActual.length}
					</span>
				</button>
				
				<button
					class="flex items-center space-x-2 py-2 px-3 rounded-lg font-medium text-xs transition-all duration-300 whitespace-nowrap mr-1 {pestanaActiva === 'recursos' 
						? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md transform scale-105' 
						: 'text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-white dark:hover:bg-gray-700 hover:shadow-sm'}"
					on:click={() => pestanaActiva = 'recursos'}
				>
					<Package class="w-3 h-3" />
					<span class="font-semibold">📦 Recursos</span>
					<span class="bg-white/20 px-1.5 py-0.5 rounded text-xs">
						{$productos.length}
					</span>
				</button>
				
				<button
					class="flex items-center space-x-2 py-2 px-3 rounded-lg font-medium text-xs transition-all duration-300 whitespace-nowrap mr-1 {pestanaActiva === 'equipo' 
						? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-md transform scale-105' 
						: 'text-gray-600 dark:text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400 hover:bg-white dark:hover:bg-gray-700 hover:shadow-sm'}"
					on:click={() => pestanaActiva = 'equipo'}
				>
					<Users class="w-3 h-3" />
					<span class="font-semibold">👥 Equipo</span>
					<span class="bg-white/20 px-1.5 py-0.5 rounded text-xs">
						{$clientes.length}
					</span>
				</button>
				
				<button
					class="flex items-center space-x-2 py-2 px-3 rounded-lg font-medium text-xs transition-all duration-300 whitespace-nowrap mr-1 {pestanaActiva === 'presupuesto' 
						? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md transform scale-105' 
						: 'text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-white dark:hover:bg-gray-700 hover:shadow-sm'}"
					on:click={() => pestanaActiva = 'presupuesto'}
				>
					<DollarSign class="w-3 h-3" />
					<span class="font-semibold">💰 Presupuesto</span>
					<span class="bg-white/20 px-1.5 py-0.5 rounded text-xs">
						{$movimientos.length}
					</span>
				</button>
				
				<button
					class="flex items-center space-x-2 py-2 px-3 rounded-lg font-medium text-xs transition-all duration-300 whitespace-nowrap mr-1 {pestanaActiva === 'progreso' 
						? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-md transform scale-105' 
						: 'text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-gray-700 hover:shadow-sm'}"
					on:click={() => pestanaActiva = 'progreso'}
				>
					<Target class="w-3 h-3" />
					<span class="font-semibold">🎯 Progreso</span>
				</button>
				
				<button
					class="flex items-center space-x-2 py-2 px-3 rounded-lg font-medium text-xs transition-all duration-300 whitespace-nowrap mr-1 {pestanaActiva === 'archivos' 
						? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-md transform scale-105' 
						: 'text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-white dark:hover:bg-gray-700 hover:shadow-sm'}"
					on:click={() => pestanaActiva = 'archivos'}
				>
					<FileText class="w-3 h-3" />
					<span class="font-semibold">📁 Archivos</span>
				</button>
				
				<button
					class="flex items-center space-x-2 py-2 px-3 rounded-lg font-medium text-xs transition-all duration-300 whitespace-nowrap {pestanaActiva === 'calendario' 
						? 'bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-md transform scale-105' 
						: 'text-gray-600 dark:text-gray-400 hover:text-pink-600 dark:hover:text-pink-400 hover:bg-white dark:hover:bg-gray-700 hover:shadow-sm'}"
					on:click={() => pestanaActiva = 'calendario'}
				>
					<Calendar class="w-3 h-3" />
					<span class="font-semibold">📅 Calendario</span>
				</button>
				
				<button
					class="flex items-center space-x-2 py-2 px-3 rounded-lg font-medium text-xs transition-all duration-300 whitespace-nowrap {pestanaActiva === 'configuracion' 
						? 'bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-md transform scale-105' 
						: 'text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-white dark:hover:bg-gray-700 hover:shadow-sm'}"
					on:click={() => pestanaActiva = 'configuracion'}
				>
					<Settings class="w-3 h-3" />
					<span class="font-semibold">⚙️ Config</span>
				</button>
			</nav>
		</div>

		<!-- Contenido de las pestañas -->
		{#if pestanaActiva === 'resumen'}
			<!-- 🎯 DASHBOARD COMPACTO DE PROYECTO -->
			<div class="space-y-4">
				<!-- Header del Dashboard COMPACTO -->
				<div class="mb-4">
					<div class="flex items-center justify-between mb-4">
						<div>
							<h2 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
								🚀 Dashboard de {$proyectoActual?.nombre}
							</h2>
							<p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
								Control completo de tu proyecto
							</p>
						</div>
					</div>

					<!-- Acciones Rápidas COMPACTAS -->
					<div class="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3 mb-4">
						<!-- Nueva Tarea -->
						<button 
							class="group relative flex flex-col items-center p-3 bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg"
							on:click={() => handleNuevaTarea()}
						>
							<Plus class="w-5 h-5 mb-1" />
							<span class="text-xs font-medium">Nueva Tarea</span>
						</button>

						<!-- Nuevo Recurso -->
						<button 
							class="group relative flex flex-col items-center p-3 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg"
							on:click={() => abrirModalProducto()}
						>
							<Package class="w-5 h-5 mb-1" />
							<span class="text-xs font-medium">Nuevo Recurso</span>
						</button>

						<!-- Agregar Miembro -->
						<button 
							class="group relative flex flex-col items-center p-3 bg-gradient-to-br from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg"
							on:click={() => abrirModalCliente()}
						>
							<Users class="w-5 h-5 mb-1" />
							<span class="text-xs font-medium">Agregar Miembro</span>
						</button>

						<!-- Registrar Gasto -->
						<button 
							class="group relative flex flex-col items-center p-3 bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg"
							on:click={() => {
								modalMovimiento = true;
								tipoMovimiento = 'gasto';
							}}
						>
							<TrendingDown class="w-5 h-5 mb-1" />
							<span class="text-xs font-medium">Registrar Gasto</span>
						</button>

						<!-- Ver Tablero -->
						<button 
							class="group relative flex flex-col items-center p-3 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg"
							on:click={() => pestanaActiva = 'tablero'}
						>
							<FolderKanban class="w-5 h-5 mb-1" />
							<span class="text-xs font-medium">Ver Tablero</span>
						</button>

						<!-- Ver Calendario -->
						<button 
							class="group relative flex flex-col items-center p-3 bg-gradient-to-br from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg"
							on:click={() => pestanaActiva = 'calendario'}
						>
							<Calendar class="w-5 h-5 mb-1" />
							<span class="text-xs font-medium">Ver Calendario</span>
						</button>
					</div>
				</div>

				<!-- Métricas del Proyecto COMPACTAS -->
				<div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
					<div class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow cursor-pointer" on:click={() => pestanaActiva = 'tablero'}>
						<div class="flex items-center justify-between">
							<div>
								<p class="text-xs font-medium text-purple-600 dark:text-purple-400 mb-1">Tareas</p>
								<p class="text-xl font-bold text-purple-700 dark:text-purple-300">
									{$tareasProyectoActual.length}
								</p>
								<p class="text-xs text-purple-600 dark:text-purple-400 mt-1">
									{$tareasProyectoActual.filter(t => t.estado === 'por-hacer').length} pendientes
								</p>
							</div>
							<FolderKanban class="w-6 h-6 text-purple-500" />
						</div>
					</div>

					<div class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow cursor-pointer" on:click={() => pestanaActiva = 'recursos'}>
						<div class="flex items-center justify-between">
							<div>
								<p class="text-xs font-medium text-green-600 dark:text-green-400 mb-1">Recursos</p>
								<p class="text-xl font-bold text-green-700 dark:text-green-300">
									{$productos.length}
								</p>
								<p class="text-xs text-green-600 dark:text-green-400 mt-1">
									Materiales
								</p>
							</div>
							<Package class="w-6 h-6 text-green-500" />
						</div>
					</div>

					<div class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow cursor-pointer" on:click={() => pestanaActiva = 'equipo'}>
						<div class="flex items-center justify-between">
							<div>
								<p class="text-xs font-medium text-yellow-600 dark:text-yellow-400 mb-1">Equipo</p>
								<p class="text-xl font-bold text-yellow-700 dark:text-yellow-300">
									{$clientes.length}
								</p>
								<p class="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
									Miembros
								</p>
							</div>
							<Users class="w-6 h-6 text-yellow-500" />
						</div>
					</div>

					<div class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow cursor-pointer" on:click={() => pestanaActiva = 'presupuesto'}>
						<div class="flex items-center justify-between">
							<div>
								<p class="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1">Gastado</p>
								<p class="text-xl font-bold text-blue-700 dark:text-blue-300">
									${$movimientos.filter(m => m.tipo_movimiento === 'gasto').reduce((sum, m) => sum + m.monto, 0).toLocaleString()}
								</p>
								<p class="text-xs text-blue-600 dark:text-blue-400 mt-1">
									Del proyecto
								</p>
							</div>
							<DollarSign class="w-6 h-6 text-blue-500" />
						</div>
					</div>
				</div>

				<!-- Resumen de Progreso y Tareas Recientes COMPACTO -->
				<div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
					<!-- Progreso del Proyecto -->
					<div class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
						<h3 class="text-base font-semibold text-gray-900 dark:text-white mb-4">
							🎯 Progreso del Proyecto
						</h3>
						
						<!-- Barra de progreso épica -->
						<div class="mb-4">
							<div class="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
								<span>Completado</span>
								<span>{$proyectoActual.progreso}%</span>
							</div>
							<div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
								<div 
									class="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
									style="width: {$proyectoActual.progreso}%"
								></div>
							</div>
						</div>

						<!-- Estados de tareas -->
						<div class="grid grid-cols-2 gap-2">
							<div class="text-center p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
								<p class="text-base font-bold text-orange-600 dark:text-orange-400">
									{$tareasProyectoActual.filter(t => t.estado === 'por-hacer').length}
								</p>
								<p class="text-xs text-orange-600 dark:text-orange-400">Por Hacer</p>
							</div>
							<div class="text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
								<p class="text-base font-bold text-blue-600 dark:text-blue-400">
									{$tareasProyectoActual.filter(t => t.estado === 'en-progreso').length}
								</p>
								<p class="text-xs text-blue-600 dark:text-blue-400">En Progreso</p>
							</div>
							<div class="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
								<p class="text-base font-bold text-green-600 dark:text-green-400">
									{$tareasProyectoActual.filter(t => t.estado === 'completada').length}
								</p>
								<p class="text-xs text-green-600 dark:text-green-400">Completadas</p>
							</div>
							<div class="text-center p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
								<p class="text-base font-bold text-yellow-600 dark:text-yellow-400">
									{$tareasProyectoActual.filter(t => t.estado === 'en-revision').length}
								</p>
								<p class="text-xs text-yellow-600 dark:text-yellow-400">En Revisión</p>
							</div>
						</div>
					</div>

					<!-- Tareas Recientes -->
					<div class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
						<div class="flex items-center justify-between mb-4">
							<h3 class="text-base font-semibold text-gray-900 dark:text-white">
								📋 Tareas Recientes
							</h3>
							<button 
								class="text-xs text-blue-600 dark:text-blue-400 hover:underline"
								on:click={() => pestanaActiva = 'tablero'}
							>
								Ver todas
							</button>
						</div>
						
						<div class="space-y-2">
							{#each $tareasProyectoActual.slice(0, 5) as tarea}
								<div class="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
									<div class="flex items-center space-x-2">
										<div class="w-2 h-2 rounded-full {
											tarea.estado === 'completada' ? 'bg-green-500' :
											tarea.estado === 'en-progreso' ? 'bg-blue-500' :
											tarea.estado === 'en-revision' ? 'bg-yellow-500' : 'bg-gray-400'
										}"></div>
										<span class="text-xs font-medium text-gray-900 dark:text-white">
											{tarea.titulo}
										</span>
									</div>
									<span class="text-xs px-1.5 py-0.5 rounded {
										tarea.prioridad === 'urgente' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
										tarea.prioridad === 'alta' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' :
										tarea.prioridad === 'media' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
										'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
									}">
										{tarea.prioridad}
									</span>
								</div>
							{:else}
								<div class="text-center py-6">
									<FolderKanban class="w-10 h-10 text-gray-400 mx-auto mb-2" />
									<p class="text-sm text-gray-500 dark:text-gray-400">No hay tareas aún</p>
									<button 
										class="mt-2 px-3 py-1.5 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-xs"
										on:click={() => handleNuevaTarea()}
									>
										Crear Primera Tarea
									</button>
								</div>
							{/each}
						</div>
					</div>
				</div>
			</div>

		{:else if pestanaActiva === 'tablero'}
			<!-- Tablero Kanban responsivo -->
			<div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
					<!-- Header del tablero -->
					<div class="p-3 sm:p-4 lg:p-6 border-b border-gray-200/50 dark:border-gray-700/50">
						<div class="flex items-center justify-between">
							<h2 class="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 dark:text-white">
								Tareas del Proyecto
							</h2>
							<div class="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
								{$tareasProyectoActual.length} tareas
							</div>
						</div>
					</div>

					<!-- Contenido del tablero -->
					<div class="min-h-0 flex-1">
						{#if $cargandoTareas}
							<div class="flex items-center justify-center py-12">
								<Cargando texto="Cargando tareas..." />
							</div>
						{:else}
							<KanbanTablero
								tareas={$tareasProyectoActual}
								proyecto={$proyectoActual}
								cargandoTareas={$cargandoTareas}
								on:tarea-movida={handleMoverTarea}
								on:eliminar-tarea={handleEliminarTarea}
								on:tareas-reordenadas={handleReordenarTareas}
								on:crear-tarea={(e) => handleNuevaTarea(e.detail.estado)}
								on:editar-tarea={handleEditarTarea}
							/>
						{/if}
					</div>
				</div>
		
		{:else if pestanaActiva === 'calendario'}
			<!-- Calendario del Proyecto -->
			<div class="space-y-6">
				<CalendarioInteractivo 
					tareas={$tareasProyectoActual}
					campañas={[]}
					tipoContexto="proyecto"
					contextoId={$proyectoActual.id}
					contextoNombre={$proyectoActual.nombre}
					on:diaSeleccionado={(event) => {
						console.log('Día seleccionado:', event.detail);
					}}
					on:crearElemento={(event) => {
						const datos = event.detail;
						console.log('Crear elemento desde calendario:', datos);
						
						if (datos.tipo === 'tarea') {
							// Crear tarea en el proyecto con fecha específica
							console.log('Creando tarea para proyecto con fecha:', datos.fecha);
							estadoTareaNueva = 'por-hacer';
							mostrarFormularioTarea = true;
						}
					}}
				/>
			</div>
		
		{:else if pestanaActiva === 'configuracion'}
			<!-- Configuración del Proyecto -->
			<div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
				<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
					⚙️ Configuración del Proyecto
				</h3>
				<p class="text-gray-600 dark:text-gray-400 mb-6">
					Ajusta las opciones y configuraciones de tu proyecto.
				</p>
				
				<div class="space-y-4">
					<Boton
						variant="primary"
						on:click={handleEditarProyecto}
						icon={Settings}
					>
						Editar Proyecto
					</Boton>
				</div>
			</div>
		{/if}
	</div>
{/if}

<!-- Modal para editar proyecto -->
<Modal bind:abierto={mostrarEditarProyecto} titulo="Editar Proyecto" tamaño="lg">
	{#if $proyectoActual}
		<FormularioProyecto
			proyecto={$proyectoActual}
			on:proyecto-guardado={() => {
				mostrarEditarProyecto = false;
				// Recargar datos del proyecto
				if (proyectoSlug) {
					cargarDatosProyecto(proyectoSlug);
				}
			}}
			on:cancelar={() => mostrarEditarProyecto = false}
		/>
	{/if}
</Modal>

<!-- Modal para nueva/editar tarea -->
<Modal bind:abierto={mostrarFormularioTarea} titulo={tareaEditando ? 'Editar Tarea' : 'Nueva Tarea'} tamaño="lg">
	<FormularioTarea
		tarea={tareaEditando}
		proyecto={$proyectoActual}
		estadoInicial={estadoTareaNueva}
		guardando={guardandoTarea}
		on:tarea-guardada={handleCrearTarea}
		on:cancelar={handleCancelarTarea}
	/>
</Modal> 