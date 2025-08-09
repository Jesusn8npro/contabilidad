<script lang="ts">
    import { onMount } from 'svelte';
    import { user } from '$lib/stores/auth';
    import { 
        finanzasPersonales, 
        resumenFinanzas, 
        cargandoFinanzas,
        finanzasPersonalesStore,
        formatearMoneda,
        tiposFinanzasPersonales,
        metodosPago,
        type FinanzaPersonal
    } from '$lib/stores/finanzas-personales';
    import { 
        DollarSign, 
        TrendingUp, 
        TrendingDown, 
        Receipt, 
        Plus,
        Edit3,
        Trash2,
        X,
        FileText
    } from 'lucide-svelte';
    import FormularioMovimiento from '$lib/componentes/movimientos/FormularioMovimiento.svelte';
    import TarjetaMovimiento from '$lib/componentes/movimientos/TarjetaMovimiento.svelte';
    import Modal from '$lib/componentes/ui/Modal.svelte';
    import Boton from '$lib/componentes/ui/Boton.svelte';

    // Estado del modal
    let modalAbierto = false;
    let finanzaEditando: FinanzaPersonal | null = null;

    // Formulario
    let formFinanza = {
        descripcion: '',
        monto: 0,
        tipo: 'gasto' as 'ingreso' | 'gasto',
        fecha_gasto: new Date().toISOString().split('T')[0],
        metodo_pago: 'efectivo',
        tipo_gasto_personal: 'otros',
        proveedor: '',
        ubicacion: '',
        notas: ''
    };

    // Funciones del modal
    function abrirModalNuevo() {
        finanzaEditando = null;
        formFinanza = {
            descripcion: '',
            monto: 0,
            tipo: 'gasto',
            fecha_gasto: new Date().toISOString().split('T')[0],
            metodo_pago: 'efectivo',
            tipo_gasto_personal: 'otros',
            proveedor: '',
            ubicacion: '',
            notas: ''
        };
        modalAbierto = true;
    }

    function editarFinanza(finanza: FinanzaPersonal) {
        finanzaEditando = finanza;
        formFinanza = {
            descripcion: finanza.descripcion || '',
            monto: Number(finanza.monto) || 0,
            tipo: finanza.tipo || 'gasto',
            fecha_gasto: finanza.fecha_gasto || new Date().toISOString().split('T')[0],
            metodo_pago: finanza.metodo_pago || 'efectivo',
            tipo_gasto_personal: finanza.tipo_gasto_personal || 'otros',
            proveedor: finanza.proveedor || '',
            ubicacion: finanza.ubicacion || '',
            notas: finanza.notas || ''
        };
        modalAbierto = true;
    }

    async function guardarFinanza() {
        if (!$user || !formFinanza.descripcion || formFinanza.monto <= 0) {
            alert('Por favor completa todos los campos obligatorios');
            return;
        }

        try {
            const datosFinanza: Partial<FinanzaPersonal> = {
                ...formFinanza,
                usuario_id: $user.id,
                monto: Number(formFinanza.monto)
            };

            if (finanzaEditando) {
                await finanzasPersonalesStore.actualizar(finanzaEditando.id!, datosFinanza);
                alert('✅ Finanza actualizada correctamente');
            } else {
                await finanzasPersonalesStore.crear(datosFinanza as FinanzaPersonal);
                alert('✅ Finanza creada correctamente');
            }
            
            modalAbierto = false;
        } catch (error) {
            console.error('Error guardando finanza:', error);
            alert('❌ Error al guardar la finanza');
        }
    }

    async function eliminarFinanza(id: string, descripcion: string) {
        if (!confirm(`¿Eliminar "${descripcion}"?`)) return;
        
        try {
            await finanzasPersonalesStore.eliminar(id);
            alert('✅ Finanza eliminada');
        } catch (error) {
            console.error('Error eliminando finanza:', error);
            alert('❌ Error al eliminar la finanza');
        }
    }

    function cerrarModal() {
        modalAbierto = false;
        finanzaEditando = null;
    }

    onMount(async () => {
        if ($user) {
            await finanzasPersonalesStore.cargar($user);
        }
    });

	// Variables reactivas para métricas
	$: totalIngresos = $finanzasPersonales
		.filter(f => f.tipo === 'ingreso')
		.reduce((sum, f) => sum + Number(f.monto), 0);

	$: totalGastos = $finanzasPersonales
		.filter(f => f.tipo === 'gasto')
		.reduce((sum, f) => sum + Number(f.monto), 0);

	$: balance = totalIngresos - totalGastos;
</script>

<svelte:head>
    <title>Finanzas Personales - App Contabilidad</title>
</svelte:head>

<!-- Contenedor principal OPTIMIZADO -->
<div class="w-full max-w-full p-2 sm:p-4 space-y-4">
	<!-- Header COMPACTO -->
	<div class="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-4 border border-green-200 dark:border-gray-700">
		<div class="flex flex-col sm:flex-row sm:items-center justify-between">
			<div>
				<h1 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center">
					<DollarSign class="w-6 h-6 text-green-600 mr-2" />
					💰 Finanzas Personales
				</h1>
				<p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
					Controla todos tus ingresos y gastos personales
				</p>
			</div>
			<Boton 
				on:click={() => modalAbierto = true}
				class="mt-3 sm:mt-0"
			>
				<Plus class="w-4 h-4 mr-2" />
				Nuevo Movimiento
			</Boton>
		</div>
	</div>

	<!-- Métricas financieras COMPACTAS -->
	<div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
		<!-- Total Ingresos -->
		<div class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-xs font-medium text-green-600 dark:text-green-400 mb-1">Total Ingresos</p>
					<p class="text-xl font-bold text-green-700 dark:text-green-300">
						{formatearMoneda(totalIngresos)}
					</p>
					<div class="flex items-center mt-1">
						<TrendingUp class="w-3 h-3 text-green-500 mr-1" />
						<span class="text-xs text-green-600 dark:text-green-400">Este mes</span>
					</div>
				</div>
				<TrendingUp class="w-6 h-6 text-green-500" />
			</div>
		</div>

		<!-- Total Gastos -->
		<div class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-xs font-medium text-red-600 dark:text-red-400 mb-1">Total Gastos</p>
					<p class="text-xl font-bold text-red-700 dark:text-red-300">
						{formatearMoneda(totalGastos)}
					</p>
					<div class="flex items-center mt-1">
						<TrendingDown class="w-3 h-3 text-red-500 mr-1" />
						<span class="text-xs text-red-600 dark:text-red-400">Este mes</span>
					</div>
				</div>
				<TrendingDown class="w-6 h-6 text-red-500" />
			</div>
		</div>

		<!-- Balance -->
		<div class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1">Balance</p>
					<p class="text-xl font-bold {balance >= 0 ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}">
						{formatearMoneda(balance)}
					</p>
					<div class="flex items-center mt-1">
						<DollarSign class="w-3 h-3 text-blue-500 mr-1" />
						<span class="text-xs text-blue-600 dark:text-blue-400">Actual</span>
					</div>
				</div>
				<DollarSign class="w-6 h-6 text-blue-500" />
			</div>
		</div>

		<!-- Movimientos -->
		<div class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-xs font-medium text-purple-600 dark:text-purple-400 mb-1">Movimientos</p>
					<p class="text-xl font-bold text-purple-700 dark:text-purple-300">
						{$finanzasPersonales.length}
					</p>
					<div class="flex items-center mt-1">
						<FileText class="w-3 h-3 text-purple-500 mr-1" />
						<span class="text-xs text-purple-600 dark:text-purple-400">Registrados</span>
					</div>
				</div>
				<FileText class="w-6 h-6 text-purple-500" />
			</div>
		</div>
	</div>

	<!-- Movimientos Recientes COMPACTO -->
	<div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
		<div class="p-4 border-b border-gray-200 dark:border-gray-700">
			<h2 class="text-lg font-semibold text-gray-900 dark:text-white">
				📊 Movimientos Recientes
			</h2>
		</div>
		
		<div class="overflow-x-auto">
			{#if $cargandoFinanzas}
				<div class="p-6 text-center">
					<div class="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
					<p class="text-gray-500">Cargando finanzas...</p>
				</div>
			{:else if $finanzasPersonales.length === 0}
				<div class="text-center py-8">
					<DollarSign class="w-12 h-12 text-gray-400 mx-auto mb-3" />
					<p class="text-gray-500 dark:text-gray-400 mb-4">No hay movimientos registrados</p>
					<Boton on:click={() => modalAbierto = true}>
						<Plus class="w-4 h-4 mr-2" />
						Crear Primer Movimiento
					</Boton>
				</div>
			{:else}
				<table class="w-full">
					<thead class="bg-gray-50 dark:bg-gray-700/50">
						<tr>
							<th class="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
								Descripción
							</th>
							<th class="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
								Tipo
							</th>
							<th class="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
								Monto
							</th>
							<th class="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
								Fecha
							</th>
							<th class="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
								Acciones
							</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-gray-200 dark:divide-gray-700">
						{#each $finanzasPersonales.slice(0, 10) as finanza}
							<tr class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
								<td class="px-4 py-3 text-sm text-gray-900 dark:text-white">
									{finanza.descripcion}
								</td>
								<td class="px-4 py-3">
									<span class="inline-flex px-2 py-1 text-xs font-medium rounded {
										finanza.tipo === 'ingreso' 
											? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
											: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
									}">
										{finanza.tipo === 'ingreso' ? '💰 Ingreso' : '💸 Gasto'}
									</span>
								</td>
								<td class="px-4 py-3 text-sm font-semibold {
									finanza.tipo === 'ingreso' 
										? 'text-green-600 dark:text-green-400' 
										: 'text-red-600 dark:text-red-400'
								}">
									{finanza.tipo === 'ingreso' ? '+' : '-'}{formatearMoneda(Number(finanza.monto))}
								</td>
								<td class="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
									{new Date(finanza.fecha_gasto).toLocaleDateString('es-ES')}
								</td>
								<td class="px-4 py-3">
									<button 
										on:click={() => editarFinanza(finanza)}
										class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
									>
										<Edit3 class="w-4 h-4" />
									</button>
									<button 
										on:click={() => eliminarFinanza(finanza.id || '', finanza.descripcion || 'Movimiento')}
										class="ml-2 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
									>
										<Trash2 class="w-4 h-4" />
									</button>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			{/if}
		</div>
	</div>
</div>

<!-- Modal Nuevo/Editar Finanza -->
{#if modalAbierto}
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                    {finanzaEditando ? 'Editar Movimiento' : 'Nuevo Movimiento'}
                </h3>
                <button 
                    on:click={cerrarModal}
                    class="p-1 text-gray-400 hover:text-gray-600 rounded"
                >
                    <X class="w-5 h-5" />
                </button>
            </div>
            
            <div class="space-y-4">
                <!-- Tipo de Movimiento -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Tipo de Movimiento *
                    </label>
                    <div class="flex space-x-4">
                        <label class="flex items-center">
                            <input 
                                type="radio" 
                                bind:group={formFinanza.tipo} 
                                value="ingreso"
                                class="mr-2"
                            />
                            <span class="text-green-600">💰 Ingreso</span>
                        </label>
                        <label class="flex items-center">
                            <input 
                                type="radio" 
                                bind:group={formFinanza.tipo} 
                                value="gasto"
                                class="mr-2"
                            />
                            <span class="text-red-600">💸 Gasto</span>
                        </label>
                    </div>
                </div>

                <!-- Descripción -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Descripción *
                    </label>
                    <input
                        type="text"
                        bind:value={formFinanza.descripcion}
                        placeholder="Ej: Almuerzo, Salario, Gasolina..."
                        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
                        required
                    />
                </div>

                <!-- Monto -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Monto *
                    </label>
                    <input
                        type="number"
                        bind:value={formFinanza.monto}
                        placeholder="0"
                        min="0"
                        step="100"
                        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
                        required
                    />
                </div>

                <!-- Fecha -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Fecha
                    </label>
                    <input
                        type="date"
                        bind:value={formFinanza.fecha_gasto}
                        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
                    />
                </div>

                <!-- Categoría y Método de Pago -->
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Categoría
                        </label>
                        <select
                            bind:value={formFinanza.tipo_gasto_personal}
                            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
                        >
                            {#each tiposFinanzasPersonales as tipo}
                                <option value={tipo.id}>{tipo.icono} {tipo.nombre}</option>
                            {/each}
                        </select>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Método
                        </label>
                        <select
                            bind:value={formFinanza.metodo_pago}
                            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
                        >
                            {#each metodosPago as metodo}
                                <option value={metodo.id}>{metodo.icono} {metodo.nombre}</option>
                            {/each}
                        </select>
                    </div>
                </div>

                <!-- Proveedor (opcional) -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Proveedor/Lugar
                    </label>
                    <input
                        type="text"
                        bind:value={formFinanza.proveedor}
                        placeholder="Nombre del establecimiento o empresa"
                        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
                    />
                </div>

                <!-- Notas (opcional) -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Notas
                    </label>
                    <textarea
                        bind:value={formFinanza.notas}
                        placeholder="Notas adicionales..."
                        rows="2"
                        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
                    ></textarea>
                </div>
            </div>
            
            <div class="flex items-center justify-end space-x-3 mt-6">
                <button
                    on:click={cerrarModal}
                    class="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                    Cancelar
                </button>
                <button
                    on:click={guardarFinanza}
                    disabled={$cargandoFinanzas}
                    class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                >
                    {#if $cargandoFinanzas}
                        <div class="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                    {/if}
                    <span>{finanzaEditando ? 'Actualizar' : 'Crear'}</span>
                </button>
            </div>
        </div>
    </div>
{/if} 