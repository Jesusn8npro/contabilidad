<script lang="ts">
	import { onMount } from 'svelte';
	import { goto, invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';
	import { navigating } from '$app/stores';
	import { user, perfilUsuario, manejarCerrarSesion } from '$lib/stores/auth';
	import { negocios, negocioActual } from '$lib/stores/negocios';
	import { movimientos } from '$lib/stores/movimientos';
	import { productos } from '$lib/stores/inventario';
	import { clientes } from '$lib/stores/clientes';
	import { browser } from '$app/environment';
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
		X,
		Users,
		Package,
		BarChart3,
		ShoppingCart,
		Crown,
		TrendingUp
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

	// Detector de navegación trabada
	let ultimaNavegacion = '';
	let tiempoUltimaNavegacion = 0;
	
	const detectarNavegacionTrabada = (href: string) => {
		const ahora = Date.now();
		
		// Si es la misma ruta en menos de 2 segundos, puede estar trabada
		if (ultimaNavegacion === href && (ahora - tiempoUltimaNavegacion) < 2000) {
			console.warn('⚠️ Posible navegación trabada detectada');
			return true;
		}
		
		ultimaNavegacion = href;
		tiempoUltimaNavegacion = ahora;
		return false;
	};

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
			texto: 'Finanzas Personales',
			href: '/panel/finanzas',
			activo: false
		},
		{
			icono: TrendingUp,
			texto: 'Finanzas Avanzadas',
			href: '/panel/finanzas-avanzadas',
			activo: false
		},
		{
			icono: Users,
			texto: 'Clientes',
			href: '/panel/clientes',
			activo: false
		},
		{
			icono: Package,
			texto: 'Inventario',
			href: '/panel/inventario',
			activo: false
		},
		{
			icono: FileText,
			texto: 'Tareas',
			href: '/panel/tareas',
			activo: false
		},
		{
			icono: BarChart3,
			texto: 'Marketing',
			href: '/panel/marketing',
			activo: false
		},
		{
			icono: FileText,
			texto: 'Reportes',
			href: '/panel/reportes',
			activo: false
		},
		{
			icono: Crown,
			texto: 'Membresías',
			href: '/panel/membresias',
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
		if (href === '/panel/finanzas-avanzadas') {
			return rutaActual.startsWith('/panel/finanzas-avanzadas');
		}
		if (href === '/panel/clientes') {
			return rutaActual.startsWith('/panel/clientes');
		}
		if (href === '/panel/inventario') {
			return rutaActual.startsWith('/panel/inventario');
		}
		if (href === '/panel/reportes') {
			return rutaActual.startsWith('/panel/reportes');
		}
		if (href === '/panel/membresias') {
			return rutaActual.startsWith('/panel/membresias');
		}
		if (href === '/panel/configuracion') {
			return rutaActual.startsWith('/panel/configuracion');
		}
		
		return rutaActual.startsWith(href);
	};

	// Función ULTRA ROBUSTA de navegación (nunca falla)
	const navegarA = async (href: string) => {
		console.log('🚀 Navegando a:', href);
		
		// Cerrar menús inmediatamente
		cerrarMenus();
		
		try {
			// Método 1: Intentar SvelteKit primero
			console.log('📍 Método 1: SvelteKit goto');
			await goto(href, { 
				invalidateAll: true,
				replaceState: false,
				noScroll: false
			});
			
			// Forzar actualización después de un momento
			setTimeout(async () => {
				try {
					await invalidateAll();
					console.log('✅ Navegación SvelteKit exitosa');
				} catch (error) {
					console.warn('⚠️ Error en invalidateAll:', error);
				}
			}, 100);
			
		} catch (error) {
			console.warn('⚠️ Método 1 falló, probando Método 2');
			
			try {
				// Método 2: Navegación directa del navegador
				console.log('📍 Método 2: window.location');
				window.location.href = href;
			} catch (error2) {
				console.error('❌ Ambos métodos fallaron');
				
				// Método 3: Última opción - reload completo
				console.log('📍 Método 3: reload + navigate');
				setTimeout(() => {
					window.location.href = href;
				}, 500);
			}
		}
	};

	// Función para limpiar cachés y stores
	const limpiarCaches = () => {
		console.log('🧹 Limpiando cachés...');
		
		// Limpiar stores principales
		try {
			negocioActual.set(null);
			movimientos.set([]);
			productos.set([]);
			clientes.set([]);
			console.log('✅ Stores limpiados');
		} catch (error) {
			console.warn('⚠️ Error limpiando stores:', error);
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
				<a
					href={elemento.href}
					class="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200
						{esRutaActiva(elemento.href) 
							? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400' 
							: 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'}"
					on:click={(e) => {
						e.preventDefault();
						navegarA(elemento.href);
					}}
				>
					<svelte:component this={elemento.icono} class="w-5 h-5 flex-shrink-0" />
					<span class="truncate">{elemento.texto}</span>
				</a>
			{/each}
		</nav>

		<!-- Botón de cambio de tema -->
		<div class="flex-shrink-0 px-4 pb-4">
			<BotonTema />
		</div>

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

				<!-- Botón de emergencia (solo visible en desarrollo) -->
				{#if browser && window.location.hostname === 'localhost'}
					<button
						on:click={() => {
							console.log('🚨 Forzando recarga completa');
							limpiarCaches();
							window.location.reload();
						}}
						class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
						title="Forzar Recarga (Solo Desarrollo)"
					>
						🔄
					</button>
				{/if}

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
								<!-- Botón de tema en móvil -->
								<div class="px-4 py-2">
									<BotonTema />
								</div>
								<hr class="border-gray-200 dark:border-gray-700" />
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

					<!-- Botón de tema en móvil -->
					<div class="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
						<div class="px-3 mb-4">
							<BotonTema />
						</div>
					</div>

					<!-- Cerrar sesión en móvil -->
					<div class="border-t border-gray-200 dark:border-gray-700 pt-4">
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