<script lang="ts">
	import { MessageCircle, Phone } from 'lucide-svelte';

	// Props
	export let numero: string = '';
	export let mensaje: string = '';
	export let texto: string = 'Contactar por WhatsApp';
	export let tamaño: 'sm' | 'md' | 'lg' = 'md';
	export let variante: 'primary' | 'secondary' | 'outline' = 'primary';
	export let mostrarIcono: boolean = true;
	export let abrirEnNuevaVentana: boolean = true;

	// Limpiar número de WhatsApp
	const limpiarNumero = (num: string): string => {
		return num.replace(/[^\d]/g, '');
	};

	// Generar URL de WhatsApp
	$: urlWhatsApp = (() => {
		const numeroLimpio = limpiarNumero(numero);
		const mensajeCodificado = encodeURIComponent(mensaje);
		
		if (!numeroLimpio) return '';
		
		// Si el número no empieza con código de país, agregar +57 (Colombia)
		const numeroCompleto = numeroLimpio.startsWith('57') ? numeroLimpio : `57${numeroLimpio}`;
		
		return `https://wa.me/${numeroCompleto}${mensaje ? `?text=${mensajeCodificado}` : ''}`;
	})();

	// Clases CSS
	const clasesTamaño = {
		sm: 'px-3 py-1.5 text-sm',
		md: 'px-4 py-2 text-base',
		lg: 'px-6 py-3 text-lg'
	};

	const clasesVariante = {
		primary: 'bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl',
		secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300',
		outline: 'border-2 border-green-500 text-green-600 hover:bg-green-500 hover:text-white'
	};

	const claseIcono = {
		sm: 'w-4 h-4',
		md: 'w-5 h-5',
		lg: 'w-6 h-6'
	};

	// Handler del click
	const handleClick = () => {
		if (!urlWhatsApp) {
			alert('Número de WhatsApp no válido');
			return;
		}

		if (abrirEnNuevaVentana) {
			window.open(urlWhatsApp, '_blank', 'noopener,noreferrer');
		} else {
			window.location.href = urlWhatsApp;
		}
	};
</script>

<button
	on:click={handleClick}
	disabled={!numero}
	class="inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none {clasesTamaño[tamaño]} {clasesVariante[variante]}"
	title="Abrir chat de WhatsApp"
>
	{#if mostrarIcono}
		<MessageCircle class={claseIcono[tamaño]} />
	{/if}
	{texto}
</button>

<!-- Información del número (solo visible en desarrollo) -->
{#if import.meta.env.DEV && urlWhatsApp}
	<div class="mt-2 p-2 bg-gray-100 rounded text-xs text-gray-600">
		<strong>Debug URL:</strong> {urlWhatsApp}
	</div>
{/if} 