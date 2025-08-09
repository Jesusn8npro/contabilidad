<script lang="ts">
    import { Package, TrendingUp, Star } from 'lucide-svelte';
    
    // Datos simulados de productos top
    const topProductos = [
        {
            id: 1,
            nombre: 'Acordeón Profesional',
            categoria: 'Instrumentos',
            ventasUnidades: 45,
            ingresos: 8900000,
            tendencia: 'up',
            porcentaje: 12.5,
            stock: 8,
            imagen: '🪗'
        },
        {
            id: 2,
            nombre: 'Curso de Vallenato',
            categoria: 'Educación',
            ventasUnidades: 128,
            ingresos: 6400000,
            tendencia: 'up',
            porcentaje: 8.3,
            stock: 'Ilimitado',
            imagen: '🎵'
        },
        {
            id: 3,
            nombre: 'Reparación Acordeón',
            categoria: 'Servicios',
            ventasUnidades: 23,
            ingresos: 4600000,
            tendencia: 'up',
            porcentaje: 15.2,
            stock: 'Servicio',
            imagen: '🔧'
        },
        {
            id: 4,
            nombre: 'Accesorios Acordeón',
            categoria: 'Accesorios',
            ventasUnidades: 67,
            ingresos: 3350000,
            tendencia: 'down',
            porcentaje: -2.1,
            stock: 24,
            imagen: '🎛️'
        },
        {
            id: 5,
            nombre: 'Partituras Digitales',
            categoria: 'Digital',
            ventasUnidades: 89,
            ingresos: 2670000,
            tendencia: 'up',
            porcentaje: 25.8,
            stock: 'Digital',
            imagen: '📜'
        }
    ];
    
    function formatearMoneda(valor: number): string {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
            notation: 'compact'
        }).format(valor);
    }
</script>

<div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
    <div class="flex items-center justify-between mb-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Package class="w-5 h-5 text-blue-500" />
            Top Productos
        </h3>
        <span class="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-xs font-medium">
            Este Mes
        </span>
    </div>
    
    <div class="space-y-4">
        {#each topProductos as producto, index}
            <div class="flex items-center space-x-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <!-- Ranking -->
                <div class="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span class="text-white text-sm font-bold">#{index + 1}</span>
                </div>
                
                <!-- Emoji/Imagen -->
                <div class="text-2xl">
                    {producto.imagen}
                </div>
                
                <!-- Información del producto -->
                <div class="flex-1 min-w-0">
                    <div class="flex items-center space-x-2">
                        <h4 class="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {producto.nombre}
                        </h4>
                        {#if index < 3}
                            <Star class="w-3 h-3 text-yellow-500 fill-current" />
                        {/if}
                    </div>
                    <p class="text-xs text-gray-500 dark:text-gray-400">
                        {producto.categoria} • {producto.ventasUnidades} vendidos
                    </p>
                    <p class="text-xs text-gray-600 dark:text-gray-300 mt-1">
                        Stock: {producto.stock}
                    </p>
                </div>
                
                <!-- Métricas -->
                <div class="text-right">
                    <p class="text-sm font-semibold text-gray-900 dark:text-white">
                        {formatearMoneda(producto.ingresos)}
                    </p>
                    <div class="flex items-center justify-end space-x-1 mt-1">
                        {#if producto.tendencia === 'up'}
                            <TrendingUp class="w-3 h-3 text-green-500" />
                            <span class="text-xs text-green-600 dark:text-green-400">
                                +{producto.porcentaje}%
                            </span>
                        {:else}
                            <TrendingUp class="w-3 h-3 text-red-500 rotate-180" />
                            <span class="text-xs text-red-600 dark:text-red-400">
                                {producto.porcentaje}%
                            </span>
                        {/if}
                    </div>
                </div>
            </div>
        {/each}
    </div>
    
    <!-- Resumen -->
    <div class="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div class="grid grid-cols-3 gap-4 text-center">
            <div>
                <p class="text-lg font-bold text-gray-900 dark:text-white">352</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">Total Ventas</p>
            </div>
            <div>
                <p class="text-lg font-bold text-green-600">
                    {formatearMoneda(25920000)}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400">Ingresos Total</p>
            </div>
            <div>
                <p class="text-lg font-bold text-blue-600">4.8</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">Rating Promedio</p>
            </div>
        </div>
    </div>
</div> 