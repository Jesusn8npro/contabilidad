import { writable, derived } from 'svelte/store';
import type { MovimientoFinanciero, Categoria } from '$lib/tipos/app';
import { supabase } from '$lib/supabase/cliente';
import { mostrarError, mostrarExito } from './toast';

// Estados principales
export const movimientos = writable<MovimientoFinanciero[]>([]);
export const categorias = writable<Categoria[]>([]);
export const movimientoActual = writable<MovimientoFinanciero | null>(null);
export const cargandoMovimientos = writable<boolean>(false);
export const cargandoCategorias = writable<boolean>(false);

// Estados derivados
export const movimientosPorTipo = derived([movimientos], ([$movimientos]) => ({
    ingresos: $movimientos.filter(m => m.tipo_movimiento === 'ingreso'),
    gastos: $movimientos.filter(m => m.tipo_movimiento === 'gasto')
}));

export const estadisticasMovimientos = derived([movimientos], ([$movimientos]) => {
    const ingresos = $movimientos.filter(m => m.tipo_movimiento === 'ingreso');
    const gastos = $movimientos.filter(m => m.tipo_movimiento === 'gasto');
    
    const totalIngresos = ingresos.reduce((sum, m) => sum + m.monto, 0);
    const totalGastos = gastos.reduce((sum, m) => sum + m.monto, 0);
    
    return {
        totalIngresos,
        totalGastos,
        balance: totalIngresos - totalGastos,
        cantidadIngresos: ingresos.length,
        cantidadGastos: gastos.length,
        promedioIngresos: ingresos.length > 0 ? totalIngresos / ingresos.length : 0,
        promedioGastos: gastos.length > 0 ? totalGastos / gastos.length : 0
    };
});

export const categoriasPorTipo = derived([categorias], ([$categorias]) => ({
    ingresos: $categorias.filter(c => c.tipo_categoria === 'ingreso'),
    gastos: $categorias.filter(c => c.tipo_categoria === 'gasto')
}));

// ==================== FUNCIONES DE MOVIMIENTOS ====================

// Cargar movimientos financieros
export const cargarMovimientos = async (negocioId?: string, filtros?: {
    fechaDesde?: string;
    fechaHasta?: string;
    tipo?: 'ingreso' | 'gasto';
    categoriaId?: string;
}): Promise<void> => {
    try {
        cargandoMovimientos.set(true);
        
        let query = supabase
            .from('movimientos_financieros')
            .select(`
                *,
                categorias:categoria_id (
                    id,
                    nombre,
                    tipo_categoria,
                    color,
                    icono
                ),
                negocios:negocio_id (
                    id,
                    nombre,
                    moneda
                )
            `)
            .order('fecha_movimiento', { ascending: false });

        // Aplicar filtros
        if (negocioId) {
            query = query.eq('negocio_id', negocioId);
        }
        
        if (filtros?.fechaDesde) {
            query = query.gte('fecha_movimiento', filtros.fechaDesde);
        }
        
        if (filtros?.fechaHasta) {
            query = query.lte('fecha_movimiento', filtros.fechaHasta);
        }
        
        if (filtros?.tipo) {
            query = query.eq('tipo_movimiento', filtros.tipo);
        }
        
        if (filtros?.categoriaId) {
            query = query.eq('categoria_id', filtros.categoriaId);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error cargando movimientos:', error);
            mostrarError('Error al cargar los movimientos financieros');
            return;
        }

        movimientos.set(data || []);
    } catch (error) {
        console.error('Error en cargarMovimientos:', error);
        mostrarError('Error al cargar los movimientos financieros');
    } finally {
        cargandoMovimientos.set(false);
    }
};

// Crear nuevo movimiento
export const crearMovimiento = async (movimientoData: Partial<MovimientoFinanciero>): Promise<MovimientoFinanciero | null> => {
    try {
        const nuevoMovimiento = {
            ...movimientoData,
            fecha_creacion: new Date().toISOString()
        };

        const { data, error } = await supabase
            .from('movimientos_financieros')
            .insert([nuevoMovimiento])
            .select(`
                *,
                categorias:categoria_id (
                    id,
                    nombre,
                    tipo_categoria,
                    color,
                    icono
                ),
                negocios:negocio_id (
                    id,
                    nombre,
                    moneda
                )
            `)
            .single();

        if (error) {
            console.error('Error creando movimiento:', error);
            mostrarError('Error al crear el movimiento financiero');
            return null;
        }

        // Actualizar store local
        movimientos.update(lista => [data, ...lista]);
        mostrarExito('Movimiento financiero creado exitosamente');
        return data;
    } catch (error) {
        console.error('Error en crearMovimiento:', error);
        mostrarError('Error al crear el movimiento financiero');
        return null;
    }
};

// Actualizar movimiento
export const actualizarMovimiento = async (id: string, updates: Partial<MovimientoFinanciero>): Promise<boolean> => {
    try {
        const { error } = await supabase
            .from('movimientos_financieros')
            .update(updates)
            .eq('id', id);

        if (error) {
            console.error('Error actualizando movimiento:', error);
            mostrarError('Error al actualizar el movimiento financiero');
            return false;
        }

        // Actualizar store local
        movimientos.update(lista => lista.map(m => m.id === id ? { ...m, ...updates } : m));
        
        mostrarExito('Movimiento financiero actualizado exitosamente');
        return true;
    } catch (error) {
        console.error('Error en actualizarMovimiento:', error);
        mostrarError('Error al actualizar el movimiento financiero');
        return false;
    }
};

// Eliminar movimiento
export const eliminarMovimiento = async (id: string): Promise<boolean> => {
    try {
        const { error } = await supabase
            .from('movimientos_financieros')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error eliminando movimiento:', error);
            mostrarError('Error al eliminar el movimiento financiero');
            return false;
        }

        // Actualizar store local
        movimientos.update(lista => lista.filter(m => m.id !== id));
        
        mostrarExito('Movimiento financiero eliminado exitosamente');
        return true;
    } catch (error) {
        console.error('Error en eliminarMovimiento:', error);
        mostrarError('Error al eliminar el movimiento financiero');
        return false;
    }
};

// ==================== FUNCIONES DE CATEGORÍAS ====================

// Cargar categorías
export const cargarCategorias = async (): Promise<void> => {
    try {
        cargandoCategorias.set(true);
        
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            mostrarError('No hay usuario autenticado');
            return;
        }

        const { data, error } = await supabase
            .from('categorias')
            .select('*')
            .eq('usuario_id', user.id)
            .eq('activa', true)
            .order('nombre', { ascending: true });

        if (error) {
            console.error('Error cargando categorías:', error);
            mostrarError('Error al cargar las categorías');
            return;
        }

        categorias.set(data || []);
    } catch (error) {
        console.error('Error en cargarCategorias:', error);
        mostrarError('Error al cargar las categorías');
    } finally {
        cargandoCategorias.set(false);
    }
};

// Crear nueva categoría
export const crearCategoria = async (categoriaData: Partial<Categoria>): Promise<Categoria | null> => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            mostrarError('No hay usuario autenticado');
            return null;
        }

        const nuevaCategoria = {
            ...categoriaData,
            usuario_id: user.id,
            fecha_creacion: new Date().toISOString(),
            activa: true
        };

        const { data, error } = await supabase
            .from('categorias')
            .insert([nuevaCategoria])
            .select()
            .single();

        if (error) {
            console.error('Error creando categoría:', error);
            mostrarError('Error al crear la categoría');
            return null;
        }

        // Actualizar store local
        categorias.update(lista => [...lista, data]);
        mostrarExito('Categoría creada exitosamente');
        return data;
    } catch (error) {
        console.error('Error en crearCategoria:', error);
        mostrarError('Error al crear la categoría');
        return null;
    }
};

// Actualizar categoría
export const actualizarCategoria = async (id: string, updates: Partial<Categoria>): Promise<boolean> => {
    try {
        const { error } = await supabase
            .from('categorias')
            .update(updates)
            .eq('id', id);

        if (error) {
            console.error('Error actualizando categoría:', error);
            mostrarError('Error al actualizar la categoría');
            return false;
        }

        // Actualizar store local
        categorias.update(lista => lista.map(c => c.id === id ? { ...c, ...updates } : c));
        
        mostrarExito('Categoría actualizada exitosamente');
        return true;
    } catch (error) {
        console.error('Error en actualizarCategoria:', error);
        mostrarError('Error al actualizar la categoría');
        return false;
    }
};

// Eliminar categoría (marcar como inactiva)
export const eliminarCategoria = async (id: string): Promise<boolean> => {
    try {
        const { error } = await supabase
            .from('categorias')
            .update({ activa: false })
            .eq('id', id);

        if (error) {
            console.error('Error eliminando categoría:', error);
            mostrarError('Error al eliminar la categoría');
            return false;
        }

        // Actualizar store local
        categorias.update(lista => lista.filter(c => c.id !== id));
        
        mostrarExito('Categoría eliminada exitosamente');
        return true;
    } catch (error) {
        console.error('Error en eliminarCategoria:', error);
        mostrarError('Error al eliminar la categoría');
        return false;
    }
};

// ==================== FUNCIONES DE ANÁLISIS ====================

// Obtener estadísticas por período
export const obtenerEstadisticasPeriodo = async (
    fechaDesde: string,
    fechaHasta: string,
    negocioId?: string
): Promise<{
    ingresosPorCategoria: { categoria: string; total: number; color?: string }[];
    gastosPorCategoria: { categoria: string; total: number; color?: string }[];
    movimientosPorDia: { fecha: string; ingresos: number; gastos: number }[];
    totalIngresos: number;
    totalGastos: number;
    balance: number;
} | null> => {
    try {
        let query = supabase
            .from('movimientos_financieros')
            .select(`
                *,
                categorias:categoria_id (
                    nombre,
                    color
                )
            `)
            .gte('fecha_movimiento', fechaDesde)
            .lte('fecha_movimiento', fechaHasta);

        if (negocioId) {
            query = query.eq('negocio_id', negocioId);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error obteniendo estadísticas:', error);
            return null;
        }

        if (!data) return null;

        // Procesar datos
        const ingresos = data.filter(m => m.tipo_movimiento === 'ingreso');
        const gastos = data.filter(m => m.tipo_movimiento === 'gasto');

        // Agrupar por categoría
        const ingresosPorCategoria = ingresos.reduce((acc, mov) => {
            const categoria = mov.categorias?.nombre || 'Sin categoría';
            const existing = acc.find(item => item.categoria === categoria);
            if (existing) {
                existing.total += mov.monto;
            } else {
                acc.push({
                    categoria,
                    total: mov.monto,
                    color: mov.categorias?.color
                });
            }
            return acc;
        }, [] as { categoria: string; total: number; color?: string }[]);

        const gastosPorCategoria = gastos.reduce((acc, mov) => {
            const categoria = mov.categorias?.nombre || 'Sin categoría';
            const existing = acc.find(item => item.categoria === categoria);
            if (existing) {
                existing.total += mov.monto;
            } else {
                acc.push({
                    categoria,
                    total: mov.monto,
                    color: mov.categorias?.color
                });
            }
            return acc;
        }, [] as { categoria: string; total: number; color?: string }[]);

        // Agrupar por día
        const movimientosPorDia = data.reduce((acc, mov) => {
            const fecha = mov.fecha_movimiento;
            const existing = acc.find(item => item.fecha === fecha);
            if (existing) {
                if (mov.tipo_movimiento === 'ingreso') {
                    existing.ingresos += mov.monto;
                } else {
                    existing.gastos += mov.monto;
                }
            } else {
                acc.push({
                    fecha,
                    ingresos: mov.tipo_movimiento === 'ingreso' ? mov.monto : 0,
                    gastos: mov.tipo_movimiento === 'gasto' ? mov.monto : 0
                });
            }
            return acc;
        }, [] as { fecha: string; ingresos: number; gastos: number }[]);

        // Ordenar por fecha
        movimientosPorDia.sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());

        const totalIngresos = ingresos.reduce((sum, m) => sum + m.monto, 0);
        const totalGastos = gastos.reduce((sum, m) => sum + m.monto, 0);

        return {
            ingresosPorCategoria,
            gastosPorCategoria,
            movimientosPorDia,
            totalIngresos,
            totalGastos,
            balance: totalIngresos - totalGastos
        };
    } catch (error) {
        console.error('Error en obtenerEstadisticasPeriodo:', error);
        return null;
    }
};

// Buscar movimientos
export const buscarMovimientos = async (termino: string): Promise<MovimientoFinanciero[]> => {
    try {
        const { data, error } = await supabase
            .from('movimientos_financieros')
            .select(`
                *,
                categorias:categoria_id (
                    id,
                    nombre,
                    tipo_categoria,
                    color,
                    icono
                ),
                negocios:negocio_id (
                    id,
                    nombre,
                    moneda
                )
            `)
            .or(`descripcion.ilike.%${termino}%,notas.ilike.%${termino}%`)
            .order('fecha_movimiento', { ascending: false });

        if (error) {
            console.error('Error buscando movimientos:', error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('Error en buscarMovimientos:', error);
        return [];
    }
};

// Exportar movimientos a CSV
export const exportarMovimientosCSV = async (
    fechaDesde?: string,
    fechaHasta?: string,
    negocioId?: string
): Promise<string | null> => {
    try {
        const filtros = {
            fechaDesde,
            fechaHasta
        };

        await cargarMovimientos(negocioId, filtros);
        
        const movimientosActuales = get(movimientos);
        
        if (movimientosActuales.length === 0) {
            mostrarError('No hay movimientos para exportar');
            return null;
        }

        // Crear CSV
        const headers = [
            'Fecha',
            'Tipo',
            'Categoría',
            'Descripción',
            'Monto',
            'Método de Pago',
            'Negocio',
            'Notas'
        ];

        const rows = movimientosActuales.map(mov => [
            mov.fecha_movimiento,
            mov.tipo_movimiento,
            mov.categorias?.nombre || 'Sin categoría',
            mov.descripcion,
            mov.monto.toString(),
            mov.metodo_pago || '',
            mov.negocios?.nombre || '',
            mov.notas || ''
        ]);

        const csvContent = [headers, ...rows]
            .map(row => row.map(field => `"${field}"`).join(','))
            .join('\n');

        mostrarExito('Movimientos exportados exitosamente');
        return csvContent;
    } catch (error) {
        console.error('Error en exportarMovimientosCSV:', error);
        mostrarError('Error al exportar los movimientos');
        return null;
    }
};

// Función helper para obtener stores (para usar en componentes)
export const get = (store: any) => {
    let value: any;
    store.subscribe((val: any) => value = val)();
    return value;
}; 