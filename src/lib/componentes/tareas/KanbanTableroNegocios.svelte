<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { Plus, Filter, Search } from 'lucide-svelte';
    import TarjetaTareaNegocio from './TarjetaTareaNegocio.svelte';
    
    // Props
    export let tareas = [];
    export let negocioId = '';
    export let cargandoTareas = false;
    
    // Event dispatcher
    const dispatch = createEventDispatcher();
    
    // Estados del tablero
    const estadosTablero = [
        { 
            id: 'por-hacer',
            label: 'Por Hacer', 
            color: 'bg-gray-50 border-gray-200',
            colorAccent: 'text-gray-600',
            icon: '📋'
        },
        { 
            id: 'en-progreso',
            label: 'En Progreso', 
            color: 'bg-blue-50 border-blue-200',
            colorAccent: 'text-blue-600',
            icon: '🔄'
        },
        { 
            id: 'en-revision',
            label: 'En Revisión', 
            color: 'bg-yellow-50 border-yellow-200',
            colorAccent: 'text-yellow-600',
            icon: '👀'
        },
        { 
            id: 'completada',
            label: 'Completada', 
            color: 'bg-green-50 border-green-200',
            colorAccent: 'text-green-600',
            icon: '✅'
        }
    ];
    
    // Filtros
    let filtroTexto = '';
    let filtroPrioridad = 'todas';
    
    // Tareas filtradas por estado
    $: tareasPorEstado = estadosTablero.reduce((acc, estado) => {
        acc[estado.id] = tareas.filter(tarea => {
            const coincideEstado = tarea.estado === estado.id;
            const coincideTexto = !filtroTexto || 
                tarea.titulo.toLowerCase().includes(filtroTexto.toLowerCase()) ||
                tarea.descripcion?.toLowerCase().includes(filtroTexto.toLowerCase());
            const coincidePrioridad = filtroPrioridad === 'todas' || tarea.prioridad === filtroPrioridad;
            
            return coincideEstado && coincideTexto && coincidePrioridad;
        });
        return acc;
    }, {});
    
    // Handlers
    const handleCrearTarea = (estado) => {
        dispatch('crear-tarea', { estado });
    };
    
    const handleMoverTarea = (tarea, nuevoEstado) => {
        dispatch('mover-tarea', { tarea, nuevoEstado });
    };
    
    const handleEditarTarea = (tarea) => {
        dispatch('editar-tarea', { tarea });
    };
    
    const handleEliminarTarea = (tarea) => {
        dispatch('eliminar-tarea', { tarea });
    };
    
    // Drag and drop simple (sin librería externa por ahora)
    let draggedTask = null;
    
    const handleDragStart = (event, tarea) => {
        draggedTask = tarea;
        event.dataTransfer.effectAllowed = 'move';
    };
    
    const handleDragOver = (event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    };
    
    const handleDrop = (event, nuevoEstado) => {
        event.preventDefault();
        if (draggedTask && draggedTask.estado !== nuevoEstado) {
            handleMoverTarea(draggedTask, nuevoEstado);
        }
        draggedTask = null;
    };
</script>

<div class="space-y-6">
    <!-- Filtros -->
    <div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div class="flex flex-col sm:flex-row gap-3 flex-1">
            <!-- Búsqueda -->
            <div class="relative flex-1 max-w-sm">
                <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                    type="text"
                    bind:value={filtroTexto}
                    placeholder="Buscar tareas..."
                    class="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
            </div>
            
            <!-- Filtro de prioridad -->
            <select
                bind:value={filtroPrioridad}
                class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
                <option value="todas">Todas las prioridades</option>
                <option value="baja">Prioridad Baja</option>
                <option value="media">Prioridad Media</option>
                <option value="alta">Prioridad Alta</option>
                <option value="urgente">Prioridad Urgente</option>
            </select>
        </div>
        
        <!-- Estadísticas rápidas -->
        <div class="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <span>Total: {tareas.length}</span>
            <span>Completadas: {tareasPorEstado.completada?.length || 0}</span>
        </div>
    </div>
    
    <!-- Tablero Kanban -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {#each estadosTablero as estado}
            <div class="flex flex-col h-full">
                <!-- Header de columna -->
                <div class="flex items-center justify-between p-4 {estado.color} border-2 {estado.color.replace('bg-', 'border-').replace('-50', '-200')} rounded-t-lg">
                    <div class="flex items-center gap-2">
                        <span class="text-lg">{estado.icon}</span>
                        <h3 class="font-semibold {estado.colorAccent}">
                            {estado.label}
                        </h3>
                        <span class="text-sm {estado.colorAccent} bg-white dark:bg-gray-800 px-2 py-1 rounded-full">
                            {tareasPorEstado[estado.id]?.length || 0}
                        </span>
                    </div>
                    
                    <button
                        on:click={() => handleCrearTarea(estado.id)}
                        class="p-1 hover:bg-white hover:bg-opacity-50 rounded transition-colors"
                        title="Agregar tarea"
                    >
                        <Plus class="w-4 h-4 {estado.colorAccent}" />
                    </button>
                </div>
                
                <!-- Drop zone -->
                <div
                    class="flex-1 p-4 bg-white dark:bg-gray-800 border-2 border-t-0 {estado.color.replace('bg-', 'border-').replace('-50', '-200')} rounded-b-lg min-h-64 space-y-3"
                    on:dragover={handleDragOver}
                    on:drop={(e) => handleDrop(e, estado.id)}
                >
                    {#if tareasPorEstado[estado.id]?.length === 0}
                        <!-- Estado vacío -->
                        <div class="flex flex-col items-center justify-center h-32 text-center">
                            <div class="text-4xl mb-2 opacity-50">{estado.icon}</div>
                            <p class="text-sm text-gray-500 dark:text-gray-400 mb-3">
                                No hay tareas {estado.label.toLowerCase()}
                            </p>
                            <button
                                on:click={() => handleCrearTarea(estado.id)}
                                class="text-sm text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 font-medium flex items-center gap-1"
                            >
                                <Plus class="w-3 h-3" />
                                Agregar tarea
                            </button>
                        </div>
                    {:else}
                        <!-- Lista de tareas -->
                        {#each tareasPorEstado[estado.id] as tarea (tarea.id)}
                            <div
                                draggable="true"
                                on:dragstart={(e) => handleDragStart(e, tarea)}
                                class="cursor-move"
                            >
                                <TarjetaTareaNegocio
                                    {tarea}
                                    on:editar={() => handleEditarTarea(tarea)}
                                    on:eliminar={() => handleEliminarTarea(tarea)}
                                    on:cambiar-estado={(e) => handleMoverTarea(tarea, e.detail.estado)}
                                />
                            </div>
                        {/each}
                    {/if}
                </div>
            </div>
        {/each}
    </div>
    
    {#if cargandoTareas}
        <div class="flex items-center justify-center py-8">
            <div class="animate-spin w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full mr-3"></div>
            <span class="text-gray-600 dark:text-gray-400">Cargando tareas...</span>
        </div>
    {/if}
</div> 