import { writable } from 'svelte/store';

// Store para controlar la visibilidad de la navegación móvil cuando hay modales abiertos
export const modalAbierto = writable<boolean>(false);

// Función para mostrar/ocultar la navegación cuando se abren/cierran modales
export const abrirModal = () => modalAbierto.set(true);
export const cerrarModal = () => modalAbierto.set(false); 