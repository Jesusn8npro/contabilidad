<script lang="ts">
    import { AlertTriangle, CheckCircle, Info, X } from 'lucide-svelte';
    import { createEventDispatcher } from 'svelte';
    
    export let alertasInteligentes: Array<{
        tipo: 'success' | 'warning' | 'error' | 'info';
        titulo: string;
        mensaje: string;
        accion?: string;
    }> = [];
    
    const dispatch = createEventDispatcher();
    
    function cerrarAlerta(index: number) {
        alertasInteligentes = alertasInteligentes.filter((_, i) => i !== index);
    }
    
    function ejecutarAccion(alerta: any) {
        dispatch('accion', alerta);
    }
    
    const estilos = {
        success: {
            bg: 'bg-emerald-50 dark:bg-emerald-900/20',
            border: 'border-emerald-200 dark:border-emerald-800',
            icono: 'text-emerald-600 dark:text-emerald-400',
            titulo: 'text-emerald-800 dark:text-emerald-200',
            mensaje: 'text-emerald-700 dark:text-emerald-300',
            boton: 'bg-emerald-600 hover:bg-emerald-700 text-white'
        },
        warning: {
            bg: 'bg-amber-50 dark:bg-amber-900/20',
            border: 'border-amber-200 dark:border-amber-800',
            icono: 'text-amber-600 dark:text-amber-400',
            titulo: 'text-amber-800 dark:text-amber-200',
            mensaje: 'text-amber-700 dark:text-amber-300',
            boton: 'bg-amber-600 hover:bg-amber-700 text-white'
        },
        error: {
            bg: 'bg-red-50 dark:bg-red-900/20',
            border: 'border-red-200 dark:border-red-800',
            icono: 'text-red-600 dark:text-red-400',
            titulo: 'text-red-800 dark:text-red-200',
            mensaje: 'text-red-700 dark:text-red-300',
            boton: 'bg-red-600 hover:bg-red-700 text-white'
        },
        info: {
            bg: 'bg-blue-50 dark:bg-blue-900/20',
            border: 'border-blue-200 dark:border-blue-800',
            icono: 'text-blue-600 dark:text-blue-400',
            titulo: 'text-blue-800 dark:text-blue-200',
            mensaje: 'text-blue-700 dark:text-blue-300',
            boton: 'bg-blue-600 hover:bg-blue-700 text-white'
        }
    };
    
    function obtenerIcono(tipo: string) {
        switch (tipo) {
            case 'success': return CheckCircle;
            case 'warning': return AlertTriangle;
            case 'error': return AlertTriangle;
            case 'info': return Info;
            default: return Info;
        }
    }
</script>

{#if alertasInteligentes.length > 0}
    <div class="space-y-4">
        <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <AlertTriangle class="w-5 h-5 text-amber-500" />
                Alertas Inteligentes
            </h2>
            <span class="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full text-xs font-medium">
                {alertasInteligentes.length} activas
            </span>
        </div>
        
        <div class="grid gap-4">
            {#each alertasInteligentes as alerta, index}
                {@const estilo = estilos[alerta.tipo]}
                {@const IconoComponente = obtenerIcono(alerta.tipo)}
                
                <div class="relative {estilo.bg} {estilo.border} border rounded-xl p-4 shadow-sm">
                    <div class="flex items-start space-x-3">
                        <!-- Icono -->
                        <div class="flex-shrink-0 mt-0.5">
                            <IconoComponente class="w-5 h-5 {estilo.icono}" />
                        </div>
                        
                        <!-- Contenido -->
                        <div class="flex-1 min-w-0">
                            <h3 class="text-sm font-medium {estilo.titulo}">
                                {alerta.titulo}
                            </h3>
                            <p class="mt-1 text-sm {estilo.mensaje}">
                                {alerta.mensaje}
                            </p>
                            
                            {#if alerta.accion}
                                <div class="mt-3">
                                    <button
                                        on:click={() => ejecutarAccion(alerta)}
                                        class="inline-flex items-center px-3 py-1.5 {estilo.boton} text-xs font-medium rounded-lg transition-colors duration-200"
                                    >
                                        {alerta.accion}
                                    </button>
                                </div>
                            {/if}
                        </div>
                        
                        <!-- Botón cerrar -->
                        <button
                            on:click={() => cerrarAlerta(index)}
                            class="flex-shrink-0 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400 transition-colors"
                        >
                            <X class="w-4 h-4" />
                        </button>
                    </div>
                </div>
            {/each}
        </div>
    </div>
{/if} 