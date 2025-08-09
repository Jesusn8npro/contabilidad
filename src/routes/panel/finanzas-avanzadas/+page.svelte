<script lang="ts">
    import { onMount } from 'svelte';
    import { browser } from '$app/environment';
    import { 
        TrendingUp, TrendingDown, DollarSign, AlertTriangle, 
        Calendar, BarChart3, PieChart, Target, ArrowUpRight,
        ArrowDownRight, Calculator, FileText, Download,
        Filter, RefreshCw, Zap, CreditCard
    } from 'lucide-svelte';
    
    // Estado
    let periodoSeleccionado = '12'; // meses
    let vistaActiva = 'flujo-caja'; // 'flujo-caja', 'proyecciones', 'analisis'
    let cargandoDatos = false;
    
    // Datos financieros simplificados
    const datosFinancieros = {
        flujoEfectivo: {
            actual: 15800000,
            proyectado: 18500000,
            diferencia: 17.1
        },
        ingresosMensuales: {
            actual: 45600000,
            proyectado: 52000000,
            crecimiento: 14.0
        },
        gastosMensuales: {
            actual: 32400000,
            proyectado: 35200000,
            incremento: 8.6
        },
        margenNeto: {
            actual: 28.9,
            objetivo: 35.0,
            diferencia: -6.1
        },
        liquidezIndice: {
            actual: 2.3,
            minimo: 1.5,
            estado: 'saludable'
        }
    };
    
    // Proyecciones financieras
    const proyeccionesFinancieras = [
        {
            periodo: 'Q1 2024',
            ingresos: 156000000,
            gastos: 108000000,
            utilidad: 48000000,
            margen: 30.8,
            confianza: 92
        },
        {
            periodo: 'Q2 2024',
            ingresos: 168000000,
            gastos: 115000000,
            utilidad: 53000000,
            margen: 31.5,
            confianza: 87
        },
        {
            periodo: 'Q3 2024',
            ingresos: 175000000,
            gastos: 119000000,
            utilidad: 56000000,
            margen: 32.0,
            confianza: 82
        },
        {
            periodo: 'Q4 2024',
            ingresos: 182000000,
            gastos: 124000000,
            utilidad: 58000000,
            margen: 31.9,
            confianza: 78
        }
    ];
    
    // Alertas financieras
    const alertasFinancieras = [
        {
            tipo: 'warning',
            titulo: 'Margen por debajo del objetivo',
            descripcion: 'El margen neto actual (28.9%) está 6.1 puntos por debajo del objetivo.',
            accion: 'Optimizar gastos operativos'
        },
        {
            tipo: 'info',
            titulo: 'Liquidez en rango saludable',
            descripcion: 'El índice de liquidez (2.3) está por encima del mínimo requerido.',
            accion: 'Considerar inversiones a corto plazo'
        },
        {
            tipo: 'success',
            titulo: 'Acelerar cobros',
            descripcion: 'Reducir plazo de 21 días promedio actual a 15 días.',
            accion: 'Acelerar cobros reduciendo plazo a 21 días'
        }
    ];
    
    // Recomendaciones
    const recomendaciones = [
        {
            icono: '💰',
            titulo: 'Optimizar gastos operativos',
            descripcion: 'Reducir gastos operativos en 8% para mejorar margen neto',
            impacto: 'Alto',
            prioridad: 'Alta'
        },
        {
            icono: '📈',
            titulo: 'Acelerar cobros',
            descripcion: 'Implementar descuentos por pronto pago para reducir días de cobro',
            impacto: 'Medio',
            prioridad: 'Media'
        },
        {
            icono: '🔄',
            titulo: 'Diversificar ingresos',
            descripcion: 'Desarrollar nuevos productos/servicios con mayor margen',
            impacto: 'Alto',
            prioridad: 'Baja'
        },
        {
            icono: '🤖',
            titulo: 'Análisis con IA',
            descripcion: 'Utilizar inteligencia artificial para detectar patrones y optimizaciones',
            impacto: 'Medio',
            prioridad: 'Media'
        }
    ];
    
    function formatearMoneda(valor: number): string {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
            notation: 'compact'
        }).format(valor);
    }
    
    function formatearPorcentaje(valor: number): string {
        return `${valor.toFixed(1)}%`;
    }
    
    function obtenerColorTendencia(valor: number): string {
        return valor > 0 ? 'text-green-600' : 'text-red-600';
    }
    
    async function exportarReporte() {
        if (!browser) return;
        
        cargandoDatos = true;
        
        try {
            // Simular generación de reporte
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            console.log('📊 Generando reporte financiero avanzado...');
            
            // Simular descarga
            const contenidoReporte = `
REPORTE FINANCIERO AVANZADO
===========================

Flujo de Efectivo: ${formatearMoneda(datosFinancieros.flujoEfectivo.actual)}
Ingresos Mensuales: ${formatearMoneda(datosFinancieros.ingresosMensuales.actual)}
Gastos Mensuales: ${formatearMoneda(datosFinancieros.gastosMensuales.actual)}
Margen Neto: ${formatearPorcentaje(datosFinancieros.margenNeto.actual)}

PROYECCIONES 2024
==================
${proyeccionesFinancieras.map(p => 
    `${p.periodo}: Ingresos ${formatearMoneda(p.ingresos)}, Utilidad ${formatearMoneda(p.utilidad)}`
).join('\n')}

Generado el: ${new Date().toLocaleString('es-CO')}
            `;
            
            const blob = new Blob([contenidoReporte], { type: 'text/plain;charset=utf-8' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `reporte-financiero-${new Date().toISOString().split('T')[0]}.txt`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            alert('📊 Reporte exportado exitosamente');
            
        } catch (error) {
            console.error('Error exportando reporte:', error);
            alert('Error al exportar el reporte');
        } finally {
            cargandoDatos = false;
        }
    }
    
    onMount(() => {
        console.log('📊 Finanzas avanzadas cargadas');
        cargandoDatos = true;
        setTimeout(() => {
            cargandoDatos = false;
        }, 1000);
    });
</script>

<svelte:head>
    <title>Finanzas Avanzadas - App Contabilidad</title>
</svelte:head>

<div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <BarChart3 class="w-8 h-8 text-blue-600" />
                Finanzas Avanzadas
            </h1>
            <p class="text-gray-600 dark:text-gray-400 mt-1">
                Análisis profundo, proyecciones y control financiero inteligente
            </p>
        </div>
        
        <div class="flex items-center space-x-4 mt-4 lg:mt-0">
            <select 
                bind:value={periodoSeleccionado}
                class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
            >
                <option value="3">Últimos 3 meses</option>
                <option value="6">Últimos 6 meses</option>
                <option value="12">Último año</option>
                <option value="24">Últimos 2 años</option>
            </select>
            
            <button 
                class="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={cargandoDatos}
            >
                <RefreshCw class="w-4 h-4" />
                <span>Actualizar</span>
            </button>
            
            <button 
                on:click={exportarReporte}
                disabled={cargandoDatos}
                class="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
                <Download class="w-4 h-4" />
                <span>{cargandoDatos ? 'Generando...' : 'Exportar'}</span>
            </button>
        </div>
    </div>
    
    <!-- Navegación de Pestañas -->
    <div class="border-b border-gray-200 dark:border-gray-700">
        <nav class="flex space-x-8">
            <button
                class="py-2 px-1 border-b-2 font-medium text-sm {vistaActiva === 'flujo-caja' 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}"
                on:click={() => vistaActiva = 'flujo-caja'}
            >
                <DollarSign class="w-4 h-4 inline mr-2" />
                Flujo de Caja
            </button>
            <button
                class="py-2 px-1 border-b-2 font-medium text-sm {vistaActiva === 'proyecciones' 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}"
                on:click={() => vistaActiva = 'proyecciones'}
            >
                <TrendingUp class="w-4 h-4 inline mr-2" />
                Proyecciones
            </button>
            <button
                class="py-2 px-1 border-b-2 font-medium text-sm {vistaActiva === 'analisis' 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}"
                on:click={() => vistaActiva = 'analisis'}
            >
                <Calculator class="w-4 h-4 inline mr-2" />
                Análisis Ratios
            </button>
        </nav>
    </div>

    <!-- KPIs Principales -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- Flujo de Efectivo -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm text-gray-600 dark:text-gray-400">Flujo de Efectivo</p>
                    <p class="text-2xl font-bold text-gray-900 dark:text-white">
                        {formatearMoneda(datosFinancieros.flujoEfectivo.actual)}
                    </p>
                    <p class="text-sm {obtenerColorTendencia(datosFinancieros.flujoEfectivo.diferencia)}">
                        <ArrowUpRight class="w-4 h-4 inline" />
                        +{formatearPorcentaje(datosFinancieros.flujoEfectivo.diferencia)} vs objetivo
                    </p>
                </div>
                <div class="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                    <DollarSign class="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
            </div>
        </div>

        <!-- Ingresos Mensuales -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm text-gray-600 dark:text-gray-400">Ingresos Mensuales</p>
                    <p class="text-2xl font-bold text-gray-900 dark:text-white">
                        {formatearMoneda(datosFinancieros.ingresosMensuales.actual)}
                    </p>
                    <p class="text-sm {obtenerColorTendencia(datosFinancieros.ingresosMensuales.crecimiento)}">
                        <TrendingUp class="w-4 h-4 inline" />
                        +{formatearPorcentaje(datosFinancieros.ingresosMensuales.crecimiento)} crecimiento
                    </p>
                </div>
                <div class="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                    <TrendingUp class="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
            </div>
        </div>

        <!-- Margen Neto -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm text-gray-600 dark:text-gray-400">Margen Neto</p>
                    <p class="text-2xl font-bold text-gray-900 dark:text-white">
                        {formatearPorcentaje(datosFinancieros.margenNeto.actual)}
                    </p>
                    <p class="text-sm {obtenerColorTendencia(datosFinancieros.margenNeto.diferencia)}">
                        <ArrowDownRight class="w-4 h-4 inline" />
                        {formatearPorcentaje(datosFinancieros.margenNeto.diferencia)} vs objetivo
                    </p>
                </div>
                <div class="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                    <Target class="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
            </div>
        </div>

        <!-- Índice de Liquidez -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm text-gray-600 dark:text-gray-400">Índice de Liquidez</p>
                    <p class="text-2xl font-bold text-gray-900 dark:text-white">
                        {datosFinancieros.liquidezIndice.actual}
                    </p>
                    <p class="text-sm text-green-600">
                        <span class="inline-block w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                        {datosFinancieros.liquidezIndice.estado}
                    </p>
                </div>
                <div class="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                    <Zap class="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
            </div>
        </div>
    </div>

    <!-- Content based on active tab -->
    {#if vistaActiva === 'flujo-caja'}
        <!-- Flujo de Caja Content -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Gráfico de Flujo de Caja Placeholder -->
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Flujo de Caja - {periodoSeleccionado} meses
                </h3>
                <div class="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div class="text-center">
                        <BarChart3 class="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p class="text-gray-500">Gráfico de flujo de caja</p>
                        <p class="text-sm text-gray-400">Próximamente con Chart.js</p>
                    </div>
                </div>
            </div>

            <!-- Alertas Financieras -->
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    <AlertTriangle class="w-5 h-5 inline mr-2" />
                    Alertas Financieras
                </h3>
                <div class="space-y-4">
                    {#each alertasFinancieras as alerta}
                        <div class="p-4 rounded-lg border-l-4 {
                            alerta.tipo === 'warning' ? 'bg-yellow-50 border-yellow-400' :
                            alerta.tipo === 'success' ? 'bg-green-50 border-green-400' :
                            'bg-blue-50 border-blue-400'
                        }">
                            <h4 class="font-medium text-gray-900">{alerta.titulo}</h4>
                            <p class="text-sm text-gray-600 mt-1">{alerta.descripcion}</p>
                            <p class="text-xs text-gray-500 mt-2 font-medium">{alerta.accion}</p>
                        </div>
                    {/each}
                </div>
            </div>
        </div>
    {/if}

    {#if vistaActiva === 'proyecciones'}
        <!-- Proyecciones Content -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Proyecciones Financieras 2024
            </h3>
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead class="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Período
                            </th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Ingresos
                            </th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Gastos
                            </th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Utilidad
                            </th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Margen
                            </th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Confianza
                            </th>
                        </tr>
                    </thead>
                    <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {#each proyeccionesFinancieras as proyeccion}
                            <tr>
                                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                    {proyeccion.periodo}
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                    {formatearMoneda(proyeccion.ingresos)}
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                    {formatearMoneda(proyeccion.gastos)}
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                                    {formatearMoneda(proyeccion.utilidad)}
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                    {formatearPorcentaje(proyeccion.margen)}
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <div class="flex items-center">
                                        <div class="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                            <div class="bg-green-600 h-2 rounded-full" style="width: {proyeccion.confianza}%"></div>
                                        </div>
                                        <span class="text-sm text-gray-900 dark:text-white">{proyeccion.confianza}%</span>
                                    </div>
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        </div>
    {/if}

    {#if vistaActiva === 'analisis'}
        <!-- Análisis y Recomendaciones -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Recomendaciones IA -->
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    🤖 Recomendaciones IA
                </h3>
                <div class="space-y-4">
                    {#each recomendaciones as recomendacion}
                        <div class="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                            <div class="flex items-start space-x-3">
                                <span class="text-2xl">{recomendacion.icono}</span>
                                <div class="flex-1">
                                    <h4 class="font-medium text-gray-900 dark:text-white">
                                        {recomendacion.titulo}
                                    </h4>
                                    <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                        {recomendacion.descripcion}
                                    </p>
                                    <div class="flex items-center space-x-4 mt-2">
                                        <span class="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                                            Impacto: {recomendacion.impacto}
                                        </span>
                                        <span class="text-xs px-2 py-1 bg-orange-100 text-orange-800 rounded-full">
                                            Prioridad: {recomendacion.prioridad}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    {/each}
                </div>
            </div>

            <!-- Ratios Financieros -->
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    📊 Ratios Clave
                </h3>
                <div class="space-y-4">
                    <div class="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <span class="text-sm font-medium text-gray-700 dark:text-gray-300">ROE (Rentabilidad)</span>
                        <span class="text-lg font-bold text-green-600">24.5%</span>
                    </div>
                    <div class="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <span class="text-sm font-medium text-gray-700 dark:text-gray-300">ROA (Activos)</span>
                        <span class="text-lg font-bold text-blue-600">18.3%</span>
                    </div>
                    <div class="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Rotación Activos</span>
                        <span class="text-lg font-bold text-purple-600">1.8x</span>
                    </div>
                    <div class="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Cobertura Intereses</span>
                        <span class="text-lg font-bold text-orange-600">12.5x</span>
                    </div>
                </div>
            </div>
        </div>
    {/if}
</div> 