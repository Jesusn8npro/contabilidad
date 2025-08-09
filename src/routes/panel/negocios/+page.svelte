<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { Plus, Building2, TrendingUp, DollarSign, Calendar, Search, Filter, Grid3X3, List, MoreVertical, Edit, Trash2, Eye, Settings, BarChart3 } from 'lucide-svelte';
	import type { Negocio } from '$lib/tipos/app';
	import { TIPOS_NEGOCIO } from '$lib/tipos/app';
	import Boton from '$lib/componentes/ui/Boton.svelte';
	import Input from '$lib/componentes/ui/Input.svelte';
	import FormularioNegocio from '$lib/componentes/negocios/FormularioNegocio.svelte';
	import Modal from '$lib/componentes/ui/Modal.svelte';
	import { mostrarExito, mostrarError, mostrarAdvertencia } from '$lib/stores/toast';
	import { cargarNegocios, negocios, cargandoNegocios, crearNegocio, eliminarNegocio, estadisticasNegocios } from '$lib/stores/negocios';
	import { cargarMovimientos, resumenPorNegocio, estadisticasFinancieras } from '$lib/stores/finanzas';
	import { abrirModal, cerrarModal } from '$lib/stores/ui';
	import { fly, scale, fade } from 'svelte/transition';

	// Estado local
	let filtro = '';
	let vista: 'grid' | 'lista' = 'grid';
	let modalNuevo = false;
	let modalEditar = false;
	let modalEliminar = false;
	let guardandoNegocio = false;
	let eliminandoNegocio = false;
	let mostrarFiltros = false;
	let negocioSeleccionado: Negocio | null = null;
	let menuAbierto: string | null = null;

	// Filtros avanzados
	$: negociosFiltrados = $negocios.filter(negocio => {
		if (!negocio) return false;
		
		try {
			const nombre = negocio.nombre || '';
			const tipo = negocio.tipo_negocio || '';
			const descripcion = negocio.descripcion || '';
			const filtroLimpio = (filtro || '').toLowerCase();
			
			return nombre.toLowerCase().includes(filtroLimpio) || 
				   tipo.toLowerCase().includes(filtroLimpio) ||
				   descripcion.toLowerCase().includes(filtroLimpio);
		} catch (error) {
			console.error('Error al filtrar negocio:', error, negocio);
			return false;
		}
	});

	// Métricas reales calculadas
	$: metricas = {
		totalNegocios: $estadisticasNegocios.total,
		ingresosMes: $estadisticasFinancieras.totalIngresos,
		gastosMes: $estadisticasFinancieras.totalGastos,
		beneficioMes: $estadisticasFinancieras.balance,
		crecimiento: 12.5 // TODO: Calcular vs mes anterior
	};

	onMount(async () => {
		try {
			await cargarNegocios();
			await cargarMovimientos();
		} catch (error) {
			console.error('Error al cargar datos:', error);
			mostrarError('Error al cargar datos');
		}
	});

	// Handlers
	const handleCrearNegocio = () => {
		modalNuevo = true;
		abrirModal();
	};

	const handleGuardarNegocio = async (event: CustomEvent<{ negocio: Partial<Negocio> }>) => {
		guardandoNegocio = true;
		try {
			const { negocio } = event.detail;
			await crearNegocio(negocio);
			modalNuevo = false;
			modalEditar = false;
			cerrarModal();
			negocioSeleccionado = null;
			// Recargar datos
			await cargarNegocios();
			await cargarMovimientos();
			mostrarExito('Negocio guardado exitosamente');
		} catch (error) {
			console.error('Error al crear negocio:', error);
		} finally {
			guardandoNegocio = false;
		}
	};

	const handleCancelarFormulario = () => {
		modalNuevo = false;
		modalEditar = false;
		cerrarModal();
		negocioSeleccionado = null;
	};

	const handleVerDetalle = (negocio: Negocio) => {
		console.log('🎯 Navegando a negocio:', negocio.slug);
		goto(`/panel/negocios/${negocio.slug}`, {
			invalidateAll: true,
			replaceState: false,
			noScroll: false
		});
	};

	const handleEditarNegocio = (negocio: Negocio) => {
		negocioSeleccionado = negocio;
		modalEditar = true;
		abrirModal();
		menuAbierto = null;
	};

	const handleEliminarNegocio = (negocio: Negocio) => {
		negocioSeleccionado = negocio;
		modalEliminar = true;
		abrirModal();
		menuAbierto = null;
	};

	const confirmarEliminar = async () => {
		if (!negocioSeleccionado) return;
		
		eliminandoNegocio = true;
		try {
			await eliminarNegocio(negocioSeleccionado.id);
			modalEliminar = false;
			cerrarModal();
			negocioSeleccionado = null;
			await cargarNegocios();
			await cargarMovimientos();
			mostrarExito('Negocio eliminado exitosamente');
		} catch (error) {
			console.error('Error al eliminar negocio:', error);
			mostrarError('Error al eliminar el negocio');
		} finally {
			eliminandoNegocio = false;
		}
	};

	const toggleVista = () => {
		vista = vista === 'grid' ? 'lista' : 'grid';
	};

	const toggleFiltros = () => {
		mostrarFiltros = !mostrarFiltros;
	};

	const toggleMenu = (negocioId: string) => {
		menuAbierto = menuAbierto === negocioId ? null : negocioId;
	};

	// Cerrar menú al hacer clic fuera
	const handleClickOutside = () => {
		menuAbierto = null;
	};

	// Función para obtener el icono del tipo de negocio
	const getIconoTipo = (tipo: string) => {
		const iconos: Record<string, string> = {
			freelance: '💻',
			producto: '📦',
			servicio: '🔧',
			inversion: '📈',
			mixto: '🔄',
			otro: '🏢'
		};
		return iconos[tipo] || '🏢';
	};

	// Función para obtener el color del tipo
	const getColorTipo = (tipo: string) => {
		const colores: Record<string, string> = {
			freelance: 'bg-blue-500',
			producto: 'bg-green-500',
			servicio: 'bg-purple-500',
			inversion: 'bg-orange-500',
			mixto: 'bg-pink-500',
			otro: 'bg-gray-500'
		};
		return colores[tipo] || 'bg-gray-500';
	};

	// Función para obtener el símbolo de moneda
	const getSimboloMoneda = (moneda: string) => {
		const simbolos: Record<string, string> = {
			USD: '$',
			EUR: '€',
			COP: '$',
			MXN: '$',
			ARG: '$',
			PEN: 'S/',
			CHL: '$',
			BRL: 'R$'
		};
		return simbolos[moneda] || '$';
	};

	// Función para obtener estadísticas reales del negocio
	const getEstadisticasNegocio = (negocioId: string) => {
		const resumen = $resumenPorNegocio.find(r => r.id === negocioId);
		return {
			ingresos: resumen?.totalIngresos || 0,
			gastos: resumen?.totalGastos || 0,
			balance: resumen?.balance || 0,
			totalMovimientos: resumen?.totalMovimientos || 0
		};
	};
</script>

<svelte:head>
	<title>Negocios - App Contabilidad</title>
</svelte:head>

<svelte:window on:click={handleClickOutside} />

<div class="space-y-8 p-6">
	<!-- Header Premium Sin Bordes Redondos y Más Padding -->
	<div class="relative overflow-hidden bg-gradient-to-br from-green-600 via-blue-600 to-purple-600 p-12 text-white shadow-2xl">
		<div class="relative z-10">
			<div class="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-6 lg:space-y-0">
				<div class="flex-1">
					<h1 class="text-5xl font-extrabold mb-4 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
						Negocios
					</h1>
					<p class="text-green-100 text-xl leading-relaxed max-w-2xl">
						Gestiona todos tus negocios y fuentes de ingresos de manera inteligente y eficiente
					</p>
				</div>
				<div class="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
					<Boton
						variante="ghost"
						on:click={toggleVista}
						class="!text-white !border-white/30 hover:!bg-white/20 !py-3 !px-6 transition-all duration-300 backdrop-blur-sm"
					>
						{#if vista === 'grid'}
							<List class="w-5 h-5 mr-2" />
							Vista Lista
						{:else}
							<Grid3X3 class="w-5 h-5 mr-2" />
							Vista Grid
						{/if}
					</Boton>
					<Boton 
						on:click={handleCrearNegocio}
						class="!bg-white !text-green-600 hover:!bg-gray-100 hover:!text-green-700 shadow-2xl !py-4 !px-8 !text-lg font-bold transform hover:scale-105 transition-all duration-300"
					>
						<Plus class="w-6 h-6 mr-3" />
						Nuevo Negocio
					</Boton>
				</div>
			</div>
		</div>
		
		<!-- Elementos decorativos mejorados -->
		<div class="absolute -top-4 -right-4 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-pulse"></div>
		<div class="absolute -bottom-8 -left-8 w-40 h-40 bg-white/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
		<div class="absolute top-1/2 right-1/4 w-24 h-24 bg-blue-300/20 rounded-full blur-xl animate-bounce"></div>
	</div>

	<!-- Métricas premium con datos reales -->
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
		<!-- Total Negocios -->
		<div class="relative overflow-hidden bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl border border-gray-200/50 dark:border-gray-700/50 p-8 hover:shadow-2xl transition-all duration-500 group transform hover:scale-105">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Total Negocios</p>
					<p class="text-4xl font-black text-gray-900 dark:text-white mt-2" in:scale={{ delay: 100 }}>
						{metricas.totalNegocios}
					</p>
				</div>
				<div class="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
					<Building2 class="w-8 h-8 text-white" />
				</div>
			</div>
			<div class="absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-br from-blue-500/20 to-blue-600/30 rounded-full blur-xl"></div>
		</div>

		<!-- Ingresos del mes -->
		<div class="relative overflow-hidden bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl border border-gray-200/50 dark:border-gray-700/50 p-8 hover:shadow-2xl transition-all duration-500 group transform hover:scale-105">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Ingresos del Mes</p>
					<p class="text-4xl font-black text-green-600 dark:text-green-400 mt-2" in:scale={{ delay: 200 }}>
						${metricas.ingresosMes.toLocaleString()}
					</p>
				</div>
				<div class="p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
					<TrendingUp class="w-8 h-8 text-white" />
				</div>
			</div>
			<div class="absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-br from-green-500/20 to-green-600/30 rounded-full blur-xl"></div>
		</div>

		<!-- Gastos del mes -->
		<div class="relative overflow-hidden bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl border border-gray-200/50 dark:border-gray-700/50 p-8 hover:shadow-2xl transition-all duration-500 group transform hover:scale-105">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Gastos del Mes</p>
					<p class="text-4xl font-black text-red-600 dark:text-red-400 mt-2" in:scale={{ delay: 300 }}>
						${metricas.gastosMes.toLocaleString()}
					</p>
				</div>
				<div class="p-4 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
					<DollarSign class="w-8 h-8 text-white" />
				</div>
			</div>
			<div class="absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-br from-red-500/20 to-red-600/30 rounded-full blur-xl"></div>
		</div>

		<!-- Beneficio neto -->
		<div class="relative overflow-hidden bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-700 rounded-3xl p-8 text-white hover:shadow-2xl transition-all duration-500 group transform hover:scale-105">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-purple-100 text-sm font-semibold uppercase tracking-wide">Beneficio Neto</p>
					<p class="text-4xl font-black mt-2" in:scale={{ delay: 400 }}>
						${metricas.beneficioMes.toLocaleString()}
					</p>
					<p class="text-purple-200 text-sm mt-3 font-medium">
						+{metricas.crecimiento}% vs mes anterior
					</p>
				</div>
				<div class="p-4 bg-white/20 rounded-2xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
					<BarChart3 class="w-8 h-8" />
				</div>
			</div>
			<div class="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
		</div>
	</div>

	<!-- Barra de búsqueda y filtros -->
	<div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 shadow-lg">
		<div class="flex flex-col lg:flex-row gap-4">
			<!-- Búsqueda -->
			<div class="flex-1 relative">
				<Search class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
				<Input
					tipo="text"
					bind:valor={filtro}
					placeholder="Buscar negocios por nombre, tipo o descripción..."
					class="pl-10 !bg-white/90 dark:!bg-gray-700/90 !border-gray-200/50 dark:!border-gray-600/50"
				/>
			</div>

			<!-- Filtros -->
			<div class="flex items-center space-x-3">
				<Boton variante="secondary" on:click={toggleFiltros}>
					<Filter class="w-4 h-4 mr-2" />
					Filtros
				</Boton>

				<div class="text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg">
					{negociosFiltrados.length} de {$negocios.length}
				</div>
			</div>
		</div>

		<!-- Filtros Expandidos -->
		{#if mostrarFiltros}
			<div class="mt-6 pt-6 border-t border-gray-200/50 dark:border-gray-700/50" in:fly={{ y: -20, duration: 300 }}>
				<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
					<div>
						<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
							Tipo de negocio
						</label>
						<select class="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
							<option>Todos los tipos</option>
							<option>Servicio</option>
							<option>Producto</option>
							<option>Freelance</option>
							<option>Inversión</option>
							<option>Mixto</option>
						</select>
					</div>
					<div>
						<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
							Moneda
						</label>
						<select class="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
							<option>Todas las monedas</option>
							<option>USD</option>
							<option>EUR</option>
							<option>COP</option>
							<option>MXN</option>
						</select>
					</div>
					<div>
						<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
							Fecha de creación
						</label>
						<Input tipo="date" />
					</div>
				</div>
			</div>
		{/if}
	</div>

	<!-- Lista de negocios -->
	{#if $cargandoNegocios}
		<div class="flex items-center justify-center py-12">
			<div class="relative">
				<div class="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
				<div class="absolute inset-0 rounded-full h-12 w-12 border-4 border-purple-500/30"></div>
			</div>
			<span class="ml-4 text-gray-600 dark:text-gray-400 font-medium">Cargando negocios...</span>
		</div>
	{:else if negociosFiltrados.length === 0}
		<div class="relative overflow-hidden text-center py-20 bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-indigo-900/20 rounded-3xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl" in:scale>
			<!-- Elementos decorativos de fondo -->
			<div class="absolute inset-0 overflow-hidden">
				<div class="absolute top-10 left-1/4 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse"></div>
				<div class="absolute bottom-10 right-1/4 w-40 h-40 bg-gradient-to-br from-green-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
				<div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-2xl animate-bounce"></div>
			</div>
			
			<div class="relative z-10 max-w-2xl mx-auto px-6">
				<!-- Ícono épico central -->
				<div class="relative mb-8">
					<div class="w-32 h-32 bg-gradient-to-br from-green-500 via-blue-500 to-purple-600 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-2xl transform hover:scale-110 hover:rotate-12 transition-all duration-500 group">
						<Building2 class="w-16 h-16 text-white group-hover:animate-bounce" />
						
						<!-- Efecto de brillo -->
						<div class="absolute inset-0 bg-gradient-to-br from-yellow-400/20 to-pink-400/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
						
						<!-- Partículas decorativas -->
						<div class="absolute -top-2 -right-2 w-4 h-4 bg-yellow-400 rounded-full animate-ping opacity-0 group-hover:opacity-100"></div>
						<div class="absolute -bottom-2 -left-2 w-3 h-3 bg-pink-400 rounded-full animate-ping opacity-0 group-hover:opacity-100 delay-300"></div>
					</div>
					
					<!-- Anillos decorativos -->
					<div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 border-2 border-blue-300/30 rounded-full animate-spin"></div>
					<div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-purple-300/20 rounded-full animate-ping"></div>
				</div>
				
				<!-- Contenido del mensaje -->
				<div class="mb-10">
					<h3 class="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 mb-4">
						{filtro ? 'No se encontraron negocios' : 'Crea tu primer negocio'}
					</h3>
					
					<p class="text-xl text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
						{filtro 
							? 'Intenta ajustar los filtros de búsqueda para encontrar lo que buscas' 
							: 'Comienza tu viaje empresarial creando tu primer negocio y gestiona tus finanzas como un profesional'}
					</p>
					
					{#if !filtro}
						<!-- Features destacadas -->
						<div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
							<div class="flex items-center space-x-3 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/50 dark:border-gray-700/50">
								<div class="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
									<span class="text-white text-lg">💰</span>
								</div>
								<div class="text-left">
									<p class="font-semibold text-gray-900 dark:text-white text-sm">Finanzas Organizadas</p>
									<p class="text-gray-600 dark:text-gray-400 text-xs">Control total de ingresos y gastos</p>
								</div>
							</div>
							
							<div class="flex items-center space-x-3 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/50 dark:border-gray-700/50">
								<div class="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
									<span class="text-white text-lg">📊</span>
								</div>
								<div class="text-left">
									<p class="font-semibold text-gray-900 dark:text-white text-sm">Reportes Automáticos</p>
									<p class="text-gray-600 dark:text-gray-400 text-xs">Métricas y análisis en tiempo real</p>
								</div>
							</div>
							
							<div class="flex items-center space-x-3 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/50 dark:border-gray-700/50">
								<div class="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
									<span class="text-white text-lg">🚀</span>
								</div>
								<div class="text-left">
									<p class="font-semibold text-gray-900 dark:text-white text-sm">Crecimiento Acelerado</p>
									<p class="text-gray-600 dark:text-gray-400 text-xs">Herramientas para escalar tu negocio</p>
								</div>
							</div>
						</div>
					{/if}
				</div>
				
				{#if !filtro}
					<!-- Botón épico para crear primer negocio -->
					<button
						on:click={handleCrearNegocio}
						class="group relative px-12 py-6 bg-gradient-to-r from-green-500 via-blue-500 to-purple-600 hover:from-green-600 hover:via-blue-600 hover:to-purple-700 text-white font-black text-xl rounded-full shadow-2xl hover:shadow-green-500/25 transform hover:scale-110 hover:rotate-2 transition-all duration-500 overflow-hidden mx-auto inline-flex items-center space-x-4"
					>
						<!-- Efecto shimmer -->
						<div class="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-shimmer"></div>
						
						<!-- Contenido del botón -->
						<div class="relative flex items-center space-x-4">
							<div class="relative">
								<Plus class="w-8 h-8 transition-all duration-300 group-hover:scale-125 group-hover:rotate-180" />
								<!-- Efecto de brillo en el ícono -->
								<div class="absolute inset-0 w-8 h-8 bg-yellow-300/40 rounded-full opacity-0 group-hover:opacity-100 animate-ping"></div>
							</div>
							<span class="text-xl font-black">Crear Primer Negocio</span>
							<div class="w-3 h-3 bg-yellow-300 rounded-full animate-pulse group-hover:animate-bounce"></div>
						</div>
						
						<!-- Partículas mágicas -->
						<div class="absolute inset-0 pointer-events-none">
							<div class="absolute top-3 left-6 w-1 h-1 bg-yellow-300 rounded-full opacity-0 group-hover:opacity-100 animate-ping animation-delay-300"></div>
							<div class="absolute top-6 right-8 w-1 h-1 bg-pink-300 rounded-full opacity-0 group-hover:opacity-100 animate-ping animation-delay-500"></div>
							<div class="absolute bottom-4 left-10 w-1 h-1 bg-blue-200 rounded-full opacity-0 group-hover:opacity-100 animate-ping animation-delay-700"></div>
							<div class="absolute bottom-6 right-6 w-1 h-1 bg-green-200 rounded-full opacity-0 group-hover:opacity-100 animate-ping animation-delay-900"></div>
						</div>
						
						<!-- Efecto de onda -->
						<div class="absolute inset-0 rounded-full bg-gradient-to-r from-green-400/20 to-purple-400/20 opacity-0 group-hover:opacity-100 scale-0 group-hover:scale-150 transition-all duration-700"></div>
					</button>
					
					<!-- Texto motivacional -->
					<p class="text-sm text-gray-500 dark:text-gray-400 mt-6 italic">
						🎯 En solo 2 minutos tendrás tu negocio configurado y listo para crecer
					</p>
				{/if}
			</div>
		</div>
	{:else}
		<!-- Vista Grid -->
		{#if vista === 'grid'}
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" in:fly={{ y: 20, duration: 300 }}>
				{#each negociosFiltrados as negocio (negocio.id)}
					{@const estadisticas = getEstadisticasNegocio(negocio.id)}
					<!-- Tarjeta de negocio con navegación mejorada -->
					<div class="group relative bg-white/95 backdrop-blur-lg rounded-3xl p-8 hover:shadow-2xl hover:scale-[1.05] transition-all duration-500 overflow-hidden">
						<!-- Patrón decorativo de fondo -->
						<div class="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-pink-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

						<!-- Header con información principal y menú de opciones -->
						<div class="relative z-20 flex items-start justify-between mb-6">
							<div class="flex items-center space-x-4 flex-1">
								<!-- Ícono del tipo de negocio -->
								<div class="relative">
									<div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-lg transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
										{getIconoTipo(negocio.tipo_negocio)}
									</div>
									<div class="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
								</div>

								<!-- Información del negocio -->
								<div class="flex-1 min-w-0">
									<h3 class="text-2xl font-black text-gray-900 dark:text-white mb-2 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
										{negocio.nombre}
									</h3>
									<div class="flex items-center space-x-3">
										<span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
											{TIPOS_NEGOCIO[negocio.tipo_negocio] || negocio.tipo_negocio}
										</span>
										<span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
											{negocio.moneda}
										</span>
									</div>
								</div>
							</div>

							<!-- Menú de opciones (z-index alto) -->
							<div class="relative z-30" on:click|stopPropagation>
								<button
									on:click|stopPropagation={() => toggleMenu(negocio.id)}
									class="p-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 opacity-0 group-hover:opacity-100 transition-all duration-300 transform hover:scale-110"
								>
									<MoreVertical class="w-5 h-5" />
								</button>
								
								{#if menuAbierto === negocio.id}
									<div 
										class="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 z-50"
										in:scale={{ duration: 200 }}
										out:scale={{ duration: 150 }}
										on:click|stopPropagation
									>
										<button
											on:click|stopPropagation={() => handleVerDetalle(negocio)}
											class="w-full flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
										>
											<Eye class="w-4 h-4 mr-3" />
											Ver Detalles
										</button>
										<button
											on:click|stopPropagation={() => handleEditarNegocio(negocio)}
											class="w-full flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 dark:hover:text-green-400 transition-colors"
										>
											<Edit class="w-4 h-4 mr-3" />
											Editar Información
										</button>
										<button
											on:click|stopPropagation={() => goto(`/panel/negocios/${negocio.nombre.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`)}
											class="w-full flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
										>
											<Settings class="w-4 h-4 mr-3" />
											Configurar
										</button>
										<hr class="my-2 border-gray-200 dark:border-gray-700" />
										<button
											on:click|stopPropagation={() => handleEliminarNegocio(negocio)}
											class="w-full flex items-center px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
										>
											<Trash2 class="w-4 h-4 mr-3" />
											Eliminar Negocio
										</button>
									</div>
								{/if}
							</div>
						</div>

						<!-- Descripción -->
						<div class="relative z-10 mb-6">
							<p class="text-gray-600 dark:text-gray-400 text-sm leading-relaxed line-clamp-2">
								{negocio.descripcion || 'Sin descripción disponible'}
							</p>
						</div>

						<!-- Métricas del negocio con datos reales -->
						<div class="relative z-10 grid grid-cols-2 gap-4 mb-6">
							<div class="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl border border-green-200/50 dark:border-green-700/30">
								<p class="text-xs text-green-600 dark:text-green-400 font-semibold uppercase tracking-wide mb-1">Ingresos</p>
								<p class="text-xl font-black text-green-700 dark:text-green-300">
									{getSimboloMoneda(negocio.moneda)}{estadisticas.ingresos.toLocaleString()}
								</p>
							</div>
							<div class="text-center p-4 bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-2xl border border-red-200/50 dark:border-red-700/30">
								<p class="text-xs text-red-600 dark:text-red-400 font-semibold uppercase tracking-wide mb-1">Gastos</p>
								<p class="text-xl font-black text-red-700 dark:text-red-300">
									{getSimboloMoneda(negocio.moneda)}{estadisticas.gastos.toLocaleString()}
								</p>
							</div>
						</div>

						<!-- Balance neto -->
						<div class="relative z-10 text-center p-4 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-2xl border border-purple-200/50 dark:border-purple-700/30 mb-6">
							<p class="text-xs text-purple-600 dark:text-purple-400 font-semibold uppercase tracking-wide mb-1">Balance Neto</p>
							<p class="text-2xl font-black {estadisticas.balance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}">
								{getSimboloMoneda(negocio.moneda)}{estadisticas.balance.toLocaleString()}
							</p>
						</div>

						<!-- Footer mejorado -->
						<div class="relative z-10 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
							<div class="flex items-center space-x-2">
								<Calendar class="w-4 h-4" />
								<span class="font-medium">Creado {new Date(negocio.fecha_creacion).toLocaleDateString()}</span>
							</div>
							<div class="flex items-center space-x-2">
								<div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
								<span class="font-medium">{estadisticas.totalMovimientos} movimientos</span>
							</div>
						</div>

						<!-- Click handler para ver detalles (z-index bajo) -->
						<button 
							class="absolute inset-0 w-full h-full z-0" 
							on:click={() => handleVerDetalle(negocio)}
							aria-label="Ver detalles de {negocio.nombre}"
						></button>
					</div>
				{/each}
			</div>
		{:else}
			<!-- Vista Lista -->
			<div class="space-y-4" in:fly={{ y: 20, duration: 300 }}>
				{#each negociosFiltrados as negocio (negocio.id)}
					{@const estadisticas = getEstadisticasNegocio(negocio.id)}
					<div 
						class="group relative bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg rounded-2xl border border-gray-200/60 dark:border-gray-700/60 p-6 hover:shadow-xl transition-all duration-300 cursor-pointer"
						in:scale={{ delay: parseInt(negocio.id) * 50 }}
					>
						<div class="flex items-center justify-between">
							<div class="flex items-center space-x-4 flex-1">
								<div class="text-2xl">{getIconoTipo(negocio.tipo_negocio)}</div>
								<div class="flex-1">
									<h3 class="font-bold text-gray-900 dark:text-white text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
										{negocio.nombre}
									</h3>
									<p class="text-gray-600 dark:text-gray-400 text-sm mt-1">
										{negocio.descripcion || 'Sin descripción'}
									</p>
								</div>
							</div>
							
							<div class="flex items-center space-x-6">
								<div class="text-center">
									<p class="text-sm text-gray-500 dark:text-gray-400">Ingresos</p>
									<p class="text-lg font-bold text-green-600 dark:text-green-400">
										{getSimboloMoneda(negocio.moneda)}{estadisticas.ingresos.toLocaleString()}
									</p>
								</div>
								<div class="text-center">
									<p class="text-sm text-gray-500 dark:text-gray-400">Gastos</p>
									<p class="text-lg font-bold text-red-600 dark:text-red-400">
										{getSimboloMoneda(negocio.moneda)}{estadisticas.gastos.toLocaleString()}
									</p>
								</div>
								<div class="text-center">
									<p class="text-sm text-gray-500 dark:text-gray-400">Balance</p>
									<p class="text-lg font-bold {estadisticas.balance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}">
										{getSimboloMoneda(negocio.moneda)}{estadisticas.balance.toLocaleString()}
									</p>
								</div>
								
								<!-- Menú de opciones -->
								<div class="relative">
									<button 
										on:click|stopPropagation={() => toggleMenu(negocio.id)}
										class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
									>
										<MoreVertical class="w-5 h-5" />
									</button>
									
									{#if menuAbierto === negocio.id}
										<div 
											class="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50"
											in:scale={{ duration: 200 }}
											out:scale={{ duration: 150 }}
										>
											<button
												on:click={() => handleVerDetalle(negocio)}
												class="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
											>
												<Eye class="w-4 h-4 mr-3" />
												Ver Detalles
											</button>
											<button
												on:click={() => handleEditarNegocio(negocio)}
												class="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 dark:hover:text-green-400 transition-colors"
											>
												<Edit class="w-4 h-4 mr-3" />
												Editar
											</button>
											<button
												on:click={() => handleEliminarNegocio(negocio)}
												class="w-full flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
											>
												<Trash2 class="w-4 h-4 mr-3" />
												Eliminar
											</button>
										</div>
									{/if}
								</div>
							</div>
						</div>
						
						<!-- Click handler para ver detalles -->
						<button 
							class="absolute inset-0 w-full h-full z-0" 
							on:click={() => handleVerDetalle(negocio)}
							aria-label="Ver detalles de {negocio.nombre}"
						></button>
					</div>
				{/each}
			</div>
		{/if}
	{/if}
</div>

<!-- Modal Premium para crear negocio -->
{#if modalNuevo}
	<div 
		class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
		in:fade={{ duration: 300 }}
		out:fade={{ duration: 200 }}
	>
		<div 
			class="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200/50 dark:border-gray-700/50"
			in:scale={{ duration: 300, delay: 100 }}
			out:scale={{ duration: 200 }}
		>
			<div class="p-8">
				<FormularioNegocio
					guardando={guardandoNegocio}
					on:guardar={handleGuardarNegocio}
					on:cancelar={handleCancelarFormulario}
				/>
			</div>
		</div>
	</div>
{/if}

<!-- Modal para editar negocio -->
{#if modalEditar && negocioSeleccionado}
	<div 
		class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
		in:fade={{ duration: 300 }}
		out:fade={{ duration: 200 }}
	>
		<div 
			class="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200/50 dark:border-gray-700/50"
			in:scale={{ duration: 300, delay: 100 }}
			out:scale={{ duration: 200 }}
		>
			<div class="p-8">
				<FormularioNegocio
					negocio={negocioSeleccionado}
					guardando={guardandoNegocio}
					on:guardar={handleGuardarNegocio}
					on:cancelar={handleCancelarFormulario}
				/>
			</div>
		</div>
	</div>
{/if}

<!-- Modal de confirmación para eliminar -->
{#if modalEliminar && negocioSeleccionado}
	<div 
		class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
		in:fade={{ duration: 300 }}
		out:fade={{ duration: 200 }}
	>
		<div 
			class="bg-white dark:bg-gray-800 rounded-3xl max-w-md w-full shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
			in:scale={{ duration: 300, delay: 100 }}
			out:scale={{ duration: 200 }}
		>
			<!-- Header -->
			<div class="bg-gradient-to-r from-red-500 to-red-600 p-6 text-white">
				<div class="flex items-center space-x-3">
					<div class="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
						<Trash2 class="w-6 h-6" />
					</div>
					<div>
						<h3 class="text-xl font-bold">Eliminar Negocio</h3>
						<p class="text-red-100 text-sm">Esta acción no se puede deshacer</p>
					</div>
				</div>
			</div>
			
			<!-- Contenido -->
			<div class="p-6">
				<p class="text-gray-700 dark:text-gray-300 mb-6">
					¿Estás seguro de que deseas eliminar el negocio 
					<strong class="text-red-600 dark:text-red-400">"{negocioSeleccionado.nombre}"</strong>?
				</p>
				<p class="text-sm text-gray-500 dark:text-gray-400 mb-8">
					Se eliminarán todos los movimientos financieros asociados a este negocio.
				</p>
				
				<!-- Botones -->
				<div class="flex items-center space-x-4">
					<Boton
						variante="ghost"
						on:click={() => { modalEliminar = false; cerrarModal(); negocioSeleccionado = null; }}
						class="flex-1 !border-gray-300 dark:!border-gray-600"
						disabled={eliminandoNegocio}
					>
						Cancelar
					</Boton>
					<Boton
						variante="danger"
						on:click={confirmarEliminar}
						class="flex-1"
						cargando={eliminandoNegocio}
					>
						{#if eliminandoNegocio}
							Eliminando...
						{:else}
							Eliminar Negocio
						{/if}
					</Boton>
				</div>
			</div>
		</div>
	</div>
{/if} 