<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { Palette, Download, Upload, Eye, Save, Trash2, Crown, Sparkles } from 'lucide-svelte';
    import { 
        temasGuardados, 
        temaSeleccionado, 
        aplicarTema, 
        crearTemaPersonalizado,
        eliminarTemaPersonalizado,
        exportarTema,
        importarTema
    } from '$lib/stores/temas';
    import type { Tema } from '$lib/stores/temas';
    import { mostrarError, mostrarExito } from '$lib/stores/toast';
    import Boton from './Boton.svelte';
    import Modal from './Modal.svelte';

    export let abierto = false;

    const dispatch = createEventDispatcher();

    // Estado local
    let pestanaActiva: 'galeria' | 'editor' | 'importar' = 'galeria';
    let temaPreview: Tema | null = null;
    let mostrarModalEditor = false;
    let mostrarModalImportar = false;

    // Editor de tema personalizado
    let editorTema = {
        nombre: '',
        categoria: 'profesional' as Tema['categoría'],
        colores: {
            primary: '#3B82F6',
            secondary: '#6366F1',
            accent: '#8B5CF6',
            background: '#F8FAFC',
            surface: '#FFFFFF',
            text: '#1E293B',
            textSecondary: '#64748B',
            border: '#E2E8F0',
            success: '#10B981',
            warning: '#F59E0B',
            error: '#EF4444',
            info: '#3B82F6'
        }
    };

    // Categorías de temas
    const categorias = [
        { value: 'corporativo', label: 'Corporativo', icono: '🏢' },
        { value: 'creativo', label: 'Creativo', icono: '🎨' },
        { value: 'minimal', label: 'Minimal', icono: '⚫' },
        { value: 'gaming', label: 'Gaming', icono: '🎮' },
        { value: 'profesional', label: 'Profesional', icono: '💼' }
    ];

    // Agrupar temas por categoría
    $: temasPorCategoria = $temasGuardados.reduce((acc, tema) => {
        if (!acc[tema.categoría]) {
            acc[tema.categoría] = [];
        }
        acc[tema.categoría].push(tema);
        return acc;
    }, {} as Record<string, Tema[]>);

    // Previsualizar tema
    const previsualizarTema = (tema: Tema) => {
        temaPreview = tema;
        aplicarTema(tema);
    };

    // Seleccionar tema definitivamente
    const seleccionarTema = (tema: Tema) => {
        aplicarTema(tema);
        temaPreview = null;
        mostrarExito(`Tema "${tema.nombre}" aplicado`);
        cerrarPersonalizador();
    };

    // Abrir editor para nuevo tema
    const abrirEditorNuevo = () => {
        editorTema = {
            nombre: '',
            categoria: 'profesional',
            colores: {
                primary: '#3B82F6',
                secondary: '#6366F1',
                accent: '#8B5CF6',
                background: '#F8FAFC',
                surface: '#FFFFFF',
                text: '#1E293B',
                textSecondary: '#64748B',
                border: '#E2E8F0',
                success: '#10B981',
                warning: '#F59E0B',
                error: '#EF4444',
                info: '#3B82F6'
            }
        };
        mostrarModalEditor = true;
    };

    // Crear tema personalizado
    const crearTema = () => {
        if (!editorTema.nombre.trim()) {
            mostrarError('El nombre del tema es obligatorio');
            return;
        }

        const nuevoTema = crearTemaPersonalizado(
            editorTema.nombre.trim(),
            editorTema.colores,
            editorTema.categoria
        );

        if (nuevoTema) {
            mostrarModalEditor = false;
            mostrarExito(`Tema "${nuevoTema.nombre}" creado exitosamente`);
            // Aplicar el nuevo tema
            aplicarTema(nuevoTema);
        }
    };

    // Eliminar tema personalizado
    const eliminarTema = (tema: Tema) => {
        if (confirm(`¿Estás seguro de eliminar el tema "${tema.nombre}"?`)) {
            const eliminado = eliminarTemaPersonalizado(tema.id);
            if (eliminado) {
                mostrarExito(`Tema "${tema.nombre}" eliminado`);
            }
        }
    };

    // Exportar tema
    const exportarTemaJSON = (tema: Tema) => {
        const json = exportarTema(tema);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `tema-${tema.nombre.toLowerCase().replace(/\s+/g, '-')}.json`;
        link.click();
        URL.revokeObjectURL(url);
        mostrarExito(`Tema "${tema.nombre}" exportado`);
    };

    // Importar tema
    const manejarImportacion = (event: Event) => {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];
        
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const temaJSON = e.target?.result as string;
                const tema = importarTema(temaJSON);
                
                if (tema) {
                    mostrarExito(`Tema "${tema.nombre}" importado exitosamente`);
                    mostrarModalImportar = false;
                } else {
                    mostrarError('Error al importar el tema. Verifica el formato del archivo.');
                }
            } catch (error) {
                mostrarError('El archivo no tiene un formato válido');
            }
        };
        reader.readAsText(file);
    };

    // Generar colores automáticamente
    const generarColoresAutomaticos = () => {
        const primaryColor = editorTema.colores.primary;
        // Esta es una implementación básica
        // En producción usarías una librería como chroma.js
        editorTema.colores.secondary = primaryColor + 'CC';
        editorTema.colores.accent = primaryColor;
        editorTema.colores.info = primaryColor;
    };

    // Cerrar personalizador
    const cerrarPersonalizador = () => {
        abierto = false;
        temaPreview = null;
        dispatch('cerrar');
    };

    // Obtener preview del tema
    const obtenerPreviewTema = (tema: Tema) => {
        return {
            background: `linear-gradient(135deg, ${tema.colores.primary}, ${tema.colores.secondary})`,
            accent: tema.colores.accent,
            surface: tema.colores.surface
        };
    };
</script>

{#if abierto}
    <!-- Backdrop -->
    <div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <!-- Panel principal -->
        <div class="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
            <!-- Header -->
            <div class="p-6 border-b border-gray-200 dark:border-gray-700">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <div class="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg">
                            <Palette class="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                Personalizar Temas
                            </h2>
                            <p class="text-gray-600 dark:text-gray-400">
                                Personaliza la apariencia de tu aplicación
                            </p>
                        </div>
                    </div>
                    
                    <button
                        on:click={cerrarPersonalizador}
                        class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        ✕
                    </button>
                </div>
                
                <!-- Pestañas -->
                <div class="flex space-x-1 mt-6 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                    <button
                        class="flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors {
                            pestanaActiva === 'galeria' 
                                ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm' 
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                        }"
                        on:click={() => pestanaActiva = 'galeria'}
                    >
                        🎨 Galería de Temas
                    </button>
                    <button
                        class="flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors {
                            pestanaActiva === 'editor' 
                                ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm' 
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                        }"
                        on:click={() => pestanaActiva = 'editor'}
                    >
                        ✨ Editor Personalizado
                    </button>
                    <button
                        class="flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors {
                            pestanaActiva === 'importar' 
                                ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm' 
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                        }"
                        on:click={() => pestanaActiva = 'importar'}
                    >
                        📥 Importar/Exportar
                    </button>
                </div>
            </div>

            <!-- Contenido -->
            <div class="flex-1 overflow-y-auto p-6">
                {#if pestanaActiva === 'galeria'}
                    <!-- Galería de temas -->
                    <div class="space-y-8">
                        {#each Object.entries(temasPorCategoria) as [categoria, temas]}
                            {@const categoriaInfo = categorias.find(c => c.value === categoria)}
                            <div>
                                <div class="flex items-center gap-2 mb-4">
                                    <span class="text-2xl">{categoriaInfo?.icono}</span>
                                    <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                        {categoriaInfo?.label}
                                    </h3>
                                    <span class="text-sm text-gray-500">({temas.length} temas)</span>
                                </div>
                                
                                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {#each temas as tema}
                                        {@const preview = obtenerPreviewTema(tema)}
                                        <div class="group relative border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 {
                                            $temaSeleccionado?.id === tema.id ? 'ring-2 ring-blue-500' : ''
                                        }">
                                            <!-- Preview del tema -->
                                            <div 
                                                class="h-24 relative"
                                                style="background: {preview.background}"
                                            >
                                                <div class="absolute inset-0 bg-black/20"></div>
                                                <div class="absolute top-2 left-2 flex items-center gap-1">
                                                    {#if tema.premium}
                                                        <span class="bg-yellow-500 text-white px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1">
                                                            <Crown class="w-3 h-3" />
                                                            Premium
                                                        </span>
                                                    {/if}
                                                    {#if tema.id.startsWith('custom-') || tema.id.startsWith('imported-')}
                                                        <span class="bg-purple-500 text-white px-2 py-1 rounded-md text-xs font-medium">
                                                            Personalizado
                                                        </span>
                                                    {/if}
                                                </div>
                                                
                                                <!-- Elementos de preview -->
                                                <div class="absolute bottom-2 left-2 right-2 flex gap-1">
                                                    <div class="h-2 bg-white/30 rounded flex-1"></div>
                                                    <div class="h-2 bg-white/50 rounded w-8"></div>
                                                </div>
                                            </div>
                                            
                                            <!-- Información del tema -->
                                            <div class="p-4 bg-white dark:bg-gray-800">
                                                <div class="flex items-center justify-between mb-2">
                                                    <h4 class="font-medium text-gray-900 dark:text-gray-100">
                                                        {tema.nombre}
                                                    </h4>
                                                    <span class="text-lg">{tema.preview}</span>
                                                </div>
                                                <p class="text-sm text-gray-500 mb-3">
                                                    {tema.descripcion}
                                                </p>
                                                
                                                <!-- Paleta de colores -->
                                                <div class="flex gap-1 mb-3">
                                                    <div class="w-4 h-4 rounded-full border border-gray-200" style="background-color: {tema.colores.primary}"></div>
                                                    <div class="w-4 h-4 rounded-full border border-gray-200" style="background-color: {tema.colores.secondary}"></div>
                                                    <div class="w-4 h-4 rounded-full border border-gray-200" style="background-color: {tema.colores.accent}"></div>
                                                    <div class="w-4 h-4 rounded-full border border-gray-200" style="background-color: {tema.colores.success}"></div>
                                                    <div class="w-4 h-4 rounded-full border border-gray-200" style="background-color: {tema.colores.warning}"></div>
                                                </div>
                                                
                                                <!-- Acciones -->
                                                <div class="flex gap-2">
                                                    <button
                                                        on:click={() => previsualizarTema(tema)}
                                                        class="flex-1 py-2 px-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1"
                                                    >
                                                        <Eye class="w-4 h-4" />
                                                        Vista previa
                                                    </button>
                                                    
                                                    <button
                                                        on:click={() => seleccionarTema(tema)}
                                                        class="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                                                    >
                                                        {$temaSeleccionado?.id === tema.id ? 'Aplicado' : 'Aplicar'}
                                                    </button>
                                                </div>
                                                
                                                <!-- Acciones adicionales para temas personalizados -->
                                                {#if tema.id.startsWith('custom-') || tema.id.startsWith('imported-')}
                                                    <div class="flex gap-2 mt-2">
                                                        <button
                                                            on:click={() => exportarTemaJSON(tema)}
                                                            class="flex-1 py-1 px-2 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors flex items-center justify-center gap-1"
                                                        >
                                                            <Download class="w-3 h-3" />
                                                            Exportar
                                                        </button>
                                                        <button
                                                            on:click={() => eliminarTema(tema)}
                                                            class="flex-1 py-1 px-2 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors flex items-center justify-center gap-1"
                                                        >
                                                            <Trash2 class="w-3 h-3" />
                                                            Eliminar
                                                        </button>
                                                    </div>
                                                {/if}
                                            </div>
                                        </div>
                                    {/each}
                                </div>
                            </div>
                        {/each}
                    </div>
                
                {:else if pestanaActiva === 'editor'}
                    <!-- Editor de temas -->
                    <div class="max-w-4xl mx-auto">
                        <div class="text-center mb-8">
                            <Sparkles class="w-12 h-12 text-purple-500 mx-auto mb-4" />
                            <h3 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                Crea tu tema personalizado
                            </h3>
                            <p class="text-gray-600 dark:text-gray-400">
                                Diseña un tema único para tu aplicación
                            </p>
                        </div>
                        
                        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <!-- Configuración -->
                            <div class="space-y-6">
                                <!-- Información básica -->
                                <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                                    <h4 class="font-medium text-gray-900 dark:text-gray-100 mb-3">
                                        Información Básica
                                    </h4>
                                    
                                    <div class="space-y-3">
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Nombre del tema
                                            </label>
                                            <input
                                                bind:value={editorTema.nombre}
                                                placeholder="Mi tema personalizado"
                                                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                            />
                                        </div>
                                        
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Categoría
                                            </label>
                                            <select
                                                bind:value={editorTema.categoria}
                                                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                            >
                                                {#each categorias as categoria}
                                                    <option value={categoria.value}>
                                                        {categoria.icono} {categoria.label}
                                                    </option>
                                                {/each}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Colores principales -->
                                <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                                    <div class="flex items-center justify-between mb-3">
                                        <h4 class="font-medium text-gray-900 dark:text-gray-100">
                                            Colores Principales
                                        </h4>
                                        <button
                                            on:click={generarColoresAutomaticos}
                                            class="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                                        >
                                            Auto-generar
                                        </button>
                                    </div>
                                    
                                    <div class="grid grid-cols-2 gap-3">
                                        <div>
                                            <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                Primario
                                            </label>
                                            <input
                                                type="color"
                                                bind:value={editorTema.colores.primary}
                                                class="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-lg"
                                            />
                                        </div>
                                        <div>
                                            <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                Secundario
                                            </label>
                                            <input
                                                type="color"
                                                bind:value={editorTema.colores.secondary}
                                                class="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-lg"
                                            />
                                        </div>
                                        <div>
                                            <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                Acento
                                            </label>
                                            <input
                                                type="color"
                                                bind:value={editorTema.colores.accent}
                                                class="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-lg"
                                            />
                                        </div>
                                        <div>
                                            <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                Éxito
                                            </label>
                                            <input
                                                type="color"
                                                bind:value={editorTema.colores.success}
                                                class="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-lg"
                                            />
                                        </div>
                                    </div>
                                </div>
                                
                                <Boton 
                                    on:click={crearTema}
                                    class="w-full flex items-center justify-center gap-2"
                                >
                                    <Save class="w-4 h-4" />
                                    Crear Tema Personalizado
                                </Boton>
                            </div>
                            
                            <!-- Preview -->
                            <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                                <h4 class="font-medium text-gray-900 dark:text-gray-100 mb-3">
                                    Vista Previa
                                </h4>
                                
                                <!-- Mockup del tema -->
                                <div class="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                                    <!-- Header mockup -->
                                    <div 
                                        class="h-12 flex items-center px-4"
                                        style="background: linear-gradient(135deg, {editorTema.colores.primary}, {editorTema.colores.secondary})"
                                    >
                                        <div class="w-6 h-6 bg-white/20 rounded"></div>
                                        <div class="flex-1 mx-4">
                                            <div class="h-2 bg-white/30 rounded w-1/3"></div>
                                        </div>
                                        <div class="w-4 h-4 bg-white/20 rounded"></div>
                                    </div>
                                    
                                    <!-- Content mockup -->
                                    <div class="p-4 bg-white dark:bg-gray-800">
                                        <div class="space-y-3">
                                            <div class="flex items-center gap-3">
                                                <div 
                                                    class="w-8 h-8 rounded-lg"
                                                    style="background-color: {editorTema.colores.accent}"
                                                ></div>
                                                <div class="flex-1">
                                                    <div class="h-3 bg-gray-200 dark:bg-gray-600 rounded w-2/3 mb-1"></div>
                                                    <div class="h-2 bg-gray-100 dark:bg-gray-700 rounded w-1/2"></div>
                                                </div>
                                            </div>
                                            
                                            <div class="grid grid-cols-3 gap-2">
                                                <div 
                                                    class="h-16 rounded-lg"
                                                    style="background-color: {editorTema.colores.success}20"
                                                ></div>
                                                <div 
                                                    class="h-16 rounded-lg"
                                                    style="background-color: {editorTema.colores.primary}20"
                                                ></div>
                                                <div 
                                                    class="h-16 rounded-lg"
                                                    style="background-color: {editorTema.colores.accent}20"
                                                ></div>
                                            </div>
                                            
                                            <div class="flex gap-2">
                                                <button 
                                                    class="px-3 py-1 text-sm text-white rounded"
                                                    style="background-color: {editorTema.colores.primary}"
                                                >
                                                    Botón Primario
                                                </button>
                                                <button 
                                                    class="px-3 py-1 text-sm border rounded"
                                                    style="border-color: {editorTema.colores.primary}; color: {editorTema.colores.primary}"
                                                >
                                                    Botón Secundario
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                
                {:else if pestanaActiva === 'importar'}
                    <!-- Importar/Exportar -->
                    <div class="max-w-2xl mx-auto text-center">
                        <Upload class="w-12 h-12 text-blue-500 mx-auto mb-4" />
                        <h3 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                            Importar Tema
                        </h3>
                        <p class="text-gray-600 dark:text-gray-400 mb-8">
                            Importa temas exportados desde otras instalaciones
                        </p>
                        
                        <div class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8">
                            <input
                                type="file"
                                accept=".json"
                                on:change={manejarImportacion}
                                class="hidden"
                                id="tema-import"
                            />
                            <label
                                for="tema-import"
                                class="cursor-pointer block"
                            >
                                <div class="text-gray-600 dark:text-gray-400 mb-4">
                                    <Upload class="w-8 h-8 mx-auto mb-2" />
                                    Selecciona un archivo .json de tema
                                </div>
                                <Boton>
                                    Seleccionar Archivo
                                </Boton>
                            </label>
                        </div>
                        
                        <div class="mt-8 text-left">
                            <h4 class="font-medium text-gray-900 dark:text-gray-100 mb-3">
                                💡 Consejos para importar temas
                            </h4>
                            <ul class="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                                <li>• Los archivos deben tener la extensión .json</li>
                                <li>• Solo importa temas de fuentes confiables</li>
                                <li>• Los temas importados se añaden a tu colección personal</li>
                                <li>• Puedes exportar cualquier tema desde la galería</li>
                            </ul>
                        </div>
                    </div>
                {/if}
            </div>
        </div>
    </div>
{/if} 