<script lang="ts">
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    
    onMount(() => {
        // Redirigir automáticamente a finanzas personales
        goto('/panel/finanzas', { replaceState: true });
    });
</script>

<svelte:head>
    <title>Redirigiendo... - App Contabilidad</title>
</svelte:head>

<div class="flex items-center justify-center min-h-screen">
    <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Redirigiendo a Finanzas Personales...
        </h2>
        <p class="text-gray-600 dark:text-gray-400">
            Esta página se ha movido a una ubicación más clara
        </p>
    </div>
</div> 