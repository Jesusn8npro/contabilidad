<script lang="ts">
    import { onMount } from 'svelte';
    import { 
        FileText, Download, Filter, Calendar, 
        BarChart3, TrendingUp, DollarSign, Users,
        Package, CreditCard, Target, Eye
    } from 'lucide-svelte';
    
    let tipoReporte = 'ventas';
    let periodoReporte = '30';
    let formatoExportacion = 'pdf';
    let fechaInicio = '';
    let fechaFin = '';
    
    // Datos simulados para reportes
    const reportesDisponibles = [
        {
            id: 'ventas',
            nombre: 'Reporte de Ventas',
            descripcion: 'Análisis completo de ventas por período',
            icono: BarChart3,
            color: 'blue',
            datos: {
                total: 15680000,
                transacciones: 156,
                promedio: 100513,
                crecimiento: 23.5
            }
        },
        {
            id: 'clientes',
            nombre: 'Reporte de Clientes',
            descripcion: 'Estado y análisis de la cartera de clientes',
            icono: Users,
            color: 'green',
            datos: {
                total: 89,
                activos: 67,
                nuevos: 12,
                retencion: 85.2
            }
        },
        {
            id: 'inventario',
            nombre: 'Reporte de Inventario',
            descripcion: 'Estado actual del inventario y movimientos',
            icono: Package,
            color: 'purple',
            datos: {
                productos: 234,
                valor: 8945000,
                stockBajo: 15,
                rotacion: 4.2
            }
        },
        {
            id: 'financiero',
            nombre: 'Reporte Financiero',
            descripcion: 'Estado financiero y análisis de rentabilidad',
            icono: DollarSign,
            color: 'emerald',
            datos: {
                ingresos: 18560000,
                gastos: 12340000,
                utilidad: 6220000,
                margen: 33.5
            }
        }
    ];
    
    $: reporteSeleccionado = reportesDisponibles.find(r => r.id === tipoReporte);
    
    function formatearMoneda(valor: number): string {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(valor);
    }
    
    function generarReporte() {
        alert(`Generando reporte de ${reporteSeleccionado?.nombre}\nPeríodo: ${periodoReporte} días\nFormato: ${formatoExportacion.toUpperCase()}`);
    }
    
    function exportarReporte(formato: string) {
        alert(`Exportando reporte en formato ${formato.toUpperCase()}`);
    }
    
    onMount(() => {
        // Establecer fechas por defecto
        const hoy = new Date();
        const hace30Dias = new Date();
        hace30Dias.setDate(hoy.getDate() - 30);
        
        fechaFin = hoy.toISOString().split('T')[0];
        fechaInicio = hace30Dias.toISOString().split('T')[0];
    });
</script>

<div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <FileText class="w-8 h-8 text-blue-600" />
                Centro de Reportes
            </h1>
            <p class="text-gray-600 dark:text-gray-400 mt-1">
                Genera reportes detallados para analizar tu negocio
            </p>
        </div>
        
        <div class="flex items-center space-x-4 mt-4 lg:mt-0">
            <button 
                on:click={generarReporte}
                class="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
                <Download class="w-4 h-4" />
                <span>Generar Reporte</span>
            </button>
        </div>
    </div>
    
    <!-- Filtros y Configuración -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Filter class="w-5 h-5" />
            Configuración del Reporte
        </h2>
        
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <!-- Tipo de Reporte -->
            <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tipo de Reporte
                </label>
                <select 
                    bind:value={tipoReporte}
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
                >
                    {#each reportesDisponibles as reporte}
                        <option value={reporte.id}>{reporte.nombre}</option>
                    {/each}
                </select>
            </div>
            
            <!-- Período -->
            <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Período
                </label>
                <select 
                    bind:value={periodoReporte}
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
                >
                    <option value="7">Últimos 7 días</option>
                    <option value="30">Últimos 30 días</option>
                    <option value="90">Últimos 3 meses</option>
                    <option value="365">Último año</option>
                    <option value="custom">Personalizado</option>
                </select>
            </div>
            
            <!-- Formato -->
            <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Formato
                </label>
                <select 
                    bind:value={formatoExportacion}
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
                >
                    <option value="pdf">PDF</option>
                    <option value="excel">Excel</option>
                    <option value="csv">CSV</option>
                </select>
            </div>
            
            <!-- Acción -->
            <div class="flex items-end">
                <button 
                    on:click={generarReporte}
                    class="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                    <Eye class="w-4 h-4" />
                    Vista Previa
                </button>
            </div>
        </div>
        
        <!-- Fechas Personalizadas -->
        {#if periodoReporte === 'custom'}
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Fecha Inicio
                    </label>
                    <input 
                        type="date" 
                        bind:value={fechaInicio}
                        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
                    />
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Fecha Fin
                    </label>
                    <input 
                        type="date" 
                        bind:value={fechaFin}
                        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
                    />
                </div>
            </div>
        {/if}
    </div>
    
    <!-- Vista Previa del Reporte -->
    {#if reporteSeleccionado}
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div class="flex items-center justify-between mb-6">
                <div class="flex items-center gap-3">
                    <div class="p-2 bg-{reporteSeleccionado.color}-100 dark:bg-{reporteSeleccionado.color}-900/30 rounded-lg">
                        <svelte:component this={reporteSeleccionado.icono} class="w-6 h-6 text-{reporteSeleccionado.color}-600" />
                    </div>
                    <div>
                        <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
                            {reporteSeleccionado.nombre}
                        </h3>
                        <p class="text-gray-600 dark:text-gray-400">
                            {reporteSeleccionado.descripcion}
                        </p>
                    </div>
                </div>
                
                <div class="flex space-x-2">
                    <button 
                        on:click={() => exportarReporte('pdf')}
                        class="px-3 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors text-sm"
                    >
                        PDF
                    </button>
                    <button 
                        on:click={() => exportarReporte('excel')}
                        class="px-3 py-2 text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-sm"
                    >
                        Excel
                    </button>
                    <button 
                        on:click={() => exportarReporte('csv')}
                        class="px-3 py-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-sm"
                    >
                        CSV
                    </button>
                </div>
            </div>
            
            <!-- Métricas Clave -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {#if tipoReporte === 'ventas'}
                    <div class="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p class="text-2xl font-bold text-blue-600">{formatearMoneda(reporteSeleccionado.datos.total)}</p>
                        <p class="text-sm text-gray-600 dark:text-gray-400">Ventas Totales</p>
                    </div>
                    <div class="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <p class="text-2xl font-bold text-green-600">{reporteSeleccionado.datos.transacciones}</p>
                        <p class="text-sm text-gray-600 dark:text-gray-400">Transacciones</p>
                    </div>
                    <div class="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <p class="text-2xl font-bold text-purple-600">{formatearMoneda(reporteSeleccionado.datos.promedio)}</p>
                        <p class="text-sm text-gray-600 dark:text-gray-400">Promedio</p>
                    </div>
                    <div class="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                        <p class="text-2xl font-bold text-orange-600">+{reporteSeleccionado.datos.crecimiento}%</p>
                        <p class="text-sm text-gray-600 dark:text-gray-400">Crecimiento</p>
                    </div>
                {:else if tipoReporte === 'clientes'}
                    <div class="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p class="text-2xl font-bold text-blue-600">{reporteSeleccionado.datos.total}</p>
                        <p class="text-sm text-gray-600 dark:text-gray-400">Total Clientes</p>
                    </div>
                    <div class="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <p class="text-2xl font-bold text-green-600">{reporteSeleccionado.datos.activos}</p>
                        <p class="text-sm text-gray-600 dark:text-gray-400">Activos</p>
                    </div>
                    <div class="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <p class="text-2xl font-bold text-purple-600">{reporteSeleccionado.datos.nuevos}</p>
                        <p class="text-sm text-gray-600 dark:text-gray-400">Nuevos</p>
                    </div>
                    <div class="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                        <p class="text-2xl font-bold text-orange-600">{reporteSeleccionado.datos.retencion}%</p>
                        <p class="text-sm text-gray-600 dark:text-gray-400">Retención</p>
                    </div>
                {:else if tipoReporte === 'inventario'}
                    <div class="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p class="text-2xl font-bold text-blue-600">{reporteSeleccionado.datos.productos}</p>
                        <p class="text-sm text-gray-600 dark:text-gray-400">Productos</p>
                    </div>
                    <div class="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <p class="text-2xl font-bold text-green-600">{formatearMoneda(reporteSeleccionado.datos.valor)}</p>
                        <p class="text-sm text-gray-600 dark:text-gray-400">Valor Total</p>
                    </div>
                    <div class="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <p class="text-2xl font-bold text-red-600">{reporteSeleccionado.datos.stockBajo}</p>
                        <p class="text-sm text-gray-600 dark:text-gray-400">Stock Bajo</p>
                    </div>
                    <div class="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                        <p class="text-2xl font-bold text-orange-600">{reporteSeleccionado.datos.rotacion}x</p>
                        <p class="text-sm text-gray-600 dark:text-gray-400">Rotación</p>
                    </div>
                {:else}
                    <div class="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <p class="text-2xl font-bold text-green-600">{formatearMoneda(reporteSeleccionado.datos.ingresos)}</p>
                        <p class="text-sm text-gray-600 dark:text-gray-400">Ingresos</p>
                    </div>
                    <div class="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <p class="text-2xl font-bold text-red-600">{formatearMoneda(reporteSeleccionado.datos.gastos)}</p>
                        <p class="text-sm text-gray-600 dark:text-gray-400">Gastos</p>
                    </div>
                    <div class="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p class="text-2xl font-bold text-blue-600">{formatearMoneda(reporteSeleccionado.datos.utilidad)}</p>
                        <p class="text-sm text-gray-600 dark:text-gray-400">Utilidad</p>
                    </div>
                    <div class="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <p class="text-2xl font-bold text-purple-600">{reporteSeleccionado.datos.margen}%</p>
                        <p class="text-sm text-gray-600 dark:text-gray-400">Margen</p>
                    </div>
                {/if}
            </div>
            
            <!-- Tabla de Datos Simulada -->
            <div class="overflow-x-auto">
                <table class="min-w-full">
                    <thead class="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Fecha
                            </th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Concepto
                            </th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Cantidad
                            </th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Valor
                            </th>
                        </tr>
                    </thead>
                    <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        <tr>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                2024-01-15
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                Venta Acordeón Profesional
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                2
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                $5,000,000
                            </td>
                        </tr>
                        <tr>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                2024-01-14
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                Curso de Vallenato
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                5
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                $750,000
                            </td>
                        </tr>
                        <tr>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                2024-01-13
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                Reparación Instrumento
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                3
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                $600,000
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    {/if}
    
    <!-- Reportes Rápidos -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {#each reportesDisponibles as reporte}
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
                <div class="flex items-center justify-between mb-4">
                    <div class="p-2 bg-{reporte.color}-100 dark:bg-{reporte.color}-900/30 rounded-lg">
                        <svelte:component this={reporte.icono} class="w-6 h-6 text-{reporte.color}-600" />
                    </div>
                    <Target class="w-4 h-4 text-gray-400" />
                </div>
                
                <h3 class="font-semibold text-gray-900 dark:text-white mb-2">
                    {reporte.nombre}
                </h3>
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {reporte.descripcion}
                </p>
                
                <button 
                    on:click={() => {tipoReporte = reporte.id; generarReporte();}}
                    class="w-full px-4 py-2 bg-{reporte.color}-600 text-white rounded-lg hover:bg-{reporte.color}-700 transition-colors text-sm"
                >
                    Generar Ahora
                </button>
            </div>
        {/each}
    </div>
</div> 