<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { Calendar, Flag, Edit3, Trash2, User, ChevronDown, ArrowRight } from 'lucide-svelte';
    
    // Props
    export let tarea;
    export let mostrarSelectorEstado = true; // NUEVO: Mostrar selector de estado
    
    // Event dispatcher
    const dispatch = createEventDispatcher();
    
    // Variables para control del dropdown
    let mostrarDropdown = false;
    let dropdownButton: HTMLElement;
    let dropdownPosition = 'bottom'; // 'bottom' o 'top'

    // Estados disponibles para el dropdown
    const estadosDisponibles = [
        { id: 'por-hacer', label: 'Por Hacer', icon: '📋', color: 'text-gray-600' },
        { id: 'en-progreso', label: 'En Progreso', icon: '🔄', color: 'text-blue-600' },
        { id: 'en-revision', label: 'En Revisión', icon: '👀', color: 'text-yellow-600' },
        { id: 'completada', label: 'Completada', icon: '✅', color: 'text-green-600' }
    ];

    // Estado actual
    $: estadoActual = estadosDisponibles.find(e => e.id === tarea.estado) || estadosDisponibles[0];

    // Calcular posición del dropdown dinámicamente
    const calcularPosicionDropdown = () => {
        if (!dropdownButton) return;
        
        const rect = dropdownButton.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const dropdownHeight = 240; // altura aproximada del dropdown
        const spaceBelow = windowHeight - rect.bottom;
        const spaceAbove = rect.top;

        // Si no hay suficiente espacio abajo, mostrar arriba
        dropdownPosition = spaceBelow < dropdownHeight && spaceAbove > dropdownHeight ? 'top' : 'bottom';
    };

    // NUEVO: Handler para cambiar estado con posicionamiento
    const handleToggleDropdown = (event: Event) => {
        event.stopPropagation();
        if (!mostrarDropdown) {
            calcularPosicionDropdown();
        }
        mostrarDropdown = !mostrarDropdown;
    };
    
    // Colores de prioridad
    const coloresPrioridad = {
        baja: 'border-l-gray-400 bg-gray-50',
        media: 'border-l-blue-400 bg-blue-50',
        alta: 'border-l-orange-400 bg-orange-50',
        urgente: 'border-l-red-400 bg-red-50'
    };
    
    const iconosPrioridad = {
        baja: '⬇️',
        media: '➡️',
        alta: '⬆️',
        urgente: '🚨'
    };
    
    // Verificar si está vencida
    $: estaVencida = tarea.fecha_limite && new Date(tarea.fecha_limite) < new Date() && tarea.estado !== 'completada';
    $: proximaVencer = tarea.fecha_limite && new Date(tarea.fecha_limite) <= new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    
    // Formatear fecha
    const formatearFecha = (fecha) => {
        if (!fecha) return '';
        return new Date(fecha).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'short'
        });
    };
    
    // Handlers
    const handleEditar = () => {
        dispatch('editar');
    };
    
    const handleEliminar = () => {
        dispatch('eliminar');
    };
    
    const handleCambiarEstado = (nuevoEstado) => {
        mostrarDropdown = false;
        dispatch('cambiar-estado', { estado: nuevoEstado });
    };

    // Cerrar dropdown al hacer clic fuera
    const handleClickOutside = (event) => {
        if (!event.target.closest('.selector-estado')) {
            mostrarDropdown = false;
        }
    };
</script>

<svelte:document on:click={handleClickOutside} />

<div 
    class="bg-white dark:bg-gray-700 rounded-lg border-l-4 {coloresPrioridad[tarea.prioridad] || coloresPrioridad.media} shadow-sm hover:shadow-md transition-shadow duration-200 p-4 group"
>
    <!-- Header con título y acciones -->
    <div class="flex items-start justify-between mb-3">
        <h4 class="font-medium text-gray-900 dark:text-gray-100 flex-1 pr-2 leading-tight">
            {tarea.titulo}
        </h4>
        
        <!-- Acciones (visibles siempre en móvil, en hover en desktop) -->
        <div class="flex items-center gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
            <button
                on:click={handleEditar}
                class="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded transition-colors"
                title="Editar tarea"
            >
                <Edit3 class="w-3.5 h-3.5" />
            </button>
            <button
                on:click={handleEliminar}
                class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded transition-colors"
                title="Eliminar tarea"
            >
                <Trash2 class="w-3.5 h-3.5" />
            </button>
        </div>
    </div>
    
    <!-- Descripción (si existe) -->
    {#if tarea.descripcion}
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
            {tarea.descripcion}
        </p>
    {/if}

    <!-- Selector de Estado (NUEVO) -->
    {#if mostrarSelectorEstado}
        <div class="mb-3">
            <div class="relative selector-estado">
                <button
                    on:click={handleToggleDropdown}
                    bind:this={dropdownButton}
                    class="w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 transition-colors {estadoActual.color}"
                >
                    <div class="flex items-center">
                        <span class="mr-2">{estadoActual.icon}</span>
                        <span>{estadoActual.label}</span>
                    </div>
                    <ChevronDown class="w-4 h-4 text-gray-400 transition-transform duration-200 {mostrarDropdown ? 'rotate-180' : ''}" />
                </button>
                    
                <!-- Dropdown de estados -->
                {#if mostrarDropdown}
                    <div class="absolute {dropdownPosition === 'top' ? 'bottom-full mb-1' : 'top-full mt-1'} left-0 right-0 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-50">
                        {#each estadosDisponibles as estado}
                            <button
                                class="flex items-center w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 {tarea.estado === estado.id ? 'bg-blue-50 dark:bg-blue-900' : ''}"
                                on:click={(e) => handleCambiarEstado(estado.id)}
                            >
                                <span class="mr-2">{estado.icon}</span>
                                <span class="flex-1 text-left">{estado.label}</span>
                                {#if tarea.estado === estado.id}
                                    <span class="text-blue-600 dark:text-blue-400">✓</span>
                                {/if}
                            </button>
                        {/each}
                    </div>
                {/if}
            </div>
        </div>
    {/if}
    
    <!-- Footer con metadatos -->
    <div class="flex items-center justify-between text-xs">
        <div class="flex items-center gap-2">
            <!-- Prioridad -->
            <span class="flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300">
                <span>{iconosPrioridad[tarea.prioridad]}</span>
                <span class="capitalize">{tarea.prioridad}</span>
            </span>
            
            <!-- Fecha límite -->
            {#if tarea.fecha_limite}
                <span 
                    class="flex items-center gap-1 px-2 py-1 rounded-full {
                        estaVencida 
                            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' 
                            : proximaVencer 
                                ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                                : 'bg-gray-100 text-gray-600 dark:bg-gray-600 dark:text-gray-300'
                    }"
                >
                    <Calendar class="w-3 h-3" />
                    <span>{formatearFecha(tarea.fecha_limite)}</span>
                </span>
            {/if}
        </div>
        
        <!-- Derecha: Asignado -->
        {#if tarea.asignado_a}
            <div class="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                <User class="w-3 h-3" />
                <span class="truncate max-w-20">{tarea.asignado_a}</span>
            </div>
        {/if}
    </div>
    
    <!-- Indicador de vencimiento (si aplica) -->
    {#if estaVencida}
        <div class="mt-2 text-xs text-red-600 dark:text-red-400 font-medium">
            ⚠️ Vencida
        </div>
    {:else if proximaVencer}
        <div class="mt-2 text-xs text-orange-600 dark:text-orange-400 font-medium">
            ⏰ Próxima a vencer
        </div>
    {/if}
</div>

<style>
    .line-clamp-2 {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }
</style> 