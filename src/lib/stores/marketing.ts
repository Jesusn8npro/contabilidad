import { writable } from 'svelte/store';
import { supabase } from '$lib/supabase/cliente';
import { user } from './auth';
import { get } from 'svelte/store';

// Tipos
export interface Campaña {
    id: string;
    negocio_id: string;
    usuario_id: string;
    nombre: string;
    descripcion?: string;
    tipo_campana: string;
    plataforma?: string;
    objetivo: string;
    presupuesto_total: number;
    gastado_actual?: number;
    presupuesto_diario?: number;
    fecha_inicio: string;
    fecha_fin?: string;
    estado: string;
    fecha_creacion: string;
    fecha_actualizacion?: string;
    // Campos de métricas opcionales
    impresiones?: number;
    clics?: number;
    conversiones?: number;
    alcance?: number;
    interacciones?: number;
    ctr?: number;
    conversion_rate?: number;
    roas?: number;
}

// Stores
export const campañas = writable<Campaña[]>([]);
export const cargandoCampañas = writable(false);

// Cargar campañas
export const cargarCampañas = async (negocioId?: string) => {
    console.log('🚀 Cargando campañas desde Supabase...');
    cargandoCampañas.set(true);
    
    try {
        const currentUser = get(user);
        if (!currentUser) {
            throw new Error('Usuario no autenticado');
        }

        let query = supabase
            .from('campanas_marketing')
            .select('*')
            .eq('usuario_id', currentUser.id)
            .order('fecha_creacion', { ascending: false });

        if (negocioId) {
            query = query.eq('negocio_id', negocioId);
        }

        const { data, error } = await query;

        if (error) {
            console.error('❌ Error cargando campañas:', error);
            throw error;
        }

        console.log('✅ Campañas cargadas:', data);
        campañas.set(data || []);
        
    } catch (error) {
        console.error('❌ Error en cargarCampañas:', error);
        campañas.set([]);
        throw error;
    } finally {
        cargandoCampañas.set(false);
    }
};

// Crear campaña
export const crearCampaña = async (nuevaCampaña: any) => {
    console.log('🚀 STORE: Iniciando crearCampaña');
    console.log('📦 STORE: Datos recibidos:', JSON.stringify(nuevaCampaña, null, 2));
    cargandoCampañas.set(true);
    
    try {
        console.log('👤 STORE: Obteniendo usuario actual...');
        const currentUser = get(user);
        console.log('👤 STORE: Usuario obtenido:', currentUser ? 'OK' : 'NULL');
        if (!currentUser) {
            console.log('❌ STORE: Usuario no autenticado');
            throw new Error('Usuario no autenticado');
        }
        console.log('✅ STORE: Usuario válido:', currentUser.id);

        // Limpiar y validar datos antes de insertar - SIN CAMPO ID
        console.log('🧹 STORE: Limpiando datos...');
        
        // Validar campos obligatorios
        if (!nuevaCampaña.negocio_id) {
            console.log('❌ STORE: negocio_id faltante');
            throw new Error('negocio_id es obligatorio');
        }
        
        if (!nuevaCampaña.nombre || !nuevaCampaña.nombre.trim()) {
            console.log('❌ STORE: nombre faltante');
            throw new Error('nombre es obligatorio');
        }
        
        if (!nuevaCampaña.fecha_inicio) {
            console.log('❌ STORE: fecha_inicio faltante');
            throw new Error('fecha_inicio es obligatorio');
        }
        
        const campañaCompleta = {
            // Campos obligatorios
            negocio_id: nuevaCampaña.negocio_id,
            usuario_id: currentUser.id,
            nombre: nuevaCampaña.nombre.trim(),
            tipo_campana: nuevaCampaña.tipo_campana || 'google_ads',
            plataforma: nuevaCampaña.plataforma || 'google-ads', // CAMPO OBLIGATORIO AGREGADO
            objetivo: nuevaCampaña.objetivo || 'conversiones',
            presupuesto_total: Number(nuevaCampaña.presupuesto_total) || 1000,
            fecha_inicio: nuevaCampaña.fecha_inicio,
            estado: nuevaCampaña.estado || 'borrador',
            fecha_creacion: new Date().toISOString(),
            // Campos opcionales (solo si existen)
            ...(nuevaCampaña.descripcion && nuevaCampaña.descripcion.trim() && { 
                descripcion: nuevaCampaña.descripcion.trim() 
            }),
            ...(nuevaCampaña.fecha_fin && { fecha_fin: nuevaCampaña.fecha_fin })
        };
        
        console.log('✅ STORE: Datos limpiados correctamente');

        console.log('📝 STORE: Datos finales a insertar:', JSON.stringify(campañaCompleta, null, 2));
        console.log('💾 STORE: Iniciando inserción en Supabase...');

        const { data, error } = await supabase
            .from('campanas_marketing')
            .insert([campañaCompleta])
            .select()
            .single();

        console.log('📊 STORE: Respuesta de Supabase - data:', data);
        console.log('📊 STORE: Respuesta de Supabase - error:', error);

        if (error) {
            console.error('❌ STORE: Error insertando campaña:', error);
            console.error('❌ STORE: Error detalles:', JSON.stringify(error, null, 2));
            throw error;
        }

        console.log('✅ Campaña creada:', data);

        // Actualizar el store local
        campañas.update(list => [...list, data]);
        
        return data;
    } catch (error) {
        console.error('❌ Error en crearCampaña:', error);
        throw error;
    } finally {
        cargandoCampañas.set(false);
    }
};

// Actualizar campaña
export const actualizarCampaña = async (id: string, datosActualizados: Partial<Campaña>) => {
    console.log('🚀 Actualizando campaña:', id, datosActualizados);
    cargandoCampañas.set(true);
    
    try {
        const { data, error } = await supabase
            .from('campanas_marketing')
            .update({
                ...datosActualizados,
                fecha_actualizacion: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('❌ Error actualizando campaña:', error);
            throw error;
        }

        console.log('✅ Campaña actualizada:', data);

        // Actualizar el store local
        campañas.update(list => 
            list.map(campaña => campaña.id === id ? data : campaña)
        );
        
        return data;
    } catch (error) {
        console.error('❌ Error en actualizarCampaña:', error);
        throw error;
    } finally {
        cargandoCampañas.set(false);
    }
};

// Eliminar campaña
export const eliminarCampaña = async (id: string) => {
    console.log('🚀 Eliminando campaña:', id);
    cargandoCampañas.set(true);
    
    try {
        const { error } = await supabase
            .from('campanas_marketing')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('❌ Error eliminando campaña:', error);
            throw error;
        }

        console.log('✅ Campaña eliminada');

        // Actualizar el store local
        campañas.update(list => list.filter(campaña => campaña.id !== id));
        
    } catch (error) {
        console.error('❌ Error en eliminarCampaña:', error);
        throw error;
    } finally {
        cargandoCampañas.set(false);
    }
}; 