<script lang="ts">
    import { page } from '$app/stores';
    import { 
        Home, 
        FolderOpen, 
        Building2, 
        DollarSign, 
        BarChart3 
    } from 'lucide-svelte';

    // Elementos del menú móvil
    const elementosMenu = [
        {
            href: '/panel',
            label: 'Inicio',
            icon: Home,
            exactMatch: true
        },
        {
            href: '/panel/proyectos',
            label: 'Proyectos',
            icon: FolderOpen,
            exactMatch: false
        },
        {
            href: '/panel/negocios',
            label: 'Negocios',
            icon: Building2,
            exactMatch: false
        },
        {
            href: '/panel/finanzas',
            label: 'Finanzas',
            icon: DollarSign,
            exactMatch: false
        },
        {
            href: '/panel/reportes',
            label: 'Reportes',
            icon: BarChart3,
            exactMatch: false
        }
    ];

    // Verificar si una ruta está activa
    const esRutaActiva = (href: string, exactMatch: boolean = false) => {
        if (exactMatch) {
            return $page.url.pathname === href;
        }
        return $page.url.pathname.startsWith(href);
    };
</script>

<!-- Navegación móvil - Solo visible en pantallas pequeñas -->
<nav class="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 md:hidden z-50">
    <div class="flex items-center justify-around px-2 py-1">
        {#each elementosMenu as item}
            <a
                href={item.href}
                class="flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-all duration-200 {esRutaActiva(item.href, item.exactMatch) 
                    ? 'bg-primary-50 dark:bg-primary-900 text-primary-600 dark:text-primary-400' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                }"
            >
                <svelte:component 
                    this={item.icon} 
                    class="w-5 h-5 mb-1" 
                />
                <span class="text-xs font-medium leading-none">
                    {item.label}
                </span>
            </a>
        {/each}
    </div>
</nav>

<!-- Espaciador para evitar que el contenido se superponga -->
<div class="h-16 md:hidden"></div>

<style>
    /* Asegurar que la navegación esté siempre visible */
    nav {
        -webkit-backdrop-filter: blur(20px);
        backdrop-filter: blur(20px);
        background-color: rgba(255, 255, 255, 0.95);
    }
    
    :global(.dark) nav {
        background-color: rgba(17, 24, 39, 0.95);
    }
</style> 