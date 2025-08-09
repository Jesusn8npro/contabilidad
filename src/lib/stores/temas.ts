import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';

// Tipos de tema
export interface Tema {
    id: string;
    nombre: string;
    descripcion: string;
    preview: string;
    colores: {
        primary: string;
        secondary: string;
        accent: string;
        background: string;
        surface: string;
        text: string;
        textSecondary: string;
        border: string;
        success: string;
        warning: string;
        error: string;
        info: string;
    };
    gradientes?: {
        primary: string;
        secondary: string;
        hero: string;
    };
    sombras?: {
        sm: string;
        md: string;
        lg: string;
        xl: string;
    };
    categoría: 'corporativo' | 'creativo' | 'minimal' | 'gaming' | 'profesional';
    premium: boolean;
}

// Temas predefinidos
const temasDisponibles: Tema[] = [
    {
        id: 'default',
        nombre: 'Default Empresarial',
        descripcion: 'Tema azul corporativo clásico',
        preview: '🔵',
        categoría: 'corporativo',
        premium: false,
        colores: {
            primary: '#3B82F6',
            secondary: '#6366F1',
            accent: '#8B5CF6',
            background: '#F8FAFC',
            surface: '#FFFFFF',
            text: '#1E293B',
            textSecondary: '#64748B',
            border: '#E2E8F0',
            success: '#10B981',
            warning: '#F59E0B',
            error: '#EF4444',
            info: '#3B82F6'
        },
        gradientes: {
            primary: 'linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)',
            secondary: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
            hero: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }
    },
    {
        id: 'forest',
        nombre: 'Bosque Empresarial',
        descripcion: 'Verde natural para negocios sostenibles',
        preview: '🌲',
        categoría: 'profesional',
        premium: false,
        colores: {
            primary: '#059669',
            secondary: '#047857',
            accent: '#84CC16',
            background: '#F0FDF4',
            surface: '#FFFFFF',
            text: '#064E3B',
            textSecondary: '#6B7280',
            border: '#D1FAE5',
            success: '#10B981',
            warning: '#F59E0B',
            error: '#DC2626',
            info: '#059669'
        },
        gradientes: {
            primary: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
            secondary: 'linear-gradient(135deg, #84CC16 0%, #22C55E 100%)',
            hero: 'linear-gradient(135deg, #134e4a 0%, #065f46 100%)'
        }
    },
    {
        id: 'sunset',
        nombre: 'Atardecer Creativo',
        descripcion: 'Naranja y rosa para creativos',
        preview: '🌅',
        categoría: 'creativo',
        premium: true,
        colores: {
            primary: '#F97316',
            secondary: '#EA580C',
            accent: '#EC4899',
            background: '#FFF7ED',
            surface: '#FFFFFF',
            text: '#9A3412',
            textSecondary: '#A3A3A3',
            border: '#FED7AA',
            success: '#84CC16',
            warning: '#F59E0B',
            error: '#DC2626',
            info: '#F97316'
        },
        gradientes: {
            primary: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
            secondary: 'linear-gradient(135deg, #EC4899 0%, #F97316 100%)',
            hero: 'linear-gradient(135deg, #ff7e5f 0%, #feb47b 100%)'
        }
    },
    {
        id: 'ocean',
        nombre: 'Océano Profundo',
        descripcion: 'Azul marino para fintech',
        preview: '🌊',
        categoría: 'profesional',
        premium: true,
        colores: {
            primary: '#0EA5E9',
            secondary: '#0284C7',
            accent: '#06B6D4',
            background: '#F0F9FF',
            surface: '#FFFFFF',
            text: '#0C4A6E',
            textSecondary: '#64748B',
            border: '#BAE6FD',
            success: '#06B6D4',
            warning: '#F59E0B',
            error: '#DC2626',
            info: '#0EA5E9'
        },
        gradientes: {
            primary: 'linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)',
            secondary: 'linear-gradient(135deg, #06B6D4 0%, #0EA5E9 100%)',
            hero: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }
    },
    {
        id: 'minimal',
        nombre: 'Minimalista',
        descripcion: 'Blanco y negro elegante',
        preview: '⚫',
        categoría: 'minimal',
        premium: false,
        colores: {
            primary: '#18181B',
            secondary: '#27272A',
            accent: '#71717A',
            background: '#FAFAFA',
            surface: '#FFFFFF',
            text: '#09090B',
            textSecondary: '#71717A',
            border: '#E4E4E7',
            success: '#22C55E',
            warning: '#EAB308',
            error: '#EF4444',
            info: '#3B82F6'
        },
        gradientes: {
            primary: 'linear-gradient(135deg, #18181B 0%, #27272A 100%)',
            secondary: 'linear-gradient(135deg, #71717A 0%, #A1A1AA 100%)',
            hero: 'linear-gradient(135deg, #000000 0%, #434343 100%)'
        }
    },
    {
        id: 'neon',
        nombre: 'Neón Gaming',
        descripcion: 'Colores vibrantes para gaming',
        preview: '⚡',
        categoría: 'gaming',
        premium: true,
        colores: {
            primary: '#8B5CF6',
            secondary: '#A855F7',
            accent: '#EC4899',
            background: '#0F0F23',
            surface: '#1E1E3F',
            text: '#FFFFFF',
            textSecondary: '#A1A1AA',
            border: '#374151',
            success: '#00FF88',
            warning: '#FFD700',
            error: '#FF0080',
            info: '#00BFFF'
        },
        gradientes: {
            primary: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
            secondary: 'linear-gradient(135deg, #00FF88 0%, #00BFFF 100%)',
            hero: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }
    },
    {
        id: 'gold',
        nombre: 'Oro Premium',
        descripcion: 'Dorado elegante para lujo',
        preview: '🏆',
        categoría: 'corporativo',
        premium: true,
        colores: {
            primary: '#D97706',
            secondary: '#B45309',
            accent: '#F59E0B',
            background: '#FFFBEB',
            surface: '#FFFFFF',
            text: '#92400E',
            textSecondary: '#6B7280',
            border: '#FDE68A',
            success: '#059669',
            warning: '#F59E0B',
            error: '#DC2626',
            info: '#D97706'
        },
        gradientes: {
            primary: 'linear-gradient(135deg, #D97706 0%, #B45309 100%)',
            secondary: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
            hero: 'linear-gradient(135deg, #f7971e 0%, #ffd200 100%)'
        }
    }
];

// Estados
export const temaActual = writable<string>('default');
export const temasGuardados = writable<Tema[]>(temasDisponibles);
export const modoOscuro = writable<boolean>(false);

// Estado derivado - tema seleccionado completo
export const temaSeleccionado = derived(
    [temaActual, temasGuardados], 
    ([$temaActual, $temasGuardados]) => {
        return $temasGuardados.find(t => t.id === $temaActual) || $temasGuardados[0];
    }
);

// Función para aplicar tema
export const aplicarTema = (tema: Tema) => {
    if (!browser) return;

    const root = document.documentElement;
    
    // Aplicar variables CSS personalizadas
    Object.entries(tema.colores).forEach(([key, value]) => {
        root.style.setProperty(`--color-${key}`, value);
    });

    if (tema.gradientes) {
        Object.entries(tema.gradientes).forEach(([key, value]) => {
            root.style.setProperty(`--gradient-${key}`, value);
        });
    }

    // Aplicar clases de color dinámicas a elementos comunes
    const aplicarEstilosDirectos = () => {
        // Botones primarios
        const botonesPrimarios = document.querySelectorAll('[data-color="primary"], .btn-primary, button[class*="bg-blue"]');
        botonesPrimarios.forEach(el => {
            (el as HTMLElement).style.backgroundColor = tema.colores.primary;
        });

        // Fondos de superficie
        const superficies = document.querySelectorAll('[data-color="surface"], .bg-white');
        superficies.forEach(el => {
            (el as HTMLElement).style.backgroundColor = tema.colores.surface;
        });

        // Textos primarios
        const textos = document.querySelectorAll('[data-color="text"], .text-gray-900');
        textos.forEach(el => {
            (el as HTMLElement).style.color = tema.colores.text;
        });
    };

    // Aplicar inmediatamente
    setTimeout(aplicarEstilosDirectos, 100);

    // Guardar en localStorage
    localStorage.setItem('tema-seleccionado', tema.id);
    
    // Actualizar store
    temaActual.set(tema.id);
    
    // Forzar re-render de la página
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('theme-changed'));
    }
};

// Función para alternar modo oscuro
export const alternarModoOscuro = () => {
    if (!browser) return;

    modoOscuro.update(modo => {
        const nuevoModo = !modo;
        
        if (nuevoModo) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        
        localStorage.setItem('modo-oscuro', nuevoModo.toString());
        return nuevoModo;
    });
};

// Función para crear tema personalizado
export const crearTemaPersonalizado = (
    nombre: string,
    colores: Tema['colores'],
    categoria: Tema['categoría'] = 'profesional'
): Tema => {
    const nuevoTema: Tema = {
        id: `custom-${Date.now()}`,
        nombre,
        descripcion: 'Tema personalizado',
        preview: '🎨',
        categoría: categoria,
        premium: false,
        colores,
        gradientes: {
            primary: `linear-gradient(135deg, ${colores.primary} 0%, ${colores.secondary} 100%)`,
            secondary: `linear-gradient(135deg, ${colores.secondary} 0%, ${colores.accent} 100%)`,
            hero: `linear-gradient(135deg, ${colores.primary} 0%, ${colores.accent} 100%)`
        }
    };

    // Guardar tema personalizado
    temasGuardados.update(temas => [...temas, nuevoTema]);
    
    if (browser) {
        const temasPersonalizados = JSON.parse(localStorage.getItem('temas-personalizados') || '[]');
        temasPersonalizados.push(nuevoTema);
        localStorage.setItem('temas-personalizados', JSON.stringify(temasPersonalizados));
    }

    return nuevoTema;
};

// Función para eliminar tema personalizado
export const eliminarTemaPersonalizado = (temaId: string) => {
    if (!temaId.startsWith('custom-')) return false;

    temasGuardados.update(temas => temas.filter(t => t.id !== temaId));
    
    if (browser) {
        const temasPersonalizados = JSON.parse(localStorage.getItem('temas-personalizados') || '[]');
        const temasActualizados = temasPersonalizados.filter((t: Tema) => t.id !== temaId);
        localStorage.setItem('temas-personalizados', JSON.stringify(temasActualizados));
        
        // Si era el tema actual, cambiar al default
        const actual = localStorage.getItem('tema-seleccionado');
        if (actual === temaId) {
            aplicarTema(temasDisponibles[0]);
        }
    }

    return true;
};

// Función para exportar tema
export const exportarTema = (tema: Tema): string => {
    return JSON.stringify(tema, null, 2);
};

// Función para importar tema
export const importarTema = (temaJSON: string): Tema | null => {
    try {
        const tema: Tema = JSON.parse(temaJSON);
        
        // Validar estructura básica
        if (!tema.nombre || !tema.colores || !tema.id) {
            throw new Error('Formato de tema inválido');
        }

        // Generar nuevo ID para evitar conflictos
        tema.id = `imported-${Date.now()}`;
        
        // Agregar a temas guardados
        temasGuardados.update(temas => [...temas, tema]);
        
        if (browser) {
            const temasPersonalizados = JSON.parse(localStorage.getItem('temas-personalizados') || '[]');
            temasPersonalizados.push(tema);
            localStorage.setItem('temas-personalizados', JSON.stringify(temasPersonalizados));
        }

        return tema;
    } catch (error) {
        console.error('Error importando tema:', error);
        return null;
    }
};

// Función para inicializar temas al cargar la app
export const inicializarTemas = () => {
    if (!browser) return;

    // Cargar tema guardado
    const temaGuardado = localStorage.getItem('tema-seleccionado');
    if (temaGuardado) {
        const tema = temasDisponibles.find(t => t.id === temaGuardado);
        if (tema) {
            aplicarTema(tema);
        }
    }

    // Cargar modo oscuro
    const modoOscuroGuardado = localStorage.getItem('modo-oscuro');
    if (modoOscuroGuardado === 'true') {
        modoOscuro.set(true);
        document.documentElement.classList.add('dark');
    }

    // Cargar temas personalizados
    const temasPersonalizados = localStorage.getItem('temas-personalizados');
    if (temasPersonalizados) {
        try {
            const temas: Tema[] = JSON.parse(temasPersonalizados);
            temasGuardados.update(temasActuales => [...temasActuales, ...temas]);
        } catch (error) {
            console.error('Error cargando temas personalizados:', error);
        }
    }
};

// Función para obtener temas por categoría
export const obtenerTemasPorCategoria = (categoria: Tema['categoría']): Tema[] => {
    let temas: Tema[] = [];
    temasGuardados.subscribe(t => temas = t)();
    return temas.filter(t => t.categoría === categoria);
};

// Función para generar colores complementarios
export const generarColoresComplementarios = (colorPrimario: string): Partial<Tema['colores']> => {
    // Esta es una implementación básica
    // En producción, usarías una librería como chroma.js
    return {
        primary: colorPrimario,
        secondary: colorPrimario + '80', // Con opacidad
        accent: colorPrimario,
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: colorPrimario
    };
};

// Suscripción reactiva para aplicar tema automáticamente
temaSeleccionado.subscribe(tema => {
    if (tema && browser) {
        aplicarTema(tema);
    }
});

// Exportar temas predefinidos
export { temasDisponibles }; 