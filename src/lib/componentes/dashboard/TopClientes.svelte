<script lang="ts">
    import { Users, Star, TrendingUp } from 'lucide-svelte';
    
    export let clientes: any[] = [];
    
    // Procesar datos reales de clientes
    $: topClientes = clientes.slice(0, 5);
</script>

<div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
    <div class="flex items-center justify-between mb-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <Users class="w-5 h-5 mr-2 text-blue-500" />
            Top Clientes
        </h3>
        <span class="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full text-sm font-medium">
            {clientes.length} total
        </span>
    </div>
    
    <div class="space-y-4">
        {#each topClientes as cliente, index}
            <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                <div class="flex items-center space-x-3">
                    <!-- Avatar con inicial -->
                    <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {cliente.nombre ? cliente.nombre.charAt(0).toUpperCase() : 'C'}
                    </div>
                    
                    <div>
                        <h4 class="font-medium text-gray-900 dark:text-white text-sm">
                            {cliente.nombre || 'Cliente sin nombre'}
                        </h4>
                        <p class="text-xs text-gray-500 dark:text-gray-400">
                            {cliente.email || 'Sin email'}
                        </p>
                    </div>
                </div>
                
                <div class="text-right">
                    <div class="text-sm font-semibold text-gray-900 dark:text-white">
                        #{index + 1}
                    </div>
                    {#if cliente.telefono}
                        <div class="text-xs text-gray-500 dark:text-gray-400">
                            {cliente.telefono}
                        </div>
                    {/if}
                </div>
            </div>
        {:else}
            <div class="text-center py-8">
                <Users class="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p class="text-gray-500 dark:text-gray-400 mb-2">No hay clientes registrados</p>
                <button class="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    Agregar el primer cliente →
                </button>
            </div>
        {/each}
    </div>
    
    <!-- Estadísticas de clientes -->
    {#if clientes.length > 0}
        <div class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div class="grid grid-cols-2 gap-4">
                <div class="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {clientes.length}
                    </div>
                    <div class="text-xs text-blue-600 dark:text-blue-400">
                        Total Clientes
                    </div>
                </div>
                <div class="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div class="text-2xl font-bold text-green-600 dark:text-green-400">
                        {clientes.filter(c => c.estado === 'activo').length || clientes.length}
                    </div>
                    <div class="text-xs text-green-600 dark:text-green-400">
                        Activos
                    </div>
                </div>
            </div>
        </div>
    {/if}
</div> 