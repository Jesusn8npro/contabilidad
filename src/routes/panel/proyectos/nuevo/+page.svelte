<script lang="ts">
	import { goto } from '$app/navigation';
	import { crearProyecto } from '$lib/stores/proyectos';
	import type { Proyecto } from '$lib/tipos/app';
	import FormularioProyecto from '$lib/componentes/proyectos/FormularioProyecto.svelte';
	import Boton from '$lib/componentes/ui/Boton.svelte';

	// Estado
	let guardandoProyecto = false;

	// Handlers
	const handleGuardarProyecto = async (event: CustomEvent<{ proyecto: Partial<Proyecto> }>) => {
		guardandoProyecto = true;
		try {
			const { proyecto } = event.detail;
			const nuevoProyecto = await crearProyecto(proyecto);
			
			// Redirigir al proyecto creado
			if (nuevoProyecto?.id) {
				goto(`/panel/proyectos/${nuevoProyecto.id}`);
			}
		} catch (error) {
			console.error('Error al crear proyecto:', error);
			// Aquí podrías mostrar un toast de error
		} finally {
			guardandoProyecto = false;
		}
	};

	const handleCancelar = () => {
		goto('/panel/proyectos');
	};
</script>

<svelte:head>
	<title>Nuevo Proyecto - App Contabilidad</title>
	<meta name="description" content="Crea un nuevo proyecto para organizar tus tareas">
</svelte:head>

<!-- Container principal -->
<div class="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-6">
	
	<!-- Breadcrumb -->
	<nav class="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-6">
		<a href="/panel" class="hover:text-gray-900 dark:hover:text-white transition-colors">
			Dashboard
		</a>
		<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
		</svg>
		<a href="/panel/proyectos" class="hover:text-gray-900 dark:hover:text-white transition-colors">
			Proyectos
		</a>
		<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
		</svg>
		<span class="text-gray-900 dark:text-white font-medium">Nuevo Proyecto</span>
	</nav>

	<!-- Header -->
	<div class="mb-8">
		<div class="flex items-center justify-between">
			<div>
				<h1 class="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
					Crear Nuevo Proyecto
				</h1>
				<p class="text-lg text-gray-600 dark:text-gray-400 mt-2">
					Organiza tus tareas en un proyecto estructurado
				</p>
			</div>
			
			<Boton
				variante="ghost"
				icono="arrow-left"
				href="/panel/proyectos"
			>
				Volver a Proyectos
			</Boton>
		</div>
	</div>

	<!-- Formulario -->
	<div class="max-w-4xl">
		<FormularioProyecto
			modal={false}
			guardando={guardandoProyecto}
			on:guardar={handleGuardarProyecto}
			on:cancelar={handleCancelar}
		/>
	</div>
</div> 