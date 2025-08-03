<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { navigating } from '$app/stores';
	import { user, perfilUsuario, manejarCerrarSesion } from '$lib/stores/auth';
	import { 
		Home, 
		FolderOpen, 
		Building2, 
		DollarSign, 
		FileText,
		Settings,
		LogOut,
		User,
		Bell,
		Search,
		ChevronDown,
		Menu,
		X
	} from 'lucide-svelte';
	import BotonTema from '$lib/componentes/ui/BotonTema.svelte';
	import NavegacionMovil from '$lib/componentes/ui/NavegacionMovil.svelte';

	// Props para forzar reinicio de componentes
	export let data;

	// Estado local
	let menuMovilAbierto = false;
	let perfilMenuAbierto = false;

	// Variables para sistema de navegación
	let mostrarLoader = false;
	let timer: NodeJS.Timeout;

	// Elementos del menú principal
	const elementosMenu = [
		{
			icono: Home,
			texto: 'Dashboard',
			href: '/panel',
			activo: false
		},
		{
			icono: FolderOpen,
			texto: 'Proyectos',
			href: '/panel/proyectos',
			activo: false
		},
		{
			icono: Building2,
			texto: 'Negocios',
			href: '/panel/negocios',
			activo: false
		},
		{
			icono: DollarSign,
			texto: 'Finanzas',
			href: '/panel/finanzas',
			activo: false
		},
		{
			icono: FileText,
			texto: 'Gastos Personales',
			href: '/panel/gastos-personales',
			activo: false
		},
		{
			icono: FileText,
			texto: 'Reportes',
			href: '/panel/reportes',
			activo: false
		},
		{
			icono: Settings,
			texto: 'Configuración',
			href: '/panel/configuracion',
			activo: false
		}
	];

	// Sistema de navegación - REACTIVO
	$: if ($navigating) {
		clearTimeout(timer);
		timer = setTimeout(() => {
			mostrarLoader = true;
		}, 300); // Solo si tarda más de 300ms
	} else {
		mostrarLoader = false;
		clearTimeout(timer);
	}

	// Verificar si una ruta está activa - REACTIVA
	$: esRutaActiva = (href: string, exactMatch: boolean = false) => {
		const rutaActual = $page.url.pathname;
		
		if (exactMatch) {
			return rutaActual === href;
		}
		
		// Mejorar para rutas anidadas
		if (href === '/panel/negocios') {
			return rutaActual.startsWith('/panel/negocios');
		}
		if (href === '/panel/proyectos') {
			return rutaActual.startsWith('/panel/proyectos');
		}
		if (href === '/panel/finanzas') {
			return rutaActual.startsWith('/panel/finanzas');
		}
		if (href === '/panel/gastos-personales') {
			return rutaActual.startsWith('/panel/gastos-personales');
		}
		if (href === '/panel/reportes') {
			return rutaActual.startsWith('/panel/reportes');
		}
		if (href === '/panel/configuracion') {
			return rutaActual.startsWith('/panel/configuracion');
		}
		
		return rutaActual.startsWith(href);
	};

	// Función mejorada de navegación
	const navegarA = async (href: string) => {
		try {
			await goto(href, { 
				replaceState: false,
				noScroll: false,
				keepFocus: false,
				invalidateAll: true  // Fuerza la recarga de todos los datos
			});
		} catch (error) {
			console.error('Error en navegación:', error);
		}
	};

	const cerrarMenus = () => {
		menuMovilAbierto = false;
		perfilMenuAbierto = false;
	};

	const manejarCerrarSesionClick = async () => {
		try {
			await manejarCerrarSesion();
			await goto('/iniciar-sesion');
		} catch (error) {
			console.error('Error al cerrar sesión:', error);
		}
	};

	// Cerrar menús al cambiar de ruta
	$: if ($page.url.pathname) {
		cerrarMenus();
	}

	onMount(() => {
		// Cleanup al desmontar
		return () => {
			clearTimeout(timer);
		};
	});
</script>

<!-- Sistema de loader para navegación -->
{#if mostrarLoader}
	<div class="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center">
		<div class="flex flex-col items-center space-y-4">
			<div class="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
			<span class="text-white font-medium text-lg">Cargando...</span>
		</div>
	</div>
{/if}

<!-- Layout principal del panel -->
<div class="min-h-screen bg-gray-50 dark:bg-gray-900">
	<!-- Menú lateral desktop -->
	<aside class="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:border-r lg:border-gray-200 dark:lg:border-gray-700 lg:bg-white dark:lg:bg-gray-800">
		<!-- Logo -->
		<div class="flex items-center h-16 flex-shrink-0 px-6 border-b border-gray-200 dark:border-gray-700">
			<div class="flex items-center space-x-3">
				<div class="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
					<Building2 class="w-5 h-5 text-white" />
				</div>
				<h1 class="text-lg font-bold text-gray-900 dark:text-white">Panel de Control</h1>
			</div>
		</div>

		<!-- Navegación principal -->
		<nav class="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
			{#each elementosMenu as elemento}
				<button
					on:click={() => navegarA(elemento.href)}
					class="w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 
						{esRutaActiva(elemento.href) 
							? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border-r-2 border-blue-600' 
							: 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
						}"
				>
					<svelte:component this={elemento.icono} class="w-5 h-5 mr-3 flex-shrink-0" />
					{elemento.texto}
				</button>
			{/each}
		</nav>

		<!-- Botón cerrar sesión -->
		<div class="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-700">
			<button
				on:click={manejarCerrarSesionClick}
				class="w-full flex items-center px-3 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
			>
				<LogOut class="w-5 h-5 mr-3" />
				Cerrar Sesión
			</button>
		</div>
	</aside>

	<!-- Contenido principal -->
	<div class="lg:pl-64">
		<!-- Header móvil -->
		<div class="lg:hidden">
			<div class="flex items-center justify-between h-16 px-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
				<!-- Botón menú móvil -->
				<button
					on:click={() => menuMovilAbierto = !menuMovilAbierto}
					class="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
				>
					<Menu class="w-6 h-6" />
				</button>

				<!-- Logo móvil -->
				<div class="flex items-center space-x-2">
					<div class="w-6 h-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded flex items-center justify-center">
						<Building2 class="w-4 h-4 text-white" />
					</div>
					<span class="font-semibold text-gray-900 dark:text-white">Panel</span>
				</div>

				<!-- Menú usuario móvil -->
				<div class="relative">
					<button
						on:click={() => perfilMenuAbierto = !perfilMenuAbierto}
						class="flex items-center space-x-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
					>
						<User class="w-6 h-6" />
					</button>

					{#if perfilMenuAbierto}
						<div class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
							<div class="py-1">
								<button
									on:click={manejarCerrarSesionClick}
									class="w-full flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
								>
									<LogOut class="w-4 h-4 mr-2" />
									Cerrar Sesión
								</button>
							</div>
						</div>
					{/if}
				</div>
			</div>
		</div>

		<!-- Menú lateral móvil -->
		{#if menuMovilAbierto}
			<!-- Backdrop -->
			<div 
				class="fixed inset-0 z-40 lg:hidden"
				on:click={cerrarMenus}
			>
				<div class="absolute inset-0 bg-gray-600 opacity-75"></div>
			</div>

			<!-- Panel lateral -->
			<div class="fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 lg:hidden">
				<!-- Header del menú móvil -->
				<div class="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700">
					<div class="flex items-center space-x-3">
						<div class="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
							<Building2 class="w-5 h-5 text-white" />
						</div>
						<h1 class="text-lg font-bold text-gray-900 dark:text-white">Panel</h1>
					</div>
					<button
						on:click={cerrarMenus}
						class="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
					>
						<X class="w-6 h-6" />
					</button>
				</div>

				<!-- Navegación móvil -->
				<nav class="px-4 py-6 space-y-2">
					{#each elementosMenu as elemento}
						<button
							on:click={() => navegarA(elemento.href)}
							class="w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200
								{esRutaActiva(elemento.href)
									? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
									: 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
								}"
						>
							<svelte:component this={elemento.icono} class="w-5 h-5 mr-3 flex-shrink-0" />
							{elemento.texto}
						</button>
					{/each}

					<!-- Cerrar sesión en móvil -->
					<div class="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
						<button
							on:click={manejarCerrarSesionClick}
							class="w-full flex items-center px-3 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
						>
							<LogOut class="w-5 h-5 mr-3" />
							Cerrar Sesión
						</button>
					</div>
				</nav>
			</div>
		{/if}

		<!-- Contenido de la página -->
		<main class="min-h-screen bg-gray-50 dark:bg-gray-900">
			<!-- Forzar reinicio de componentes con key -->
			{#key data?.key || $page.url.pathname}
				<slot />
			{/key}
		</main>
	</div>

	<!-- Navegación móvil inferior -->
	<NavegacionMovil />
</div> 