<script lang="ts">
	import { goto } from '$app/navigation';
	import { iniciarSesion } from '$lib/stores/auth';
	import Boton from '$lib/componentes/ui/Boton.svelte';
	import Input from '$lib/componentes/ui/Input.svelte';
	import Tarjeta from '$lib/componentes/ui/Tarjeta.svelte';
	
	// Estado del formulario
	let formulario = {
		email: '',
		password: ''
	};
	
	let errores: Record<string, string> = {};
	let cargando = false;
	
	// Manejar envío del formulario
	const manejarEnvio = async (evento: Event) => {
		evento.preventDefault();
		
		// Validación básica
		errores = {};
		
		if (!formulario.email) {
			errores.email = 'El email es requerido';
		}
		
		if (!formulario.password) {
			errores.password = 'La contraseña es requerida';
		}
		
		if (Object.keys(errores).length > 0) {
			return;
		}
		
		// Limpiar errores
		errores = {};
		cargando = true;
		
		try {
			const resultado = await iniciarSesion(formulario.email, formulario.password);
			
			if (resultado) {
				// Redireccionar al dashboard
				goto('/panel');
			} else {
				errores.general = 'Error al iniciar sesión. Verifica tus credenciales.';
			}
		} catch (error) {
			console.error('Error en login:', error);
			errores.general = 'Error inesperado al iniciar sesión';
		} finally {
			cargando = false;
		}
	};
</script>

<svelte:head>
	<title>Iniciar Sesión - App Contabilidad</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
	<div class="max-w-md w-full space-y-8">
		<!-- Header -->
		<div class="text-center">
			<h1 class="text-3xl font-bold text-primary-600 mb-2">
				App Contabilidad
			</h1>
			<h2 class="text-2xl font-semibold text-gray-900 dark:text-gray-100">
				Iniciar Sesión
			</h2>
			<p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
				Accede a tu cuenta para gestionar tus proyectos y finanzas
			</p>
		</div>

		<!-- Formulario -->
		<Tarjeta padding="lg">
			<form on:submit={manejarEnvio} class="space-y-6">
				<!-- Error general -->
				{#if errores.general}
					<div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
						{errores.general}
					</div>
				{/if}

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
					placeholder="Tu contraseña"
					obligatorio
					error={errores.password}
				/>

				<!-- Botón de envío -->
				<Boton
					tipo="submit"
					variante="primary"
					tamaño="lg"
					class="w-full"
					disabled={cargando}
				>
					{cargando ? 'Iniciando sesión...' : 'Iniciar Sesión'}
				</Boton>

				<!-- Enlaces -->
				<div class="text-center space-y-2">
					<p class="text-sm text-gray-600 dark:text-gray-400">
						¿No tienes cuenta?
						<a href="/registrarse" class="font-medium text-primary-600 hover:text-primary-500">
							Regístrate aquí
						</a>
					</p>
				</div>
			</form>
		</Tarjeta>
	</div>
</div>

<style>
	/* Estilos específicos para la página de login */
	:global(body) {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		min-height: 100vh;
	}
</style> 