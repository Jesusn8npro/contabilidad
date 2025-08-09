<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import { derived } from 'svelte/store';
	import type { Negocio, MovimientoFinanciero, TipoNegocio, EstadoTarea, PrioridadTarea } from '$lib/tipos/app';
	import { TIPOS_NEGOCIO } from '$lib/tipos/app';
	import { 
		Building2, 
		DollarSign, 
		TrendingUp, 
		TrendingDown, 
		Plus, 
		Edit,
		ArrowLeft,
		Calendar,
		CreditCard,
		FileText,
		Target,
		Users,
		Settings,
		User,
		Save,
		Package,
		UserCheck,
		BarChart3,
		Globe,
		Mail,
		MessageCircle,
		Phone
	} from 'lucide-svelte';
	import { cargarNegocioPorSlug, negocioActual, cargandoNegocio, actualizarNegocio } from '$lib/stores/negocios';
	import { 
		cargarMovimientos, 
		movimientos, 
		cargandoMovimientos, 
		crearMovimiento,
		cargarCategorias,
		categorias 
	} from '$lib/stores/movimientos';
	import {
		productos,
		cargarProductos,
		cargandoProductos
	} from '$lib/stores/inventario';
	import {
		clientes,
		cargarClientes,
		cargandoClientes
	} from '$lib/stores/clientes';
	import {
		tareas,
		cargarTareasNegocio,
		cargandoTareas,
		crearTarea,
		actualizarTarea,
		eliminarTarea
	} from '$lib/stores/proyectos';
	// MARKETING IMPORTS AGREGADOS
	import {
		campañas,
		cargarCampañas,
		cargandoCampañas,
		crearCampaña,
		eliminarCampaña
	} from '$lib/stores/marketing';
	import Boton from '$lib/componentes/ui/Boton.svelte';
	import Cargando from '$lib/componentes/ui/Cargando.svelte';
	import FormularioMovimiento from '$lib/componentes/movimientos/FormularioMovimiento.svelte';
	import Modal from '$lib/componentes/ui/Modal.svelte';
	import TarjetaMovimiento from '$lib/componentes/movimientos/TarjetaMovimiento.svelte';
	import KanbanTableroNegocios from '$lib/componentes/tareas/KanbanTableroNegocios.svelte';
	import BotonWhatsApp from '$lib/componentes/ui/BotonWhatsApp.svelte';

	// Params
	let negocioSlug: string = '';
	$: negocioSlug = $page.params.slug || '';

	// Estado local
	let modalMovimiento = false;
	let tipoMovimiento: 'ingreso' | 'gasto' = 'ingreso';
	let pestanaActiva: 'resumen' | 'productos' | 'clientes' | 'movimientos' | 'tareas' | 'marketing' | 'configuracion' = 'resumen';
	let guardandoConfiguracion = false;
	let formularioInicializado = false; // 🔧 NUEVA VARIABLE PARA CONTROLAR INICIALIZACIÓN

	// ESTADO PARA TAREAS - AGREGADO
	let modalTarea = false;
	let tareaEditando: any = null;
	let formTarea = {
		titulo: '',
		descripcion: '',
		estado: 'por-hacer' as EstadoTarea,
		prioridad: 'media' as PrioridadTarea
	};

	// Formulario de configuración - Variables reactivas
	let formularioConfig = {
		nombre: '',
		tipo_negocio: 'servicio' as TipoNegocio,
		descripcion: '',
		moneda: 'USD',
		website: '',
		telefono: '',
		whatsapp: '', // NUEVO CAMPO AGREGADO
		email: '',
		logo_url: '',
		direccion: '',
		numero_documento: '',
		regimen_fiscal: '',
		meta_ingresos_mensual: 0,
		meta_gastos_mensual: 0
	};

	// Sincronizar formulario con datos del negocio actual SOLO UNA VEZ
	$: if ($negocioActual && !formularioInicializado) {
		formularioConfig = {
			nombre: $negocioActual.nombre || '',
			tipo_negocio: $negocioActual.tipo_negocio || 'servicio',
			descripcion: $negocioActual.descripcion || '',
			moneda: $negocioActual.moneda || 'USD',
			website: $negocioActual.website || '',
			telefono: $negocioActual.telefono || '',
			whatsapp: $negocioActual.whatsapp || '', // NUEVO CAMPO AGREGADO
			email: $negocioActual.email || '',
			logo_url: $negocioActual.logo_url || '',
			direccion: $negocioActual.direccion || '',
			numero_documento: $negocioActual.numero_documento || '',
			regimen_fiscal: $negocioActual.regimen_fiscal || '',
			meta_ingresos_mensual: $negocioActual.meta_ingresos_mensual || 0,
			meta_gastos_mensual: $negocioActual.meta_gastos_mensual || 0
		};
		formularioInicializado = true; // 🔥 MARCAR COMO INICIALIZADO
	}

	// Datos filtrados del negocio actual
	$: movimientosNegocio = $movimientos.filter(m => 
		$negocioActual && m.negocio_id === $negocioActual.id
	);
	
	$: productosNegocio = $productos.filter(p => 
		$negocioActual && p.negocio_id === $negocioActual.id
	);
	
	$: clientesNegocio = $clientes.filter(c => 
		$negocioActual && c.negocio_id === $negocioActual.id
	);
	
	$: tareasNegocio = $tareas.filter(t => 
		$negocioActual && t.negocio_id === $negocioActual.id
	);

	// Campañas filtradas por negocio
	$: campañasNegocio = $campañas.filter(c => 
		$negocioActual && c.negocio_id === $negocioActual.id
	);

	// Estadísticas del negocio
	$: estadisticasNegocio = {
		totalIngresos: movimientosNegocio
			.filter(m => m.tipo_movimiento === 'ingreso')
			.reduce((sum, m) => sum + m.monto, 0),
		totalGastos: movimientosNegocio
			.filter(m => m.tipo_movimiento === 'gasto')
			.reduce((sum, m) => sum + m.monto, 0),
		totalMovimientos: movimientosNegocio.length,
		totalProductos: productosNegocio.length,
		totalClientes: clientesNegocio.length,
		totalCampañas: campañasNegocio.length,
		valorInventario: productosNegocio.reduce((sum, p) => sum + (p.precio_venta * p.stock_actual), 0),
		balance: 0
	};
	$: estadisticasNegocio.balance = estadisticasNegocio.totalIngresos - estadisticasNegocio.totalGastos;

	// Función para cargar datos
	const cargarDatosNegocio = async (slug: string) => {
		if (!browser) return;
		
		try {
			console.log('🔍 Cargando negocio con slug:', slug);
			
			// Cargar negocio por slug
			await cargarNegocioPorSlug(slug);
			
			// Cargar categorías (necesarias para el formulario)
			await cargarCategorias();
			
			if ($negocioActual) {
				// Cargar todos los datos del negocio
				await Promise.all([
					cargarMovimientos($negocioActual.id),
					cargarProductos($negocioActual.id),
					cargarClientes($negocioActual.id),
					cargarTareasNegocio($negocioActual.id),
					cargarCampañas($negocioActual.id) // AGREGAR CARGA DE CAMPAÑAS
				]);
			}
		} catch (error) {
			console.error('Error cargando datos del negocio:', error);
		}
	};

	// Cargar datos al montar o cambiar slug
	$: if (negocioSlug && browser) {
		cargarDatosNegocio(negocioSlug);
	}

	// Handlers
	const handleVolver = () => {
		goto('/panel/negocios');
	};

	const handleNuevoMovimiento = (tipo: 'ingreso' | 'gasto') => {
		tipoMovimiento = tipo;
		modalMovimiento = true;
	};

	const handleMovimientoCreado = async (event: CustomEvent<{ movimiento: Partial<MovimientoFinanciero> }>) => {
		try {
			console.log('🚀 Evento recibido:', event.detail);
			console.log('📝 Datos del movimiento:', event.detail.movimiento);
			
			if (!$negocioActual) {
				console.error('❌ No hay negocio actual');
				alert('Error: No hay negocio seleccionado');
				return;
			}

			// Validar datos básicos antes de enviar
			const movimientoData = event.detail.movimiento;
			
			if (!movimientoData.descripcion || movimientoData.descripcion.trim() === '') {
				console.error('❌ Descripción vacía');
				alert('Error: La descripción es requerida');
				return;
			}
			
			if (!movimientoData.monto || movimientoData.monto <= 0) {
				console.error('❌ Monto inválido:', movimientoData.monto);
				alert('Error: El monto debe ser mayor a 0');
				return;
			}

			// Preparar datos del movimiento
			const datosMovimiento = {
				negocio_id: $negocioActual.id,
				tipo_movimiento: movimientoData.tipo_movimiento || tipoMovimiento,
				monto: Number(movimientoData.monto),
				descripcion: movimientoData.descripcion.trim(),
				fecha_movimiento: movimientoData.fecha_movimiento || new Date().toISOString().split('T')[0],
				categoria_id: movimientoData.categoria_id || undefined,
				metodo_pago: movimientoData.metodo_pago || 'efectivo',
				notas: movimientoData.notas || undefined
			};

			console.log('📋 Datos finales a enviar:', datosMovimiento);
			
			// Crear el movimiento
			const movimientoCreado = await crearMovimiento(datosMovimiento);
			
			if (movimientoCreado) {
				console.log('✅ Movimiento creado exitosamente:', movimientoCreado);
				modalMovimiento = false;
				
				// Recargar movimientos para actualizar la UI
				await cargarMovimientos($negocioActual.id);
				
				// Mostrar mensaje de éxito
				alert('¡Movimiento creado exitosamente!');
			} else {
				console.error('❌ Error: crearMovimiento retornó null');
				alert('Error al crear el movimiento. Revisa la consola para más detalles.');
			}
		} catch (error) {
			console.error('💥 Error en handleMovimientoCreado:', error);
			alert(`Error inesperado: ${error instanceof Error ? error.message : String(error)}`);
		}
	};

	// Guardar configuración del negocio
	const handleGuardarConfiguracion = async () => {
		if (!$negocioActual) return;

		try {
			guardandoConfiguracion = true;
			console.log('💾 Guardando configuración:', formularioConfig);

			// Verificar si cambió el nombre para regenerar slug
			const nombreCambio = formularioConfig.nombre !== $negocioActual.nombre;

			// Preparar datos para actualizar
			const datosActualizacion = {
				...formularioConfig,
				fecha_actualizacion: new Date().toISOString()
			};

			// Actualizar en la base de datos
			const negocioActualizado = await actualizarNegocio($negocioActual.id, datosActualizacion);
			
			if (negocioActualizado) {
				console.log('✅ Configuración guardada exitosamente');
				
				// 🔥 SI CAMBIÓ EL NOMBRE, REDIRIGIR A LA NUEVA URL
				if (nombreCambio && negocioActualizado.slug && negocioActualizado.slug !== negocioSlug) {
					console.log('🔄 Nombre cambió, redirigiendo a nueva URL:', `/panel/negocios/${negocioActualizado.slug}`);
					await goto(`/panel/negocios/${negocioActualizado.slug}`, { replaceState: true });
				}
			}

		} catch (error) {
			console.error('❌ Error al guardar configuración:', error);
		} finally {
			guardandoConfiguracion = false;
		}
	};

	// Resetear formulario
	const handleCancelarConfiguracion = () => {
		if ($negocioActual) {
			formularioConfig = {
				nombre: $negocioActual.nombre || '',
				tipo_negocio: $negocioActual.tipo_negocio || 'servicio',
				descripcion: $negocioActual.descripcion || '',
				moneda: $negocioActual.moneda || 'USD',
				website: $negocioActual.website || '',
				telefono: $negocioActual.telefono || '',
				whatsapp: $negocioActual.whatsapp || '', // NUEVO CAMPO AGREGADO
				email: $negocioActual.email || '',
				logo_url: $negocioActual.logo_url || '',
				direccion: $negocioActual.direccion || '',
				numero_documento: $negocioActual.numero_documento || '',
				regimen_fiscal: $negocioActual.regimen_fiscal || '',
				meta_ingresos_mensual: $negocioActual.meta_ingresos_mensual || 0,
				meta_gastos_mensual: $negocioActual.meta_gastos_mensual || 0
			};
			// NO es necesario resetear formularioInicializado aquí ya que queremos mantener los valores originales
		}
	};

	const formatearMoneda = (monto: number, moneda: string = 'USD') => {
		const simbolos: Record<string, string> = { USD: '$', EUR: '€', COP: '$', MXN: '$' };
		return `${simbolos[moneda] || '$'}${monto.toLocaleString()}`;
	};

	const getIconoTipo = (tipo: string) => {
		const iconos: Record<string, string> = {
			'e-commerce': '🛒',
			'servicios': '⚙️',
			'consultoria': '💼',
			'productos': '📦',
			'freelance': '💻',
			'otro': '🏢'
		};
		return iconos[tipo] || '🏢';
	};

	// HANDLERS PARA TAREAS - AGREGADOS
	const abrirModalTarea = (estado = 'por-hacer') => {
		tareaEditando = null;
		formTarea = {
			titulo: '',
			descripcion: '',
			estado: estado as any,
			prioridad: 'media' as any
		};
		modalTarea = true;
	};

	const editarTarea = (tarea: any) => {
		tareaEditando = tarea;
		formTarea = {
			titulo: tarea.titulo || '',
			descripcion: tarea.descripcion || '',
			estado: tarea.estado || 'por-hacer' as any,
			prioridad: tarea.prioridad || 'media' as any
		};
		modalTarea = true;
	};

	const handleGuardarTarea = async (event?: any) => {
		if (!$negocioActual) return;

		// Validación básica
		if (!formTarea.titulo.trim()) {
			alert('El título es obligatorio');
			return;
		}

		try {
			const datosTarea = {
				titulo: formTarea.titulo.trim(),
				descripcion: formTarea.descripcion.trim() || undefined,
				estado: formTarea.estado as any,
				prioridad: formTarea.prioridad as any,
				negocio_id: $negocioActual.id
			};

			if (tareaEditando) {
				// Actualizar tarea existente
				await actualizarTarea(tareaEditando.id, datosTarea);
			} else {
				// Crear nueva tarea
				await crearTarea(datosTarea);
			}

			// Recargar tareas
			if ($negocioActual) {
				await cargarTareasNegocio($negocioActual.id);
			}
			
			// Cerrar modal
			modalTarea = false;
			tareaEditando = null;

		} catch (error) {
			console.error('Error al guardar tarea:', error);
			alert('Error al guardar la tarea');
		}
	};

	const handleEliminarTarea = async (tarea: any) => {
		if (!confirm(`¿Estás seguro de eliminar la tarea "${tarea.titulo}"?`)) return;

		try {
			await eliminarTarea(tarea.id);
			if ($negocioActual) {
				await cargarTareasNegocio($negocioActual.id);
			}
		} catch (error) {
			console.error('Error al eliminar tarea:', error);
			alert('Error al eliminar la tarea');
		}
	};

	const handleMoverTarea = async (tarea: any, nuevoEstado: any) => {
		try {
			await actualizarTarea(tarea.id, { estado: nuevoEstado });
			if ($negocioActual) {
				await cargarTareasNegocio($negocioActual.id);
			}
		} catch (error) {
			console.error('Error al mover tarea:', error);
			alert('Error al mover la tarea');
		}
	};
</script>

<svelte:head>
	<title>{$negocioActual?.nombre || 'Cargando...'} - Negocios</title>
</svelte:head>

{#if $cargandoNegocio}
	<div class="flex items-center justify-center min-h-96">
		<Cargando />
	</div>
{:else if !$negocioActual}
	<div class="text-center py-12">
		<Building2 class="w-16 h-16 mx-auto text-gray-400 mb-4" />
		<h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
			Negocio no encontrado
		</h2>
		<p class="text-gray-600 dark:text-gray-400 mb-6">
			El negocio que buscas no existe o no tienes permisos para verlo.
		</p>
		<Boton on:click={handleVolver}>
			<ArrowLeft class="w-4 h-4 mr-2" />
			Volver a Negocios
		</Boton>
	</div>
{:else}
	<!-- Contenedor principal con altura controlada -->
	<div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col overflow-hidden">
		<!-- Header del negocio -->
		<div class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
			<div class="px-4 sm:px-6 py-4">
				<!-- Layout responsivo: columna en móvil, fila en desktop -->
				<div class="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
					<!-- Sección izquierda: Botón volver + Info del negocio -->
					<div class="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
						<button
							on:click={handleVolver}
							class="flex-shrink-0 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
						>
							<ArrowLeft class="w-5 h-5" />
						</button>
						
						<div class="flex items-center space-x-3 min-w-0 flex-1">
							<div class="text-2xl sm:text-3xl flex-shrink-0">{getIconoTipo($negocioActual.tipo_negocio)}</div>
							<div class="min-w-0 flex-1">
								<h1 class="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white truncate">
									{$negocioActual.nombre}
								</h1>
								<p class="text-sm text-gray-600 dark:text-gray-400 capitalize truncate">
									{TIPOS_NEGOCIO[$negocioActual.tipo_negocio]} • {$negocioActual.moneda}
								</p>
								<!-- Información de contacto -->
								{#if $negocioActual.whatsapp || $negocioActual.telefono || $negocioActual.email}
									<div class="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
										{#if $negocioActual.whatsapp}
											<div class="flex items-center gap-1">
												<MessageCircle class="w-3 h-3 text-green-500" />
												<span>{$negocioActual.whatsapp}</span>
											</div>
										{/if}
										{#if $negocioActual.telefono && $negocioActual.telefono !== $negocioActual.whatsapp}
											<div class="flex items-center gap-1">
												<Phone class="w-3 h-3" />
												<span>{$negocioActual.telefono}</span>
											</div>
										{/if}
										{#if $negocioActual.email}
											<div class="flex items-center gap-1">
												<Mail class="w-3 h-3" />
												<span class="truncate max-w-40">{$negocioActual.email}</span>
											</div>
										{/if}
									</div>
								{/if}
							</div>
						</div>
					</div>

					<!-- Sección derecha: Botones de acción -->
					<div class="flex flex-col sm:flex-row gap-2 sm:gap-3 lg:gap-4 flex-shrink-0">
						<!-- Botón WhatsApp - Solo si tiene WhatsApp configurado -->
						{#if $negocioActual.whatsapp}
							<BotonWhatsApp
								numero={$negocioActual.whatsapp}
								mensaje="Hola! Me interesa información sobre {$negocioActual.nombre}"
								texto="💬 WhatsApp"
								tamaño="sm"
								variante="outline"
							/>
						{/if}

						<!-- Botón Nuevo Gasto - Responsivo -->
						<button
							on:click={() => handleNuevoMovimiento('gasto')}
							class="group relative flex items-center justify-center px-4 sm:px-6 py-2.5 sm:py-3 overflow-hidden text-sm font-medium text-white transition-all duration-300 ease-out bg-gradient-to-r from-red-500 to-red-600 rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl hover:shadow-red-500/25 focus:outline-none focus:ring-4 focus:ring-red-500/50 transform hover:-translate-y-0.5 active:translate-y-0 w-full sm:w-auto"
						>
							<span class="absolute inset-0 w-full h-full bg-gradient-to-r from-red-600 to-red-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
							<TrendingDown class="relative w-4 h-4 sm:w-5 sm:h-5 mr-2 transition-transform duration-300 group-hover:scale-110" />
							<span class="relative font-semibold whitespace-nowrap">Nuevo Gasto</span>
							<div class="absolute inset-0 rounded-lg sm:rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-all duration-300"></div>
						</button>

						<!-- Botón Nuevo Ingreso - Responsivo -->
						<button
							on:click={() => handleNuevoMovimiento('ingreso')}
							class="group relative flex items-center justify-center px-4 sm:px-6 py-2.5 sm:py-3 overflow-hidden text-sm font-medium text-white transition-all duration-300 ease-out bg-gradient-to-r from-green-500 to-green-600 rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl hover:shadow-green-500/25 focus:outline-none focus:ring-4 focus:ring-green-500/50 transform hover:-translate-y-0.5 active:translate-y-0 w-full sm:w-auto"
						>
							<span class="absolute inset-0 w-full h-full bg-gradient-to-r from-green-600 to-green-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
							<TrendingUp class="relative w-4 h-4 sm:w-5 sm:h-5 mr-2 transition-transform duration-300 group-hover:scale-110" />
							<span class="relative font-semibold whitespace-nowrap">Nuevo Ingreso</span>
							<div class="absolute inset-0 rounded-lg sm:rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-all duration-300"></div>
						</button>
					</div>
				</div>
			</div>

			<!-- Navegación de pestañas -->
			<div class="border-t border-gray-200 dark:border-gray-700 overflow-x-auto">
				<nav class="flex space-x-4 sm:space-x-8 px-4 sm:px-6 min-w-max">
					<button
						class="py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap {pestanaActiva === 'resumen' 
							? 'border-blue-500 text-blue-600 dark:text-blue-400' 
							: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'}"
						on:click={() => pestanaActiva = 'resumen'}
					>
						<Target class="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 sm:mr-2" />
						Resumen
					</button>
					<button
						class="py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap {pestanaActiva === 'productos' 
							? 'border-blue-500 text-blue-600 dark:text-blue-400' 
							: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'}"
						on:click={() => pestanaActiva = 'productos'}
					>
						<Package class="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 sm:mr-2" />
						<span class="hidden sm:inline">Productos</span>
						<span class="sm:hidden">Prod.</span>
						({productosNegocio.length})
					</button>
					<button
						class="py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap {pestanaActiva === 'clientes' 
							? 'border-blue-500 text-blue-600 dark:text-blue-400' 
							: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'}"
						on:click={() => pestanaActiva = 'clientes'}
					>
						<UserCheck class="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 sm:mr-2" />
						<span class="hidden sm:inline">Clientes</span>
						<span class="sm:hidden">Cli.</span>
						({clientesNegocio.length})
					</button>
					<button
						class="py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap {pestanaActiva === 'movimientos' 
							? 'border-green-500 text-green-600 dark:text-green-400' 
							: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'}"
						on:click={() => pestanaActiva = 'movimientos'}
					>
						<DollarSign class="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 sm:mr-2" />
						<span class="hidden sm:inline">💰 Ventas e Ingresos</span>
						<span class="sm:hidden">💰 Ventas</span>
						({movimientosNegocio.length})
					</button>
					<button
						class="py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap {pestanaActiva === 'tareas' 
							? 'border-purple-500 text-purple-600 dark:text-purple-400' 
							: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'}"
						on:click={() => pestanaActiva = 'tareas'}
					>
						<Calendar class="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 sm:mr-2" />
						<span class="hidden sm:inline">📋 Tareas</span>
						<span class="sm:hidden">📋 Tareas</span>
						({tareasNegocio.length})
					</button>
					<button
						class="py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap {pestanaActiva === 'marketing' 
							? 'border-yellow-500 text-yellow-600 dark:text-yellow-400' 
							: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'}"
						on:click={() => pestanaActiva = 'marketing'}
					>
						<BarChart3 class="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 sm:mr-2" />
						<span class="hidden sm:inline">📊 Marketing</span>
						<span class="sm:hidden">📊 Mkt</span>
						({$cargandoCampañas ? '...' : campañasNegocio.length})
					</button>
					<button
						class="py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap {pestanaActiva === 'configuracion' 
							? 'border-blue-500 text-blue-600 dark:text-blue-400' 
							: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'}"
						on:click={() => pestanaActiva = 'configuracion'}
					>
						<Settings class="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 sm:mr-2" />
						<span class="hidden sm:inline">Configuración</span>
						<span class="sm:hidden">Config</span>
					</button>
				</nav>
			</div>
		</div>

		<!-- Contenido principal -->
		<div class="flex-1 overflow-auto">
			<div class="p-4 sm:p-6 max-w-full overflow-hidden">
				{#if pestanaActiva === 'resumen'}
					<!-- Métricas principales -->
					<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 sm:gap-6 mb-6 sm:mb-8">
						<div class="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
							<div class="flex items-center">
								<div class="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg flex-shrink-0">
									<TrendingUp class="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
								</div>
								<div class="ml-3 sm:ml-4 min-w-0 flex-1">
									<p class="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">Ingresos Totales</p>
									<p class="text-lg sm:text-2xl font-bold text-green-600 dark:text-green-400 truncate">
										{formatearMoneda(estadisticasNegocio.totalIngresos, $negocioActual.moneda)}
									</p>
								</div>
							</div>
						</div>

						<div class="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
							<div class="flex items-center">
								<div class="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg flex-shrink-0">
									<TrendingDown class="w-5 h-5 sm:w-6 sm:h-6 text-red-600 dark:text-red-400" />
								</div>
								<div class="ml-3 sm:ml-4 min-w-0 flex-1">
									<p class="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">Gastos Totales</p>
									<p class="text-lg sm:text-2xl font-bold text-red-600 dark:text-red-400 truncate">
										{formatearMoneda(estadisticasNegocio.totalGastos, $negocioActual.moneda)}
									</p>
								</div>
							</div>
						</div>

						<div class="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
							<div class="flex items-center">
								<div class="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex-shrink-0">
									<DollarSign class="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
								</div>
								<div class="ml-3 sm:ml-4 min-w-0 flex-1">
									<p class="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">Balance</p>
									<p class="text-lg sm:text-2xl font-bold {estadisticasNegocio.balance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'} truncate">
										{formatearMoneda(estadisticasNegocio.balance, $negocioActual.moneda)}
									</p>
								</div>
							</div>
						</div>

						<div class="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
							<div class="flex items-center">
								<div class="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex-shrink-0">
									<FileText class="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" />
								</div>
								<div class="ml-3 sm:ml-4 min-w-0 flex-1">
									<p class="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">Movimientos</p>
									<p class="text-lg sm:text-2xl font-bold text-purple-600 dark:text-purple-400">
										{estadisticasNegocio.totalMovimientos}
									</p>
								</div>
							</div>
						</div>

						<div class="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
							<div class="flex items-center">
								<div class="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex-shrink-0">
									<Package class="w-5 h-5 sm:w-6 sm:h-6 text-orange-600 dark:text-orange-400" />
								</div>
								<div class="ml-3 sm:ml-4 min-w-0 flex-1">
									<p class="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">Productos</p>
									<p class="text-lg sm:text-2xl font-bold text-orange-600 dark:text-orange-400">
										{estadisticasNegocio.totalProductos}
									</p>
								</div>
							</div>
						</div>

						<div class="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
							<div class="flex items-center">
								<div class="p-2 bg-pink-100 dark:bg-pink-900/20 rounded-lg flex-shrink-0">
									<UserCheck class="w-5 h-5 sm:w-6 sm:h-6 text-pink-600 dark:text-pink-400" />
								</div>
								<div class="ml-3 sm:ml-4 min-w-0 flex-1">
									<p class="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">Clientes</p>
									<p class="text-lg sm:text-2xl font-bold text-pink-600 dark:text-pink-400">
										{estadisticasNegocio.totalClientes}
									</p>
								</div>
							</div>
						</div>
					</div>

					<!-- Información del negocio -->
					<div class="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
						<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
							Información del Negocio
						</h3>
						<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div>
								<p class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Descripción</p>
								<p class="text-gray-900 dark:text-white">
									{$negocioActual.descripcion || 'Sin descripción'}
								</p>
							</div>
							<div>
								<p class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Fecha de Creación</p>
								<p class="text-gray-900 dark:text-white">
									{new Date($negocioActual.fecha_creacion).toLocaleDateString()}
								</p>
							</div>
						</div>
					</div>

				{:else if pestanaActiva === 'productos'}
					<!-- Sección de Productos -->
					<div class="space-y-6">
						<!-- Header con botón de acción -->
						<div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
							<div>
								<h3 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
									Productos de {$negocioActual.nombre}
								</h3>
								<p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
									Gestiona el inventario de productos de este negocio
								</p>
							</div>
							<Boton
								variant="gradient"
								size="md"
								icon={Plus}
								on:click={() => goto('/panel/inventario')}
							>
								Agregar Producto
							</Boton>
						</div>

						{#if $cargandoProductos}
							<div class="flex items-center justify-center py-12">
								<Cargando />
							</div>
						{:else if productosNegocio.length === 0}
							<div class="text-center py-12 px-4">
								<Package class="w-16 h-16 mx-auto text-gray-400 mb-4" />
								<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
									No hay productos
								</h3>
								<p class="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
									Comienza agregando productos para gestionar el inventario de este negocio.
								</p>
								<Boton
									variant="primary"
									size="lg"
									icon={Plus}
									on:click={() => goto('/panel/inventario')}
								>
									Crear Primer Producto
								</Boton>
							</div>
						{:else}
							<!-- Lista de productos -->
							<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
								{#each productosNegocio as producto (producto.id)}
									<div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
										<div class="flex items-center justify-between mb-4">
											<div class="flex items-center space-x-3">
												<div class="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
													<Package class="w-5 h-5 text-blue-600 dark:text-blue-400" />
												</div>
												<div>
													<h4 class="font-semibold text-gray-900 dark:text-white">
														{producto.nombre}
													</h4>
													<p class="text-sm text-gray-500 dark:text-gray-400">
														{producto.codigo}
													</p>
												</div>
											</div>
											<span class="px-2 py-1 text-xs font-medium rounded-full {
												producto.estado === 'activo' 
													? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
													: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
											}">
												{producto.estado}
											</span>
										</div>
										
										<div class="space-y-3">
											<div class="flex justify-between text-sm">
												<span class="text-gray-600 dark:text-gray-400">Precio:</span>
												<span class="font-medium text-gray-900 dark:text-white">
													{formatearMoneda(producto.precio_venta, $negocioActual.moneda)}
												</span>
											</div>
											
											<div class="flex justify-between text-sm">
												<span class="text-gray-600 dark:text-gray-400">Stock:</span>
												<span class="font-medium {producto.stock_actual <= producto.stock_minimo ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}">
													{producto.stock_actual} {producto.unidad_medida}
													{#if producto.stock_actual <= producto.stock_minimo}
														<span class="text-xs text-red-500 ml-1">(Bajo)</span>
													{/if}
												</span>
											</div>
											
											{#if producto.descripcion}
												<p class="text-sm text-gray-600 dark:text-gray-400 truncate">
													{producto.descripcion}
												</p>
											{/if}
										</div>
									</div>
								{/each}
							</div>
							
							<div class="text-center pt-6">
								<Boton
									variant="outline"
									on:click={() => goto('/panel/inventario')}
								>
									Ver Todos los Productos
								</Boton>
							</div>
						{/if}
					</div>

				{:else if pestanaActiva === 'clientes'}
					<!-- Sección de Clientes -->
					<div class="space-y-6">
						<!-- Header con botón de acción -->
						<div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
							<div>
								<h3 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
									Clientes de {$negocioActual.nombre}
								</h3>
								<p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
									Administra la base de datos de clientes de este negocio
								</p>
							</div>
							<Boton
								variant="success"
								size="md"
								icon={Plus}
								on:click={() => goto('/panel/clientes')}
							>
								Agregar Cliente
							</Boton>
						</div>

						{#if $cargandoClientes}
							<div class="flex items-center justify-center py-12">
								<Cargando />
							</div>
						{:else if clientesNegocio.length === 0}
							<div class="text-center py-12 px-4">
								<UserCheck class="w-16 h-16 mx-auto text-gray-400 mb-4" />
								<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
									No hay clientes
								</h3>
								<p class="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
									Comienza agregando clientes para gestionar las relaciones comerciales de este negocio.
								</p>
								<Boton
									variant="primary"
									size="lg"
									icon={Plus}
									on:click={() => goto('/panel/clientes')}
								>
									Agregar Primer Cliente
								</Boton>
							</div>
						{:else}
							<!-- Lista de clientes -->
							<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
								{#each clientesNegocio as cliente (cliente.id)}
									<div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
										<div class="flex items-center justify-between mb-4">
											<div class="flex items-center space-x-3">
												<div class="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
													<UserCheck class="w-5 h-5 text-green-600 dark:text-green-400" />
												</div>
												<div>
													<h4 class="font-semibold text-gray-900 dark:text-white">
														{cliente.nombre}
													</h4>
													<p class="text-sm text-gray-500 dark:text-gray-400 capitalize">
														{cliente.tipo_cliente}
													</p>
												</div>
											</div>
											<span class="px-2 py-1 text-xs font-medium rounded-full {
												cliente.estado === 'activo' 
													? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
													: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
											}">
												{cliente.estado}
											</span>
										</div>
										
										<div class="space-y-3">
											{#if cliente.email}
												<div class="flex justify-between text-sm">
													<span class="text-gray-600 dark:text-gray-400">Email:</span>
													<span class="font-medium text-gray-900 dark:text-white truncate">
														{cliente.email}
													</span>
												</div>
											{/if}
											
											{#if cliente.telefono}
												<div class="flex justify-between text-sm">
													<span class="text-gray-600 dark:text-gray-400">Teléfono:</span>
													<span class="font-medium text-gray-900 dark:text-white">
														{cliente.telefono}
													</span>
												</div>
											{/if}
											
											<div class="flex justify-between text-sm">
												<span class="text-gray-600 dark:text-gray-400">Documento:</span>
												<span class="font-medium text-gray-900 dark:text-white">
													{cliente.numero_documento}
												</span>
											</div>
											
											{#if cliente.limite_credito > 0}
												<div class="flex justify-between text-sm">
													<span class="text-gray-600 dark:text-gray-400">Límite crédito:</span>
													<span class="font-medium text-gray-900 dark:text-white">
														{formatearMoneda(cliente.limite_credito, $negocioActual.moneda)}
													</span>
												</div>
											{/if}
										</div>
									</div>
								{/each}
							</div>
							
							<div class="text-center pt-6">
								<Boton
									variant="outline"
									on:click={() => goto('/panel/clientes')}
								>
									Ver Todos los Clientes
								</Boton>
							</div>
						{/if}
					</div>

				{:else if pestanaActiva === 'movimientos'}
					<!-- Lista de movimientos -->
					<div class="space-y-3 sm:space-y-4">
						{#if $cargandoMovimientos}
							<div class="flex items-center justify-center py-8 sm:py-12">
								<Cargando />
							</div>
						{:else if movimientosNegocio.length === 0}
							<div class="text-center py-8 sm:py-12 px-4">
								<DollarSign class="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-gray-400 mb-4" />
								<h3 class="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">
									No hay movimientos
								</h3>
								<p class="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 sm:mb-6 max-w-md mx-auto">
									Empieza creando tu primer ingreso o gasto para llevar el control de tu negocio.
								</p>
								<div class="flex flex-col sm:flex-row justify-center gap-2 sm:gap-3 max-w-sm sm:max-w-none mx-auto">
									<Boton
										variant="secondary"
										icon={TrendingDown}
										on:click={() => handleNuevoMovimiento('gasto')}
										class="w-full sm:w-auto"
									>
										Nuevo Gasto
									</Boton>
									<Boton
										variant="primary"
										icon={TrendingUp}
										on:click={() => handleNuevoMovimiento('ingreso')}
										class="w-full sm:w-auto"
									>
										Nuevo Ingreso
									</Boton>
								</div>
							</div>
						{:else}
							<!-- Lista responsiva de movimientos -->
							<div class="grid gap-3 sm:gap-4">
								{#each movimientosNegocio as movimiento (movimiento.id)}
									<div class="w-full overflow-hidden">
										<TarjetaMovimiento 
											{movimiento}
											mostrarNegocio={false}
										/>
									</div>
								{/each}
							</div>
						{/if}
					</div>

				{:else if pestanaActiva === 'tareas'}
					<!-- Gestión de Tareas del Negocio -->
					<div class="space-y-6">
						<div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
							<div>
								<h2 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
									📋 Tareas de {$negocioActual?.nombre}
								</h2>
								<p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
									Gestiona las tareas y actividades de este negocio
								</p>
							</div>
							<div class="text-sm text-gray-500 dark:text-gray-400">
								{tareasNegocio.length} {tareasNegocio.length === 1 ? 'tarea' : 'tareas'}
							</div>
						</div>

						<!-- Componente Kanban de Tareas -->
						{#if $negocioActual}
							<KanbanTableroNegocios 
								tareas={tareasNegocio}
								negocioId={$negocioActual.id}
								cargandoTareas={$cargandoTareas}
								on:crear-tarea={(e) => abrirModalTarea(e.detail.estado)}
								on:editar-tarea={(e) => editarTarea(e.detail.tarea)}
								on:eliminar-tarea={(e) => handleEliminarTarea(e.detail.tarea)}
								on:mover-tarea={(e) => handleMoverTarea(e.detail.tarea, e.detail.nuevoEstado)}
								on:tarea-actualizada={async () => {
									if ($negocioActual) {
										await cargarTareasNegocio($negocioActual.id);
									}
								}}
							/>
						{:else}
							<div class="text-center py-8">
								<Cargando />
							</div>
						{/if}
					</div>

				{:else if pestanaActiva === 'marketing'}
					<!-- Gestión de Campañas de Marketing -->
					<div class="space-y-6">
						<div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
							<div>
								<h2 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
									📊 Campañas de Marketing de {$negocioActual?.nombre}
								</h2>
								<p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
									Administra y monitorea las campañas de marketing de tu negocio.
								</p>
							</div>
							<div class="text-sm text-gray-500 dark:text-gray-400">
								{$cargandoCampañas ? 'Cargando campañas...' : campañasNegocio.length} {(campañasNegocio.length === 1 ? 'campaña' : 'campañas')}
							</div>
						</div>

						{#if $cargandoCampañas}
							<div class="text-center py-8">
								<Cargando />
							</div>
						{:else if campañasNegocio.length === 0}
							<!-- Estado vacío -->
							<div class="text-center py-12">
								<BarChart3 class="w-16 h-16 mx-auto text-gray-400 mb-4" />
								<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
									No hay campañas de marketing
								</h3>
								<p class="text-gray-600 dark:text-gray-400 mb-6">
									Crea tu primera campaña para promocionar tu negocio.
								</p>
								<Boton
									variant="primary"
									size="md"
									icon={Plus}
									on:click={() => goto('/panel/marketing')}
								>
									Crear Primera Campaña
								</Boton>
							</div>
						{:else}
							<!-- Lista de Campañas -->
							<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
								{#each campañasNegocio as campaña (campaña.id)}
									<div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
										<div class="p-6">
											<!-- Header de la campaña -->
											<div class="flex items-start justify-between mb-4">
												<div class="flex-1">
													<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-1">
														{campaña.nombre}
													</h3>
													<div class="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
														<span class="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">
															{campaña.tipo_campana}
														</span>
														{#if campaña.plataforma}
															<span class="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs">
																{campaña.plataforma}
															</span>
														{/if}
													</div>
												</div>
												<div class="flex items-center space-x-1">
													<div class="w-3 h-3 rounded-full {
														campaña.estado === 'activa' ? 'bg-green-500' :
														campaña.estado === 'pausada' ? 'bg-yellow-500' :
														'bg-gray-400'
													}"></div>
													<span class="text-xs font-medium text-gray-600 dark:text-gray-400 capitalize">
														{campaña.estado}
													</span>
												</div>
											</div>

											<!-- Descripción -->
											{#if campaña.descripcion}
												<p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
													{campaña.descripcion}
												</p>
											{/if}

											<!-- Métricas principales -->
											<div class="grid grid-cols-2 gap-4 mb-4">
												<div class="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
													<p class="text-xs text-gray-500 dark:text-gray-400 mb-1">Presupuesto</p>
													<p class="text-lg font-bold text-green-600 dark:text-green-400">
														${campaña.presupuesto_total.toLocaleString()}
													</p>
												</div>
												<div class="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
													<p class="text-xs text-gray-500 dark:text-gray-400 mb-1">Gastado</p>
													<p class="text-lg font-bold text-red-600 dark:text-red-400">
														${(campaña.gastado_actual || 0).toLocaleString()}
													</p>
												</div>
											</div>

											<!-- Métricas de rendimiento -->
											{#if campaña.impresiones || campaña.clics || campaña.conversiones}
												<div class="grid grid-cols-3 gap-2 mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
													<div class="text-center">
														<p class="text-xs text-blue-600 dark:text-blue-400 mb-1">Impresiones</p>
														<p class="text-sm font-semibold text-blue-700 dark:text-blue-300">
															{(campaña.impresiones || 0).toLocaleString()}
														</p>
													</div>
													<div class="text-center">
														<p class="text-xs text-blue-600 dark:text-blue-400 mb-1">Clics</p>
														<p class="text-sm font-semibold text-blue-700 dark:text-blue-300">
															{(campaña.clics || 0).toLocaleString()}
														</p>
													</div>
													<div class="text-center">
														<p class="text-xs text-blue-600 dark:text-blue-400 mb-1">Conversiones</p>
														<p class="text-sm font-semibold text-blue-700 dark:text-blue-300">
															{campaña.conversiones || 0}
														</p>
													</div>
												</div>
											{/if}

											<!-- Fechas -->
											<div class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4">
												<span>Inicio: {new Date(campaña.fecha_inicio).toLocaleDateString()}</span>
												{#if campaña.fecha_fin}
													<span>Fin: {new Date(campaña.fecha_fin).toLocaleDateString()}</span>
												{/if}
											</div>

											<!-- Acciones -->
											<div class="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-600">
												<span class="text-xs text-gray-500 dark:text-gray-400">
													Creada: {new Date(campaña.fecha_creacion).toLocaleDateString()}
												</span>
												<div class="flex space-x-2">
													<button 
														class="px-3 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md transition-colors"
														on:click={() => goto('/panel/marketing')}
													>
														Ver Detalles
													</button>
												</div>
											</div>
										</div>
									</div>
								{/each}
							</div>

							<!-- Acción para crear nueva campaña -->
							<div class="flex flex-col sm:flex-row gap-4">
								<Boton
									variant="primary"
									size="md"
									icon={Plus}
									on:click={() => goto('/panel/marketing')}
									class="flex-1 sm:flex-initial"
								>
									Nueva Campaña
								</Boton>
								<Boton
									variant="outline"
									size="md"
									icon={BarChart3}
									on:click={() => goto('/panel/marketing')}
									class="flex-1 sm:flex-initial"
								>
									Ver Todas las Campañas
								</Boton>
							</div>
						{/if}
					</div>

				{:else if pestanaActiva === 'configuracion'}
					<!-- Configuración del negocio -->
					<div class="space-y-6 sm:space-y-8 max-w-full">
						<!-- Información Básica -->
						<div class="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
							<h3 class="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6 flex items-center">
								<Building2 class="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600" />
								Información Básica
							</h3>
							<form class="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
								<!-- Nombre del Negocio -->
								<div class="lg:col-span-2">
									<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
										Nombre del Negocio *
									</label>
									<input
										type="text"
										bind:value={formularioConfig.nombre}
										class="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base"
										placeholder="Ej: Mi Empresa Digital"
										required
									/>
								</div>

								<!-- Tipo de Negocio -->
								<div>
									<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
										Tipo de Negocio *
									</label>
									<select
										bind:value={formularioConfig.tipo_negocio}
										class="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base"
										required
									>
										{#each Object.entries(TIPOS_NEGOCIO) as [codigo, nombre]}
											<option value={codigo}>{nombre}</option>
										{/each}
									</select>
								</div>

								<!-- Moneda -->
								<div>
									<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
										Moneda *
									</label>
									<select
										bind:value={formularioConfig.moneda}
										class="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base"
										required
									>
										<option value="USD">USD - Dólar Americano</option>
										<option value="COP">COP - Peso Colombiano</option>
										<option value="EUR">EUR - Euro</option>
										<option value="MXN">MXN - Peso Mexicano</option>
										<option value="ARS">ARS - Peso Argentino</option>
									</select>
								</div>

								<!-- Descripción -->
								<div class="lg:col-span-2">
									<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
										Descripción
									</label>
									<textarea
										bind:value={formularioConfig.descripcion}
										rows="3"
										class="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none text-sm sm:text-base"
										placeholder="Describe brevemente tu negocio..."
									></textarea>
								</div>
							</form>
						</div>

						<!-- Información de Contacto -->
						<div class="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
							<h3 class="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6 flex items-center">
								<User class="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-green-600" />
								Información de Contacto
							</h3>
							<form class="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
								<!-- Website -->
								<div>
									<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
										Sitio Web
									</label>
									<input
										type="url"
										bind:value={formularioConfig.website}
										class="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base"
										placeholder="https://miempresa.com"
									/>
								</div>

								<!-- Teléfono -->
								<div>
									<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
										Teléfono
									</label>
									<input
										type="tel"
										bind:value={formularioConfig.telefono}
										class="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base"
										placeholder="+57 300 123 4567"
									/>
								</div>

								<!-- Whatsapp -->
								<div>
									<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
										WhatsApp
									</label>
									<input
										type="tel"
										bind:value={formularioConfig.whatsapp}
										class="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base"
										placeholder="+57 300 123 4567"
									/>
								</div>

								<!-- Email -->
								<div>
									<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
										Email de Contacto
									</label>
									<input
										type="email"
										bind:value={formularioConfig.email}
										class="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base"
										placeholder="contacto@miempresa.com"
									/>
								</div>

								<!-- Logo URL -->
								<div>
									<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
										Logo (URL)
									</label>
									<input
										type="url"
										bind:value={formularioConfig.logo_url}
										class="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base"
										placeholder="https://miempresa.com/logo.png"
									/>
								</div>

								<!-- Dirección -->
								<div class="lg:col-span-2">
									<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
										Dirección
									</label>
									<textarea
										bind:value={formularioConfig.direccion}
										rows="2"
										class="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none text-sm sm:text-base"
										placeholder="Calle 123 #45-67, Ciudad, País"
									></textarea>
								</div>
							</form>
						</div>

						<!-- Configuración Fiscal -->
						<div class="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
							<h3 class="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6 flex items-center">
								<FileText class="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-purple-600" />
								Configuración Fiscal
							</h3>
							<form class="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
								<!-- Número de Documento -->
								<div>
									<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
										Número de Documento (NIT/RUT)
									</label>
									<input
										type="text"
										bind:value={formularioConfig.numero_documento}
										class="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base"
										placeholder="123456789-0"
									/>
								</div>

								<!-- Régimen Fiscal -->
								<div>
									<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
										Régimen Fiscal
									</label>
									<select
										bind:value={formularioConfig.regimen_fiscal}
										class="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base"
									>
										<option value="">Seleccionar régimen</option>
										<option value="responsable_iva">Responsable de IVA</option>
										<option value="no_responsable_iva">No Responsable de IVA</option>
										<option value="gran_contribuyente">Gran Contribuyente</option>
										<option value="regimen_simple">Régimen Simple</option>
									</select>
								</div>
							</form>
						</div>

						<!-- Metas Financieras -->
						<div class="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
							<h3 class="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6 flex items-center">
								<Target class="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-orange-600" />
								Metas Financieras Mensuales
							</h3>
							<form class="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
								<!-- Meta Ingresos -->
								<div>
									<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
										Meta de Ingresos Mensuales
									</label>
									<div class="relative">
										<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
											<DollarSign class="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
										</div>
										<input
											type="number"
											bind:value={formularioConfig.meta_ingresos_mensual}
											class="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base"
											placeholder="5000"
											min="0"
											step="100"
										/>
									</div>
								</div>

								<!-- Meta Gastos -->
								<div>
									<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
										Meta de Gastos Mensuales
									</label>
									<div class="relative">
										<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
											<DollarSign class="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
										</div>
										<input
											type="number"
											bind:value={formularioConfig.meta_gastos_mensual}
											class="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base"
											placeholder="2000"
											min="0"
											step="100"
										/>
									</div>
								</div>
							</form>
						</div>

						<!-- Botones de Acción -->
						<div class="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-700">
							<button
								type="button"
								on:click={handleCancelarConfiguracion}
								disabled={guardandoConfiguracion}
								class="px-4 sm:px-6 py-2.5 sm:py-3 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-4 focus:ring-gray-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
							>
								Cancelar
							</button>
							<button
								type="button"
								on:click={handleGuardarConfiguracion}
								disabled={guardandoConfiguracion}
								class="px-4 sm:px-6 py-2.5 sm:py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-500/50 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none w-full sm:w-auto"
							>
								{#if guardandoConfiguracion}
									<svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
										<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
										<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
									</svg>
									Guardando...
								{:else}
									<Save class="w-4 h-4 mr-2 inline" />
									Guardar Cambios
								{/if}
							</button>
						</div>
					</div>
				{/if}
			</div>
		</div>

		<!-- Modal para nuevo movimiento -->
		<Modal bind:abierto={modalMovimiento} titulo="Nuevo {tipoMovimiento === 'ingreso' ? 'Ingreso' : 'Gasto'}">
			<FormularioMovimiento
				movimiento={null}
				negocios={$negocioActual ? [$negocioActual] : []}
				categorias={$categorias}
				negocioSeleccionado={$negocioActual?.id || ''}
				on:guardar={handleMovimientoCreado}
				on:cancelar={() => modalMovimiento = false}
			/>
		</Modal>

		<!-- Modal para tareas -->
		<Modal bind:abierto={modalTarea} titulo="{tareaEditando ? 'Editar' : 'Nueva'} Tarea">
			<form on:submit|preventDefault={handleGuardarTarea} class="space-y-4">
				<!-- Título -->
				<div>
					<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
						Título *
					</label>
					<input
						type="text"
						bind:value={formTarea.titulo}
						placeholder="Nombre de la tarea"
						class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
						required
					/>
				</div>
				
				<!-- Descripción -->
				<div>
					<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
						Descripción
					</label>
					<textarea
						bind:value={formTarea.descripcion}
						placeholder="Detalles de la tarea..."
						rows="3"
						class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
					></textarea>
				</div>
				
				<!-- Estado y Prioridad -->
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<div>
						<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
							Estado
						</label>
						<select 
							bind:value={formTarea.estado} 
							class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
						>
							<option value="por-hacer">📋 Por Hacer</option>
							<option value="en-progreso">🔄 En Progreso</option>
							<option value="en-revision">👀 En Revisión</option>
							<option value="completada">✅ Completada</option>
						</select>
					</div>
					
					<div>
						<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
							Prioridad
						</label>
						<select 
							bind:value={formTarea.prioridad} 
							class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
						>
							<option value="baja">🟢 Baja</option>
							<option value="media">🟡 Media</option>
							<option value="alta">🟠 Alta</option>
							<option value="urgente">🔴 Urgente</option>
						</select>
					</div>
				</div>
				
				<!-- Botones -->
				<div class="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
					<button
						type="button"
						on:click={() => {
							modalTarea = false;
							tareaEditando = null;
						}}
						class="px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium w-full sm:w-auto"
					>
						Cancelar
					</button>
					<button
						type="submit"
						class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 w-full sm:w-auto"
						disabled={!formTarea.titulo.trim()}
					>
						<Plus class="w-4 h-4" />
						{tareaEditando ? 'Actualizar' : 'Crear'} Tarea
					</button>
				</div>
			</form>
		</Modal>
	</div>
{/if} 