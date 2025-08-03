import { writable } from 'svelte/store';
import { browser } from '$app/environment';

// Tipo para el tema
export type Tema = 'claro' | 'oscuro';

// Store para el tema actual
export const temaActual = writable<Tema>('claro');

// Inicializar tema desde localStorage o preferencia del sistema
export const inicializarTema = () => {
	if (!browser) return;

	// Verificar localStorage primero
	const temaGuardado = localStorage.getItem('tema') as Tema;
	
	if (temaGuardado) {
		temaActual.set(temaGuardado);
		aplicarTema(temaGuardado);
	} else {
		// Detectar preferencia del sistema
		const prefiereDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
		const tema: Tema = prefiereDark ? 'oscuro' : 'claro';
		temaActual.set(tema);
		aplicarTema(tema);
	}

	// Escuchar cambios en la preferencia del sistema
	window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
		if (!localStorage.getItem('tema')) {
			const tema: Tema = e.matches ? 'oscuro' : 'claro';
			temaActual.set(tema);
			aplicarTema(tema);
		}
	});
};

// Aplicar tema al documento
const aplicarTema = (tema: Tema) => {
	if (!browser) return;

	const html = document.documentElement;
	
	if (tema === 'oscuro') {
		html.classList.add('dark');
	} else {
		html.classList.remove('dark');
	}
};

// Alternar entre temas
export const alternarTema = () => {
	temaActual.update(tema => {
		const nuevoTema: Tema = tema === 'claro' ? 'oscuro' : 'claro';
		
		// Guardar en localStorage
		if (browser) {
			localStorage.setItem('tema', nuevoTema);
			aplicarTema(nuevoTema);
		}
		
		return nuevoTema;
	});
};

// Establecer tema específico
export const establecerTema = (tema: Tema) => {
	temaActual.set(tema);
	
	if (browser) {
		localStorage.setItem('tema', tema);
		aplicarTema(tema);
	}
}; 