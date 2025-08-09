<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { BarChart3, TrendingUp } from 'lucide-svelte';
    
    export let movimientos: any[] = [];
    
    // Procesar datos reales
    $: ingresosMensuales = movimientos?.filter(m => m.tipo_movimiento === 'ingreso')?.reduce((sum, m) => sum + m.monto, 0) || 0;
    $: gastosMensuales = movimientos?.filter(m => m.tipo_movimiento === 'gasto')?.reduce((sum, m) => sum + m.monto, 0) || 0;
    $: utilidadMensual = ingresosMensuales - gastosMensuales;
    
    // Datos para el gráfico simple
    $: datosGrafico = [
        { label: 'Ingresos', valor: ingresosMensuales, color: 'bg-green-500' },
        { label: 'Gastos', valor: gastosMensuales, color: 'bg-red-500' },
        { label: 'Utilidad', valor: utilidadMensual, color: utilidadMensual >= 0 ? 'bg-blue-500' : 'bg-orange-500' }
    ];
    
    const formatearMoneda = (valor: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(valor);
    };
</script>

<div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
    <div class="flex items-center justify-between mb-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <BarChart3 class="w-5 h-5 mr-2 text-blue-500" />
            Resumen Financiero
        </h3>
        <span class="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full text-sm font-medium">
            Este Mes
        </span>
    </div>
    
    <!-- Gráfico de barras simple -->
    <div class="space-y-4">
        {#each datosGrafico as item}
            <div class="space-y-2">
                <div class="flex items-center justify-between">
                    <span class="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {item.label}
                    </span>
                    <span class="text-sm font-bold text-gray-900 dark:text-white">
                        {formatearMoneda(item.valor)}
                    </span>
                </div>
                
                <!-- Barra de progreso -->
                <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                    <div 
                        class="h-full {item.color} rounded-full transition-all duration-1000 ease-out"
                        style="width: {Math.max(Math.abs(item.valor) / Math.max(ingresosMensuales, gastosMensuales, Math.abs(utilidadMensual)) * 100, 5)}%"
                    ></div>
                </div>
            </div>
        {/each}
    </div>
    
    <!-- Estadísticas adicionales -->
    <div class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div class="grid grid-cols-2 gap-4">
            <div class="text-center">
                <div class="text-2xl font-bold text-gray-900 dark:text-white">
                    {movimientos?.filter(m => m.tipo_movimiento === 'ingreso')?.length || 0}
                </div>
                <div class="text-sm text-green-600 dark:text-green-400">
                    Ingresos registrados
                </div>
            </div>
            <div class="text-center">
                <div class="text-2xl font-bold text-gray-900 dark:text-white">
                    {movimientos?.filter(m => m.tipo_movimiento === 'gasto')?.length || 0}
                </div>
                <div class="text-sm text-red-600 dark:text-red-400">
                    Gastos registrados
                </div>
            </div>
        </div>
        
        {#if utilidadMensual >= 0}
            <div class="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center">
                <TrendingUp class="w-5 h-5 text-green-500 mr-2" />
                <span class="text-sm text-green-700 dark:text-green-300">
                    ¡Excelente! Tienes utilidades este mes
                </span>
            </div>
        {:else}
            <div class="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-center">
                <TrendingUp class="w-5 h-5 text-red-500 mr-2 rotate-180" />
                <span class="text-sm text-red-700 dark:text-red-300">
                    Atención: Los gastos superan los ingresos
                </span>
            </div>
        {/if}
    </div>
</div> 