import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ url }) => {
    // Log simple para debug
    console.log('🔄 Layout cargando para ruta:', url.pathname);
    
    return {
        url: url.pathname
    };
}; 