import { writable } from 'svelte/store';

export interface Toast {
	id: string;
	tipo: 'exito' | 'error' | 'advertencia' | 'info';
	titulo?: string;
	mensaje: string;
	duracion?: number;
	icono?: boolean;
}

// Store de notificaciones
export const toasts = writable<Toast[]>([]);

// Función para agregar una notificación
export const mostrarToast = (toast: Omit<Toast, 'id'>) => {
	const id = crypto.randomUUID();
	const nuevaNotificacion: Toast = {
		id,
		duracion: 5000,
		icono: true,
		...toast
	};

	toasts.update(notificaciones => [...notificaciones, nuevaNotificacion]);

	// Auto remover después de la duración
	if (nuevaNotificacion.duracion && nuevaNotificacion.duracion > 0) {
		setTimeout(() => {
			removerToast(id);
		}, nuevaNotificacion.duracion);
	}

	return id;
};

// Función para remover una notificación
export const removerToast = (id: string) => {
	toasts.update(notificaciones => notificaciones.filter(n => n.id !== id));
};

// Funciones de utilidad para tipos específicos
export const mostrarExito = (mensaje: string, titulo?: string) => {
	return mostrarToast({
		tipo: 'exito',
		titulo,
		mensaje
	});
};

export const mostrarError = (mensaje: string, titulo?: string) => {
	return mostrarToast({
		tipo: 'error',
		titulo,
		mensaje,
		duracion: 7000 // Los errores duran más tiempo
	});
};

export const mostrarAdvertencia = (mensaje: string, titulo?: string) => {
	return mostrarToast({
		tipo: 'advertencia',
		titulo,
		mensaje
	});
};

export const mostrarInfo = (mensaje: string, titulo?: string) => {
	return mostrarToast({
		tipo: 'info',
		titulo,
		mensaje
	});
};

// Función para limpiar todas las notificaciones
export const limpiarToasts = () => {
	toasts.set([]);
}; 