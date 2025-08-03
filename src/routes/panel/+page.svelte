<script lang="ts">
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { estadisticasProyectos, cargarProyectos } from '$lib/stores/proyectos';
    import { estadisticasMovimientos, cargarMovimientos, cargarCategorias, categorias, crearMovimiento } from '$lib/stores/movimientos';
    import { cargarNegocios, negocios } from '$lib/stores/negocios';
    import { tareas, cargarTareas } from '$lib/stores/proyectos';
    import { perfilUsuario } from '$lib/stores/auth';
    import { supabase } from '$lib/supabase/cliente';
    import TarjetaEstadistica from '$lib/componentes/ui/TarjetaEstadistica.svelte';
    import GraficoLineas from '$lib/componentes/charts/GraficoLineas.svelte';
    import GraficoDona from '$lib/componentes/charts/GraficoDona.svelte';
    import Boton from '$lib/componentes/ui/Boton.svelte';
    import Cargando from '$lib/componentes/ui/Cargando.svelte';
    import Modal from '$lib/componentes/ui/Modal.svelte';
    import FormularioProyecto from '$lib/componentes/proyectos/FormularioProyecto.svelte';
    import FormularioNegocio from '$lib/componentes/negocios/FormularioNegocio.svelte';
    import FormularioMovimiento from '$lib/componentes/movimientos/FormularioMovimiento.svelte';
    import { 
        TrendingUp, 
        TrendingDown, 
        DollarSign, 
        Users, 
        BarChart3, 
        Calendar,
        Target,
        CreditCard,
        ArrowUpRight,
        ArrowDownRight,
        Briefcase,
        CheckCircle,
        Clock,
        AlertTriangle,
        ChevronRight,
        Plus,
        Sparkles,
        Zap
    } from 'lucide-svelte';

    // Estados de carga
    let cargandoDashboard = true;
    let estadisticasGenerales: any = null;

    // Estados de modales
    let mostrarModalProyecto = false;
    let mostrarModalMovimiento = false;
    let mostrarModalNegocio = false;
    let mostrarModalReportes = false;

    // Función para cargar datos del dashboard
    const cargarDashboard = async () => {
        try {
            cargandoDashboard = true;
            
            // Cargar todos los datos en paralelo
            await Promise.all([
                cargarProyectos(),
                cargarMovimientos(),
                cargarNegocios(),
                cargarCategorias(), // 🔥 AGREGAR CARGA DE CATEGORÍAS
                cargarTareas()
            ]);

        } catch (error) {
            console.error('Error cargando dashboard:', error);
        } finally {
            cargandoDashboard = false;
        }
    };

    // Función para obtener estadísticas generales
    const obtenerEstadisticasGenerales = async () => {
        try {
            const { data, error } = await supabase.rpc('obtener_estadisticas_dashboard');
            
            if (error) {
                console.error('Error obteniendo estadísticas:', error);
                // Fallback con datos de los stores
                estadisticasGenerales = {
                    ingresos_mes: 0,
                    gastos_mes: 0,
                    gastos_negocios_mes: 0,
                    tareas_pendientes: 0,
                    tareas_completadas_hoy: 0,
                    campanas_activas: 0,
                    notificaciones_no_leidas: 0
                };
                return;
            }

            estadisticasGenerales = data || {
                ingresos_mes: 0,
                gastos_mes: 0,
                gastos_negocios_mes: 0,
                tareas_pendientes: 0,
                tareas_completadas_hoy: 0,
                campanas_activas: 0,
                notificaciones_no_leidas: 0
            };
        } catch (error) {
            console.error('Error en obtenerEstadisticasGenerales:', error);
            estadisticasGenerales = {
                ingresos_mes: 0,
                gastos_mes: 0,
                gastos_negocios_mes: 0,
                tareas_pendientes: 0,
                tareas_completadas_hoy: 0,
                campanas_activas: 0,
                notificaciones_no_leidas: 0
            };
        }
    };

    // Funciones de formateo
    const formatearMoneda = (valor: number): string => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(valor);
    };

    const calcularCambio = (actual: number, anterior: number): { porcentaje: number; positivo: boolean } => {
        if (anterior === 0) return { porcentaje: 0, positivo: true };
        const cambio = ((actual - anterior) / anterior) * 100;
        return { porcentaje: Math.abs(cambio), positivo: cambio >= 0 };
    };

    // Datos para gráficos
    $: datosFlujoCaja = {
        labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
        datasets: [{
            label: 'Ingresos',
            data: [15000000, 18000000, 22000000, 19000000, 25000000, 28000000],
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            fill: true
        }, {
            label: 'Gastos', 
            data: [8000000, 9500000, 11000000, 10200000, 12000000, 13500000],
            borderColor: '#ef4444',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            fill: true
        }]
    };

    $: datosIngresosPorCategoria = {
        labels: ['Desarrollo Web', 'Consultoría', 'Productos', 'Otros'],
        datasets: [{
            data: [15000000, 8000000, 5000000, 2000000],
            backgroundColor: [
                '#3B82F6',
                '#10B981', 
                '#F59E0B',
                '#6B7280'
            ]
        }]
    };

    // Filtrar tareas recientes (últimas 5)
    $: tareasRecientes = $tareas
        .sort((a, b) => new Date(b.fecha_creacion).getTime() - new Date(a.fecha_creacion).getTime())
        .slice(0, 5);

    // Funciones de manejo de modales
    const abrirModalProyecto = () => mostrarModalProyecto = true;
    const abrirModalMovimiento = () => mostrarModalMovimiento = true;
    const abrirModalNegocio = () => mostrarModalNegocio = true;
    const abrirModalReportes = () => mostrarModalReportes = true;

    onMount(() => {
        cargarDashboard();
    });
</script>

{#if cargandoDashboard}
    <div class="flex items-center justify-center min-h-screen">
        <Cargando texto="Cargando dashboard..." tamaño="lg" />
    </div>
{:else}
    <!-- Header Premium del Dashboard -->
    <div class="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-2xl p-8 mb-8 shadow-2xl">
        <!-- Efectos visuales de fondo -->
        <div class="absolute inset-0 bg-black/20"></div>
        <div class="absolute -top-4 -right-4 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
        <div class="absolute -bottom-8 -left-8 w-64 h-64 bg-purple-300/20 rounded-full blur-2xl"></div>
        
        <div class="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between">
            <div class="mb-6 md:mb-0">
                <div class="flex items-center mb-3">
                    <Sparkles class="w-8 h-8 text-yellow-300 mr-3" />
                    <h1 class="text-3xl md:text-4xl font-bold text-white">
                        ¡Bienvenido, {$perfilUsuario?.nombre_completo || 'Usuario'}! ✨
                    </h1>
                </div>
                <p class="text-xl text-blue-100 mb-4">
                    Panel de Control Premium
                </p>
                <div class="flex items-center text-white/90">
                    <Calendar class="w-5 h-5 mr-2" />
                    <span class="text-lg">
                        {new Date().toLocaleDateString('es-ES', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                        })}
                    </span>
                </div>
            </div>
            <div class="hidden md:block">
                <div class="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20">
                    <BarChart3 size={48} class="text-white" />
                </div>
            </div>
        </div>
    </div>

    <!-- Layout Principal con Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <!-- Columna Principal (3/4) -->
        <div class="lg:col-span-3 space-y-8">
            
            <!-- Métricas Principales Premium -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <!-- Balance Total -->
                <div class="group relative overflow-hidden bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                    <div class="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                    <div class="relative z-10">
                        <div class="flex items-center justify-between mb-4">
                            <DollarSign class="w-8 h-8 text-white" />
                            <div class="px-2 py-1 bg-white/20 rounded-full">
                                <ArrowUpRight class="w-4 h-4 text-white" />
                            </div>
                        </div>
                        <div class="text-white">
                            <p class="text-sm opacity-90 mb-1">Balance Total</p>
                            <p class="text-2xl font-bold">{formatearMoneda($estadisticasMovimientos?.balance || 0)}</p>
                            <p class="text-xs opacity-75 mt-2">+12.5% este mes</p>
                        </div>
                    </div>
                </div>

                <!-- Ingresos del Mes -->
                <div class="group relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                    <div class="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                    <div class="relative z-10">
                        <div class="flex items-center justify-between mb-4">
                            <TrendingUp class="w-8 h-8 text-white" />
                            <div class="px-2 py-1 bg-white/20 rounded-full">
                                <ArrowUpRight class="w-4 h-4 text-white" />
                            </div>
                        </div>
                        <div class="text-white">
                            <p class="text-sm opacity-90 mb-1">Ingresos del Mes</p>
                            <p class="text-2xl font-bold">{formatearMoneda(estadisticasGenerales?.ingresos_mes || 0)}</p>
                            <p class="text-xs opacity-75 mt-2">+8.2% vs mes anterior</p>
                        </div>
                    </div>
                </div>

                <!-- Gastos del Mes -->
                <div class="group relative overflow-hidden bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                    <div class="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                    <div class="relative z-10">
                        <div class="flex items-center justify-between mb-4">
                            <TrendingDown class="w-8 h-8 text-white" />
                            <div class="px-2 py-1 bg-white/20 rounded-full">
                                <ArrowDownRight class="w-4 h-4 text-white" />
                            </div>
                        </div>
                        <div class="text-white">
                            <p class="text-sm opacity-90 mb-1">Gastos del Mes</p>
                            <p class="text-2xl font-bold">{formatearMoneda((estadisticasGenerales?.gastos_mes || 0) + (estadisticasGenerales?.gastos_negocios_mes || 0))}</p>
                            <p class="text-xs opacity-75 mt-2">-3.1% vs mes anterior</p>
                        </div>
                    </div>
                </div>

                <!-- Proyectos Activos -->
                <div class="group relative overflow-hidden bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                    <div class="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                    <div class="relative z-10">
                        <div class="flex items-center justify-between mb-4">
                            <Briefcase class="w-8 h-8 text-white" />
                            <div class="px-2 py-1 bg-white/20 rounded-full">
                                <Plus class="w-4 h-4 text-white" />
                            </div>
                        </div>
                        <div class="text-white">
                            <p class="text-sm opacity-90 mb-1">Proyectos Activos</p>
                            <p class="text-2xl font-bold">{$estadisticasProyectos?.activos?.toString() || "0"}</p>
                            <p class="text-xs opacity-75 mt-2">2 nuevos esta semana</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Gráficos Premium -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <!-- Flujo de Caja -->
                <div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 shadow-xl">
                    <div class="flex items-center justify-between mb-6">
                        <h3 class="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                            <Zap class="w-6 h-6 mr-2 text-blue-500" />
                            Flujo de Caja (6 meses)
                        </h3>
                        <div class="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-sm font-medium">
                            Trending ↗
                        </div>
                    </div>
                    <GraficoLineas datos={datosFlujoCaja} />
                </div>

                <!-- Ingresos por Categoría -->
                <div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 shadow-xl">
                    <div class="flex items-center justify-between mb-6">
                        <h3 class="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                            <Target class="w-6 h-6 mr-2 text-green-500" />
                            Ingresos por Categoría
                        </h3>
                        <div class="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full text-sm font-medium">
                            Top Performance
                        </div>
                    </div>
                    <GraficoDona datos={datosIngresosPorCategoria} />
                </div>
            </div>

            <!-- Progreso de Proyectos Premium -->
            <div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 shadow-xl">
                <div class="flex items-center justify-between mb-6">
                    <h3 class="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                        <Briefcase class="w-6 h-6 mr-2 text-purple-500" />
                        Progreso de Proyectos
                    </h3>
                    <a href="/panel/proyectos" class="flex items-center text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium group">
                        Ver proyectos
                        <ChevronRight class="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </a>
                </div>
                
                <div class="mb-6">
                    <div class="flex justify-between items-center mb-2">
                        <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Progreso General</span>
                        <span class="text-sm text-gray-500">
                            {Math.round((($estadisticasProyectos?.completados || 0) / (($estadisticasProyectos?.total || 1))) * 100)}%
                        </span>
                    </div>
                    <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                        <div 
                            class="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-1000 ease-out"
                            style="width: {Math.round((($estadisticasProyectos?.completados || 0) / (($estadisticasProyectos?.total || 1))) * 100)}%"
                        ></div>
                    </div>
                </div>

                <div class="grid grid-cols-3 gap-6">
                    <div class="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                        <div class="text-3xl font-bold text-blue-600 dark:text-blue-400">{$estadisticasProyectos?.activos || 0}</div>
                        <div class="text-sm font-medium text-blue-700 dark:text-blue-300">Activos</div>
                    </div>
                    <div class="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                        <div class="text-3xl font-bold text-green-600 dark:text-green-400">{$estadisticasProyectos?.completados || 0}</div>
                        <div class="text-sm font-medium text-green-700 dark:text-green-300">Completados</div>
                    </div>
                    <div class="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
                        <div class="text-3xl font-bold text-orange-600 dark:text-orange-400">{$estadisticasProyectos?.pausados || 0}</div>
                        <div class="text-sm font-medium text-orange-700 dark:text-orange-300">Pausados</div>
                    </div>
                </div>
            </div>

            <!-- Tareas Recientes -->
            <div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 shadow-xl">
                <div class="flex items-center justify-between mb-6">
                    <h3 class="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                        <CheckCircle class="w-6 h-6 mr-2 text-green-500" />
                        Tareas Recientes
                    </h3>
                    <a href="/panel/proyectos" class="flex items-center text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium group">
                        Ver todas
                        <ChevronRight class="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </a>
                </div>

                {#if tareasRecientes.length > 0}
                    <div class="space-y-4">
                        {#each tareasRecientes as tarea}
                            <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                <div class="flex items-center">
                                    <div class="w-3 h-3 rounded-full mr-3 {
                                        tarea.estado === 'completada' ? 'bg-green-500' :
                                        tarea.estado === 'en-progreso' ? 'bg-blue-500' :
                                        tarea.estado === 'pausada' ? 'bg-orange-500' : 'bg-gray-400'
                                    }"></div>
                                    <div>
                                        <p class="font-medium text-gray-900 dark:text-white">{tarea.titulo}</p>
                                        <p class="text-sm text-gray-500 dark:text-gray-400">
                                            Proyecto ID: {tarea.proyecto_id}
                                        </p>
                                    </div>
                                </div>
                                <div class="text-right">
                                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {
                                        tarea.estado === 'completada' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                                        tarea.estado === 'en-progreso' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                                        tarea.estado === 'pausada' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' :
                                        'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
                                    }">
                                        {tarea.estado === 'por-hacer' ? 'Pendiente' :
                                         tarea.estado === 'en-progreso' ? 'En Progreso' :
                                         tarea.estado === 'pausada' ? 'Pausada' :
                                         tarea.estado === 'completada' ? 'Completada' : tarea.estado}
                                    </span>
                                </div>
                            </div>
                        {/each}
                    </div>
                {:else}
                    <div class="text-center py-12">
                        <CheckCircle class="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <p class="text-gray-500 dark:text-gray-400 text-lg font-medium mb-2">
                            No tienes tareas pendientes
                        </p>
                        <p class="text-gray-400 dark:text-gray-500 text-sm">
                            ¡Crea un proyecto para empezar!
                        </p>
                    </div>
                {/if}
            </div>
        </div>

        <!-- Sidebar Premium (1/4) -->
        <div class="lg:col-span-1 space-y-6">
            <!-- Acciones Rápidas Premium -->
            <div class="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-xl backdrop-blur-sm">
                <div class="flex items-center mb-6">
                    <Zap class="w-6 h-6 text-blue-500 mr-2" />
                    <h3 class="text-xl font-bold text-gray-900 dark:text-white">
                        Acciones Rápidas
                    </h3>
                </div>
                
                <div class="space-y-3">
                    <!-- Crear Nuevo Proyecto -->
                    <button
                        on:click={abrirModalProyecto}
                        class="group w-full p-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
                    >
                        <div class="flex items-center justify-between">
                            <div class="flex items-center">
                                <div class="p-2 bg-white/20 rounded-lg mr-3 group-hover:bg-white/30 transition-colors">
                                    <Briefcase size={18} />
                                </div>
                                <span>Crear Nuevo Proyecto</span>
                            </div>
                            <ArrowUpRight class="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </div>
                    </button>
                    
                    <!-- Registrar Movimiento -->
                    <button
                        on:click={abrirModalMovimiento}
                        class="group w-full p-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
                    >
                        <div class="flex items-center justify-between">
                            <div class="flex items-center">
                                <div class="p-2 bg-white/20 rounded-lg mr-3 group-hover:bg-white/30 transition-colors">
                                    <CreditCard size={18} />
                                </div>
                                <span>Registrar Movimiento</span>
                            </div>
                            <ArrowUpRight class="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </div>
                    </button>
                    
                    <!-- Agregar Negocio -->
                    <button
                        on:click={abrirModalNegocio}
                        class="group w-full p-4 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
                    >
                        <div class="flex items-center justify-between">
                            <div class="flex items-center">
                                <div class="p-2 bg-white/20 rounded-lg mr-3 group-hover:bg-white/30 transition-colors">
                                    <Users size={18} />
                                </div>
                                <span>Agregar Negocio</span>
                            </div>
                            <ArrowUpRight class="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </div>
                    </button>
                    
                    <!-- Ver Reportes -->
                    <button
                        on:click={abrirModalReportes}
                        class="group w-full p-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
                    >
                        <div class="flex items-center justify-between">
                            <div class="flex items-center">
                                <div class="p-2 bg-white/20 rounded-lg mr-3 group-hover:bg-white/30 transition-colors">
                                    <BarChart3 size={18} />
                                </div>
                                <span>Ver Reportes</span>
                            </div>
                            <ArrowUpRight class="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </div>
                    </button>
                </div>
            </div>

            <!-- Resumen de Negocios -->
            <div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 shadow-xl">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                        <Briefcase class="w-5 h-5 mr-2 text-blue-500" />
                        Mis Negocios
                    </h3>
                    <span class="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-xs font-medium">
                        {$negocios.length}
                    </span>
                </div>
                
                {#if $negocios.length > 0}
                    <div class="space-y-3">
                        {#each $negocios.slice(0, 3) as negocio}
                            <button 
                                on:click={() => goto(`/panel/negocios/${negocio.slug}`)}
                                class="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer group"
                            >
                                <div class="text-left">
                                    <p class="font-medium text-gray-900 dark:text-white text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{negocio.nombre}</p>
                                    <p class="text-xs text-gray-500 dark:text-gray-400">{negocio.tipo_negocio}</p>
                                </div>
                                <div class="flex items-center space-x-2">
                                    <div class="w-2 h-2 rounded-full bg-green-500"></div>
                                    <ChevronRight class="w-4 h-4 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                                </div>
                            </button>
                        {/each}
                    </div>
                    
                    {#if $negocios.length > 3}
                        <a href="/panel/negocios" class="block text-center text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium mt-3">
                            Ver todos los negocios
                        </a>
                    {/if}
                {:else}
                    <div class="text-center py-8">
                        <Users class="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                        <p class="text-gray-500 dark:text-gray-400 text-sm">
                            No tienes negocios registrados
                        </p>
                    </div>
                {/if}
            </div>
        </div>
    </div>

    <!-- Modales Funcionales -->
    
    <!-- Modal Crear Proyecto -->
    <Modal bind:abierto={mostrarModalProyecto} titulo="Crear Nuevo Proyecto" tamaño="md">
        <FormularioProyecto 
            on:proyecto-creado={() => {
                mostrarModalProyecto = false;
                cargarProyectos();
            }}
            on:cancelar={() => mostrarModalProyecto = false}
        />
    </Modal>

    <!-- Modal Registrar Movimiento -->
    <Modal bind:abierto={mostrarModalMovimiento} titulo="Registrar Movimiento Financiero" tamaño="md">
        <FormularioMovimiento 
            negocios={$negocios}
            categorias={$categorias}
            negocioSeleccionado=""
            on:guardar={async (event) => {
                try {
                    // Crear el movimiento usando el store
                    const resultado = await crearMovimiento(event.detail.movimiento);
                    if (resultado) {
                        await cargarMovimientos();
                        mostrarModalMovimiento = false;
                        console.log('✅ Movimiento creado exitosamente');
                    }
                } catch (error) {
                    console.error('❌ Error al crear movimiento:', error);
                }
            }}
            on:cancelar={() => mostrarModalMovimiento = false}
        />
    </Modal>

    <!-- Modal Agregar Negocio -->
    <Modal bind:abierto={mostrarModalNegocio} titulo="Agregar Nuevo Negocio" tamaño="md">
        <FormularioNegocio 
            on:negocio-creado={() => {
                mostrarModalNegocio = false;
                cargarNegocios();
            }}
            on:cancelar={() => mostrarModalNegocio = false}
        />
    </Modal>

    <!-- Modal Ver Reportes -->
    <Modal bind:abierto={mostrarModalReportes} titulo="Reportes y Análisis" tamaño="xl">
        <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Acceso rápido a reportes -->
                <a href="/panel/reportes" class="block p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl hover:shadow-lg transition-all duration-300 group">
                    <div class="flex items-center mb-4">
                        <BarChart3 class="w-8 h-8 text-blue-600 dark:text-blue-400 mr-3" />
                        <h3 class="text-lg font-bold text-blue-900 dark:text-blue-100">Reportes Financieros</h3>
                    </div>
                    <p class="text-blue-700 dark:text-blue-300 text-sm mb-4">
                        Análisis detallado de ingresos, gastos y rentabilidad
                    </p>
                    <div class="flex items-center text-blue-600 dark:text-blue-400 font-medium group-hover:translate-x-2 transition-transform">
                        Ver reportes
                        <ChevronRight class="w-4 h-4 ml-1" />
                    </div>
                </a>

                <a href="/panel/gastos-personales" class="block p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl hover:shadow-lg transition-all duration-300 group">
                    <div class="flex items-center mb-4">
                        <DollarSign class="w-8 h-8 text-green-600 dark:text-green-400 mr-3" />
                        <h3 class="text-lg font-bold text-green-900 dark:text-green-100">Gastos Personales</h3>
                    </div>
                    <p class="text-green-700 dark:text-green-300 text-sm mb-4">
                        Seguimiento de gastos personales y presupuestos
                    </p>
                    <div class="flex items-center text-green-600 dark:text-green-400 font-medium group-hover:translate-x-2 transition-transform">
                        Ver gastos
                        <ChevronRight class="w-4 h-4 ml-1" />
                    </div>
                </a>
            </div>

            <div class="mt-6 flex justify-end">
                <Boton 
                    variante="ghost" 
                    on:click={() => mostrarModalReportes = false}
                >
                    Cerrar
                </Boton>
            </div>
        </div>
    </Modal>
{/if} 