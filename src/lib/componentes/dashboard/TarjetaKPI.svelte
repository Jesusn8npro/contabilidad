<script lang="ts">
    import { onMount } from 'svelte';
    import { ArrowUpRight, ArrowDownRight } from 'lucide-svelte';
    
    export let titulo: string;
    export let valor: number;
    export let tipo: 'moneda' | 'numero' | 'porcentaje' = 'numero';
    export let tendencia: 'up' | 'down' | 'neutral' = 'neutral';
    export let porcentaje: number = 0;
    export let icono: any;
    export let color: 'blue' | 'green' | 'red' | 'purple' | 'orange' = 'blue';
    
    let valorAnimado = 0;
    let animacionCompleta = false;
    
    const colores = {
        blue: {
            bg: 'from-blue-500 to-blue-600',
            text: 'text-blue-600',
            icon: 'text-blue-500'
        },
        green: {
            bg: 'from-emerald-500 to-emerald-600',
            text: 'text-emerald-600',
            icon: 'text-emerald-500'
        },
        red: {
            bg: 'from-red-500 to-red-600',
            text: 'text-red-600',
            icon: 'text-red-500'
        },
        purple: {
            bg: 'from-purple-500 to-purple-600',
            text: 'text-purple-600',
            icon: 'text-purple-500'
        },
        orange: {
            bg: 'from-orange-500 to-orange-600',
            text: 'text-orange-600',
            icon: 'text-orange-500'
        }
    };
    
    function formatearValor(val: number): string {
        if (tipo === 'moneda') {
            return new Intl.NumberFormat('es-CO', {
                style: 'currency',
                currency: 'COP',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }).format(val);
        } else if (tipo === 'porcentaje') {
            return `${val.toFixed(1)}%`;
        } else {
            return new Intl.NumberFormat('es-CO').format(val);
        }
    }
    
    onMount(() => {
        // Animación del valor
        const duracion = 1500;
        const pasos = 60;
        const incremento = valor / pasos;
        let contador = 0;
        
        const intervalo = setInterval(() => {
            contador++;
            valorAnimado = incremento * contador;
            
            if (contador >= pasos) {
                valorAnimado = valor;
                animacionCompleta = true;
                clearInterval(intervalo);
            }
        }, duracion / pasos);
    });
</script>

<div class="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:scale-105">
    <!-- Gradiente de fondo sutil -->
    <div class="absolute inset-0 bg-gradient-to-br {colores[color].bg} opacity-5"></div>
    
    <!-- Patrón decorativo -->
    <div class="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br {colores[color].bg} opacity-10 rounded-full blur-xl"></div>
    
    <div class="relative z-10">
        <!-- Header con icono -->
        <div class="flex items-center justify-between mb-4">
            <div class="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <svelte:component this={icono} class="w-6 h-6 {colores[color].icon}" />
            </div>
            
            {#if tendencia !== 'neutral'}
                <div class="flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium {
                    tendencia === 'up' 
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' 
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                }">
                    {#if tendencia === 'up'}
                        <ArrowUpRight class="w-3 h-3" />
                    {:else}
                        <ArrowDownRight class="w-3 h-3" />
                    {/if}
                    <span>{Math.abs(porcentaje).toFixed(1)}%</span>
                </div>
            {/if}
        </div>
        
        <!-- Título -->
        <h3 class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
            {titulo}
        </h3>
        
        <!-- Valor principal -->
        <div class="mb-3">
            <span class="text-2xl font-bold text-gray-900 dark:text-white">
                {formatearValor(valorAnimado)}
            </span>
        </div>
        
        <!-- Tendencia descriptiva -->
        {#if tendencia !== 'neutral' && animacionCompleta}
            <p class="text-xs text-gray-500 dark:text-gray-400">
                {#if tendencia === 'up'}
                    ↗ Incremento del {porcentaje.toFixed(1)}%
                {:else}
                    ↘ Disminución del {porcentaje.toFixed(1)}%
                {/if}
                <span class="text-gray-400">vs período anterior</span>
            </p>
        {/if}
    </div>
    
    <!-- Barra de progreso sutil en la parte inferior -->
    <div class="absolute bottom-0 left-0 right-0 h-1 bg-gray-100 dark:bg-gray-700">
        <div 
            class="h-full bg-gradient-to-r {colores[color].bg} transition-all duration-1000 ease-out"
            style="width: {animacionCompleta ? '100' : '0'}%"
        ></div>
    </div>
</div> 