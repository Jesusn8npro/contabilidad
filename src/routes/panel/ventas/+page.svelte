<script lang="ts">
    import { onMount } from 'svelte';
    import { 
        Plus, Search, ShoppingCart, DollarSign, 
        TrendingUp, Users, Package, Calendar,
        Download, Filter, Eye, Edit3, Trash2, Building2
    } from 'lucide-svelte';
    import { negocioActual, negocios, cargarNegocios } from '$lib/stores/negocios';
    
    let ventas = [];
    let mostrarModalVenta = false;
    let ventaSeleccionada: any = null;
    let busqueda = '';
    let filtroEstado = '';
    let fechaInicio = '';
    let fechaFin = '';
    
    // Estados de venta
    const estadosVenta = [
        { id: 'pendiente', nombre: 'Pendiente', color: '#F59E0B', icono: '⏳' },
        { id: 'procesando', nombre: 'Procesando', color: '#3B82F6', icono: '🔄' },
        { id: 'enviado', nombre: 'Enviado', color: '#8B5CF6', icono: '🚚' },
        { id: 'entregado', nombre: 'Entregado', color: '#10B981', icono: '✅' },
        { id: 'cancelado', nombre: 'Cancelado', color: '#EF4444', icono: '❌' }
    ];
    
    // Datos de ejemplo
    let ventasEjemplo = [
        {
            id: 1,
            fecha: '2024-01-15',
            cliente: 'Juan Pérez',
            productos: ['Acordeón Profesional', 'Correas de cuero'],
            total: 2500000,
            estado: 'entregado',
            metodoPago: 'transferencia'
        },
        {
            id: 2,
            fecha: '2024-01-14',
            cliente: 'María González',
            productos: ['Curso de Vallenato - Básico'],
            total: 150000,
            estado: 'procesando',
            metodoPago: 'tarjeta'
        },
        {
            id: 3,
            fecha: '2024-01-13',
            cliente: 'Carlos Martínez',
            productos: ['Reparación de acordeón', 'Afinación'],
            total: 200000,
            estado: 'pendiente',
            metodoPago: 'efectivo'
        },
        {
            id: 4,
            fecha: '2024-01-12',
            cliente: 'Ana López',
            productos: ['Acordeón Estudiante', 'Funda protectora'],
            total: 800000,
            estado: 'enviado',
            metodoPago: 'transferencia'
        },
        {
            id: 5,
            fecha: '2024-01-11',
            cliente: 'Roberto Silva',
            productos: ['Clases particulares - 4 sesiones'],
            total: 400000,
            estado: 'entregado',
            metodoPago: 'efectivo'
        }
    ];
    
    let formVenta = {
        fecha: '',
        cliente: '',
        productos: '',
        total: 0,
        estado: 'pendiente',
        metodoPago: 'efectivo',
        negocio_id: ''
    };
    
    // Estadísticas calculadas
    $: totalVentas = ventasEjemplo.reduce((sum, venta) => sum + venta.total, 0);
    $: ventasPorEstado = estadosVenta.map(estado => {
        const ventasEstado = ventasEjemplo.filter(v => v.estado === estado.id);
        const total = ventasEstado.reduce((sum, v) => sum + v.total, 0);
        return {
            ...estado,
            total,
            cantidad: ventasEstado.length,
            porcentaje: totalVentas > 0 ? (total / totalVentas) * 100 : 0
        };
    }).filter(estado => estado.cantidad > 0);
    
    // Ventas filtradas
    $: ventasFiltradas = ventasEjemplo.filter(venta => {
        const coincideBusqueda = !busqueda || 
            venta.cliente.toLowerCase().includes(busqueda.toLowerCase()) ||
            venta.productos.some(p => p.toLowerCase().includes(busqueda.toLowerCase()));
        const coincideEstado = !filtroEstado || venta.estado === filtroEstado;
        return coincideBusqueda && coincideEstado;
    });
    
    function formatearMoneda(valor: number): string {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(valor);
    }
    
    function obtenerEstado(estadoId: string) {
        return estadosVenta.find(e => e.id === estadoId) || estadosVenta[0];
    }
    
    function abrirModalNuevaVenta() {
        ventaSeleccionada = null;
        formVenta = {
            fecha: new Date().toISOString().split('T')[0],
            cliente: '',
            productos: '',
            total: 0,
            estado: 'pendiente',
            metodoPago: 'efectivo',
            negocio_id: $negocioActual?.id || ''
        };
        mostrarModalVenta = true;
    }
    
    function editarVenta(venta: any) {
        ventaSeleccionada = venta;
        formVenta = {
            fecha: venta.fecha,
            cliente: venta.cliente,
            productos: venta.productos.join(', '),
            total: venta.total,
            estado: venta.estado,
            metodoPago: venta.metodoPago,
            negocio_id: venta.negocio_id || ''
        };
        mostrarModalVenta = true;
    }
    
    function guardarVenta() {
        if (!formVenta.cliente || !formVenta.productos || formVenta.total <= 0) {
            alert('Por favor completa todos los campos obligatorios');
            return;
        }
        
        if (ventaSeleccionada) {
            // Editar venta existente
            const index = ventasEjemplo.findIndex(v => v.id === ventaSeleccionada.id);
            if (index !== -1) {
                ventasEjemplo[index] = {
                    ...formVenta,
                    id: ventaSeleccionada.id,
                    productos: formVenta.productos.split(',').map(p => p.trim())
                };
                ventasEjemplo = ventasEjemplo;
            }
        } else {
            // Crear nueva venta
            const nuevaVenta = {
                ...formVenta,
                id: Date.now(),
                productos: formVenta.productos.split(',').map(p => p.trim())
            };
            ventasEjemplo = [nuevaVenta, ...ventasEjemplo];
        }
        
        mostrarModalVenta = false;
        alert(ventaSeleccionada ? 'Venta actualizada' : 'Venta registrada correctamente');
    }
    
    function eliminarVenta(ventaId: number) {
        if (confirm('¿Estás seguro de eliminar esta venta?')) {
            ventasEjemplo = ventasEjemplo.filter(v => v.id !== ventaId);
            alert('Venta eliminada');
        }
    }
    
    function cambiarEstadoVenta(ventaId: number, nuevoEstado: string) {
        const venta = ventasEjemplo.find(v => v.id === ventaId);
        if (venta) {
            venta.estado = nuevoEstado;
            ventasEjemplo = ventasEjemplo;
            alert('Estado actualizado');
        }
    }
    
    function exportarVentas() {
        const csv = [
            ['Fecha', 'Cliente', 'Productos', 'Total', 'Estado', 'Método de Pago'],
            ...ventasFiltradas.map(venta => [
                venta.fecha,
                venta.cliente,
                venta.productos.join('; '),
                venta.total,
                obtenerEstado(venta.estado).nombre,
                venta.metodoPago
            ])
        ].map(row => row.join(',')).join('\n');
        
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `ventas-${new Date().getTime()}.csv`);
        link.click();
    }
    
    onMount(async () => {
        // Cargar negocios
        await cargarNegocios();
        console.log('🏢 Negocios cargados para ventas:', $negocios.length);
        
        // Establecer fechas por defecto
        const hoy = new Date();
        const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        
        fechaFin = hoy.toISOString().split('T')[0];
        fechaInicio = inicioMes.toISOString().split('T')[0];
    });
</script>

<div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <ShoppingCart class="w-8 h-8 text-green-600" />
                Gestión de Ventas
            </h1>
            <p class="text-gray-600 dark:text-gray-400 mt-1">
                Administra y controla todas tus ventas
            </p>
        </div>
        
        <div class="flex items-center space-x-4 mt-4 lg:mt-0">
            <button 
                on:click={exportarVentas}
                class="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
                <Download class="w-4 h-4" />
                <span>Exportar</span>
            </button>
            
            <button 
                on:click={abrirModalNuevaVenta}
                class="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
                <Plus class="w-4 h-4" />
                <span>Nueva Venta</span>
            </button>
        </div>
    </div>
    
    <!-- Estadísticas -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div class="flex items-center">
                <div class="p-2 bg-green-100 rounded-lg">
                    <DollarSign class="w-6 h-6 text-green-600" />
                </div>
                <div class="ml-4">
                    <p class="text-sm text-gray-600 dark:text-gray-400">Total Ventas</p>
                    <p class="text-2xl font-bold text-gray-900 dark:text-white">{formatearMoneda(totalVentas)}</p>
                </div>
            </div>
        </div>
        
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div class="flex items-center">
                <div class="p-2 bg-blue-100 rounded-lg">
                    <ShoppingCart class="w-6 h-6 text-blue-600" />
                </div>
                <div class="ml-4">
                    <p class="text-sm text-gray-600 dark:text-gray-400">Transacciones</p>
                    <p class="text-2xl font-bold text-gray-900 dark:text-white">{ventasEjemplo.length}</p>
                </div>
            </div>
        </div>
        
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div class="flex items-center">
                <div class="p-2 bg-purple-100 rounded-lg">
                    <TrendingUp class="w-6 h-6 text-purple-600" />
                </div>
                <div class="ml-4">
                    <p class="text-sm text-gray-600 dark:text-gray-400">Promedio</p>
                    <p class="text-2xl font-bold text-gray-900 dark:text-white">{formatearMoneda(totalVentas / ventasEjemplo.length || 0)}</p>
                </div>
            </div>
        </div>
        
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div class="flex items-center">
                <div class="p-2 bg-orange-100 rounded-lg">
                    <Users class="w-6 h-6 text-orange-600" />
                </div>
                <div class="ml-4">
                    <p class="text-sm text-gray-600 dark:text-gray-400">Clientes</p>
                    <p class="text-2xl font-bold text-gray-900 dark:text-white">{new Set(ventasEjemplo.map(v => v.cliente)).size}</p>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Filtros -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div class="relative">
                <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                    bind:value={busqueda}
                    placeholder="Buscar ventas..."
                    class="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700"
                />
            </div>
            
            <select 
                bind:value={filtroEstado}
                class="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700"
            >
                <option value="">Todos los estados</option>
                {#each estadosVenta as estado}
                    <option value={estado.id}>{estado.icono} {estado.nombre}</option>
                {/each}
            </select>
            
            <input 
                type="date" 
                bind:value={fechaInicio}
                class="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700"
            />
            
            <input 
                type="date" 
                bind:value={fechaFin}
                class="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700"
            />
        </div>
    </div>
    
    <!-- Lista de Ventas -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div class="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                Ventas Recientes ({ventasFiltradas.length})
            </h3>
        </div>
        
        <div class="divide-y divide-gray-200 dark:divide-gray-700">
            {#each ventasFiltradas as venta}
                {@const estado = obtenerEstado(venta.estado)}
                <div class="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center space-x-4">
                            <div class="text-2xl">{estado.icono}</div>
                            <div>
                                <h4 class="font-medium text-gray-900 dark:text-white">
                                    {venta.cliente}
                                </h4>
                                <p class="text-sm text-gray-500 dark:text-gray-400">
                                    {venta.productos.join(', ')}
                                </p>
                                <p class="text-xs text-gray-400 mt-1">
                                    {venta.fecha} • {venta.metodoPago}
                                </p>
                            </div>
                        </div>
                        
                        <div class="flex items-center space-x-4">
                            <span class="text-lg font-bold text-green-600">
                                {formatearMoneda(venta.total)}
                            </span>
                            
                            <div class="flex items-center space-x-2">
                                <span 
                                    class="px-2 py-1 rounded-full text-xs font-medium text-white"
                                    style="background-color: {estado.color}"
                                >
                                    {estado.nombre}
                                </span>
                            </div>
                            
                            <div class="flex space-x-2">
                                <button 
                                    on:click={() => editarVenta(venta)}
                                    class="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                >
                                    <Edit3 class="w-4 h-4" />
                                </button>
                                <button 
                                    on:click={() => eliminarVenta(venta.id)}
                                    class="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                >
                                    <Trash2 class="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            {/each}
            
            {#if ventasFiltradas.length === 0}
                <div class="p-8 text-center">
                    <ShoppingCart class="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        No hay ventas
                    </h3>
                    <p class="text-gray-500 mb-4">
                        {ventasEjemplo.length === 0 ? 'Comienza registrando tu primera venta' : 'No se encontraron ventas con los filtros aplicados'}
                    </p>
                    {#if ventasEjemplo.length === 0}
                        <button 
                            on:click={abrirModalNuevaVenta}
                            class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                            Registrar Venta
                        </button>
                    {/if}
                </div>
            {/if}
        </div>
    </div>
    
    <!-- Resumen por Estados -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Ventas por Estado
        </h3>
        
        <div class="space-y-4">
            {#each ventasPorEstado as estado}
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-3">
                        <span class="text-xl">{estado.icono}</span>
                        <span class="font-medium text-gray-900 dark:text-white">
                            {estado.nombre}
                        </span>
                        <span class="text-sm text-gray-500">
                            ({estado.cantidad} ventas)
                        </span>
                    </div>
                    
                    <div class="flex items-center space-x-4">
                        <div class="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                                class="h-2 rounded-full" 
                                style="width: {estado.porcentaje}%; background-color: {estado.color}"
                            ></div>
                        </div>
                        <span class="font-semibold text-gray-900 dark:text-white min-w-20 text-right">
                            {formatearMoneda(estado.total)}
                        </span>
                        <span class="text-sm text-gray-500 min-w-12 text-right">
                            {estado.porcentaje.toFixed(1)}%
                        </span>
                    </div>
                </div>
            {/each}
        </div>
    </div>
</div>

<!-- Modal de Venta -->
{#if mostrarModalVenta}
    <div class="fixed inset-0 z-50 overflow-y-auto">
        <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" on:click={() => mostrarModalVenta = false}></div>
            
            <div class="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div class="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
                        {ventaSeleccionada ? 'Editar' : 'Nueva'} Venta
                    </h3>
                    
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Fecha
                            </label>
                            <input 
                                type="date" 
                                bind:value={formVenta.fecha}
                                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700"
                                required
                            />
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Negocio
                            </label>
                            <select 
                                bind:value={formVenta.negocio_id}
                                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700"
                                required
                            >
                                <option value="">Seleccionar negocio</option>
                                {#each $negocios as negocio}
                                    <option value={negocio.id}>{negocio.nombre}</option>
                                {/each}
                            </select>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Cliente
                            </label>
                            <input 
                                type="text" 
                                bind:value={formVenta.cliente}
                                placeholder="Nombre del cliente"
                                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700"
                                required
                            />
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Productos/Servicios
                            </label>
                            <textarea 
                                bind:value={formVenta.productos}
                                placeholder="Productos o servicios vendidos (separados por comas)"
                                rows="3"
                                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700"
                                required
                            ></textarea>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Total
                            </label>
                            <input 
                                type="number" 
                                bind:value={formVenta.total}
                                placeholder="0"
                                min="0"
                                step="1000"
                                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700"
                                required
                            />
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Estado
                            </label>
                            <select 
                                bind:value={formVenta.estado}
                                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700"
                            >
                                {#each estadosVenta as estado}
                                    <option value={estado.id}>{estado.icono} {estado.nombre}</option>
                                {/each}
                            </select>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Método de Pago
                            </label>
                            <select 
                                bind:value={formVenta.metodoPago}
                                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700"
                            >
                                <option value="efectivo">Efectivo</option>
                                <option value="tarjeta">Tarjeta</option>
                                <option value="transferencia">Transferencia</option>
                                <option value="credito">Crédito</option>
                            </select>
                        </div>
                    </div>
                </div>
                
                <div class="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                    <button 
                        on:click={guardarVenta}
                        class="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                        {ventaSeleccionada ? 'Actualizar' : 'Guardar'}
                    </button>
                    <button 
                        on:click={() => mostrarModalVenta = false}
                        class="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    </div>
{/if} 