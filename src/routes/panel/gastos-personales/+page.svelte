<script lang="ts">
    import { onMount } from 'svelte';
    import { writable } from 'svelte/store';
    import { supabase } from '$lib/supabase/cliente';
    import { perfilUsuario } from '$lib/stores/auth';
    import { mostrarError, mostrarExito } from '$lib/stores/toast';
    import Boton from '$lib/componentes/ui/Boton.svelte';
    import Input from '$lib/componentes/ui/Input.svelte';
    import Modal from '$lib/componentes/ui/Modal.svelte';
    import Cargando from '$lib/componentes/ui/Cargando.svelte';
    import TarjetaEstadistica from '$lib/componentes/ui/TarjetaEstadistica.svelte';
    import { 
        Plus, 
        Search, 
        Filter, 
        Calendar, 
        TrendingDown, 
        DollarSign,
        PieChart,
        FileText,
        Edit,
        Trash2,
        Download
    } from 'lucide-svelte';

    // Tipos específicos para gastos personales
    interface GastoPersonal {
        id: string;
        usuario_id: string;
        categoria_id?: string;
        monto: number;
        descripcion: string;
        fecha_gasto: string;
        metodo_pago?: string;
        ubicacion?: string;
        proveedor?: string;
        es_recurrente: boolean;
        frecuencia_recurrencia?: string;
        fecha_proxima_recurrencia?: string;
        comprobante_url?: string;
        numero_factura?: string;
        tipo_gasto_personal: string;
        impacta_negocios: boolean;
        negocio_relacionado_id?: string;
        notas?: string;
        aprobado: boolean;
        justificacion_requerida: boolean;
        fecha_creacion: string;
        categorias?: {
            id: string;
            nombre: string;
            color: string;
            icono?: string;
        };
    }

    interface CategoriaGasto {
        id: string;
        nombre: string;
        color: string;
        icono?: string;
    }

    // Estados del componente
    const gastosPersonales = writable<GastoPersonal[]>([]);
    const categoriasGastos = writable<CategoriaGasto[]>([]);
    let cargandoGastos = false;
    let mostrarModal = false;
    let editandoGasto: GastoPersonal | null = null;

    // Estados de filtros y búsqueda
    let terminoBusqueda = '';
    let filtroCategoria = '';
    let filtroTipo = '';
    let filtroFechaDesde = '';
    let filtroFechaHasta = '';
    let mostrandoFiltros = false;

    // Formulario para crear/editar gasto
    let formularioGasto = {
        monto: 0,
        descripcion: '',
        fecha_gasto: new Date().toISOString().split('T')[0],
        categoria_id: '',
        metodo_pago: 'efectivo',
        ubicacion: '',
        proveedor: '',
        tipo_gasto_personal: 'general',
        es_recurrente: false,
        frecuencia_recurrencia: '',
        notas: '',
        impacta_negocios: false
    };

    // Opciones para dropdowns
    const tiposGasto = [
        { valor: 'alimentacion', etiqueta: 'Alimentación', icono: '🍽️' },
        { valor: 'transporte', etiqueta: 'Transporte', icono: '🚗' },
        { valor: 'vivienda', etiqueta: 'Vivienda', icono: '🏠' },
        { valor: 'salud', etiqueta: 'Salud', icono: '⚕️' },
        { valor: 'educacion', etiqueta: 'Educación', icono: '📚' },
        { valor: 'entretenimiento', etiqueta: 'Entretenimiento', icono: '🎬' },
        { valor: 'ropa', etiqueta: 'Ropa', icono: '👕' },
        { valor: 'tecnologia', etiqueta: 'Tecnología', icono: '💻' },
        { valor: 'inversiones', etiqueta: 'Inversiones', icono: '📈' },
        { valor: 'seguros', etiqueta: 'Seguros', icono: '🛡️' },
        { valor: 'impuestos', etiqueta: 'Impuestos', icono: '📋' },
        { valor: 'servicios_publicos', etiqueta: 'Servicios Públicos', icono: '⚡' },
        { valor: 'general', etiqueta: 'General', icono: '💼' }
    ];

    const metodosPago = [
        { valor: 'efectivo', etiqueta: 'Efectivo' },
        { valor: 'transferencia', etiqueta: 'Transferencia' },
        { valor: 'tarjeta_credito', etiqueta: 'Tarjeta de Crédito' },
        { valor: 'tarjeta_debito', etiqueta: 'Tarjeta de Débito' },
        { valor: 'cheque', etiqueta: 'Cheque' },
        { valor: 'digital', etiqueta: 'Billetera Digital' },
        { valor: 'crypto', etiqueta: 'Criptomonedas' },
        { valor: 'otro', etiqueta: 'Otro' }
    ];

    const frecuenciasRecurrencia = [
        { valor: 'diaria', etiqueta: 'Diaria' },
        { valor: 'semanal', etiqueta: 'Semanal' },
        { valor: 'quincenal', etiqueta: 'Quincenal' },
        { valor: 'mensual', etiqueta: 'Mensual' },
        { valor: 'bimestral', etiqueta: 'Bimestral' },
        { valor: 'trimestral', etiqueta: 'Trimestral' },
        { valor: 'semestral', etiqueta: 'Semestral' },
        { valor: 'anual', etiqueta: 'Anual' }
    ];

    // Funciones para manejar datos
    const cargarGastosPersonales = async () => {
        try {
            cargandoGastos = true;
            
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                mostrarError('No hay usuario autenticado');
                return;
            }

            let query = supabase
                .from('gastos_personales')
                .select(`
                    *,
                    categorias:categoria_id (
                        id,
                        nombre,
                        color,
                        icono
                    )
                `)
                .eq('usuario_id', user.id)
                .order('fecha_gasto', { ascending: false });

            // Aplicar filtros
            if (filtroCategoria) {
                query = query.eq('categoria_id', filtroCategoria);
            }
            if (filtroTipo) {
                query = query.eq('tipo_gasto_personal', filtroTipo);
            }
            if (filtroFechaDesde) {
                query = query.gte('fecha_gasto', filtroFechaDesde);
            }
            if (filtroFechaHasta) {
                query = query.lte('fecha_gasto', filtroFechaHasta);
            }

            const { data, error } = await query;

            if (error) {
                console.error('Error cargando gastos personales:', error);
                mostrarError('Error al cargar los gastos personales');
                return;
            }

            gastosPersonales.set(data || []);
        } catch (error) {
            console.error('Error en cargarGastosPersonales:', error);
            mostrarError('Error al cargar los gastos personales');
        } finally {
            cargandoGastos = false;
        }
    };

    const cargarCategorias = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('categorias')
                .select('id, nombre, color, icono')
                .eq('usuario_id', user.id)
                .eq('tipo_categoria', 'gasto')
                .eq('activa', true)
                .order('nombre');

            if (error) {
                console.error('Error cargando categorías:', error);
                return;
            }

            categoriasGastos.set(data || []);
        } catch (error) {
            console.error('Error en cargarCategorias:', error);
        }
    };

    const guardarGasto = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                mostrarError('No hay usuario autenticado');
                return;
            }

            const gastoData = {
                ...formularioGasto,
                usuario_id: user.id,
                fecha_creacion: editandoGasto ? undefined : new Date().toISOString(),
                aprobado: true,
                justificacion_requerida: false
            };

            let result;
            if (editandoGasto) {
                // Actualizar gasto existente
                result = await supabase
                    .from('gastos_personales')
                    .update(gastoData)
                    .eq('id', editandoGasto.id)
                    .select(`
                        *,
                        categorias:categoria_id (
                            id,
                            nombre,
                            color,
                            icono
                        )
                    `)
                    .single();
            } else {
                // Crear nuevo gasto
                result = await supabase
                    .from('gastos_personales')
                    .insert([gastoData])
                    .select(`
                        *,
                        categorias:categoria_id (
                            id,
                            nombre,
                            color,
                            icono
                        )
                    `)
                    .single();
            }

            if (result.error) {
                console.error('Error guardando gasto:', result.error);
                mostrarError('Error al guardar el gasto personal');
                return;
            }

            // Actualizar lista local
            if (editandoGasto) {
                gastosPersonales.update(lista => 
                    lista.map(g => g.id === editandoGasto!.id ? result.data : g)
                );
                mostrarExito('Gasto personal actualizado exitosamente');
            } else {
                gastosPersonales.update(lista => [result.data, ...lista]);
                mostrarExito('Gasto personal creado exitosamente');
            }

            cerrarModal();
        } catch (error) {
            console.error('Error en guardarGasto:', error);
            mostrarError('Error al guardar el gasto personal');
        }
    };

    const eliminarGasto = async (id: string) => {
        if (!confirm('¿Estás seguro de que quieres eliminar este gasto personal?')) {
            return;
        }

        try {
            const { error } = await supabase
                .from('gastos_personales')
                .delete()
                .eq('id', id);

            if (error) {
                console.error('Error eliminando gasto:', error);
                mostrarError('Error al eliminar el gasto personal');
                return;
            }

            gastosPersonales.update(lista => lista.filter(g => g.id !== id));
            mostrarExito('Gasto personal eliminado exitosamente');
        } catch (error) {
            console.error('Error en eliminarGasto:', error);
            mostrarError('Error al eliminar el gasto personal');
        }
    };

    const abrirModalCrear = () => {
        editandoGasto = null;
        formularioGasto = {
            monto: 0,
            descripcion: '',
            fecha_gasto: new Date().toISOString().split('T')[0],
            categoria_id: '',
            metodo_pago: 'efectivo',
            ubicacion: '',
            proveedor: '',
            tipo_gasto_personal: 'general',
            es_recurrente: false,
            frecuencia_recurrencia: '',
            notas: '',
            impacta_negocios: false
        };
        mostrarModal = true;
    };

    const abrirModalEditar = (gasto: GastoPersonal) => {
        editandoGasto = gasto;
        formularioGasto = {
            monto: gasto.monto,
            descripcion: gasto.descripcion,
            fecha_gasto: gasto.fecha_gasto,
            categoria_id: gasto.categoria_id || '',
            metodo_pago: gasto.metodo_pago || 'efectivo',
            ubicacion: gasto.ubicacion || '',
            proveedor: gasto.proveedor || '',
            tipo_gasto_personal: gasto.tipo_gasto_personal,
            es_recurrente: gasto.es_recurrente,
            frecuencia_recurrencia: gasto.frecuencia_recurrencia || '',
            notas: gasto.notas || '',
            impacta_negocios: gasto.impacta_negocios
        };
        mostrarModal = true;
    };

    const cerrarModal = () => {
        mostrarModal = false;
        editandoGasto = null;
    };

    const formatearMoneda = (monto: number): string => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(monto);
    };

    const formatearFecha = (fecha: string): string => {
        return new Date(fecha).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const obtenerIconoTipo = (tipo: string): string => {
        const tipoEncontrado = tiposGasto.find(t => t.valor === tipo);
        return tipoEncontrado?.icono || '💼';
    };

    const aplicarFiltros = () => {
        cargarGastosPersonales();
        mostrandoFiltros = false;
    };

    const limpiarFiltros = () => {
        terminoBusqueda = '';
        filtroCategoria = '';
        filtroTipo = '';
        filtroFechaDesde = '';
        filtroFechaHasta = '';
        cargarGastosPersonales();
    };

    // Estados derivados para estadísticas
    $: gastosData = $gastosPersonales;
    $: totalGastos = gastosData.reduce((sum, g) => sum + g.monto, 0);
    $: gastosMesActual = gastosData.filter(g => {
        const fechaGasto = new Date(g.fecha_gasto);
        const ahora = new Date();
        return fechaGasto.getMonth() === ahora.getMonth() && 
               fechaGasto.getFullYear() === ahora.getFullYear();
    }).reduce((sum, g) => sum + g.monto, 0);
    $: promedioGastos = gastosData.length > 0 ? totalGastos / gastosData.length : 0;
    $: gastosRecurrentes = gastosData.filter(g => g.es_recurrente).length;

    // Filtrar gastos por búsqueda
    $: gastosFiltrados = gastosData.filter(gasto => {
        const cumpleBusqueda = terminoBusqueda === '' || 
            gasto.descripcion.toLowerCase().includes(terminoBusqueda.toLowerCase()) ||
            gasto.proveedor?.toLowerCase().includes(terminoBusqueda.toLowerCase()) ||
            gasto.ubicacion?.toLowerCase().includes(terminoBusqueda.toLowerCase());
        
        return cumpleBusqueda;
    });

    onMount(() => {
        Promise.all([
            cargarGastosPersonales(),
            cargarCategorias()
        ]);
    });
</script>

<svelte:head>
    <title>Gastos Personales - Contabilidad Pro</title>
</svelte:head>

<div class="space-y-8">
    <!-- Header de la página -->
    <div class="bg-gradient-to-r from-red-600 to-pink-600 rounded-2xl p-8 text-white">
        <div class="flex items-center justify-between">
            <div>
                <h1 class="text-3xl font-bold mb-2">
                    Gastos Personales 💸
                </h1>
                <p class="text-red-100 text-lg">
                    Controla y gestiona todos tus gastos personales de manera inteligente
                </p>
            </div>
            <div class="hidden md:block">
                <div class="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center">
                    <TrendingDown size={48} />
                </div>
            </div>
        </div>
    </div>

    <!-- Estadísticas principales -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <TarjetaEstadistica
            titulo="Total Gastado"
            valor={formatearMoneda(totalGastos)}
            icono={DollarSign}
            color="rojo"
        />
        
        <TarjetaEstadistica
            titulo="Gastos del Mes"
            valor={formatearMoneda(gastosMesActual)}
            icono={Calendar}
            color="naranja"
        />
        
        <TarjetaEstadistica
            titulo="Promedio por Gasto"
            valor={formatearMoneda(promedioGastos)}
            icono={PieChart}
            color="azul"
        />
        
        <TarjetaEstadistica
            titulo="Gastos Recurrentes"
            valor={gastosRecurrentes.toString()}
            icono={FileText}
            color="morado"
        />
    </div>

    <!-- Barra de herramientas -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <!-- Búsqueda -->
            <div class="flex-1 max-w-md">
                <div class="relative">
                    <Search size={20} class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar gastos..."
                        bind:value={terminoBusqueda}
                        class="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                </div>
            </div>

            <!-- Botones de acción -->
            <div class="flex items-center gap-3">
                <Boton 
                    variante="ghost" 
                    tamaño="sm"
                    on:click={() => mostrandoFiltros = !mostrandoFiltros}
                >
                    <Filter size={16} class="mr-2" />
                    Filtros
                </Boton>

                <Boton 
                    variante="ghost" 
                    tamaño="sm"
                >
                    <Download size={16} class="mr-2" />
                    Exportar
                </Boton>

                <Boton 
                    variante="primary" 
                    on:click={abrirModalCrear}
                >
                    <Plus size={16} class="mr-2" />
                    Nuevo Gasto
                </Boton>
            </div>
        </div>

        <!-- Panel de filtros expandible -->
        {#if mostrandoFiltros}
            <div class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <!-- Filtro por categoría -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Categoría
                        </label>
                        <select 
                            bind:value={filtroCategoria}
                            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        >
                            <option value="">Todas las categorías</option>
                            {#each $categoriasGastos as categoria}
                                <option value={categoria.id}>{categoria.nombre}</option>
                            {/each}
                        </select>
                    </div>

                    <!-- Filtro por tipo -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Tipo de Gasto
                        </label>
                        <select 
                            bind:value={filtroTipo}
                            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        >
                            <option value="">Todos los tipos</option>
                            {#each tiposGasto as tipo}
                                <option value={tipo.valor}>{tipo.icono} {tipo.etiqueta}</option>
                            {/each}
                        </select>
                    </div>

                    <!-- Filtro por fecha desde -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Desde
                        </label>
                        <input
                            type="date"
                            bind:value={filtroFechaDesde}
                            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        />
                    </div>

                    <!-- Filtro por fecha hasta -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Hasta
                        </label>
                        <input
                            type="date"
                            bind:value={filtroFechaHasta}
                            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        />
                    </div>
                </div>

                <!-- Botones de filtros -->
                <div class="flex items-center gap-3 mt-4">
                    <Boton 
                        variante="primary" 
                        tamaño="sm"
                        on:click={aplicarFiltros}
                    >
                        Aplicar Filtros
                    </Boton>
                    
                    <Boton 
                        variante="ghost" 
                        tamaño="sm"
                        on:click={limpiarFiltros}
                    >
                        Limpiar
                    </Boton>
                </div>
            </div>
        {/if}
    </div>

    <!-- Lista de gastos personales -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        {#if cargandoGastos}
            <div class="flex items-center justify-center py-12">
                <Cargando tamaño="md" mensaje="Cargando gastos personales..." />
            </div>
        {:else if gastosFiltrados.length === 0}
            <div class="text-center py-12">
                <TrendingDown size={48} class="mx-auto text-gray-400 mb-4" />
                <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No hay gastos personales
                </h3>
                <p class="text-gray-500 dark:text-gray-400 mb-6">
                    {terminoBusqueda ? 'No se encontraron gastos que coincidan con tu búsqueda.' : 'Comienza registrando tu primer gasto personal.'}
                </p>
                {#if !terminoBusqueda}
                    <Boton variante="primary" on:click={abrirModalCrear}>
                        <Plus size={16} class="mr-2" />
                        Crear Primer Gasto
                    </Boton>
                {/if}
            </div>
        {:else}
            <div class="overflow-hidden">
                <!-- Header de la tabla -->
                <div class="bg-gray-50 dark:bg-gray-700 px-6 py-3 border-b border-gray-200 dark:border-gray-600">
                    <div class="grid grid-cols-12 gap-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        <div class="col-span-3">Descripción</div>
                        <div class="col-span-2">Tipo</div>
                        <div class="col-span-2">Monto</div>
                        <div class="col-span-2">Fecha</div>
                        <div class="col-span-2">Método</div>
                        <div class="col-span-1">Acciones</div>
                    </div>
                </div>

                <!-- Filas de gastos -->
                <div class="divide-y divide-gray-200 dark:divide-gray-700">
                    {#each gastosFiltrados as gasto}
                        <div class="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                            <div class="grid grid-cols-12 gap-4 items-center">
                                <!-- Descripción -->
                                <div class="col-span-3">
                                    <div class="flex items-start space-x-3">
                                        <div class="flex-shrink-0">
                                            <div class="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-lg">
                                                {obtenerIconoTipo(gasto.tipo_gasto_personal)}
                                            </div>
                                        </div>
                                        <div class="min-w-0 flex-1">
                                            <p class="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                {gasto.descripcion}
                                            </p>
                                            {#if gasto.proveedor}
                                                <p class="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                    {gasto.proveedor}
                                                </p>
                                            {/if}
                                            {#if gasto.es_recurrente}
                                                <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                                                    🔄 Recurrente
                                                </span>
                                            {/if}
                                        </div>
                                    </div>
                                </div>

                                <!-- Tipo -->
                                <div class="col-span-2">
                                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                        {tiposGasto.find(t => t.valor === gasto.tipo_gasto_personal)?.etiqueta || gasto.tipo_gasto_personal}
                                    </span>
                                </div>

                                <!-- Monto -->
                                <div class="col-span-2">
                                    <div class="text-sm font-semibold text-red-600 dark:text-red-400">
                                        -{formatearMoneda(gasto.monto)}
                                    </div>
                                    {#if gasto.categorias}
                                        <div class="flex items-center mt-1">
                                            <div 
                                                class="w-3 h-3 rounded-full mr-1"
                                                style="background-color: {gasto.categorias.color}"
                                            ></div>
                                            <span class="text-xs text-gray-500 dark:text-gray-400">
                                                {gasto.categorias.nombre}
                                            </span>
                                        </div>
                                    {/if}
                                </div>

                                <!-- Fecha -->
                                <div class="col-span-2">
                                    <div class="text-sm text-gray-900 dark:text-white">
                                        {formatearFecha(gasto.fecha_gasto)}
                                    </div>
                                    {#if gasto.ubicacion}
                                        <div class="text-xs text-gray-500 dark:text-gray-400">
                                            📍 {gasto.ubicacion}
                                        </div>
                                    {/if}
                                </div>

                                <!-- Método de pago -->
                                <div class="col-span-2">
                                    <span class="text-sm text-gray-700 dark:text-gray-300">
                                        {metodosPago.find(m => m.valor === gasto.metodo_pago)?.etiqueta || gasto.metodo_pago || 'N/A'}
                                    </span>
                                </div>

                                <!-- Acciones -->
                                <div class="col-span-1">
                                    <div class="flex items-center space-x-2">
                                        <button 
                                            on:click={() => abrirModalEditar(gasto)}
                                            class="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button 
                                            on:click={() => eliminarGasto(gasto.id)}
                                            class="text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    {/each}
                </div>
            </div>
        {/if}
    </div>
</div>

<!-- Modal para crear/editar gasto -->
<Modal bind:abierto={mostrarModal} titulo={editandoGasto ? 'Editar Gasto Personal' : 'Nuevo Gasto Personal'}>
    <form on:submit|preventDefault={guardarGasto} class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Monto -->
            <div>
                <Input
                    etiqueta="Monto *"
                    tipo="number"
                    paso="0.01"
                    min="0.01"
                    bind:valor={formularioGasto.monto}
                    obligatorio
                />
            </div>

            <!-- Fecha -->
            <div>
                <Input
                    etiqueta="Fecha del Gasto *"
                    tipo="date"
                    bind:valor={formularioGasto.fecha_gasto}
                    obligatorio
                />
            </div>

            <!-- Descripción -->
            <div class="md:col-span-2">
                <Input
                    etiqueta="Descripción *"
                    tipo="text"
                    placeholder="Describe el gasto..."
                    bind:valor={formularioGasto.descripcion}
                    obligatorio
                />
            </div>

            <!-- Tipo de gasto -->
            <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tipo de Gasto *
                </label>
                <select 
                    bind:value={formularioGasto.tipo_gasto_personal}
                    required
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                    {#each tiposGasto as tipo}
                        <option value={tipo.valor}>{tipo.icono} {tipo.etiqueta}</option>
                    {/each}
                </select>
            </div>

            <!-- Categoría -->
            <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Categoría
                </label>
                <select 
                    bind:value={formularioGasto.categoria_id}
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                    <option value="">Sin categoría</option>
                    {#each $categoriasGastos as categoria}
                        <option value={categoria.id}>{categoria.nombre}</option>
                    {/each}
                </select>
            </div>

            <!-- Método de pago -->
            <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Método de Pago
                </label>
                <select 
                    bind:value={formularioGasto.metodo_pago}
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                    {#each metodosPago as metodo}
                        <option value={metodo.valor}>{metodo.etiqueta}</option>
                    {/each}
                </select>
            </div>

            <!-- Proveedor -->
            <div>
                <Input
                    etiqueta="Proveedor/Comercio"
                    tipo="text"
                    placeholder="Nombre del proveedor..."
                    bind:valor={formularioGasto.proveedor}
                />
            </div>

            <!-- Ubicación -->
            <div class="md:col-span-2">
                <Input
                    etiqueta="Ubicación"
                    tipo="text"
                    placeholder="Dónde se realizó el gasto..."
                    bind:valor={formularioGasto.ubicacion}
                />
            </div>

            <!-- Gasto recurrente -->
            <div class="md:col-span-2">
                <div class="flex items-center space-x-3">
                    <input
                        type="checkbox"
                        id="es_recurrente"
                        bind:checked={formularioGasto.es_recurrente}
                        class="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                    />
                    <label for="es_recurrente" class="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Este es un gasto recurrente
                    </label>
                </div>

                {#if formularioGasto.es_recurrente}
                    <div class="mt-3">
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Frecuencia de Recurrencia
                        </label>
                        <select 
                            bind:value={formularioGasto.frecuencia_recurrencia}
                            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        >
                            <option value="">Seleccionar frecuencia</option>
                            {#each frecuenciasRecurrencia as frecuencia}
                                <option value={frecuencia.valor}>{frecuencia.etiqueta}</option>
                            {/each}
                        </select>
                    </div>
                {/if}
            </div>

            <!-- Impacta negocios -->
            <div class="md:col-span-2">
                <div class="flex items-center space-x-3">
                    <input
                        type="checkbox"
                        id="impacta_negocios"
                        bind:checked={formularioGasto.impacta_negocios}
                        class="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                    />
                    <label for="impacta_negocios" class="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Este gasto impacta mis negocios
                    </label>
                </div>
            </div>

            <!-- Notas -->
            <div class="md:col-span-2">
                <Input
                    etiqueta="Notas"
                    tipo="textarea"
                    placeholder="Notas adicionales sobre el gasto..."
                    bind:valor={formularioGasto.notas}
                />
            </div>
        </div>

        <!-- Botones del modal -->
        <div class="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Boton 
                variante="ghost" 
                type="button"
                on:click={cerrarModal}
            >
                Cancelar
            </Boton>
            <Boton 
                variante="primary" 
                type="submit"
            >
                {editandoGasto ? 'Actualizar' : 'Crear'} Gasto
            </Boton>
        </div>
    </form>
</Modal> 