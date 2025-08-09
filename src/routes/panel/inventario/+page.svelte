<script lang="ts">
    import { onMount } from 'svelte';
    import { Package, Plus, Search, AlertTriangle, Warehouse, TrendingDown, BarChart3, Download, Filter, Building2 } from 'lucide-svelte';
    import { 
        productos, 
        categoriasProductos,
        estadisticasInventario,
        productosStockBajo,
        cargarProductos,
        cargarCategoriasProductos,
        crearProducto,
        actualizarProducto,
        crearCategoriaProducto,
        generarCodigoProducto,
        exportarProductosCSV,
        cargandoProductos
    } from '$lib/stores/inventario';
    import { negocioActual, negocios, cargarNegocios } from '$lib/stores/negocios';
    import { user } from '$lib/stores/auth';
    import { mostrarError, mostrarExito } from '$lib/stores/toast';
    import { formatearMoneda } from '$lib/utils/formato-moneda';
    import { TIPOS_PRODUCTO, ESTADOS_PRODUCTO, UNIDADES_MEDIDA } from '$lib/tipos/clientes-inventario';
    import type { Producto } from '$lib/tipos/clientes-inventario';
    import Cargando from '$lib/componentes/ui/Cargando.svelte';
    import TarjetaEstadistica from '$lib/componentes/ui/TarjetaEstadistica.svelte';
    import Modal from '$lib/componentes/ui/Modal.svelte';
    import Boton from '$lib/componentes/ui/Boton.svelte';
    import Input from '$lib/componentes/ui/Input.svelte';

    // Estado local
    let busqueda = '';
    let filtroCategoria = '';
    let filtroEstado = '';
    let mostrarModalProducto = false;
    let productoSeleccionado: Producto | null = null;
    let vistaActual: 'tabla' | 'tarjetas' = 'tabla';
    let negocioFiltroSeleccionado = '';
    let mostrarModalNuevaCategoria = false;
    let formCategoria = {
        nombre: '',
        descripcion: '',
        color: '#3B82F6',
        icono: '📦'
    };
    
    // Productos filtrados por negocio
    $: productosVisibles = negocioFiltroSeleccionado 
        ? $productos.filter(p => p.negocio_id === negocioFiltroSeleccionado)
        : $productos;
        
    // Función para mostrar modal de categoría
    const mostrarModalCategoria = () => {
        mostrarModalNuevaCategoria = true;
        formCategoria = {
            nombre: '',
            descripcion: '',
            color: '#3B82F6',
            icono: '📦'
        };
    };

    // Datos del formulario de producto
    let formProducto = {
        negocio_id: '',
        codigo: '',
        nombre: '',
        descripcion: '',
        marca: '',
        categoria_producto_id: '',
        precio_compra: 0,
        precio_venta: 0,
        stock_actual: 0,
        stock_minimo: 0,
        tipo_producto: 'fisico',
        estado: 'activo'
    };
    
    // Función para crear nueva categoría
    const crearNuevaCategoria = async () => {
        console.log('🔥 Intentando crear categoría:', formCategoria);
        console.log('🏢 Negocio seleccionado:', formProducto.negocio_id);
        console.log('👤 Usuario actual:', $user?.id);
        
        // QUITAR ESTA VALIDACIÓN PROBLEMÁTICA - El formulario ya tiene validación HTML
        // if (!formCategoria.nombre || !formCategoria.nombre.trim()) {
        //     mostrarError('El nombre de la categoría es requerido');
        //     return;
        // }
        
        if (!formProducto.negocio_id) {
            mostrarError('Debes seleccionar un negocio primero en el formulario de producto');
            return;
        }
        
        try {
            cargandoProductos.set(true);
            
            console.log('🔥 Datos que vamos a enviar:', {
                negocio_id: formProducto.negocio_id,
                nombre: formCategoria.nombre,
                descripcion: formCategoria.descripcion,
                color: formCategoria.color,
                icono: formCategoria.icono,
                activa: true
            });

            const nuevaCategoria = await crearCategoriaProducto({
                negocio_id: formProducto.negocio_id,
                nombre: formCategoria.nombre || '',
                descripcion: formCategoria.descripcion || '',
                color: formCategoria.color || '#3B82F6',
                icono: formCategoria.icono || '📦',
                activa: true
            });
            
            console.log('✅ Categoría creada:', nuevaCategoria);
            
            if (nuevaCategoria) {
                mostrarExito(`Categoría "${formCategoria.nombre}" creada exitosamente`);
                
                // Resetear formulario
                formCategoria = {
                    nombre: '',
                    descripcion: '',
                    color: '#3B82F6',
                    icono: '📦'
                };
                
                // Cerrar modal
                mostrarModalNuevaCategoria = false;
                
                // Recargar categorías
                await cargarCategoriasProductos(formProducto.negocio_id);
                
                // Seleccionar la nueva categoría automáticamente
                formProducto.categoria_producto_id = nuevaCategoria.id;
                
                console.log('🎯 Categoría seleccionada automáticamente');
            }
        } catch (error) {
            console.error('❌ Error al crear categoría:', error);
            mostrarError('Error al crear la categoría: ' + (error?.message || 'Error desconocido'));
        } finally {
            cargandoProductos.set(false);
        }
    };

    // Función para cambiar filtro de negocio
    const cambiarFiltroNegocio = async () => {
        if (negocioFiltroSeleccionado) {
            await Promise.all([
                cargarProductos(negocioFiltroSeleccionado),
                cargarCategoriasProductos(negocioFiltroSeleccionado)
            ]);
        } else {
            // Cargar todos los productos si no hay filtro
            await cargarProductos();
        }
    };

    // Cargar datos al montar
    onMount(async () => {
        console.log('🚀 Iniciando inventario simple');
        
        if (!$user) {
            mostrarError('Debes iniciar sesión');
            return;
        }
        
        try {
            // Cargar negocios SIN bucles
            console.log('🏢 Cargando negocios...');
            await cargarNegocios();
            console.log('✅ Negocios:', $negocios.length);
            
            // Cargar productos
            console.log('📦 Cargando productos...');
            await cargarProductos();
            console.log('✅ Productos:', $productos.length);
            
        } catch (error: any) {
            console.error('❌ Error simple:', error);
            mostrarError('Error al cargar datos');
        }
    });

    // Filtrar productos
    $: productosFiltrados = $productos.filter(producto => {
        const coincideBusqueda = !busqueda || 
            producto.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
            producto.codigo.toLowerCase().includes(busqueda.toLowerCase()) ||
            producto.marca?.toLowerCase().includes(busqueda.toLowerCase());
        
        const coincideCategoria = !filtroCategoria || producto.categoria_producto_id === filtroCategoria;
        const coincideEstado = !filtroEstado || producto.estado === filtroEstado;
        
        return coincideBusqueda && coincideCategoria && coincideEstado;
    });

    // Abrir modal para nuevo producto
    const abrirModalNuevoProducto = async () => {
        productoSeleccionado = null;
        
        // Código simple único
        const codigoSimple = `PROD-${Date.now()}`;
        
        formProducto = {
            negocio_id: $negocios.length > 0 ? $negocios[0].id : '',
            codigo: codigoSimple,
            nombre: '',
            descripcion: '',
            marca: '',
            categoria_producto_id: '',
            precio_compra: 10000,
            precio_venta: 49000,
            stock_actual: 1,
            stock_minimo: 1,
            tipo_producto: 'fisico',
            estado: 'activo'
        };
        
        // Cargar categorías SOLO si hay negocio
        if (formProducto.negocio_id) {
            await cargarCategoriasProductos(formProducto.negocio_id);
        }
        
        mostrarModalProducto = true;
        
        console.log('✅ Modal abierto con código:', codigoSimple);
    };

    // Función para abrir modal de nueva categoría
    const abrirModalNuevaCategoria = () => {
        console.log('🔥 Abriendo modal categoría, negocio:', formProducto.negocio_id);
        
        if (!formProducto.negocio_id) {
            mostrarError('Debes seleccionar un negocio primero en el formulario de producto');
            return;
        }
        
        formCategoria = {
            nombre: '',
            descripcion: '',
            color: '#3B82F6',
            icono: '📦'
        };
        mostrarModalNuevaCategoria = true;
        console.log('✅ Modal de categoría abierto');
    };

    // Editar producto
    const editarProducto = (producto: Producto) => {
        productoSeleccionado = producto;
        formProducto = {
            negocio_id: producto.negocio_id,
            codigo: producto.codigo,
            nombre: producto.nombre,
            descripcion: producto.descripcion || '',
            marca: producto.marca || '',
            categoria_producto_id: producto.categoria_producto_id || '',
            precio_compra: producto.precio_compra,
            precio_venta: producto.precio_venta,
            stock_actual: producto.stock_actual,
            stock_minimo: producto.stock_minimo,
            tipo_producto: producto.tipo_producto,
            estado: producto.estado
        };
        mostrarModalProducto = true;
    };

    // Guardar producto
    const guardarProducto = async (event) => {
        // PREVENIR ENVÍO MÚLTIPLE
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        
        // PREVENIR BUCLE - Solo permitir una ejecución a la vez
        if ($cargandoProductos) {
            console.log('🛑 YA SE ESTÁ CREANDO, IGNORANDO...');
            return;
        }
        
        // Establecer estado de carga INMEDIATAMENTE
        cargandoProductos.set(true);
        
        console.log('🚀 INTENTANDO CREAR PRODUCTO:', formProducto);
        
                // Validaciones detalladas
        if (!formProducto.negocio_id) {
            mostrarError('❌ Debes seleccionar un negocio');
            console.log('❌ Falta negocio_id');
            cargandoProductos.set(false);
            return;
        }

        if (!formProducto.nombre || formProducto.nombre.trim() === '') {
            mostrarError('❌ El NOMBRE del producto es obligatorio');
            console.log('❌ Falta nombre:', formProducto.nombre);
            cargandoProductos.set(false);
            return;
        }

        if (!formProducto.codigo || formProducto.codigo.trim() === '') {
            mostrarError('❌ El CÓDIGO del producto es obligatorio');
            console.log('❌ Falta código:', formProducto.codigo);
            cargandoProductos.set(false);
            return;
        }

        if (formProducto.precio_venta <= 0) {
            mostrarError('❌ El precio de venta debe ser mayor a 0');
            console.log('❌ Precio de venta inválido:', formProducto.precio_venta);
            cargandoProductos.set(false);
            return;
        }

        try {
            console.log('✅ Validaciones pasadas, creando producto...');
            
            const datosProducto = {
                ...formProducto,
                nombre: formProducto.nombre.trim(),
                codigo: formProducto.codigo.trim()
            };

            console.log('📦 Datos finales a enviar:', datosProducto);

            let resultado;
            if (productoSeleccionado) {
                // Para editar usamos actualizarProducto
                resultado = await actualizarProducto(productoSeleccionado.id, datosProducto);
            } else {
                // Para crear usamos crearProducto
                resultado = await crearProducto(datosProducto);
            }
            
            console.log('🎯 Resultado de creación:', resultado);
            
            if (resultado) {
                console.log('🎉 PRODUCTO CREADO EXITOSAMENTE!');
                mostrarModalProducto = false;
                mostrarExito('🎉 Producto creado exitosamente!');
                
                // Recargar TANTO productos COMO categorías
                if (formProducto.negocio_id) {
                    console.log('🔄 Recargando datos...');
                    await Promise.all([
                        cargarProductos(formProducto.negocio_id),
                        cargarCategoriasProductos(formProducto.negocio_id)
                    ]);
                    console.log('✅ Datos recargados');
                }
                
                // Limpiar formulario
                productoSeleccionado = null;
                console.log('✅ Proceso completado');
            } else {
                mostrarError('❌ Error: No se pudo crear el producto');
                console.log('❌ Resultado fue null/false');
            }
        } catch (error) {
            console.error('💥 Error en guardarProducto:', error);
            mostrarError('❌ Error al crear el producto: ' + (error?.message || 'Error desconocido'));
        } finally {
            cargandoProductos.set(false);
        }
    };

    // Exportar productos
    const exportarProductos = async () => {
        const csv = await exportarProductosCSV($negocioActual?.id);
        if (csv) {
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `inventario-${new Date().getTime()}.csv`);
            link.click();
        }
    };

    // Obtener alerta de stock
    const obtenerAlertaStock = (producto: Producto) => {
        if (producto.stock_actual <= 0) {
            return { nivel: 'critico', clase: 'bg-red-100 text-red-800 border-red-200', mensaje: 'Sin stock' };
        } else if (producto.stock_actual <= producto.stock_minimo) {
            return { nivel: 'bajo', clase: 'bg-yellow-100 text-yellow-800 border-yellow-200', mensaje: 'Stock bajo' };
        } else {
            return { nivel: 'normal', clase: 'bg-green-100 text-green-800 border-green-200', mensaje: 'Stock normal' };
        }
    };

    // Obtener color de tipo de producto
    const obtenerColorTipo = (tipo: string) => {
        const colores = {
            'fisico': 'bg-blue-100 text-blue-800',
            'servicio': 'bg-purple-100 text-purple-800',
            'digital': 'bg-green-100 text-green-800'
        };
        return colores[tipo] || 'bg-gray-100 text-gray-800';
    };
</script>

<div class="p-6 space-y-6">
    <!-- Header -->
    <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
                <Package class="w-8 h-8 text-blue-500" />
                Gestión de Inventario
            </h1>
            <p class="text-gray-600 dark:text-gray-400 mt-1">
                Controla tu stock, productos y movimientos de inventario
            </p>
        </div>
        
        <div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <!-- Selector de Negocio -->
            <div class="flex items-center gap-3">
                <div class="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                    <Building2 class="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Filtrar por Negocio
                    </label>
                    <select 
                        bind:value={negocioFiltroSeleccionado}
                        on:change={cambiarFiltroNegocio}
                        class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm min-w-48"
                    >
                        <option value="">Todos los negocios</option>
                        {#each $negocios as negocio}
                            <option value={negocio.id}>{negocio.nombre}</option>
                        {/each}
                    </select>
                </div>
            </div>
            
            <!-- Botones de acción -->
            <div class="flex flex-wrap gap-3">
                <Boton 
                    variant="outline" 
                    size="md"
                    icon={Download}
                    on:click={exportarProductos}
                >
                    Exportar
                </Boton>
                
                <Boton 
                    variant="gradient"
                    size="md" 
                    icon={Plus}
                    pulse={true}
                    on:click={abrirModalNuevoProducto}
                >
                    Nuevo Producto
                </Boton>
            </div>
        </div>
    </div>

    <!-- Estadísticas -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <TarjetaEstadistica
            titulo="Total Productos"
            valor={$estadisticasInventario.total_productos.toString()}
            icono={Package}
            color="azul"
        />
        
        <TarjetaEstadistica
            titulo="Productos Activos"
            valor={$estadisticasInventario.productos_activos.toString()}
            icono={Warehouse}
            color="verde"
        />
        
        <TarjetaEstadistica
            titulo="Stock Bajo"
            valor={$estadisticasInventario.productos_stock_bajo.toString()}
            icono={AlertTriangle}
            color="naranja"
        />
        
        <TarjetaEstadistica
            titulo="Valor Inventario"
            valor={formatearMoneda($estadisticasInventario.valor_total_inventario)}
            icono={BarChart3}
            color="morado"
        />
    </div>

    <!-- Alertas de stock bajo -->
    {#if $productosStockBajo.length > 0}
        <div class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
            <div class="flex items-center gap-3 mb-3">
                <AlertTriangle class="w-5 h-5 text-yellow-600" />
                <h3 class="font-medium text-yellow-800 dark:text-yellow-200">
                    Productos con Stock Bajo ({$productosStockBajo.length})
                </h3>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {#each $productosStockBajo.slice(0, 6) as producto}
                    <div class="bg-white dark:bg-gray-800 p-3 rounded-lg border">
                        <div class="font-medium text-gray-900 dark:text-gray-100 text-sm">
                            {producto.nombre}
                        </div>
                        <div class="text-xs text-gray-500 mt-1">
                            Stock: {producto.stock_actual} / Mín: {producto.stock_minimo}
                        </div>
                    </div>
                {/each}
            </div>
        </div>
    {/if}

    <!-- Filtros y búsqueda -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div class="flex flex-col lg:flex-row gap-4">
            <!-- Búsqueda -->
            <div class="flex-1 relative">
                <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                    bind:value={busqueda}
                    placeholder="Buscar por nombre, código o marca..."
                    class="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
            </div>
            
            <!-- Filtro por categoría -->
            <select 
                bind:value={filtroCategoria}
                class="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
                <option value="">Todas las categorías</option>
                {#each $categoriasProductos as categoria}
                    <option value={categoria.id}>{categoria.nombre}</option>
                {/each}
            </select>
            
            <!-- Filtro por estado -->
            <select 
                bind:value={filtroEstado}
                class="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
                <option value="">Todos los estados</option>
                {#each ESTADOS_PRODUCTO as estado}
                    <option value={estado.value}>{estado.label}</option>
                {/each}
            </select>
        </div>
    </div>

    <!-- Lista de productos -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <!-- Header de la tabla -->
        <div class="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Productos ({productosFiltrados.length})
            </h3>
        </div>

        {#if $cargandoProductos}
            <div class="p-8">
                <Cargando />
            </div>
        {:else if productosFiltrados.length === 0}
            <div class="p-8 text-center">
                <Package class="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    No hay productos
                </h3>
                <p class="text-gray-500 mb-4">
                    {$productos.length === 0 ? 'Comienza agregando tu primer producto' : 'No se encontraron productos con los filtros aplicados'}
                </p>
                {#if $productos.length === 0}
                    <Boton on:click={abrirModalNuevoProducto}>
                        Agregar Producto
                    </Boton>
                {/if}
            </div>
        {:else}
            <!-- Tabla de productos -->
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead class="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Producto
                            </th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Tipo
                            </th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Stock
                            </th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Precios
                            </th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Estado
                            </th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Acciones
                            </th>
                        </tr>
                    </thead>
                    <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {#each productosFiltrados as producto}
                            {@const alerta = obtenerAlertaStock(producto)}
                            <tr class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                <!-- Producto -->
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <div class="flex items-center space-x-3">
                                        <div class="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-semibold">
                                            📦
                                        </div>
                                        <div>
                                            <div class="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                {producto.nombre}
                                            </div>
                                            <div class="text-sm text-gray-500">
                                                {producto.codigo} {producto.marca ? `• ${producto.marca}` : ''}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                
                                <!-- Tipo -->
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {obtenerColorTipo(producto.tipo_producto)}">
                                        {TIPOS_PRODUCTO.find(t => t.value === producto.tipo_producto)?.label}
                                    </span>
                                </td>
                                
                                <!-- Stock -->
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <div class="text-sm font-medium text-gray-900 dark:text-gray-100">
                                        {producto.stock_actual} {producto.unidad_medida}
                                    </div>
                                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium {alerta.clase}">
                                        {alerta.mensaje}
                                    </span>
                                </td>
                                
                                <!-- Precios -->
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <div class="text-sm text-gray-900 dark:text-gray-100">
                                        Compra: {formatearMoneda(producto.precio_compra)}
                                    </div>
                                    <div class="text-sm font-medium text-green-600">
                                        Venta: {formatearMoneda(producto.precio_venta)}
                                    </div>
                                </td>
                                
                                <!-- Estado -->
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {
                                        producto.estado === 'activo' ? 'bg-green-100 text-green-800' :
                                        producto.estado === 'inactivo' ? 'bg-gray-100 text-gray-800' :
                                        'bg-red-100 text-red-800'
                                    }">
                                        {ESTADOS_PRODUCTO.find(e => e.value === producto.estado)?.label}
                                    </span>
                                </td>
                                
                                <!-- Acciones -->
                                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                        on:click={() => editarProducto(producto)}
                                        class="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                    >
                                        Editar
                                    </button>
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        {/if}
    </div>
</div>

<!-- Modal de Producto -->
<Modal bind:abierto={mostrarModalProducto} titulo="{productoSeleccionado ? 'Editar' : 'Nuevo'} Producto" tamaño="lg">
    <form class="space-y-6">
        
        <!-- ✨ INFORMACIÓN BÁSICA ✨ -->
        <div class="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-6">
            <h4 class="text-lg font-bold text-blue-800 dark:text-blue-200 mb-4 flex items-center gap-2">
                📋 Información Básica
            </h4>
            
            <!-- Selección de Negocio PRIMERO -->
            <div class="mb-6 p-4 bg-blue-100 dark:bg-blue-900/30 rounded-lg border border-blue-300 dark:border-blue-600">
                <label class="block text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">
                    Negocio * (Obligatorio)
                </label>
                <select 
                    bind:value={formProducto.negocio_id}
                    class="w-full px-4 py-3 border border-blue-300 dark:border-blue-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-medium text-sm"
                    required
                >
                    <option value="">Seleccionar negocio</option>
                    {#each $negocios as negocio}
                        <option value={negocio.id}>{negocio.nombre}</option>
                    {/each}
                </select>
                {#if !formProducto.negocio_id}
                    <p class="text-xs text-red-600 dark:text-red-400 mt-1">
                        ⚠️ Debes seleccionar un negocio antes de crear el producto
                    </p>
                {/if}
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">
                        Código del Producto *
                    </label>
                    <input
                        type="text"
                        bind:value={formProducto.codigo}
                        placeholder="Se genera automáticamente"
                        class="w-full px-4 py-3 border border-blue-300 dark:border-blue-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-medium text-sm"
                        required
                        readonly
                    />
                    <p class="text-xs text-gray-500 mt-1">✅ Código único generado automáticamente</p>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">
                        Nombre del Producto *
                    </label>
                    <input
                        type="text"
                        bind:value={formProducto.nombre}
                        placeholder="Ej: Tutorial de acordeón"
                        class="w-full px-4 py-3 border border-blue-300 dark:border-blue-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-medium text-sm"
                        required
                    />
                </div>
            </div>
            
            <div class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">
                        Marca
                    </label>
                    <input
                        type="text"
                        bind:value={formProducto.marca}
                        placeholder="Marca del producto"
                        class="w-full px-4 py-3 border border-blue-300 dark:border-blue-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                    />
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">
                        Categoría
                    </label>
                    <div class="flex gap-2">
                        <select 
                            bind:value={formProducto.categoria_producto_id}
                            class="flex-1 px-4 py-3 border border-blue-300 dark:border-blue-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                        >
                            <option value="">Seleccionar categoría</option>
                            {#each $categoriasProductos as categoria}
                                <option value={categoria.id}>
                                    {categoria.icono} {categoria.nombre}
                                </option>
                            {/each}
                        </select>
                        
                        <button
                            type="button"
                            on:click={abrirModalNuevaCategoria}
                            class="px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-1 text-sm font-medium whitespace-nowrap"
                            title="Crear nueva categoría"
                        >
                            <Plus class="w-4 h-4" />
                            Nueva
                        </button>
                    </div>
                </div>
            </div>
            
            <div class="mt-4">
                <label class="block text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">
                    Descripción
                </label>
                <textarea
                    bind:value={formProducto.descripcion}
                    placeholder="Describe tu producto..."
                    rows="3"
                    class="w-full px-4 py-3 border border-blue-300 dark:border-blue-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm resize-none"
                ></textarea>
            </div>
        </div>
        
        <!-- 💰 INFORMACIÓN DE PRECIOS 💰 -->
        <div class="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-700 rounded-xl p-6">
            <h4 class="text-lg font-bold text-green-800 dark:text-green-200 mb-4 flex items-center gap-2">
                💰 Información de Precios
            </h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium text-green-700 dark:text-green-300 mb-2">
                        Precio de Compra *
                    </label>
                    <div class="relative">
                        <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                        <input
                            type="number"
                            bind:value={formProducto.precio_compra}
                            placeholder="0"
                            min="0"
                            step="100"
                            class="w-full pl-8 pr-4 py-3 border border-green-300 dark:border-green-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                            required
                        />
                    </div>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-green-700 dark:text-green-300 mb-2">
                        Precio de Venta *
                    </label>
                    <div class="relative">
                        <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                        <input
                            type="number"
                            bind:value={formProducto.precio_venta}
                            placeholder="0"
                            min="0"
                            step="100"
                            class="w-full pl-8 pr-4 py-3 border border-green-300 dark:border-green-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                            required
                        />
                    </div>
                </div>
            </div>
        </div>
        
        <!-- 📦 CONTROL DE INVENTARIO 📦 -->
        <div class="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border border-orange-200 dark:border-orange-700 rounded-xl p-6">
            <h4 class="text-lg font-bold text-orange-800 dark:text-orange-200 mb-4 flex items-center gap-2">
                📦 Control de Inventario
            </h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium text-orange-700 dark:text-orange-300 mb-2">
                        Stock Actual *
                    </label>
                    <input
                        type="number"
                        bind:value={formProducto.stock_actual}
                        placeholder="0"
                        min="0"
                        class="w-full px-4 py-3 border border-orange-300 dark:border-orange-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                        required
                    />
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-orange-700 dark:text-orange-300 mb-2">
                        Stock Mínimo *
                    </label>
                    <input
                        type="number"
                        bind:value={formProducto.stock_minimo}
                        placeholder="0"
                        min="0"
                        class="w-full px-4 py-3 border border-orange-300 dark:border-orange-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                        required
                    />
                </div>
            </div>
            
            <div class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium text-orange-700 dark:text-orange-300 mb-2">
                        Tipo de Producto
                    </label>
                    <select
                        bind:value={formProducto.tipo_producto}
                        class="w-full px-4 py-3 border border-orange-300 dark:border-orange-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                    >
                        {#each TIPOS_PRODUCTO as tipo}
                            <option value={tipo.value}>{tipo.icono} {tipo.label}</option>
                        {/each}
                    </select>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-orange-700 dark:text-orange-300 mb-2">
                        Estado
                    </label>
                    <select
                        bind:value={formProducto.estado}
                        class="w-full px-4 py-3 border border-orange-300 dark:border-orange-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                    >
                        {#each ESTADOS_PRODUCTO as estado}
                            <option value={estado.value}>{estado.icono} {estado.label}</option>
                        {/each}
                    </select>
                </div>
            </div>
        </div>
        
        <!-- Botones de acción -->
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
                type="button"
                on:click={() => mostrarModalProducto = false}
                class="px-6 py-3 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
            >
                Cancelar
            </button>
            
            <button 
                type="button"
                on:click={guardarProducto}
                disabled={$cargandoProductos}
                class="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
                {#if $cargandoProductos}
                    <div class="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                {/if}
                {productoSeleccionado ? 'Actualizar' : 'Crear'} Producto
            </button>
        </div>
    </form>
</Modal>

<!-- Modal para Nueva Categoría -->
<Modal bind:abierto={mostrarModalNuevaCategoria} titulo="Nueva Categoría">
    <form on:submit|preventDefault={crearNuevaCategoria} class="space-y-4">
        <div class="grid grid-cols-1 gap-4">
            <Input
                label="Nombre de la Categoría *"
                bind:value={formCategoria.nombre}
                placeholder="Ej: Cursos de Programación"
                required
            />
            
            <Input
                label="Descripción"
                bind:value={formCategoria.descripcion}
                placeholder="Descripción de la categoría"
            />
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Color
                    </label>
                    <div class="flex items-center space-x-2">
                        <input
                            type="color"
                            bind:value={formCategoria.color}
                            class="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                        />
                        <input
                            type="text"
                            bind:value={formCategoria.color}
                            class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            placeholder="#3B82F6"
                        />
                    </div>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Icono
                    </label>
                    <select 
                        bind:value={formCategoria.icono}
                        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                        <option value="📦">📦 General</option>
                        <option value="🎓">🎓 Educación</option>
                        <option value="⚙️">⚙️ Servicios</option>
                        <option value="💾">💾 Digital</option>
                        <option value="🏠">🏠 Hogar</option>
                        <option value="💼">💼 Oficina</option>
                        <option value="🎯">🎯 Marketing</option>
                        <option value="🛒">🛒 Ventas</option>
                        <option value="🔧">🔧 Herramientas</option>
                        <option value="👑">👑 Premium</option>
                    </select>
                </div>
            </div>
        </div>
        
        <div class="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Boton 
                variant="outline" 
                type="button"
                on:click={() => mostrarModalNuevaCategoria = false}
            >
                Cancelar
            </Boton>
            
            <Boton 
                variant="primary"
                type="submit"
                class="bg-blue-600 hover:bg-blue-700 text-white font-medium"
            >
                Crear Categoría
            </Boton>
        </div>
    </form>
</Modal> 