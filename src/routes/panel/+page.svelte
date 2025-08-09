<script lang="ts">
    import { onMount } from 'svelte';
    import { derived } from 'svelte/store';
    import { 
        BarChart3, TrendingUp, DollarSign, Users, Package, 
        AlertTriangle, Calendar, Target, ArrowUpRight, ArrowDownRight,
        CreditCard, PieChart, Activity, Bell, Zap, Briefcase, CheckCircle
    } from 'lucide-svelte';
    
    // Stores
    import { negocioActual, negocios } from '$lib/stores/negocios';
    
    // Stores
    import { productos, estadisticasInventario } from '$lib/stores/inventario';
    import { clientes, estadisticasClientes } from '$lib/stores/clientes';
    import { movimientos, estadisticasFinancieras } from '$lib/stores/movimientos';
    
    // Componentes
    import TarjetaKPI from '$lib/componentes/dashboard/TarjetaKPI.svelte';
    import GraficoVentas from '$lib/componentes/dashboard/GraficoVentas.svelte';
    import GraficoDonut from '$lib/componentes/dashboard/GraficoDonut.svelte';
    import AlertasDashboard from '$lib/componentes/dashboard/AlertasDashboard.svelte';
    import ResumenFinanciero from '$lib/componentes/dashboard/ResumenFinanciero.svelte';
    import TopProductos from '$lib/componentes/dashboard/TopProductos.svelte';
    import TopClientes from '$lib/componentes/dashboard/TopClientes.svelte';
    
    // Estado local
    let periodoSeleccionado = '30'; // días
    let cargandoDashboard = true;
    
    // KPIs calculados
    $: kpisPrincipales = {
        ingresosTotales: $estadisticasFinancieras?.ingresosTotales || 0,
        gastosTotales: $estadisticasFinancieras?.gastosTotales || 0,
        utilidadNeta: ($estadisticasFinancieras?.ingresosTotales || 0) - ($estadisticasFinancieras?.gastosTotales || 0),
        totalClientes: $estadisticasClientes?.total_clientes || 0,
        totalProductos: $estadisticasInventario?.total_productos || 0,
        ventasHoy: $estadisticasFinancieras?.ventasHoy || 0,
        crecimientoMensual: $estadisticasFinancieras?.crecimientoMensual || 0,
        margenPromedio: $estadisticasFinancieras?.margenPromedio || 0
    };
    
    // Alertas inteligentes
    $: alertasInteligentes = [
        ...(($estadisticasInventario?.productos_stock_bajo || 0) > 0 ? [{
            tipo: 'warning' as const,
            titulo: 'Stock Bajo',
            mensaje: `${$estadisticasInventario.productos_stock_bajo} productos necesitan reabastecimiento`,
            accion: 'Ver Inventario'
        }] : []),
        ...(kpisPrincipales.utilidadNeta < 0 ? [{
            tipo: 'error' as const,
            titulo: 'Pérdidas Detectadas',
            mensaje: 'Los gastos superan los ingresos este mes',
            accion: 'Revisar Finanzas'
        }] : []),
        ...(kpisPrincipales.crecimientoMensual > 20 ? [{
            tipo: 'success' as const,
            titulo: '¡Crecimiento Excepcional!',
            mensaje: `Crecimiento del ${kpisPrincipales.crecimientoMensual}% este mes`,
            accion: 'Ver Detalles'
        }] : [])
    ];
    
    onMount(async () => {
        // Cargar datos del dashboard
        if ($negocioActual) {
            await Promise.all([
                cargarDatosDashboard(),
                cargarEstadisticasFinancieras(),
                cargarAlertas()
            ]);
        }
        cargandoDashboard = false;
        
        // Escuchar eventos de cambio de página
        const handlePageChange = () => {
            console.log('🔄 Página cambiada, invalidando datos...');
            // Forzar recarga de datos cuando cambie la página
            if (typeof window !== 'undefined') {
                setTimeout(() => {
                    window.location.reload();
                }, 100);
            }
        };
        
        if (typeof window !== 'undefined') {
            window.addEventListener('page-changed', handlePageChange);
            
            // Cleanup
            return () => {
                window.removeEventListener('page-changed', handlePageChange);
            };
        }
    });
    
    async function cargarDatosDashboard() {
        // Implementar carga de datos según el período seleccionado
        console.log('📊 Cargando dashboard para período:', periodoSeleccionado);
    }
    
    async function cargarEstadisticasFinancieras() {
        // Implementar carga de estadísticas financieras
        console.log('💰 Cargando estadísticas financieras');
    }
    
    async function cargarAlertas() {
        // Implementar carga de alertas inteligentes
        console.log('🔔 Cargando alertas inteligentes');
    }
</script>

<div class="space-y-6">
    <!-- Header del Dashboard -->
    <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
                Centro de Comando - TEST
            </h1>
            <p class="text-gray-600 dark:text-gray-400 mt-1">
                {$negocioActual?.nombre || 'Panel de Control Empresarial'}
            </p>
        </div>
        
        <div class="flex items-center space-x-4 mt-4 lg:mt-0">
            <select 
                bind:value={periodoSeleccionado}
                class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
            >
                <option value="7">Últimos 7 días</option>
                <option value="30">Últimos 30 días</option>
                <option value="90">Últimos 3 meses</option>
                <option value="365">Último año</option>
            </select>
            
            <button class="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Activity class="w-4 h-4" />
                <span>Tiempo Real</span>
            </button>
        </div>
    </div>
    
    <!-- KPIs Principales - Versión Simple -->
    {#if !cargandoDashboard}
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <TarjetaKPI
                titulo="Ingresos Totales"
                valor={kpisPrincipales.ingresosTotales}
                tipo="moneda"
                tendencia={kpisPrincipales.crecimientoMensual > 0 ? 'up' : 'down'}
                porcentaje={kpisPrincipales.crecimientoMensual}
                icono={DollarSign}
                color="green"
            />
            
            <TarjetaKPI
                titulo="Utilidad Neta"
                valor={kpisPrincipales.utilidadNeta}
                tipo="moneda"
                tendencia={kpisPrincipales.utilidadNeta > 0 ? 'up' : 'down'}
                porcentaje={kpisPrincipales.margenPromedio}
                icono={TrendingUp}
                color={kpisPrincipales.utilidadNeta > 0 ? 'green' : 'red'}
            />
            
            <TarjetaKPI
                titulo="Total Clientes"
                valor={kpisPrincipales.totalClientes}
                tipo="numero"
                tendencia="up"
                porcentaje={15}
                icono={Users}
                color="blue"
            />
            
            <TarjetaKPI
                titulo="Ventas Hoy"
                valor={kpisPrincipales.ventasHoy}
                tipo="moneda"
                tendencia="up"
                porcentaje={8}
                icono={BarChart3}
                color="purple"
            />
        </div>

        <!-- Alertas Inteligentes -->
        {#if alertasInteligentes.length > 0}
            <AlertasDashboard {alertasInteligentes} />
        {/if}
        
        <!-- Gráficos Principales -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Gráfico de Ventas -->
            <div class="lg:col-span-2">
                <GraficoVentas {periodoSeleccionado} />
            </div>
            
            <!-- Distribución por Categorías -->
            <div>
                <GraficoDonut 
                    titulo="Ventas por Categoría"
                    datos={[
                        { label: 'Productos', value: 65, color: '#3B82F6' },
                        { label: 'Servicios', value: 25, color: '#10B981' },
                        { label: 'Cursos', value: 10, color: '#F59E0B' }
                    ]}
                />
            </div>
        </div>
        
        <!-- Widgets de Información -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Resumen Financiero -->
            <ResumenFinanciero />
            
            <!-- Top Productos -->
            <TopProductos />
        </div>
        
        <!-- Información Adicional -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Top Clientes -->
            <TopClientes />
            
            <!-- Métricas Avanzadas -->
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Target class="w-5 h-5" />
                    Métricas de Negocio
                </h3>
                
                <div class="space-y-4">
                    <div class="flex justify-between items-center">
                        <span class="text-gray-600 dark:text-gray-400">Margen Promedio</span>
                        <span class="font-semibold text-green-600">{kpisPrincipales.margenPromedio}%</span>
                    </div>
                    
                    <div class="flex justify-between items-center">
                        <span class="text-gray-600 dark:text-gray-400">Rotación Inventario</span>
                        <span class="font-semibold text-blue-600">12x/año</span>
                    </div>
                    
                    <div class="flex justify-between items-center">
                        <span class="text-gray-600 dark:text-gray-400">Tiempo Promedio Cobro</span>
                        <span class="font-semibold text-purple-600">15 días</span>
                    </div>
                    
                    <div class="flex justify-between items-center">
                        <span class="text-gray-600 dark:text-gray-400">ROI Mensual</span>
                        <span class="font-semibold text-emerald-600">24%</span>
                    </div>
                </div>
            </div>
        </div>
    {:else}
        <div class="flex items-center justify-center py-12">
            <div class="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
            <span class="ml-3 text-gray-600 dark:text-gray-400">Cargando dashboard...</span>
        </div>
    {/if}
</div>

<style>
    /* Asegurar que no hay conflictos de CSS */
    :global(.space-y-6 > *) {
        margin-top: 0;
    }
    
    :global(.space-y-6 > * + *) {
        margin-top: 1.5rem;
    }
</style> 