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
        X
    } from 'lucide-svelte';

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
</script>

<svelte:head>
    <title>Finanzas Personales - App Contabilidad</title>
</svelte:head>

<div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
        <div>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <DollarSign class="w-8 h-8 text-green-600" />
                Finanzas Personales
            </h1>
            <p class="text-gray-600 dark:text-gray-400 mt-1">
                Controla todos tus ingresos y gastos personales
            </p>
        </div>
        
        <button 
            on:click={abrirModalNuevo}
            class="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
            <Plus class="w-4 h-4" />
            <span>Nuevo Movimiento</span>
        </button>
    </div>

    <!-- Estadísticas -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <!-- Total Ingresos -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border p-6">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm text-gray-600 dark:text-gray-400">Total Ingresos</p>
                    <p class="text-2xl font-bold text-gray-900 dark:text-white">
                        {formatearMoneda($resumenFinanzas.total_ingresos)}
                    </p>
                </div>
                <TrendingUp class="w-8 h-8 text-green-600" />
            </div>
        </div>

        <!-- Total Gastos -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border p-6">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm text-gray-600 dark:text-gray-400">Total Gastos</p>
                    <p class="text-2xl font-bold text-gray-900 dark:text-white">
                        {formatearMoneda($resumenFinanzas.total_gastos)}
                    </p>
                </div>
                <TrendingDown class="w-8 h-8 text-red-600" />
            </div>
        </div>

        <!-- Balance -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border p-6">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm text-gray-600 dark:text-gray-400">Balance</p>
                    <p class="text-2xl font-bold {$resumenFinanzas.balance_neto >= 0 ? 'text-green-600' : 'text-red-600'}">
                        {formatearMoneda($resumenFinanzas.balance_neto)}
                    </p>
                </div>
                <DollarSign class="w-8 h-8 text-blue-600" />
            </div>
        </div>

        <!-- Movimientos -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border p-6">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm text-gray-600 dark:text-gray-400">Movimientos</p>
                    <p class="text-2xl font-bold text-gray-900 dark:text-white">
                        {$resumenFinanzas.total_movimientos}
                    </p>
                </div>
                <Receipt class="w-8 h-8 text-purple-600" />
            </div>
        </div>
    </div>

    <!-- Lista de Finanzas -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border">
        <div class="p-6 border-b">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                Movimientos Recientes ({$finanzasPersonales.length})
            </h3>
        </div>
        
        <div class="divide-y">
            {#if $cargandoFinanzas}
                <div class="p-6 text-center">
                    <div class="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
                    <p class="text-gray-500">Cargando finanzas...</p>
                </div>
            {:else if $finanzasPersonales.length === 0}
                <div class="p-6 text-center">
                    <Receipt class="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p class="text-gray-500">No hay finanzas registradas</p>
                    <p class="text-sm text-gray-400 mt-2">Los datos se cargan desde la tabla finanzas_personales</p>
                    <button 
                        on:click={abrirModalNuevo}
                        class="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                        Crear primer movimiento
                    </button>
                </div>
            {:else}
                {#each $finanzasPersonales as finanza}
                    <div class="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <div class="flex justify-between items-center">
                            <div class="flex-1">
                                <h4 class="font-medium text-gray-900 dark:text-white">
                                    {finanza.descripcion}
                                </h4>
                                <p class="text-sm text-gray-500">
                                    {finanza.fecha_gasto} • {finanza.tipo || 'gasto'}
                                    {#if finanza.metodo_pago}
                                        • {finanza.metodo_pago}
                                    {/if}
                                    {#if finanza.proveedor}
                                        • {finanza.proveedor}
                                    {/if}
                                </p>
                            </div>
                            
                            <div class="flex items-center space-x-3">
                                <span class="text-lg font-semibold {finanza.tipo === 'ingreso' ? 'text-green-600' : 'text-red-600'}">
                                    {finanza.tipo === 'ingreso' ? '+' : '-'}{formatearMoneda(Number(finanza.monto))}
                                </span>
                                
                                <div class="flex items-center space-x-1">
                                    <button
                                        on:click={() => editarFinanza(finanza)}
                                        class="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                        title="Editar"
                                    >
                                        <Edit3 class="w-4 h-4" />
                                    </button>
                                    <button
                                        on:click={() => eliminarFinanza(finanza.id || '', finanza.descripcion || 'Movimiento')}
                                        class="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                        title="Eliminar"
                                    >
                                        <Trash2 class="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                {/each}
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