<script lang="ts">
    import { onMount } from 'svelte';
    import { invalidateAll } from '$app/navigation';
    import { Plus, Search, Users, TrendingUp, CreditCard, AlertCircle, Download, Filter, MoreVertical, Building2 } from 'lucide-svelte';
    import { 
        clientes, 
        estadisticasClientes,
        clientesPorCategoria,
        clientesConSaldoPendiente,
        cargarClientes,
        crearCliente,
        buscarClientes,
        exportarClientesCSV,
        cargandoClientes,
        actualizarCliente
    } from '$lib/stores/clientes';
    import { negocioActual, negocios, cargarNegocios } from '$lib/stores/negocios';
    import { mostrarError, mostrarExito } from '$lib/stores/toast';
    import { formatearMoneda } from '$lib/utils/formato-moneda';
    import { CATEGORIAS_CLIENTE, ESTADOS_CLIENTE, obtenerColorCategoria } from '$lib/tipos/clientes-inventario';
    import type { Cliente } from '$lib/tipos/clientes-inventario';
    import Cargando from '$lib/componentes/ui/Cargando.svelte';
    import TarjetaEstadistica from '$lib/componentes/ui/TarjetaEstadistica.svelte';
    import Modal from '$lib/componentes/ui/Modal.svelte';
    import Boton from '$lib/componentes/ui/Boton.svelte';
    import Input from '$lib/componentes/ui/Input.svelte';

    // Estado local
    let busqueda = '';
    let filtroCategoria = '';
    let filtroEstado = '';
    let mostrarModalCliente = false;
    let clienteSeleccionado: Cliente | null = null;
    let terminoBusqueda = '';
    let clientesBusqueda: Cliente[] = [];
    let timerBusqueda: NodeJS.Timeout;
    let negocioFiltroSeleccionado = '';
    
    // Clientes filtrados por negocio
    $: clientesVisibles = negocioFiltroSeleccionado 
        ? $clientes.filter(c => c.negocio_id === negocioFiltroSeleccionado)
        : $clientes;

    // Datos del formulario de cliente
    let formCliente = {
        negocio_id: '',
        nombre: '',
        email: '',
        telefono: '',
        tipo_documento: 'cedula',
        numero_documento: '',
        tipo_cliente: 'individual',
        categoria_cliente: 'regular',
        limite_credito: 0,
        dias_credito: 0,
        direccion: '',
        ciudad: '',
        notas: ''
    };

    // Cargar datos al montar
    onMount(async () => {
        console.log('🚀 Iniciando clientes simple');
        
        try {
            // PASO 1: Cargar negocios sin bucles
            console.log('🏢 Cargando negocios...');
            await cargarNegocios();
            console.log('✅ Negocios cargados:', $negocios.length);
            
            // PASO 2: Cargar clientes sin bucles 
            console.log('👥 Cargando clientes...');
            await cargarClientes();
            console.log('✅ Clientes cargados:', $clientes.length);
            
        } catch (error: any) {
            console.error('❌ Error simple:', error);
        }
        
        console.log('📊 Estado final - Negocios:', $negocios.length, 'Clientes:', $clientes.length);
    });

    // Filtrar clientes
    $: clientesFiltrados = $clientes.filter(cliente => {
        const coincideBusqueda = !busqueda || 
            cliente.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
            cliente.email?.toLowerCase().includes(busqueda.toLowerCase()) ||
            cliente.numero_documento.includes(busqueda);
        
        const coincideCategoria = !filtroCategoria || cliente.categoria_cliente === filtroCategoria;
        const coincideEstado = !filtroEstado || cliente.estado === filtroEstado;
        
        return coincideBusqueda && coincideCategoria && coincideEstado;
    });

    // Búsqueda en tiempo real
    const manejarBusqueda = async () => {
        if (terminoBusqueda.length >= 2) {
            clearTimeout(timerBusqueda);
            timerBusqueda = setTimeout(async () => {
                clientesBusqueda = await buscarClientes(terminoBusqueda, $negocioActual?.id);
            }, 300);
        } else {
            clientesBusqueda = [];
        }
    };

    // Abrir modal para nuevo cliente
    const abrirModalNuevoCliente = () => {
        console.log('🔥 Abriendo modal de nuevo cliente...');
        
        clienteSeleccionado = null;
        
        // Establecer formulario básico
        formCliente = {
            negocio_id: $negocios.length > 0 ? $negocios[0].id : '',
            nombre: '',
            email: '',
            telefono: '',
            tipo_documento: 'cedula',
            numero_documento: '',
            tipo_cliente: 'individual',
            categoria_cliente: 'regular',
            limite_credito: 0,
            dias_credito: 0,
            direccion: '',
            ciudad: '',
            notas: ''
        };
        
        // FORZAR apertura del modal
        mostrarModalCliente = true;
        
        console.log('✅ Modal abierto. Negocios disponibles:', $negocios.length);
        console.log('✅ Formulario inicial:', formCliente);
    };

    // Editar cliente
    const editarCliente = (cliente: Cliente) => {
        clienteSeleccionado = cliente;
        formCliente = {
            negocio_id: cliente.negocio_id,
            nombre: cliente.nombre,
            email: cliente.email || '',
            telefono: cliente.telefono || '',
            tipo_documento: cliente.tipo_documento,
            numero_documento: cliente.numero_documento,
            tipo_cliente: cliente.tipo_cliente,
            categoria_cliente: cliente.categoria_cliente,
            limite_credito: cliente.limite_credito,
            dias_credito: cliente.dias_credito,
            direccion: cliente.direccion || '',
            ciudad: cliente.ciudad || '',
            notas: cliente.notas || ''
        };
        mostrarModalCliente = true;
    };

    // Guardar cliente
    const guardarCliente = async (event: Event) => {
        // PREVENIR ENVÍO MÚLTIPLE
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        
        // PREVENIR BUCLE - Solo permitir una ejecución a la vez
        if ($cargandoClientes) {
            console.log('🛑 YA SE ESTÁ CREANDO CLIENTE, IGNORANDO...');
            return;
        }
        
        console.log('🚀 INTENTANDO GUARDAR CLIENTE:', formCliente);
        
        // Validaciones básicas
        if (!formCliente.negocio_id) {
            mostrarError('❌ Debes seleccionar un negocio');
            return;
        }

        if (!formCliente.nombre || formCliente.nombre.trim() === '') {
            mostrarError('❌ El NOMBRE del cliente es obligatorio');
            return;
        }

        if (!formCliente.email || formCliente.email.trim() === '') {
            mostrarError('❌ El EMAIL del cliente es obligatorio');
            return;
        }

        // Limpiar datos antes de enviar
        const datosCliente = {
            ...formCliente,
            nombre: formCliente.nombre.trim(),
            email: formCliente.email.trim(),
            telefono: formCliente.telefono?.trim() || '',
            direccion: formCliente.direccion?.trim() || '',
            ciudad: formCliente.ciudad?.trim() || '',
            notas: formCliente.notas?.trim() || ''
        };

        try {
            cargandoClientes.set(true);
            
            let resultado;
            if (clienteSeleccionado) {
                // EDITAR cliente existente
                console.log('✏️ Editando cliente existente:', clienteSeleccionado.id);
                resultado = await actualizarCliente(clienteSeleccionado.id, datosCliente);
            } else {
                // CREAR nuevo cliente
                console.log('🆕 Creando nuevo cliente');
                resultado = await crearCliente(datosCliente);
            }
            
            console.log('🎯 Resultado operación cliente:', resultado);
        
            if (resultado) {
                mostrarModalCliente = false;
                mostrarExito(clienteSeleccionado ? 'Cliente actualizado exitosamente' : 'Cliente creado exitosamente');
                
                // Recargar clientes del negocio seleccionado
                if (formCliente.negocio_id) {
                    await cargarClientes(formCliente.negocio_id);
                }
                
                // Limpiar formulario
                clienteSeleccionado = null;
            } else {
                mostrarError('❌ Error: No se pudo guardar el cliente');
            }
            
        } catch (error: any) {
            console.error('❌ Error guardando cliente:', error);
            mostrarError('❌ Error al guardar cliente: ' + (error?.message || 'Error desconocido'));
        } finally {
            cargandoClientes.set(false);
        }
    };

    // Función para cambiar filtro de negocio
    const cambiarFiltroNegocio = async () => {
        if (negocioFiltroSeleccionado) {
            await cargarClientes(negocioFiltroSeleccionado);
            console.log('📋 Clientes cargados para negocio:', negocioFiltroSeleccionado);
        } else {
            await cargarClientes();
        }
    };

    // Exportar clientes
    const exportarClientes = async () => {
        const csv = await exportarClientesCSV($negocioActual?.id);
        if (csv) {
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `clientes-${new Date().getTime()}.csv`);
            link.click();
        }
    };

    // Obtener icono de categoría
    const obtenerIconoCategoria = (categoria: string) => {
        const config = CATEGORIAS_CLIENTE.find(c => c.value === categoria);
        return config?.icono || '👤';
    };

    // Obtener color de estado
    const obtenerColorEstado = (estado: string) => {
        const config = ESTADOS_CLIENTE.find(e => e.value === estado);
        return config?.color || '#6B7280';
    };
</script>

<div class="p-6 space-y-6">
    <!-- Header -->
    <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
                <Users class="w-8 h-8 text-blue-500" />
                Gestión de Clientes
            </h1>
            <p class="text-gray-600 dark:text-gray-400 mt-1">
                Administra tu base de datos de clientes y relaciones comerciales
            </p>
        </div>
        
        <div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <!-- Selector de Negocio -->
            <div class="flex items-center gap-3">
                <div class="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                    <Building2 class="w-5 h-5 text-green-600 dark:text-green-400" />
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
                    on:click={exportarClientes}
                >
                    Exportar
                </Boton>
                
                <!-- BOTÓN PRINCIPAL -->
                <Boton 
                    variant="success"
                    size="md"
                    icon={Plus}
                    pulse={true}
                    on:click={abrirModalNuevoCliente}
                >
                    Nuevo Cliente
                </Boton>
                
                <!-- BOTÓN DE PRUEBA ADICIONAL -->
                <button 
                    on:click={() => {
                        console.log('🧪 Botón de prueba clickeado');
                        mostrarModalCliente = true;
                        console.log('🧪 mostrarModalCliente =', mostrarModalCliente);
                    }}
                    class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                    🧪 PRUEBA MODAL
                </button>
            </div>
        </div>
    </div>

    <!-- Estadísticas -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <TarjetaEstadistica
            titulo="Total Clientes"
            valor={$estadisticasClientes.total_clientes.toString()}
            icono={Users}
            color="azul"
        />
        
        <TarjetaEstadistica
            titulo="Clientes Activos"
            valor={$estadisticasClientes.clientes_activos.toString()}
            icono={TrendingUp}
            color="verde"
        />
        
        <TarjetaEstadistica
            titulo="Total Facturado"
            valor={formatearMoneda($estadisticasClientes.total_facturado)}
            icono={CreditCard}
            color="morado"
        />
        
        <TarjetaEstadistica
            titulo="Saldo Pendiente"
            valor={formatearMoneda($estadisticasClientes.saldo_pendiente)}
            icono={AlertCircle}
            color="naranja"
        />
    </div>

    <!-- Filtros y búsqueda -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div class="flex flex-col lg:flex-row gap-4">
            <!-- Búsqueda -->
            <div class="flex-1 relative">
                <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                    bind:value={busqueda}
                    placeholder="Buscar por nombre, email o documento..."
                    class="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
            </div>
            
            <!-- Filtro por categoría -->
            <select 
                bind:value={filtroCategoria}
                class="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
                <option value="">Todas las categorías</option>
                {#each CATEGORIAS_CLIENTE as categoria}
                    <option value={categoria.value}>{categoria.label}</option>
                {/each}
            </select>
            
            <!-- Filtro por estado -->
            <select 
                bind:value={filtroEstado}
                class="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
                <option value="">Todos los estados</option>
                {#each ESTADOS_CLIENTE as estado}
                    <option value={estado.value}>{estado.label}</option>
                {/each}
            </select>
        </div>
    </div>

    <!-- Lista de clientes -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <!-- Header de la tabla -->
        <div class="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Clientes ({clientesFiltrados.length})
            </h3>
        </div>

        {#if $cargandoClientes}
            <div class="p-8">
                <Cargando />
            </div>
        {:else if clientesFiltrados.length === 0}
            <div class="p-8 text-center">
                <Users class="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    No hay clientes
                </h3>
                <p class="text-gray-500 mb-4">
                    {$clientes.length === 0 ? 'Comienza agregando tu primer cliente' : 'No se encontraron clientes con los filtros aplicados'}
                </p>
                {#if $clientes.length === 0}
                    <Boton on:click={abrirModalNuevoCliente}>
                        Agregar Cliente
                    </Boton>
                {/if}
            </div>
        {:else}
            <!-- Tabla de clientes -->
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead class="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Cliente
                            </th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Contacto
                            </th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Categoría
                            </th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Estado
                            </th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Saldo
                            </th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Acciones
                            </th>
                        </tr>
                    </thead>
                    <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {#each clientesFiltrados as cliente}
                            <tr class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                <!-- Cliente -->
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <div class="flex items-center space-x-3">
                                        <div class="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                                            {obtenerIconoCategoria(cliente.categoria_cliente)}
                                        </div>
                                        <div>
                                            <div class="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                {cliente.nombre}
                                            </div>
                                            <div class="text-sm text-gray-500">
                                                {cliente.tipo_documento}: {cliente.numero_documento}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                
                                <!-- Contacto -->
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <div class="text-sm text-gray-900 dark:text-gray-100">
                                        {cliente.email || 'Sin email'}
                                    </div>
                                    <div class="text-sm text-gray-500">
                                        {cliente.telefono || 'Sin teléfono'}
                                    </div>
                                </td>
                                
                                <!-- Categoría -->
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
                                          style="background-color: {obtenerColorCategoria(cliente.categoria_cliente)}">
                                        {CATEGORIAS_CLIENTE.find(c => c.value === cliente.categoria_cliente)?.label}
                                    </span>
                                </td>
                                
                                <!-- Estado -->
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
                                          style="background-color: {obtenerColorEstado(cliente.estado)}">
                                        {ESTADOS_CLIENTE.find(e => e.value === cliente.estado)?.label}
                                    </span>
                                </td>
                                
                                <!-- Saldo -->
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <div class="text-sm font-medium text-gray-900 dark:text-gray-100">
                                        {formatearMoneda(cliente.saldo_pendiente)}
                                    </div>
                                    <div class="text-sm text-gray-500">
                                        Límite: {formatearMoneda(cliente.limite_credito)}
                                    </div>
                                </td>
                                
                                <!-- Acciones -->
                                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                        on:click={() => editarCliente(cliente)}
                                        class="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3"
                                    >
                                        Editar
                                    </button>
                                    <button class="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300">
                                        <MoreVertical class="w-4 h-4" />
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

<!-- Modal de Cliente -->
{#if mostrarModalCliente}
    <Modal bind:abierto={mostrarModalCliente} titulo="{clienteSeleccionado ? 'Editar' : 'Nuevo'} Cliente" tamaño="lg">
        <form class="space-y-6" on:submit|preventDefault={guardarCliente}>
            
            <!-- 🏢 SELECCIÓN DE NEGOCIO PRIMERO 🏢 -->
            <div class="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-6">
                <h4 class="text-lg font-bold text-blue-800 dark:text-blue-200 mb-4 flex items-center gap-2">
                    🏢 Negocio del Cliente
                </h4>
                <div>
                    <label class="block text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">
                        Seleccionar Negocio *
                    </label>
                    <select 
                        bind:value={formCliente.negocio_id}
                        class="w-full px-4 py-3 border border-blue-300 dark:border-blue-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-medium text-sm"
                        required
                    >
                        <option value="">Seleccionar negocio</option>
                        {#each $negocios as negocio}
                            <option value={negocio.id}>{negocio.nombre}</option>
                        {/each}
                    </select>
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Negocios disponibles: {$negocios.length}
                    </p>
                </div>
            </div>
            
            <!-- 📋 INFORMACIÓN BÁSICA 📋 -->
            <div class="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-700 rounded-xl p-6">
                <h4 class="text-lg font-bold text-green-800 dark:text-green-200 mb-4 flex items-center gap-2">
                    📋 Información Básica
                </h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-green-700 dark:text-green-300 mb-2">
                            Nombre Completo *
                        </label>
                        <input
                            type="text"
                            bind:value={formCliente.nombre}
                            placeholder="Ej: Juan Pérez"
                            class="w-full px-4 py-3 border border-green-300 dark:border-green-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-medium text-sm"
                            required
                        />
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-green-700 dark:text-green-300 mb-2">
                            Email *
                        </label>
                        <input
                            type="email"
                            bind:value={formCliente.email}
                            placeholder="juan@ejemplo.com"
                            class="w-full px-4 py-3 border border-green-300 dark:border-green-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-medium text-sm"
                            required
                        />
                    </div>
                </div>
                
                <div class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-green-700 dark:text-green-300 mb-2">
                            Teléfono
                        </label>
                        <input
                            type="tel"
                            bind:value={formCliente.telefono}
                            placeholder="+57 300 123 4567"
                            class="w-full px-4 py-3 border border-green-300 dark:border-green-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                        />
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-green-700 dark:text-green-300 mb-2">
                            Número de Documento
                        </label>
                        <input
                            type="text"
                            bind:value={formCliente.numero_documento}
                            placeholder="12345678"
                            class="w-full px-4 py-3 border border-green-300 dark:border-green-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                        />
                    </div>
                </div>
            </div>
            
            <!-- Botones de acción -->
            <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                    type="button"
                    on:click={() => mostrarModalCliente = false}
                    class="px-6 py-3 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
                >
                    Cancelar
                </button>
                
                <button 
                    type="submit"
                    disabled={$cargandoClientes}
                    class="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                    {#if $cargandoClientes}
                        <div class="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                    {/if}
                    {clienteSeleccionado ? 'Actualizar' : 'Crear'} Cliente
                </button>
            </div>
        </form>
    </Modal>
{/if} 