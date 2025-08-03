<script lang="ts">
    import type { ComponentType } from 'svelte';
    import { TrendingUp, TrendingDown } from 'lucide-svelte';

    export let titulo: string;
    export let valor: string;
    export let icono: ComponentType;
    export let color: 'azul' | 'verde' | 'rojo' | 'naranja' | 'morado' | 'amarillo' = 'azul';
    export let tendencia: { porcentaje: number; direccion: 'up' | 'down' | 'same' } | undefined = undefined;

    // Mapeo de colores
    const colores = {
        azul: {
            fondo: 'bg-blue-50 dark:bg-blue-900/20',
            borde: 'border-blue-200 dark:border-blue-700/50',
            icono: 'bg-blue-500 text-white',
            texto: 'text-blue-600 dark:text-blue-400'
        },
        verde: {
            fondo: 'bg-green-50 dark:bg-green-900/20',
            borde: 'border-green-200 dark:border-green-700/50',
            icono: 'bg-green-500 text-white',
            texto: 'text-green-600 dark:text-green-400'
        },
        rojo: {
            fondo: 'bg-red-50 dark:bg-red-900/20',
            borde: 'border-red-200 dark:border-red-700/50',
            icono: 'bg-red-500 text-white',
            texto: 'text-red-600 dark:text-red-400'
        },
        naranja: {
            fondo: 'bg-orange-50 dark:bg-orange-900/20',
            borde: 'border-orange-200 dark:border-orange-700/50',
            icono: 'bg-orange-500 text-white',
            texto: 'text-orange-600 dark:text-orange-400'
        },
        morado: {
            fondo: 'bg-purple-50 dark:bg-purple-900/20',
            borde: 'border-purple-200 dark:border-purple-700/50',
            icono: 'bg-purple-500 text-white',
            texto: 'text-purple-600 dark:text-purple-400'
        },
        amarillo: {
            fondo: 'bg-yellow-50 dark:bg-yellow-900/20',
            borde: 'border-yellow-200 dark:border-yellow-700/50',
            icono: 'bg-yellow-500 text-white',
            texto: 'text-yellow-600 dark:text-yellow-400'
        }
    };

    $: colorScheme = colores[color];
</script>

<div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-300">
    <!-- Header con icono y título -->
    <div class="flex items-center justify-between mb-4">
        <div class="p-3 {colorScheme.icono} rounded-xl">
            <svelte:component this={icono} size={24} />
        </div>
        <span class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            {titulo}
        </span>
    </div>

    <!-- Valor principal -->
    <div class="mb-2">
        <div class="text-2xl font-bold text-gray-900 dark:text-white">
            {valor}
        </div>
    </div>

    <!-- Tendencia (opcional) -->
    {#if tendencia}
        <div class="flex items-center text-sm">
            {#if tendencia.direccion === 'up'}
                <TrendingUp size={16} class="text-green-500 mr-1" />
                <span class="text-green-600 dark:text-green-400">
                    +{tendencia.porcentaje.toFixed(1)}%
                </span>
            {:else if tendencia.direccion === 'down'}
                <TrendingDown size={16} class="text-red-500 mr-1" />
                <span class="text-red-600 dark:text-red-400">
                    -{tendencia.porcentaje.toFixed(1)}%
                </span>
            {:else}
                <span class="text-gray-500 dark:text-gray-400">
                    Sin cambios
                </span>
            {/if}
            <span class="text-gray-500 dark:text-gray-400 ml-1">
                vs periodo anterior
            </span>
        </div>
    {/if}
</div> 