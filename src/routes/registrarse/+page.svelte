<script lang="ts">
	import { goto } from '$app/navigation';
	import { registrarse } from '$lib/stores/auth';
	import Boton from '$lib/componentes/ui/Boton.svelte';
	import Input from '$lib/componentes/ui/Input.svelte';
	import Tarjeta from '$lib/componentes/ui/Tarjeta.svelte';
	
	// Estado del formulario
	let formulario = {
		nombreCompleto: '',
		email: '',
		password: '',
		confirmarPassword: ''
	};
	
	let errores: Record<string, string> = {};
	let cargando = false;
	let registroExitoso = false;
	
	// Manejar envío del formulario
	const manejarEnvio = async (evento: Event) => {
		evento.preventDefault();
		
		// Validación básica
		errores = {};
		
		if (!formulario.nombreCompleto) {
			errores.nombreCompleto = 'El nombre completo es requerido';
		}
		
		if (!formulario.email) {
			errores.email = 'El email es requerido';
		}
		
		if (!formulario.password) {
			errores.password = 'La contraseña es requerida';
		} else if (formulario.password.length < 6) {
			errores.password = 'La contraseña debe tener al menos 6 caracteres';
		}
		
		if (!formulario.confirmarPassword) {
			errores.confirmarPassword = 'Confirma tu contraseña';
		} else if (formulario.password !== formulario.confirmarPassword) {
			errores.confirmarPassword = 'Las contraseñas no coinciden';
		}
		
		if (Object.keys(errores).length > 0) {
			return;
		}
		
		// Limpiar errores
		errores = {};
		cargando = true;
		
		try {
			const resultado = await registrarse(
				formulario.email, 
				formulario.password, 
				formulario.nombreCompleto
			);
			
			if (resultado) {
				registroExitoso = true;
				// Opcional: redireccionar después de un tiempo
				setTimeout(() => {
					goto('/iniciar-sesion');
				}, 3000);
			} else {
				errores.general = 'Error al registrar usuario. Inténtalo nuevamente.';
			}
		} catch (error) {
			console.error('Error en registro:', error);
			errores.general = 'Error inesperado al registrar usuario';
		} finally {
			cargando = false;
		}
	};
</script>

<svelte:head>
	<title>Registrarse - App Contabilidad</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
	<div class="max-w-md w-full space-y-8">
		<!-- Header -->
		<div class="text-center">
			<h1 class="text-3xl font-bold text-primary-600 mb-2">
				App Contabilidad
			</h1>
			<h2 class="text-2xl font-semibold text-gray-900 dark:text-gray-100">
				Crear Cuenta
			</h2>
			<p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
				Únete para gestionar tus proyectos y finanzas
			</p>
		</div>

		{#if registroExitoso}
			<!-- Mensaje de éxito -->
			<Tarjeta padding="lg">
				<div class="text-center">
					<div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
						<svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
						</svg>
					</div>
					<h3 class="text-lg font-semibold text-gray-900 mb-2">¡Registro Exitoso!</h3>
					<p class="text-gray-600 mb-4">
						Tu cuenta ha sido creada correctamente. Serás redirigido al login en unos segundos.
					</p>
					<Boton variante="primary" on:click={() => goto('/iniciar-sesion')}>
						Ir al Login
					</Boton>
				</div>
			</Tarjeta>
		{:else}
			<!-- Formulario -->
			<Tarjeta padding="lg">
				<form on:submit={manejarEnvio} class="space-y-6">
					<!-- Error general -->
					{#if errores.general}
						<div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
							{errores.general}
						</div>
					{/if}

					<!-- Nombre completo -->
					<Input
						etiqueta="Nombre Completo"
						tipo="text"
						bind:valor={formulario.nombreCompleto}
						placeholder="Tu nombre completo"
						obligatorio
						error={errores.nombreCompleto}
					/>

					<!-- Email -->
					<Input
						etiqueta="Email"
						tipo="email"
						bind:valor={formulario.email}
						placeholder="tu@email.com"
						obligatorio
						error={errores.email}
					/>

					<!-- Contraseña -->
					<Input
						etiqueta="Contraseña"
						tipo="password"
						bind:valor={formulario.password}
						placeholder="Mínimo 6 caracteres"
						obligatorio
						error={errores.password}
					/>

					<!-- Confirmar contraseña -->
					<Input
						etiqueta="Confirmar Contraseña"
						tipo="password"
						bind:valor={formulario.confirmarPassword}
						placeholder="Repite tu contraseña"
						obligatorio
						error={errores.confirmarPassword}
					/>

					<!-- Botón de envío -->
					<Boton
						tipo="submit"
						variante="primary"
						tamaño="lg"
						class="w-full"
						disabled={cargando}
					>
						{cargando ? 'Creando cuenta...' : 'Crear Cuenta'}
					</Boton>

					<!-- Enlaces -->
					<div class="text-center space-y-2">
						<p class="text-sm text-gray-600 dark:text-gray-400">
							¿Ya tienes cuenta?
							<a href="/iniciar-sesion" class="font-medium text-primary-600 hover:text-primary-500">
								Inicia sesión aquí
							</a>
						</p>
					</div>
				</form>
			</Tarjeta>
		{/if}
	</div>
</div>

<style>
	/* Estilos específicos para la página de registro */
	:global(body) {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		min-height: 100vh;
	}
</style> 