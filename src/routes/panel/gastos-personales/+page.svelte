<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import { writable } from 'svelte/store';
	import { supabase } from '$lib/supabase/cliente';
	import { 
		Plus, 
		Search, 
		Filter, 
		Calendar, 
		TrendingDown, 
		DollarSign,
		PieChart,
		FileText,
		Edit,
		Trash2,
		Download,
		MapPin,
		Building,
		CreditCard,
		Repeat,
		X
	} from 'lucide-svelte';
	import Boton from '$lib/componentes/ui/Boton.svelte';
	import Modal from '$lib/componentes/ui/Modal.svelte';

	// Interfaces
	interface GastoPersonal {
		id: string;
		usuario_id: string;
		categoria_id?: string;
		monto: number;
		descripcion: string;
		fecha_gasto: string;
		metodo_pago?: string;
		ubicacion?: string;
		proveedor?: string;
		es_recurrente: boolean;
		frecuencia_recurrencia?: string;
		tipo_gasto_personal: string;
		impacta_negocios: boolean;
		notas?: string;
		fecha_creacion: string;
		categorias?: {
			id: string;
			nombre: string;
			color: string;
		};
	}

	// Estados
	const gastosPersonales = writable<GastoPersonal[]>([]);
	let cargandoGastos = false;
	let mostrarModal = false;
	let editandoGasto: GastoPersonal | null = null;
	let guardandoGasto = false;

	// Filtros
	let terminoBusqueda = '';
	let filtroTipo = '';

	// Formulario
	let formularioGasto = {
		monto: '',
		descripcion: '',
		fecha_gasto: new Date().toISOString().split('T')[0],
		categoria_id: '',
		metodo_pago: 'efectivo',
		ubicacion: '',
		proveedor: '',
		tipo_gasto_personal: 'general',
		es_recurrente: false,
		frecuencia_recurrencia: '',
		notas: '',
		impacta_negocios: false
	};

	// Opciones
	const tiposGasto = [
		{ valor: 'alimentacion', etiqueta: 'Alimentación', icono: '🍽️' },
		{ valor: 'transporte', etiqueta: 'Transporte', icono: '🚗' },
		{ valor: 'vivienda', etiqueta: 'Vivienda', icono: '🏠' },
		{ valor: 'salud', etiqueta: 'Salud', icono: '⚕️' },
		{ valor: 'educacion', etiqueta: 'Educación', icono: '📚' },
		{ valor: 'entretenimiento', etiqueta: 'Entretenimiento', icono: '🎬' },
		{ valor: 'ropa', etiqueta: 'Ropa', icono: '👕' },
		{ valor: 'tecnologia', etiqueta: 'Tecnología', icono: '💻' },
		{ valor: 'inversiones', etiqueta: 'Inversiones', icono: '📈' },
		{ valor: 'seguros', etiqueta: 'Seguros', icono: '🛡️' },
		{ valor: 'general', etiqueta: 'General', icono: '💼' }
	];

	const metodosPago = [
		{ valor: 'efectivo', etiqueta: 'Efectivo' },
		{ valor: 'transferencia', etiqueta: 'Transferencia' },
		{ valor: 'tarjeta_credito', etiqueta: 'Tarjeta de Crédito' },
		{ valor: 'tarjeta_debito', etiqueta: 'Tarjeta de Débito' },
		{ valor: 'digital', etiqueta: 'Billetera Digital' }
	];

	// Estadísticas calculadas
	$: totalGastado = $gastosPersonales.reduce((sum, gasto) => sum + gasto.monto, 0);
	$: totalTransacciones = $gastosPersonales.length;
	$: promedioGasto = totalTransacciones > 0 ? totalGastado / totalTransacciones : 0;

	// Gastos filtrados
	$: gastosFiltrados = $gastosPersonales.filter(gasto => {
		const coincideBusqueda = !terminoBusqueda || 
			gasto.descripcion.toLowerCase().includes(terminoBusqueda.toLowerCase()) ||
			gasto.proveedor?.toLowerCase().includes(terminoBusqueda.toLowerCase());
		
		const coincideTipo = !filtroTipo || gasto.tipo_gasto_personal === filtroTipo;
		
		return coincideBusqueda && coincideTipo;
	});

	// Funciones
	const cargarGastosPersonales = async () => {
		if (!browser) return;
		
		try {
			cargandoGastos = true;
			
			const { data: { user } } = await supabase.auth.getUser();
			if (!user) {
				console.error('No hay usuario autenticado');
				return;
			}

			const { data, error } = await supabase
				.from('gastos_personales')
				.select(`
					*,
					categorias:categoria_id (
						id,
						nombre,
						color
					)
				`)
				.eq('usuario_id', user.id)
				.order('fecha_gasto', { ascending: false });

			if (error) {
				console.error('Error cargando gastos:', error);
				return;
			}

			gastosPersonales.set(data || []);
		} catch (error) {
			console.error('Error en cargarGastosPersonales:', error);
		} finally {
			cargandoGastos = false;
		}
	};

	const guardarGasto = async () => {
		if (!browser) return;
		
		try {
			guardandoGasto = true;
			
			const { data: { user } } = await supabase.auth.getUser();
			if (!user) {
				console.error('No hay usuario autenticado');
				return;
			}

			// Validar campos requeridos
			if (!formularioGasto.monto || !formularioGasto.descripcion) {
				alert('Por favor completa los campos requeridos');
				return;
			}

			const gastoData = {
				...formularioGasto,
				monto: parseFloat(formularioGasto.monto),
				usuario_id: user.id,
				fecha_creacion: editandoGasto ? undefined : new Date().toISOString(),
				aprobado: true,
				justificacion_requerida: false
			};

			let result;
			if (editandoGasto) {
				// Actualizar
				result = await supabase
					.from('gastos_personales')
					.update(gastoData)
					.eq('id', editandoGasto.id)
					.select(`
						*,
						categorias:categoria_id (
							id,
							nombre,
							color
						)
					`)
					.single();
			} else {
				// Crear
				result = await supabase
					.from('gastos_personales')
					.insert([gastoData])
					.select(`
						*,
						categorias:categoria_id (
							id,
							nombre,
							color
						)
					`)
					.single();
			}

			if (result.error) {
				console.error('Error guardando gasto:', result.error);
				alert('Error al guardar el gasto personal');
				return;
			}

			// Actualizar lista local
			if (editandoGasto) {
				gastosPersonales.update(lista => 
					lista.map(g => g.id === editandoGasto!.id ? result.data : g)
				);
			} else {
				gastosPersonales.update(lista => [result.data, ...lista]);
			}

			cerrarModal();
			console.log('✅ Gasto guardado exitosamente');
		} catch (error) {
			console.error('Error en guardarGasto:', error);
			alert('Error al guardar el gasto personal');
		} finally {
			guardandoGasto = false;
		}
	};

	const eliminarGasto = async (id: string) => {
		if (!confirm('¿Estás seguro de que quieres eliminar este gasto?')) {
			return;
		}

		try {
			const { error } = await supabase
				.from('gastos_personales')
				.delete()
				.eq('id', id);

			if (error) {
				console.error('Error eliminando gasto:', error);
				alert('Error al eliminar el gasto');
				return;
			}

			gastosPersonales.update(lista => lista.filter(g => g.id !== id));
		} catch (error) {
			console.error('Error en eliminarGasto:', error);
		}
	};

	const abrirModalCrear = () => {
		editandoGasto = null;
		formularioGasto = {
			monto: '',
			descripcion: '',
			fecha_gasto: new Date().toISOString().split('T')[0],
			categoria_id: '',
			metodo_pago: 'efectivo',
			ubicacion: '',
			proveedor: '',
			tipo_gasto_personal: 'general',
			es_recurrente: false,
			frecuencia_recurrencia: '',
			notas: '',
			impacta_negocios: false
		};
		mostrarModal = true;
	};

	const abrirModalEditar = (gasto: GastoPersonal) => {
		editandoGasto = gasto;
		formularioGasto = {
			monto: gasto.monto.toString(),
			descripcion: gasto.descripcion,
			fecha_gasto: gasto.fecha_gasto,
			categoria_id: gasto.categoria_id || '',
			metodo_pago: gasto.metodo_pago || 'efectivo',
			ubicacion: gasto.ubicacion || '',
			proveedor: gasto.proveedor || '',
			tipo_gasto_personal: gasto.tipo_gasto_personal,
			es_recurrente: gasto.es_recurrente,
			frecuencia_recurrencia: gasto.frecuencia_recurrencia || '',
			notas: gasto.notas || '',
			impacta_negocios: gasto.impacta_negocios
		};
		mostrarModal = true;
	};

	const cerrarModal = () => {
		mostrarModal = false;
		editandoGasto = null;
		guardandoGasto = false;
	};

	const formatearMoneda = (monto: number) => {
		return `$${monto.toLocaleString()}`;
	};

	const formatearFecha = (fecha: string) => {
		return new Date(fecha).toLocaleDateString('es-ES', {
			day: '2-digit',
			month: 'short',
			year: 'numeric'
		});
	};

	const obtenerIconoTipo = (tipo: string) => {
		const tipoObj = tiposGasto.find(t => t.valor === tipo);
		return tipoObj?.icono || '💼';
	};

	// Cargar datos al montar
	onMount(() => {
		cargarGastosPersonales();
	});
</script>

<svelte:head>
	<title>Gastos Personales - Panel de Control</title>
</svelte:head>

<!-- Header -->
<div class="bg-gradient-to-r from-red-600 to-pink-700 text-white">
	<div class="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
		<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
			<div class="mb-4 sm:mb-0">
				<h1 class="text-2xl sm:text-3xl font-bold flex items-center">
					<DollarSign class="w-6 h-6 sm:w-8 sm:h-8 mr-3" />
					Gastos Personales
				</h1>
				<p class="text-red-100 mt-1 text-sm sm:text-base">Controla y gestiona todos tus gastos personales</p>
			</div>
			
			<div class="flex flex-col sm:flex-row gap-2 sm:gap-3">
				<Boton 
					variante="secondary" 
					clase="border-white/20 text-white hover:bg-white/10 text-sm"
				>
					<Download class="w-4 h-4 mr-2" />
					Exportar
				</Boton>
				
				<Boton 
					on:click={abrirModalCrear}
					clase="bg-white text-red-600 hover:bg-gray-50 text-sm"
				>
					<Plus class="w-4 h-4 mr-2" />
					Nuevo Gasto
				</Boton>
			</div>
		</div>
	</div>
</div>

<!-- Contenido principal -->
<div class="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">

	<!-- Métricas -->
	<div class="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
		<div class="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
			<div class="flex items-center justify-between">
				<div class="flex-1">
					<p class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Gastado</p>
					<p class="text-2xl sm:text-3xl font-bold text-red-600 dark:text-red-400 mt-2">
						{formatearMoneda(totalGastado)}
					</p>
				</div>
				<div class="flex-shrink-0 p-3 bg-red-100 dark:bg-red-900/20 rounded-lg">
					<TrendingDown class="w-6 h-6 text-red-600 dark:text-red-400" />
				</div>
			</div>
		</div>

		<div class="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
			<div class="flex items-center justify-between">
				<div class="flex-1">
					<p class="text-sm font-medium text-gray-600 dark:text-gray-400">Transacciones</p>
					<p class="text-2xl sm:text-3xl font-bold text-purple-600 dark:text-purple-400 mt-2">
						{totalTransacciones}
					</p>
				</div>
				<div class="flex-shrink-0 p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
					<FileText class="w-6 h-6 text-purple-600 dark:text-purple-400" />
				</div>
			</div>
		</div>

		<div class="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
			<div class="flex items-center justify-between">
				<div class="flex-1">
					<p class="text-sm font-medium text-gray-600 dark:text-gray-400">Promedio</p>
					<p class="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">
						{formatearMoneda(promedioGasto)}
					</p>
				</div>
				<div class="flex-shrink-0 p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
					<PieChart class="w-6 h-6 text-blue-600 dark:text-blue-400" />
				</div>
			</div>
		</div>
	</div>

	<!-- Filtros y búsqueda -->
	<div class="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
		<div class="flex flex-col sm:flex-row gap-4">
			<!-- Búsqueda -->
			<div class="flex-1">
				<div class="relative">
					<Search class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
					<input
						type="text"
						bind:value={terminoBusqueda}
						placeholder="Buscar gastos..."
						class="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
					/>
				</div>
			</div>

			<!-- Filtro por tipo -->
			<div class="sm:w-64">
				<select
					bind:value={filtroTipo}
					class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
				>
					<option value="">Todos los tipos</option>
					{#each tiposGasto as tipo}
						<option value={tipo.valor}>{tipo.icono} {tipo.etiqueta}</option>
					{/each}
				</select>
			</div>
		</div>
	</div>

	<!-- Lista de gastos -->
	<div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
		<div class="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
			<h3 class="text-lg font-semibold text-gray-900 dark:text-white">Gastos Recientes</h3>
		</div>
		<div class="p-4 sm:p-6">
			{#if cargandoGastos}
				<div class="flex items-center justify-center py-8">
					<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
				</div>
			{:else if gastosFiltrados.length === 0}
				<div class="text-center py-8">
					<DollarSign class="w-12 h-12 mx-auto text-gray-400 mb-4" />
					<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
						No hay gastos personales
					</h3>
					<p class="text-gray-600 dark:text-gray-400 mb-6">
						Empieza registrando tu primer gasto personal.
					</p>
					<Boton on:click={abrirModalCrear}>
						<Plus class="w-4 h-4 mr-2" />
						Crear Primer Gasto
					</Boton>
				</div>
			{:else}
				<div class="space-y-3">
					{#each gastosFiltrados as gasto (gasto.id)}
						<div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border-l-4 border-l-red-500">
							<div class="flex items-start justify-between">
								<div class="flex items-start space-x-3 flex-1">
									<div class="text-2xl">{obtenerIconoTipo(gasto.tipo_gasto_personal)}</div>
									<div class="flex-1 min-w-0">
										<h4 class="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
											{gasto.descripcion}
										</h4>
										<div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
											<span class="flex items-center">
												<Calendar class="w-3 h-3 mr-1" />
												{formatearFecha(gasto.fecha_gasto)}
											</span>
											{#if gasto.proveedor}
												<span class="flex items-center">
													<Building class="w-3 h-3 mr-1" />
													{gasto.proveedor}
												</span>
											{/if}
											{#if gasto.metodo_pago}
												<span class="flex items-center">
													<CreditCard class="w-3 h-3 mr-1" />
													{metodosPago.find(m => m.valor === gasto.metodo_pago)?.etiqueta || gasto.metodo_pago}
												</span>
											{/if}
											{#if gasto.es_recurrente}
												<span class="flex items-center text-blue-600 dark:text-blue-400">
													<Repeat class="w-3 h-3 mr-1" />
													Recurrente
												</span>
											{/if}
										</div>
									</div>
								</div>

								<div class="flex items-center space-x-3 flex-shrink-0">
									<span class="font-bold text-red-600 dark:text-red-400 text-lg">
										-{formatearMoneda(gasto.monto)}
									</span>
									<div class="flex items-center space-x-1">
										<button
											on:click={() => abrirModalEditar(gasto)}
											class="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
										>
											<Edit class="w-4 h-4" />
										</button>
										<button
											on:click={() => eliminarGasto(gasto.id)}
											class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
										>
											<Trash2 class="w-4 h-4" />
										</button>
									</div>
								</div>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</div>

</div>

<!-- Modal para crear/editar gasto -->
<Modal bind:abierto={mostrarModal} titulo={editandoGasto ? 'Editar Gasto Personal' : 'Nuevo Gasto Personal'}>
	<form on:submit|preventDefault={guardarGasto} class="space-y-6">
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
			<!-- Monto -->
			<div>
				<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
					Monto *
				</label>
				<input
					type="number"
					step="0.01"
					min="0.01"
					bind:value={formularioGasto.monto}
					required
					class="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
					placeholder="0.00"
				/>
			</div>

			<!-- Fecha -->
			<div>
				<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
					Fecha del Gasto *
				</label>
				<input
					type="date"
					bind:value={formularioGasto.fecha_gasto}
					required
					class="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
				/>
			</div>

			<!-- Descripción -->
			<div class="lg:col-span-2">
				<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
					Descripción *
				</label>
				<input
					type="text"
					bind:value={formularioGasto.descripcion}
					required
					placeholder="Describe el gasto..."
					class="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
				/>
			</div>

			<!-- Tipo de gasto -->
			<div>
				<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
					Tipo de Gasto
				</label>
				<select
					bind:value={formularioGasto.tipo_gasto_personal}
					class="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
				>
					{#each tiposGasto as tipo}
						<option value={tipo.valor}>{tipo.icono} {tipo.etiqueta}</option>
					{/each}
				</select>
			</div>

			<!-- Método de pago -->
			<div>
				<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
					Método de Pago
				</label>
				<select
					bind:value={formularioGasto.metodo_pago}
					class="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
				>
					{#each metodosPago as metodo}
						<option value={metodo.valor}>{metodo.etiqueta}</option>
					{/each}
				</select>
			</div>

			<!-- Proveedor -->
			<div>
				<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
					Proveedor/Comercio
				</label>
				<input
					type="text"
					bind:value={formularioGasto.proveedor}
					placeholder="Nombre del comercio..."
					class="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
				/>
			</div>

			<!-- Ubicación -->
			<div>
				<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
					Ubicación
				</label>
				<input
					type="text"
					bind:value={formularioGasto.ubicacion}
					placeholder="Donde se realizó el gasto..."
					class="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
				/>
			</div>

			<!-- Notas -->
			<div class="lg:col-span-2">
				<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
					Notas
				</label>
				<textarea
					bind:value={formularioGasto.notas}
					rows="3"
					placeholder="Notas adicionales..."
					class="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none text-sm"
				></textarea>
			</div>

			<!-- Checkboxes -->
			<div class="lg:col-span-2 space-y-3">
				<label class="flex items-center">
					<input
						type="checkbox"
						bind:checked={formularioGasto.es_recurrente}
						class="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600"
					/>
					<span class="ml-3 text-sm text-gray-700 dark:text-gray-300">Este es un gasto recurrente</span>
				</label>
				
				<label class="flex items-center">
					<input
						type="checkbox"
						bind:checked={formularioGasto.impacta_negocios}
						class="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600"
					/>
					<span class="ml-3 text-sm text-gray-700 dark:text-gray-300">Este gasto impacta mis negocios</span>
				</label>
			</div>
		</div>

		<!-- Botones -->
		<div class="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-700">
			<button
				type="button"
				on:click={cerrarModal}
				disabled={guardandoGasto}
				class="px-4 sm:px-6 py-2.5 sm:py-3 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-4 focus:ring-gray-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
			>
				Cancelar
			</button>
			<button
				type="submit"
				disabled={guardandoGasto}
				class="px-4 sm:px-6 py-2.5 sm:py-3 text-sm font-medium text-white bg-gradient-to-r from-red-600 to-red-700 rounded-lg hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-4 focus:ring-red-500/50 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none w-full sm:w-auto"
			>
				{#if guardandoGasto}
					<svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
						<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
						<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
					</svg>
					Guardando...
				{:else}
					{editandoGasto ? 'Actualizar' : 'Crear'} Gasto
				{/if}
			</button>
		</div>
	</form>
</Modal> 