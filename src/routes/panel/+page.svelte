<script lang="ts">
    import { onMount } from 'svelte';
    import { estadisticasProyectos, cargarProyectos } from '$lib/stores/proyectos';
    import { estadisticasMovimientos, cargarMovimientos, cargarCategorias } from '$lib/stores/movimientos';
    import { cargarNegocios, negocios } from '$lib/stores/negocios';
    import { tareas, cargarTareas } from '$lib/stores/proyectos';
    import { perfilUsuario } from '$lib/stores/auth';
    import { supabase } from '$lib/supabase/cliente';
    import TarjetaEstadistica from '$lib/componentes/ui/TarjetaEstadistica.svelte';
    import GraficoLineas from '$lib/componentes/charts/GraficoLineas.svelte';
    import GraficoDona from '$lib/componentes/charts/GraficoDona.svelte';
    import Boton from '$lib/componentes/ui/Boton.svelte';
    import Cargando from '$lib/componentes/ui/Cargando.svelte';
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
        ChevronRight
    } from 'lucide-svelte';

    // Estados de carga
    let cargandoDashboard = true;
    let estadisticasGenerales: any = null;

    // Función para cargar datos del dashboard
    const cargarDashboard = async () => {
        try {
            cargandoDashboard = true;

            // Cargar datos en paralelo
            await Promise.all([
                cargarProyectos(),
                cargarMovimientos(),
                cargarCategorias(),
                cargarNegocios(),
                cargarTareas(),
                obtenerEstadisticasGenerales()
            ]);

        } catch (error) {
            console.error('Error cargando dashboard:', error);
        } finally {
            cargandoDashboard = false;
        }
    };

    // Obtener estadísticas generales del dashboard
    const obtenerEstadisticasGenerales = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // En lugar de usar RPC, usar estadísticas básicas por ahora
            estadisticasGenerales = {
                total_proyectos: $estadisticasProyectos.total,
                proyectos_completados: $estadisticasProyectos.completados,
                total_tareas: $estadisticasProyectos.tareasTotales,
                tareas_completadas: $estadisticasProyectos.tareasCompletadas,
                ingresos_mes: $estadisticasMovimientos.totalIngresos,
                gastos_mes: $estadisticasMovimientos.totalGastos,
                balance_mes: $estadisticasMovimientos.balance,
                total_negocios: $negocios.length || 0
            };
        } catch (error) {
            console.error('Error en obtenerEstadisticasGenerales:', error);
            // Valores por defecto en caso de error
            estadisticasGenerales = {
                total_proyectos: 0,
                proyectos_completados: 0,
                total_tareas: 0,
                tareas_completadas: 0,
                ingresos_mes: 0,
                gastos_mes: 0,
                balance_mes: 0,
                total_negocios: 0
            };
        }
    };

    // Función para formatear moneda
    const formatearMoneda = (monto: number): string => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(monto);
    };

    // Función para calcular porcentaje de cambio
    const calcularCambio = (actual: number, anterior: number): { porcentaje: number; direccion: 'up' | 'down' | 'same' } => {
        if (anterior === 0) return { porcentaje: 0, direccion: 'same' };
        const porcentaje = ((actual - anterior) / anterior) * 100;
        return {
            porcentaje: Math.abs(porcentaje),
            direccion: porcentaje > 0 ? 'up' : porcentaje < 0 ? 'down' : 'same'
        };
    };

    // Datos para gráficos (simulados por ahora)
    $: datosFlujoCaja = {
        labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
        datasets: [{
            label: 'Ingresos',
            data: [12000, 15000, 13000, 18000, 16000, 20000],
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            fill: true
        }, {
            label: 'Gastos', 
            data: [8000, 9000, 7500, 10000, 9500, 11000],
            borderColor: '#ef4444',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            fill: true
        }]
    };

    $: datosIngresosPorCategoria = {
        labels: ['Servicios', 'Productos', 'Consultoría', 'Comisiones'],
        datasets: [{
            data: [45, 25, 20, 10],
            backgroundColor: [
                'rgba(16, 185, 129, 0.8)',
                'rgba(59, 130, 246, 0.8)', 
                'rgba(168, 85, 247, 0.8)',
                'rgba(245, 158, 11, 0.8)'
            ]
        }]
    };

    onMount(() => {
        cargarDashboard();
    });
</script>

<svelte:head>
    <title>Dashboard - Contabilidad Pro</title>
</svelte:head>

{#if cargandoDashboard}
    <div class="flex items-center justify-center min-h-[400px]">
        <Cargando tamaño="lg" texto="Cargando dashboard..." />
    </div>
{:else}
    <div class="space-y-8">
        <!-- Header del Dashboard -->
        <div class="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
            <div class="flex items-center justify-between">
                <div>
                    <h1 class="text-3xl font-bold mb-2">
                        ¡Hola, {$perfilUsuario?.nombre_completo || 'Usuario'}! 👋
                    </h1>
                    <p class="text-blue-100 text-lg">
                        Aquí tienes un resumen de tu actividad financiera y proyectos
                    </p>
                    <div class="mt-4 flex items-center gap-4">
                        <div class="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1 text-sm">
                            Plan: <span class="font-semibold capitalize">{$perfilUsuario?.plan_suscripcion || 'Gratis'}</span>
                        </div>
                        <div class="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1 text-sm">
                            {new Date().toLocaleDateString('es-ES', { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                            })}
                        </div>
                    </div>
                </div>
                <div class="hidden md:block">
                    <div class="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center">
                        <BarChart3 size={48} class="text-white" />
                    </div>
                </div>
            </div>
        </div>

        <!-- Métricas Principales -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <!-- Balance Total -->
            <TarjetaEstadistica
                titulo="Balance Total"
                valor={formatearMoneda($estadisticasMovimientos?.balance || 0)}
                icono={DollarSign}
                color={($estadisticasMovimientos?.balance || 0) >= 0 ? "verde" : "rojo"}
                tendencia={calcularCambio($estadisticasMovimientos?.balance || 0, 15000)}
            />

            <!-- Ingresos del Mes -->
            <TarjetaEstadistica
                titulo="Ingresos del Mes"
                valor={formatearMoneda(estadisticasGenerales?.ingresos_mes || 0)}
                icono={TrendingUp}
                color="verde"
                tendencia={calcularCambio(estadisticasGenerales?.ingresos_mes || 0, 12000)}
            />

            <!-- Gastos del Mes -->
            <TarjetaEstadistica
                titulo="Gastos del Mes"
                valor={formatearMoneda((estadisticasGenerales?.gastos_mes || 0) + (estadisticasGenerales?.gastos_negocios_mes || 0))}
                icono={TrendingDown}
                color="rojo"
                tendencia={calcularCambio((estadisticasGenerales?.gastos_mes || 0) + (estadisticasGenerales?.gastos_negocios_mes || 0), 8000)}
            />

            <!-- Proyectos Activos -->
            <TarjetaEstadistica
                titulo="Proyectos Activos"
                valor={$estadisticasProyectos?.activos?.toString() || "0"}
                icono={Briefcase}
                color="azul"
                tendencia={calcularCambio($estadisticasProyectos?.activos || 0, 3)}
            />
        </div>

        <!-- Segunda fila de métricas -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <!-- Tareas Pendientes -->
            <TarjetaEstadistica
                titulo="Tareas Pendientes"
                valor={estadisticasGenerales?.tareas_pendientes?.toString() || "0"}
                icono={Clock}
                color="naranja"
            />

            <!-- Tareas Completadas Hoy -->
            <TarjetaEstadistica
                titulo="Completadas Hoy"
                valor={estadisticasGenerales?.tareas_completadas_hoy?.toString() || "0"}
                icono={CheckCircle}
                color="verde"
            />

            <!-- Campañas Activas -->
            <TarjetaEstadistica
                titulo="Campañas Activas"
                valor={estadisticasGenerales?.campanas_activas?.toString() || "0"}
                icono={Target}
                color="morado"
            />

            <!-- Notificaciones -->
            <TarjetaEstadistica
                titulo="Notificaciones"
                valor={estadisticasGenerales?.notificaciones_no_leidas?.toString() || "0"}
                icono={AlertTriangle}
                color="amarillo"
            />
        </div>

        <!-- Gráficos y Análisis -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <!-- Flujo de Caja -->
            <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <div class="flex items-center justify-between mb-6">
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                        Flujo de Caja (6 meses)
                    </h3>
                    <Boton 
                        variante="ghost" 
                        tamaño="sm"
                        href="/panel/reportes"
                    >
                        Ver detalles
                        <ArrowUpRight size={16} class="ml-1" />
                    </Boton>
                </div>
                <GraficoLineas datos={datosFlujoCaja} altura="300px" />
            </div>

            <!-- Ingresos por Categoría -->
            <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <div class="flex items-center justify-between mb-6">
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                        Ingresos por Categoría
                    </h3>
                    <Boton 
                        variante="ghost" 
                        tamaño="sm"
                        href="/panel/finanzas"
                    >
                        Ver finanzas
                        <ArrowUpRight size={16} class="ml-1" />
                    </Boton>
                </div>
                <GraficoDona datos={datosIngresosPorCategoria} altura="300px" />
            </div>
        </div>

        <!-- Progreso de Metas y Proyectos -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <!-- Progreso de Proyectos -->
            <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <div class="flex items-center justify-between mb-6">
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                        Progreso de Proyectos
                    </h3>
                    <Boton 
                        variante="ghost" 
                        tamaño="sm"
                        href="/panel/proyectos"
                    >
                        Ver proyectos
                        <ArrowUpRight size={16} class="ml-1" />
                    </Boton>
                </div>
                
                <!-- Progreso general -->
                <div class="mb-4">
                    <div class="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                        <span>Progreso General</span>
                        <span>{$estadisticasProyectos?.progresoPromedio || 0}%</span>
                    </div>
                    <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                            class="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                            style="width: {$estadisticasProyectos?.progresoPromedio || 0}%"
                        ></div>
                    </div>
                </div>

                <!-- Estadísticas de proyectos -->
                <div class="grid grid-cols-3 gap-4 text-center">
                    <div>
                        <div class="text-2xl font-bold text-blue-600">{$estadisticasProyectos?.activos || 0}</div>
                        <div class="text-sm text-gray-600 dark:text-gray-400">Activos</div>
                    </div>
                    <div>
                        <div class="text-2xl font-bold text-green-600">{$estadisticasProyectos?.completados || 0}</div>
                        <div class="text-sm text-gray-600 dark:text-gray-400">Completados</div>
                    </div>
                    <div>
                        <div class="text-2xl font-bold text-orange-600">{$estadisticasProyectos?.pausados || 0}</div>
                        <div class="text-sm text-gray-600 dark:text-gray-400">Pausados</div>
                    </div>
                </div>
            </div>

            <!-- Acciones Rápidas -->
            <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                    Acciones Rápidas
                </h3>
                
                <div class="space-y-3">
                    <Boton 
                        variante="primary" 
                        tamaño="md" 
                        class="w-full justify-start"
                        href="/panel/proyectos?crear=true"
                    >
                        <Briefcase size={18} class="mr-2" />
                        Crear Nuevo Proyecto
                    </Boton>
                    
                    <Boton 
                        variante="secondary" 
                        tamaño="md" 
                        class="w-full justify-start"
                        href="/panel/finanzas?crear=movimiento"
                    >
                        <CreditCard size={18} class="mr-2" />
                        Registrar Movimiento
                    </Boton>
                    
                    <Boton 
                        variante="ghost" 
                        tamaño="md" 
                        class="w-full justify-start"
                        href="/panel/negocios?crear=true"
                    >
                        <Users size={18} class="mr-2" />
                        Agregar Negocio
                    </Boton>
                    
                    <Boton 
                        variante="ghost" 
                        tamaño="md" 
                        class="w-full justify-start"
                        href="/panel/reportes"
                    >
                        <BarChart3 size={18} class="mr-2" />
                        Ver Reportes
                    </Boton>
                </div>
            </div>
        </div>

        <!-- Tareas Recientes -->
        <div class="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
            <div class="flex items-center justify-between mb-6">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                    Tareas Recientes
                </h3>
                <Boton 
                    variante="ghost" 
                    tamaño="sm" 
                    href="/panel/proyectos"
                    class="text-primary-600 hover:text-primary-700"
                >
                    Ver todas <ChevronRight size={16} class="ml-1" />
                </Boton>
            </div>
            
            {#if $tareas.length > 0}
                <div class="space-y-3">
                    {#each $tareas.slice(0, 5) as tarea (tarea.id)}
                        <div class="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                            <div class="flex items-center space-x-3">
                                <div class="flex-shrink-0">
                                    {#if tarea.estado === 'completada'}
                                        <CheckCircle size={20} class="text-green-500" />
                                    {:else if tarea.estado === 'en-progreso'}
                                        <Clock size={20} class="text-blue-500" />
                                    {:else}
                                        <AlertTriangle size={20} class="text-gray-400" />
                                    {/if}
                                </div>
                                <div class="flex-1 min-w-0">
                                    <p class="text-sm font-medium text-gray-900 dark:text-white truncate">
                                        {tarea.titulo}
                                    </p>
                                    <p class="text-xs text-gray-500 dark:text-gray-400">
                                        Proyecto: {tarea.proyecto_id}
                                    </p>
                                </div>
                            </div>
                            <div class="flex items-center space-x-2">
                                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium {
                                    tarea.prioridad === 'alta' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
                                    tarea.prioridad === 'media' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                                    'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                }">
                                    {tarea.prioridad}
                                </span>
                                {#if tarea.fecha_limite}
                                    <span class="text-xs text-gray-500 dark:text-gray-400">
                                        {new Date(tarea.fecha_limite).toLocaleDateString()}
                                    </span>
                                {/if}
                            </div>
                        </div>
                    {/each}
                </div>
            {:else}
                <div class="text-center py-8">
                    <CheckCircle size={48} class="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                    <p class="text-gray-500 dark:text-gray-400 text-sm">
                        No tienes tareas pendientes. ¡Crea un proyecto para empezar!
                    </p>
                </div>
            {/if}
        </div>

        <!-- Sidebar con estadísticas y acciones -->
        <div class="lg:col-span-1 space-y-8">
            <!-- Acciones Rápidas -->
            <div class="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                    Acciones Rápidas
                </h3>
                
                <div class="space-y-3">
                    <Boton 
                        variante="primary" 
                        tamaño="md" 
                        class="w-full justify-start"
                        href="/panel/proyectos?crear=true"
                    >
                        <Briefcase size={18} class="mr-2" />
                        Crear Nuevo Proyecto
                    </Boton>
                    
                    <Boton 
                        variante="secondary" 
                        tamaño="md" 
                        class="w-full justify-start"
                        href="/panel/finanzas?crear=movimiento"
                    >
                        <CreditCard size={18} class="mr-2" />
                        Registrar Movimiento
                    </Boton>
                    
                    <Boton 
                        variante="ghost" 
                        tamaño="md" 
                        class="w-full justify-start"
                        href="/panel/negocios?crear=true"
                    >
                        <Users size={18} class="mr-2" />
                        Agregar Negocio
                    </Boton>
                    
                    <Boton 
                        variante="ghost" 
                        tamaño="md" 
                        class="w-full justify-start"
                        href="/panel/reportes"
                    >
                        <BarChart3 size={18} class="mr-2" />
                        Ver Reportes
                    </Boton>
                </div>
            </div>
        </div>
    </div>
{/if} 