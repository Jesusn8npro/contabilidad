<script lang="ts">
    import { onMount } from 'svelte';
    import { writable } from 'svelte/store';
    import { supabase } from '$lib/supabase/cliente';
    import { perfilUsuario } from '$lib/stores/auth';
    import { mostrarError, mostrarExito } from '$lib/stores/toast';
    import Boton from '$lib/componentes/ui/Boton.svelte';
    import Cargando from '$lib/componentes/ui/Cargando.svelte';
    import TarjetaEstadistica from '$lib/componentes/ui/TarjetaEstadistica.svelte';
    import GraficoLineas from '$lib/componentes/charts/GraficoLineas.svelte';
    import GraficoDona from '$lib/componentes/charts/GraficoDona.svelte';
    import { 
        Calendar,
        TrendingUp,
        TrendingDown,
        BarChart3,
        PieChart,
        Download,
        Filter,
        DollarSign,
        Target,
        Briefcase,
        CreditCard,
        Users,
        AlertTriangle,
        CheckCircle,
        Clock
    } from 'lucide-svelte';

    // Estados del componente
    let cargandoReportes = false;
    let periodoSeleccionado = 'mes'; // mes, trimestre, año, personalizado
    let fechaDesde = '';
    let fechaHasta = '';
    let tipoReporte = 'general'; // general, proyectos, negocios, personal

    // Datos de reportes
    let estadisticasGenerales = {
        totalIngresos: 0,
        totalGastos: 0,
        totalGastosPersonales: 0,
        balance: 0,
        proyectosActivos: 0,
        negociosActivos: 0,
        tareasCompletadas: 0,
        campanasActivas: 0
    };

    let datosFlujoCaja = {
        labels: [],
        datasets: []
    };

    let datosIngresosPorCategoria = {
        labels: [],
        datasets: []
    };

    let datosGastosPorCategoria = {
        labels: [],
        datasets: []
    };

    let datosProyectosPorEstado = {
        labels: [],
        datasets: []
    };

    let datosGastosPersonalesPorTipo = {
        labels: [],
        datasets: []
    };

    let comparacionPeriodos = {
        ingresos: { actual: 0, anterior: 0, cambio: 0 },
        gastos: { actual: 0, anterior: 0, cambio: 0 },
        balance: { actual: 0, anterior: 0, cambio: 0 },
        proyectos: { actual: 0, anterior: 0, cambio: 0 }
    };

    // Configurar fechas por defecto
    const configurarFechasPorDefecto = () => {
        const ahora = new Date();
        
        switch (periodoSeleccionado) {
            case 'mes':
                fechaDesde = new Date(ahora.getFullYear(), ahora.getMonth(), 1).toISOString().split('T')[0];
                fechaHasta = ahora.toISOString().split('T')[0];
                break;
            case 'trimestre':
                const mesActual = ahora.getMonth();
                const inicioTrimestre = Math.floor(mesActual / 3) * 3;
                fechaDesde = new Date(ahora.getFullYear(), inicioTrimestre, 1).toISOString().split('T')[0];
                fechaHasta = ahora.toISOString().split('T')[0];
                break;
            case 'año':
                fechaDesde = new Date(ahora.getFullYear(), 0, 1).toISOString().split('T')[0];
                fechaHasta = ahora.toISOString().split('T')[0];
                break;
        }
    };

    // Cargar estadísticas generales
    const cargarEstadisticasGenerales = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Usar la función SQL para obtener estadísticas
            const { data: estadisticas, error } = await supabase
                .rpc('obtener_estadisticas_dashboard', { usuario_uuid: user.id });

            if (error) {
                console.error('Error obteniendo estadísticas:', error);
                return;
            }

            if (estadisticas) {
                estadisticasGenerales = {
                    totalIngresos: estadisticas.total_ingresos_mes || 0,
                    totalGastos: (estadisticas.total_gastos_negocios_mes || 0) + (estadisticas.total_gastos_personales_mes || 0),
                    totalGastosPersonales: estadisticas.total_gastos_personales_mes || 0,
                    balance: (estadisticas.total_ingresos_mes || 0) - ((estadisticas.total_gastos_negocios_mes || 0) + (estadisticas.total_gastos_personales_mes || 0)),
                    proyectosActivos: estadisticas.proyectos_activos || 0,
                    negociosActivos: estadisticas.negocios_activos || 0,
                    tareasCompletadas: estadisticas.tareas_completadas_hoy || 0,
                    campanasActivas: estadisticas.campanas_activas || 0
                };
            }
        } catch (error) {
            console.error('Error en cargarEstadisticasGenerales:', error);
        }
    };

    // Cargar datos de flujo de caja
    const cargarFlujoCaja = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Obtener movimientos del período
            let query = supabase
                .from('movimientos_financieros')
                .select('fecha_movimiento, tipo_movimiento, monto')
                .gte('fecha_movimiento', fechaDesde)
                .lte('fecha_movimiento', fechaHasta);

            const { data: movimientos, error } = await query;

            if (error) {
                console.error('Error cargando flujo de caja:', error);
                return;
            }

            // También obtener gastos personales
            const { data: gastosPersonales } = await supabase
                .from('gastos_personales')
                .select('fecha_gasto, monto')
                .eq('usuario_id', user.id)
                .gte('fecha_gasto', fechaDesde)
                .lte('fecha_gasto', fechaHasta);

            // Procesar datos por día/mes/año según el período
            const agrupados: Record<string, { ingresos: number; gastos: number }> = {};
            
            // Procesar movimientos de negocios
            movimientos?.forEach(mov => {
                const fecha = mov.fecha_movimiento;
                if (!agrupados[fecha]) {
                    agrupados[fecha] = { ingresos: 0, gastos: 0 };
                }
                
                if (mov.tipo_movimiento === 'ingreso') {
                    agrupados[fecha].ingresos += mov.monto;
                } else {
                    agrupados[fecha].gastos += mov.monto;
                }
            });

            // Procesar gastos personales
            gastosPersonales?.forEach(gasto => {
                const fecha = gasto.fecha_gasto;
                if (!agrupados[fecha]) {
                    agrupados[fecha] = { ingresos: 0, gastos: 0 };
                }
                agrupados[fecha].gastos += gasto.monto;
            });

            // Convertir a formato de gráfico
            const fechasOrdenadas = Object.keys(agrupados).sort();
            const labels = fechasOrdenadas.map(fecha => {
                const date = new Date(fecha);
                return date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
            });

            datosFlujoCaja = {
                labels,
                datasets: [
                    {
                        label: 'Ingresos',
                        data: fechasOrdenadas.map(fecha => agrupados[fecha].ingresos),
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        fill: true
                    },
                    {
                        label: 'Gastos',
                        data: fechasOrdenadas.map(fecha => agrupados[fecha].gastos),
                        borderColor: '#ef4444',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        fill: true
                    }
                ]
            };
        } catch (error) {
            console.error('Error en cargarFlujoCaja:', error);
        }
    };

    // Cargar datos de categorías
    const cargarDatosCategorias = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Ingresos por categoría
            const { data: ingresos } = await supabase
                .from('movimientos_financieros')
                .select(`
                    monto,
                    categorias:categoria_id (nombre, color)
                `)
                .eq('tipo_movimiento', 'ingreso')
                .gte('fecha_movimiento', fechaDesde)
                .lte('fecha_movimiento', fechaHasta);

            // Gastos de negocios por categoría
            const { data: gastos } = await supabase
                .from('movimientos_financieros')
                .select(`
                    monto,
                    categorias:categoria_id (nombre, color)
                `)
                .eq('tipo_movimiento', 'gasto')
                .gte('fecha_movimiento', fechaDesde)
                .lte('fecha_movimiento', fechaHasta);

            // Procesar ingresos
            const ingresosPorCategoria = {};
            ingresos?.forEach(ing => {
                const categoria = ing.categorias?.nombre || 'Sin categoría';
                if (!ingresosPorCategoria[categoria]) {
                    ingresosPorCategoria[categoria] = {
                        total: 0,
                        color: ing.categorias?.color || '#3b82f6'
                    };
                }
                ingresosPorCategoria[categoria].total += ing.monto;
            });

            // Procesar gastos
            const gastosPorCategoria = {};
            gastos?.forEach(gasto => {
                const categoria = gasto.categorias?.nombre || 'Sin categoría';
                if (!gastosPorCategoria[categoria]) {
                    gastosPorCategoria[categoria] = {
                        total: 0,
                        color: gasto.categorias?.color || '#ef4444'
                    };
                }
                gastosPorCategoria[categoria].total += gasto.monto;
            });

            // Convertir a formato de gráfico
            datosIngresosPorCategoria = {
                labels: Object.keys(ingresosPorCategoria),
                datasets: [{
                    data: Object.values(ingresosPorCategoria).map(cat => cat.total),
                    backgroundColor: Object.values(ingresosPorCategoria).map(cat => cat.color)
                }]
            };

            datosGastosPorCategoria = {
                labels: Object.keys(gastosPorCategoria),
                datasets: [{
                    data: Object.values(gastosPorCategoria).map(cat => cat.total),
                    backgroundColor: Object.values(gastosPorCategoria).map(cat => cat.color)
                }]
            };
        } catch (error) {
            console.error('Error en cargarDatosCategorias:', error);
        }
    };

    // Cargar datos de proyectos
    const cargarDatosProyectos = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: proyectos } = await supabase
                .from('proyectos')
                .select('estado')
                .eq('usuario_id', user.id);

            // Agrupar por estado
            const estadosCount = {};
            proyectos?.forEach(proyecto => {
                const estado = proyecto.estado;
                estadosCount[estado] = (estadosCount[estado] || 0) + 1;
            });

            const coloresEstados = {
                'activo': '#10b981',
                'pausado': '#f59e0b',
                'completado': '#3b82f6',
                'archivado': '#6b7280',
                'cancelado': '#ef4444'
            };

            datosProyectosPorEstado = {
                labels: Object.keys(estadosCount),
                datasets: [{
                    data: Object.values(estadosCount),
                    backgroundColor: Object.keys(estadosCount).map(estado => coloresEstados[estado] || '#6b7280')
                }]
            };
        } catch (error) {
            console.error('Error en cargarDatosProyectos:', error);
        }
    };

    // Cargar datos de gastos personales
    const cargarGastosPersonales = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: gastos } = await supabase
                .from('gastos_personales')
                .select('tipo_gasto_personal, monto')
                .eq('usuario_id', user.id)
                .gte('fecha_gasto', fechaDesde)
                .lte('fecha_gasto', fechaHasta);

            // Agrupar por tipo
            const tiposCount = {};
            gastos?.forEach(gasto => {
                const tipo = gasto.tipo_gasto_personal;
                tiposCount[tipo] = (tiposCount[tipo] || 0) + gasto.monto;
            });

            datosGastosPersonalesPorTipo = {
                labels: Object.keys(tiposCount),
                datasets: [{
                    data: Object.values(tiposCount),
                    backgroundColor: [
                        '#ef4444', '#f59e0b', '#10b981', '#3b82f6',
                        '#8b5cf6', '#f97316', '#06b6d4', '#84cc16'
                    ]
                }]
            };
        } catch (error) {
            console.error('Error en cargarGastosPersonales:', error);
        }
    };

    // Cargar todos los reportes
    const cargarReportes = async () => {
        cargandoReportes = true;
        
        try {
            await Promise.all([
                cargarEstadisticasGenerales(),
                cargarFlujoCaja(),
                cargarDatosCategorias(),
                cargarDatosProyectos(),
                cargarGastosPersonales()
            ]);
        } catch (error) {
            console.error('Error cargando reportes:', error);
            mostrarError('Error al cargar los reportes');
        } finally {
            cargandoReportes = false;
        }
    };

    // Exportar reportes a CSV
    const exportarReportes = async () => {
        try {
            const csvData = [
                ['Reporte de Contabilidad Pro'],
                ['Período:', `${fechaDesde} - ${fechaHasta}`],
                ['Generado:', new Date().toLocaleString('es-ES')],
                [],
                ['RESUMEN FINANCIERO'],
                ['Total Ingresos', formatearMoneda(estadisticasGenerales.totalIngresos)],
                ['Total Gastos Negocios', formatearMoneda(estadisticasGenerales.totalGastos - estadisticasGenerales.totalGastosPersonales)],
                ['Total Gastos Personales', formatearMoneda(estadisticasGenerales.totalGastosPersonales)],
                ['Balance Total', formatearMoneda(estadisticasGenerales.balance)],
                [],
                ['PROYECTOS Y ACTIVIDAD'],
                ['Proyectos Activos', estadisticasGenerales.proyectosActivos.toString()],
                ['Negocios Activos', estadisticasGenerales.negociosActivos.toString()],
                ['Tareas Completadas', estadisticasGenerales.tareasCompletadas.toString()],
                ['Campañas Activas', estadisticasGenerales.campanasActivas.toString()]
            ];

            const csvContent = csvData.map(row => row.join(',')).join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            
            if (link.download !== undefined) {
                const url = URL.createObjectURL(blob);
                link.setAttribute('href', url);
                link.setAttribute('download', `reporte-contabilidad-${fechaDesde}-${fechaHasta}.csv`);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }

            mostrarExito('Reporte exportado exitosamente');
        } catch (error) {
            console.error('Error exportando reporte:', error);
            mostrarError('Error al exportar el reporte');
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

    // Cambio de período
    const cambiarPeriodo = (nuevoPeriodo: string) => {
        periodoSeleccionado = nuevoPeriodo;
        if (nuevoPeriodo !== 'personalizado') {
            configurarFechasPorDefecto();
            cargarReportes();
        }
    };

    onMount(() => {
        configurarFechasPorDefecto();
        cargarReportes();
    });
</script>

<svelte:head>
    <title>Reportes y Analíticas - Contabilidad Pro</title>
</svelte:head>

<div class="space-y-8">
    <!-- Header de reportes -->
    <div class="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white">
        <div class="flex items-center justify-between">
            <div>
                <h1 class="text-3xl font-bold mb-2">
                    Reportes y Analíticas 📊
                </h1>
                <p class="text-indigo-100 text-lg">
                    Análisis completo de tu actividad financiera y de negocio
                </p>
            </div>
            <div class="hidden md:block">
                <div class="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center">
                    <BarChart3 size={48} />
                </div>
            </div>
        </div>
    </div>

    <!-- Controles de período y filtros -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <!-- Selección de período -->
            <div class="flex flex-wrap gap-3">
                <button
                    on:click={() => cambiarPeriodo('mes')}
                    class={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        periodoSeleccionado === 'mes'
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                    }`}
                >
                    Este Mes
                </button>
                <button
                    on:click={() => cambiarPeriodo('trimestre')}
                    class={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        periodoSeleccionado === 'trimestre'
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                    }`}
                >
                    Trimestre
                </button>
                <button
                    on:click={() => cambiarPeriodo('año')}
                    class={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        periodoSeleccionado === 'año'
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                    }`}
                >
                    Este Año
                </button>
                <button
                    on:click={() => cambiarPeriodo('personalizado')}
                    class={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        periodoSeleccionado === 'personalizado'
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                    }`}
                >
                    Personalizado
                </button>
            </div>

            <!-- Fechas personalizadas -->
            {#if periodoSeleccionado === 'personalizado'}
                <div class="flex items-center gap-4">
                    <div>
                        <label class="block text-sm text-gray-600 dark:text-gray-400 mb-1">Desde</label>
                        <input
                            type="date"
                            bind:value={fechaDesde}
                            class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        />
                    </div>
                    <div>
                        <label class="block text-sm text-gray-600 dark:text-gray-400 mb-1">Hasta</label>
                        <input
                            type="date"
                            bind:value={fechaHasta}
                            class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        />
                    </div>
                    <div class="pt-6">
                        <Boton variante="primary" tamaño="sm" on:click={cargarReportes}>
                            Actualizar
                        </Boton>
                    </div>
                </div>
            {/if}

            <!-- Botón de exportar -->
            <div class="flex gap-3">
                <Boton variante="ghost" on:click={exportarReportes}>
                    <Download size={16} class="mr-2" />
                    Exportar CSV
                </Boton>
            </div>
        </div>
    </div>

    {#if cargandoReportes}
        <div class="flex items-center justify-center py-12">
            <Cargando tamaño="lg" mensaje="Generando reportes..." />
        </div>
    {:else}
        <!-- Métricas principales -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <TarjetaEstadistica
                titulo="Total Ingresos"
                valor={formatearMoneda(estadisticasGenerales.totalIngresos)}
                icono={TrendingUp}
                color="verde"
            />
            
            <TarjetaEstadistica
                titulo="Total Gastos"
                valor={formatearMoneda(estadisticasGenerales.totalGastos)}
                icono={TrendingDown}
                color="rojo"
            />
            
            <TarjetaEstadistica
                titulo="Balance Neto"
                valor={formatearMoneda(estadisticasGenerales.balance)}
                icono={DollarSign}
                color={estadisticasGenerales.balance >= 0 ? "verde" : "rojo"}
            />
            
            <TarjetaEstadistica
                titulo="Proyectos Activos"
                valor={estadisticasGenerales.proyectosActivos.toString()}
                icono={Briefcase}
                color="azul"
            />
        </div>

        <!-- Segunda fila de métricas -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <TarjetaEstadistica
                titulo="Gastos Personales"
                valor={formatearMoneda(estadisticasGenerales.totalGastosPersonales)}
                icono={CreditCard}
                color="naranja"
            />
            
            <TarjetaEstadistica
                titulo="Negocios Activos"
                valor={estadisticasGenerales.negociosActivos.toString()}
                icono={Users}
                color="morado"
            />
            
            <TarjetaEstadistica
                titulo="Tareas Completadas"
                valor={estadisticasGenerales.tareasCompletadas.toString()}
                icono={CheckCircle}
                color="verde"
            />
            
            <TarjetaEstadistica
                titulo="Campañas Activas"
                valor={estadisticasGenerales.campanasActivas.toString()}
                icono={Target}
                color="amarillo"
            />
        </div>

        <!-- Gráficos principales -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <!-- Flujo de caja -->
            <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                    Flujo de Caja por Período
                </h3>
                {#if datosFlujoCaja.labels.length > 0}
                    <GraficoLineas datos={datosFlujoCaja} altura="350px" />
                {:else}
                    <div class="flex items-center justify-center h-80">
                        <div class="text-center text-gray-500 dark:text-gray-400">
                            <BarChart3 size={48} class="mx-auto mb-3 opacity-50" />
                            <p>No hay datos para mostrar en este período</p>
                        </div>
                    </div>
                {/if}
            </div>

            <!-- Ingresos por categoría -->
            <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                    Ingresos por Categoría
                </h3>
                {#if datosIngresosPorCategoria.labels.length > 0}
                    <GraficoDona datos={datosIngresosPorCategoria} altura="350px" />
                {:else}
                    <div class="flex items-center justify-center h-80">
                        <div class="text-center text-gray-500 dark:text-gray-400">
                            <PieChart size={48} class="mx-auto mb-3 opacity-50" />
                            <p>No hay ingresos registrados en este período</p>
                        </div>
                    </div>
                {/if}
            </div>
        </div>

        <!-- Gráficos secundarios -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- Gastos por categoría -->
            <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                    Gastos de Negocios
                </h3>
                {#if datosGastosPorCategoria.labels.length > 0}
                    <GraficoDona datos={datosGastosPorCategoria} altura="300px" />
                {:else}
                    <div class="flex items-center justify-center h-64">
                        <div class="text-center text-gray-500 dark:text-gray-400">
                            <PieChart size={32} class="mx-auto mb-2 opacity-50" />
                            <p class="text-sm">Sin gastos de negocios</p>
                        </div>
                    </div>
                {/if}
            </div>

            <!-- Proyectos por estado -->
            <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                    Proyectos por Estado
                </h3>
                {#if datosProyectosPorEstado.labels.length > 0}
                    <GraficoDona datos={datosProyectosPorEstado} altura="300px" />
                {:else}
                    <div class="flex items-center justify-center h-64">
                        <div class="text-center text-gray-500 dark:text-gray-400">
                            <Briefcase size={32} class="mx-auto mb-2 opacity-50" />
                            <p class="text-sm">Sin proyectos registrados</p>
                        </div>
                    </div>
                {/if}
            </div>

            <!-- Gastos personales por tipo -->
            <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                    Gastos Personales
                </h3>
                {#if datosGastosPersonalesPorTipo.labels.length > 0}
                    <GraficoDona datos={datosGastosPersonalesPorTipo} altura="300px" />
                {:else}
                    <div class="flex items-center justify-center h-64">
                        <div class="text-center text-gray-500 dark:text-gray-400">
                            <CreditCard size={32} class="mx-auto mb-2 opacity-50" />
                            <p class="text-sm">Sin gastos personales</p>
                        </div>
                    </div>
                {/if}
            </div>
        </div>

        <!-- Resumen del período -->
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Resumen del Período
            </h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <!-- Análisis financiero -->
                <div class="space-y-4">
                    <h4 class="font-medium text-gray-900 dark:text-white">Análisis Financiero</h4>
                    <div class="space-y-3">
                        <div class="flex justify-between">
                            <span class="text-gray-600 dark:text-gray-400">Ingresos totales:</span>
                            <span class="font-semibold text-green-600">{formatearMoneda(estadisticasGenerales.totalIngresos)}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600 dark:text-gray-400">Gastos de negocios:</span>
                            <span class="font-semibold text-red-600">{formatearMoneda(estadisticasGenerales.totalGastos - estadisticasGenerales.totalGastosPersonales)}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600 dark:text-gray-400">Gastos personales:</span>
                            <span class="font-semibold text-orange-600">{formatearMoneda(estadisticasGenerales.totalGastosPersonales)}</span>
                        </div>
                        <hr class="border-gray-200 dark:border-gray-700" />
                        <div class="flex justify-between">
                            <span class="text-gray-600 dark:text-gray-400">Balance neto:</span>
                            <span class="font-bold {estadisticasGenerales.balance >= 0 ? 'text-green-600' : 'text-red-600'}">
                                {formatearMoneda(estadisticasGenerales.balance)}
                            </span>
                        </div>
                    </div>
                </div>

                <!-- Actividad -->
                <div class="space-y-4">
                    <h4 class="font-medium text-gray-900 dark:text-white">Actividad</h4>
                    <div class="space-y-3">
                        <div class="flex justify-between">
                            <span class="text-gray-600 dark:text-gray-400">Proyectos activos:</span>
                            <span class="font-semibold">{estadisticasGenerales.proyectosActivos}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600 dark:text-gray-400">Negocios activos:</span>
                            <span class="font-semibold">{estadisticasGenerales.negociosActivos}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600 dark:text-gray-400">Tareas completadas:</span>
                            <span class="font-semibold text-blue-600">{estadisticasGenerales.tareasCompletadas}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600 dark:text-gray-400">Campañas activas:</span>
                            <span class="font-semibold text-purple-600">{estadisticasGenerales.campanasActivas}</span>
                        </div>
                    </div>
                </div>

                <!-- Recomendaciones -->
                <div class="space-y-4">
                    <h4 class="font-medium text-gray-900 dark:text-white">Recomendaciones</h4>
                    <div class="space-y-3 text-sm">
                        {#if estadisticasGenerales.balance < 0}
                            <div class="flex items-start space-x-2 text-red-600">
                                <AlertTriangle size={16} class="mt-0.5 flex-shrink-0" />
                                <span>Tu balance es negativo. Considera reducir gastos o aumentar ingresos.</span>
                            </div>
                        {:else}
                            <div class="flex items-start space-x-2 text-green-600">
                                <CheckCircle size={16} class="mt-0.5 flex-shrink-0" />
                                <span>¡Excelente! Tienes un balance positivo este período.</span>
                            </div>
                        {/if}

                        {#if estadisticasGenerales.totalGastosPersonales > estadisticasGenerales.totalIngresos * 0.3}
                            <div class="flex items-start space-x-2 text-orange-600">
                                <AlertTriangle size={16} class="mt-0.5 flex-shrink-0" />
                                <span>Tus gastos personales representan más del 30% de tus ingresos.</span>
                            </div>
                        {/if}

                        {#if estadisticasGenerales.campanasActivas === 0}
                            <div class="flex items-start space-x-2 text-blue-600">
                                <Target size={16} class="mt-0.5 flex-shrink-0" />
                                <span>Considera crear campañas de marketing para impulsar tus negocios.</span>
                            </div>
                        {/if}
                    </div>
                </div>
            </div>
        </div>
    {/if}
</div> 