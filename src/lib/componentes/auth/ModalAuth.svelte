<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { fade, slide } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { Mail, Lock, User, Eye, EyeOff, Loader2, CheckCircle } from 'lucide-svelte';
	import { supabase } from '$lib/supabase/cliente';
	import { goto } from '$app/navigation';
	
	// Props
	export let abierto = false;
	export let modoInicial: 'login' | 'registro' = 'login';
	
	// Estados
	let modo = modoInicial;
	let cargando = false;
	let mostrarPassword = false;
	let mostrarConfirmarPassword = false;
	let mensaje = '';
	let tipoMensaje: 'success' | 'error' | 'info' = 'info';
	
	// Formularios
	let formularioLogin = {
		email: '',
		password: ''
	};
	
	let formularioRegistro = {
		nombre: '',
		email: '',
		password: '',
		confirmarPassword: ''
	};
	
	const dispatch = createEventDispatcher();
	
	// Alternar entre login y registro
	const alternarModo = () => {
		modo = modo === 'login' ? 'registro' : 'login';
		mensaje = '';
		limpiarFormularios();
	};
	
	const limpiarFormularios = () => {
		formularioLogin = { email: '', password: '' };
		formularioRegistro = { nombre: '', email: '', password: '', confirmarPassword: '' };
		mostrarPassword = false;
		mostrarConfirmarPassword = false;
	};
	
	// Cerrar modal
	const cerrarModal = () => {
		abierto = false;
		limpiarFormularios();
		mensaje = '';
		dispatch('cerrar');
	};
	
	// Validaciones
	const validarEmail = (email: string) => {
		const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return regex.test(email);
	};
	
	const validarPassword = (password: string) => {
		return password.length >= 6;
	};
	
	// Iniciar sesión
	const handleLogin = async () => {
		if (!validarEmail(formularioLogin.email)) {
			mensaje = 'Por favor ingresa un email válido';
			tipoMensaje = 'error';
			return;
		}
		
		if (!validarPassword(formularioLogin.password)) {
			mensaje = 'La contraseña debe tener al menos 6 caracteres';
			tipoMensaje = 'error';
			return;
		}
		
		cargando = true;
		mensaje = '';
		
		try {
			const { data, error } = await supabase.auth.signInWithPassword({
				email: formularioLogin.email,
				password: formularioLogin.password
			});
			
			if (error) {
				if (error.message.includes('Invalid login credentials')) {
					mensaje = 'Email o contraseña incorrectos';
				} else {
					mensaje = 'Error al iniciar sesión. Inténtalo de nuevo.';
				}
				tipoMensaje = 'error';
			} else if (data.user) {
				mensaje = '¡Bienvenido de vuelta! Redirigiendo...';
				tipoMensaje = 'success';
				
				// Guardar que el usuario ya visitó
				localStorage.setItem('app_contabilidad_visited', 'true');
				
				setTimeout(() => {
					goto('/panel');
					cerrarModal();
				}, 1500);
			}
		} catch (error) {
			console.error('Error login:', error);
			mensaje = 'Error inesperado. Inténtalo de nuevo.';
			tipoMensaje = 'error';
		} finally {
			cargando = false;
		}
	};
	
	// Registrarse
	const handleRegistro = async () => {
		if (!formularioRegistro.nombre.trim()) {
			mensaje = 'El nombre es obligatorio';
			tipoMensaje = 'error';
			return;
		}
		
		if (!validarEmail(formularioRegistro.email)) {
			mensaje = 'Por favor ingresa un email válido';
			tipoMensaje = 'error';
			return;
		}
		
		if (!validarPassword(formularioRegistro.password)) {
			mensaje = 'La contraseña debe tener al menos 6 caracteres';
			tipoMensaje = 'error';
			return;
		}
		
		if (formularioRegistro.password !== formularioRegistro.confirmarPassword) {
			mensaje = 'Las contraseñas no coinciden';
			tipoMensaje = 'error';
			return;
		}
		
		cargando = true;
		mensaje = '';
		
		try {
			const { data, error } = await supabase.auth.signUp({
				email: formularioRegistro.email,
				password: formularioRegistro.password,
				options: {
					data: {
						nombre: formularioRegistro.nombre
					}
				}
			});
			
			if (error) {
				if (error.message.includes('already registered')) {
					mensaje = 'Este email ya está registrado. ¿Quieres iniciar sesión?';
					tipoMensaje = 'info';
				} else {
					mensaje = 'Error al crear la cuenta. Inténtalo de nuevo.';
					tipoMensaje = 'error';
				}
			} else if (data.user) {
				mensaje = '¡Cuenta creada exitosamente! Redirigiendo...';
				tipoMensaje = 'success';
				
				// Guardar que el usuario ya visitó
				localStorage.setItem('app_contabilidad_visited', 'true');
				
				setTimeout(() => {
					goto('/panel');
					cerrarModal();
				}, 1500);
			}
		} catch (error) {
			console.error('Error registro:', error);
			mensaje = 'Error inesperado. Inténtalo de nuevo.';
			tipoMensaje = 'error';
		} finally {
			cargando = false;
		}
	};
	
	// Manejar submit
	const handleSubmit = () => {
		if (modo === 'login') {
			handleLogin();
		} else {
			handleRegistro();
		}
	};
	
	// Actualizar modo cuando cambie el prop
	$: if (modoInicial) {
		modo = modoInicial;
	}
</script>

{#if abierto}
	<!-- Backdrop -->
	<div 
		class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
		transition:fade={{ duration: 300 }}
		on:click={cerrarModal}
		on:keydown={(e) => e.key === 'Escape' && cerrarModal()}
		role="dialog"
		aria-modal="true"
		tabindex="-1"
	>
		<!-- Modal Container -->
		<div 
			class="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-md mx-auto border border-gray-200/20 dark:border-gray-700/30 overflow-hidden"
			transition:slide={{ duration: 400, easing: quintOut }}
			on:click|stopPropagation
		>
			<!-- Header -->
			<div class="relative p-8 pb-6 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white">
				<!-- Close Button -->
				<button
					on:click={cerrarModal}
					class="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center group"
				>
					<svg class="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
				
				<!-- Logo y Título -->
				<div class="text-center">
					<div class="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
						<svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
							<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
						</svg>
					</div>
					<h1 class="text-2xl font-bold mb-2">App Contabilidad</h1>
					<p class="text-blue-100 text-sm">
						{modo === 'login' ? 'Bienvenido de vuelta' : '¡Únete gratis hoy!'}
					</p>
				</div>
			</div>
			
			<!-- Tabs -->
			<div class="flex bg-gray-50 dark:bg-gray-800/50">
				<button
					on:click={() => modo = 'login'}
					class="flex-1 py-4 px-6 text-sm font-semibold transition-all duration-300 {
						modo === 'login' 
							? 'text-blue-600 bg-white dark:bg-gray-900 shadow-sm border-b-2 border-blue-600' 
							: 'text-gray-600 dark:text-gray-400 hover:text-blue-600 hover:bg-white/50 dark:hover:bg-gray-700'
					}"
				>
					Iniciar Sesión
				</button>
				<button
					on:click={() => modo = 'registro'}
					class="flex-1 py-4 px-6 text-sm font-semibold transition-all duration-300 {
						modo === 'registro' 
							? 'text-blue-600 bg-white dark:bg-gray-900 shadow-sm border-b-2 border-blue-600' 
							: 'text-gray-600 dark:text-gray-400 hover:text-blue-600 hover:bg-white/50 dark:hover:bg-gray-700'
					}"
				>
					Registrarse
				</button>
			</div>
			
			<!-- Content -->
			<div class="p-8">
				{#if mensaje}
					<div 
						class="mb-6 p-4 rounded-xl border-l-4 {
							tipoMensaje === 'success' 
								? 'bg-green-50 dark:bg-green-900/20 border-green-500 text-green-700 dark:text-green-400' 
								: tipoMensaje === 'error'
								? 'bg-red-50 dark:bg-red-900/20 border-red-500 text-red-700 dark:text-red-400'
								: 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-700 dark:text-blue-400'
						}"
						transition:slide={{ duration: 300 }}
					>
						<div class="flex items-center space-x-2">
							{#if tipoMensaje === 'success'}
								<CheckCircle class="w-5 h-5" />
							{:else if tipoMensaje === 'error'}
								<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
									<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
								</svg>
							{:else}
								<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
									<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
								</svg>
							{/if}
							<span class="text-sm font-medium">{mensaje}</span>
						</div>
					</div>
				{/if}
				
				<form on:submit|preventDefault={handleSubmit} class="space-y-6">
					{#if modo === 'registro'}
						<!-- Nombre -->
						<div>
							<label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
								Nombre completo *
							</label>
							<div class="relative">
								<User class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
								<input
									type="text"
									bind:value={formularioRegistro.nombre}
									placeholder="Tu nombre completo"
									disabled={cargando}
									class="w-full pl-11 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 disabled:opacity-50"
									required
								/>
							</div>
						</div>
					{/if}
					
					<!-- Email -->
					<div>
						<label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
							Email *
						</label>
						<div class="relative">
							<Mail class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
							{#if modo === 'login'}
								<input
									type="email"
									bind:value={formularioLogin.email}
									placeholder="tu@email.com"
									disabled={cargando}
									class="w-full pl-11 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 disabled:opacity-50"
									required
								/>
							{:else}
								<input
									type="email"
									bind:value={formularioRegistro.email}
									placeholder="tu@email.com"
									disabled={cargando}
									class="w-full pl-11 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 disabled:opacity-50"
									required
								/>
							{/if}
						</div>
					</div>
					
					<!-- Contraseña -->
					<div>
						<label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
							Contraseña *
						</label>
						<div class="relative">
							<Lock class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
							{#if modo === 'login'}
								<input
									type="password"
									bind:value={formularioLogin.password}
									placeholder="••••••••"
									disabled={cargando}
									class="w-full pl-11 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 disabled:opacity-50"
									required
								/>
							{:else}
								<input
									type="password"
									bind:value={formularioRegistro.password}
									placeholder="••••••••"
									disabled={cargando}
									class="w-full pl-11 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 disabled:opacity-50"
									required
								/>
							{/if}
							<button
								type="button"
								on:click={() => mostrarPassword = !mostrarPassword}
								class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
							>
								{#if mostrarPassword}
									<EyeOff class="w-5 h-5" />
								{:else}
									<Eye class="w-5 h-5" />
								{/if}
							</button>
						</div>
					</div>
					
					{#if modo === 'registro'}
						<!-- Confirmar Contraseña -->
						<div>
							<label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
								Confirmar contraseña *
							</label>
							<div class="relative">
								<Lock class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
								<input
									type="password"
									bind:value={formularioRegistro.confirmarPassword}
									placeholder="••••••••"
									disabled={cargando}
									class="w-full pl-11 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 disabled:opacity-50"
									required
								/>
								<button
									type="button"
									on:click={() => mostrarConfirmarPassword = !mostrarConfirmarPassword}
									class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
								>
									{#if mostrarConfirmarPassword}
										<EyeOff class="w-5 h-5" />
									{:else}
										<Eye class="w-5 h-5" />
									{/if}
								</button>
							</div>
						</div>
					{/if}
					
					<!-- Submit Button -->
					<button
						type="submit"
						disabled={cargando}
						class="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
					>
						{#if cargando}
							<Loader2 class="w-5 h-5 animate-spin" />
							<span>Procesando...</span>
						{:else}
							<span>{modo === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta Gratis'}</span>
						{/if}
					</button>
				</form>
				
				<!-- Switch Mode -->
				<div class="mt-8 text-center">
					<p class="text-gray-600 dark:text-gray-400 text-sm">
						{modo === 'login' ? '¿No tienes una cuenta?' : '¿Ya tienes una cuenta?'}
						<button
							on:click={alternarModo}
							class="text-blue-600 hover:text-blue-700 font-semibold ml-1 transition-colors"
						>
							{modo === 'login' ? 'Regístrate gratis' : 'Inicia sesión'}
						</button>
					</p>
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	/* Animaciones personalizadas */
	@keyframes float {
		0%, 100% { transform: translateY(0px); }
		50% { transform: translateY(-10px); }
	}
	
	.float {
		animation: float 6s ease-in-out infinite;
	}
</style> 