<script lang="ts">
    import { DollarSign, TrendingUp, TrendingDown, PieChart } from 'lucide-svelte';
    
    // Datos simulados del resumen financiero
    const resumenFinanciero = {
        ingresosMes: 12500000,
        gastosMes: 7200000,
        utilidadNeta: 5300000,
        margenGanancia: 42.4,
        flujoEfectivo: 3800000,
        cuentasPorCobrar: 2400000,
        cuentasPorPagar: 1800000,
        tendenciaIngreso: 'up',
        tendenciaGasto: 'down',
        proyeccionMes: 14200000
    };
    
    function formatearMoneda(valor: number): string {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(valor);
    }
</script>

<div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
    <div class="flex items-center justify-between mb-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <DollarSign class="w-5 h-5 text-green-500" />
            Resumen Financiero
        </h3>
        <span class="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full text-xs font-medium">
            Este Mes
        </span>
    </div>
    
    <div class="space-y-4">
        <!-- Ingresos vs Gastos -->
        <div class="grid grid-cols-2 gap-4">
            <div class="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-4">
                <div class="flex items-center justify-between mb-2">
                    <span class="text-sm font-medium text-emerald-700 dark:text-emerald-300">Ingresos</span>
                    <TrendingUp class="w-4 h-4 text-emerald-600" />
                </div>
                <p class="text-xl font-bold text-emerald-800 dark:text-emerald-200">
                    {formatearMoneda(resumenFinanciero.ingresosMes)}
                </p>
                <p class="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                    +12.5% vs mes anterior
                </p>
            </div>
            
            <div class="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                <div class="flex items-center justify-between mb-2">
                    <span class="text-sm font-medium text-red-700 dark:text-red-300">Gastos</span>
                    <TrendingDown class="w-4 h-4 text-red-600" />
                </div>
                <p class="text-xl font-bold text-red-800 dark:text-red-200">
                    {formatearMoneda(resumenFinanciero.gastosMes)}
                </p>
                <p class="text-xs text-red-600 dark:text-red-400 mt-1">
                    -3.2% vs mes anterior
                </p>
            </div>
        </div>
        
        <!-- Utilidad Neta -->
        <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-medium text-blue-700 dark:text-blue-300">Utilidad Neta</span>
                <PieChart class="w-4 h-4 text-blue-600" />
            </div>
            <p class="text-2xl font-bold text-blue-800 dark:text-blue-200">
                {formatearMoneda(resumenFinanciero.utilidadNeta)}
            </p>
            <div class="flex items-center justify-between mt-2">
                <span class="text-xs text-blue-600 dark:text-blue-400">
                    Margen: {resumenFinanciero.margenGanancia}%
                </span>
                <span class="px-2 py-1 bg-blue-600 text-white rounded-full text-xs font-medium">
                    ↗ +18.7%
                </span>
            </div>
        </div>
        
        <!-- Métricas Adicionales -->
        <div class="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div>
                <span class="text-xs text-gray-500 dark:text-gray-400">Flujo de Efectivo</span>
                <p class="text-lg font-semibold text-gray-900 dark:text-white">
                    {formatearMoneda(resumenFinanciero.flujoEfectivo)}
                </p>
            </div>
            
            <div>
                <span class="text-xs text-gray-500 dark:text-gray-400">Por Cobrar</span>
                <p class="text-lg font-semibold text-gray-900 dark:text-white">
                    {formatearMoneda(resumenFinanciero.cuentasPorCobrar)}
                </p>
            </div>
            
            <div>
                <span class="text-xs text-gray-500 dark:text-gray-400">Por Pagar</span>
                <p class="text-lg font-semibold text-red-600 dark:text-red-400">
                    {formatearMoneda(resumenFinanciero.cuentasPorPagar)}
                </p>
            </div>
            
            <div>
                <span class="text-xs text-gray-500 dark:text-gray-400">Proyección</span>
                <p class="text-lg font-semibold text-green-600 dark:text-green-400">
                    {formatearMoneda(resumenFinanciero.proyeccionMes)}
                </p>
            </div>
        </div>
        
        <!-- Indicador de Salud Financiera -->
        <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Salud Financiera</span>
                <span class="text-sm font-bold text-green-600">Excelente</span>
            </div>
            <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div class="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full" style="width: 85%"></div>
            </div>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                85/100 puntos - Todas las métricas están en rango óptimo
            </p>
        </div>
    </div>
</div> 