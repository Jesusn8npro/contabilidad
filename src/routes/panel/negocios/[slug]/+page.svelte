<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import { derived } from 'svelte/store';
	import type { Negocio, MovimientoFinanciero, TipoNegocio } from '$lib/tipos/app';
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
		Save
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
	import Boton from '$lib/componentes/ui/Boton.svelte';
	import Cargando from '$lib/componentes/ui/Cargando.svelte';
	import FormularioMovimiento from '$lib/componentes/movimientos/FormularioMovimiento.svelte';
	import Modal from '$lib/componentes/ui/Modal.svelte';
	import TarjetaMovimiento from '$lib/componentes/movimientos/TarjetaMovimiento.svelte';

	// Params
	let negocioSlug: string = '';
	$: negocioSlug = $page.params.slug || '';

	// Estado local
	let modalMovimiento = false;
	let tipoMovimiento: 'ingreso' | 'gasto' = 'ingreso';
	let pestanaActiva: 'resumen' | 'movimientos' | 'configuracion' = 'resumen';
	let guardandoConfiguracion = false;
	let formularioInicializado = false; // 🔧 NUEVA VARIABLE PARA CONTROLAR INICIALIZACIÓN

	// Formulario de configuración - Variables reactivas
	let formularioConfig = {
		nombre: '',
		tipo_negocio: 'servicio' as TipoNegocio,
		descripcion: '',
		moneda: 'USD',
		website: '',
		telefono: '',
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

	// Movimientos filtrados del negocio actual
	$: movimientosNegocio = $movimientos.filter(m => 
		$negocioActual && m.negocio_id === $negocioActual.id
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
				// Cargar movimientos del negocio
				await cargarMovimientos($negocioActual.id);
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
			console.log('🚀 Creando movimiento:', event.detail.movimiento);
			
			if (!$negocioActual) {
				console.error('No hay negocio actual');
				return;
			}

			// Preparar datos del movimiento
			const datosMovimiento = {
				...event.detail.movimiento,
				negocio_id: $negocioActual.id,
				// Asegurar que tipo_movimiento esté establecido
				tipo_movimiento: event.detail.movimiento.tipo_movimiento || tipoMovimiento
			};

			console.log('📝 Datos finales del movimiento:', datosMovimiento);
			
			// Crear el movimiento
			const movimientoCreado = await crearMovimiento(datosMovimiento);
			
			if (movimientoCreado) {
				console.log('✅ Movimiento creado exitosamente:', movimientoCreado);
				modalMovimiento = false;
				
				// Recargar movimientos para actualizar la UI
				await cargarMovimientos($negocioActual.id);
			} else {
				console.error('❌ Error al crear movimiento');
			}
		} catch (error) {
			console.error('💥 Error en handleMovimientoCreado:', error);
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
							</div>
						</div>
					</div>

					<!-- Sección derecha: Botones de acción -->
					<div class="flex flex-col sm:flex-row gap-2 sm:gap-3 lg:gap-4 flex-shrink-0">
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
						class="py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap {pestanaActiva === 'movimientos' 
							? 'border-blue-500 text-blue-600 dark:text-blue-400' 
							: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'}"
						on:click={() => pestanaActiva = 'movimientos'}
					>
						<DollarSign class="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 sm:mr-2" />
						<span class="hidden sm:inline">Movimientos</span>
						<span class="sm:hidden">Mov.</span>
						({movimientosNegocio.length})
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
					<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
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
										variante="secondary"
										on:click={() => handleNuevoMovimiento('gasto')}
										clase="w-full sm:w-auto"
									>
										<TrendingDown class="w-4 h-4 mr-2" />
										Nuevo Gasto
									</Boton>
									<Boton
										on:click={() => handleNuevoMovimiento('ingreso')}
										clase="w-full sm:w-auto"
									>
										<TrendingUp class="w-4 h-4 mr-2" />
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
		</div> <!-- Cierre contenido principal -->
	</div> <!-- Cierre contenedor principal -->
{/if} 