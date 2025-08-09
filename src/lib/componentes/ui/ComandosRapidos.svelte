<script lang="ts">
    import { createEventDispatcher, onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { browser } from '$app/environment';
    import { Search, Command, ArrowRight, Clock, Star, Zap } from 'lucide-svelte';
    import { fly, fade } from 'svelte/transition';
    import { mostrarExito } from '$lib/stores/toast';

    // Props
    export let abierto = false;

    const dispatch = createEventDispatcher();

    // Estado local
    let inputBusqueda: HTMLInputElement;
    let terminoBusqueda = '';
    let comandoSeleccionado = 0;
    let comandosRecientes: string[] = [];

    // Comandos disponibles
    const comandosDisponibles = [
        // Navegación
        { 
            id: 'nav_dashboard', 
            titulo: 'Ir al Dashboard', 
            descripcion: 'Panel principal con resumen', 
            categoria: 'navegacion',
            ruta: '/panel',
            icono: '🏠',
            atajos: ['dashboard', 'inicio', 'home']
        },
        { 
            id: 'nav_proyectos', 
            titulo: 'Ir a Proyectos', 
            descripcion: 'Gestionar proyectos y tareas', 
            categoria: 'navegacion',
            ruta: '/panel/proyectos',
            icono: '📁',
            atajos: ['proyectos', 'projects', 'tareas']
        },
        { 
            id: 'nav_negocios', 
            titulo: 'Ir a Negocios', 
            descripcion: 'Administrar negocios', 
            categoria: 'navegacion',
            ruta: '/panel/negocios',
            icono: '🏢',
            atajos: ['negocios', 'business', 'empresas']
        },
        { 
            id: 'nav_finanzas', 
            titulo: 'Ir a Finanzas', 
            descripcion: 'Control financiero y movimientos', 
            categoria: 'navegacion',
            ruta: '/panel/finanzas',
            icono: '💰',
            atajos: ['finanzas', 'money', 'dinero', 'contabilidad']
        },
        { 
            id: 'nav_inventario', 
            titulo: 'Ir a Inventario', 
            descripcion: 'Gestión de productos y stock', 
            categoria: 'navegacion',
            ruta: '/panel/inventario',
            icono: '📦',
            atajos: ['inventario', 'productos', 'stock']
        },
        { 
            id: 'nav_clientes', 
            titulo: 'Ir a Clientes', 
            descripcion: 'Base de datos de clientes', 
            categoria: 'navegacion',
            ruta: '/panel/clientes',
            icono: '👥',
            atajos: ['clientes', 'customers', 'contactos']
        },
        { 
            id: 'nav_reportes', 
            titulo: 'Ir a Reportes', 
            descripcion: 'Análisis y estadísticas', 
            categoria: 'navegacion',
            ruta: '/panel/reportes',
            icono: '📊',
            atajos: ['reportes', 'reports', 'analytics', 'estadisticas']
        },
        
        // Acciones rápidas
        { 
            id: 'crear_proyecto', 
            titulo: 'Crear Nuevo Proyecto', 
            descripcion: 'Inicia un proyecto desde cero', 
            categoria: 'acciones',
            icono: '➕',
            accion: 'modal:crear-proyecto',
            atajos: ['nuevo proyecto', 'crear proyecto', 'new project']
        },
        { 
            id: 'crear_tarea', 
            titulo: 'Crear Nueva Tarea', 
            descripcion: 'Añadir tarea a un proyecto', 
            categoria: 'acciones',
            icono: '✅',
            accion: 'modal:crear-tarea',
            atajos: ['nueva tarea', 'crear tarea', 'new task']
        },
        { 
            id: 'registrar_movimiento', 
            titulo: 'Registrar Movimiento', 
            descripcion: 'Agregar ingreso o gasto', 
            categoria: 'acciones',
            icono: '💳',
            accion: 'modal:registrar-movimiento',
            atajos: ['movimiento', 'ingreso', 'gasto', 'transaccion']
        },
        { 
            id: 'agregar_cliente', 
            titulo: 'Agregar Cliente', 
            descripcion: 'Nuevo cliente al sistema', 
            categoria: 'acciones',
            icono: '👤',
            accion: 'modal:agregar-cliente',
            atajos: ['nuevo cliente', 'agregar cliente', 'add customer']
        },
        { 
            id: 'crear_producto', 
            titulo: 'Crear Producto', 
            descripcion: 'Añadir producto al inventario', 
            categoria: 'acciones',
            icono: '🏷️',
            accion: 'modal:crear-producto',
            atajos: ['nuevo producto', 'crear producto', 'add product']
        },
        
        // Configuración
        { 
            id: 'configuracion', 
            titulo: 'Configuración', 
            descripcion: 'Ajustes de la aplicación', 
            categoria: 'configuracion',
            ruta: '/panel/configuracion',
            icono: '⚙️',
            atajos: ['configuracion', 'settings', 'ajustes']
        },
        { 
            id: 'tema_oscuro', 
            titulo: 'Cambiar a Tema Oscuro', 
            descripcion: 'Alternar modo oscuro/claro', 
            categoria: 'configuracion',
            icono: '🌙',
            accion: 'toggle-theme',
            atajos: ['tema oscuro', 'dark mode', 'dark theme']
        },
        { 
            id: 'exportar_datos', 
            titulo: 'Exportar Datos', 
            descripcion: 'Descargar información en CSV', 
            categoria: 'utilidades',
            icono: '📥',
            accion: 'exportar-datos',
            atajos: ['exportar', 'descargar', 'csv', 'backup']
        },
        
        // Búsquedas rápidas
        { 
            id: 'buscar_proyecto', 
            titulo: 'Buscar Proyecto', 
            descripcion: 'Encontrar proyecto específico', 
            categoria: 'busqueda',
            icono: '🔍',
            accion: 'buscar:proyecto',
            atajos: ['buscar proyecto', 'find project', 'search project']
        },
        { 
            id: 'buscar_cliente', 
            titulo: 'Buscar Cliente', 
            descripcion: 'Localizar cliente por nombre o documento', 
            categoria: 'busqueda',
            icono: '🔍',
            accion: 'buscar:cliente',
            atajos: ['buscar cliente', 'find customer', 'search client']
        },
        { 
            id: 'buscar_producto', 
            titulo: 'Buscar Producto', 
            descripcion: 'Encontrar producto en inventario', 
            categoria: 'busqueda',
            icono: '🔍',
            accion: 'buscar:producto',
            atajos: ['buscar producto', 'find product', 'search item']
        }
    ];

    // Comandos filtrados
    $: comandosFiltrados = comandosDisponibles.filter(comando => {
        if (!terminoBusqueda) return true;
        
        const termino = terminoBusqueda.toLowerCase();
        return (
            comando.titulo.toLowerCase().includes(termino) ||
            comando.descripcion.toLowerCase().includes(termino) ||
            comando.categoria.toLowerCase().includes(termino) ||
            comando.atajos.some(atajo => atajo.toLowerCase().includes(termino))
        );
    });

    // Comandos por categoría
    $: comandosPorCategoria = comandosFiltrados.reduce((acc, comando) => {
        if (!acc[comando.categoria]) {
            acc[comando.categoria] = [];
        }
        acc[comando.categoria].push(comando);
        return acc;
    }, {} as Record<string, typeof comandosDisponibles>);

    // Configuración de categorías
    const configCategorias = {
        navegacion: { nombre: 'Navegación', icono: '🧭', color: 'text-blue-600' },
        acciones: { nombre: 'Acciones Rápidas', icono: '⚡', color: 'text-green-600' },
        busqueda: { nombre: 'Búsquedas', icono: '🔍', color: 'text-purple-600' },
        configuracion: { nombre: 'Configuración', icono: '⚙️', color: 'text-gray-600' },
        utilidades: { nombre: 'Utilidades', icono: '🛠️', color: 'text-orange-600' }
    };

    // Manejar navegación con teclado
    const manejarTeclado = (event: KeyboardEvent) => {
        if (!abierto) return;

        switch (event.key) {
            case 'Escape':
                cerrarComandos();
                break;
            case 'ArrowDown':
                event.preventDefault();
                comandoSeleccionado = Math.min(comandoSeleccionado + 1, comandosFiltrados.length - 1);
                break;
            case 'ArrowUp':
                event.preventDefault();
                comandoSeleccionado = Math.max(comandoSeleccionado - 1, 0);
                break;
            case 'Enter':
                event.preventDefault();
                if (comandosFiltrados[comandoSeleccionado]) {
                    ejecutarComando(comandosFiltrados[comandoSeleccionado]);
                }
                break;
        }
    };

    // Ejecutar comando seleccionado
    const ejecutarComando = async (comando: typeof comandosDisponibles[0]) => {
        // Guardar en comandos recientes
        comandosRecientes = [comando.id, ...comandosRecientes.filter(id => id !== comando.id)].slice(0, 5);
        if (browser) {
            localStorage.setItem('comandos-recientes', JSON.stringify(comandosRecientes));
        }

        // Ejecutar según el tipo
        if (comando.ruta) {
            // Navegación
            await goto(comando.ruta);
            mostrarExito(`Navegando a ${comando.titulo}`);
        } else if (comando.accion) {
            // Acción específica
            await ejecutarAccion(comando.accion);
            mostrarExito(`Ejecutando: ${comando.titulo}`);
        }

        cerrarComandos();
        dispatch('comando-ejecutado', { comando });
    };

    // Ejecutar acciones específicas
    const ejecutarAccion = async (accion: string) => {
        const [tipo, subtipo] = accion.split(':');

        switch (tipo) {
            case 'modal':
                dispatch('abrir-modal', { tipo: subtipo });
                break;
            case 'toggle-theme':
                dispatch('toggle-theme');
                break;
            case 'exportar-datos':
                dispatch('exportar-datos');
                break;
            case 'buscar':
                dispatch('buscar', { tipo: subtipo });
                break;
        }
    };

    // Cerrar comandos
    const cerrarComandos = () => {
        abierto = false;
        terminoBusqueda = '';
        comandoSeleccionado = 0;
        dispatch('cerrar');
    };

    // Cargar comandos recientes al montar
    onMount(() => {
        if (browser) {
            const recientes = localStorage.getItem('comandos-recientes');
            if (recientes) {
                comandosRecientes = JSON.parse(recientes);
            }
        }
    });

    // Enfocar input cuando se abre
    $: if (abierto && inputBusqueda) {
        setTimeout(() => inputBusqueda?.focus(), 100);
    }

    // Reset selección cuando cambia el filtro
    $: if (terminoBusqueda) {
        comandoSeleccionado = 0;
    }
</script>

<svelte:window on:keydown={manejarTeclado} />

{#if abierto}
    <!-- Backdrop -->
    <div 
        class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-20"
        on:click={cerrarComandos}
        transition:fade={{ duration: 200 }}
    >
        <!-- Panel de comandos -->
        <div 
            class="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-2xl mx-4 overflow-hidden"
            on:click|stopPropagation
            transition:fly={{ y: -20, duration: 300 }}
        >
            <!-- Header con búsqueda -->
            <div class="p-6 border-b border-gray-200 dark:border-gray-700">
                <div class="flex items-center space-x-3">
                    <div class="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                        <Command class="w-5 h-5 text-white" />
                    </div>
                    <div class="flex-1 relative">
                        <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            bind:this={inputBusqueda}
                            bind:value={terminoBusqueda}
                            placeholder="Buscar comandos o navegar..."
                            class="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-gray-100 placeholder-gray-500"
                        />
                    </div>
                    <div class="flex items-center space-x-2 text-xs text-gray-500">
                        <kbd class="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded border">↑↓</kbd>
                        <kbd class="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded border">Enter</kbd>
                        <kbd class="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded border">Esc</kbd>
                    </div>
                </div>
            </div>

            <!-- Lista de comandos -->
            <div class="max-h-96 overflow-y-auto">
                {#if !terminoBusqueda && comandosRecientes.length > 0}
                    <!-- Comandos recientes -->
                    <div class="p-4">
                        <div class="flex items-center space-x-2 mb-3">
                            <Clock class="w-4 h-4 text-gray-500" />
                            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Recientes</span>
                        </div>
                        <div class="space-y-1">
                            {#each comandosRecientes.slice(0, 3) as comandoId}
                                {@const comando = comandosDisponibles.find(c => c.id === comandoId)}
                                {#if comando}
                                    <button
                                        class="w-full flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg text-left group transition-colors"
                                        on:click={() => ejecutarComando(comando)}
                                    >
                                        <div class="flex items-center space-x-3">
                                            <span class="text-lg">{comando.icono}</span>
                                            <div>
                                                <div class="font-medium text-gray-900 dark:text-gray-100">{comando.titulo}</div>
                                                <div class="text-sm text-gray-500">{comando.descripcion}</div>
                                            </div>
                                        </div>
                                        <ArrowRight class="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
                                    </button>
                                {/if}
                            {/each}
                        </div>
                    </div>
                {/if}

                <!-- Comandos por categoría -->
                {#each Object.entries(comandosPorCategoria) as [categoria, comandos]}
                    {@const config = configCategorias[categoria]}
                    {#if comandos.length > 0}
                        <div class="p-4 {categoria !== Object.keys(comandosPorCategoria)[0] ? 'border-t border-gray-200 dark:border-gray-700' : ''}">
                            <div class="flex items-center space-x-2 mb-3">
                                <span class="text-lg">{config.icono}</span>
                                <span class="text-sm font-medium {config.color}">{config.nombre}</span>
                            </div>
                            <div class="space-y-1">
                                {#each comandos as comando, index}
                                    {@const indexGlobal = comandosFiltrados.indexOf(comando)}
                                    <button
                                        class="w-full flex items-center justify-between p-3 rounded-lg text-left group transition-all duration-200 {
                                            indexGlobal === comandoSeleccionado 
                                                ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-700' 
                                                : 'hover:bg-gray-50 dark:hover:bg-gray-800 border-2 border-transparent'
                                        }"
                                        on:click={() => ejecutarComando(comando)}
                                        on:mouseenter={() => comandoSeleccionado = indexGlobal}
                                    >
                                        <div class="flex items-center space-x-3">
                                            <span class="text-lg">{comando.icono}</span>
                                            <div>
                                                <div class="font-medium text-gray-900 dark:text-gray-100">{comando.titulo}</div>
                                                <div class="text-sm text-gray-500">{comando.descripcion}</div>
                                            </div>
                                        </div>
                                        <div class="flex items-center space-x-2">
                                            {#if comandosRecientes.includes(comando.id)}
                                                <Star class="w-4 h-4 text-yellow-500" />
                                            {/if}
                                            <ArrowRight class="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 {
                                                indexGlobal === comandoSeleccionado ? 'text-blue-500' : ''
                                            }" />
                                        </div>
                                    </button>
                                {/each}
                            </div>
                        </div>
                    {/if}
                {/each}

                {#if comandosFiltrados.length === 0}
                    <!-- No hay resultados -->
                    <div class="p-8 text-center">
                        <div class="text-4xl mb-4">🔍</div>
                        <h3 class="font-medium text-gray-900 dark:text-gray-100 mb-2">No se encontraron comandos</h3>
                        <p class="text-sm text-gray-500">Intenta con diferentes términos de búsqueda</p>
                    </div>
                {/if}
            </div>

            <!-- Footer con ayuda -->
            <div class="p-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                <div class="flex items-center justify-between text-xs text-gray-500">
                    <div class="flex items-center space-x-4">
                        <span>💡 Tip: Usa Ctrl+K para abrir comandos rápidos</span>
                    </div>
                    <div class="flex items-center space-x-2">
                        <Zap class="w-3 h-3" />
                        <span>{comandosFiltrados.length} comandos disponibles</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
{/if}

<style>
    kbd {
        font-family: inherit;
        font-size: inherit;
        line-height: inherit;
    }
</style> 