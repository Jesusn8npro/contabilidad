import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { invalidateAll } from '$app/navigation';

// Store para controlar el estado de navegación
export const estadoNavegacion = writable({
	cargando: false,
	ultimaRuta: '',
	tiempoNavegacion: 0
});

// Store para forzar actualizaciones
export const forzarActualizacion = writable(0);

// Función para forzar invalidación global
export const invalidarTodo = async () => {
	if (browser) {
		try {
			forzarActualizacion.update(n => n + 1);
			await invalidateAll();
			console.log('✅ Datos invalidados y actualizados');
		} catch (error) {
			console.error('❌ Error al invalidar datos:', error);
		}
	}
};

// Función para marcar navegación como completada
export const completarNavegacion = (ruta: string) => {
	estadoNavegacion.update(estado => ({
		...estado,
		cargando: false,
		ultimaRuta: ruta,
		tiempoNavegacion: Date.now()
	}));
};

// Función para iniciar navegación
export const iniciarNavegacion = () => {
	estadoNavegacion.update(estado => ({
		...estado,
		cargando: true,
		tiempoNavegacion: Date.now()
	}));
}; 