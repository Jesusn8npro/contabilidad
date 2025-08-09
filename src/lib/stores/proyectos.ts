import { writable, derived, get } from 'svelte/store';
import type { Proyecto, Tarea, EstadoProyecto, EstadoTarea, PrioridadTarea } from '$lib/tipos/app';
import { supabase } from '$lib/supabase/cliente';
import { mostrarError, mostrarExito } from './toast';
import { generarSlugUnico } from '$lib/utils/slug';

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

// Cargar proyecto por slug
export const cargarProyectoPorSlug = async (slug: string) => {
    try {
        cargandoProyecto.set(true);
        
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
            .eq('slug', slug)
            .eq('usuario_id', user.id)
            .single();

        if (error) {
            console.error('Error cargando proyecto por slug:', error);
            mostrarError('Proyecto no encontrado');
            return;
        }

        proyectoActual.set(data);
    } catch (error) {
        console.error('Error en cargarProyectoPorSlug:', error);
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
            fecha_actualizacion: new Date().toISOString(),
            slug: generarSlugUnico(proyectoData.nombre || '') // Generar slug automáticamente
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

// ==================== FUNCIONES DE TAREAS MIXTAS ====================

// Cargar todas las tareas del usuario
export const cargarTareasUsuario = async (): Promise<void> => {
    try {
        cargandoTareas.set(true);
        
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            mostrarError('No hay usuario autenticado');
            return;
        }

        const { data, error } = await supabase
            .from('tareas')
            .select('*')
            .eq('usuario_id', user.id)
            .order('fecha_creacion', { ascending: false });

        if (error) {
            console.error('Error cargando tareas:', error);
            mostrarError('Error al cargar las tareas');
            return;
        }

        tareas.set(data || []);
    } catch (error) {
        console.error('Error en cargarTareasUsuario:', error);
        mostrarError('Error al cargar las tareas');
    } finally {
        cargandoTareas.set(false);
    }
};

// Cargar tareas de un proyecto específico
export const cargarTareasProyecto = async (proyectoId: string): Promise<void> => {
    try {
        cargandoTareas.set(true);
        
        const { data, error } = await supabase
            .from('tareas')
            .select('*')
            .eq('proyecto_id', proyectoId)
            .order('orden', { ascending: true });

        if (error) {
            console.error('Error cargando tareas del proyecto:', error);
            mostrarError('Error al cargar las tareas del proyecto');
            return;
        }

        tareas.set(data || []);
    } catch (error) {
        console.error('Error en cargarTareasProyecto:', error);
        mostrarError('Error al cargar las tareas del proyecto');
    } finally {
        cargandoTareas.set(false);
    }
};

// Cargar tareas de un negocio específico
export const cargarTareasNegocio = async (negocioId: string): Promise<void> => {
    try {
        cargandoTareas.set(true);
        
        const { data, error } = await supabase
            .from('tareas')
            .select('*')
            .eq('negocio_id', negocioId)
            .order('fecha_creacion', { ascending: false });

        if (error) {
            console.error('Error cargando tareas del negocio:', error);
            mostrarError('Error al cargar las tareas del negocio');
            return;
        }

        tareas.set(data || []);
    } catch (error) {
        console.error('Error en cargarTareasNegocio:', error);
        mostrarError('Error al cargar las tareas del negocio');
    } finally {
        cargandoTareas.set(false);
    }
};

// Crear nueva tarea (mixta: para proyecto o negocio)
export const crearTarea = async (tareaData: Partial<Tarea>): Promise<Tarea | null> => {
    try {
        console.log('🚀 Iniciando creación de tarea...', tareaData);
        
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            console.error('❌ No hay usuario autenticado');
            mostrarError('No hay usuario autenticado');
            return null;
        }
        
        console.log('✅ Usuario autenticado:', user.id);

        // Validar que tenga un contexto válido
        if (!tareaData.proyecto_id && !tareaData.negocio_id) {
            console.error('❌ Falta contexto (proyecto_id o negocio_id)');
            mostrarError('La tarea debe estar asociada a un proyecto o negocio');
            return null;
        }
        
        console.log('✅ Contexto válido:', {
            proyecto_id: tareaData.proyecto_id,
            negocio_id: tareaData.negocio_id
        });

        // Generar orden para la nueva tarea
        let orden = 1;
        if (tareaData.proyecto_id) {
            console.log('🔄 Calculando orden para proyecto...');
            // Para proyectos, obtener el siguiente orden en la columna
            const { data: tareasExistentes, error: errorOrden } = await supabase
                .from('tareas')
                .select('orden')
                .eq('proyecto_id', tareaData.proyecto_id)
                .eq('columna', tareaData.columna || tareaData.estado || 'por-hacer')
                .order('orden', { ascending: false })
                .limit(1);
            
            if (errorOrden) {
                console.error('❌ Error al obtener orden:', errorOrden);
            }
            
            if (tareasExistentes && tareasExistentes.length > 0) {
                orden = tareasExistentes[0].orden + 1;
            }
            console.log('✅ Orden calculado:', orden);
        } else if (tareaData.negocio_id) {
            console.log('🔄 Calculando orden para negocio...');
            // Para negocios, obtener el siguiente orden general
            const { data: tareasExistentes, error: errorOrden } = await supabase
                .from('tareas')
                .select('orden')
                .eq('negocio_id', tareaData.negocio_id)
                .order('orden', { ascending: false })
                .limit(1);
            
            if (errorOrden) {
                console.error('❌ Error al obtener orden:', errorOrden);
            }
            
            if (tareasExistentes && tareasExistentes.length > 0) {
                orden = tareasExistentes[0].orden + 1;
            }
            console.log('✅ Orden calculado:', orden);
        }

        // Limpiar datos antes de enviar
        const nuevaTarea = {
            usuario_id: user.id,
            proyecto_id: tareaData.proyecto_id || null,
            negocio_id: tareaData.negocio_id || null,
            titulo: tareaData.titulo?.trim() || '',
            descripcion: tareaData.descripcion?.trim() || null,
            estado: tareaData.estado || 'por-hacer',
            prioridad: tareaData.prioridad || 'media',
            fecha_limite: tareaData.fecha_limite || null,
            fecha_inicio: tareaData.fecha_inicio || null,
            tiempo_estimado_horas: tareaData.tiempo_estimado_horas && tareaData.tiempo_estimado_horas > 0 ? tareaData.tiempo_estimado_horas : null,
            etiquetas: tareaData.etiquetas && tareaData.etiquetas.length > 0 ? tareaData.etiquetas : null,
            fecha_creacion: new Date().toISOString(),
            fecha_actualizacion: new Date().toISOString(),
            orden,
            columna: tareaData.columna || tareaData.estado || 'por-hacer'
        };

        console.log('📝 Datos finales de la tarea:', nuevaTarea);

        const { data, error } = await supabase
            .from('tareas')
            .insert([nuevaTarea])
            .select()
            .single();

        if (error) {
            console.error('❌ Error de Supabase:', error);
            console.error('❌ Error detallado:', {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code
            });
            mostrarError(`Error al crear la tarea: ${error.message}`);
            return null;
        }

        console.log('✅ Tarea creada exitosamente:', data);

        // Actualizar store local
        tareas.update(lista => [data, ...lista]);
        
        mostrarExito('Tarea creada exitosamente');
        return data;
    } catch (error) {
        console.error('💥 Error general en crearTarea:', error);
        console.error('💥 Stack trace:', error instanceof Error ? error.stack : 'No stack available');
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

// Mover tarea en el Kanban - VERSIÓN SÚPER RÁPIDA Y EFECTIVA
export const moverTarea = async (
    tareaId: string, 
    nuevoEstado: EstadoTarea, 
    nuevoOrden: number
): Promise<boolean> => {
    console.log('🚀🚀🚀 MOVER TAREA - VERSIÓN SÚPER RÁPIDA');
    console.log('📋 Datos:', { tareaId, nuevoEstado, nuevoOrden });
    
    try {
        // 1. ACTUALIZAR INMEDIATAMENTE EN EL STORE (optimistic update)
        let tareaAnterior: Tarea | null = null;
        
        tareas.update(lista => {
            return lista.map(tarea => {
                if (tarea.id === tareaId) {
                    tareaAnterior = { ...tarea }; // Backup para rollback
                    console.log(`⚡ ACTUALIZACIÓN INMEDIATA: "${tarea.titulo}" → ${nuevoEstado}`);
                    return {
                        ...tarea,
                        estado: nuevoEstado,
                        columna: nuevoEstado,
                        orden: nuevoOrden,
                        fecha_actualizacion: new Date().toISOString(),
                        ...(nuevoEstado === 'completada' && { fecha_completado: new Date().toISOString() })
                    };
                }
                return tarea;
            });
        });

        // 2. CONFIRMAR EN BASE DE DATOS EN BACKGROUND
        const updates = {
            estado: nuevoEstado,
            columna: nuevoEstado,
            orden: nuevoOrden,
            fecha_actualizacion: new Date().toISOString(),
            ...(nuevoEstado === 'completada' && { fecha_completado: new Date().toISOString() })
        };

        console.log('💾 Confirmando en Supabase...');
        const { error } = await supabase
            .from('tareas')
            .update(updates)
            .eq('id', tareaId);

        if (error) {
            console.error('❌ ERROR EN SUPABASE:', error);
            
            // ROLLBACK - Restaurar estado anterior
            if (tareaAnterior) {
                console.log('🔄 ROLLBACK activado');
                tareas.update(lista => {
                    return lista.map(tarea => 
                        tarea.id === tareaId ? tareaAnterior! : tarea
                    );
                });
            }
            
            mostrarError(`Error: ${error.message}`);
            return false;
        }

        console.log('✅ TAREA MOVIDA EXITOSAMENTE - UI YA ACTUALIZADA');
        mostrarExito(`Tarea movida a ${nuevoEstado}`);
        return true;
        
    } catch (error) {
        console.error('💥 ERROR CRÍTICO:', error);
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