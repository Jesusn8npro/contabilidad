<script lang="ts">
    import { onMount } from 'svelte';
    import { BarChart3, Plus, Building2, Target, TrendingUp, Users, Eye, MousePointer } from 'lucide-svelte';
    import { negocios, cargarNegocios } from '$lib/stores/negocios';
    import { user } from '$lib/stores/auth';
    import { mostrarError, mostrarExito } from '$lib/stores/toast';
    import { campañas, cargandoCampañas, cargarCampañas, crearCampaña, actualizarCampaña, eliminarCampaña as eliminarCampañaStore } from '$lib/stores/marketing';
    import Modal from '$lib/componentes/ui/Modal.svelte';
    import Input from '$lib/componentes/ui/Input.svelte';
    import Boton from '$lib/componentes/ui/Boton.svelte';
    import TarjetaEstadistica from '$lib/componentes/ui/TarjetaEstadistica.svelte';

    // Estado local
    let negocioSeleccionado = '';
    let mostrarModalCampaña = false;
    let campañaEditando = null;

    // Formulario de campaña
    let formCampaña = {
        nombre: '',
        descripcion: '',
        tipo_campana: 'google_ads', // CAMBIAR A FORMATO VÁLIDO
        plataforma: 'google-ads', // CAMPO OBLIGATORIO AGREGADO - VALOR VÁLIDO
        objetivo: 'conversiones',
        presupuesto_total: 1000, // VALOR POR DEFECTO MAYOR A 0
        fecha_inicio: new Date().toISOString().split('T')[0],
        fecha_fin: '',
        estado: 'borrador',
        negocio_id: negocioSeleccionado || ($negocios.length > 0 ? $negocios[0].id : '')
    };

    // Reactivo para debuggear cambios
    $: {
        console.log('🔄 REACTIVE: formCampaña.nombre cambió a:', formCampaña.nombre);
        console.log('🔄 REACTIVE: formCampaña.fecha_inicio cambió a:', formCampaña.fecha_inicio);
    }

    // Tipos de campañas (ajustado a la BD)
    const tiposCampaña = [
        { value: 'google_ads', label: 'Google Ads', icon: '🔍' },
        { value: 'facebook_ads', label: 'Facebook Ads', icon: '📘' },
        { value: 'instagram_ads', label: 'Instagram Ads', icon: '📷' },
        { value: 'email', label: 'Email Marketing', icon: '📧' },
        { value: 'social', label: 'Redes Sociales', icon: '📱' },
        { value: 'contenido', label: 'Marketing de Contenido', icon: '📝' }
    ];

    const objetivos = [
        { value: 'conversiones', label: 'Aumentar Conversiones' },
        { value: 'trafico', label: 'Generar Tráfico' },
        { value: 'awareness', label: 'Aumentar Reconocimiento' },
        { value: 'engagement', label: 'Mejorar Engagement' },
        { value: 'leads', label: 'Generar Leads' },
        { value: 'ventas', label: 'Aumentar Ventas' }
    ];

    const estadosCampaña = [
        { value: 'borrador', label: 'Borrador', color: 'gray' },
        { value: 'activa', label: 'Activa', color: 'green' },
        { value: 'pausada', label: 'Pausada', color: 'yellow' },
        { value: 'completada', label: 'Completada', color: 'blue' },
        { value: 'cancelada', label: 'Cancelada', color: 'red' }
    ];

    // Estadísticas de marketing
    $: estadisticasMarketing = {
        total_campañas: $campañas.length,
        campañas_activas: $campañas.filter(c => c.estado === 'activa').length,
        presupuesto_total: $campañas.reduce((sum, c) => sum + (c.presupuesto_total || 0), 0),
        roi_promedio: 15.8 // ROI simulado
    };

    // Métricas de ejemplo
    const metricas = [
        { label: 'Impresiones', valor: '45,230', cambio: '+12%', icono: Eye },
        { label: 'Clics', valor: '2,340', cambio: '+8%', icono: MousePointer },
        { label: 'Conversiones', valor: '156', cambio: '+25%', icono: Target },
        { label: 'CTR', valor: '5.2%', cambio: '+3%', icono: TrendingUp }
    ];

    // Funciones de campañas
    const abrirModalNuevaCampaña = () => {
        console.log('🎯 Abriendo modal nueva campaña');
        console.log('🏢 Negocios disponibles:', $negocios);
        console.log('📋 Negocio seleccionado actual:', negocioSeleccionado);
        
        campañaEditando = null;
        formCampaña = {
            nombre: '',
            descripcion: '',
            tipo_campana: 'google_ads', // CAMBIAR A FORMATO VÁLIDO
            plataforma: 'google-ads', // CAMPO OBLIGATORIO AGREGADO - VALOR VÁLIDO
            objetivo: 'conversiones',
            presupuesto_total: 1000, // VALOR POR DEFECTO MAYOR A 0
            fecha_inicio: new Date().toISOString().split('T')[0],
            fecha_fin: '',
            estado: 'borrador',
            negocio_id: negocioSeleccionado || ($negocios.length > 0 ? $negocios[0].id : '')
        };
        
        console.log('📝 Formulario inicializado:', formCampaña);
        mostrarModalCampaña = true;
        console.log('✅ Modal abierto');
    };

    const guardarCampaña = async () => {
        console.log('🚀 GUARDAR: Iniciando guardado de campaña');
        console.log('📝 GUARDAR: Datos del formulario:', formCampaña);

        // Validaciones básicas
        if (!formCampaña.nombre || !formCampaña.nombre.trim()) {
            mostrarError('El nombre de la campaña es obligatorio');
            return;
        }

        if (!formCampaña.negocio_id) {
            mostrarError('Debes seleccionar un negocio');
            return;
        }

        console.log('✅ Validaciones básicas pasadas');

        try {
            // Validar fecha de inicio
            if (!formCampaña.fecha_inicio) {
                mostrarError('La fecha de inicio es obligatoria');
                return;
            }

            // Datos limpios y seguros
            const datosFormulario = {
                nombre: formCampaña.nombre.trim(),
                tipo_campana: formCampaña.tipo_campana || 'google_ads',
                plataforma: formCampaña.plataforma || 'google-ads', // CAMPO OBLIGATORIO AGREGADO
                objetivo: formCampaña.objetivo || 'conversiones',
                presupuesto_total: Number(formCampaña.presupuesto_total) || 1000,
                fecha_inicio: formCampaña.fecha_inicio,
                estado: formCampaña.estado || 'borrador',
                negocio_id: formCampaña.negocio_id,
                // Campos opcionales
                descripcion: (formCampaña.descripcion && formCampaña.descripcion.trim()) ? formCampaña.descripcion.trim() : undefined,
                fecha_fin: (formCampaña.fecha_fin && formCampaña.fecha_fin.trim()) ? formCampaña.fecha_fin.trim() : undefined
            };

            console.log('📋 Datos limpiados para enviar:', JSON.stringify(datosFormulario, null, 2));
            console.log('👤 Usuario actual:', $user);
            console.log('🏢 Negocios disponibles:', $negocios.length);

            if (campañaEditando) {
                console.log('✏️ Actualizando campaña existente');
                await actualizarCampaña(campañaEditando.id, datosFormulario);
                mostrarExito('Campaña actualizada exitosamente');
            } else {
                console.log('➕ Creando nueva campaña');
                console.log('📞 Llamando a crearCampaña...');
                const resultado = await crearCampaña(datosFormulario);
                console.log('🎯 Resultado de crearCampaña:', resultado);
                mostrarExito('Campaña creada exitosamente');
            }

            mostrarModalCampaña = false;
            
            // ✅ RECARGAR CAMPAÑAS DESPUÉS DE CREAR/ACTUALIZAR
            console.log('🔄 Recargando lista de campañas...');
            await cargarCampañas(negocioSeleccionado);
            console.log('✅ Campañas recargadas');
            
        } catch (error) {
            console.error('❌ Error guardando campaña:', error);
            mostrarError('Error al guardar la campaña');
        }
    };

    const editarCampaña = (campaña) => {
        campañaEditando = campaña;
        formCampaña = { ...campaña };
        mostrarModalCampaña = true;
    };

    const eliminarCampaña = async (campaña) => {
        if (confirm(`¿Eliminar la campaña "${campaña.nombre}"?`)) {
            try {
                await eliminarCampañaStore(campaña.id);
                mostrarExito('Campaña eliminada');
            } catch (error) {
                console.error('❌ Error eliminando campaña:', error);
                mostrarError(`Error al eliminar la campaña: ${error.message}`);
            }
        }
    };

    const cambiarEstadoCampaña = async (campaña, nuevoEstado) => {
        try {
            await actualizarCampaña(campaña.id, { estado: nuevoEstado });
            mostrarExito(`Campaña ${nuevoEstado}`);
        } catch (error) {
            console.error('❌ Error cambiando estado:', error);
            mostrarError(`Error al cambiar estado: ${error.message}`);
        }
    };

    // Cargar datos
    onMount(async () => {
        console.log('🚀 MOUNT: Inicializando página de marketing');
        
        try {
            // Cargar negocios primero
            console.log('📊 Cargando negocios...');
            await cargarNegocios();
            console.log('✅ Negocios cargados:', $negocios.length);
            
            // Cargar TODAS las campañas por defecto (todos los negocios)
            console.log('🎯 Cargando TODAS las campañas...');
            await cargarCampañas(); // Sin parámetro = todas las campañas
            console.log('✅ Campañas cargadas:', $campañas.length);
            
        } catch (error) {
            console.error('❌ Error en onMount:', error);
            mostrarError('Error al cargar datos iniciales');
        }
    });

    // Filtrar campañas por negocio
    $: campañasFiltradas = negocioSeleccionado 
        ? $campañas.filter(c => c.negocio_id === negocioSeleccionado)
        : $campañas;

    // Obtener color de estado
    const obtenerColorEstado = (estado) => {
        const estadoObj = estadosCampaña.find(e => e.value === estado);
        return estadoObj?.color || 'gray';
    };

    // Formatear moneda
    const formatearMoneda = (valor) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(valor);
    };

    // Reactivo: cargar campañas cuando cambie el negocio seleccionado
    $: {
        console.log('🔄 REACTIVE: Negocio cambió a:', negocioSeleccionado);
        if (negocioSeleccionado === '') {
            console.log('📊 Cargando TODAS las campañas de todos los negocios');
            cargarCampañas(); // Sin parámetro = todas las campañas
        } else {
            console.log('🏢 Cargando campañas del negocio:', negocioSeleccionado);
            cargarCampañas(negocioSeleccionado);
        }
    }

    // Plataformas (ajustado a la BD)
    const plataformas = [
        { value: 'google-ads', label: 'Google Ads', icon: '🔍' },
        { value: 'facebook-ads', label: 'Facebook Ads', icon: '📘' },
        { value: 'instagram-ads', label: 'Instagram Ads', icon: '📷' },
        { value: 'linkedin-ads', label: 'LinkedIn Ads', icon: '💼' },
        { value: 'twitter-ads', label: 'Twitter Ads', icon: '🐦' },
        { value: 'tiktok-ads', label: 'TikTok Ads', icon: '🎵' },
        { value: 'email', label: 'Email Marketing', icon: '📧' },
        { value: 'sms', label: 'SMS Marketing', icon: '📱' },
        { value: 'whatsapp', label: 'WhatsApp Business', icon: '💬' },
        { value: 'youtube-ads', label: 'YouTube Ads', icon: '📺' },
        { value: 'pinterest-ads', label: 'Pinterest Ads', icon: '📌' },
        { value: 'snapchat-ads', label: 'Snapchat Ads', icon: '👻' },
        { value: 'otros', label: 'Otros', icon: '🔗' }
    ];

    // Función para obtener color único por negocio
    const obtenerColorNegocio = (negocioId: string) => {
        const colores = [
            '#3B82F6', // Azul
            '#10B981', // Verde esmeralda
            '#F59E0B', // Amarillo
            '#EF4444', // Rojo
            '#8B5CF6', // Púrpura
            '#06B6D4', // Cian
            '#F97316', // Naranja
            '#84CC16', // Lima
            '#EC4899', // Rosa
            '#6366F1'  // Índigo
        ];
        
        // Usar hash simple del ID para asignar color consistente
        let hash = 0;
        for (let i = 0; i < negocioId.length; i++) {
            hash = negocioId.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colores[Math.abs(hash) % colores.length];
    };

    // Función para obtener nombre del negocio
    const obtenerNombreNegocio = (negocioId: string) => {
        const negocio = $negocios.find(n => n.id === negocioId);
        return negocio ? negocio.nombre : 'Negocio desconocido';
    };
</script>

<svelte:head>
    <title>Marketing - App Contabilidad</title>
</svelte:head>

<div class="p-6 space-y-6">
    <!-- Header -->
    <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <BarChart3 class="w-8 h-8 text-pink-600" />
                Marketing
            </h1>
            <p class="text-gray-600 dark:text-gray-400 mt-1">
                Gestiona campañas y analiza el rendimiento de marketing
            </p>
        </div>
        
        <div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <!-- Selector de Negocio -->
            <div class="flex items-center gap-3">
                <div class="p-2 bg-pink-100 dark:bg-pink-900/20 rounded-lg">
                    <Building2 class="w-5 h-5 text-pink-600 dark:text-pink-400" />
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Negocio
                    </label>
                    <select
                        bind:value={negocioSeleccionado}
                        class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                        <option value="">Todos los negocios</option>
                        {#each $negocios as negocio}
                            <option value={negocio.id}>{negocio.nombre}</option>
                        {/each}
                    </select>
                </div>
            </div>
            
            <Boton
                variant="success"
                icon={Plus}
                on:click={abrirModalNuevaCampaña}
            >
                Nueva Campaña
            </Boton>
        </div>
    </div>

    <!-- Estadísticas Generales -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <TarjetaEstadistica
            titulo="Total Campañas"
            valor={estadisticasMarketing.total_campañas.toString()}
            icono={BarChart3}
            color="azul"
        />
        
        <TarjetaEstadistica
            titulo="Campañas Activas"
            valor={estadisticasMarketing.campañas_activas.toString()}
            icono={Target}
            color="verde"
        />
        
        <TarjetaEstadistica
            titulo="Presupuesto Total"
            valor={formatearMoneda(estadisticasMarketing.presupuesto_total)}
            icono={TrendingUp}
            color="morado"
        />
        
        <TarjetaEstadistica
            titulo="ROI Promedio"
            valor="{estadisticasMarketing.roi_promedio}%"
            icono={TrendingUp}
            color="verde"
        />
    </div>

    <!-- Métricas Rápidas -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Métricas de Rendimiento
        </h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {#each metricas as metrica}
                <div class="text-center">
                    <div class="inline-flex items-center justify-center w-12 h-12 bg-pink-100 dark:bg-pink-900/20 rounded-lg mb-3">
                        <svelte:component this={metrica.icono} class="w-6 h-6 text-pink-600 dark:text-pink-400" />
                    </div>
                    <p class="text-2xl font-bold text-gray-900 dark:text-gray-100">{metrica.valor}</p>
                    <p class="text-sm text-gray-600 dark:text-gray-400">{metrica.label}</p>
                    <p class="text-sm font-medium text-green-600 dark:text-green-400">{metrica.cambio}</p>
                </div>
            {/each}
        </div>
    </div>

    <!-- Lista de Campañas -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div class="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {#if negocioSeleccionado}
                    Campañas de {obtenerNombreNegocio(negocioSeleccionado)} ({campañasFiltradas.length})
                {:else}
                    Todas las Campañas ({campañasFiltradas.length})
                {/if}
            </h3>
        </div>
        
        {#if campañasFiltradas.length === 0}
            <div class="p-12 text-center">
                <BarChart3 class="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    No hay campañas
                </h3>
                <p class="text-gray-500 mb-6">
                    {#if negocioSeleccionado}
                        Este negocio no tiene campañas aún
                    {:else}
                        No tienes campañas creadas aún
                    {/if}
                </p>
                <Boton
                    variant="primary"
                    icon={Plus}
                    on:click={abrirModalNuevaCampaña}
                >
                    Crear Primera Campaña
                </Boton>
            </div>
        {:else}
            <div class="p-6">
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {#each campañasFiltradas as campaña}
                        <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 border-l-4 hover:shadow-md transition-shadow"
                             style="border-left-color: {obtenerColorNegocio(campaña.negocio_id)}">
                            
                            <!-- Header de la campaña -->
                            <div class="flex items-start justify-between mb-4">
                                <div class="flex-1">
                                    <h4 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                                        {campaña.nombre}
                                    </h4>
                                    
                                    <!-- Badge del negocio (solo cuando mostramos todos) -->
                                    {#if !negocioSeleccionado}
                                        <div class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mb-2"
                                             style="background-color: {obtenerColorNegocio(campaña.negocio_id)}20; color: {obtenerColorNegocio(campaña.negocio_id)}">
                                            <Building2 class="w-3 h-3 mr-1" />
                                            {obtenerNombreNegocio(campaña.negocio_id)}
                                        </div>
                                    {/if}
                                    
                                    <!-- Estado -->
                                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                                        {obtenerColorEstado(campaña.estado) === 'green' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                                         obtenerColorEstado(campaña.estado) === 'blue' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                                         obtenerColorEstado(campaña.estado) === 'yellow' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                                         obtenerColorEstado(campaña.estado) === 'red' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                                         'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'}">
                                        {campaña.estado}
                                    </span>
                                </div>
                            </div>
                            
                            <!-- Detalles de la campaña -->
                            <div class="space-y-3">
                                {#if campaña.descripcion}
                                    <p class="text-sm text-gray-600 dark:text-gray-400">
                                        {campaña.descripcion}
                                    </p>
                                {/if}
                                
                                <div class="flex items-center justify-between text-sm">
                                    <span class="text-gray-600 dark:text-gray-400">Plataforma:</span>
                                    <span class="font-medium text-gray-900 dark:text-gray-100">
                                        {campaña.plataforma}
                                    </span>
                                </div>
                                
                                <div class="flex items-center justify-between text-sm">
                                    <span class="text-gray-600 dark:text-gray-400">Presupuesto:</span>
                                    <span class="font-medium text-gray-900 dark:text-gray-100">
                                        {formatearMoneda(campaña.presupuesto_total)}
                                    </span>
                                </div>
                                
                                <div class="flex items-center justify-between text-sm">
                                    <span class="text-gray-600 dark:text-gray-400">Inicio:</span>
                                    <span class="font-medium text-gray-900 dark:text-gray-100">
                                        {new Date(campaña.fecha_inicio).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                            
                            <!-- Acciones -->
                            <div class="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                                <button
                                    class="text-xs px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md transition-colors"
                                    on:click={() => editarCampaña(campaña)}
                                >
                                    Editar
                                </button>
                                
                                {#if campaña.estado !== 'activa'}
                                    <button
                                        class="text-xs px-3 py-1 bg-green-100 hover:bg-green-200 text-green-700 rounded-md transition-colors"
                                        on:click={() => cambiarEstadoCampaña(campaña, 'activa')}
                                    >
                                        Activar
                                    </button>
                                {/if}
                                
                                {#if campaña.estado === 'activa'}
                                    <button
                                        class="text-xs px-3 py-1 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded-md transition-colors"
                                        on:click={() => cambiarEstadoCampaña(campaña, 'pausada')}
                                    >
                                        Pausar
                                    </button>
                                {/if}
                                
                                <button
                                    class="text-xs px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-md transition-colors"
                                    on:click={() => eliminarCampaña(campaña)}
                                >
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    {/each}
                </div>
            </div>
        {/if}
    </div>
</div>

<!-- Modal de Campaña -->
{#if mostrarModalCampaña}
    <Modal bind:abierto={mostrarModalCampaña} titulo="{campañaEditando ? 'Editar' : 'Nueva'} Campaña" tamaño="lg">
        <form class="space-y-6" on:submit|preventDefault={guardarCampaña}>
            <!-- Información básica -->
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Nombre de la campaña *
                    </label>
                    <input
                        type="text"
                        bind:value={formCampaña.nombre}
                        placeholder="Ej: Campaña Navidad 2024"
                        required
                        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        on:input={(e) => {
                            console.log('📝 INPUT EVENT: nuevo valor =', e.target.value);
                            formCampaña.nombre = e.target.value;
                        }}
                    />
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Descripción
                    </label>
                    <textarea
                        bind:value={formCampaña.descripcion}
                        placeholder="Describe los objetivos y detalles de la campaña..."
                        rows="3"
                        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    ></textarea>
                </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- Negocio -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Negocio *
                    </label>
                    <select
                        bind:value={formCampaña.negocio_id}
                        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        required
                    >
                        <option value="">Seleccionar negocio...</option>
                        {#each $negocios as negocio}
                            <option value={negocio.id}>{negocio.nombre}</option>
                        {/each}
                    </select>
                </div>

                <!-- Tipo de campaña -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Tipo de campaña
                    </label>
                    <select
                        bind:value={formCampaña.tipo_campana}
                        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        on:change={() => {
                            // Auto-sincronizar plataforma con tipo_campana
                            formCampaña.plataforma = formCampaña.tipo_campana;
                        }}
                    >
                        {#each tiposCampaña as tipo}
                            <option value={tipo.value}>{tipo.icon} {tipo.label}</option>
                        {/each}
                    </select>
                </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- Plataforma -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Plataforma *
                    </label>
                    <select
                        bind:value={formCampaña.plataforma}
                        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        required
                    >
                        {#each plataformas as plataforma}
                            <option value={plataforma.value}>{plataforma.icon} {plataforma.label}</option>
                        {/each}
                    </select>
                </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- Objetivo -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Objetivo
                    </label>
                    <select
                        bind:value={formCampaña.objetivo}
                        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                        {#each objetivos as objetivo}
                            <option value={objetivo.value}>{objetivo.label}</option>
                        {/each}
                    </select>
                </div>

                <!-- Presupuesto -->
                <Input
                    label="Presupuesto"
                    type="number"
                    bind:value={formCampaña.presupuesto_total}
                    placeholder="1000"
                    min="1"
                    step="100"
                />
            </div>
            
            <!-- Fechas -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Fecha de inicio *
                    </label>
                    <input
                        type="date"
                        bind:value={formCampaña.fecha_inicio}
                        required
                        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        on:input={(e) => {
                            console.log('📅 FECHA INICIO EVENT: nuevo valor =', e.target.value);
                            formCampaña.fecha_inicio = e.target.value;
                        }}
                    />
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Fecha de fin
                    </label>
                    <input
                        type="date"
                        bind:value={formCampaña.fecha_fin}
                        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        on:input={(e) => {
                            console.log('📅 FECHA FIN EVENT: nuevo valor =', e.target.value);
                            formCampaña.fecha_fin = e.target.value;
                        }}
                    />
                </div>
            </div>
            
            <!-- Botones -->
            <div class="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                    type="button"
                    on:click={() => mostrarModalCampaña = false}
                    class="px-6 py-3 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
                >
                    Cancelar
                </button>
                
                <button
                    type="button"
                    on:click={(e) => {
                        console.log('🔴 BOTÓN PRESIONADO - Estado actual del formulario:');
                        console.log('   - formCampaña.nombre en click:', formCampaña.nombre);
                        console.log('   - formCampaña completo:', JSON.stringify(formCampaña, null, 2));
                        e.preventDefault();
                        guardarCampaña();
                    }}
                    disabled={$cargandoCampañas}
                    class="px-6 py-3 bg-pink-600 hover:bg-pink-700 disabled:bg-pink-400 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                    {#if $cargandoCampañas}
                        <div class="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                    {/if}
                    {campañaEditando ? 'Actualizar' : 'Crear'} Campaña
                </button>
            </div>
        </form>
    </Modal>
{/if} 