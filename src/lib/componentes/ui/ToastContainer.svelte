<script lang="ts">
	import { toasts, removerToast } from '$lib/stores/toast';
	import Toast from './Toast.svelte';
</script>

<!-- Contenedor de notificaciones -->
<div class="fixed top-4 right-4 z-50 flex flex-col space-y-3 max-w-sm w-full">
	{#each $toasts as toast (toast.id)}
		<Toast
			tipo={toast.tipo}
			titulo={toast.titulo}
			mensaje={toast.mensaje}
			duracion={toast.duracion}
			icono={toast.icono}
			on:cerrar={() => removerToast(toast.id)}
		/>
	{/each}
</div> 