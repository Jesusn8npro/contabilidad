import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ url, depends }) => {
    // Forzar invalidación cuando la URL cambia
    depends('app:navigation');
    
    // Log para debug
    console.log('🔄 Layout cargando para ruta:', url.pathname);
    
    return {
        pathname: url.pathname,
        timestamp: Date.now() // Forzar actualización
    };
}; 