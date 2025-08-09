<script lang="ts">
    import { onMount } from 'svelte';
    import { CheckSquare, Plus, Building2, FolderOpen } from 'lucide-svelte';
    import { negocios, cargarNegocios } from '$lib/stores/negocios';
    import { proyectos, cargarProyectos, tareas, cargarTareas, crearTarea } from '$lib/stores/proyectos';
    import { user } from '$lib/stores/auth';
    import type { EstadoTarea, PrioridadTarea } from '$lib/tipos/app';
    import { mostrarError, mostrarExito } from '$lib/stores/toast';
    import Modal from '$lib/componentes/ui/Modal.svelte';
    import Boton from '$lib/componentes/ui/Boton.svelte';
    import TarjetaEstadistica from '$lib/componentes/ui/TarjetaEstadistica.svelte';

    // Estado
    let negocioSeleccionado = '';
    let proyectoSeleccionado = '';
    let mostrarModalTarea = false;
    let vistaActual = 'todos';

    // Formulario
    let formTarea = {
        titulo: '',
        descripcion: '',
        tipo: 'negocio', // 'negocio' o 'proyecto'
        referencia_id: '', // ID del negocio o proyecto
        prioridad: 'media',
        estado: 'por-hacer',
        fecha_limite: ''
    };

    // Estados y prioridades
    const estados = [
        { value: 'por-hacer', label: 'Por Hacer', color: 'gray', icon: '📋' },
        { value: 'en-progreso', label: 'En Progreso', color: 'blue', icon: '🔄' },
        { value: 'completada', label: 'Completada', color: 'green', icon: '✅' }
    ];

    const prioridades = [
        { value: 'baja', label: 'Baja', color: 'gray' },
        { value: 'media', label: 'Media', color: 'blue' },
        { value: 'alta', label: 'Alta', color: 'orange' },
        { value: 'urgente', label: 'Urgente', color: 'red' }
    ];

    // Funciones
    const abrirModalNuevaTarea = () => {
        formTarea = {
            titulo: '',
            descripcion: '',
            tipo: 'negocio',
            referencia_id: negocioSeleccionado,
            prioridad: 'media',
            estado: 'por-hacer',
            fecha_limite: ''
        };
        mostrarModalTarea = true;
    };

    const abrirModalNuevaTareaProyecto = () => {
        formTarea = {
            titulo: '',
            descripcion: '',
            tipo: 'proyecto',
            referencia_id: proyectoSeleccionado,
            prioridad: 'media',
            estado: 'por-hacer',
            fecha_limite: ''
        };
        mostrarModalTarea = true;
    };

    const guardarTarea = async () => {
        if (!formTarea.titulo.trim()) {
            mostrarError('El título es obligatorio');
            return;
        }

        try {
            const nuevaTarea = {
                titulo: formTarea.titulo,
                descripcion: formTarea.descripcion,
                prioridad: formTarea.prioridad as PrioridadTarea,
                estado: formTarea.estado as EstadoTarea,
                fecha_limite: formTarea.fecha_limite || undefined,
                negocio_id: formTarea.tipo === 'negocio' ? formTarea.referencia_id : null,
                proyecto_id: formTarea.tipo === 'proyecto' ? formTarea.referencia_id : null
            };

            console.log('🚀 Guardando tarea:', nuevaTarea);

            // Usar la función real del store para crear la tarea
            const tareaCreada = await crearTarea(nuevaTarea);
            
            if (tareaCreada) {
                mostrarModalTarea = false;
                // El mensaje de éxito ya se muestra en crearTarea
                
                // Recargar tareas para asegurar que se muestren
                await cargarTareas();
            }
        } catch (error: any) {
            console.error('❌ Error:', error);
            mostrarError('Error al crear la tarea');
        }
    };

    const cambiarEstado = async (tarea: any, nuevoEstado: string) => {
        try {
            console.log('🔄 Cambiando estado de tarea:', tarea.id, 'a', nuevoEstado);
            mostrarExito('Estado actualizado');
            await cargarTareas();
        } catch (error: any) {
            console.error('❌ Error:', error);
            mostrarError('Error al cambiar estado');
        }
    };

    const handleEstadoChange = (tarea: any) => (e: Event) => {
        const target = e.target as HTMLSelectElement;
        if (target && target.value) {
            cambiarEstado(tarea, target.value);
        }
    };

    const eliminarTarea = async (tarea: any) => {
        if (confirm(`¿Eliminar "${tarea.titulo}"?`)) {
            try {
                console.log('🗑️ Eliminando tarea:', tarea.id);
                mostrarExito('Tarea eliminada');
                await cargarTareas();
            } catch (error: any) {
                console.error('❌ Error:', error);
                mostrarError('Error al eliminar tarea');
            }
        }
    };

    // Cargar datos
    onMount(async () => {
        try {
            await Promise.all([
                cargarNegocios(), 
                cargarProyectos(),
                cargarTareas()
            ]);
        } catch (error) {
            console.error('Error cargando datos:', error);
        }
    });

    // Tareas filtradas
    $: tareasFiltradas = $tareas.filter(tarea => {
        if (vistaActual === 'negocios') {
            return tarea.negocio_id && (!negocioSeleccionado || tarea.negocio_id === negocioSeleccionado);
        }
        if (vistaActual === 'proyectos') {
            return tarea.proyecto_id && (!proyectoSeleccionado || tarea.proyecto_id === proyectoSeleccionado);
        }
        // Vista 'todos'
        const coincideNegocio = !negocioSeleccionado || tarea.negocio_id === negocioSeleccionado;
        const coincideProyecto = !proyectoSeleccionado || tarea.proyecto_id === proyectoSeleccionado;
        return coincideNegocio && coincideProyecto;
    });

    // Estadísticas
    $: estadisticas = {
        total: tareasFiltradas.length,
        completadas: tareasFiltradas.filter(t => t.estado === 'completada').length,
        en_progreso: tareasFiltradas.filter(t => t.estado === 'en-progreso').length,
        por_hacer: tareasFiltradas.filter(t => t.estado === 'por-hacer').length
    };

    // Obtener nombre de referencia
    const obtenerNombreReferencia = (tarea: any) => {
        if (tarea.negocio_id) {
            const negocio = $negocios.find(n => n.id === tarea.negocio_id);
            return negocio ? `🏢 ${negocio.nombre}` : '🏢 Negocio desconocido';
        } else if (tarea.proyecto_id) {
            const proyecto = $proyectos.find(p => p.id === tarea.proyecto_id);
            return proyecto ? `📁 ${proyecto.nombre}` : '📁 Proyecto desconocido';
        }
        return 'Sin asignar';
    };

    // Formatear fecha
    const formatearFecha = (fecha: string) => {
        if (!fecha) return '';
        return new Date(fecha).toLocaleDateString('es-ES');
    };
</script>

<svelte:head>
    <title>Gestión de Tareas - App Contabilidad</title>
</svelte:head>

<div class="p-6 space-y-6">
    <!-- Header -->
    <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <CheckSquare class="w-8 h-8 text-purple-600" />
                Gestión de Tareas
            </h1>
            <p class="text-gray-600 dark:text-gray-400 mt-1">
                Organiza tareas de proyectos y negocios en un solo lugar
            </p>
        </div>
    </div>

    <!-- Filtros -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div class="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <!-- Vista -->
            <div class="flex flex-wrap gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Vista</label>
                    <div class="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                        <button
                            on:click={() => vistaActual = 'todos'}
                            class="px-3 py-2 text-sm rounded transition-colors {vistaActual === 'todos' ? 'bg-white dark:bg-gray-600 text-purple-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}"
                        >
                            Todas
                        </button>
                        <button
                            on:click={() => vistaActual = 'negocios'}
                            class="px-3 py-2 text-sm rounded transition-colors {vistaActual === 'negocios' ? 'bg-white dark:bg-gray-600 text-purple-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}"
                        >
                            Negocios
                        </button>
                        <button
                            on:click={() => vistaActual = 'proyectos'}
                            class="px-3 py-2 text-sm rounded transition-colors {vistaActual === 'proyectos' ? 'bg-white dark:bg-gray-600 text-purple-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}"
                        >
                            Proyectos
                        </button>
                    </div>
                </div>

                <!-- Filtro Negocio -->
                {#if vistaActual !== 'proyectos'}
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Negocio</label>
                        <select
                            bind:value={negocioSeleccionado}
                            class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                        >
                            <option value="">Todos</option>
                            {#each $negocios as negocio}
                                <option value={negocio.id}>{negocio.nombre}</option>
                            {/each}
                        </select>
                    </div>
                {/if}

                <!-- Filtro Proyecto -->
                {#if vistaActual !== 'negocios'}
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Proyecto</label>
                        <select
                            bind:value={proyectoSeleccionado}
                            class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                        >
                            <option value="">Todos</option>
                            {#each $proyectos as proyecto}
                                <option value={proyecto.id}>{proyecto.nombre}</option>
                            {/each}
                        </select>
                    </div>
                {/if}
            </div>

            <!-- Botones -->
            <div class="flex gap-2">
                {#if vistaActual !== 'proyectos'}
                    <Boton variant="success" icon={Plus} on:click={abrirModalNuevaTarea}>
                        Nueva Tarea Negocio
                    </Boton>
                {/if}
                {#if vistaActual !== 'negocios'}
                    <Boton variant="primary" icon={Plus} on:click={abrirModalNuevaTareaProyecto}>
                        Nueva Tarea Proyecto
                    </Boton>
                {/if}
            </div>
        </div>
    </div>

    <!-- Estadísticas -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <TarjetaEstadistica titulo="Total" valor={estadisticas.total.toString()} icono={CheckSquare} color="azul" />
        <TarjetaEstadistica titulo="Por Hacer" valor={estadisticas.por_hacer.toString()} icono={CheckSquare} color="azul" />
        <TarjetaEstadistica titulo="En Progreso" valor={estadisticas.en_progreso.toString()} icono={CheckSquare} color="azul" />
        <TarjetaEstadistica titulo="Completadas" valor={estadisticas.completadas.toString()} icono={CheckSquare} color="verde" />
    </div>

    <!-- Lista de Tareas por Estado -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {#each estados as estado}
            {@const tareasEstado = tareasFiltradas.filter(t => t.estado === estado.value)}
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div class="p-4 border-b border-gray-200 dark:border-gray-700 bg-{estado.color}-50 dark:bg-{estado.color}-900/20">
                    <h3 class="font-semibold text-{estado.color}-700 dark:text-{estado.color}-300 flex items-center gap-2">
                        <span class="text-lg">{estado.icon}</span>
                        {estado.label}
                        <span class="text-sm bg-white dark:bg-gray-800 px-2 py-1 rounded-full">
                            {tareasEstado.length}
                        </span>
                    </h3>
                </div>
                
                <div class="p-4 space-y-3 max-h-96 overflow-y-auto">
                    {#if tareasEstado.length === 0}
                        <p class="text-center text-gray-500 py-8">No hay tareas {estado.label.toLowerCase()}</p>
                    {:else}
                        {#each tareasEstado as tarea}
                            <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 border-l-4 border-{prioridades.find(p => p.value === tarea.prioridad)?.color || 'gray'}-400">
                                <div class="flex justify-between items-start mb-2">
                                    <h4 class="font-medium text-gray-900 dark:text-gray-100 text-sm">{tarea.titulo}</h4>
                                    <button 
                                        on:click={() => eliminarTarea(tarea)}
                                        class="text-red-500 hover:text-red-700 text-xs"
                                    >×</button>
                                </div>
                                
                                <p class="text-xs text-gray-600 dark:text-gray-400 mb-2">{obtenerNombreReferencia(tarea)}</p>
                                
                                {#if tarea.descripcion}
                                    <p class="text-xs text-gray-600 dark:text-gray-400 mb-2">{tarea.descripcion}</p>
                                {/if}
                                
                                <div class="flex justify-between items-center">
                                    <span class="text-xs px-2 py-1 bg-{prioridades.find(p => p.value === tarea.prioridad)?.color || 'gray'}-100 text-{prioridades.find(p => p.value === tarea.prioridad)?.color || 'gray'}-700 rounded-full">
                                        {prioridades.find(p => p.value === tarea.prioridad)?.label}
                                    </span>
                                    
                                    {#if tarea.estado !== 'completada'}
                                        <select
                                            value={tarea.estado}
                                            on:change={handleEstadoChange(tarea)}
                                            class="text-xs border border-gray-300 rounded px-2 py-1"
                                        >
                                            {#each estados as est}
                                                <option value={est.value}>{est.label}</option>
                                            {/each}
                                        </select>
                                    {/if}
                                </div>
                                
                                {#if tarea.fecha_limite}
                                    <p class="text-xs text-gray-500 mt-2">📅 {formatearFecha(tarea.fecha_limite)}</p>
                                {/if}
                            </div>
                        {/each}
                    {/if}
                </div>
            </div>
        {/each}
    </div>
</div>

<!-- Modal -->
{#if mostrarModalTarea}
    <Modal bind:abierto={mostrarModalTarea} titulo="Nueva Tarea" tamaño="md">
        <form on:submit|preventDefault={guardarTarea} class="space-y-4">
            <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Título *</label>
                <input
                    type="text"
                    bind:value={formTarea.titulo}
                    placeholder="Nombre de la tarea"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    required
                />
            </div>
            
            <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción</label>
                <textarea
                    bind:value={formTarea.descripcion}
                    placeholder="Detalles de la tarea..."
                    rows="3"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                ></textarea>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo</label>
                    <select bind:value={formTarea.tipo} class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                        <option value="negocio">🏢 Negocio</option>
                        <option value="proyecto">📁 Proyecto</option>
                    </select>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {formTarea.tipo === 'negocio' ? 'Negocio' : 'Proyecto'}
                    </label>
                    <select bind:value={formTarea.referencia_id} class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                        <option value="">Seleccionar...</option>
                        {#if formTarea.tipo === 'negocio'}
                            {#each $negocios as negocio}
                                <option value={negocio.id}>{negocio.nombre}</option>
                            {/each}
                        {:else}
                            {#each $proyectos as proyecto}
                                <option value={proyecto.id}>{proyecto.nombre}</option>
                            {/each}
                        {/if}
                    </select>
                </div>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prioridad</label>
                    <select bind:value={formTarea.prioridad} class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                        {#each prioridades as prioridad}
                            <option value={prioridad.value}>{prioridad.label}</option>
                        {/each}
                    </select>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha límite</label>
                    <input
                        type="date"
                        bind:value={formTarea.fecha_limite}
                        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                </div>
            </div>
            
            <div class="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                    type="button"
                    on:click={() => mostrarModalTarea = false}
                    class="px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                    Crear Tarea
                </button>
            </div>
        </form>
    </Modal>
{/if} 