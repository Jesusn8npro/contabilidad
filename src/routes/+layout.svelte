<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import { 
		inicializarAuth, 
		autenticado, 
		cargandoAuth 
	} from '$lib/stores/auth';
	import { inicializarTemas, alternarModoOscuro } from '$lib/stores/temas';
	import Cargando from '$lib/componentes/ui/Cargando.svelte';
	import ToastContainer from '$lib/componentes/ui/ToastContainer.svelte';
	import ComandosRapidos from '$lib/componentes/ui/ComandosRapidos.svelte';

	// Rutas que no requieren autenticación
	const rutasPublicas = ['/', '/iniciar-sesion', '/registrarse'];
	
	// Estado del sistema de comandos
	let comandosAbiertos = false;

	// Inicializar aplicación al montar
	onMount(() => {
		// Inicializar servicios
		inicializarAuth();
		inicializarTemas();
		
		// Configurar atajo de teclado global para comandos
		if (browser) {
			const manejarAtajosTeclado = (event: KeyboardEvent) => {
				// Ctrl+K o Cmd+K para abrir comandos
				if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
					event.preventDefault();
					comandosAbiertos = true;
				}
			};
			
			window.addEventListener('keydown', manejarAtajosTeclado);
			
			// Limpiar listener al desmontar
			return () => {
				window.removeEventListener('keydown', manejarAtajosTeclado);
			};
		}
	});
	
	// Manejar eventos del sistema de comandos
	const manejarComandos = (event: CustomEvent) => {
		switch (event.type) {
			case 'toggle-theme':
				alternarModoOscuro();
				break;
			case 'abrir-modal':
				// Aquí podrías manejar la apertura de modales específicos
				console.log('Abrir modal:', event.detail.tipo);
				break;
			case 'exportar-datos':
				// Manejar exportación de datos
				console.log('Exportar datos');
				break;
			case 'buscar':
				// Manejar búsquedas específicas
				console.log('Buscar:', event.detail.tipo);
				break;
		}
	};

	// Reactivamente verificar autenticación y redirigir
	$: {
		if (!$cargandoAuth) {
			const rutaActual = $page.url.pathname;
			const esRutaPublica = rutasPublicas.includes(rutaActual);
			
			if (!$autenticado && !esRutaPublica) {
				// Usuario no autenticado en ruta protegida
				goto('/iniciar-sesion');
			} else if ($autenticado && (rutaActual === '/iniciar-sesion' || rutaActual === '/registrarse')) {
				// Usuario autenticado solo se redirige desde páginas de auth específicas
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

<!-- Sistema de comandos rápidos -->
<ComandosRapidos 
	bind:abierto={comandosAbiertos}
	on:toggle-theme={manejarComandos}
	on:abrir-modal={manejarComandos}
	on:exportar-datos={manejarComandos}
	on:buscar={manejarComandos}
/>

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