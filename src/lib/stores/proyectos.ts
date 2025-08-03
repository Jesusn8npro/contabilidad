import { writable, derived } from 'svelte/store';
import type { Proyecto, Tarea, EstadoProyecto, EstadoTarea, PrioridadTarea } from '$lib/tipos/app';
import { supabase } from '$lib/supabase/cliente';
import { mostrarError, mostrarExito } from './toast';

// Estados principales
export const proyectos = writable<Proyecto[]>([]);
export const tareas = writable<Tarea[]>([]);
export const proyectoActual = writable<Proyecto | null>(null);
export const cargandoProyectos = writable<boolean>(false);
export const cargandoProyecto = writable<boolean>(false);
export const cargandoTareas = writable<boolean>(false);

// Estados derivados
export const estadisticasProyectos = derived([proyectos, tareas], ([$proyectos, $tareas]) => {
    if (!$proyectos || !$tareas) {
        return {
            total: 0,
            activos: 0,
            completados: 0,
            pausados: 0,
            tareasTotales: 0,
            tareasCompletadas: 0,
            tareasPendientes: 0,
            progresoPromedio: 0
        };
    }

    const activos = $proyectos.filter(p => p.estado === 'activo').length;
    const completados = $proyectos.filter(p => p.estado === 'completado').length;
    const pausados = $proyectos.filter(p => p.estado === 'pausado').length;
    
    const tareasCompletadas = $tareas.filter(t => t.estado === 'completada').length;
    const tareasPendientes = $tareas.filter(t => t.estado !== 'completada').length;
    
    const progresoPromedio = $proyectos.length > 0 
        ? $proyectos.reduce((acc, p) => acc + p.progreso, 0) / $proyectos.length 
        : 0;

    return {
        total: $proyectos.length,
        activos,
        completados,
        pausados,
        tareasTotales: $tareas.length,
        tareasCompletadas,
        tareasPendientes,
        progresoPromedio: Math.round(progresoPromedio)
    };
});

// ==================== FUNCIONES DE PROYECTOS ====================

// Cargar todos los proyectos del usuario
export const cargarProyectos = async (): Promise<void> => {
    try {
        cargandoProyectos.set(true);
        
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            mostrarError('No hay usuario autenticado');
            return;
        }

        const { data, error } = await supabase
            .from('proyectos')
            .select(`
                *,
                negocios:negocio_id (
                    id,
                    nombre,
                    moneda
                )
            `)
            .eq('usuario_id', user.id)
            .order('fecha_creacion', { ascending: false });

        if (error) {
            console.error('Error cargando proyectos:', error);
            mostrarError('Error al cargar los proyectos');
            return;
        }

        proyectos.set(data || []);
    } catch (error) {
        console.error('Error en cargarProyectos:', error);
        mostrarError('Error al cargar los proyectos');
    } finally {
        cargandoProyectos.set(false);
    }
};

// Cargar un proyecto específico
export const cargarProyecto = async (id: string): Promise<void> => {
    try {
        cargandoProyecto.set(true);
        
        const { data, error } = await supabase
            .from('proyectos')
            .select(`
                *,
                negocios:negocio_id (
                    id,
                    nombre,
                    moneda
                )
            `)
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error cargando proyecto:', error);
            mostrarError('Error al cargar el proyecto');
            return;
        }

        proyectoActual.set(data);
    } catch (error) {
        console.error('Error en cargarProyecto:', error);
        mostrarError('Error al cargar el proyecto');
    } finally {
        cargandoProyecto.set(false);
    }
};

// Crear nuevo proyecto
export const crearProyecto = async (proyectoData: Partial<Proyecto>): Promise<Proyecto | null> => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            mostrarError('No hay usuario autenticado');
            return null;
        }

        const nuevoProyecto = {
            ...proyectoData,
            usuario_id: user.id,
            fecha_creacion: new Date().toISOString(),
            fecha_actualizacion: new Date().toISOString()
        };

        const { data, error } = await supabase
            .from('proyectos')
            .insert([nuevoProyecto])
            .select(`
                *,
                negocios:negocio_id (
                    id,
                    nombre,
                    moneda
                )
            `)
            .single();

        if (error) {
            console.error('Error creando proyecto:', error);
            mostrarError('Error al crear el proyecto');
            return null;
        }

        // Actualizar store local
        proyectos.update(lista => [data, ...lista]);
        mostrarExito('Proyecto creado exitosamente');
        return data;
    } catch (error) {
        console.error('Error en crearProyecto:', error);
        mostrarError('Error al crear el proyecto');
        return null;
    }
};

// Actualizar proyecto
export const actualizarProyecto = async (id: string, updates: Partial<Proyecto>): Promise<boolean> => {
    try {
        const { error } = await supabase
            .from('proyectos')
            .update({
                ...updates,
                fecha_actualizacion: new Date().toISOString()
            })
            .eq('id', id);

        if (error) {
            console.error('Error actualizando proyecto:', error);
            mostrarError('Error al actualizar el proyecto');
            return false;
        }

        // Actualizar stores locales
        proyectos.update(lista => lista.map(p => p.id === id ? { ...p, ...updates } : p));
        
        // Si es el proyecto actual, actualizarlo también
        proyectoActual.update(actual => actual?.id === id ? { ...actual, ...updates } : actual);
        
        mostrarExito('Proyecto actualizado exitosamente');
        return true;
    } catch (error) {
        console.error('Error en actualizarProyecto:', error);
        mostrarError('Error al actualizar el proyecto');
        return false;
    }
};

// Eliminar proyecto
export const eliminarProyecto = async (id: string): Promise<boolean> => {
    try {
        const { error } = await supabase
            .from('proyectos')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error eliminando proyecto:', error);
            mostrarError('Error al eliminar el proyecto');
            return false;
        }

        // Actualizar store local
        proyectos.update(lista => lista.filter(p => p.id !== id));
        
        // Si es el proyecto actual, limpiarlo
        proyectoActual.update(actual => actual?.id === id ? null : actual);
        
        mostrarExito('Proyecto eliminado exitosamente');
        return true;
    } catch (error) {
        console.error('Error en eliminarProyecto:', error);
        mostrarError('Error al eliminar el proyecto');
        return false;
    }
};

// ==================== FUNCIONES DE TAREAS ====================

// Cargar tareas de un proyecto
export const cargarTareasProyecto = async (proyectoId: string): Promise<void> => {
    try {
        cargandoTareas.set(true);
        
        const { data, error } = await supabase
            .from('tareas')
            .select('*')
            .eq('proyecto_id', proyectoId)
            .order('orden', { ascending: true });

        if (error) {
            console.error('Error cargando tareas:', error);
            mostrarError('Error al cargar las tareas');
            return;
        }

        tareas.set(data || []);
    } catch (error) {
        console.error('Error en cargarTareasProyecto:', error);
        mostrarError('Error al cargar las tareas');
    } finally {
        cargandoTareas.set(false);
    }
};

// Crear nueva tarea
export const crearTarea = async (tareaData: Partial<Tarea>): Promise<Tarea | null> => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            mostrarError('No hay usuario autenticado');
            return null;
        }

        const nuevaTarea = {
            ...tareaData,
            usuario_id: user.id,
            fecha_creacion: new Date().toISOString(),
            fecha_actualizacion: new Date().toISOString()
        };

        const { data, error } = await supabase
            .from('tareas')
            .insert([nuevaTarea])
            .select()
            .single();

        if (error) {
            console.error('Error creando tarea:', error);
            mostrarError('Error al crear la tarea');
            return null;
        }

        // Actualizar store local
        tareas.update(lista => [...lista, data]);
        mostrarExito('Tarea creada exitosamente');
        return data;
    } catch (error) {
        console.error('Error en crearTarea:', error);
        mostrarError('Error al crear la tarea');
        return null;
    }
};

// Actualizar tarea
export const actualizarTarea = async (id: string, updates: Partial<Tarea>): Promise<boolean> => {
    try {
        const { error } = await supabase
            .from('tareas')
            .update({
                ...updates,
                fecha_actualizacion: new Date().toISOString()
            })
            .eq('id', id);

        if (error) {
            console.error('Error actualizando tarea:', error);
            mostrarError('Error al actualizar la tarea');
            return false;
        }

        // Actualizar store local
        tareas.update(lista => lista.map(t => t.id === id ? { ...t, ...updates } : t));
        
        mostrarExito('Tarea actualizada exitosamente');
        return true;
    } catch (error) {
        console.error('Error en actualizarTarea:', error);
        mostrarError('Error al actualizar la tarea');
        return false;
    }
};

// Mover tarea en el Kanban
export const moverTarea = async (
    tareaId: string, 
    nuevaColumna: string, 
    nuevoOrden: number
): Promise<boolean> => {
    try {
        const updates: Partial<Tarea> = {
            columna: nuevaColumna,
            orden: nuevoOrden
        };

        // Si se mueve a completada, agregar fecha
        if (nuevaColumna === 'completada') {
            updates.estado = 'completada';
            updates.fecha_completado = new Date().toISOString();
        } else {
            // Mapear columna a estado
            switch (nuevaColumna) {
                case 'por-hacer':
                    updates.estado = 'por-hacer';
                    break;
                case 'en-progreso':
                    updates.estado = 'en-progreso';
                    break;
                case 'en-revision':
                    updates.estado = 'en-revision';
                    break;
                default:
                    updates.estado = 'por-hacer';
            }
        }

        return await actualizarTarea(tareaId, updates);
    } catch (error) {
        console.error('Error en moverTarea:', error);
        mostrarError('Error al mover la tarea');
        return false;
    }
};

// Eliminar tarea
export const eliminarTarea = async (id: string): Promise<boolean> => {
    try {
        const { error } = await supabase
            .from('tareas')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error eliminando tarea:', error);
            mostrarError('Error al eliminar la tarea');
            return false;
        }

        // Actualizar store local
        tareas.update(lista => lista.filter(t => t.id !== id));
        
        mostrarExito('Tarea eliminada exitosamente');
        return true;
    } catch (error) {
        console.error('Error en eliminarTarea:', error);
        mostrarError('Error al eliminar la tarea');
        return false;
    }
};

// ==================== FUNCIONES KANBAN ====================

// Obtener tareas organizadas por columnas para Kanban
export const tareasKanban = derived([tareas], ([$tareas]) => {
    const columnas: Record<string, Tarea[]> = {
        'por-hacer': [],
        'en-progreso': [],
        'en-revision': [],
        'completada': []
    };

    $tareas.forEach(tarea => {
        const columna = tarea.columna || 'por-hacer';
        if (columnas[columna]) {
            columnas[columna].push(tarea);
        }
    });

    // Ordenar tareas dentro de cada columna
    Object.keys(columnas).forEach(columna => {
        columnas[columna].sort((a: Tarea, b: Tarea) => a.orden - b.orden);
    });

    return columnas;
});

// ==================== FUNCIONES DE UTILIDAD ====================

// Calcular progreso del proyecto basado en tareas
export const calcularProgresoProyecto = async (proyectoId: string): Promise<number> => {
    try {
        const { data, error } = await supabase
            .from('tareas')
            .select('estado')
            .eq('proyecto_id', proyectoId);

        if (error) {
            console.error('Error calculando progreso:', error);
            return 0;
        }

        if (!data || data.length === 0) return 0;

        const completadas = data.filter((t: { estado: string }) => t.estado === 'completada').length;
        return Math.round((completadas / data.length) * 100);
    } catch (error) {
        console.error('Error en calcularProgresoProyecto:', error);
        return 0;
    }
};

// Actualizar progreso automático del proyecto
export const actualizarProgresoAutomatico = async (proyectoId: string): Promise<void> => {
    try {
        const progreso = await calcularProgresoProyecto(proyectoId);
        await actualizarProyecto(proyectoId, { progreso });
    } catch (error) {
        console.error('Error en actualizarProgresoAutomatico:', error);
    }
};

// Buscar proyectos
export const buscarProyectos = async (termino: string): Promise<Proyecto[]> => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        const { data, error } = await supabase
            .from('proyectos')
            .select(`
                *,
                negocios:negocio_id (
                    id,
                    nombre,
                    moneda
                )
            `)
            .eq('usuario_id', user.id)
            .or(`nombre.ilike.%${termino}%,descripcion.ilike.%${termino}%`)
            .order('fecha_creacion', { ascending: false });

        if (error) {
            console.error('Error buscando proyectos:', error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('Error en buscarProyectos:', error);
        return [];
    }
};

// Filtrar proyectos por estado
export const filtrarProyectosPorEstado = async (estado: EstadoProyecto): Promise<Proyecto[]> => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        const { data, error } = await supabase
            .from('proyectos')
            .select(`
                *,
                negocios:negocio_id (
                    id,
                    nombre,
                    moneda
                )
            `)
            .eq('usuario_id', user.id)
            .eq('estado', estado)
            .order('fecha_creacion', { ascending: false });

        if (error) {
            console.error('Error filtrando proyectos:', error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('Error en filtrarProyectosPorEstado:', error);
        return [];
    }
};

// Reordenar múltiples tareas
export const reordenarTareas = async (tareasReordenadas: { id: string; orden: number }[]): Promise<boolean> => {
    try {
        // Actualizar todas las tareas en lote
        const promesas = tareasReordenadas.map(({ id, orden }) => 
            supabase
                .from('tareas')
                .update({ orden, fecha_actualizacion: new Date().toISOString() })
                .eq('id', id)
        );

        const resultados = await Promise.all(promesas);
        
        // Verificar si alguna actualización falló
        const errores = resultados.filter(resultado => resultado.error);
        if (errores.length > 0) {
            console.error('Errores al reordenar tareas:', errores);
            mostrarError('Error al reordenar algunas tareas');
            return false;
        }

        // Recargar tareas para reflejar los cambios
        await cargarTareas();
        mostrarExito('Tareas reordenadas correctamente');
        return true;
    } catch (error) {
        console.error('Error en reordenarTareas:', error);
        mostrarError('Error al reordenar las tareas');
        return false;
    }
};

// Cargar todas las tareas del usuario
export const cargarTareas = async (): Promise<void> => {
    cargandoTareas.set(true);
    
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            cargandoTareas.set(false);
            return;
        }

        const { data, error } = await supabase
            .from('tareas')
            .select(`
                *,
                proyectos:proyecto_id (
                    id,
                    nombre,
                    color
                )
            `)
            .eq('usuario_id', user.id)
            .order('fecha_actualizacion', { ascending: false });

        if (error) {
            console.error('Error cargando tareas:', error);
            mostrarError('Error al cargar las tareas');
            return;
        }

        tareas.set(data || []);
    } catch (error) {
        console.error('Error en cargarTareas:', error);
        mostrarError('Error al cargar las tareas');
    } finally {
        cargandoTareas.set(false);
    }
}; 