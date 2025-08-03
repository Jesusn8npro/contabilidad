<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
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

	// Estado local
	let menuMovilAbierto = false;
	let perfilMenuAbierto = false;

	// Elementos del menú principal
	const elementosMenu = [
		{
			href: '/panel',
			label: 'Dashboard',
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
			icon: FileText,
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

	// Cerrar sesión
	const cerrarSesion = async () => {
		try {
			await manejarCerrarSesion();
			goto('/iniciar-sesion');
		} catch (error) {
			console.error('Error al cerrar sesión:', error);
		}
	};

	// Cerrar menús al hacer click fuera
	const cerrarMenus = () => {
		menuMovilAbierto = false;
		perfilMenuAbierto = false;
	};

	onMount(() => {
		// Cerrar menús en cambio de ruta
		const unsubscribe = page.subscribe(() => {
			cerrarMenus();
		});

		return unsubscribe;
	});
</script>

<!-- Layout principal del panel -->
<div class="min-h-screen bg-gray-50 dark:bg-gray-900">
	<!-- Sidebar desktop -->
	<div class="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
		<!-- Sidebar content -->
		<div class="flex min-h-0 flex-1 flex-col bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-r border-gray-200/50 dark:border-gray-700/50">
			<!-- Logo y brand -->
			<div class="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
				<div class="flex flex-shrink-0 items-center px-6">
					<div class="flex items-center space-x-3">
						<div class="p-2 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl text-white">
							<Building2 class="w-6 h-6" />
						</div>
						<div>
							<h1 class="text-xl font-bold text-gray-900 dark:text-white">App Contabilidad</h1>
							<p class="text-xs text-gray-600 dark:text-gray-400">Panel de Control</p>
						</div>
					</div>
				</div>

				<!-- Navegación principal -->
				<nav class="mt-8 flex-1 space-y-2 px-4">
					{#each elementosMenu as elemento}
						<a
							href={elemento.href}
							class="group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 {
								esRutaActiva(elemento.href, elemento.exactMatch)
									? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25'
									: 'text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700/50'
							}"
						>
							<svelte:component 
								this={elemento.icon} 
								class="mr-3 h-5 w-5 flex-shrink-0 {
									esRutaActiva(elemento.href, elemento.exactMatch)
										? 'text-white'
										: 'text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-300'
								}" 
							/>
							{elemento.label}
							
							<!-- Indicador activo -->
							{#if esRutaActiva(elemento.href, elemento.exactMatch)}
								<div class="ml-auto w-2 h-2 bg-white rounded-full"></div>
							{/if}
						</a>
					{/each}
				</nav>

				<!-- Usuario y configuración -->
				<div class="flex-shrink-0 border-t border-gray-200/50 dark:border-gray-700/50 p-4">
					<!-- Toggle tema -->
					<div class="mb-4 flex items-center justify-between">
						<span class="text-sm text-gray-600 dark:text-gray-400">Tema</span>
						<BotonTema />
					</div>

					<!-- Información del usuario -->
					<div class="flex items-center space-x-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
						<div class="flex-shrink-0">
							<div class="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
								{#if $user?.email}
									{$user.email.charAt(0).toUpperCase()}
								{:else}
									<User class="w-4 h-4" />
								{/if}
							</div>
						</div>
						<div class="flex-1 min-w-0">
							<p class="text-sm font-medium text-gray-900 dark:text-white truncate">
								{$user?.email || 'Usuario'}
							</p>
							<p class="text-xs text-gray-500 dark:text-gray-400 truncate">
								{$user?.email || ''}
							</p>
						</div>
						<button
							on:click={cerrarSesion}
							class="flex-shrink-0 p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
							title="Cerrar sesión"
						>
							<LogOut class="w-4 h-4" />
						</button>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Header móvil -->
	<div class="lg:hidden">
		<div class="flex items-center justify-between bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50 px-4 py-3">
			<div class="flex items-center space-x-3">
				<button
					type="button"
					class="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
					on:click={() => menuMovilAbierto = !menuMovilAbierto}
				>
					{#if menuMovilAbierto}
						<X class="w-6 h-6" />
					{:else}
						<Menu class="w-6 h-6" />
					{/if}
				</button>
				<div class="flex items-center space-x-2">
					<div class="p-1.5 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg text-white">
						<Building2 class="w-5 h-5" />
					</div>
					<h1 class="text-lg font-bold text-gray-900 dark:text-white">App Contabilidad</h1>
				</div>
			</div>

			<div class="flex items-center space-x-3">
				<BotonTema />
				<button
					class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
					on:click={() => perfilMenuAbierto = !perfilMenuAbierto}
				>
					<User class="w-5 h-5" />
				</button>
			</div>
		</div>

		<!-- Menú móvil -->
		{#if menuMovilAbierto}
			<div class="lg:hidden">
				<div class="fixed inset-0 z-50 flex">
					<!-- Overlay -->
					<div class="fixed inset-0 bg-black/50 backdrop-blur-sm" on:click={cerrarMenus}></div>
					
					<!-- Panel del menú -->
					<div class="relative flex w-full max-w-xs flex-col bg-white dark:bg-gray-800 shadow-xl">
						<div class="flex h-16 items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700">
							<div class="flex items-center space-x-2">
								<div class="p-1.5 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg text-white">
									<Building2 class="w-5 h-5" />
								</div>
								<span class="text-lg font-bold text-gray-900 dark:text-white">App Contabilidad</span>
							</div>
							<button
								class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg"
								on:click={() => menuMovilAbierto = false}
							>
								<X class="w-5 h-5" />
							</button>
						</div>

						<nav class="flex-1 space-y-2 p-4">
							{#each elementosMenu as elemento}
								<a
									href={elemento.href}
									class="group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all {
										esRutaActiva(elemento.href, elemento.exactMatch)
											? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white'
											: 'text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
									}"
								>
									<svelte:component 
										this={elemento.icon} 
										class="mr-3 h-5 w-5 flex-shrink-0 {
											esRutaActiva(elemento.href, elemento.exactMatch)
												? 'text-white'
												: 'text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-300'
										}" 
									/>
									{elemento.label}
								</a>
							{/each}
						</nav>

						<!-- Usuario móvil -->
						<div class="border-t border-gray-200 dark:border-gray-700 p-4">
							<div class="flex items-center space-x-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700">
								<div class="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
									{#if $user?.email}
										{$user.email.charAt(0).toUpperCase()}
									{:else}
										<User class="w-4 h-4" />
									{/if}
								</div>
								<div class="flex-1 min-w-0">
									<p class="text-sm font-medium text-gray-900 dark:text-white truncate">
										{$user?.email || 'Usuario'}
									</p>
									<p class="text-xs text-gray-500 dark:text-gray-400 truncate">
										{$user?.email || ''}
									</p>
								</div>
								<button
									on:click={cerrarSesion}
									class="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
								>
									<LogOut class="w-4 h-4" />
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		{/if}
	</div>

	<!-- Contenido principal -->
	<div class="lg:pl-72">
		<main class="py-6 px-4 sm:px-6 lg:px-8 pb-20 md:pb-6">
			<slot />
		</main>
	</div>

	<!-- Navegación móvil inferior -->
	<NavegacionMovil />
</div> 