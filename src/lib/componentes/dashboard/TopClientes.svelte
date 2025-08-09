<script lang="ts">
    import { Users, Crown, DollarSign, Calendar } from 'lucide-svelte';
    
    // Datos simulados de clientes top
    const topClientes = [
        {
            id: 1,
            nombre: 'Carlos Vives Academy',
            email: 'contacto@carlosvives.com',
            tipo: 'VIP',
            totalCompras: 15890000,
            ultimaCompra: '2024-01-15',
            numeroCompras: 24,
            promedio: 662000,
            estado: 'Activo',
            avatar: '🎭'
        },
        {
            id: 2,
            nombre: 'Conservatorio Musical',
            email: 'admin@conservatorio.edu',
            tipo: 'Premium',
            totalCompras: 12450000,
            ultimaCompra: '2024-01-12',
            numeroCompras: 18,
            promedio: 691000,
            estado: 'Activo',
            avatar: '🏫'
        },
        {
            id: 3,
            nombre: 'Grupo Los Diablitos',
            email: 'manager@losdiablitos.com',
            tipo: 'Premium',
            totalCompras: 8930000,
            ultimaCompra: '2024-01-10',
            numeroCompras: 15,
            promedio: 595000,
            estado: 'Activo',
            avatar: '🎪'
        },
        {
            id: 4,
            nombre: 'Pedro Martínez',
            email: 'pedro.martinez@email.com',
            tipo: 'Regular',
            totalCompras: 6720000,
            ultimaCompra: '2024-01-08',
            numeroCompras: 12,
            promedio: 560000,
            estado: 'Activo',
            avatar: '👨'
        },
        {
            id: 5,
            nombre: 'Academia Vallenata',
            email: 'info@academiavallenata.com',
            tipo: 'Regular',
            totalCompras: 5680000,
            ultimaCompra: '2024-01-05',
            numeroCompras: 9,
            promedio: 631000,
            estado: 'Inactivo',
            avatar: '🎓'
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
    
    function formatearFecha(fecha: string): string {
        return new Date(fecha).toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short'
        });
    }
    
    function obtenerColorTipo(tipo: string): string {
        switch (tipo) {
            case 'VIP': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
            case 'Premium': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
        }
    }
</script>

<div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
    <div class="flex items-center justify-between mb-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Users class="w-5 h-5 text-purple-500" />
            Top Clientes
        </h3>
        <span class="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full text-xs font-medium">
            Este Mes
        </span>
    </div>
    
    <div class="space-y-4">
        {#each topClientes as cliente, index}
            <div class="flex items-center space-x-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <!-- Ranking -->
                <div class="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                    <span class="text-white text-sm font-bold">#{index + 1}</span>
                </div>
                
                <!-- Avatar/Emoji -->
                <div class="text-2xl">
                    {cliente.avatar}
                </div>
                
                <!-- Información del cliente -->
                <div class="flex-1 min-w-0">
                    <div class="flex items-center space-x-2 mb-1">
                        <h4 class="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {cliente.nombre}
                        </h4>
                        {#if cliente.tipo === 'VIP'}
                            <Crown class="w-3 h-3 text-yellow-500 fill-current" />
                        {/if}
                        <span class="px-2 py-0.5 {obtenerColorTipo(cliente.tipo)} rounded-full text-xs font-medium">
                            {cliente.tipo}
                        </span>
                    </div>
                    <p class="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {cliente.email}
                    </p>
                    <div class="flex items-center space-x-4 mt-1">
                        <span class="text-xs text-gray-600 dark:text-gray-300">
                            {cliente.numeroCompras} compras
                        </span>
                        <span class="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                            <Calendar class="w-3 h-3 mr-1" />
                            {formatearFecha(cliente.ultimaCompra)}
                        </span>
                    </div>
                </div>
                
                <!-- Métricas -->
                <div class="text-right">
                    <p class="text-sm font-semibold text-gray-900 dark:text-white">
                        {formatearMoneda(cliente.totalCompras)}
                    </p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">
                        Promedio: {formatearMoneda(cliente.promedio)}
                    </p>
                    <div class="mt-1">
                        <span class="px-2 py-0.5 text-xs font-medium rounded-full {
                            cliente.estado === 'Activo' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                        }">
                            {cliente.estado}
                        </span>
                    </div>
                </div>
            </div>
        {/each}
    </div>
    
    <!-- Resumen -->
    <div class="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div class="grid grid-cols-3 gap-4 text-center">
            <div>
                <p class="text-lg font-bold text-gray-900 dark:text-white">78</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">Clientes Activos</p>
            </div>
            <div>
                <p class="text-lg font-bold text-purple-600">
                    {formatearMoneda(49670000)}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400">Ingresos Total</p>
            </div>
            <div>
                <p class="text-lg font-bold text-blue-600">
                    {formatearMoneda(637000)}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400">Ticket Promedio</p>
            </div>
        </div>
    </div>
</div> 