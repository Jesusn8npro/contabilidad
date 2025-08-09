<script lang="ts">
    import { onMount } from 'svelte';
    import { ArrowUpRight, ArrowDownRight } from 'lucide-svelte';
    
    export let titulo: string;
    export let valor: string | number;
    export let subtitulo: string = '';
    export let cambio: string = '';
    export let tendencia: 'up' | 'down' | 'neutral' = 'neutral';
    export let icono: any;
    export let color: 'blue' | 'green' | 'red' | 'purple' | 'orange' = 'blue';
    
    let animacionCompleta = false;
    
    const colores = {
        blue: {
            bg: 'from-blue-500 to-blue-600',
            text: 'text-blue-600',
            icon: 'text-blue-500',
            bgLight: 'bg-blue-50 dark:bg-blue-900/20'
        },
        green: {
            bg: 'from-emerald-500 to-emerald-600',
            text: 'text-emerald-600',
            icon: 'text-emerald-500',
            bgLight: 'bg-emerald-50 dark:bg-emerald-900/20'
        },
        red: {
            bg: 'from-red-500 to-red-600',
            text: 'text-red-600',
            icon: 'text-red-500',
            bgLight: 'bg-red-50 dark:bg-red-900/20'
        },
        purple: {
            bg: 'from-purple-500 to-purple-600',
            text: 'text-purple-600',
            icon: 'text-purple-500',
            bgLight: 'bg-purple-50 dark:bg-purple-900/20'
        },
        orange: {
            bg: 'from-orange-500 to-orange-600',
            text: 'text-orange-600',
            icon: 'text-orange-500',
            bgLight: 'bg-orange-50 dark:bg-orange-900/20'
        }
    };
    
    onMount(() => {
        setTimeout(() => {
            animacionCompleta = true;
        }, 100);
    });
</script>

<div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all duration-300 group">
    <div class="flex items-center justify-between">
        <div class="flex-1">
            <!-- Título -->
            <h3 class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                {titulo}
            </h3>
            
            <!-- Valor principal -->
            <div class="text-2xl font-bold text-gray-900 dark:text-white mb-1 group-hover:scale-105 transition-transform duration-300">
                {valor}
            </div>
            
            <!-- Información adicional -->
            <div class="flex items-center space-x-2">
                {#if cambio}
                    <div class="flex items-center text-sm font-medium {
                        tendencia === 'up' ? 'text-emerald-600' :
                        tendencia === 'down' ? 'text-red-600' :
                        'text-gray-500'
                    }">
                        {#if tendencia === 'up'}
                            <ArrowUpRight class="w-4 h-4 mr-1" />
                        {:else if tendencia === 'down'}
                            <ArrowDownRight class="w-4 h-4 mr-1" />
                        {/if}
                        {cambio}
                    </div>
                {/if}
                
                {#if subtitulo}
                    <span class="text-sm text-gray-500 dark:text-gray-400">
                        {subtitulo}
                    </span>
                {/if}
            </div>
        </div>
        
        <!-- Icono -->
        <div class="flex-shrink-0">
            <div class="w-12 h-12 {colores[color].bgLight} rounded-xl flex items-center justify-center group-hover:scale-110 transition-all duration-300 {animacionCompleta ? 'animate-bounce-in' : ''}">
                <svelte:component this={icono} class="w-6 h-6 {colores[color].icon}" />
            </div>
        </div>
    </div>
    
    <!-- Barra de progreso decorativa -->
    <div class="mt-4 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1 overflow-hidden">
        <div 
            class="h-full bg-gradient-to-r {colores[color].bg} rounded-full transition-all duration-1000 ease-out"
            class:animate-pulse={animacionCompleta}
            style="width: {Math.min(Math.abs(typeof valor === 'number' ? valor : 0) / 100 * 50 + 50, 100)}%"
        ></div>
    </div>
</div>

<style>
    @keyframes bounce-in {
        0% { 
            transform: scale(0.3) rotate(-45deg); 
            opacity: 0; 
        }
        50% { 
            transform: scale(1.1) rotate(-10deg); 
            opacity: 0.8; 
        }
        100% { 
            transform: scale(1) rotate(0deg); 
            opacity: 1; 
        }
    }
    
    .animate-bounce-in {
        animation: bounce-in 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    }
</style> 