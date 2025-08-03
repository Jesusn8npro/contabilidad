<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { Plus, Building2, TrendingUp, DollarSign, Calendar, Search, Filter, Grid3X3, List, MoreVertical, Edit, Trash2 } from 'lucide-svelte';
	import type { Negocio } from '$lib/tipos/app';
	import Boton from '$lib/componentes/ui/Boton.svelte';
	import Input from '$lib/componentes/ui/Input.svelte';
	import FormularioNegocio from '$lib/componentes/negocios/FormularioNegocio.svelte';
	import { mostrarExito, mostrarError, mostrarAdvertencia } from '$lib/stores/toast';
	import { cargarNegocios, negocios, cargandoNegocios, crearNegocio, estadisticasNegocios } from '$lib/stores/negocios';
	import { fly, scale } from 'svelte/transition';

	// Estado local
	let filtro = '';
	let vista: 'grid' | 'lista' = 'grid';
	let modalNuevo = false;
	let guardandoNegocio = false;
	let mostrarFiltros = false;

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

	// Métricas computadas
	$: metricas = {
		totalNegocios: $estadisticasNegocios.total,
		ingresosMes: 8750.00, // TODO: Calcular desde movimientos
		gastosMes: 2340.50,   // TODO: Calcular desde movimientos
		beneficioMes: 6409.50, // TODO: Calcular desde movimientos
		crecimiento: 12.5
	};

	onMount(async () => {
		try {
			await cargarNegocios();
		} catch (error) {
			console.error('Error al cargar negocios:', error);
			mostrarError('Error al cargar negocios');
		}
	});

	// Handlers
	const handleCrearNegocio = () => {
		modalNuevo = true;
	};

	const handleGuardarNegocio = async (event: CustomEvent<{ negocio: Partial<Negocio> }>) => {
		guardandoNegocio = true;
		try {
			const { negocio } = event.detail;
			await crearNegocio(negocio);
			modalNuevo = false;
			// Recargar lista
			await cargarNegocios();
		} catch (error) {
			console.error('Error al crear negocio:', error);
		} finally {
			guardandoNegocio = false;
		}
	};

	const handleCancelarFormulario = () => {
		modalNuevo = false;
	};

	const handleVerDetalle = (negocio: Negocio) => {
		// Convertir nombre a slug (espacios a guiones, minúsculas)
		const slug = negocio.nombre.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
		goto(`/panel/negocios/${slug}`);
	};

	const toggleVista = () => {
		vista = vista === 'grid' ? 'lista' : 'grid';
	};

	const toggleFiltros = () => {
		mostrarFiltros = !mostrarFiltros;
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
</script>

<svelte:head>
	<title>Negocios - App Contabilidad</title>
</svelte:head>

<div class="space-y-8">
	<!-- Header Premium con Gradiente -->
	<div class="relative overflow-hidden bg-gradient-to-br from-green-600 via-blue-600 to-purple-600 rounded-3xl p-8 text-white">
		<div class="relative z-10">
			<div class="flex items-center justify-between">
				<div>
					<h1 class="text-4xl font-bold mb-2">Negocios</h1>
					<p class="text-green-100 text-lg">
						Gestiona todos tus negocios y fuentes de ingresos
					</p>
				</div>
				<div class="flex items-center space-x-4">
					<Boton
						variante="ghost"
						on:click={toggleVista}
						class="!text-white !border-white/30 hover:!bg-white/20"
					>
						{#if vista === 'grid'}
							<List class="w-5 h-5" />
						{:else}
							<Grid3X3 class="w-5 h-5" />
						{/if}
					</Boton>
					<Boton 
						on:click={handleCrearNegocio}
						class="!bg-white !text-green-600 hover:!bg-gray-100 shadow-lg"
					>
						<Plus class="w-5 h-5 mr-2" />
						Nuevo Negocio
					</Boton>
				</div>
			</div>
		</div>
		
		<!-- Elementos decorativos -->
		<div class="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
		<div class="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
	</div>

	<!-- Métricas premium -->
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
		<!-- Total Negocios -->
		<div class="relative overflow-hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 hover:shadow-lg transition-all duration-300 group">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Negocios</p>
					<p class="text-3xl font-bold text-gray-900 dark:text-white mt-1" in:scale={{ delay: 100 }}>
						{metricas.totalNegocios}
					</p>
				</div>
				<div class="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl group-hover:scale-110 transition-transform">
					<Building2 class="w-6 h-6 text-blue-600 dark:text-blue-400" />
				</div>
			</div>
			<div class="absolute -bottom-2 -right-2 w-20 h-20 bg-gradient-to-br from-blue-500/10 to-blue-600/20 rounded-full"></div>
		</div>

		<!-- Ingresos del mes -->
		<div class="relative overflow-hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 hover:shadow-lg transition-all duration-300 group">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-sm font-medium text-gray-600 dark:text-gray-400">Ingresos del Mes</p>
					<p class="text-3xl font-bold text-green-600 dark:text-green-400 mt-1" in:scale={{ delay: 200 }}>
						${metricas.ingresosMes.toLocaleString()}
					</p>
				</div>
				<div class="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl group-hover:scale-110 transition-transform">
					<TrendingUp class="w-6 h-6 text-green-600 dark:text-green-400" />
				</div>
			</div>
			<div class="absolute -bottom-2 -right-2 w-20 h-20 bg-gradient-to-br from-green-500/10 to-green-600/20 rounded-full"></div>
		</div>

		<!-- Gastos del mes -->
		<div class="relative overflow-hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 hover:shadow-lg transition-all duration-300 group">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-sm font-medium text-gray-600 dark:text-gray-400">Gastos del Mes</p>
					<p class="text-3xl font-bold text-red-600 dark:text-red-400 mt-1" in:scale={{ delay: 300 }}>
						${metricas.gastosMes.toLocaleString()}
					</p>
				</div>
				<div class="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl group-hover:scale-110 transition-transform">
					<DollarSign class="w-6 h-6 text-red-600 dark:text-red-400" />
				</div>
			</div>
			<div class="absolute -bottom-2 -right-2 w-20 h-20 bg-gradient-to-br from-red-500/10 to-red-600/20 rounded-full"></div>
		</div>

		<!-- Beneficio neto -->
		<div class="relative overflow-hidden bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white hover:shadow-lg transition-all duration-300 group">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-purple-100 text-sm font-medium">Beneficio Neto</p>
					<p class="text-3xl font-bold mt-1" in:scale={{ delay: 400 }}>
						${metricas.beneficioMes.toLocaleString()}
					</p>
					<p class="text-purple-200 text-sm mt-2">
						+{metricas.crecimiento}% vs mes anterior
					</p>
				</div>
				<div class="p-3 bg-white/20 rounded-xl group-hover:scale-110 transition-transform">
					<TrendingUp class="w-6 h-6" />
				</div>
			</div>
			<div class="absolute -bottom-2 -right-2 w-20 h-20 bg-white/10 rounded-full"></div>
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
		<div class="text-center py-16 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50" in:scale>
			<div class="w-24 h-24 bg-gradient-to-br from-green-500 to-blue-500 rounded-2xl mx-auto mb-6 flex items-center justify-center">
				<Building2 class="w-12 h-12 text-white" />
			</div>
			<h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
				{filtro ? 'No se encontraron negocios' : 'Crea tu primer negocio'}
			</h3>
			<p class="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
				{filtro 
					? 'Intenta ajustar los filtros de búsqueda' 
					: 'Comienza creando tu primer negocio para gestionar tus finanzas'
				}
			</p>
			{#if !filtro}
				<Boton on:click={handleCrearNegocio} class="shadow-lg">
					<Plus class="w-5 h-5 mr-2" />
					Crear Primer Negocio
				</Boton>
			{/if}
		</div>
	{:else}
		<!-- Vista Grid -->
		{#if vista === 'grid'}
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" in:fly={{ y: 20, duration: 300 }}>
				{#each negociosFiltrados as negocio (negocio.id)}
					<div 
						class="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 hover:shadow-lg hover:shadow-gray-200/50 dark:hover:shadow-gray-900/50 transition-all duration-300 cursor-pointer hover:scale-[1.02]"
						in:scale={{ delay: parseInt(negocio.id) * 50 }}
					>
						<!-- Header del negocio -->
						<div class="flex items-start justify-between mb-4">
							<div class="flex items-center space-x-3">
								<div class="text-2xl">{getIconoTipo(negocio.tipo_negocio)}</div>
								<div>
									<h3 class="font-semibold text-gray-900 dark:text-white text-lg">
										{negocio.nombre}
									</h3>
									<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 capitalize mt-1">
										{negocio.tipo_negocio}
									</span>
								</div>
							</div>
							
							<button class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 opacity-0 group-hover:opacity-100 transition-all">
								<MoreVertical class="w-4 h-4" />
							</button>
						</div>

						<!-- Descripción -->
						<p class="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
							{negocio.descripcion || 'Sin descripción'}
						</p>

						<!-- Métricas del negocio -->
						<div class="grid grid-cols-2 gap-4 mb-4">
							<div class="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
								<p class="text-xs text-green-600 dark:text-green-400 font-medium">Ingresos</p>
								<p class="text-lg font-bold text-green-700 dark:text-green-300">
									{getSimboloMoneda(negocio.moneda)}{(Math.random() * 5000 + 1000).toFixed(0)}
								</p>
							</div>
							<div class="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-xl">
								<p class="text-xs text-red-600 dark:text-red-400 font-medium">Gastos</p>
								<p class="text-lg font-bold text-red-700 dark:text-red-300">
									{getSimboloMoneda(negocio.moneda)}{(Math.random() * 1000 + 200).toFixed(0)}
								</p>
							</div>
						</div>

						<!-- Footer -->
						<div class="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
							<div class="flex items-center space-x-1">
								<Calendar class="w-4 h-4" />
								<span>Creado {new Date(negocio.fecha_creacion).toLocaleDateString()}</span>
							</div>
							<div class="flex items-center space-x-1">
								<DollarSign class="w-4 h-4" />
								<span>{negocio.moneda}</span>
							</div>
						</div>

						<!-- Hover effect -->
						<div class="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
						
						<!-- Click handler -->
						<button 
							class="absolute inset-0 w-full h-full"
							on:click={() => handleVerDetalle(negocio)}
						></button>
					</div>
				{/each}
			</div>
		{:else}
			<!-- Vista Lista -->
			<div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden" in:fly={{ y: 20, duration: 300 }}>
				<div class="grid grid-cols-12 gap-4 p-4 border-b border-gray-200/50 dark:border-gray-700/50 font-semibold text-gray-900 dark:text-white text-sm">
					<div class="col-span-4">Negocio</div>
					<div class="col-span-2">Tipo</div>
					<div class="col-span-2">Ingresos</div>
					<div class="col-span-2">Gastos</div>
					<div class="col-span-1">Moneda</div>
					<div class="col-span-1">Acciones</div>
				</div>
				
				{#each negociosFiltrados as negocio (negocio.id)}
					<div class="grid grid-cols-12 gap-4 p-4 border-b border-gray-200/50 dark:border-gray-700/50 last:border-b-0 hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors">
						<div class="col-span-4 flex items-center space-x-3">
							<div class="text-xl">{getIconoTipo(negocio.tipo_negocio)}</div>
							<div>
								<h3 class="font-medium text-gray-900 dark:text-white">{negocio.nombre}</h3>
								<p class="text-sm text-gray-600 dark:text-gray-400 truncate">{negocio.descripcion || 'Sin descripción'}</p>
							</div>
						</div>
						<div class="col-span-2 flex items-center">
							<span class="capitalize text-gray-600 dark:text-gray-400">{negocio.tipo_negocio}</span>
						</div>
						<div class="col-span-2 flex items-center">
							<span class="font-semibold text-green-600 dark:text-green-400">
								{getSimboloMoneda(negocio.moneda)}{(Math.random() * 5000 + 1000).toFixed(0)}
							</span>
						</div>
						<div class="col-span-2 flex items-center">
							<span class="font-semibold text-red-600 dark:text-red-400">
								{getSimboloMoneda(negocio.moneda)}{(Math.random() * 1000 + 200).toFixed(0)}
							</span>
						</div>
						<div class="col-span-1 flex items-center">
							<span class="text-gray-600 dark:text-gray-400">{negocio.moneda}</span>
						</div>
						<div class="col-span-1 flex items-center">
							<button 
								class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
								on:click={() => handleVerDetalle(negocio)}
							>
								<MoreVertical class="w-4 h-4" />
							</button>
						</div>
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
		in:fly={{ y: 50, duration: 300, opacity: 0 }}
		out:fly={{ y: -50, duration: 200, opacity: 0 }}
	>
		<div 
			class="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200/50 dark:border-gray-700/50"
			in:scale={{ duration: 300, delay: 100 }}
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