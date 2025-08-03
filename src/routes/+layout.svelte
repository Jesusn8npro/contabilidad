<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { 
		inicializarAuth, 
		autenticado, 
		cargandoAuth 
	} from '$lib/stores/auth';
	import Cargando from '$lib/componentes/ui/Cargando.svelte';
	import ToastContainer from '$lib/componentes/ui/ToastContainer.svelte';

	// Rutas que no requieren autenticación
	const rutasPublicas = ['/iniciar-sesion', '/registrarse'];

	// Inicializar autenticación al montar el componente
	onMount(async () => {
		await inicializarAuth();
	});

	// Reactivamente verificar autenticación y redirigir
	$: {
		if (!$cargandoAuth) {
			const rutaActual = $page.url.pathname;
			const esRutaPublica = rutasPublicas.includes(rutaActual);
			
			if (!$autenticado && !esRutaPublica) {
				// Usuario no autenticado en ruta protegida
				goto('/iniciar-sesion');
			} else if ($autenticado && esRutaPublica) {
				// Usuario autenticado en ruta pública
				goto('/panel');
			}
		}
	}
</script>

<svelte:head>
	<title>App Contabilidad - Gestión de Proyectos y Finanzas</title>
</svelte:head>

<main class="min-h-screen bg-gray-50 dark:bg-gray-950">
	{#if $cargandoAuth}
		<!-- Pantalla de carga inicial -->
		<div class="min-h-screen flex items-center justify-center">
			<div class="text-center">
				<div class="mb-8">
					<h1 class="text-3xl font-bold text-primary-600 mb-2">
						App Contabilidad
					</h1>
					<p class="text-gray-600 dark:text-gray-400">
						Gestión de proyectos y finanzas
					</p>
				</div>
				<Cargando 
					texto="Iniciando aplicación..." 
					tamaño="lg"
				/>
			</div>
		</div>
	{:else}
		<!-- Contenido principal de la aplicación -->
		<slot />
	{/if}
</main>

<!-- Contenedor de notificaciones -->
<ToastContainer />

<style>
	/* Estilos globales adicionales */
	:global(html) {
		scroll-behavior: smooth;
	}
	
	:global(body) {
		font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
	}
	
	/* Clases de utilidad adicionales */
	:global(.espacio-y-2 > * + *) {
		margin-top: 0.5rem;
	}
	
	:global(.espacio-y-4 > * + *) {
		margin-top: 1rem;
	}
	
	:global(.espacio-y-6 > * + *) {
		margin-top: 1.5rem;
	}
</style> 